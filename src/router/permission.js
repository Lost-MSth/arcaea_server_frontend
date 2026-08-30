// Permission-gated routes, added dynamically per the user's powers.
// `meta.group` drives the sidebar sections; `meta.icon` maps to an icon in
// the layout; `meta.title` is an i18n key under `route.*`.
export const async_routes = [
  {
    path: '/user/profile',
    name: 'profile',
    component: () => import('@/views/user/profile.vue'),
    meta: { title: 'profile', icon: 'person', group: 'player', powers: ['select_me'] },
  },
  {
    path: '/user/users',
    name: 'users',
    component: () => import('@/views/user/users.vue'),
    meta: { title: 'users', icon: 'people', group: 'player', powers: ['select'] },
  },
  {
    path: '/song/search',
    name: 'song_search',
    component: () => import('@/views/song/song_search.vue'),
    meta: { title: 'song_search', icon: 'search', group: 'content', powers: ['select', 'select_song_info'] },
  },
  {
    path: '/song/manage',
    name: 'song_manage',
    component: () => import('@/views/song/song_manage.vue'),
    meta: { title: 'song_manage', icon: 'music', group: 'content', powers: ['select', 'select_song_info'] },
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('@/views/manage/characters.vue'),
    meta: { title: 'characters', icon: 'character', group: 'content', powers: ['select'] },
  },
  {
    path: '/items',
    name: 'items',
    component: () => import('@/views/manage/items.vue'),
    meta: { title: 'items', icon: 'cube', group: 'economy', powers: ['select'] },
  },
  {
    path: '/purchases',
    name: 'purchases',
    component: () => import('@/views/manage/purchases.vue'),
    meta: { title: 'purchases', icon: 'card', group: 'economy', powers: ['select'] },
  },
  {
    path: '/presents',
    name: 'presents',
    component: () => import('@/views/manage/presents.vue'),
    meta: { title: 'presents', icon: 'gift', group: 'economy', powers: ['select'] },
  },
  {
    path: '/redeems',
    name: 'redeems',
    component: () => import('@/views/manage/redeems.vue'),
    meta: { title: 'redeems', icon: 'ticket', group: 'economy', powers: ['select'] },
  },
  {
    path: '/multiplay',
    name: 'multiplay',
    component: () => import('@/views/manage/multiplay.vue'),
    meta: { title: 'multiplay', icon: 'globe', group: 'system', powers: ['select'] },
  },
  {
    path: '/system/operations',
    name: 'operations',
    component: () => import('@/views/system/operations.vue'),
    meta: { title: 'operations', icon: 'settings', group: 'system', powers: ['system'] },
  },
]
