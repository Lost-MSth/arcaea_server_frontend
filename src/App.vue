<template>
  <n-config-provider
    :theme="app.isDark ? darkTheme : null"
    :theme-overrides="themeOverrides"
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

import { themeOverrides } from '@/plugins/theme'
import { appStore } from '@/store/app'

const app = appStore()
const { locale } = useI18n()

const naiveLocale = computed(() => (locale.value === 'zh-CN' ? zhCN : enUS))
const naiveDateLocale = computed(() => (locale.value === 'zh-CN' ? dateZhCN : dateEnUS))

// Drive the CSS variable theme (aurora background, glass, etc.) from the store.
watchEffect(() => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', app.theme)
  }
})
</script>
