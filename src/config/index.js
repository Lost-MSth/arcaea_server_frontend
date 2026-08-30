// ---- API base resolution -------------------------------------------------
// Priority: user-set (localStorage) -> operator-injected window global ->
// same-origin default. This is what lets one build serve both the
// bundled-in-server case (default /api/v1) and the static-Pages case
// (user points it at a remote backend).
export function resolveApiBase() {
  try {
    const v = localStorage.getItem('api_base')
    if (v) return v
  } catch (e) {
    /* localStorage may be unavailable */
  }
  if (typeof window !== 'undefined' && window.__ARCAEA_API__) {
    return window.__ARCAEA_API__
  }
  return '/api/v1'
}

export function getStoredApiBase() {
  try {
    return localStorage.getItem('api_base') || ''
  } catch (e) {
    return ''
  }
}

export function setStoredApiBase(v) {
  try {
    if (v) localStorage.setItem('api_base', v)
    else localStorage.removeItem('api_base')
  } catch (e) {
    /* ignore */
  }
}

// ---- Domain constants ----------------------------------------------------
export const difficulty_short_name = ['PST', 'PRS', 'FTR', 'BYD', 'ETR']

export const clear_type_name = [
  'Track Lost',
  'Normal Clear',
  'Full Recall',
  'Pure Memory',
  'Easy Clear',
  'Hard Clear',
]

// Types accepted by POST /items (server ALLOW_ITEM_TYPE).
export const item_types = ['pack', 'single', 'world_song', 'character']

// Every type the server's ItemFactory knows — used for collection items
// (purchases / presents / redeems).
export const collection_item_types = [
  'pack',
  'single',
  'world_song',
  'world_unlock',
  'character',
  'core',
  'memory',
  'fragment',
  'anni5tix',
  'pick_ticket',
  'prog_boost_300',
  'stamina6',
  'course_banner',
]
