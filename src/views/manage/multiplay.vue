<template>
  <div>
    <PageHeader :eyebrow="t('route.multiplay')" :title="t('manage.multiplay_title')" :subtitle="t('manage.multiplay_subtitle')" />

    <n-card :bordered="true" class="wrap">
      <div class="bar">
        <span class="count hud">{{ t('dashboard.live_rooms') }} · {{ rooms.length }}</span>
        <div class="spacer"></div>
        <n-button quaternary circle :loading="loading" @click="reload">
          <template #icon><AppIcon name="refresh" :size="18" /></template>
        </n-button>
      </div>
      <n-spin :show="loading">
        <n-data-table
          v-if="rooms.length"
          :columns="columns"
          :data="rooms"
          :row-key="(r, i) => i"
          size="small"
          :scroll-x="600"
        />
        <div v-else class="empty hud">{{ t('common.no_data') }}</div>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NCard, NButton, NSpin, NDataTable } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import service from '@/plugins/axios'

const { t } = useI18n()

const loading = ref(false)
const rooms = ref([])

// Room shape isn't fixed across server builds, so derive columns from the data.
const columns = computed(() => {
  if (!rooms.value.length) return []
  return Object.keys(rooms.value[0]).map((k) => ({
    title: k,
    key: k,
    ellipsis: { tooltip: true },
    render: (row) => {
      const v = row[k]
      return typeof v === 'object' ? JSON.stringify(v) : String(v)
    },
  }))
})

const reload = async () => {
  loading.value = true
  try {
    const res = await service.get('/multiplay/rooms', { silent: true })
    const data = res.data
    rooms.value = Array.isArray(data) ? data : Array.isArray(data?.rooms) ? data.rooms : []
  } catch (e) {
    rooms.value = []
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>

<style scoped>
.wrap {
  border-radius: 16px;
}
.bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.count {
  font-size: 13px;
  color: var(--text-2);
}
.spacer {
  flex: 1;
}
.empty {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
</style>
