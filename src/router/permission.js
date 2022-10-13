export const async_routes = [{
    path: '/system',
    name: 'system',
    meta: { powers: ['system'], icon: 'mdi-cog' },
    component: () => import('../views/home.vue'),
    children: [{
        path: '/system/dashboard',
        name: 'test',
        component: () => import('../views/dashboard'),
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