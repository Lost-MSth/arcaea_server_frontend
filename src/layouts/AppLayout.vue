<template>
  <div class="layout">
    <aside class="rail">
      <NavRail />
    </aside>

    <n-drawer v-model:show="drawer" :width="248" placement="left">
      <n-drawer-content :native-scrollbar="false" body-content-style="padding:0">
        <NavRail @navigate="drawer = false" />
      </n-drawer-content>
    </n-drawer>

    <div class="main">
      <header class="topbar">
        <button class="icon-btn only-mobile" :aria-label="t('common.menu')" @click="drawer = true">
          <AppIcon name="menu" :size="20" />
        </button>
        <div class="page-title">
          <div class="crumb hud">{{ t('route.dashboard') === current ? '' : t('main.subtitle') }}</div>
          <h1 class="font-display">{{ current }}</h1>
        </div>

        <div class="topbar-spacer"></div>

        <n-dropdown trigger="click" :options="langOptions" @select="changeLang">
          <button class="icon-btn" :aria-label="t('common.language')">
            <AppIcon name="language" :size="19" />
          </button>
        </n-dropdown>

        <n-popover trigger="click" placement="bottom">
          <template #trigger>
            <button class="icon-btn" :aria-label="t('common.accent')">
              <AppIcon name="palette" :size="19" />
            </button>
          </template>
          <div style="display: grid; grid-template-columns: repeat(4, 30px); gap: 10px; padding: 4px">
            <button
              v-for="p in ACCENT_PRESETS"
              :key="p.key"
              :aria-label="p.key"
              :style="{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                cursor: 'pointer',
                background: p.color,
                border: app.accent === p.color ? '2px solid var(--text)' : '2px solid transparent',
              }"
              @click="app.setAccent(p.color)"
            />
          </div>
        </n-popover>

        <button class="icon-btn" :aria-label="t('common.theme')" @click="app.toggleTheme()">
          <AppIcon :name="app.isDark ? 'sun' : 'moon'" :size="19" />
        </button>

        <n-dropdown trigger="click" :options="userOptions" @select="onUserSelect">
          <button class="avatar" :aria-label="user.name || 'user'">
            {{ initials }}
          </button>
        </n-dropdown>
      </header>

      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, h, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NDrawer, NDrawerContent, NDropdown, NPopover } from 'naive-ui'

import NavRail from '@/components/NavRail.vue'
import AppIcon from '@/components/AppIcon.vue'
import { ACCENT_PRESETS } from '@/plugins/theme'
import { appStore } from '@/store/app'
import { userStore } from '@/store/user'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const app = appStore()
const user = userStore()

const drawer = ref(false)

const current = computed(() => {
  const title = route.meta && route.meta.title
  return title ? t('route.' + title) : t('route.dashboard')
})

const initials = computed(() => {
  const n = user.name || 'A'
  return n.slice(0, 2).toUpperCase()
})

const langOptions = [
  { label: '中文', key: 'zh-CN' },
  { label: 'English', key: 'en-US' },
]

const userOptions = computed(() => [
  { label: user.name || '—', key: 'name', disabled: true },
  { type: 'divider', key: 'd' },
  { label: t('login.logout'), key: 'logout', icon: () => h(AppIcon, { name: 'logout', size: 16 }) },
])

const changeLang = (val) => {
  locale.value = val
  try {
    localStorage.setItem('lang', val)
  } catch (e) {
    /* ignore */
  }
}

const onUserSelect = (key) => {
  if (key === 'logout') {
    user.logout()
    router.push('/login').then(() => router.go(0))
  }
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
.rail {
  border-right: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 55%, transparent);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  height: 100vh;
}
.main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 26px;
  background: color-mix(in srgb, var(--bg) 72%, transparent);
  backdrop-filter: blur(14px) saturate(1.2);
  border-bottom: 1px solid var(--border);
}
.page-title h1 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}
.crumb {
  font-size: 11px;
  color: var(--text-muted);
  min-height: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.topbar-spacer {
  flex: 1;
}
.content {
  padding: 24px 26px 64px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}
.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    color 0.16s,
    border-color 0.16s,
    transform 0.16s;
}
.icon-btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-3));
  color: #fff;
  font-family: 'Chakra Petch', monospace;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: grid;
  place-items: center;
}
.only-mobile {
  display: none;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .rail {
    display: none;
  }
  .only-mobile {
    display: grid;
  }
  .content {
    padding: 18px 16px 48px;
  }
}
</style>
