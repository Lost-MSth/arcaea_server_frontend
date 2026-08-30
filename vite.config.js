import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the same build works whether it is served from the server
  // at /console/, from a static Pages root, or from any subpath.
  base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        'vue-i18n',
        {
          'naive-ui': ['useMessage', 'useDialog', 'useNotification', 'useLoadingBar'],
        },
      ],
      dts: false,
    }),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8848,
    // Dev server is reached via several hostnames (LAN IP, Tailscale, a reverse
    // proxy domain). `true` accepts any Host header. To lock it down, replace
    // with an explicit list, e.g. ['oracle.lost-msth.cn', 'localhost'].
    allowedHosts: true,
    proxy: {
      // Dev-only: forward API calls to the local Arcaea server.
      // Frontend default API base is '/api/v1'; backend serves '/api/v1/...'.
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
