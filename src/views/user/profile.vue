<template>
    <user_info :user="user" :loading="loading" />
</template>

<script setup>
import user_info from '@/components/user_info.vue'
import { userStore } from '@/store/user'
import { onMounted, ref } from 'vue'

const user = userStore()
const loading = ref(false)

onMounted(() => {
    loading.value = true
    user.get_user_b30()
    //user.get_user_recent()
    loading.value = false
})
</script>