<template>
  <div class="jacket" :style="{ width: size + 'px', height: size + 'px', borderRadius: radius + 'px' }">
    <img v-if="!failed" :src="src" :alt="alt" loading="lazy" @error="failed = true" />
    <span v-else class="fallback"><AppIcon name="note" :size="Math.round(size * 0.32)" /></span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

import AppIcon from '@/components/AppIcon.vue'
import { get_song_img } from '@/utils/img_getter'

const props = defineProps({
  songId: { type: String, required: true },
  size: { type: Number, default: 62 },
  radius: { type: Number, default: 10 },
  alt: { type: String, default: '' },
})

const failed = ref(false)
const src = ref(get_song_img(props.songId))

watch(
  () => props.songId,
  (id) => {
    failed.value = false
    src.value = get_song_img(id)
  },
)
</script>

<style scoped>
.jacket {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #2a2350, #14284a);
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
  color: rgba(255, 255, 255, 0.5);
}
</style>
