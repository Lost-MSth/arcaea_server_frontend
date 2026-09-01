<template>
  <div class="user-card glass">
    <div class="head">
      <div class="ptt-ring" :style="ringStyle">
        <span class="num hud">{{ pttText }}</span>
        <span v-if="stars" class="stars" aria-hidden="true">{{ '★'.repeat(stars) }}</span>
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
          <span v-if="lastPlayedAgo" v-tip="lastPlayedExact" class="tag hud">{{ t('user.last_played') }} {{ lastPlayedAgo }}</span>
        </div>
      </div>
    </div>

    <div class="mini-stats">
      <div v-for="p in parts" :key="p.key" class="mini" :class="{ muted: p.weight === 0 }">
        <div class="k">
          {{ p.label }}
          <span v-if="p.weightText" class="w hud" :title="t('user.weight') + ' = ' + p.weight">{{ p.weightText }}</span>
        </div>
        <div class="v hud">{{ p.text }}</div>
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
  // { b50, b30, b10, r10 } weights from /system/constants (optional).
  weights: { type: Object, default: null },
})

const { t } = useI18n()

// Accepts both shapes: flat row fields (character_id / is_char_uncapped, as
// returned by /users and /users/<id>/brief) or the store's nested character.
const charId = computed(() => props.user.character_id ?? props.user.character?.character_id ?? null)

const pttValue = computed(() => {
  const r = props.user.rating_ptt ?? props.user.rating
  return r === null || r === undefined || r < 0 || Number.isNaN(Number(r)) ? null : Number(r)
})
const pttText = computed(() => (pttValue.value === null ? '—' : pttValue.value.toFixed(3)))

// Potential tiers as the game colours the badge. The ring is drawn in the
// current tier's colour: the filled arc is the progress through the tier, the
// rest of the ring is the same colour at low opacity — so right at a boundary
// it is still unmistakably a full ring of that tier, never grey. Star tiers
// draw their stars under the number; adding a future tier (e.g. 13.5 = ★×4)
// is one more row, and the last row always renders as the full rainbow ring.
const TIERS = [
  { min: 0, color: '#5aa9ff' },
  { min: 3.5, color: '#5fd3a0' },
  { min: 7, color: '#f2b04a' },
  { min: 10, color: '#f0607a' },
  { min: 11, color: '#a982ff' },
  { min: 12, color: '#f5c451', stars: 1 },
  { min: 12.5, color: '#f5c451', stars: 2 },
  { min: 13, color: '#f5c451', stars: 3 },
]
const RAINBOW = 'conic-gradient(#ff9ecf, #ffd36e, #8cf5c1, #86c5ff, #c79bff, #ff9ecf)'
const tier = computed(() => {
  const v = pttValue.value
  if (v === null) return null
  let idx = 0
  TIERS.forEach((t, i) => {
    if (v >= t.min) idx = i
  })
  const cur = TIERS[idx]
  const next = TIERS[idx + 1] || null
  const pct = next ? Math.min(1, Math.max(0, (v - cur.min) / (next.min - cur.min))) * 100 : 100
  return { cur, next, pct }
})
const stars = computed(() => (tier.value && tier.value.cur.stars) || 0)
const ringStyle = computed(() => {
  if (!tier.value) return { background: 'color-mix(in srgb, var(--text) 14%, transparent)' }
  const { cur, next, pct } = tier.value
  if (!next) return { background: RAINBOW }
  const track = `color-mix(in srgb, ${cur.color} 30%, transparent)`
  return { background: `conic-gradient(${cur.color} ${pct.toFixed(1)}%, ${track} 0)` }
})
const fmt = (v) => (v != null && !Number.isNaN(Number(v)) ? Number(v).toFixed(3) : '—')
// Weights are arbitrary server config. Show `1/N` only when the value really
// is a unit fraction (1/60, 1/3 … — float noise tolerated); anything else is
// printed as its exact decimal (up to 6 significant digits, no rounding to a
// fixed 3 places). The raw number is always available in the tooltip.
const fmtWeight = (w) => {
  if (w == null || Number.isNaN(Number(w))) return ''
  const v = Number(w)
  if (v === 0) return '×0'
  const inv = 1 / v
  const n = Math.round(inv)
  if (n >= 1 && n <= 1000 && Math.abs(inv - n) < 1e-6 * n) return `×1/${n}`
  return '×' + String(Number(v.toPrecision(6)))
}
const parts = computed(() =>
  [
    { key: 'b50', label: t('user.best50'), value: props.user.b50_ptt },
    { key: 'b30', label: t('user.best30'), value: props.user.b30_ptt },
    { key: 'b10', label: t('user.best10'), value: props.user.b10_ptt },
    { key: 'r10', label: t('user.recent10'), value: props.user.r10_ptt },
  ].map((p) => {
    const weight = props.weights ? props.weights[p.key] : null
    return { ...p, text: fmt(p.value), weight, weightText: fmtWeight(weight) }
  }),
)
const joinText = computed(() =>
  props.user.join_date ? dayjs(props.user.join_date).format('YYYY-MM-DD') : '',
)
const lastPlayedExact = computed(() => (props.user.last_played ? dayjs(props.user.last_played).format('YYYY-MM-DD HH:mm') : ''))
const lastPlayedAgo = computed(() => (props.user.last_played ? dayjs(props.user.last_played).fromNow() : ''))
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
  box-shadow: 0 10px 30px -12px var(--ring);
}
/* Overlaid under the number so the number never moves when stars appear. */
.stars {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% + 15px);
  text-align: center;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 1px;
  color: #f5c451;
  pointer-events: none;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 18px;
}
.mini {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  min-width: 0;
}
.mini.muted .v {
  color: var(--text-muted);
}
.mini .k {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.mini .k .w {
  font-size: 10px;
  margin-left: 4px;
  color: var(--accent);
}
.mini.muted .k .w {
  color: var(--text-muted);
}
.mini .v {
  font-weight: 700;
  font-size: 20px;
  margin-top: 3px;
}
@media (max-width: 560px) {
  .mini-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
