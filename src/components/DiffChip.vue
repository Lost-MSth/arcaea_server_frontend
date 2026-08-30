<template>
  <span class="diff" :class="'diff-' + difficulty">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'

import { difficulty_short_name } from '@/config'

const props = defineProps({
  difficulty: { type: Number, required: true },
  cc: { type: [Number, String], default: null },
})

const label = computed(() => {
  const name = difficulty_short_name[props.difficulty] || '?'
  if (props.cc === null || props.cc === undefined || props.cc === '') return name
  const n = Number(props.cc)
  return `${name} ${n >= 0 ? n.toFixed(1) : '—'}`
})
</script>
