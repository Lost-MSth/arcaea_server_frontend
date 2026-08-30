import axios from 'axios'
import { Base64 } from 'js-base64'

import { resolveApiBase } from '@/config'
import i18n from '@/i18n'
import { message } from '@/plugins/discrete'
import { userStore } from '@/store/user'

const { t } = i18n.global

const service = axios.create({
  baseURL: resolveApiBase(),
  timeout: 50000,
  // Auth is via the `Token` header, not cookies, so we keep credentials off —
  // this keeps cross-origin (static-Pages) deployments CORS-simple.
  withCredentials: false,
})
service.defaults.headers['Content-Type'] = 'application/json; charset=utf-8'

// Re-read the API base after the user changes the server address in the UI.
export function applyApiBase() {
  service.defaults.baseURL = resolveApiBase()
}

// The server accepts GET query bodies as a base64 `query` param (axios can't
// send a GET body). Mirrors the original `_get` helper.
service._get = (url, data, config = {}) =>
  service.get(url, {
    params: { query: Base64.encode(JSON.stringify(data)) },
    ...config,
  })

// ---- TTL cache for GETs -------------------------------------------------
// Keeps repeat page visits from re-hitting the server: identical requests
// within `ttl` share one response, and concurrent callers share one in-flight
// promise. `force: true` (manual refresh / after mutations) bypasses and
// replaces the entry. Failures are never cached.
const _getCache = new Map()

service.cachedGet = (url, data = null, { ttl = 60000, force = false, ...config } = {}) => {
  const key = url + '|' + (data ? JSON.stringify(data) : '')
  const hit = _getCache.get(key)
  if (!force && hit && Date.now() - hit.time < ttl) {
    return hit.promise
  }
  const promise = (data ? service._get(url, data, config) : service.get(url, config)).catch(
    (e) => {
      _getCache.delete(key)
      throw e
    },
  )
  _getCache.set(key, { time: Date.now(), promise })
  return promise
}

service.invalidateCache = (prefix = '') => {
  for (const k of _getCache.keys()) {
    if (k.startsWith(prefix)) _getCache.delete(k)
  }
}

function codeMessage(code) {
  const key = 'error.' + Math.abs(code)
  const msg = t(key)
  return msg === key ? t('error.unknown') : msg
}

function statusMessage(status) {
  const key = 'error.status.' + status
  const msg = t(key)
  return msg === key ? t('error.unknown') : msg
}

service.interceptors.request.use((config) => {
  const user = userStore()
  if (user.token) {
    config.headers['Token'] = user.token
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const silent = response.config && response.config.silent
    const res = response.data
    if (res && res.code < 0) {
      if (!silent) message.error(res.code === -1 ? statusMessage(response.status) : codeMessage(res.code))
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    const silent = error.config && error.config.silent
    if (error.response) {
      const status = error.response.status
      const res = error.response.data || {}
      // A 401 always clears the session, even for silent calls.
      if (status === 401) userStore().$reset()
      if (!silent) {
        if (res.code === undefined || res.code === -1) {
          message.error(statusMessage(status))
        } else if (res.code < -1) {
          message.error(codeMessage(res.code))
        } else {
          message.error(res.msg || t('error.unknown'))
        }
      }
      return Promise.reject(res)
    }
    if (!silent) {
      message.error(error.message && error.message.includes('timeout') ? t('error.timeout') : t('error.network'))
    }
    return Promise.reject(error)
  },
)

export default service
