<template>
  <n-config-provider
    :theme="app.isDark ? darkTheme : null"
    :theme-overrides="overrides"
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    class="app-root"
  >
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <router-view />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
    <n-global-style />
  </n-config-provider>
</template>

<script setup>
import { computed, watchEffect } from 'vue'
import {
  darkTheme,
  zhCN,
  enUS,
  dateZhCN,
  dateEnUS,
  NConfigProvider,
  NLoadingBarProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NGlobalStyle,
} from 'naive-ui'
import { useI18n } from 'vue-i18n'

import { buildThemeOverrides } from '@/plugins/theme'
import { syncDiscreteTheme } from '@/plugins/discrete'
import { appStore } from '@/store/app'

const app = appStore()
const { locale } = useI18n()

const naiveLocale = computed(() => (locale.value === 'zh-CN' ? zhCN : enUS))
const naiveDateLocale = computed(() => (locale.value === 'zh-CN' ? dateZhCN : dateEnUS))

const overrides = computed(() => buildThemeOverrides(app.accent))

// Drive the CSS-variable theme (aurora, glass, accent) and the detached
// message API from the store.
watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', app.theme)
    document.documentElement.style.setProperty('--accent', app.accent)
  }
  syncDiscreteTheme(app.isDark, app.accent)
})
</script>
