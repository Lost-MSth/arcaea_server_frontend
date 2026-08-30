import { defineStore } from 'pinia'

import { async_routes } from '@/router/permission.js'
import axios from '@/plugins/axios'

const has_permission = (powers, route) => {
  if (route.meta && route.meta.powers) {
    return powers.some((power) => route.meta.powers.includes(power))
  }
  return true
}

const filter_routes = (routes, powers) => {
  const res = []
  routes.forEach((route) => {
    const r = { ...route }
    if (has_permission(powers, r)) {
      if (r.children) {
        r.children = filter_routes(r.children, powers)
      }
      res.push(r)
    }
  })
  return res
}

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
    b30_ptt: null,
    r10_ptt: null,
    b30_scores: [],
    r30_scores: [],
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
    ],
  },
  getters: {
    accessed_routes() {
      return filter_routes(async_routes, this.powers)
    },
    is_admin() {
      return this.powers.includes('change') || this.powers.includes('system')
    },
  },
  actions: {
    has_power(power) {
      return this.powers.includes(power)
    },
    async get_user_info() {
      // Prefer the lightweight `/users/<id>/brief` (single-row query, see
      // SERVER_CHANGES.md §4.2); older servers without it fall back to the
      // full `/users/<id>` payload.
      try {
        const res = await axios.get('/users/' + this.user_id + '/brief', { silent: true })
        const d = res.data
        this.user_code = d.user_code
        this.name = d.name
        this.rating_ptt = d.rating
        this.is_hide_rating = d.is_hide_rating
        this.ticket = d.ticket
        this.join_date = d.join_date
        this.character.character_id = d.character
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
    async get_user_b30() {
      const res = await axios.get('/users/' + this.user_id + '/b30')
      this.b30_ptt = res.data.b30_ptt
      this.b30_scores = res.data.data
    },
    async get_user_recent() {
      const res = await axios.get('/users/' + this.user_id + '/r30')
      this.r10_ptt = res.data.r10_ptt
      this.r30_scores = res.data.data
    },
    logout() {
      this.$reset()
    },
  },
})
