export const async_routes = [{
    path: '/user',
    name: 'user',
    meta: { icon: 'mdi-account' },
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
    path: '/song',
    name: 'song',
    meta: { icon: 'mdi-music' },
    children: [{
        path: '/song/song_info',
        name: 'song_info',
        component: () => import('../views/song/song_info.vue'),
        meta: { powers: ['select'] }
    }, {
        path: '/song/song_search',
        name: 'song_search',
        component: () => import('../views/song/song_search.vue'),
        meta: { powers: ['select', 'select_song_info'] }
    }
    ]
}, {
    path: '/system',
    name: 'system',
    meta: { powers: ['system'], icon: 'mdi-cog' },
    children: [{
        path: '/system/dashboard',
        name: 'test',
        component: () => import('../views/home'),
        meta: { powers: ['system'] }
    }]
}
]