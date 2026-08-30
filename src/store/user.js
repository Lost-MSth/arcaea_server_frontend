import { defineStore } from 'pinia'

import router from '@/router'
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
    routes_generated: false,
  }),
  // pinia-plugin-persistedstate v4: `paths` was renamed to `pick`.
  persist: {
    pick: ['token', 'role', 'powers', 'user_id', 'user_code'],
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
    generate_routes() {
      if (this.routes_generated) return
      this.accessed_routes.forEach((route) => {
        router.addRoute('layout', route)
      })
      this.routes_generated = true
    },
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
