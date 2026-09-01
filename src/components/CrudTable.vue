<template>
  <n-card class="crud-card" :bordered="true">
    <div class="toolbar">
      <n-input
        v-if="searchKeys.length"
        ref="filterRef"
        v-model:value="filter"
        :placeholder="t('common.filter')"
        clearable
        class="filter-input"
      >
        <template #clear-icon><AppIcon name="close" :size="14" /></template>
        <template #prefix><AppIcon name="search" :size="16" /></template>
        <template #suffix><kbd v-if="!filter" class="kbd hud">/</kbd></template>
      </n-input>
      <n-tag v-if="checkedKeys.length" type="primary" round closable @close="checkedKeys = []">
        {{ t('common.selected_n', { n: checkedKeys.length }) }}
      </n-tag>
      <div class="toolbar-spacer"></div>
      <n-button quaternary circle :title="t('common.export')" :disabled="!filteredRows.length" @click="exportCsv">
        <template #icon><AppIcon name="download" :size="18" /></template>
      </n-button>
      <n-button quaternary circle :title="t('common.refresh')" :loading="loading" @click="() => reload(true)">
        <template #icon><AppIcon name="refresh" :size="18" /></template>
      </n-button>
      <template v-if="canWrite">
        <n-button
          v-if="editFields"
          secondary
          :disabled="checkedKeys.length !== 1"
          @click="openEdit"
        >
          <template #icon><AppIcon name="edit" :size="16" /></template>
          {{ t('common.edit') }}
        </n-button>
        <n-button v-if="onDelete" type="error" secondary :disabled="!checkedKeys.length" @click="confirmDelete">
          <template #icon><AppIcon name="trash" :size="16" /></template>
          {{ t('common.delete') }}{{ checkedKeys.length ? ` (${checkedKeys.length})` : '' }}
        </n-button>
        <n-button v-if="createFields" type="primary" @click="openCreate">
          <template #icon><AppIcon name="add" :size="16" /></template>
          {{ t('common.new') }}
        </n-button>
      </template>
    </div>

    <n-data-table
      :columns="allColumns"
      :data="filteredRows"
      :row-key="rowKey"
      :loading="loading"
      :checked-row-keys="checkedKeys"
      :pagination="pagination"
      :scroll-x="scrollX"
      :row-props="rowProps"
      size="small"
      @update:checked-row-keys="(k) => (checkedKeys = k)"
    />

    <div class="table-foot hud">
      {{ t('common.total') }} {{ filteredRows.length }}
      <template v-if="checkedKeys.length"> · {{ checkedKeys.length }} {{ t('common.selected') }}</template>
    </div>

    <n-modal
      v-model:show="modalShow"
      preset="card"
      :title="modalMode === 'create' ? t('common.new') : t('common.edit')"
      class="crud-modal"
      :style="{ width: '480px', maxWidth: '94vw' }"
      :bordered="false"
    >
      <n-form ref="formRef" :model="model" label-placement="top">
        <div class="form-grid">
          <n-form-item
            v-for="f in modalFields"
            :key="f.key"
            :class="{ 'span-2': f.type === 'textarea' }"
            :label="f.label"
            :path="f.key"
            :rule="f.required ? { required: true, message: t('validate.required'), trigger: ['blur', 'change'], type: f.type === 'number' || f.type === 'datetime' ? 'number' : 'string' } : undefined"
          >
            <n-input-number
              v-if="f.type === 'number'"
              v-model:value="model[f.key]"
              :disabled="modalMode === 'edit' && f.primary"
              style="width: 100%"
            />
            <n-switch v-else-if="f.type === 'switch'" v-model:value="model[f.key]" />
            <n-date-picker
              v-else-if="f.type === 'datetime'"
              v-model:value="model[f.key]"
              type="datetime"
              clearable
              style="width: 100%"
            />
            <n-select
              v-else-if="f.type === 'select'"
              v-model:value="model[f.key]"
              :options="f.options"
              :disabled="modalMode === 'edit' && f.primary"
              filterable
              clearable
            />
            <n-input
              v-else
              v-model:value="model[f.key]"
              :type="f.type === 'textarea' ? 'textarea' : 'text'"
              :disabled="modalMode === 'edit' && f.primary"
              :placeholder="f.placeholder || ''"
            />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="modal-foot">
          <n-button @click="modalShow = false">{{ t('common.cancel') }}</n-button>
          <n-button type="primary" :loading="saving" @click="save">{{ t('common.save') }}</n-button>
        </div>
      </template>
    </n-modal>
  </n-card>
</template>

<script setup>
import { computed, h, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NInputNumber,
  NSwitch,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NTag,
  NDatePicker,
  useMessage,
  useDialog,
} from 'naive-ui'

import AppIcon from '@/components/AppIcon.vue'
import service from '@/plugins/axios'

