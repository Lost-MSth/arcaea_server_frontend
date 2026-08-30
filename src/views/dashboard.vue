<template>
  <div>
    <PageHeader :eyebrow="t('route.dashboard')" :title="t('dashboard.overview')" :subtitle="greeting" />

    <div class="stat-row">
      <div class="stat glass" :class="{ link: isAdmin }" @click="go('/user/users')">
        <div class="k"><AppIcon name="people" :size="15" />{{ t('dashboard.users') }}</div>
        <div class="v hud">{{ fmt(stats.users) }}</div>
      </div>
      <div class="stat glass" :class="{ link: isAdmin }" @click="go('/song/manage')">
        <div class="k"><AppIcon name="music" :size="15" />{{ t('dashboard.songs') }}</div>
        <div class="v hud">{{ fmt(stats.songs) }}</div>
      </div>
      <div class="stat glass" :class="{ link: isAdmin }" @click="go('/multiplay')">
        <div class="k"><AppIcon name="globe" :size="15" />{{ t('dashboard.rooms') }}</div>
        <div class="v hud">{{ fmt(stats.rooms) }}</div>
      </div>
      <div class="stat glass">
        <div class="k"><AppIcon name="pulse" :size="15" />{{ t('dashboard.server') }}</div>
        <div class="v hud" :style="{ fontSize: '20px', color: online ? 'var(--good)' : 'var(--text-muted)' }">
          {{ online ? t('dashboard.healthy') : '—' }}
        </div>
      </div>
    </div>

    <div v-if="extraStats.length" class="mini-row">
      <div
        v-for="s in extraStats"
        :key="s.key"
        class="mini glass"
        :class="{ link: !!s.to }"
        @click="s.to && go(s.to)"
      >
        <span class="mk">{{ s.label }}</span>
        <span class="mv hud">{{ fmt(s.value) }}</span>
      </div>
    </div>

    <div v-if="isAdmin" class="two-col">
      <div class="board glass">
        <div class="board-head">
          <h3 class="font-display">{{ t('dashboard.leaderboard') }}</h3>
          <span class="pill hud">{{ t('dashboard.world_rank') }}</span>
        </div>
        <n-spin :show="loadingBoard">
          <div v-if="leaderboard.length">
            <div v-for="(u, i) in leaderboard" :key="u.user_id" class="lb-row">
              <div class="lb-rank hud">{{ i + 1 }}</div>
              <div class="lb-name">
                {{ u.name }}<small class="hud">#{{ String(u.user_id).padStart(3, '0') }} · {{ u.user_code }}</small>
              </div>
              <div class="lb-ptt hud">{{ Number(u.rating_ptt).toFixed(2) }}</div>
            </div>
          </div>
          <div v-else class="empty hud">{{ t('common.no_data') }}</div>
        </n-spin>
      </div>

      <div class="board glass">
        <div class="board-head">
          <h3 class="font-display">{{ t('dashboard.recent_users') }}</h3>
        </div>
        <n-spin :show="loadingBoard">
          <div v-if="recentUsers.length">
            <div v-for="u in recentUsers" :key="u.user_id" class="lb-row">
              <div class="lb-name">
                {{ u.name }}<small class="hud">#{{ String(u.user_id).padStart(3, '0') }} · {{ u.user_code }}</small>
              </div>
              <div class="lb-when hud">{{ u.join_date ? dayjs(u.join_date).fromNow() : '—' }}</div>
            </div>
          </div>
          <div v-else class="empty hud">{{ t('common.no_data') }}</div>
        </n-spin>
      </div>
    </div>

    <div v-else class="board glass welcome">
      <AppIcon name="person" :size="22" />
      <div>
        <div class="w-title font-display">{{ user.name }}</div>
        <RouterLink class="w-link" to="/user/profile">{{ t('route.profile') }} →</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import service from '@/plugins/axios'
import dayjs from '@/plugins/day'
import { userStore } from '@/store/user'

const { t } = useI18n()
const router = useRouter()
const user = userStore()

const isAdmin = computed(() => user.has_power('select'))
const go = (path) => {
  if (isAdmin.value) router.push(path)
}
const greeting = computed(() => (user.name ? `${user.name} · ${user.role || ''}` : ''))

const stats = reactive({ users: null, songs: null, rooms: null })
const statData = ref(null)
const online = ref(false)

