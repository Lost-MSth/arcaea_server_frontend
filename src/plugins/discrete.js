// A detached Naive UI message API usable outside of the component tree
// (e.g. inside the axios interceptor). Components inside <n-message-provider>
// should prefer useMessage().
import { createDiscreteApi, darkTheme } from 'naive-ui'

import { themeOverrides } from './theme'

const { message } = createDiscreteApi(['message'], {
  configProviderProps: {
    theme: darkTheme,
    themeOverrides,
  },
})

export { message }
