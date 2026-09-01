<template>
  <div>
    <PageHeader :eyebrow="t('route.cache')" :title="t('cache.title')" :subtitle="t('cache.subtitle')" />

    <div class="summary">
      <div class="chip glass">
        <span class="k">{{ t('cache.entries') }}</span>
        <span class="v hud">{{ list.length }}</span>
      </div>
      <div class="chip glass">
        <span class="k">{{ t('cache.fresh') }}</span>
        <span class="v hud">{{ freshCount }}</span>
      </div>
      <div class="chip glass">
        <span class="k">{{ t('cache.hits') }}</span>
        <span class="v hud">{{ totalHits }}</span>
      </div>
      <div class="chip glass">
        <span class="k">{{ t('cache.size') }}</span>
        <span class="v hud">{{ fmtBytes(totalBytes) }}</span>
      </div>
      <div class="spacer"></div>
      <n-button type="error" secondary :disabled="!list.length" @click="clearAllNow">
        <template #icon><AppIcon name="trash" :size="16" /></template>
        {{ t('cache.clear_all') }}
      </n-button>
    </div>

    <n-card class="cache-card" :bordered="true">
      <n-data-table
        v-if="list.length"
        :columns="columns"
        :data="list"
        :row-key="(r) => r.key"
        :pagination="false"
        size="small"
      />
      <div v-else class="empty hud">{{ t('cache.empty') }}</div>
    </n-card>
    <p class="hint">{{ t('cache.policy_hint') }}</p>
  </div>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NCard, NDataTable, NTag, useMessage } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import dayjs from '@/plugins/day'
import { clearAll, refresh, registry } from '@/plugins/cache'

const { t } = useI18n()
const message = useMessage()

// Tick so ages / freshness re-render without any request.
const now = ref(Date.now())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 10000)
})
onUnmounted(() => clearInterval(timer))

const list = computed(() => {
  void now.value
  return [...registry.values()].sort((a, b) => b.time - a.time)
})
const isFresh = (e) => e.status === 'ok' && now.value - e.time < e.ttl
const freshCount = computed(() => list.value.filter(isFresh).length)
const totalHits = computed(() => list.value.reduce((s, e) => s + e.hits, 0))
const totalBytes = computed(() => list.value.reduce((s, e) => s + (e.bytes || 0), 0))

const fmtBytes = (n) => (n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(2) + ' MB')
const fmtTtl = (ms) => (ms >= 3600e3 ? Math.round(ms / 3600e3) + ' h' : ms >= 60e3 ? Math.round(ms / 60e3) + ' min' : Math.round(ms / 1e3) + ' s')
const querySummary = (data) => {
  if (!data) return ''
  const s = Object.entries(data)
    .map(([k, v]) => k + '=' + (typeof v === 'object' ? JSON.stringify(v) : v))
    .join(' ')
  return s.length > 70 ? s.slice(0, 70) + '…' : s
}

const refreshOne = async (e) => {
  await refresh(e.key)
  message.success(t('cache.refreshed'))
}
const clearAllNow = () => {
  clearAll({ persisted: true })
  message.success(t('cache.cleared'))
}

const columns = computed(() => [
  {
    title: t('cache.resource'),
    key: 'policy',
    render: (e) =>
      h('div', { class: 'res' }, [
        h('div', { class: 'res-name' }, t('cache.res_' + e.policy)),
        h('div', { class: 'res-key hud' }, [e.url, e.data ? h('span', { class: 'q' }, ' ' + querySummary(e.data)) : null]),
      ]),
  },
  {
    title: t('cache.status'),
    key: 'status',
    width: 110,
    render: (e) =>
      e.status !== 'ok'
        ? h(NTag, { size: 'small', type: 'warning', bordered: false }, { default: () => t('cache.pending') })
        : isFresh(e)
          ? h(NTag, { size: 'small', type: 'success', bordered: false }, { default: () => t('cache.fresh') })
          : h(NTag, { size: 'small', bordered: false }, { default: () => t('cache.stale') }),
  },
  {
    title: t('cache.cached_at'),
    key: 'time',
    width: 150,
    render: (e) =>
      h('span', { class: 'hud' }, [
        dayjs(e.time).fromNow(),
        e.restored ? h('span', { class: 'restored' }, ' · ' + t('cache.restored')) : null,
      ]),
  },
  { title: t('cache.ttl'), key: 'ttl', width: 90, align: 'right', render: (e) => h('span', { class: 'hud' }, fmtTtl(e.ttl)) },
  { title: t('cache.hits'), key: 'hits', width: 80, align: 'right', render: (e) => h('span', { class: 'hud' }, String(e.hits)) },
  {
    title: t('cache.size'),
    key: 'bytes',
    width: 110,
    align: 'right',
    render: (e) => h('span', { class: 'hud' }, e.rows != null ? t('cache.rows_n', { n: e.rows }) : fmtBytes(e.bytes || 0)),
  },
  {
    title: t('common.actions'),
    key: '__actions',
    width: 150,
    render: (e) =>
      h('div', { style: 'display:flex;gap:6px' }, [
        h(NButton, { size: 'tiny', quaternary: true, type: 'primary', onClick: () => refreshOne(e) }, { default: () => t('common.refresh') }),
        h(NButton, { size: 'tiny', quaternary: true, type: 'error', onClick: () => registry.delete(e.key) }, { default: () => t('cache.clear') }),
      ]),
  },
])
</script>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.chip {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 14px;
}
.chip .k {
  font-size: 12px;
  color: var(--text-muted);
}
.chip .v {
  font-weight: 700;
  font-size: 16px;
}
.spacer {
  flex: 1;
}
.cache-card {
  border-radius: 16px;
}
.cache-card :deep(.res-name) {
  font-weight: 600;
  font-size: 13px;
}
.cache-card :deep(.res-key) {
  font-size: 10.5px;
  color: var(--text-muted);
  word-break: break-all;
}
.cache-card :deep(.res-key .q) {
  color: var(--accent);
}
.cache-card :deep(.restored) {
  color: var(--text-muted);
  font-size: 10px;
}
.empty {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
.hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
