import { createI18n } from 'vue-i18n'

import * as enUS from './lang/en-US.js'
import * as zhCN from './lang/zh-CN.js'

function initialLocale() {
  try {
    return localStorage.getItem('lang') || 'en-US'
  } catch (e) {
    return 'en-US'
  }
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale(),
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': { ...enUS },
    'zh-CN': { ...zhCN },
  },
})

export default i18n
