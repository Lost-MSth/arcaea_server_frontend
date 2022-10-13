<template>
    <v-row class="my-6">
        <v-spacer />
        <v-col>
            <user_card :user="user" />
        </v-col>
        <v-spacer />
    </v-row>
    <v-card class="mx-2 mx-md-6 my-2" :loading="loading">
        <v-card-title>
            <div class="font-weight-bold text-h5">
                Best 30
            </div>
        </v-card-title>
        <v-row class="mx-auto my-6">
            <v-col md="6" lg="4" cols="12" v-for="(value, key) in user.b30_scores" :key="key" class="d-flex justify-center">
                <score_card :score="value" :rank="key+1" class="flex-grow-1" />
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import score_card from '@/components/score_card.vue'
import user_card from '@/components/user_card.vue'
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