import { defineStore } from 'pinia'

// UI preferences. `showThemeToggle` makes the light/dark switch optional —
// set it false to hide the toggle entirely and pin the theme.
export const appStore = defineStore('app', {
  state: () => ({
    theme: 'dark',
    showThemeToggle: true,
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
  },
})
