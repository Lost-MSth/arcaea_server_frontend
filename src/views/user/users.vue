<template>
  <div>
    <PageHeader :eyebrow="t('route.users')" :title="t('user.user_select_title')" />

    <n-card class="search-card" :bordered="true">
      <div class="search-row">
        <div class="segmented">
          <button v-for="(m, i) in modes" :key="m.key" :class="{ on: mode === i }" @click="mode = i">
            {{ m.label }}
          </button>
        </div>
        <n-input
          v-model:value="query"
          :placeholder="modes[mode].label"
          class="q"
          @keyup.enter="search"
        >
          <template #prefix><AppIcon name="search" :size="16" /></template>
        </n-input>
        <n-button type="primary" :loading="loading" @click="search">{{ t('common.search') }}</n-button>
      </div>
    </n-card>

    <n-spin :show="loading">
      <template v-if="target">
        <div class="target">
          <UserCard :user="target" />
        </div>
        <div class="b30-head">
          <h3 class="font-display">{{ t('user.best30') }}</h3>
          <span v-if="target.b30_ptt != null" class="hud avg">{{ t('user.b30_ptt') }} · {{ Number(target.b30_ptt).toFixed(2) }}</span>
        </div>
        <div v-if="target.b30_scores && target.b30_scores.length" class="b30-grid">
          <ScoreCard v-for="(s, i) in target.b30_scores" :key="i" :score="s" :rank="i + 1" />
        </div>
        <div v-else class="empty glass hud">{{ t('common.no_data') }}</div>
      </template>
    </n-spin>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NInput, NButton, NSpin } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import UserCard from '@/components/UserCard.vue'
import ScoreCard from '@/components/ScoreCard.vue'
import service from '@/plugins/axios'

const { t } = useI18n()

const modes = [
  { key: 'user_id', label: 'User ID' },
  { key: 'name', label: 'User Name' },
  { key: 'user_code', label: 'User Code' },
]
const mode = ref(0)
const query = ref('')
const loading = ref(false)
const target = ref(null)

const search = async () => {
  if (!query.value.trim()) return
  loading.value = true
  target.value = null
  try {
    const res = await service._get('/users', { query: { [modes[mode.value].key]: query.value.trim() } })
    const u = reactive({ ...res.data[0], b30_ptt: null, b30_scores: [] })
    target.value = u
    const b30 = await service.get('/users/' + u.user_id + '/b30')
    u.b30_ptt = b30.data.b30_ptt
    u.b30_scores = b30.data.data
  } catch (e) {
    /* surfaced by interceptor */
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.search-card {
  border-radius: 16px;
  margin-bottom: 20px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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
  padding: 7px 13px;
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
.q {
  flex: 1;
  min-width: 180px;
}
.target {
  margin-bottom: 22px;
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
  .b30-grid {
    grid-template-columns: 1fr;
  }
}
</style>
