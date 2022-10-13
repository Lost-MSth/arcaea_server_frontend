import {
  createApp
} from 'vue'
import App from './App.vue'
import i18n from './i18n'
import axios from './plugins/axios'
import vuetify from './plugins/vuetify'
import {
  loadFonts
} from './plugins/webfontloader'
import router from './router'
import store from './store'
import './assets/css/global.css'


const app = createApp(App)
loadFonts()

app.provide('$axios', axios)
app.use(router)
app.use(store)
app.use(i18n)
app.use(vuetify)

app.mount('#app')