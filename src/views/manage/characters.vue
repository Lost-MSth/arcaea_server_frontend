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

const columns = [
  { title: 'ID', key: 'character_id', width: 70 },
  { title: 'Name', key: 'name', ellipsis: { tooltip: true } },
  { title: 'Max Lv', key: 'max_level', width: 90 },
  { title: 'Skill', key: 'skill_id', ellipsis: { tooltip: true }, render: (r) => r.skill_id || '—' },
  { title: 'Uncapped', key: 'is_uncapped', width: 100, render: (r) => (r.is_uncapped ? t('common.yes') : t('common.no')) },
]

const editFields = [
  { key: 'character_id', label: 'Character ID', type: 'number', primary: true },
  { key: 'name', label: 'Name', type: 'text', primary: true },
  { key: 'max_level', label: 'Max level', type: 'number' },
  { key: 'char_type', label: 'Char type', type: 'number' },
  { key: 'is_uncapped', label: 'Uncapped', type: 'switch' },
  { key: 'skill_id', label: 'Skill ID', type: 'text' },
  { key: 'skill_id_uncap', label: 'Skill ID (uncap)', type: 'text' },
]

const loadFn = async () => {
  const res = await service.get('/characters')
  return res.data
}
const onEdit = (model, row) =>
  service.put('/characters/' + row.character_id, {
    max_level: Number(model.max_level),
    char_type: Number(model.char_type),
    is_uncapped: model.is_uncapped ? 1 : 0,
    skill_id: model.skill_id || '',
    skill_id_uncap: model.skill_id_uncap || '',
  })

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
