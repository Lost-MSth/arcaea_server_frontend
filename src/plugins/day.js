import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

export function syncDayjsLocale(lang) {
  dayjs.locale(String(lang || '').toLowerCase().startsWith('zh') ? 'zh-cn' : 'en')
}

try {
  syncDayjsLocale(localStorage.getItem('lang') || 'en-US')
} catch (e) {
  /* ignore */
}

export default dayjs
