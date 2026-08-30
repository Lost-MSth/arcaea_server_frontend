<template>
  <div>
    <PageHeader :eyebrow="t('route.characters')" :title="t('manage.characters_title')" :subtitle="t('manage.characters_subtitle')" />
    <CrudTable
      :columns="columns"
      :load-fn="loadFn"
      :row-key="(r) => r.character_id"
      :search-keys="['name', 'skill_id']"
      :can-write="canWrite"
      :edit-fields="canWrite ? editFields : null"
      :on-edit="onEdit"
      :extra-actions="coreActions"
      :scroll-x="760"
    />
    <ItemsEditor
      v-model:show="coresShow"
      :title="coresTitle"
      :load-fn="loadCores"
      :save-fn="saveCores"
      fixed-type="core"
      :can-edit="canWrite"
    />
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import PageHeader from '@/components/PageHeader.vue'
import CharIcon from '@/components/CharIcon.vue'
import CrudTable from '@/components/CrudTable.vue'
import ItemsEditor from '@/components/ItemsEditor.vue'
import service from '@/plugins/axios'
import { userStore } from '@/store/user'

const { t } = useI18n()
const user = userStore()
const canWrite = user.has_power('change')

const columns = computed(() => [
  { title: t('fields.id'), key: 'character_id', width: 70 },
  {
    title: t('fields.name'),
    key: 'name',
    ellipsis: { tooltip: true },
    render: (r) =>
      h('span', { style: 'display:inline-flex;align-items:center;gap:8px;min-width:0' }, [
        h(CharIcon, { charId: r.character_id, uncapped: !!r.is_uncapped, name: r.name, size: 30 }),
        h('span', { style: 'overflow:hidden;text-overflow:ellipsis' }, r.name),
      ]),
  },
  { title: t('fields.max_level'), key: 'max_level', width: 100, align: 'right' },
  { title: t('fields.skill'), key: 'skill_id', ellipsis: { tooltip: true }, render: (r) => r.skill_id || '—' },
  { title: t('fields.uncapped'), key: 'is_uncapped', width: 100, render: (r) => (r.is_uncapped ? t('common.yes') : t('common.no')) },
])

const editFields = computed(() => [
  { key: 'character_id', label: t('fields.character_id'), type: 'number', primary: true },
  { key: 'name', label: t('fields.name'), type: 'text', primary: true },
  { key: 'max_level', label: t('fields.max_level'), type: 'number' },
  { key: 'char_type', label: t('fields.char_type'), type: 'number' },
  { key: 'is_uncapped', label: t('fields.uncapped'), type: 'switch' },
  { key: 'skill_id', label: t('fields.skill'), type: 'text' },
  { key: 'skill_id_uncap', label: t('fields.skill_uncap'), type: 'text' },
  // Growth curve values at Lv1 / Lv20 / Lv30 (FRAG / PROG / OVERDRIVE are the
  // in-game terms; kept untranslated on purpose).
  { key: 'frag1', label: 'FRAG Lv1', type: 'number' },
  { key: 'prog1', label: 'PROG Lv1', type: 'number' },
  { key: 'overdrive1', label: 'OVER Lv1', type: 'number' },
  { key: 'frag20', label: 'FRAG Lv20', type: 'number' },
  { key: 'prog20', label: 'PROG Lv20', type: 'number' },
  { key: 'overdrive20', label: 'OVER Lv20', type: 'number' },
  { key: 'frag30', label: 'FRAG Lv30', type: 'number' },
  { key: 'prog30', label: 'PROG Lv30', type: 'number' },
  { key: 'overdrive30', label: 'OVER Lv30', type: 'number' },
])

const loadFn = async (force) => {
  const res = await service.cachedGet('/characters', null, { force })
  return res.data
}
const STAT_KEYS = ['frag1', 'prog1', 'overdrive1', 'frag20', 'prog20', 'overdrive20', 'frag30', 'prog30', 'overdrive30']

const onEdit = (model, row) => {
  const payload = {
    max_level: Number(model.max_level),
    char_type: Number(model.char_type),
    is_uncapped: model.is_uncapped ? 1 : 0,
    skill_id: model.skill_id || '',
    skill_id_uncap: model.skill_id_uncap || '',
  }
  STAT_KEYS.forEach((k) => {
    payload[k] = Number(model[k])
  })
  return service.put('/characters/' + row.character_id, payload)
}

// ---- awakening cores ----
const coresShow = ref(false)
const currentRow = ref(null)
const coreActions = [{ key: 'cores', label: t('manage.cores_action'), onClick: (row) => openCores(row) }]
const coresTitle = computed(() => t('manage.cores_title', { name: currentRow.value?.name || '' }))

const openCores = (row) => {
  currentRow.value = row
  coresShow.value = true
}
const loadCores = async () => {
  const res = await service.get('/characters/' + currentRow.value.character_id + '/cores')
  // cores use { core_type, amount }; normalize to the editor's { type, id, amount }
  return res.data.map((x) => ({ type: 'core', id: x.core_type, amount: x.amount }))
}
const saveCores = (patch) => service.patch('/characters/' + currentRow.value.character_id + '/cores', patch)
</script>
