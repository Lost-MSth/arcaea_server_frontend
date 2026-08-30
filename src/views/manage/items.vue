<template>
  <div>
    <PageHeader :eyebrow="t('route.items')" :title="t('manage.items_title')" :subtitle="t('manage.items_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      :row-key="(r) => r.type + '/' + r.id"
      :search-keys="['id', 'type']"
      :can-write="canWrite"
      :create-fields="canWrite ? createFields : null"
      :edit-fields="canWrite ? editFields : null"
      :on-create="onCreate"
      :on-edit="onEdit"
      :on-delete="onDelete"
      :scroll-x="600"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import service from '@/plugins/axios'
import { item_types } from '@/config'
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()
const canWrite = user.has_power('change')

const columns = [
  { title: 'Item ID', key: 'id', ellipsis: { tooltip: true } },
  { title: 'Type', key: 'type', width: 150 },
  {
    title: t('common.available'),
    key: 'is_available',
    width: 130,
    render: (row) => (row.is_available ? t('common.available') : t('common.unavailable')),
  },
]

const typeOptions = item_types.map((x) => ({ label: x, value: x }))

const createFields = [
  { key: 'item_id', label: 'Item ID', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'select', options: typeOptions, default: 'single', required: true },
  { key: 'is_available', label: t('common.available'), type: 'switch', default: true },
]
const editFields = [
  { key: 'id', label: 'Item ID', type: 'text', primary: true },
  { key: 'type', label: 'Type', type: 'text', primary: true },
  { key: 'is_available', label: t('common.available'), type: 'switch' },
]

const loadFn = async () => {
  const res = await service.get('/items')
  return res.data
}

const onCreate = (model) =>
  service.post('/items', { item_id: model.item_id, type: model.type, is_available: model.is_available })

const onEdit = (model, row) =>
  service.put('/items/' + row.type + '/' + row.id, { is_available: model.is_available })

const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/items/' + r.type + '/' + r.id)))
</script>
