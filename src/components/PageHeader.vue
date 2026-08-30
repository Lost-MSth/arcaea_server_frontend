<template>
  <div class="page-header">
    <span class="eyebrow hud">{{ eyebrow }}</span>
    <h2 class="font-display">{{ title }}</h2>
    <p v-if="subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<style scoped>
.page-header {
  margin-bottom: 18px;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}
.eyebrow::before {
  content: '';
  width: 22px;
  height: 1.5px;
  background: linear-gradient(90deg, var(--accent), transparent);
}
h2 {
  font-size: clamp(19px, 2.6vw, 24px);
  font-weight: 600;
  margin: 0;
}
p {
  color: var(--text-muted);
  margin: 6px 0 0;
  font-size: 13.5px;
  max-width: 70ch;
  line-height: 1.55;
}
</style>
