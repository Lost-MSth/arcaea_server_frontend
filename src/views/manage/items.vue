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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import service from '@/plugins/axios'
import { item_types } from '@/config'
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()
const canWrite = user.has_power('change')

const columns = computed(() => [
  { title: t('fields.item_id'), key: 'id', ellipsis: { tooltip: true } },
  { title: t('fields.type'), key: 'type', width: 150 },
  {
    title: t('fields.available'),
    key: 'is_available',
    width: 130,
    render: (row) => (row.is_available ? t('common.available') : t('common.unavailable')),
  },
])

const typeOptions = item_types.map((x) => ({ label: x, value: x }))

const createFields = computed(() => [
  { key: 'item_id', label: t('fields.item_id'), type: 'text', required: true },
  { key: 'type', label: t('fields.type'), type: 'select', options: typeOptions, default: 'single', required: true },
  { key: 'is_available', label: t('fields.available'), type: 'switch', default: true },
])
const editFields = computed(() => [
  { key: 'id', label: t('fields.item_id'), type: 'text', primary: true },
  { key: 'type', label: t('fields.type'), type: 'text', primary: true },
  { key: 'is_available', label: t('fields.available'), type: 'switch' },
])

const loadFn = async (force) => {
  const res = await service.cachedGet('/items', null, { force })
  return res.data
}

const onCreate = (model) =>
  service.post('/items', { item_id: model.item_id, type: model.type, is_available: model.is_available })

const onEdit = (model, row) =>
  service.put('/items/' + row.type + '/' + row.id, { is_available: model.is_available })

const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/items/' + r.type + '/' + r.id)))
</script>
