<template>
  <div>
    <PageHeader :eyebrow="t('route.presents')" :title="t('manage.presents_title')" :subtitle="t('manage.presents_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      :row-key="(r) => r.present_id"
      :search-keys="['present_id', 'description']"
      :can-write="canWrite"
      :create-fields="insertable ? createFields : null"
      :edit-fields="editable ? editFields : null"
      :on-create="onCreate"
      :on-edit="onEdit"
      :on-delete="deletable ? onDelete : null"
      :extra-actions="itemActions"
      :scroll-x="760"
    />
    <ItemsEditor
      v-model:show="itemsShow"
      :title="itemsTitle"
      :load-fn="loadItems"
      :save-fn="saveItems"
      :can-edit="editable"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import ItemsEditor from '@/components/ItemsEditor.vue'
import service from '@/plugins/axios'
import dayjs from '@/plugins/day'
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()
// The server's presents endpoints nominally want insert/delete powers, but
// those aren't defined in the DB — 'change' is the effective admin power.
const canWrite = user.has_power('change')
const insertable = canWrite
const editable = canWrite
const deletable = canWrite

const columns = [
  { title: 'Present ID', key: 'present_id', ellipsis: { tooltip: true } },
  { title: 'Expires', key: 'expire_ts', width: 180, render: (r) => (r.expire_ts ? dayjs(r.expire_ts).format('YYYY-MM-DD HH:mm') : '—') },
  { title: 'Description', key: 'description', ellipsis: { tooltip: true }, render: (r) => r.description || '—' },
]

const createFields = [
  { key: 'present_id', label: 'Present ID', type: 'text', required: true },
  { key: 'expire_ts', label: 'Expires', type: 'datetime', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
]
const editFields = [
  { key: 'present_id', label: 'Present ID', type: 'text', primary: true },
  { key: 'expire_ts', label: 'Expires', type: 'datetime' },
  { key: 'description', label: 'Description', type: 'textarea' },
]

const loadFn = async () => {
  const res = await service.get('/presents')
  return res.data
}
const onCreate = (model) =>
  service.post('/presents', {
    present_id: model.present_id,
    expire_ts: Number(model.expire_ts),
    description: model.description || '',
  })
const onEdit = (model, row) =>
  service.put('/presents/' + row.present_id, {
    expire_ts: Number(model.expire_ts),
    description: model.description || '',
  })
const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/presents/' + r.present_id)))

// ---- nested items ----
const itemsShow = ref(false)
const currentRow = ref(null)
const itemActions = [{ key: 'items', label: t('manage.items_action'), onClick: (row) => openItems(row) }]
const itemsTitle = computed(() => t('manage.items_title', { name: currentRow.value?.present_id || '' }))

const openItems = (row) => {
  currentRow.value = row
  itemsShow.value = true
}
const loadItems = async () => {
  const res = await service.get('/presents/' + currentRow.value.present_id + '/items')
  return res.data.map((x) => ({ type: x.type, id: x.id, amount: x.amount }))
}
const saveItems = (patch) => service.patch('/presents/' + currentRow.value.present_id + '/items', patch)
</script>
