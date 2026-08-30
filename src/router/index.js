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
    redirect: '/dashboard',
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

const router = createRouter({
  // Hash history keeps static hosting trivial: one index.html, no rewrite rules.
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const user = userStore()

  if (!user.token) {
    return to.name === 'login' ? true : { name: 'login' }
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

  user.generate_routes()

  if (to.name === 'login') return { name: 'dashboard' }

  // A deep-linked dynamic route isn't matched until generate_routes() ran, so
  // re-resolve it now; fall back to the dashboard if it truly doesn't exist.
  if (to.matched.length === 0) {
    const resolved = router.resolve(to.fullPath)
    return resolved.matched.length ? resolved.fullPath : { name: 'dashboard' }
  }

  return true
})

export default router
