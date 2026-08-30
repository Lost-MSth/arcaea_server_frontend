<template>
  <div class="chart">
    <div class="legend">
      <span class="cap hud">{{ caption }}</span>
      <span class="big hud gradient-text">{{ lastText }}</span>
    </div>
    <svg v-if="points.length >= 2" :viewBox="`0 0 ${W} ${H}`" width="100%" :height="H" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--accent)" stop-opacity="0.32" />
          <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
        </linearGradient>
      </defs>
      <g stroke="var(--border)" stroke-width="1">
        <line v-for="y in gridY" :key="y" x1="0" :y1="y" :x2="W" :y2="y" />
      </g>
      <path :d="areaPath" :fill="`url(#${gid})`" />
      <path :d="linePath" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      <circle :cx="lastPt.x" :cy="lastPt.y" r="4.5" fill="var(--accent-2)" stroke="var(--surface-solid)" stroke-width="2" />
    </svg>
    <div v-else class="empty hud">{{ emptyText }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  points: { type: Array, default: () => [] }, // array of numbers (potential)
  caption: { type: String, default: '' },
  emptyText: { type: String, default: 'No data' },
})

const W = 340
const H = 150
const gid = 'rc-' + Math.random().toString(36).slice(2, 8)
const gridY = [38, 76, 114]

const coords = computed(() => {
  const pts = props.points
  if (pts.length < 2) return []
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const span = max - min || 1
  const pad = 14
  return pts.map((v, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: pad + (1 - (v - min) / span) * (H - pad * 2),
  }))
})

const linePath = computed(() =>
  coords.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
)
const areaPath = computed(() => `${linePath.value} L${W},${H} L0,${H} Z`)
const lastPt = computed(() => coords.value[coords.value.length - 1] || { x: 0, y: 0 })
const lastText = computed(() => {
  const pts = props.points
  return pts.length ? pts[pts.length - 1].toFixed(2) : '—'
})
</script>

<style scoped>
.chart {
  width: 100%;
}
.legend {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.cap {
  font-size: 12px;
  color: var(--text-muted);
}
.big {
  font-weight: 700;
  font-size: 22px;
}
.empty {
  height: 150px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 12px;
}
</style>
