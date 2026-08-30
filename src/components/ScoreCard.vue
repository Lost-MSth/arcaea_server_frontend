<template>
  <div class="score">
    <div class="jacket-wrap">
      <SongJacket :song-id="score.song_id" :size="60" :radius="10" :alt="score.song_name" />
      <span v-if="rank" class="rk hud">#{{ rank }}</span>
    </div>
    <div class="mid">
      <div class="nm">{{ score.song_name || score.song_id }}</div>
      <div class="sub">
        <DiffChip :difficulty="score.difficulty" />
        <span class="sc hud">{{ score.score.toLocaleString('en-US') }}</span>
      </div>
      <div class="pfl hud">
        P {{ score.perfect_count }} ({{ score.shiny_perfect_count }}) · F {{ score.near_count }} · L
        {{ score.miss_count }}
      </div>
    </div>
    <div class="rt">
      <div class="lab">{{ t('score.rating') }}</div>
      <div class="val hud gradient-text">{{ Number(score.rating).toFixed(2) }}</div>
      <n-tooltip v-if="validTime" trigger="hover">
        <template #trigger>
          <div class="time hud">{{ fromNow }}</div>
        </template>
        {{ fullTime }}
      </n-tooltip>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { NTooltip } from 'naive-ui'

import DiffChip from '@/components/DiffChip.vue'
import SongJacket from '@/components/SongJacket.vue'
import dayjs from '@/plugins/day'

const props = defineProps({
  score: { type: Object, required: true },
  rank: { type: Number, default: null },
})

const { t } = useI18n()

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
}
.sc {
  font-weight: 700;
  font-size: 15px;
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
