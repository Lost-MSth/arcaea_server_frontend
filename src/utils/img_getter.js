import { resolveApiBase } from '@/config'

// ---- Assets base resolution ----------------------------------------------
// Images are ALWAYS optional — every consumer renders a placeholder when a
// file is missing or images are disabled. Resolution priority:
//   1. localStorage `assets_base`  — user-set (login page 高级 / manual);
//      the special value 'off' disables all image requests.
//   2. window.__ARCAEA_ASSETS__    — operator-injected in index.html
//      (e.g. a CDN, or images hosted next to a static-Pages frontend).
//   3. Derived from the API base   — images live on the API server under
//      /static (Flask's built-in static route, zero server code):
//      same-origin -> '/static'; remote backend -> 'https://host/static'.
export function resolveAssetsBase() {
  let v = null
  try {
    v = localStorage.getItem('assets_base')
  } catch (e) {
    /* localStorage may be unavailable */
  }
  if (!v && typeof window !== 'undefined' && window.__ARCAEA_ASSETS__) {
    v = window.__ARCAEA_ASSETS__
  }
  if (v) {
    if (v === 'off') return null
    return v.replace(/\/+$/, '')
  }
  const base = resolveApiBase()
  if (/^https?:\/\//i.test(base)) {
    try {
      return new URL(base).origin + '/static'
    } catch (e) {
      /* fall through */
    }
  }
  return '/static'
}

export function getStoredAssetsBase() {
  try {
    return localStorage.getItem('assets_base') || ''
  } catch (e) {
    return ''
  }
}

export function setStoredAssetsBase(v) {
  try {
    if (v) localStorage.setItem('assets_base', v)
    else localStorage.removeItem('assets_base')
  } catch (e) {
    /* ignore */
  }
}

// ---- Session-scoped failure memory ---------------------------------------
// A URL that 404'd once isn't requested again this session; consumers render
// their placeholder instead. Keeps missing asset trees at ~zero request cost.
const failedUrls = new Set()
export const imgFailed = (url) => failedUrls.has(url)
export const markImgFailed = (url) => failedUrls.add(url)

// ---- URL builders ---------------------------------------------------------
// Each returns a CANDIDATE LIST (first that loads wins, [] = don't try):
// jackets fall back 1080 -> non-1080, uncapped icons fall back to the base
// icon, so partial asset dumps still show whatever they contain.

export const get_char_icon = (char_id, is_uncapped = false, is_uncapped_override = false) => {
  const base = resolveAssetsBase()
  if (base === null || char_id === null || char_id === undefined || char_id < 0) return []
  const uncapped = is_uncapped && !is_uncapped_override
  const urls = [`${base}/char/${char_id}${uncapped ? 'u' : ''}_icon.png`]
  if (uncapped) urls.push(`${base}/char/${char_id}_icon.png`)
  return urls
}

// NOTE: folder name must equal the DB song_id — game asset dumps prefix
// downloadable songs with `dl_`, which must be stripped when placing files.
export const get_song_img = (song_id, is_256 = true) => {
  const base = resolveAssetsBase()
  if (base === null || !song_id) return []
  const file = is_256 ? 'base_256.jpg' : 'base.jpg'
  return [`${base}/songs/${song_id}/1080_${file}`, `${base}/songs/${song_id}/${file}`]
}
