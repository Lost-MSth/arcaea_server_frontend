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
        <div v-if="serverVersion" class="sub hud">{{ serverVersion }}</div>
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
              <div class="lb-ptt hud">{{ Number(u.rating_ptt).toFixed(3) }}</div>
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
const serverVersion = ref('')
const online = ref(false)
const leaderboard = ref([])
const recentUsers = ref([])
const loadingBoard = ref(false)

const fmt = (v) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('en-US'))

// `{count}` from count_only-aware servers, plain length otherwise.
const countOf = (d) => {
  if (d && typeof d.count === 'number') return d.count
  if (Array.isArray(d)) return d.length
  return null
}

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
  // Counts use `count_only` (server-side COUNT(*)); older servers ignore the
  // flag and return the full list, which countOf() handles too.
  const [users, songs, rooms, board, recent, consts] = await Promise.allSettled([
    service.cachedGet('/users', { count_only: true }, { silent: true }),
    service.cachedGet('/songs', { count_only: true }, { silent: true }),
    service.cachedGet('/multiplay/rooms', null, { silent: true }),
    service.cachedGet('/users', { sort: [{ column: 'rating_ptt', order: 'DESC' }], limit: 6 }, { silent: true }),
    service.cachedGet('/users', { sort: [{ column: 'join_date', order: 'DESC' }], limit: 5 }, { silent: true }),
    service.cachedGet('/system/constants', null, { silent: true }),
  ])
  if (users.status === 'fulfilled') stats.users = countOf(users.value.data)
  if (songs.status === 'fulfilled') stats.songs = countOf(songs.value.data)
  if (rooms.status === 'fulfilled') stats.rooms = roomsCount(rooms.value.data)
  if (board.status === 'fulfilled') leaderboard.value = board.value.data
  if (recent.status === 'fulfilled') recentUsers.value = recent.value.data
  if (consts.status === 'fulfilled') serverVersion.value = consts.value.data.server_version || ''
  online.value = [users, songs, rooms, board, recent, consts].some((r) => r.status === 'fulfilled')
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
.stat .sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
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
@media (max-width: 720px) {
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
