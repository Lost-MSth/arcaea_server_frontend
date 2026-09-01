<template>
  <div>
    <PageHeader :eyebrow="t('route.song_manage')" :title="t('song.song_info_title')" :subtitle="t('song.song_info_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      cache-prefix="/songs"
      :row-key="(r) => r.song_id"
      :search-keys="['song_id', 'name']"
      :can-write="canWrite"
      :create-fields="fields"
      :edit-fields="editFields"
      :on-create="onCreate"
      :on-edit="onEdit"
      :on-delete="onDelete"
      :extra-actions="rowActions"
      :scroll-x="880"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import service from '@/plugins/axios'
import { difficulty_short_name } from '@/config'
import { userStore } from '@/store/user'

const { t } = useI18n()
const router = useRouter()
const user = userStore()
const canWrite = user.has_power('change')

// Jump straight to this song's leaderboard on the search page.
const rowActions = computed(() => [
  {
    key: 'rank',
    label: t('song.view_rank'),
    onClick: (row) => router.push({ path: '/song/search', query: { song_id: row.song_id } }),
  },
])

const ccKeys = [0, 1, 2, 3, 4]

const ccRender = (key) => (row) => {
  const v = row[key]
  return v >= 0 ? Number(v).toFixed(1) : '—'
}

const columns = computed(() => [
  { title: t('fields.song_id'), key: 'song_id', width: 170, ellipsis: { tooltip: true } },
  { title: t('fields.song_name'), key: 'name', ellipsis: { tooltip: true } },
  ...ccKeys.map((i) => ({
    title: difficulty_short_name[i],
    key: 'cc' + i,
    width: 78,
    align: 'right',
    render: ccRender('cc' + i),
  })),
])

const fields = computed(() => [
  { key: 'song_id', label: t('fields.song_id'), type: 'text', required: true, primary: true },
  { key: 'name', label: t('fields.song_name'), type: 'text' },
  ...ccKeys.map((i) => ({ key: 'cc' + i, label: difficulty_short_name[i] + ' CC', type: 'number', default: -1 })),
])
const editFields = fields

// API song -> flat table row (cc0..cc4 = chart constants per difficulty).
const mapSong = (item) => {
  const cc = [-1, -1, -1, -1, -1]
  ;(item.charts || []).forEach((c) => {
    cc[c.difficulty] = c.chart_const
  })
  return { song_id: item.song_id, name: item.name, cc0: cc[0], cc1: cc[1], cc2: cc[2], cc3: cc[3], cc4: cc[4] }
}

const loadFn = async (force) => {
  const res = await service.cachedGet('/songs', null, { force })
  return res.data.map(mapSong)
}

const buildCharts = (model) =>
  ccKeys.map((i) => ({ difficulty: i, chart_const: Number(model['cc' + i]) }))

// Handlers return the mapped row so the table can apply it locally.
const onCreate = (model) =>
  service
    .post('/songs', { song_id: model.song_id, name: model.name, charts: buildCharts(model) })
    .then((res) => mapSong(res.data))

const onEdit = (model, row, changed) => {
  const payload = {}
  if ('name' in changed) payload.name = model.name
  // the server merges charts per difficulty — send only the changed ones
  const diffs = ccKeys.filter((i) => 'cc' + i in changed)
  if (diffs.length) payload.charts = diffs.map((i) => ({ difficulty: i, chart_const: Number(model['cc' + i]) }))
  return service.put('/songs/' + row.song_id, payload).then((res) => mapSong(res.data))
}

const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/songs/' + r.song_id)))
</script>
