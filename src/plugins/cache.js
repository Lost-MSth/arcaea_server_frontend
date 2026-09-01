import { shallowReactive } from 'vue'

import { resolveApiBase } from '@/config'

// ---- TTL policy -----------------------------------------------------------
// Per-resource lifetimes (first matching pattern wins). Mutations made in
// this console update rows locally and invalidate the affected prefix, so
// long lifetimes are safe for the admin's own edits; the cache page lets you
// see and refresh everything else. `persist` entries survive a reload via
// localStorage — only used for small, static data.
export const POLICIES = [
  { id: 'constants', test: /^\/system\/constants/, ttl: 24 * 3600e3, persist: true },
  { id: 'song_rank', test: /^\/songs\/[^/]+\/\d+\/rank/, ttl: 5 * 60e3 },
  { id: 'songs', test: /^\/songs/, ttl: 60 * 60e3 },
  { id: 'user_brief', test: /^\/users\/\d+\/brief/, ttl: 10 * 60e3 },
  { id: 'user_rating', test: /^\/users\/\d+\/rating/, ttl: 30 * 60e3 },
  { id: 'user_scores', test: /^\/users\/\d+\/(b30|r30|best)/, ttl: 5 * 60e3 },
  { id: 'users', test: /^\/users/, ttl: 5 * 60e3 },
  { id: 'characters', test: /^\/characters/, ttl: 60 * 60e3 },
  { id: 'items', test: /^\/items/, ttl: 10 * 60e3 },
  { id: 'purchases', test: /^\/purchases/, ttl: 10 * 60e3 },
  { id: 'presents', test: /^\/presents/, ttl: 10 * 60e3 },
  { id: 'redeems', test: /^\/redeems/, ttl: 10 * 60e3 },
  { id: 'rooms', test: /^\/multiplay/, ttl: 30e3 },
]
const DEFAULT_POLICY = { id: 'other', ttl: 60e3 }
export const policyFor = (url) => POLICIES.find((p) => p.test.test(url)) || DEFAULT_POLICY

// ---- registry -------------------------------------------------------------
// key -> entry. Entries are shallow-reactive so the cache page can render
// live hit counts / ages; the Map itself is shallow-reactive for add/remove.
export const registry = shallowReactive(new Map())

const sizeOf = (d) => ({
  rows: Array.isArray(d) ? d.length : null,
  bytes: (() => {
    try {
      return JSON.stringify(d ?? null).length
    } catch (e) {
      return 0
    }
  })(),
})

const makeEntry = (key, url, data, policy, ttl) =>
  shallowReactive({
    key,
    url,
    data,
    policy: policy.id,
    persist: !!policy.persist,
    ttl,
    time: Date.now(),
    hits: 0,
    status: 'pending', // pending | ok
    restored: false,
    rows: null,
    bytes: 0,
    promise: null,
    refetch: null,
  })

// ---- persistence (persist policies only) ----------------------------------
const STORE_PREFIX = 'cache:'
const storeKey = (key) => STORE_PREFIX + resolveApiBase() + '|' + key

function persistEntry(key, res, time) {
  try {
    localStorage.setItem(storeKey(key), JSON.stringify({ time, body: res }))
  } catch (e) {
    /* quota / unavailable — memory cache still works */
  }
}

function restoreEntry(key, url, data, policy, ttl) {
  try {
    const raw = localStorage.getItem(storeKey(key))
    if (!raw) return null
    const { time, body } = JSON.parse(raw)
    if (!body || Date.now() - time >= ttl) {
      localStorage.removeItem(storeKey(key))
      return null
    }
    const e = makeEntry(key, url, data, policy, ttl)
    e.time = time
    e.status = 'ok'
    e.restored = true
    Object.assign(e, sizeOf(body.data))
    e.promise = Promise.resolve(body)
    registry.set(key, e)
    return e
  } catch (e) {
    return null
  }
}

// ---- API ------------------------------------------------------------------
export function cachedGet(service, url, data = null, { ttl, force = false, ...config } = {}) {
  const policy = policyFor(url)
  const effTtl = ttl ?? policy.ttl
  const key = url + '|' + (data ? JSON.stringify(data) : '')
  let entry = registry.get(key)
  if (!entry && policy.persist) entry = restoreEntry(key, url, data, policy, effTtl)
  if (!force && entry && Date.now() - entry.time < effTtl) {
    entry.hits++
    return entry.promise
  }
  const e = makeEntry(key, url, data, policy, effTtl)
  e.refetch = () => cachedGet(service, url, data, { ttl, force: true, ...config })
  e.promise = (data ? service._get(url, data, config) : service.get(url, config)).then(
    (res) => {
      e.status = 'ok'
      e.time = Date.now()
      Object.assign(e, sizeOf(res && res.data))
      if (policy.persist) persistEntry(key, res, e.time)
      return res
    },
    (err) => {
      // Failures are never cached.
      if (registry.get(key) === e) registry.delete(key)
      throw err
    },
  )
  registry.set(key, e)
  return e.promise
}

export function invalidate(prefix = '') {
  for (const k of [...registry.keys()]) {
    if (k.startsWith(prefix)) registry.delete(k)
  }
}

export function refresh(key) {
  const e = registry.get(key)
  return e && e.refetch ? e.refetch().catch(() => null) : Promise.resolve(null)
}

export function clearAll({ persisted = false } = {}) {
  registry.clear()
  if (persisted) {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORE_PREFIX))
        .forEach((k) => localStorage.removeItem(k))
    } catch (e) {
      /* ignore */
    }
  }
}
