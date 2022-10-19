<template>
    <v-card class="mx-auto my-6 pa-4" max-width="1000">
        <v-card-title>
            <div class="text-h5">
                <slot name="title"></slot>
            </div>
        </v-card-title>
        <v-card-subtitle>
            <div class="text-body-2">
                <slot name="subtitle"></slot>
            </div>
        </v-card-subtitle>
        <v-card-text>
            <div class="text-body-1">
                <slot name="body"></slot>
            </div>
            <v-form v-model="form" @submit.prevent="submit_function">
                <slot></slot>
                <br />
                <v-btn block color="primary" :loading="props.loading" type="submit" :disabled="!form">
                    {{$t('form.search')}}
                </v-btn>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref } from 'vue'

const form = ref(true)
const props = defineProps(['submit_function', 'loading'])


const submit_function = async () => {
    if (!form) return
    await props.submit_function()
}
</script>
