<template>
    <v-row class="my-6">
        <v-spacer />
        <v-col>
            <user_card :user="props.user" />
        </v-col>
        <v-spacer />
    </v-row>
    <v-card class="mx-2 mx-md-6 my-2" :loading="props.loading">
        <v-card-title>
            <div class="font-weight-bold text-h5">
                Best 30
            </div>
        </v-card-title>
        <v-row class="mx-auto my-6">
            <v-col md="6" lg="4" cols="12" v-for="(value, key) in props.user.b30_scores" :key="key"
                class="d-flex justify-center">
                <score_card :score="value" :rank="key+1" class="flex-grow-1" />
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup>
import score_card from './score_card.vue'
import user_card from './user_card.vue'

const props = defineProps(['user', 'loading'])

</script>