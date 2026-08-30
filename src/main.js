import { createApp } from 'vue'

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
