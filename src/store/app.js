import { defineStore } from 'pinia'

import { DEFAULT_ACCENT } from '@/plugins/theme'

// UI preferences. Light/dark mode is always available; the accent (theme
// color) is user selectable from ACCENT_PRESETS.
export const appStore = defineStore('app', {
  state: () => ({
    theme: 'dark',
    accent: DEFAULT_ACCENT,
    railCollapsed: false,
  }),
  persist: true,
  getters: {
    isDark: (s) => s.theme === 'dark',
  },
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    },
    setAccent(color) {
      this.accent = color
    },
  },
})
