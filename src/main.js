import { createApp } from 'vue'

// Self-hosted fonts — bundled locally so they load same-origin (no Google
// Fonts dependency; reliable offline and in mainland China). latin-only:
// the UI's non-ASCII text is Chinese, which these faces don't cover anyway
// (system fallback renders it) — skipping the other subsets keeps ~50 unused
// font files out of dist.
import '@fontsource/sora/latin-500.css'
import '@fontsource/sora/latin-600.css'
import '@fontsource/sora/latin-700.css'
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-600.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/chakra-petch/latin-500.css'
import '@fontsource/chakra-petch/latin-600.css'
import '@fontsource/chakra-petch/latin-700.css'

import App from './App.vue'
import i18n from './i18n'
import router from './router'
import store from './store'
import service from './plugins/axios'
import { vTip } from './plugins/tip'
import './assets/css/global.css'

const app = createApp(App)

app.provide('$axios', service)
app.use(store)
app.use(router)
app.use(i18n)
app.directive('tip', vTip)

app.mount('#app')
