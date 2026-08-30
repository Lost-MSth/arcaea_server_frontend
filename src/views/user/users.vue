<template>
  <div>
    <PageHeader :eyebrow="t('route.users')" :title="t('user.manage_title')" :subtitle="t('user.manage_subtitle')" />

    <CrudTable
      ref="tableRef"
      :columns="columns"
      :load-fn="loadFn"
      :row-key="(r) => r.user_id"
      :search-keys="['name', 'user_code', 'user_id']"
      :can-write="canWrite"
      :create-fields="canWrite ? createFields : null"
      :edit-fields="canWrite ? editFields : null"
      :on-create="onCreate"
      :on-edit="onEdit"
      :extra-actions="rowActions"
      :scroll-x="860"
    />

    <template v-if="target">
      <div class="detail-head">
        <h3 class="font-display">{{ target.name }}</h3>
        <n-button quaternary size="small" @click="target = null">
          <template #icon><AppIcon name="close" :size="15" /></template>
          {{ t('common.close') }}
        </n-button>
      </div>
      <n-spin :show="detailLoading">
        <div class="top-grid">
          <UserCard :user="target" />
          <div class="chart-card glass">
            <h3 class="font-display chart-title">{{ t('user.rating_history') }}</h3>
            <RatingChart :points="ratingPoints" :caption="t('user.potential')" :empty-text="t('common.no_data')" />
          </div>
        </div>
        <div class="b30-head">
          <h4 class="font-display">{{ t('user.best30') }}</h4>
          <span v-if="target.b30_ptt != null" class="hud avg">
            {{ t('user.b30_ptt') }} · {{ Number(target.b30_ptt).toFixed(2) }}
          </span>
        </div>
        <div v-if="target.b30_scores && target.b30_scores.length" class="b30-grid">
          <ScoreCard v-for="(s, i) in target.b30_scores" :key="i" :score="s" :rank="i + 1" />
        </div>
        <div v-else class="empty glass hud">{{ t('common.no_data') }}</div>
      </n-spin>
    </template>
  </div>
</template>

<script setup>
import { computed, h, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NInput, NSpin, NTag, useDialog, useMessage } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import CrudTable from '@/components/CrudTable.vue'
import UserCard from '@/components/UserCard.vue'
import ScoreCard from '@/components/ScoreCard.vue'
import RatingChart from '@/components/RatingChart.vue'
import AppIcon from '@/components/AppIcon.vue'
import service from '@/plugins/axios'
import dayjs from '@/plugins/day'
import { userStore } from '@/store/user'

const { t } = useI18n()
const dialog = useDialog()
const message = useMessage()
const user = userStore()
const canWrite = user.has_power('change')

const columns = computed(() => [
  { title: t('fields.id'), key: 'user_id', width: 100 },
  {
    title: t('fields.name'),
    key: 'name',
    ellipsis: { tooltip: true },
    // `is_banned` is rendered when the server exposes it in /users (optional
    // server enhancement — see SERVER_CHANGES.md §3.3).
    render: (r) =>
      r.is_banned
        ? h('span', { style: 'display:inline-flex;align-items:center;gap:8px' }, [
            r.name,
            h(NTag, { size: 'small', type: 'error', bordered: false }, { default: () => t('user.banned') }),
          ])
        : r.name,
  },
  { title: t('fields.user_code'), key: 'user_code', width: 130, render: (r) => h('span', { class: 'hud' }, r.user_code) },
  { title: t('fields.ptt'), key: 'rating_ptt', width: 90, align: 'right', render: (r) => Number(r.rating_ptt ?? 0).toFixed(2) },
  { title: t('fields.ticket'), key: 'ticket', width: 110, align: 'right' },
  {
    title: t('fields.joined'),
    key: 'join_date',
    width: 130,
    render: (r) => (r.join_date ? dayjs(r.join_date).format('YYYY-MM-DD') : '—'),
  },
])

const createFields = computed(() => [
  { key: 'name', label: t('fields.name'), type: 'text', required: true },
  { key: 'password', label: t('fields.password'), type: 'text', required: true },
  { key: 'email', label: t('fields.email'), type: 'text', required: true },
])

const editFields = computed(() => [
  { key: 'user_id', label: t('fields.user_id'), type: 'number', primary: true },
  { key: 'name', label: t('fields.name'), type: 'text', placeholder: t('user.keep_hint') },
  { key: 'user_code', label: t('fields.user_code'), type: 'text', placeholder: t('user.keep_hint') },
  { key: 'ticket', label: t('fields.ticket'), type: 'number' },
  { key: 'password', label: t('fields.password'), type: 'text', placeholder: t('user.keep_hint') },
  { key: 'email', label: t('fields.email'), type: 'text', placeholder: t('user.keep_hint') },
])

const loadFn = async (force) => {
  const res = await service.cachedGet('/users', null, { force })
  return res.data
}

