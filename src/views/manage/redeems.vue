<template>
  <div>
    <PageHeader :eyebrow="t('route.redeems')" :title="t('manage.redeems_title')" :subtitle="t('manage.redeems_subtitle')" />

    <div v-if="canWrite" class="bulk-bar">
      <n-button secondary size="small" @click="bulkShow = true">
        <template #icon><AppIcon name="add" :size="15" /></template>
        {{ t('redeem.bulk_title') }}
      </n-button>
    </div>

    <CrudTable
      ref="tableRef"
      :columns="columns"
      :load-fn="loadFn"
      cache-prefix="/redeems"
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

    <n-modal
      v-model:show="bulkShow"
      preset="card"
      :title="t('redeem.bulk_title')"
      :style="{ width: '420px', maxWidth: '94vw' }"
      :bordered="false"
    >
      <n-form label-placement="top">
        <n-form-item :label="t('redeem.count')" :show-feedback="false">
          <n-input-number v-model:value="bulk.count" :min="1" :max="200" :precision="0" style="width: 100%" />
        </n-form-item>
        <n-form-item :label="t('redeem.code_length')" :show-feedback="false">
          <n-input-number v-model:value="bulk.length" :min="10" :max="20" :precision="0" style="width: 100%" />
        </n-form-item>
        <n-form-item :label="t('redeem.prefix')" :show-feedback="false">
          <n-input v-model:value="bulk.prefix" :placeholder="t('redeem.prefix_hint')" />
        </n-form-item>
        <n-form-item :label="t('fields.type')" :show-feedback="false">
          <n-input-number v-model:value="bulk.type" :precision="0" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="bulk-foot">
          <n-button @click="bulkShow = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="bulkRunning" @click="runBulk">{{ t('redeem.generate') }}</n-button>
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="resultShow"
      preset="card"
      :title="t('redeem.generated_codes')"
      :style="{ width: '420px', maxWidth: '94vw' }"
      :bordered="false"
    >
      <n-input
        class="codes-area"
        type="textarea"
        :value="codesText"
        readonly
        :autosize="{ minRows: 4, maxRows: 12 }"
      />
      <template #footer>
        <div class="bulk-foot">
          <n-button @click="resultShow = false">{{ t('common.close') }}</n-button>
          <n-button type="primary" @click="copyCodes">
            <template #icon><AppIcon name="copy" :size="15" /></template>
            {{ t('common.copy') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NModal, NForm, NFormItem, NInput, NInputNumber, useMessage } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import ItemsEditor from '@/components/ItemsEditor.vue'
import AppIcon from '@/components/AppIcon.vue'
import service from '@/plugins/axios'
import { userStore } from '@/store/user'

const { t } = useI18n()
const message = useMessage()
const user = userStore()
// Same as presents: insert/delete powers aren't defined server-side, so gate on
// 'change' (the effective admin power).
const canWrite = user.has_power('change')
const insertable = canWrite
const editable = canWrite
const deletable = canWrite

const tableRef = ref(null)

const columns = computed(() => [
  { title: t('fields.code'), key: 'code', ellipsis: { tooltip: true } },
  { title: t('fields.type'), key: 'type', width: 120, align: 'right' },
])

const createFields = computed(() => [
  { key: 'code', label: t('fields.code'), type: 'text', required: true },
  { key: 'type', label: t('fields.type'), type: 'number', default: 0 },
])
const editFields = computed(() => [
  { key: 'code', label: t('fields.code'), type: 'text', primary: true },
  { key: 'type', label: t('fields.type'), type: 'number' },
])

const loadFn = async (force) => {
  const res = await service.cachedGet('/redeems', null, { force })
  return res.data
}
const onCreate = (model) => service.post('/redeems', { code: model.code, type: Number(model.type) })
const onEdit = (model, row, changed) => service.put('/redeems/' + row.code, { type: Number(changed.type) })
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

// ---- bulk generation ----
const bulkShow = ref(false)
const bulkRunning = ref(false)
const bulk = reactive({ count: 10, length: 12, prefix: '', type: 0 })

// Unambiguous charset (no 0/O/1/I).
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const randCode = (len) => {
  const a = new Uint32Array(len)
  crypto.getRandomValues(a)
  let s = ''
  for (let i = 0; i < len; i++) s += CHARS[a[i] % CHARS.length]
  return s
}

const runBulk = async () => {
  const prefix = (bulk.prefix || '').trim().toUpperCase()
  if (prefix.length >= bulk.length) {
    message.warning(t('redeem.prefix_too_long'))
    return
  }
  bulkRunning.value = true
  let ok = 0
  let fail = 0
  const okCodes = []
  const okRows = []
  for (let i = 0; i < bulk.count; i++) {
    const code = prefix + randCode(bulk.length - prefix.length)
    try {
      const res = await service.post('/redeems', { code, type: Number(bulk.type) }, { silent: true })
      ok++
      okCodes.push(code)
      if (res.data && typeof res.data === 'object') okRows.push(res.data)
    } catch (e) {
      fail++
    }
  }
  bulkRunning.value = false
  bulkShow.value = false
  message.success(t('redeem.result', { ok, fail }))
  if (okRows.length) tableRef.value?.insertRows(okRows)
  if (okCodes.length) {
    genCodes.value = okCodes
    resultShow.value = true
  }
}

// ---- generated-codes result ----
const genCodes = ref([])
const resultShow = ref(false)
const codesText = computed(() => genCodes.value.join('\n'))

const copyCodes = async () => {
  try {
    await navigator.clipboard.writeText(codesText.value)
    message.success(t('common.copied'))
  } catch (e) {
    // Clipboard API can be unavailable (http origins) — fall back to selection.
    const ta = document.querySelector('.codes-area textarea')
    if (ta) {
      ta.select()
      document.execCommand('copy')
      message.success(t('common.copied'))
    }
  }
}
</script>

<style scoped>
.bulk-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.bulk-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
