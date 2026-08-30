// A detached Naive UI message API usable outside of the component tree
// (e.g. inside the axios interceptor). It follows the app's light/dark mode
// and accent color via syncDiscreteTheme() (called from App.vue).
import { computed, ref } from 'vue'
import { createDiscreteApi, darkTheme } from 'naive-ui'

import { buildThemeOverrides, DEFAULT_ACCENT } from './theme'

const state = ref({ isDark: true, accent: DEFAULT_ACCENT })

const configProviderProps = computed(() => ({
  theme: state.value.isDark ? darkTheme : undefined,
  themeOverrides: buildThemeOverrides(state.value.accent),
}))

const { message } = createDiscreteApi(['message'], { configProviderProps })

export function syncDiscreteTheme(isDark, accent) {
  state.value = { isDark, accent }
}

export { message }
