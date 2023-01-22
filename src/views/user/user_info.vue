<template>
    <select_card :loading="loading" :submit_function="select_user">
        <template #title>
            {{ $t('user.user_select_title') }}
        </template>
        <user_identity v-model="user_identity_dict" :rules="[required]" :readonly="loading" clearable />
    </select_card>
    <user_info v-if="user.value" :user="user.value" :loading="loading" elevation="1" />
</template>

<script setup>
import select_card from '@/components/select_card.vue'
import user_info from '@/components/user_info.vue'
import user_identity from '@/components/text_field/user_identity.vue'
import { reactive, ref, inject } from 'vue'

const $axios = inject('$axios')

const loading = ref(false)

const user = reactive({})

const user_identity_dict = reactive({ 'key': 'user_id', 'value': '' })

const select_user = async () => {
    loading.value = true
    $axios._get('/users', { 'query': { [user_identity_dict.key]: user_identity_dict.value } }).then(res => {
        user.value = res.data[0]
        $axios.get('/users/' + user.value.user_id + '/b30').then(res => {
            user.value.b30_ptt = res.data.b30_ptt
            user.value.b30_scores = res.data.data
            loading.value = false
        }).catch(err => {
            console.log(err)
            loading.value = false
        })
    }).catch(err => {
        loading.value = false
        console.log(err)
    })
}
const required = (v) => { return (!!v && v.length <= 256) || 'Required' }
</script>
