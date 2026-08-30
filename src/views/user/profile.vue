<template>
  <div>
    <PageHeader :eyebrow="t('route.profile')" :title="user.name || t('route.profile')" :subtitle="''" />

    <div class="top-grid">
      <UserCard :user="me" />
      <div class="chart-card glass">
        <div class="chart-head">
          <h3 class="font-display">{{ t('user.rating_history') }}</h3>
        </div>
        <RatingChart :points="ratingPoints" :caption="t('user.potential')" :empty-text="t('common.no_data')" />
      </div>
    </div>

    <div class="b30-head">
      <h3 class="font-display">{{ t('user.best30') }}</h3>
      <span v-if="user.b30_ptt != null" class="hud avg">{{ t('user.b30_ptt') }} · {{ Number(user.b30_ptt).toFixed(2) }}</span>
    </div>

    <n-spin :show="loading">
      <div v-if="user.b30_scores.length" class="b30-grid">
        <ScoreCard v-for="(s, i) in user.b30_scores" :key="i" :score="s" :rank="i + 1" />
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

onMounted(async () => {
  loading.value = true
  await Promise.allSettled([user.get_user_b30(), user.get_user_recent()])
  loading.value = false

  try {
    const res = await service._get('/users/' + user.user_id + '/rating', { duration: 30 })
    const data = (res.data.data || []).slice().sort((a, b) => a.time - b.time)
    ratingPoints.value = data.map((d) => d.rating_ptt)
  } catch (e) {
    ratingPoints.value = []
  }
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
  margin-bottom: 8px;
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
  font-size: 16px;
  font-weight: 600;
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
