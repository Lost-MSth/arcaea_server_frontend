// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
// import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// import { VDataTable } from 'vuetify/labs/VDataTable'
import { light, dark } from './theme'
import { md3 } from 'vuetify/blueprints'

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify({
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light,
      dark,
    }
  },
  blueprint: md3
}
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
)
