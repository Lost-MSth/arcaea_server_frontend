<template>
  <div>
    <PageHeader :eyebrow="t('route.profile')" :title="user.name || t('route.profile')" :subtitle="''" />

    <div class="top-grid">
      <UserCard :user="me" />
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
      <div class="segmented">
        <button :class="{ on: tab === 'b30' }" @click="tab = 'b30'">{{ t('user.best30') }}</button>
        <button :class="{ on: tab === 'r30' }" @click="tab = 'r30'">{{ t('user.recent30') }}</button>
      </div>
      <span v-if="tab === 'b30' && user.b30_ptt != null" class="hud avg">
        {{ t('user.b30_ptt') }} · {{ Number(user.b30_ptt).toFixed(2) }}
      </span>
      <span v-else-if="tab === 'r30' && user.r10_ptt != null" class="hud avg">
        {{ t('user.r10_ptt') }} · {{ Number(user.r10_ptt).toFixed(2) }}
      </span>
    </div>

    <n-spin :show="loading">
      <div v-if="shownScores.length" class="b30-grid">
        <ScoreCard
          v-for="(s, i) in shownScores"
          :key="tab + i"
          :score="s"
          :rank="tab === 'b30' ? i + 1 : null"
        />
      </div>
      <div v-else class="empty glass hud">{{ t('common.no_data') }}</div>
    </n-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSpin } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import UserCard from '@/components/UserCard.vue'
import ScoreCard from '@/components/ScoreCard.vue'
import RatingChart from '@/components/RatingChart.vue'
import service from '@/plugins/axios'
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()

const loading = ref(false)
const ratingPoints = ref([])
const tab = ref('b30')

const shownScores = computed(() => (tab.value === 'b30' ? user.b30_scores : user.r30_scores))

const me = computed(() => ({
  name: user.name,
  rating_ptt: user.rating_ptt,
  user_id: user.user_id,
  user_code: user.user_code,
  ticket: user.ticket,
  join_date: user.join_date,
  b30_ptt: user.b30_ptt,
  r10_ptt: user.r10_ptt,
  is_banned: false,
}))

const ratingDays = ref(30)

const fetchRating = async () => {
  try {
    const res = await service._get(
      '/users/' + user.user_id + '/rating',
      { duration: ratingDays.value },
      { silent: true },
    )
    const data = (res.data.data || []).slice().sort((a, b) => a.time - b.time)
    ratingPoints.value = data.map((d) => d.rating_ptt)
  } catch (e) {
    ratingPoints.value = []
  }
}

const setRange = (d) => {
  ratingDays.value = d
  fetchRating()
}

onMounted(async () => {
  loading.value = true
  // get_user_info refreshes the persisted profile basics (name/rating/ticket)
  // — this page is where that heavy endpoint is worth calling.
  await Promise.allSettled([user.get_user_info(), user.get_user_b30(), user.get_user_recent()])
  loading.value = false
  fetchRating()
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
.segmented {
  display: inline-flex;
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}
.segmented button {
  font-family: 'Chakra Petch', monospace;
  font-size: 12px;
  padding: 6px 13px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
}
.segmented button.on {
  background: var(--accent-soft);
  color: var(--text);
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
