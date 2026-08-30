<template>
  <div class="user-card glass">
    <div class="head">
      <div class="ptt-ring">
        <span class="num hud">{{ pttText }}</span>
      </div>
      <div class="meta">
        <div class="name-row">
          <CharIcon
            :char-id="charId"
            :uncapped="!!(user.is_char_uncapped ?? user.character?.is_uncapped)"
            :uncapped-override="!!(user.is_char_uncapped_override ?? user.character?.is_uncapped_override)"
            :name="user.name"
            :size="38"
          />
          <span class="nm font-display">{{ user.name }}</span>
          <n-tag v-if="user.is_banned" type="error" size="small" round :bordered="false">
            {{ t('user.banned') }}
          </n-tag>
        </div>
        <div class="tags">
          <span class="tag hud">{{ t('user.user_id') }} {{ user.user_id }}</span>
          <span class="tag hud">{{ t('user.user_code') }} {{ user.user_code }}</span>
        </div>
        <div class="tags">
          <span class="tag hud">{{ t('user.ticket') }} · {{ user.ticket ?? '—' }}</span>
          <span v-if="joinText" class="tag hud">{{ t('user.join_date') }} {{ joinText }}</span>
        </div>
      </div>
    </div>

    <div class="mini-stats">
      <div class="mini">
        <div class="k">{{ t('user.best30') }}</div>
        <div class="v hud">{{ b30Text }}</div>
      </div>
      <div class="mini">
        <div class="k">{{ t('user.recent10') }}</div>
        <div class="v hud">{{ r10Text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NTag } from 'naive-ui'

import CharIcon from '@/components/CharIcon.vue'
import dayjs from '@/plugins/day'

const props = defineProps({
  user: { type: Object, required: true },
})

const { t } = useI18n()

// Accepts both shapes: flat row fields (character_id / is_char_uncapped, as
// returned by /users and /users/<id>/brief) or the store's nested character.
const charId = computed(() => props.user.character_id ?? props.user.character?.character_id ?? null)

const pttText = computed(() => {
  const r = props.user.rating_ptt ?? props.user.rating
  if (r === null || r === undefined || r < 0) return '—'
  return Number(r).toFixed(2)
})
const b30Text = computed(() =>
  props.user.b30_ptt != null ? Number(props.user.b30_ptt).toFixed(2) : '—',
)
const r10Text = computed(() =>
  props.user.r10_ptt != null ? Number(props.user.r10_ptt).toFixed(2) : '—',
)
const joinText = computed(() =>
  props.user.join_date ? dayjs(props.user.join_date).format('YYYY-MM-DD') : '',
)
</script>

<style scoped>
.user-card {
  padding: 20px;
}
.head {
  display: flex;
  align-items: center;
  gap: 18px;
}
.ptt-ring {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  flex-shrink: 0;
  background: conic-gradient(from 220deg, var(--accent), var(--accent-2), var(--accent-3), var(--accent));
  box-shadow: 0 10px 30px -12px var(--ring);
}
.ptt-ring::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: var(--surface-solid);
}
.ptt-ring .num {
  position: relative;
  font-weight: 700;
  font-size: 24px;
  color: var(--text);
}
.meta {
  min-width: 0;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.nm {
  font-weight: 700;
  font-size: 21px;
}
.tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.tag {
  font-size: 11px;
  color: var(--text-2);
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.mini-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}
.mini {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.mini .k {
  font-size: 12px;
  color: var(--text-muted);
}
.mini .v {
  font-weight: 700;
  font-size: 22px;
  margin-top: 3px;
}
</style>
