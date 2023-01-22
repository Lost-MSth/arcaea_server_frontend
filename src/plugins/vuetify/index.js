// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { light, dark } from './theme'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  components: {
    VDataTable,
    ...components,
  },
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light,
      dark,
    }
  }
}
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
