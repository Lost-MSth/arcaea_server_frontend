<template>
  <div>
    <PageHeader :eyebrow="t('route.operations')" :title="t('ops.title')" :subtitle="t('ops.subtitle')" />

    <n-spin :show="loading">
      <div class="op-grid">
        <button v-for="op in ops" :key="op.name" class="op glass" @click="openOp(op)">
          <span class="op-ic" :class="{ danger: op.danger }">
            <AppIcon :name="op.icon" :size="18" />
          </span>
          <span class="op-text">
            <span class="t">{{ opTitle(op.name) }}</span>
            <span class="s">{{ opDesc(op.name) }}</span>
          </span>
        </button>
      </div>
      <div v-if="!ops.length && !loading" class="empty hud">{{ t('common.no_data') }}</div>
    </n-spin>

    <n-modal v-model:show="show" preset="card" :title="opTitle(active?.name)" :style="{ width: '460px', maxWidth: '94vw' }" :bordered="false">
      <p class="modal-desc">{{ opDesc(active?.name) }}</p>
      <n-alert v-if="active?.danger" type="warning" :bordered="false" style="margin-bottom: 14px">
        {{ t('ops.run_confirm', { name: opTitle(active?.name) }) }}
      </n-alert>
      <n-form-item v-if="active?.needsUser || active?.requiresUser" :label="t('ops.user_id_optional')" :show-feedback="false">
        <n-input-number v-model:value="userId" style="width: 100%" :placeholder="active?.requiresUser ? 'required' : ''" />
      </n-form-item>
      <template v-if="active?.unlockParams">
        <n-form-item :label="t('ops.method')" :show-feedback="false" style="margin-top: 10px">
          <n-select v-model:value="unlockMethod" :options="methodOptions" />
        </n-form-item>
        <n-form-item :label="t('ops.item_types')" :show-feedback="false" style="margin-top: 10px">
          <n-select v-model:value="unlockTypes" multiple :options="unlockTypeOptions" />
        </n-form-item>
      </template>
      <template #footer>
        <div class="modal-foot">
          <n-button @click="show = false">{{ t('common.cancel') }}</n-button>
          <n-button :type="active?.danger ? 'error' : 'primary'" :loading="running" @click="run">
            {{ t('common.run') }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSpin, NModal, NButton, NAlert, NFormItem, NInputNumber, NSelect, useDialog, useMessage } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import service from '@/plugins/axios'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()

// Metadata for the known operations. Any op the server reports that isn't here
// still renders with its raw name.
const META = {
  refresh_all_score_rating: { icon: 'refresh' },
  refresh_song_file_cache: { icon: 'music' },
  refresh_content_bundle_cache: { icon: 'cube' },
  refresh_world_map_cache: { icon: 'globe' },
  save_update_score: { icon: 'server', needsUser: true },
  unlock_user_item: { icon: 'cube', needsUser: true, unlockParams: true },
  delete_user_score: { icon: 'trash', requiresUser: true, danger: true },
  delete_one_user: { icon: 'trash', requiresUser: true, danger: true },
}

const loading = ref(false)
const ops = ref([])
const show = ref(false)
const active = ref(null)
const userId = ref(null)
const running = ref(false)

const opTitle = (name) => (name ? t('ops.' + name) : '')
const opDesc = (name) => (name ? t('ops.' + name + '_desc') : '')

const unlockMethod = ref('unlock')
const unlockTypes = ref(['single', 'pack'])
const methodOptions = computed(() => [
  { label: t('ops.method_unlock'), value: 'unlock' },
  { label: t('ops.method_lock'), value: 'lock' },
])
const unlockTypeOptions = ['single', 'pack', 'world_song', 'course_banner', 'world_unlock'].map(
  (v) => ({ label: v, value: v }),
)

const openOp = (op) => {
  active.value = op
  userId.value = null
  unlockMethod.value = 'unlock'
  unlockTypes.value = ['single', 'pack']
  show.value = true
}

const run = async () => {
  if (active.value.requiresUser && !userId.value) {
    message.warning(t('validate.required'))
    return
  }

  const exec = async () => {
    running.value = true
    const body = {}
    if (userId.value) body.user_id = Number(userId.value)
    if (active.value.unlockParams) {
      body.method = unlockMethod.value
      body.item_types = unlockTypes.value.length ? unlockTypes.value : ['single', 'pack']
    }
    try {
      await service.post('/system/operations/' + active.value.name, body)
      message.success(t('ops.done'))
      show.value = false
    } catch (e) {
      /* surfaced */
    } finally {
      running.value = false
    }
  }

  // Second confirmation for destructive ops, and for "no user id = ALL users".
  if (active.value.danger) {
    dialog.warning({
      title: t('common.confirm'),
      content: t('ops.danger_run_confirm', { name: opTitle(active.value.name) }),
      positiveText: t('common.ok'),
      negativeText: t('common.cancel'),
      onPositiveClick: exec,
    })
    return
  }
  if ((active.value.needsUser || active.value.unlockParams) && !userId.value) {
    dialog.warning({
      title: t('common.confirm'),
      content: t('ops.all_users_confirm'),
      positiveText: t('common.ok'),
      negativeText: t('common.cancel'),
      onPositiveClick: exec,
    })
    return
  }
  await exec()
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await service.get('/system/operations')
    ops.value = (res.data || []).map((name) => ({ name, icon: 'settings', ...(META[name] || {}) }))
  } catch (e) {
    ops.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.op-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.op {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 16px;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.16s,
    border-color 0.16s;
  border: 1px solid var(--border);
}
.op:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
}
.op-ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent);
  flex-shrink: 0;
}
.op-ic.danger {
  background: color-mix(in srgb, var(--crit, #f2607a) 16%, transparent);
  color: #f2607a;
}
.op-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.op-text .t {
  font-weight: 600;
  font-size: 13.5px;
  color: var(--text);
}
.op-text .s {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}
.modal-desc {
  color: var(--text-2);
  font-size: 13.5px;
  margin: 0 0 14px;
}
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.empty {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
@media (max-width: 640px) {
  .op-grid {
    grid-template-columns: 1fr;
  }
}
</style>
