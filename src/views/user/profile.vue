<template>
  <div>
    <PageHeader :eyebrow="t('route.profile')" :title="user.name || t('route.profile')" :subtitle="''" />

    <div class="top-grid">
      <UserCard :user="me" :weights="weights" />
      <div class="chart-card glass">
        <div class="chart-head">
          <h3 class="font-display">{{ t('user.rating_history') }}</h3>
          <div class="range hud">
            <button v-for="d in [30, 90, 365]" :key="d" :class="{ on: ratingDays === d }" @click="setRange(d)">
              {{ d }}d
            </button>
          </div>
        </div>
        <RatingChart :points="ratingPoints" :caption="t('user.potential')" :empty-text="t('common.no_data')" />
      </div>
    </div>

    <div class="b30-head">
      <h3 class="font-display">{{ t('user.best50') }}</h3>
      <span class="head-right">
        <span v-if="user.best_scores.length" class="hud avg">{{ t('user.scores_n', { n: user.best_scores.length }) }}</span>
        <n-button
          quaternary
          circle
          size="small"
          :title="t('common.refresh')"
          :loading="loading"
          :disabled="cooling"
          @click="refresh(true)"
        >
          <template #icon><AppIcon name="refresh" :size="16" /></template>
        </n-button>
      </span>
    </div>

    <n-spin :show="loading">
      <div v-if="user.best_scores.length" class="b30-grid">
        <ScoreCard v-for="(s, i) in user.best_scores" :key="s.song_id + '-' + s.difficulty" :score="s" :rank="i + 1" />
      </div>
      <div v-else class="empty glass hud">{{ t('common.no_data') }}</div>
    </n-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NSpin } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import UserCard from '@/components/UserCard.vue'
import ScoreCard from '@/components/ScoreCard.vue'
import RatingChart from '@/components/RatingChart.vue'
import service from '@/plugins/axios'
import { userStore } from '@/store/user'
import { fetchPttWeights } from '@/composables/useUserScores'

const { t } = useI18n()
const user = userStore()

const loading = ref(false)
const ratingPoints = ref([])
const weights = ref(null)

const me = computed(() => ({
  name: user.name,
  character: user.character,
  rating_ptt: user.rating_ptt,
  user_id: user.user_id,
  user_code: user.user_code,
  ticket: user.ticket,
  join_date: user.join_date,
  last_played: user.last_played,
  b50_ptt: user.b50_ptt,
  b30_ptt: user.b30_ptt,
  b10_ptt: user.b10_ptt,
  r10_ptt: user.r10_ptt,
  is_banned: false,
}))

const ratingDays = ref(30)

const fetchRating = async (force = false) => {
  try {
    const res = await service.cachedGet(
      '/users/' + user.user_id + '/rating',
      { duration: ratingDays.value },
      { silent: true, force },
    )
    const data = (res.data.data || []).slice().sort((a, b) => a.time - b.time)
    // API times are seconds; the chart wants ms epochs for its date axis.
    ratingPoints.value = data.map((d) => ({ time: d.time * 1000, value: d.rating_ptt }))
  } catch (e) {
    ratingPoints.value = []
  }
}

const setRange = (d) => {
  ratingDays.value = d
  fetchRating()
}

// Manual refresh has a 30 s cooldown: a forced refresh is 4 uncached
// requests, and hammering the button shouldn't turn into server load. The
// timestamp lives in the store so leaving and re-entering the page doesn't
// reset it; the button is simply disabled meanwhile (no countdown).
const REFRESH_COOLDOWN = 30000
const now = ref(Date.now())
let tick = null
onMounted(() => {
  tick = setInterval(() => (now.value = Date.now()), 1000)
})
onUnmounted(() => clearInterval(tick))
const cooling = computed(() => now.value - user.scores_refreshed_at < REFRESH_COOLDOWN)

// `force` bypasses the request cache — the refresh button, for players who
// just finished a set and want their Best 50 / PTT right away.
const refresh = async (force = false) => {
  if (force) {
    if (cooling.value) return
    user.scores_refreshed_at = Date.now()
  }
  loading.value = true
  await Promise.allSettled([user.get_user_info(force), user.get_user_scores(force)])
  loading.value = false
  fetchRating(force)
}

onMounted(() => {
  fetchPttWeights().then((w) => (weights.value = w))
  refresh(false)
})
</script>

<style scoped>
.top-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 16px;
  margin-bottom: 22px;
}
.chart-card {
  padding: 18px 20px;
}
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.range {
  display: inline-flex;
  gap: 4px;
}
.range button {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: 'Chakra Petch', monospace;
}
.range button.on {
  background: var(--accent-soft);
  color: var(--text);
  border-color: var(--accent);
}
.chart-head h3 {
  font-size: 15px;
  font-weight: 600;
}
.b30-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.b30-head h3 {
  font-size: 15px;
  font-weight: 600;
}
.head-right {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.avg {
  font-size: 12px;
  color: var(--text-muted);
}
.b30-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.empty {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
@media (max-width: 900px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
  .b30-grid {
    grid-template-columns: 1fr;
  }
}
</style>
