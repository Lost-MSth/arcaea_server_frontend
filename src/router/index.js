import { createRouter, createWebHashHistory } from 'vue-router'

import { userStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/',
    name: 'layout',
    component: () => import('@/layouts/AppLayout.vue'),
    // Home depends on role: the dashboard is an admin view (needs `select`);
    // players land on their profile.
    redirect: () => homeRoute(),
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { title: 'dashboard', icon: 'grid', group: 'top' },
      },
    ],
  },
]

const homeRoute = () => ({ path: userStore().has_power('select') ? '/dashboard' : '/user/profile' })

const router = createRouter({
  // Hash history keeps static hosting trivial: one index.html, no rewrite rules.
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const user = userStore()

  if (!user.token) {
    if (to.name === 'login') return true
    // Remember where the user was headed so login can send them back.
    return {
      name: 'login',
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : undefined,
    }
  }

  try {
    if (!user.name) await user.get_user_info()
    if (!user.role) await user.get_user_role()
  } catch (e) {
    /* API errors surface via the interceptor */
  }

  // A 401 during the calls above clears the store; go to login instead of a
  // half-authenticated dashboard.
  if (!user.token) return { name: 'login' }

  // Register permission-gated routes idempotently on every navigation —
  // this guard owns the real router instance.
  user.accessed_routes.forEach((route) => {
    if (!router.hasRoute(route.name)) {
      router.addRoute('layout', route)
    }
  })

  if (to.name === 'login') return homeRoute()
  if (to.name === 'dashboard' && !user.has_power('select')) return homeRoute()

  // A deep-linked dynamic route isn't matched until generate_routes() ran, so
  // re-resolve it now; fall back to the dashboard if it truly doesn't exist.
  if (to.matched.length === 0) {
    const resolved = router.resolve(to.fullPath)
    return resolved.matched.length ? resolved.fullPath : homeRoute()
  }

  return true
})

// After a redeploy, stale clients may fail to lazy-load renamed (hashed)
// chunks. Reload once to pick up the new build instead of a broken page.
let reloadedForChunkError = false
router.onError((err) => {
  if (reloadedForChunkError) return
  const msg = String((err && err.message) || err)
  if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(msg)) {
    reloadedForChunkError = true
    location.reload()
  }
})

export default router
