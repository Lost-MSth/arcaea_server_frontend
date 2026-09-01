import axios from 'axios'
import { Base64 } from 'js-base64'

import { resolveApiBase } from '@/config'
import { cachedGet, clearAll as clearCache, invalidate as invalidateCache } from '@/plugins/cache'
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
// Policy, registry and persistence live in plugins/cache.js (the cache page
// renders that registry). `force: true` bypasses and replaces the entry.
service.cachedGet = (url, data = null, opts = {}) => cachedGet(service, url, data, opts)
service.invalidateCache = invalidateCache

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
      if (status === 401) {
        userStore().$reset()
        clearCache()
      }
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
