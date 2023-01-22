<template>
    <v-card>
        <v-card-title>
            <span class="text-h5">{{ props.title }}</span>
        </v-card-title>

        <v-form v-model="form" ref="form_ref">

            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6" md="4" v-for="item in props.items" :key="item.key">
                            <v-text-field v-model="item.value" :label="item.title || item.key" :readonly="judge_readonly(item)"
                                :rules="item.rules"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>

            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="props.close">
                    {{ t('form.cancel') }}
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="submit">
                    {{ t('form.save') }}
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const form = ref(true)

const form_ref = ref(null)

const { t } = useI18n()
const props = defineProps({
    title: {
        type: String,
        default: 'New Item'
    },
    items: {
        type: Array,
        default: () => ([])
    },
    close: {
        type: Function,
        default: () => { }
    },
    save: {
        type: Function,
        default: () => { }
    }
})

const judge_readonly = (item) => {
    return item.hasOwnProperty('type') && item.type === 'primary_key'
}

const submit = () => {
    form_ref.value.validate().then((res) => {
        if (res.valid) {
            props.save()
        }
    })
}

</script>