const onCreate = (model) =>
  service.post('/users', { name: model.name, password: model.password, email: model.email })

// Send ONLY fields that actually changed: the server's uniqueness checks for
// name/user_code don't exclude the user themselves, so re-sending an unchanged
// value fails with "Username exists" / "User code exists". Blank password/email
// mean "keep unchanged" (an empty password would BAN — that's the Ban action).
const onEdit = (model, row) => {
  const payload = {}
  if (model.name && model.name !== row.name) payload.name = model.name
  if (model.user_code && model.user_code !== row.user_code) payload.user_code = model.user_code
  if (Number(model.ticket) !== Number(row.ticket)) payload.ticket = Number(model.ticket)
  if (model.password) payload.password = model.password
  if (model.email) payload.email = model.email
  if (!Object.keys(payload).length) return Promise.resolve({ code: 0 })
  return service.put('/users/' + row.user_id, payload)
}

const tableRef = ref(null)

const rowActions = computed(() => {
  const acts = [{ key: 'detail', label: t('user.detail'), onClick: openDetail }]
  if (canWrite) {
    // Ban ⇄ Unban swap per row when the server exposes `is_banned`; on older
    // servers the field is absent and only Ban shows (previous behavior).
    acts.push({
      key: 'ban',
      label: t('user.ban'),
      type: 'error',
      show: (row) => row.is_banned !== true,
      onClick: confirmBan,
    })
    acts.push({
      key: 'unban',
      label: t('user.unban'),
      type: 'success',
      show: (row) => row.is_banned === true,
      onClick: confirmUnban,
    })
  }
  return acts
})

// ---- detail (Best 30 + rating history) ----
const target = ref(null)
const ratingPoints = ref([])
const detailLoading = ref(false)

const openDetail = async (row) => {
  target.value = { ...row, b30_ptt: null, b30_scores: [] }
  ratingPoints.value = []
  detailLoading.value = true
  nextTick(() => document.querySelector('.detail-head')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  const [b30, rating] = await Promise.allSettled([
    service.get(`/users/${row.user_id}/b30`, { silent: true }),
    service._get(`/users/${row.user_id}/rating`, { duration: 90 }, { silent: true }),
  ])
  if (b30.status === 'fulfilled') {
    target.value.b30_ptt = b30.value.data.b30_ptt
    target.value.b30_scores = b30.value.data.data
  }
  if (rating.status === 'fulfilled') {
    const d = (rating.value.data.data || []).slice().sort((a, b) => a.time - b.time)
    ratingPoints.value = d.map((x) => x.rating_ptt)
  }
  detailLoading.value = false
}

const confirmBan = (row) => {
  if (row.user_id === user.user_id) {
    message.warning(t('user.ban_self'))
    return
  }
  dialog.warning({
    title: t('user.ban'),
    content: t('user.ban_confirm', { name: row.name }),
    positiveText: t('common.ok'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      try {
        await service.put('/users/' + row.user_id, { password: '' })
        message.success(t('user.banned_done'))
        tableRef.value?.reload(true)
      } catch (e) {
        /* surfaced by interceptor */
      }
    },
  })
}

// Unban = set a new password (banning cleared it).
const confirmUnban = (row) => {
  const pwd = ref('')
  dialog.create({
    title: t('user.unban'),
    content: () =>
      h('div', { style: 'display:flex;flex-direction:column;gap:10px;margin-top:6px' }, [
        h('span', { style: 'font-size:13px' }, t('user.unban_hint', { name: row.name })),
        h(NInput, {
          value: pwd.value,
          type: 'password',
          showPasswordOn: 'click',
          placeholder: t('fields.password') + ' (8-32)',
          'onUpdate:value': (v) => (pwd.value = v),
        }),
      ]),
    positiveText: t('common.ok'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      if (pwd.value.length < 8 || pwd.value.length > 32) {
        message.warning(t('user.pwd_len'))
        return false // keep the dialog open
      }
      try {
        await service.put('/users/' + row.user_id, { password: pwd.value })
        message.success(t('user.unban_done'))
        tableRef.value?.reload(true)
      } catch (e) {
        /* surfaced by interceptor */
      }
    },
  })
}
</script>

<style scoped>
.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 24px 0 12px;
}
.detail-head h3 {
  font-size: 18px;
  font-weight: 600;
}
.top-grid {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 16px;
  margin-bottom: 20px;
}
.chart-card {
  padding: 18px 20px;
}
.chart-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}
.b30-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.b30-head h4 {
  font-size: 15px;
  font-weight: 600;
}
.avg {
  font-size: 12px;
  color: var(--text-muted);
}
.b30-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.empty {
  padding: 36px;
  text-align: center;
  color: var(--text-muted);
}
@media (max-width: 900px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
  .b30-grid {
    grid-template-columns: 1fr;
  }
}
</style>
