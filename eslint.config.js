import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'tmp/**'],
  },
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // Single-word view/component names (dashboard.vue, …) are fine here.
      'vue/multi-word-component-names': 'off',
    },
  },
]
