<template>
  <div class="scores-table">
    <div class="head">
      <h4 class="font-display">{{ t('user.all_scores') }}</h4>
      <span v-if="total != null" class="hud muted">{{ t('user.scores_n', { n: total }) }}</span>
    </div>
    <n-data-table
      remote
      size="small"
      :columns="columns"
      :data="rows"
      :loading="loading"
      :row-key="(r) => r.song_id + '-' + r.difficulty"
      :pagination="pagination"
      @update:sorter="onSorter"
    />
  </div>
</template>

<script setup>
import { computed, h, reactive, ref, watch, withDirectives } from 'vue'
import { useI18n } from 'vue-i18n'
import { NDataTable } from 'naive-ui'

import DiffChip from '@/components/DiffChip.vue'
import { clear_type_name } from '@/config'
import dayjs from '@/plugins/day'
import service from '@/plugins/axios'
import { fillSongMeta } from '@/composables/useUserScores'
import { vTip } from '@/plugins/tip'

// Every best score of one player, paged on the server (`limit`/`offset`,
// total via `count_only`) — the list can be hundreds of rows, so unlike the
// admin tables it is not pulled whole. Each page is a cached request.
const props = defineProps({
  userId: { type: [Number, String], required: true },
  pageSize: { type: Number, default: 20 },
})

const { t } = useI18n()
const rows = ref([])
const total = ref(null)
const loading = ref(false)
const sort = reactive({ column: 'rating', order: 'DESC' })

const pagination = reactive({
  page: 1,
  pageSize: props.pageSize,
  itemCount: 0,
  onUpdatePage: (p) => {
    pagination.page = p
    load()
  },
})

let seq = 0
const load = async () => {
  const my = ++seq
  loading.value = true
  const base = `/users/${props.userId}/best`
  const query = {
    limit: pagination.pageSize,
    offset: (pagination.page - 1) * pagination.pageSize,
    sort: [{ column: sort.column, order: sort.order }],
  }
  const [page, count] = await Promise.allSettled([
    service.cachedGet(base, query, { silent: true }),
    service.cachedGet(base, { count_only: true }, { silent: true }),
  ])
  if (my !== seq) return // a newer load (other user / page / sort) is in flight
  const list = page.status === 'fulfilled' ? page.value.data.data || [] : []
  await fillSongMeta(list) // chart constants (cached song list)
  if (my !== seq) return
  rows.value = list
  if (count.status === 'fulfilled' && typeof count.value.data.count === 'number') {
    total.value = count.value.data.count
  } else {
    // older servers ignore count_only and return the full list
    total.value = count.status === 'fulfilled' && Array.isArray(count.value.data.data) ? count.value.data.data.length : rows.value.length
  }
  pagination.itemCount = total.value || 0
  loading.value = false
}

const onSorter = (s) => {
  if (s && s.order) {
    sort.column = s.columnKey
    sort.order = s.order === 'ascend' ? 'ASC' : 'DESC'
  } else {
    sort.column = 'rating'
    sort.order = 'DESC'
  }
  pagination.page = 1
  load()
}

watch(
  () => props.userId,
  () => {
    pagination.page = 1
    sort.column = 'rating'
    sort.order = 'DESC'
    load()
  },
  { immediate: true },
)

const CLEAR_SHORT = { 0: 'TL', 1: 'NC', 2: 'FR', 3: 'PM', 4: 'EC', 5: 'HC' }
const sortState = (key) => (sort.column === key ? (sort.order === 'ASC' ? 'ascend' : 'descend') : false)

const columns = computed(() => [
  {
    title: t('fields.song'),
    key: 'song_id',
    ellipsis: { tooltip: true },
    render: (r) => h('span', {}, r.song_name || r.song_id),
  },
  {
    title: t('fields.difficulty'),
    key: 'difficulty',
    width: 90,
    sorter: true,
    sortOrder: sortState('difficulty'),
    render: (r) => h(DiffChip, { difficulty: r.difficulty, cc: r.chart_const }),
  },
  {
    title: t('fields.score'),
    key: 'score',
    width: 120,
    align: 'right',
    sorter: true,
    sortOrder: sortState('score'),
    render: (r) => h('span', { class: 'hud' }, Number(r.score).toLocaleString('en-US')),
  },
  {
    title: t('score.rating'),
    key: 'rating',
    width: 90,
    align: 'right',
    sorter: true,
    sortOrder: sortState('rating'),
    render: (r) => h('span', { class: 'hud' }, Number(r.rating).toFixed(3)),
  },
  {
    title: t('fields.clear'),
    key: 'clear_type',
    width: 70,
    render: (r) => {
      const ct = r.best_clear_type ?? r.clear_type
      return h('span', { class: 'hud', title: clear_type_name[ct] || '' }, CLEAR_SHORT[ct] || '—')
    },
  },
  {
    title: t('fields.played_at'),
    key: 'time_played',
    width: 150,
    sorter: true,
    sortOrder: sortState('time_played'),
    render: (r) =>
      r.time_played > 1e9
        ? withDirectives(h('span', { class: 'hud muted' }, dayjs(r.time_played * 1000).format('YYYY-MM-DD HH:mm')), [[vTip, dayjs(r.time_played * 1000).fromNow()]])
        : h('span', { class: 'hud muted' }, '—'),
  },
])
</script>

<style scoped>
.scores-table {
  margin-top: 22px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.head h4 {
  font-size: 15px;
  font-weight: 600;
}
.muted {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
