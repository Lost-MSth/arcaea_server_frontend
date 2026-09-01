import { defineStore } from 'pinia'

import { async_routes } from '@/router/permission.js'
import { fetchUserScores } from '@/composables/useUserScores'
import axios from '@/plugins/axios'
import { clearAll as clearCache } from '@/plugins/cache'

const has_permission = (powers, route, hasUser) => {
  if (route.meta && route.meta.needsUser && !hasUser) return false
  if (route.meta && route.meta.powers) {
    return powers.some((power) => route.meta.powers.includes(power))
  }
  return true
}

const filter_routes = (routes, powers, hasUser) => {
  const res = []
  routes.forEach((route) => {
    const r = { ...route }
    if (has_permission(powers, r, hasUser)) {
      if (r.children) {
        r.children = filter_routes(r.children, powers, hasUser)
      }
      res.push(r)
    }
  })
  return res
}

// Every power the server defines — what `API_TOKEN` (role `system`) gets.
export const ALL_POWERS = [
  'system',
  'select',
  'change',
  'grant',
  'grant_inf',
  'select_me',
  'change_me',
  'select_song_info',
  'select_song_rank',
  'select_song_rank_top',
  'public',
]

export const userStore = defineStore('user', {
  state: () => ({
    token: null,
    role: null,
    powers: [],
    user_id: null,
    user_code: null,
    name: null,
    rating_ptt: null,
    is_hide_rating: false,
    join_date: null,
    ticket: null,
    character: {
      character_id: null,
      is_uncapped: false,
      is_uncapped_override: false,
    },
    best_scores: [],
    b50_ptt: null,
    b30_ptt: null,
    b10_ptt: null,
    r10_ptt: null,
    last_played: null,
    // Manual profile refresh cooldown (not persisted; survives navigation).
    scores_refreshed_at: 0,
    // Signed in with the server's master API_TOKEN (no player behind it).
    api_token_session: false,
  }),
  // pinia-plugin-persistedstate v4: `paths` was renamed to `pick`.
  // Profile basics are persisted too, so a page reload doesn't re-hit the
  // heavy `/users/<id>` endpoint — it's refreshed on login and on the
  // profile page instead.
  persist: {
    pick: [
      'token',
      'role',
      'powers',
      'user_id',
      'user_code',
      'name',
      'rating_ptt',
      'ticket',
      'join_date',
      'character',
      'api_token_session',
    ],
  },
  getters: {
    accessed_routes() {
      return filter_routes(async_routes, this.powers, !!this.user_id)
    },
    is_admin() {
      return this.powers.includes('change') || this.powers.includes('system')
    },
  },
  actions: {
    has_power(power) {
      return this.powers.includes(power)
    },
    // The server treats `Token: <API_TOKEN>` as user_id 0 with role `system`
    // and skips power checks entirely; there is no player profile behind it.
    async login_with_api_token(token) {
      this.token = token
      try {
        await axios.get('/token') // 401 if the token isn't accepted
      } catch (e) {
        this.$reset()
        throw e
      }
      this.user_id = 0
      this.name = 'API Token'
      this.role = 'system'
      this.powers = [...ALL_POWERS]
      this.api_token_session = true
    },
    async get_user_info(force = false) {
      // Prefer the lightweight `/users/<id>/brief` (single-row query);
      // older servers without it fall back to the full `/users/<id>` payload.
      try {
        const res = await axios.cachedGet('/users/' + this.user_id + '/brief', null, {
          silent: true,
          force,
        })
        const d = res.data
        this.user_code = d.user_code
        this.name = d.name
        this.rating_ptt = d.rating_ptt ?? d.rating
        this.is_hide_rating = d.is_hide_rating
        this.ticket = d.ticket
        this.join_date = d.join_date
        this.character.character_id = d.character_id ?? d.character
        this.character.is_uncapped = d.is_char_uncapped
        this.character.is_uncapped_override = d.is_char_uncapped_override
        return
      } catch (e) {
        if (!this.token) throw e // 401 already reset the session — don't retry
      }
      const res = await axios.get('/users/' + this.user_id)
      const d = res.data
      this.user_code = d.user_code
      this.name = d.name
      this.rating_ptt = d.rating
      this.is_hide_rating = d.is_hide_rating
      this.ticket = d.ticket
      this.join_date = d.join_date
      this.character.character_id = d.character
      const stats = d.character_stats || []
      const cur = stats.find((c) => c.character_id === this.character.character_id)
      if (cur) {
        this.character.is_uncapped = cur.is_uncapped
        this.character.is_uncapped_override = cur.is_uncapped_override
      }
    },
    async get_user_role() {
      const res = await axios.get('/users/' + this.user_id + '/role')
      this.role = res.data.role
      this.powers = res.data.powers
    },
    // Route registration lives in the router guard (router/index.js), which
    // owns the real router instance — the store must not import the router
    // back (circular dependency, and a stale instance under dev HMR).
    // Best 50 + the four PTT components (B50 / B30 / B10 / R10).
    async get_user_scores(force = false) {
      const r = await fetchUserScores(this.user_id, {
        silent: true,
        force,
        songMeta: this.has_power('select') || this.has_power('select_song_info'),
      })
      this.best_scores = r.scores
      this.b50_ptt = r.b50
      this.b30_ptt = r.b30
      this.b10_ptt = r.b10
      this.r10_ptt = r.r10
      this.last_played = r.lastPlayed
    },
    logout() {
      this.$reset()
      clearCache()
    },
  },
})
