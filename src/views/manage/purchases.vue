<template>
  <div>
    <PageHeader :eyebrow="t('route.purchases')" :title="t('manage.purchases_title')" :subtitle="t('manage.purchases_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      cache-prefix="/purchases"
      :row-key="(r) => r.name"
      :search-keys="['name', 'discount_reason']"
      :can-write="canWrite"
      :create-fields="canWrite ? createFields : null"
      :edit-fields="canWrite ? editFields : null"
      :on-create="onCreate"
      :on-edit="onEdit"
      :on-delete="onDelete"
      :extra-actions="itemActions"
      :scroll-x="760"
    />
    <ItemsEditor
      v-model:show="itemsShow"
      :title="itemsTitle"
      :load-fn="loadItems"
      :save-fn="saveItems"
      :can-edit="canWrite"
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
const canWrite = user.has_power('change')

const columns = computed(() => [
  { title: t('fields.name'), key: 'name', ellipsis: { tooltip: true } },
  { title: t('fields.price'), key: 'price', width: 110, align: 'right' },
  { title: t('fields.orig_price'), key: 'orig_price', width: 120, align: 'right' },
  { title: t('fields.discount'), key: 'discount_reason', width: 140, render: (r) => r.discount_reason || '—' },
])

const createFields = computed(() => [
  { key: 'purchase_name', label: t('fields.purchase_name'), type: 'text', required: true },
  { key: 'orig_price', label: t('fields.orig_price'), type: 'number', default: 0, required: true },
  { key: 'price', label: t('fields.price'), type: 'number', default: 0 },
  { key: 'discount_reason', label: t('fields.discount_reason'), type: 'text' },
  { key: 'discount_from', label: t('fields.discount_from'), type: 'datetime' },
  { key: 'discount_to', label: t('fields.discount_to'), type: 'datetime' },
])
const editFields = computed(() => [
  { key: 'name', label: t('fields.name'), type: 'text', primary: true },
  { key: 'orig_price', label: t('fields.orig_price'), type: 'number' },
  { key: 'price', label: t('fields.price'), type: 'number' },
  { key: 'discount_reason', label: t('fields.discount_reason'), type: 'text' },
  { key: 'discount_from', label: t('fields.discount_from'), type: 'datetime' },
  { key: 'discount_to', label: t('fields.discount_to'), type: 'datetime' },
])

const loadFn = async (force) => {
  const res = await service.cachedGet('/purchases', null, { force })
  return res.data
}

const onCreate = (model) => {
  const payload = { purchase_name: model.purchase_name, orig_price: Number(model.orig_price) }
  if (Number(model.price) > 0) payload.price = Number(model.price)
  if (model.discount_reason) payload.discount_reason = model.discount_reason
  if (model.discount_from) payload.discount_from = Number(model.discount_from)
  if (model.discount_to) payload.discount_to = Number(model.discount_to)
  return service.post('/purchases', payload)
}
const onEdit = (model, row, changed) => {
  const payload = {}
  Object.entries(changed).forEach(([k, v]) => {
    if (k === 'orig_price' || k === 'price') payload[k] = Number(v)
    else if (k === 'discount_reason') payload[k] = v || ''
    // -1 = no discount window (server convention)
    else if (k === 'discount_from' || k === 'discount_to') payload[k] = v ? Number(v) : -1
  })
  return service.put('/purchases/' + row.name, payload)
}
const onDelete = (rows) => Promise.all(rows.map((r) => service.delete('/purchases/' + r.name)))

// ---- nested items ----
const itemsShow = ref(false)
const currentRow = ref(null)
const itemActions = [{ key: 'items', label: t('manage.items_action'), onClick: (row) => openItems(row) }]
const itemsTitle = computed(() => t('manage.items_title', { name: currentRow.value?.name || '' }))

const openItems = (row) => {
  currentRow.value = row
  itemsShow.value = true
}
const loadItems = async () => {
  const res = await service.get('/purchases/' + currentRow.value.name + '/items')
  return res.data.map((x) => ({ type: x.type, id: x.id, amount: x.amount }))
}
const saveItems = (patch) => service.patch('/purchases/' + currentRow.value.name + '/items', patch)
</script>
