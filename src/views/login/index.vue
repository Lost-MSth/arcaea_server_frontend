<template>
  <div class="login-stage">
    <div class="login-controls">
      <n-dropdown trigger="click" :options="langOptions" @select="changeLang">
        <button class="icon-btn" :aria-label="t('common.language')"><AppIcon name="language" :size="18" /></button>
      </n-dropdown>
      <button class="icon-btn" :aria-label="t('common.theme')" @click="app.toggleTheme()">
        <AppIcon :name="app.isDark ? 'sun' : 'moon'" :size="18" />
      </button>
    </div>

    <n-card class="login-card" :bordered="true">
      <div class="brandmark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M3 20L12 4l9 16" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M7.5 20l4.5-8 4.5 8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".55" />
        </svg>
      </div>
      <h1 class="font-display title">{{ t('login.title') }}</h1>
      <p class="subtitle">{{ t('login.subtitle') }}</p>

      <div class="mode segmented">
        <button type="button" :class="{ on: mode === 'password' }" @click="setMode('password')">{{ t('login.mode_password') }}</button>
        <button type="button" :class="{ on: mode === 'token' }" @click="setMode('token')">{{ t('login.mode_token') }}</button>
      </div>

      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="submit">
        <template v-if="mode === 'token'">
          <n-form-item path="apiToken" :show-label="false">
            <n-input
              ref="tokenInputRef"
              v-model:value="form.apiToken"
              type="password"
              show-password-on="click"
              :placeholder="t('login.token_placeholder')"
              :input-props="{ autocomplete: 'off' }"
              size="large"
            >
              <template #prefix><AppIcon name="lock" :size="18" /></template>
            </n-input>
          </n-form-item>
          <p class="hint warn">{{ t('login.token_hint') }}</p>
        </template>
        <n-form-item v-if="mode === 'password'" path="username" :show-label="false">
          <n-input
            ref="userInputRef"
            v-model:value="form.username"
            :placeholder="t('login.username')"
            :input-props="{ autocomplete: 'username' }"
            size="large"
          >
            <template #prefix><AppIcon name="person" :size="18" /></template>
          </n-input>
        </n-form-item>
        <n-form-item v-if="mode === 'password'" path="password" :show-label="false">
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            :placeholder="t('login.password')"
            :input-props="{ autocomplete: 'current-password' }"
            size="large"
          >
            <template #prefix><AppIcon name="lock" :size="18" /></template>
          </n-input>
        </n-form-item>

        <div class="adv-toggle" @click="showAdvanced = !showAdvanced">
          <AppIcon :name="showAdvanced ? 'chevron-down' : 'chevron'" :size="14" />
          <span>{{ t('login.advanced') }}</span>
        </div>
        <n-collapse-transition :show="showAdvanced">
          <n-form-item path="server" :show-label="false">
            <n-input v-model:value="form.server" :placeholder="t('login.server_address')" size="large">
              <template #prefix><AppIcon name="server" :size="16" /></template>
            </n-input>
          </n-form-item>
          <p class="hint">{{ t('login.server_address_hint') }}</p>
          <n-form-item path="assets" :show-label="false">
            <n-input v-model:value="form.assets" :placeholder="t('login.assets_address')" size="large">
              <template #prefix><AppIcon name="image" :size="16" /></template>
            </n-input>
          </n-form-item>
          <p class="hint">{{ t('login.assets_address_hint') }}</p>
        </n-collapse-transition>

        <n-button
          type="primary"
          size="large"
          block
          attr-type="submit"
          :loading="loading"
          class="submit-btn"
        >
          {{ t('login.login') }}
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Base64 } from 'js-base64'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDropdown,
  NCollapseTransition,
} from 'naive-ui'

import AppIcon from '@/components/AppIcon.vue'
import service, { applyApiBase } from '@/plugins/axios'
import { getStoredApiBase, setStoredApiBase } from '@/config'
import { getStoredAssetsBase, setStoredAssetsBase } from '@/utils/img_getter'
import { appStore } from '@/store/app'
import { userStore } from '@/store/user'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const app = appStore()
const user = userStore()

const formRef = ref(null)
const userInputRef = ref(null)
const tokenInputRef = ref(null)
onMounted(() => (mode.value === 'token' ? tokenInputRef.value : userInputRef.value)?.focus())
const loading = ref(false)