// Secondary counters — only present when the server has /system/statistics,
// so this row simply doesn't render against older servers.
const extraStats = computed(() => {
  const d = statData.value
  if (!d) return []
  return [
    { key: 'scores', label: t('dashboard.scores'), value: d.best_score_count },
    { key: 'characters', label: t('route.characters'), value: d.character_count, to: '/characters' },
    { key: 'items', label: t('route.items'), value: d.item_count, to: '/items' },
    { key: 'purchases', label: t('route.purchases'), value: d.purchase_count, to: '/purchases' },
    { key: 'presents', label: t('route.presents'), value: d.present_count, to: '/presents' },
    { key: 'redeems', label: t('route.redeems'), value: d.redeem_count, to: '/redeems' },
  ]
})
const leaderboard = ref([])
const recentUsers = ref([])
const loadingBoard = ref(false)

const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('en-US'))

const roomsCount = (data) => {
  if (Array.isArray(data)) return data.length
  if (data && Array.isArray(data.rooms)) return data.rooms.length
  return 0
}

onMounted(async () => {
  if (!isAdmin.value) {
    online.value = true
    return
  }
  loadingBoard.value = true
  // Cached (60s TTL) — revisiting the dashboard doesn't re-hit the server.
  // Counts prefer /system/statistics (a few server-side COUNT(*));
  // servers without it fall back to pulling the full lists.
  const [st, rooms, board, recent] = await Promise.allSettled([
    service.cachedGet('/system/statistics', null, { silent: true }),
    service.cachedGet('/multiplay/rooms', null, { silent: true }),
    service.cachedGet('/users', { sort: [{ column: 'rating_ptt', order: 'DESC' }], limit: 6 }, { silent: true }),
    service.cachedGet('/users', { sort: [{ column: 'join_date', order: 'DESC' }], limit: 5 }, { silent: true }),
  ])
  if (st.status === 'fulfilled') {
    statData.value = st.value.data
    stats.users = st.value.data.user_count
    stats.songs = st.value.data.song_count
  } else {
    const [users, songs] = await Promise.allSettled([
      service.cachedGet('/users', null, { silent: true }),
      service.cachedGet('/songs', null, { silent: true }),
    ])
    if (users.status === 'fulfilled') stats.users = users.value.data.length
    if (songs.status === 'fulfilled') stats.songs = songs.value.data.length
  }
  if (rooms.status === 'fulfilled') stats.rooms = roomsCount(rooms.value.data)
  if (board.status === 'fulfilled') leaderboard.value = board.value.data
  if (recent.status === 'fulfilled') recentUsers.value = recent.value.data
  online.value =
    [st, rooms, board, recent].some((r) => r.status === 'fulfilled') || stats.users != null
  loadingBoard.value = false
})
</script>

<style scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.stat {
  padding: 16px;
}
.stat.link {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.stat.link:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}
.stat .k {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--text-muted);
}
.stat .k :deep(.n-icon) {
  color: var(--accent);
}
.stat .v {
  font-weight: 700;
  font-size: 30px;
  margin-top: 8px;
}
.mini-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.mini {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
}
.mini.link {
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.mini.link:hover {
  border-color: var(--accent);
}
.mk {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.mv {
  font-weight: 700;
  font-size: 16px;
}
.two-col {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 14px;
}
.board {
  padding: 18px 20px;
}
.lb-when {
  font-size: 11px;
  color: var(--text-muted);
}
.board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.board-head h3 {
  font-size: 15px;
  font-weight: 600;
}
.pill {
  font-size: 11px;
  color: var(--accent);
  border: 1px solid var(--border);
  padding: 3px 10px;
  border-radius: 999px;
}
.lb-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 10px 4px;
  border-bottom: 1px solid var(--border);
}
.lb-row:last-child {
  border-bottom: none;
}
.lb-rank {
  width: 26px;
  text-align: center;
  font-weight: 700;
  color: var(--text-muted);
}
.lb-row:first-child .lb-rank {
  color: #ffd76a;
}
.lb-name {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  min-width: 0;
}
.lb-name small {
  display: block;
  font-weight: 500;
  color: var(--text-muted);
  font-size: 11px;
}
.lb-ptt {
  font-weight: 700;
  font-size: 16px;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.empty {
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
}
.welcome {
  display: flex;
  align-items: center;
  gap: 14px;
}
.welcome :deep(.n-icon) {
  color: var(--accent);
}
.w-title {
  font-weight: 700;
  font-size: 18px;
}
.w-link {
  color: var(--accent);
  font-size: 13px;
  text-decoration: none;
}
@media (max-width: 720px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .mini-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
