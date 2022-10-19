<template>
    <v-text-field :label="user_labels[user_select_way]" v-model="props.modelValue.value">
        <template v-slot:prepend>
            <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" @click="change_user_select_way">
                        {{ user_icons[user_select_way] }}
                    </v-icon>
                </template>
                {{$t('form.change_user_select_way')}}
            </v-tooltip>
        </template>
    </v-text-field>
</template>

<script setup>
// 用户身份输入框
// 需要v-model传初始值reactive({ 'key': 'user_id', 'value': '' })
import { ref } from 'vue'

const props = defineProps(['modelValue'])

const user_icons = ['mdi-account', 'mdi-account-search', 'mdi-account-search-outline']
const user_labels = ['User ID', 'User Name', 'User Code']
const user_select_ways = ['user_id', 'name', 'user_code']
const user_select_way = ref(0)

const change_user_select_way = () => {
    user_select_way.value = (user_select_way.value + 1) % 3
    props.modelValue.key = user_select_ways[user_select_way.value]
}
</script>