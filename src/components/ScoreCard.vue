<template>
  <div class="score">
    <div class="jacket-wrap">
      <SongJacket :song-id="score.song_id" :size="60" :radius="10" :alt="score.song_name" />
      <span v-if="rank" class="rk hud">#{{ rank }}</span>
    </div>
    <div class="mid">
      <div class="nm">{{ score.song_name || score.song_id }}</div>
      <div class="sub">
        <DiffChip :difficulty="score.difficulty" :cc="score.chart_const" />
        <span class="sc hud">{{ score.score.toLocaleString('en-US') }}</span>
        <span v-if="clearBadge" class="ct hud" :class="clearBadge.cls" :title="clearBadge.title">{{ clearBadge.text }}</span>
      </div>
      <div class="pfl hud">
        P {{ score.perfect_count }} ({{ score.shiny_perfect_count }}) · F {{ score.near_count }} · L
        {{ score.miss_count }}
      </div>
    </div>
    <div class="rt">
      <div class="lab">{{ t('score.rating') }}</div>
      <div class="val hud gradient-text">{{ Number(score.rating).toFixed(3) }}</div>
      <div v-if="validTime" v-tip="fullTime" class="time hud">{{ fromNow }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { clear_type_name } from '@/config'
import DiffChip from '@/components/DiffChip.vue'
import SongJacket from '@/components/SongJacket.vue'
import dayjs from '@/plugins/day'

const props = defineProps({
  score: { type: Object, required: true },
  rank: { type: Number, default: null },
})

const { t } = useI18n()

// Clear-type badge (0 TL / 1 NC / 2 FR / 3 PM / 4 EC / 5 HC). Only the ones
// worth calling out get a badge: Pure Memory, Full Recall and Track Lost.
const CLEAR_BADGES = { 3: { text: 'PM', cls: 'pm' }, 2: { text: 'FR', cls: 'fr' }, 0: { text: 'TL', cls: 'tl' } }
const clearBadge = computed(() => {
  const ct = props.score.best_clear_type ?? props.score.clear_type
  const b = CLEAR_BADGES[ct]
  return b ? { ...b, title: clear_type_name[ct] } : null
})

// Guard against 0 / near-epoch timestamps (test data) that render as "57 years ago".
const validTime = computed(() => props.score.time_played && props.score.time_played > 1e9)
const fromNow = computed(() => dayjs(props.score.time_played * 1000).fromNow())
const fullTime = computed(() => dayjs(props.score.time_played * 1000).format('YYYY-MM-DD HH:mm:ss'))
</script>

<style scoped>
.score {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 13px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface-2);
}
.jacket-wrap {
  position: relative;
}
.rk {
  position: absolute;
  top: 5px;
  left: 5px;
  font-weight: 700;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
}
.mid {
  min-width: 0;
}
.nm {
  font-weight: 600;
  font-size: 13.5px;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  flex-wrap: wrap;
}
.sc {
  font-weight: 700;
  font-size: 15px;
}
.ct {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  letter-spacing: 0.04em;
}
.ct.pm {
  color: #b8860b;
  background: color-mix(in srgb, #f5c451 22%, transparent);
}
.ct.fr {
  color: #7c5cff;
  background: color-mix(in srgb, #a982ff 20%, transparent);
}
.ct.tl {
  color: var(--text-muted);
  background: color-mix(in srgb, var(--text) 8%, transparent);
}
.pfl {
  font-size: 10.5px;
  color: var(--text-muted);
  margin-top: 4px;
}
.rt {
  text-align: right;
}
.lab {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.val {
  font-weight: 700;
  font-size: 18px;
}
.time {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
  cursor: default;
}
</style>
