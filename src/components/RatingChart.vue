<template>
  <div ref="wrap" class="chart">
    <div class="legend">
      <span class="cap hud">{{ caption }}</span>
      <span class="side hud">
        <span v-if="deltaText" class="delta" :class="deltaCls">{{ deltaText }}</span>
        <span class="big gradient-text">{{ lastText }}</span>
      </span>
    </div>

    <svg
      v-if="pts.length >= 2"
      :width="w"
      :height="H"
      class="plot"
      @pointermove="onMove"
      @pointerleave="hover = null"
    >
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--accent)" stop-opacity="0.30" />
          <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- gridlines + y labels -->
      <g>
        <template v-for="tk in yTicks" :key="tk.v">
          <line :x1="0" :y1="tk.y" :x2="w" :y2="tk.y" stroke="var(--border)" stroke-width="1" />
          <text :x="4" :y="tk.y - 4" class="lbl">{{ tk.label }}</text>
        </template>
      </g>

      <path :d="areaPath" :fill="`url(#${gid})`" />
      <path
        :d="linePath"
        fill="none"
        stroke="var(--accent)"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- individual points when the data is sparse enough to read them -->
      <g v-if="coords.length <= 42">
        <circle
          v-for="(p, i) in coords"
          :key="i"
          :cx="p.x"
          :cy="p.y"
          r="2.4"
          fill="var(--accent)"
          stroke="var(--surface-solid)"
          stroke-width="1"
        />
      </g>

      <!-- endpoint -->
      <circle
        :cx="lastPt.x"
        :cy="lastPt.y"
        r="4.5"
        fill="var(--accent-2)"
        stroke="var(--surface-solid)"
        stroke-width="2"
      />

      <!-- hover crosshair -->
      <g v-if="hover">
        <line
          :x1="hover.x"
          :y1="padTop"
          :x2="hover.x"
          :y2="plotBottom"
          stroke="var(--border-strong)"
          stroke-width="1"
          stroke-dasharray="3 3"
        />
        <circle :cx="hover.x" :cy="hover.y" r="4" fill="none" stroke="var(--accent-2)" stroke-width="2" />
      </g>

      <!-- x labels: first / middle / last date -->
      <g>
        <text v-for="(x, i) in xTicks" :key="i" :x="x.x" :y="H - 4" class="lbl" :text-anchor="x.anchor">
          {{ x.label }}
        </text>
      </g>
    </svg>
    <div v-else class="empty hud">{{ emptyText }}</div>

    <div v-if="hover" class="tip hud" :style="tipStyle">
      <span class="tip-date">{{ hover.date }}</span>
      <span class="tip-val">{{ hover.value }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import dayjs from '@/plugins/day'

const props = defineProps({
  // [{ time: msEpoch|null, value: number }] — plain numbers also accepted.
  points: { type: Array, default: () => [] },
  caption: { type: String, default: '' },
  emptyText: { type: String, default: 'No data' },
})

const H = 168
const padTop = 10
const padBottom = 22
const plotBottom = H - padBottom
const gid = 'rc-' + Math.random().toString(36).slice(2, 8)

// Real container width — no viewBox stretching (stretched SVG distorts text).
const wrap = ref(null)
const w = ref(340)
let ro = null
onMounted(() => {
  if (wrap.value) {
    w.value = Math.max(220, wrap.value.clientWidth)
    ro = new ResizeObserver(() => {
      if (wrap.value) w.value = Math.max(220, wrap.value.clientWidth)
    })
    ro.observe(wrap.value)
  }
})
onUnmounted(() => ro && ro.disconnect())

const pts = computed(() =>
  props.points.map((p) => (typeof p === 'number' ? { time: null, value: p } : p)),
)

// ---- scales ----------------------------------------------------------------
// Y: nice ticks over the data range, with a minimum span so tiny fluctuations
// read as the near-flat lines they are instead of filling the whole height.
const yScale = computed(() => {
  const vs = pts.value.map((p) => p.value)
  let min = Math.min(...vs)
  let max = Math.max(...vs)
  if (max - min < 0.2) {
    const mid = (min + max) / 2
    min = mid - 0.1
    max = mid + 0.1
  }
  const span = max - min
  const pow = 10 ** Math.floor(Math.log10(span / 3))
  const step = [1, 2, 2.5, 5, 10].map((c) => c * pow).find((c) => span / c <= 4.6) || 10 * pow
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  return { lo, hi, step }
})

const yOf = (v) => {
  const { lo, hi } = yScale.value
  return padTop + (1 - (v - lo) / (hi - lo)) * (plotBottom - padTop)
}

const yTicks = computed(() => {
  const { lo, hi, step } = yScale.value
  const dec = step < 0.095 ? 2 : step < 0.95 ? 1 : 0
  const out = []
  for (let v = lo; v <= hi + step / 2; v += step) {
    out.push({ v, y: yOf(v), label: v.toFixed(dec) })
  }
  return out
})

// X: proportional to real time when available, index-based otherwise.
const hasTime = computed(() => pts.value.every((p) => p.time != null))
const xOf = (p, i) => {
  const list = pts.value
  if (hasTime.value && list[list.length - 1].time !== list[0].time) {
    return ((p.time - list[0].time) / (list[list.length - 1].time - list[0].time)) * (w.value - 14) + 4
  }
  return (i / (list.length - 1)) * (w.value - 14) + 4
}

const coords = computed(() => pts.value.map((p, i) => ({ x: xOf(p, i), y: yOf(p.value) })))

const linePath = computed(() =>
  coords.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
)
const areaPath = computed(() => {
  const c = coords.value
  return `${linePath.value} L${c[c.length - 1].x.toFixed(1)},${plotBottom} L${c[0].x.toFixed(1)},${plotBottom} Z`
})
const lastPt = computed(() => coords.value[coords.value.length - 1] || { x: 0, y: 0 })

// ---- labels ----------------------------------------------------------------
const fmtDate = (t, long = false) => {
  if (t == null) return ''
  const list = pts.value
  const spanDays = hasTime.value ? (list[list.length - 1].time - list[0].time) / 86400000 : 0
  if (long) return dayjs(t).format('YYYY-MM-DD')
  return dayjs(t).format(spanDays > 200 ? 'YY-MM' : 'MM-DD')
}

const xTicks = computed(() => {
  if (!hasTime.value || pts.value.length < 2) return []
  const list = pts.value
  // Middle label marks the midpoint of the TIME axis (labels describe the
  // axis, not a datapoint — with uneven play days they differ).
  const tMid = (list[0].time + list[list.length - 1].time) / 2
  return [
    { x: 4, anchor: 'start', label: fmtDate(list[0].time) },
    { x: w.value / 2, anchor: 'middle', label: fmtDate(tMid) },
    { x: w.value - 4, anchor: 'end', label: fmtDate(list[list.length - 1].time) },
  ]
})

const lastText = computed(() =>
  pts.value.length ? pts.value[pts.value.length - 1].value.toFixed(2) : '—',
)

// Range delta: what actually happened over the visible window.
const delta = computed(() => {
  const list = pts.value
  if (list.length < 2) return null
  return list[list.length - 1].value - list[0].value
})
const deltaText = computed(() => {
  if (delta.value === null) return ''
  const d = delta.value
  return (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(2)
})
const deltaCls = computed(() =>
  delta.value === null || Math.abs(delta.value) < 0.005 ? 'flat' : delta.value > 0 ? 'up' : 'down',
)

// ---- hover -----------------------------------------------------------------
const hover = ref(null)
const onMove = (e) => {
  const c = coords.value
  if (!c.length) return
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < c.length; i++) {
    const d = Math.abs(c[i].x - x)
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  const p = pts.value[best]
  hover.value = {
    x: c[best].x,
    y: c[best].y,
    date: fmtDate(p.time, true),
    value: p.value.toFixed(2),
  }
}

const tipStyle = computed(() => {
  if (!hover.value) return {}
  const left = Math.min(Math.max(hover.value.x - 55, 0), w.value - 116)
  const top = hover.value.y - 46
  return { left: left + 'px', top: (top < 26 ? hover.value.y + 14 : top) + 'px' }
})
</script>

<style scoped>
.chart {
  width: 100%;
  position: relative;
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
.side {
  display: inline-flex;
  align-items: baseline;
  gap: 10px;
}
.big {
  font-weight: 700;
  font-size: 22px;
}
.delta {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
}
.delta.up {
  color: var(--good);
}
.delta.down {
  color: #e5697a;
}
.delta.flat {
  color: var(--text-muted);
}
.plot {
  display: block;
  touch-action: pan-y;
}
.plot .lbl {
  font-family: 'Chakra Petch', 'Manrope', monospace;
  font-size: 10px;
  fill: var(--text-muted);
}
.empty {
  height: 168px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 12px;
}
.tip {
  position: absolute;
  pointer-events: none;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 9px;
  background: var(--surface-solid);
  border: 1px solid var(--border-strong);
  box-shadow: 0 6px 18px -8px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  z-index: 5;
}
.tip-date {
  font-size: 10.5px;
  color: var(--text-muted);
}
.tip-val {
  font-size: 13px;
  font-weight: 700;
  color: var(--accent);
}
</style>
