import {
  createRouter,
  createWebHashHistory
} from 'vue-router'
import {
  userStore
} from '../store/user'

const routes = [{
  path: '/',
  name: 'home',
  component: () => import('../views/home.vue'),
  children: [{
    path: '',
    component: () => import('../views/about.vue'),
  }]
},
{
  path: '/login',
  name: 'login',
  component: () => import('../views/login')
}
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async to => {
  if (to.matched.length === 0) return {
    name: 'home'
  }
  const user = userStore()
  if (!user.token) {
    if (to.name === 'login') {
      return true
    } else {
      return {
        name: 'login'
      }
    }
  } else {
    if (!user.name) {
      await user.get_user_info()
    }
    if (!user.role) {
      await user.get_user_role()
    }
    user.generate_routes()
    if (to.name === 'login') {
      return {
        name: 'home'
      }
    } else {
      return true
    }

  }

})

export default router