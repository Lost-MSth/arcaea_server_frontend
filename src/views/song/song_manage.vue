<template>
  <div>
    <PageHeader :eyebrow="t('route.song_manage')" :title="t('song.song_info_title')" :subtitle="t('song.song_info_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      :row-key="(r) => r.song_id"
      :search-keys="['song_id', 'name']"
      :can-write="canWrite"
      :create-fields="fields"
      :edit-fields="editFields"
      :on-create="onCreate"
      :on-edit="onEdit"
      :on-delete="onDelete"
      :scroll-x="820"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import service from '@/plugins/axios'
import { difficulty_short_name } from '@/config'
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()
const canWrite = user.has_power('change')

const ccKeys = [0, 1, 2, 3, 4]

const ccRender = (key) => (row) => {
  const v = row[key]
  return v >= 0 ? Number(v).toFixed(1) : '—'
}

const columns = [
  { title: 'Song ID', key: 'song_id', width: 170, ellipsis: { tooltip: true } },
  { title: 'Name', key: 'name', ellipsis: { tooltip: true } },
  ...ccKeys.map((i) => ({
    title: difficulty_short_name[i],
    key: 'cc' + i,
    width: 78,
    render: ccRender('cc' + i),
  })),
]

const fields = [
  { key: 'song_id', label: 'Song ID', type: 'text', required: true, primary: true },
  { key: 'name', label: 'Song Name', type: 'text' },
  ...ccKeys.map((i) => ({ key: 'cc' + i, label: difficulty_short_name[i] + ' CC', type: 'number', default: -1 })),
]
const editFields = fields

const loadFn = async () => {
  const res = await service.get('/songs')
  return res.data.map((item) => {
    const cc = [-1, -1, -1, -1, -1]
    ;(item.charts || []).forEach((c) => {
      cc[c.difficulty] = c.chart_const
    })
    return {
      song_id: item.song_id,
      name: item.name,
      cc0: cc[0],
      cc1: cc[1],
      cc2: cc[2],
      cc3: cc[3],
      cc4: cc[4],
    }
  })
}

const buildCharts = (model) =>
  ccKeys.map((i) => ({ difficulty: i, chart_const: Number(model['cc' + i]) }))

const onCreate = (model) =>
  service.post('/songs', { song_id: model.song_id, name: model.name, charts: buildCharts(model) })

const onEdit = (model, row) =>
  service.put('/songs/' + row.song_id, { name: model.name, charts: buildCharts(model) })

const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/songs/' + r.song_id)))
</script>
