<template>
  <div class="rail-inner">
    <div class="brand">
      <span class="brandmark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 20L12 4l9 16" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M7.5 20l4.5-8 4.5 8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".55" />
        </svg>
      </span>
      <div class="brand-text">
        <b class="font-display">{{ t('main.title') }}</b>
        <span>{{ t('main.subtitle') }}</span>
      </div>
    </div>

    <nav class="nav-scroll">
      <RouterLink
        v-if="user.has_power('select')"
        class="nav-item"
        :class="{ active: isActive('dashboard') }"
        to="/dashboard"
        @click="emit('navigate')"
      >
        <AppIcon name="grid" :size="18" />
        <span>{{ t('route.dashboard') }}</span>
      </RouterLink>

      <template v-for="group in groupOrder" :key="group">
        <template v-if="groups[group] && groups[group].length">
          <div class="rail-label">{{ t('nav.' + group) }}</div>
          <RouterLink
            v-for="r in groups[group]"
            :key="r.name"
            class="nav-item"
            :class="{ active: isActive(r.name) }"
            :to="r.path"
            @click="emit('navigate')"
          >
            <AppIcon :name="r.meta.icon" :size="18" />
            <span>{{ t('route.' + r.meta.title) }}</span>
          </RouterLink>
        </template>
      </template>
    </nav>

    <div class="rail-ver hud">v{{ version }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppIcon from '@/components/AppIcon.vue'
import { userStore } from '@/store/user'

const { t } = useI18n()
const route = useRoute()
const user = userStore()

const emit = defineEmits(['navigate'])

const groupOrder = ['player', 'content', 'economy', 'system']

const groups = computed(() => {
  const g = { player: [], content: [], economy: [], system: [] }
  user.accessed_routes.forEach((r) => {
    const grp = r.meta && r.meta.group
    if (g[grp]) g[grp].push(r)
  })
  return g
})

const isActive = (name) => route.name === name

// Injected by Vite's `define` from package.json.
const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'
</script>

<style scoped>
.rail-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 18px;
}
.brandmark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 6px 18px -6px var(--ring);
  flex-shrink: 0;
}
.brandmark svg {
  width: 21px;
  height: 21px;
}
.brand-text b {
  display: block;
  font-weight: 700;
  font-size: 15px;
  color: var(--text);
  letter-spacing: -0.01em;
}
.brand-text span {
  display: block;
  font-size: 10.5px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.nav-scroll {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1;
}
.rail-label {
  font-size: 10.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 14px 12px 6px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border-radius: 10px;
  color: var(--text-2);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.16s,
    color 0.16s;
}
.nav-item:hover {
  background: var(--elevate);
  color: var(--text);
}
.nav-item.active {
  background: var(--accent-soft);
  color: var(--text);
  box-shadow: inset 2px 0 0 var(--accent);
}
.nav-item.active :deep(.n-icon) {
  color: var(--accent);
}
.rail-ver {
  padding: 10px 12px 2px;
  font-size: 10px;
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