const props = defineProps({
  columns: { type: Array, default: () => [] },
  loadFn: { type: Function, required: true },
  rowKey: { type: Function, required: true },
  searchKeys: { type: Array, default: () => [] },
  createFields: { type: Array, default: null },
  onCreate: { type: Function, default: null },
  editFields: { type: Array, default: null },
  onEdit: { type: Function, default: null },
  onDelete: { type: Function, default: null },
  canWrite: { type: Boolean, default: false },
  scrollX: { type: Number, default: undefined },
  // Per-row buttons, e.g. [{ key, label, onClick(row) }]. Rendered in a
  // trailing "Actions" column — used for nested-item editors.
  extraActions: { type: Array, default: () => [] },
  // Request-cache prefix this table's list lives under (e.g. '/songs').
  // Mutations update rows locally and invalidate it instead of refetching.
  cachePrefix: { type: String, default: '' },
})

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()

const rows = ref([])
const loading = ref(false)
const filter = ref('')
const filterRef = ref(null)
const checkedKeys = ref([])

// Remember the chosen page size per table (keyed by route path).
const PSIZE_KEY = 'psize:' + (typeof location !== 'undefined' ? location.hash.split('?')[0] : '')
const storedPageSize = (() => {
  try {
    const v = Number(localStorage.getItem(PSIZE_KEY))
    return [15, 30, 50, 100].includes(v) ? v : 15
  } catch (e) {
    return 15
  }
})()

// Controlled pagination: Naive treats a provided `pageSize` as controlled, so
// the size picker only works if we handle the update events ourselves.
const pagination = reactive({
  page: 1,
  pageSize: storedPageSize,
  showSizePicker: true,
  pageSizes: [15, 30, 50, 100],
  onUpdatePage: (p) => {
    pagination.page = p
  },
  onUpdatePageSize: (ps) => {
    pagination.pageSize = ps
    pagination.page = 1
    try {
      localStorage.setItem(PSIZE_KEY, String(ps))
    } catch (e) {
      /* ignore */
    }
  },
})

// Press `/` anywhere (outside inputs/modals) to focus the filter box.
const onGlobalKey = (e) => {
  if (e.key !== '/') return
  const tag = (e.target && e.target.tagName ? e.target.tagName : '').toLowerCase()
  if (['input', 'textarea', 'select'].includes(tag) || (e.target && e.target.isContentEditable)) return
  if (document.querySelector('.n-modal')) return
  e.preventDefault()
  filterRef.value?.focus()
}
onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))

const selectionColumn = { type: 'selection' }
const actionsColumn = computed(() => ({
  title: t('common.actions'),
  key: '__actions',
  width: Math.max(96, props.extraActions.length * 70 + 16),
  render: (row) =>
    h(
      'div',
      { style: 'display:flex;gap:6px' },
      props.extraActions
        .filter((a) => (typeof a.show === 'function' ? a.show(row) : true))
        .map((a) =>
          h(
            NButton,
            {
              size: 'tiny',
              quaternary: true,
              type: a.type || 'primary',
              disabled: typeof a.disabled === 'function' ? a.disabled(row) : false,
              onClick: () => a.onClick(row),
            },
            { default: () => a.label },
          ),
        ),
    ),
}))
// Generic client-side sorter: numbers numerically, booleans by truth, the
// rest by locale string compare. Every data column gets one (opt out with
// `sortable: false`); `multiple` priorities enable multi-column sorting.
const compareBy = (key) => (a, b) => {
  const x = a[key]
  const y = b[key]
  if (x == null && y == null) return 0
  if (x == null) return -1
  if (y == null) return 1
  if (typeof x === 'boolean' || typeof y === 'boolean') return Number(x) - Number(y)
  if (typeof x === 'number' && typeof y === 'number') return x - y
  return String(x).localeCompare(String(y))
}

const dataColumns = computed(() =>
  props.columns.map((col, i) =>
    col.key && col.sortable !== false && !col.sorter
      ? { ...col, sorter: { compare: compareBy(col.key), multiple: props.columns.length - i } }
      : col,
  ),
)

const allColumns = computed(() => {
  let cols = dataColumns.value
  if (props.canWrite && (props.onDelete || props.editFields)) {
    cols = [selectionColumn, ...cols]
  }
  if (props.extraActions.length) {
    cols = [...cols, actionsColumn.value]
  }
  return cols
})

const filteredRows = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q || !props.searchKeys.length) return rows.value
  return rows.value.filter((row) =>
    props.searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
  )
})

watch(filter, () => {
  pagination.page = 1
})

