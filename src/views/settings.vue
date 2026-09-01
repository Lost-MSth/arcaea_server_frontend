<template>
  <div>
    <PageHeader :eyebrow="t('route.settings')" :title="t('settings.title')" :subtitle="t('settings.subtitle')" />

    <div class="grid">
      <section class="glass card">
        <h3 class="font-display">{{ t('settings.appearance') }}</h3>
        <div class="row">
          <span class="k">{{ t('settings.theme') }}</span>
          <div class="segmented">
            <button :class="{ on: app.theme === 'dark' }" @click="app.theme = 'dark'">{{ t('settings.dark') }}</button>
            <button :class="{ on: app.theme === 'light' }" @click="app.theme = 'light'">{{ t('settings.light') }}</button>
          </div>
        </div>
        <div class="row">
          <span class="k">{{ t('common.accent') }}</span>
          <div class="swatches">
            <button
              v-for="p in ACCENT_PRESETS"
              :key="p.key"
              :aria-label="p.key"
              class="swatch"
              :class="{ on: app.accent === p.color }"
              :style="{ background: p.color }"
              @click="app.setAccent(p.color)"
            />
          </div>
        </div>
        <div class="row">
          <span class="k">{{ t('common.language') }}</span>
          <div class="segmented">
            <button :class="{ on: locale === 'zh-CN' }" @click="setLang('zh-CN')">中文</button>
            <button :class="{ on: locale === 'en-US' }" @click="setLang('en-US')">English</button>
          </div>
        </div>
      </section>

      <section class="glass card">
        <h3 class="font-display">{{ t('settings.images') }}</h3>
        <div class="row">
          <span class="k">{{ t('settings.images_enabled') }}</span>
          <n-switch v-model:value="imagesOn" />
        </div>
        <div class="row stack">
          <span class="k">{{ t('login.assets_address') }}</span>
          <div class="inline">
            <n-input v-model:value="assets" :placeholder="t('settings.assets_auto')" :disabled="!imagesOn" size="small">
              <template #prefix><AppIcon name="image" :size="14" /></template>
            </n-input>
            <n-button size="small" secondary :disabled="!imagesOn" @click="saveAssets">{{ t('common.save') }}</n-button>
          </div>
        </div>
        <p class="hint">{{ t('settings.assets_hint') }}</p>
      </section>

      <section class="glass card">
        <h3 class="font-display">{{ t('settings.connection') }}</h3>
        <div class="kv">
          <span class="k">{{ t('login.server_address') }}</span>
          <span class="v hud">{{ apiBase }}</span>
        </div>
        <div v-if="serverVersion" class="kv">
          <span class="k">{{ t('settings.server_version') }}</span>
          <span class="v hud">{{ serverVersion }}</span>
        </div>
        <p class="hint">{{ t('settings.connection_hint') }}</p>
      </section>

      <section class="glass card">
        <h3 class="font-display">{{ t('settings.data') }}</h3>
        <div class="row">
          <n-button secondary @click="clearLocalCache">{{ t('cache.clear_all') }}</n-button>
          <RouterLink v-if="user.has_power('select')" class="link" to="/system/cache">{{ t('settings.open_cache') }} →</RouterLink>
        </div>
        <p class="hint">{{ t('settings.data_hint') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NButton, NInput, NSwitch, useMessage } from 'naive-ui'

import PageHeader from '@/components/PageHeader.vue'
import AppIcon from '@/components/AppIcon.vue'
import { resolveApiBase } from '@/config'
import service from '@/plugins/axios'
import { clearAll } from '@/plugins/cache'
import { ACCENT_PRESETS } from '@/plugins/theme'
import { getStoredAssetsBase, setStoredAssetsBase } from '@/utils/img_getter'
import { appStore } from '@/store/app'
import { userStore } from '@/store/user'

const { t, locale } = useI18n()
const message = useMessage()
const app = appStore()
const user = userStore()

const setLang = (val) => {
  locale.value = val
  try {
    localStorage.setItem('lang', val)
  } catch (e) {
    /* ignore */
  }
}

// ---- images ----
const stored = getStoredAssetsBase()
const imagesOn = ref(stored !== 'off')
const assets = ref(stored === 'off' ? '' : stored)
watch(imagesOn, (on) => {
  setStoredAssetsBase(on ? assets.value.trim() : 'off')
  message.success(t('settings.saved'))
})
const saveAssets = () => {
  setStoredAssetsBase(assets.value.trim())
  message.success(t('settings.saved'))
}

// ---- connection ----
const apiBase = resolveApiBase()
const serverVersion = ref('')
onMounted(() => {
  service
    .cachedGet('/system/constants', null, { silent: true })
    .then((res) => (serverVersion.value = res.data.server_version || ''))
    .catch(() => {})
})

// ---- data ----
const clearLocalCache = () => {
  clearAll({ persisted: true })
  message.success(t('cache.cleared'))
}
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.card {
  padding: 18px 20px;
}
.card h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
  border-top: 1px solid var(--border);
}
.row.stack {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}
.inline {
  display: flex;
  gap: 8px;
}
.inline .n-input {
  flex: 1;
}
.k {
  font-size: 13px;
  color: var(--text-2);
}
.kv {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 8px 0;
  border-top: 1px solid var(--border);
  font-size: 13px;
}
.kv .v {
  color: var(--text-muted);
  word-break: break-all;
  text-align: right;
}
.segmented {
  display: inline-flex;
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}
.segmented button {
  font-family: 'Chakra Petch', monospace;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  font-weight: 600;
}
.segmented button.on {
  background: var(--accent-soft);
  color: var(--text);
}
.swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.swatch.on {
  border-color: var(--text);
}
.hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-muted);
}
.link {
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
