import { createApp } from 'vue'

// Self-hosted fonts — bundled locally so they load same-origin (no Google
// Fonts dependency; reliable offline and in mainland China).
import '@fontsource/sora/500.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/manrope/400.css'
import '@fontsource/manrope/500.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/600.css'
import '@fontsource/chakra-petch/700.css'

import App from './App.vue'
import i18n from './i18n'
import router from './router'
import store from './store'
import service from './plugins/axios'
import './assets/css/global.css'

const app = createApp(App)

app.provide('$axios', service)
app.use(store)
app.use(router)
app.use(i18n)

app.mount('#app')
