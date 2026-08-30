<template>
  <div class="login-stage">
    <div class="login-controls">
      <n-dropdown trigger="click" :options="langOptions" @select="changeLang">
        <button class="icon-btn" :aria-label="t('common.language')"><AppIcon name="language" :size="18" /></button>
      </n-dropdown>
      <button v-if="app.showThemeToggle" class="icon-btn" :aria-label="t('common.theme')" @click="app.toggleTheme()">
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

      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="submit">
        <n-form-item path="username" :show-label="false">
          <n-input
            v-model:value="form.username"
            :placeholder="t('login.username')"
            :input-props="{ autocomplete: 'username' }"
            size="large"
          >
            <template #prefix><AppIcon name="person" :size="18" /></template>
          </n-input>
        </n-form-item>
        <n-form-item path="password" :show-label="false">
          <n-input
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            :placeholder="t('login.password')"
            :input-props="{ autocomplete: 'current-password' }"
            size="large"
          />
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
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
import { appStore } from '@/store/app'
import { userStore } from '@/store/user'

const { t, locale } = useI18n()
const router = useRouter()
const app = appStore()
const user = userStore()

const formRef = ref(null)
const loading = ref(false)
const showAdvanced = ref(!!getStoredApiBase())

const form = reactive({
  username: '',
  password: '',
  server: getStoredApiBase(),
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
    applyApiBase()
    loading.value = true
    service
      .post('/token', { auth: Base64.encode(form.username + ':' + form.password) })
      .then((res) => {
        user.token = res.data.token
        user.user_id = res.data.user_id
        router.push('/')
      })
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
.hint {
  font-size: 11.5px;
  color: var(--text-muted);
  text-align: left;
  margin: -4px 0 12px;
  line-height: 1.5;
}
</style>
