<template>
  <div>
    <PageHeader :eyebrow="t('route.redeems')" :title="t('manage.redeems_title')" :subtitle="t('manage.redeems_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      :row-key="(r) => r.code"
      :search-keys="['code']"
      :can-write="canWrite"
      :create-fields="insertable ? createFields : null"
      :edit-fields="editable ? editFields : null"
      :on-create="onCreate"
      :on-edit="onEdit"
      :on-delete="deletable ? onDelete : null"
      :extra-actions="itemActions"
      :scroll-x="560"
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
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()
// Same as presents: insert/delete powers aren't defined server-side, so gate on
// 'change' (the effective admin power).
const canWrite = user.has_power('change')
const insertable = canWrite
const editable = canWrite
const deletable = canWrite

const columns = [
  { title: 'Code', key: 'code', ellipsis: { tooltip: true } },
  { title: 'Type', key: 'type', width: 120 },
]

const createFields = [
  { key: 'code', label: 'Code', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'number', default: 0 },
]
const editFields = [
  { key: 'code', label: 'Code', type: 'text', primary: true },
  { key: 'type', label: 'Type', type: 'number' },
]

const loadFn = async () => {
  const res = await service.get('/redeems')
  return res.data
}
const onCreate = (model) => service.post('/redeems', { code: model.code, type: Number(model.type) })
const onEdit = (model, row) => service.put('/redeems/' + row.code, { type: Number(model.type) })
const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/redeems/' + r.code)))

// ---- nested items ----
const itemsShow = ref(false)
const currentRow = ref(null)
const itemActions = [{ key: 'items', label: t('manage.items_action'), onClick: (row) => openItems(row) }]
const itemsTitle = computed(() => t('manage.items_title', { name: currentRow.value?.code || '' }))

const openItems = (row) => {
  currentRow.value = row
  itemsShow.value = true
}
const loadItems = async () => {
  const res = await service.get('/redeems/' + currentRow.value.code + '/items')
  return res.data.map((x) => ({ type: x.type, id: x.id, amount: x.amount }))
}
const saveItems = (patch) => service.patch('/redeems/' + currentRow.value.code + '/items', patch)
</script>
