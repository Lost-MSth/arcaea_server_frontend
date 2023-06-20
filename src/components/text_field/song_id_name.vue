<template>
    <v-text-field :label="song_labels[song_select_way]" v-model="props.modelValue.value">
        <template v-slot:prepend>
            <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" @click="change_user_select_way">
                        {{ song_icons[song_select_way] }}
                    </v-icon>
                </template>
                {{$t('form.change_song_select_way')}}
            </v-tooltip>
        </template>
    </v-text-field>
</template>

<script setup>
// 歌曲名称输入框
// 需要 v-model 传初始值 reactive({ 'key': 'song_id', 'value': '' })
import { ref } from 'vue'

const props = defineProps(['modelValue'])

const song_icons = ['mdi-identifier', 'mdi-text']
const song_labels = ['Song ID', 'Song Name']
const song_select_ways = ['song_id', 'name']
const song_select_way = ref(0)

const change_user_select_way = () => {
    song_select_way.value = (song_select_way.value + 1) % 2
    props.modelValue.key = song_select_ways[song_select_way.value]
}
</script>