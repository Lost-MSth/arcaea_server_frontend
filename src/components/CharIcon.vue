<template>
  <span class="cicon" :style="{ width: size + 'px', height: size + 'px' }">
    <img
      v-if="src"
      class="art"
      :src="src"
      :alt="name || ''"
      loading="lazy"
      decoding="async"
      draggable="false"
      @error="onError"
    />
    <span v-else class="fb" :style="{ fontSize: Math.round(size * 0.34) + 'px' }">{{ initials }}</span>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue'

import { get_char_icon, imgFailed, markImgFailed } from '@/utils/img_getter'

const props = defineProps({
  charId: { type: Number, default: null },
  uncapped: { type: Boolean, default: false },
  uncappedOverride: { type: Boolean, default: false },
  name: { type: String, default: '' },
  size: { type: Number, default: 32 },
})

// Uncapped icon falls back to the base icon, then to initials — the
// component never shows a broken image.
const bump = ref(0)
const src = computed(() => {
  void bump.value
  return (
    get_char_icon(props.charId, props.uncapped, props.uncappedOverride).find(
      (u) => !imgFailed(u),
    ) || null
  )
})
const onError = () => {
  if (src.value) {
    markImgFailed(src.value)
    bump.value++
  }
}

const initials = computed(() => {
  const n = (props.name || '').trim()
  return n ? n.slice(0, 2).toUpperCase() : '?'
})
</script>

<style scoped>
.cicon {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
}
/* Arcaea partner icons are diamond-shaped PNGs with transparent corners —
   never crop or put a background behind them; show the natural shape. */
.art {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
}
/* Fallback only: initials in the accent circle. */
.fb {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-3));
  color: #fff;
  font-family: 'Chakra Petch', monospace;
  font-weight: 700;
  line-height: 1;
}
</style>
