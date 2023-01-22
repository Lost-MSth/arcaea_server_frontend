<template>
    <v-row class="my-6">
        <v-spacer />
        <v-card width="1000" class="mx-2">
            <user_card :user="props.user" elevation="0" />
            <v-card class="my-2" :loading="props.loading" elevation="0">
                <v-card-title>
                    <div class="font-weight-bold text-h5">
                        Best 30
                    </div>
                </v-card-title>
                <v-row class="mx-auto my-4">
                    <v-col lg="6" cols="12" v-for="(value, key) in props.user.b30_scores" :key="key"
                        class="d-flex justify-center">
                        <score_card variant="flat" :score="value" :rank="key + 1" class="flex-grow-1" />
                    </v-col>
                </v-row>
            </v-card>
        </v-card>
        <v-spacer />
    </v-row>
</template>

<script setup>
import score_card from './score_card.vue'
import user_card from './user_card.vue'

const props = defineProps(['user', 'loading'])

</script>