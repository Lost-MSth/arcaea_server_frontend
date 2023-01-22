<template>
  <v-container class="fill-height">
    <v-row align="center" class="fill-height">
      <v-col align="center" cols="12" md="6" lg="4" offset-lg="4" offset-md="3" align-self="center">
        <v-card elevation="8" class="mx-auto px-6 py-8" max-width="450">
          <v-card-title class="text-h5">
            <span class="title">{{ $t('login.title') }}</span>
          </v-card-title>
          <br>
          <v-form @submit.prevent="submitForm()" v-model="valid" lazy-validation disable="logining">
            <v-text-field outlined clearable v-model="ruleForm.username" :rules="rules.username" :label="t('login.username')"
              required :readonly="logining">
            </v-text-field>
            <v-text-field outlined clearable v-model="ruleForm.password" :rules="rules.password" :label="t('login.password')"
              type="password" required :readonly="logining"></v-text-field>
            <br>
            <v-btn block size="large" :disabled="!valid" color="success" class="mr-4" type="submit" :loading="logining">
              {{ $t('login.login') }}
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
import { userStore } from '@/store/user'
import { reactive, ref, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

let Base64 = require('js-base64').Base64
const $axios = inject('$axios')
const router = useRouter()
const user = userStore()
const { t } = useI18n()

const valid = ref(true)
const logining = ref(false)
const ruleForm = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [
    v => (!!v && v.length <= 64) || t('login.username_required')
  ],
  password: [
    v => (v.length >= 6 && v.length <= 64) || t('login.password_required')
  ]
})

const submitForm = async () => {
  logining.value = true
  $axios.post('/token', { 'auth': Base64.encode(ruleForm.username + ':' + ruleForm.password) }).then(res => {
    logining.value = false
    user.token = res.data.token
    user.user_id = res.data.user_id
    router.push('/')
  }).catch(e => {
    logining.value = false
  })
}
</script>