// `force` bypasses the page's request cache (manual refresh, after mutations).
const reload = async (force = false) => {
  loading.value = true
  checkedKeys.value = []
  try {
    const data = await props.loadFn(force === true)
    rows.value = Array.isArray(data) ? data : []
  } catch (e) {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => reload(false))

// ---- modal (create / edit) ----
const modalShow = ref(false)
const modalMode = ref('create')
const model = ref({})
const saving = ref(false)
const formRef = ref(null)
const editingRow = ref(null)

const modalFields = computed(() =>
  modalMode.value === 'create' ? props.createFields || [] : props.editFields || [],
)

const openCreate = () => {
  modalMode.value = 'create'
  const m = {}
  ;(props.createFields || []).forEach((f) => {
    if (f.default !== undefined) m[f.key] = f.default
    else if (f.type === 'number') m[f.key] = 0
    else if (f.type === 'switch') m[f.key] = false
    else if (f.type === 'datetime') m[f.key] = null
    else m[f.key] = ''
  })
  model.value = m
  modalShow.value = true
}

const openEdit = () => {
  const row = rows.value.find((r) => props.rowKey(r) === checkedKeys.value[0])
  if (!row) return
  modalMode.value = 'edit'
  editingRow.value = row
  const m = {}
  ;(props.editFields || []).forEach((f) => {
    let v = row[f.key] !== undefined ? row[f.key] : f.default !== undefined ? f.default : ''
    if (f.type === 'datetime' && !v) v = null
    m[f.key] = v
  })
  model.value = m
  modalShow.value = true
}

// ---- local apply ----
// Handlers may return the API response ({ code, data }) — the server echoes
// the updated object for every PUT/POST — or a ready-made row object.
const isApiRes = (r) => !!r && typeof r === 'object' && typeof r.code === 'number' && 'data' in r
const rowFrom = (r) => {
  if (isApiRes(r)) return r.data && typeof r.data === 'object' && !Array.isArray(r.data) ? r.data : null
  return r && typeof r === 'object' ? r : null
}
const norm = (f, v) => {
  if (f.type === 'number') return v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v)
  if (f.type === 'switch') return !!v
  if (f.type === 'datetime') return v ? Number(v) : null
  return v == null ? '' : String(v)
}
// Only fields whose value actually differs from the row are submitted.
const diffModel = () => {
  const row = editingRow.value
  const changed = {}
  ;(props.editFields || []).forEach((f) => {
    if (f.primary) return
    if (norm(f, model.value[f.key]) !== norm(f, row[f.key])) changed[f.key] = model.value[f.key]
  })
  return changed
}
const afterMutation = () => {
  checkedKeys.value = []
  if (props.cachePrefix) service.invalidateCache(props.cachePrefix)
}

const save = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    saving.value = true
    try {
      if (modalMode.value === 'create') {
        const r = await props.onCreate(model.value)
        const patch = rowFrom(r)
        rows.value.unshift(isApiRes(r) ? { ...model.value, ...(patch || {}) } : patch || { ...model.value })
        message.success(t('manage.created'))
      } else {
        const changed = diffModel()
        if (!Object.keys(changed).length) {
          message.info(t('manage.no_changes'))
          modalShow.value = false
          return
        }
        const r = await props.onEdit(model.value, editingRow.value, changed)
        const merged = { ...changed, ...(rowFrom(r) || {}) }
        delete merged.password
        Object.assign(editingRow.value, merged)
        message.success(t('manage.updated'))
      }
      modalShow.value = false
      afterMutation()
    } catch (e) {
      /* interceptor already surfaced the error */
    } finally {
      saving.value = false
    }
  })
}

// Double-click a row to edit it directly (when editing is available).
const rowProps = (row) => {
  if (!(props.canWrite && props.editFields && props.onEdit)) return {}
  return {
    // Suppress the browser's double-click text selection without disabling
    // normal single-click text selection.
    onMousedown: (e) => {
      if (e.detail > 1) e.preventDefault()
    },
    onDblclick: () => {
      checkedKeys.value = [props.rowKey(row)]
      openEdit()
    },
  }
}

// Export the currently filtered rows (raw values) as a UTF-8 BOM CSV.
const exportCsv = () => {
  const cols = props.columns.filter((c) => c.key)
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const lines = [cols.map((c) => esc(typeof c.title === 'string' ? c.title : c.key)).join(',')]
  filteredRows.value.forEach((r) => lines.push(cols.map((c) => esc(r[c.key])).join(',')))
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'console-export-' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

const confirmDelete = () => {
  const selected = rows.value.filter((r) => checkedKeys.value.includes(props.rowKey(r)))
  dialog.warning({
    title: t('common.delete'),
    content: t('manage.delete_confirm', { n: selected.length }),
    positiveText: t('common.ok'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await props.onDelete(selected)
        message.success(t('manage.deleted'))
        const gone = new Set(selected.map(props.rowKey))
        rows.value = rows.value.filter((r) => !gone.has(props.rowKey(r)))
        afterMutation()
      } catch (e) {
        // Partial failure possible — resync from the server.
        await reload(true)
      }
    },
  })
}

// Rows created outside the modal (e.g. bulk generators) are inserted locally.
const insertRows = (list) => {
  if (Array.isArray(list) && list.length) rows.value.unshift(...list)
  afterMutation()
}

defineExpose({ reload, insertRows })
</script>

<style scoped>
.crud-card {
  border-radius: 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.filter-input {
  max-width: 260px;
}
.kbd {
  font-size: 10px;
  line-height: 1;
  padding: 2px 5px;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: var(--surface-2);
}
.toolbar-spacer {
  flex: 1;
}
.table-foot {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px 16px;
}
.form-grid .span-2 {
  grid-column: 1 / -1;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
