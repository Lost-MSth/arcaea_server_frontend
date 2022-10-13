import {
    createI18n
} from 'vue-i18n'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || "en-US",
    messages: {
        'zh-CN': require('./lang/zh-CN.js'),
        'en-US': require('./lang/en-US.js')
    }
})

export default i18n;