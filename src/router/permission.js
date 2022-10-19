export const async_routes = [{
    path: '/user',
    name: 'user',
    meta: { icon: 'mdi-account' },
    component: () => import('../views/home.vue'),
    children: [{
        path: '/user/profile',
        name: 'profile',
        component: () => import('../views/user/profile.vue'),
        meta: { powers: ['select_me'] }
    }, {
        path: '/user/user_info',
        name: 'user_info',
        component: () => import('../views/user/user_info.vue'),
        meta: { powers: ['select'] }
    }]
}, {
    path: '/system',
    name: 'system',
    meta: { powers: ['system'], icon: 'mdi-cog' },
    component: () => import('../views/home.vue'),
    children: [{
        path: '/system/dashboard',
        name: 'test',
        component: () => import('../views/home'),
        meta: { powers: ['system'] }
    }]
},
{
    path: '/game',
    name: 'game',
    component: () => import('../views/home.vue'),
    meta: { powers: ['system'] }
}
]