<template>
  <div class="jacket" :style="{ width: size + 'px', height: size + 'px', borderRadius: radius + 'px' }">
    <img v-if="src" :src="src" :alt="alt" loading="lazy" decoding="async" draggable="false" @error="onError" />
    <span v-else class="fallback"><AppIcon name="note" :size="Math.round(size * 0.32)" /></span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { get_song_img, imgFailed, markImgFailed } from '@/utils/img_getter'

const props = defineProps({
  songId: { type: String, required: true },
  size: { type: Number, default: 62 },
  radius: { type: Number, default: 10 },
  alt: { type: String, default: '' },
})

// Candidate chain (1080 -> non-1080); failed URLs are remembered for the
// session so revisits render the placeholder without re-requesting.
const bump = ref(0)
const src = computed(() => {
  void bump.value
  return get_song_img(props.songId).find((u) => !imgFailed(u)) || null
})
const onError = () => {
  if (src.value) {
    markImgFailed(src.value)
    bump.value++
  }
}
</script>

<style scoped>
.jacket {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.jacket img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--text-muted);
}
</style>