// 'password' (a player / admin account) or 'token' (the server's API_TOKEN).
const readMode = () => {
  try {
    return localStorage.getItem('login_mode') === 'token' ? 'token' : 'password'
  } catch (e) {
    return 'password'
  }
}
const mode = ref(readMode())
const setMode = (m) => {
  mode.value = m
  try {
    localStorage.setItem('login_mode', m)
  } catch (e) {
    /* ignore */
  }
}
const showAdvanced = ref(!!getStoredApiBase() || !!getStoredAssetsBase())

const form = reactive({
  username: '',
  password: '',
  apiToken: '',
  server: getStoredApiBase(),
  assets: getStoredAssetsBase(),
})

const rules = {
  username: {
    required: true,
    trigger: ['blur', 'input'],
    validator: (_r, v) => (v && v.length <= 64 ? true : new Error(t('login.username_required'))),
  },
  password: {
    required: true,
    trigger: ['blur', 'input'],
    validator: (_r, v) =>
      v && v.length >= 6 && v.length <= 64 ? true : new Error(t('login.password_required')),
  },
  apiToken: {
    required: true,
    trigger: ['blur', 'input'],
    validator: (_r, v) => (v && v.trim() ? true : new Error(t('login.token_required'))),
  },
}

const langOptions = [
  { label: '中文', key: 'zh-CN' },
  { label: 'English', key: 'en-US' },
]
const changeLang = (val) => {
  locale.value = val
  try {
    localStorage.setItem('lang', val)
  } catch (e) {
    /* ignore */
  }
}

const submit = () => {
  if (loading.value) return // guard against a double submit racing two logins
  formRef.value?.validate((errors) => {
    if (errors) return
    setStoredApiBase(form.server.trim())
    setStoredAssetsBase(form.assets.trim())
    applyApiBase()
    loading.value = true
    const goHome = () => {
      const r = route.query.redirect
      const target =
        typeof r === 'string' && r.startsWith('/') && !r.startsWith('/login') ? r : '/'
      router.push(target)
    }
    const attempt =
      mode.value === 'token'
        ? user.login_with_api_token(form.apiToken.trim()).then(goHome)
        : service
            .post('/token', { auth: Base64.encode(form.username + ':' + form.password) })
            .then((res) => {
              user.token = res.data.token
              user.user_id = res.data.user_id
              goHome()
            })
    attempt
      .catch(() => {
        // error message already surfaced by the axios interceptor
      })
      .finally(() => {
        loading.value = false
      })
  })
}
</script>

<style scoped>
.login-stage {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 18px;
  position: relative;
}
.login-controls {
  position: absolute;
  top: 22px;
  right: 24px;
  display: flex;
  gap: 10px;
}
.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-2);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.icon-btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
}
.login-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
  border-radius: 20px;
}
.login-card :deep(.n-card__content) {
  padding: 34px 30px;
}
/* The card centers its brand/title; form controls must stay left-aligned so
   placeholders and typed text don't float to the middle. */
.login-card :deep(.n-form) {
  text-align: left;
}
.brandmark {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 10px 26px -8px var(--ring);
}
.brandmark svg {
  width: 30px;
  height: 30px;
}
.title {
  font-size: 23px;
  font-weight: 600;
  margin: 0;
}
.subtitle {
  color: var(--text-muted);
  font-size: 13px;
  margin: 6px 0 22px;
}
.submit-btn {
  margin-top: 8px;
  font-weight: 600;
}
.adv-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-muted);
  cursor: pointer;
  margin: 2px 0 10px;
  user-select: none;
}
.adv-toggle:hover {
  color: var(--text-2);
}
.mode {
  display: inline-flex;
  margin-bottom: 16px;
}
.segmented {
  padding: 3px;
  gap: 3px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-2);
}
.segmented button {
  font-family: 'Chakra Petch', monospace;
  font-size: 12px;
  padding: 6px 14px;
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
.hint.warn {
  color: #e0a04a;
}
.hint {
  font-size: 11.5px;
  color: var(--text-muted);
  text-align: left;
  margin: -4px 0 12px;
  line-height: 1.5;
}
</style>
