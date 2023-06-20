<template>
    <select_card :loading="loading" :submit_function="select_song">
        <template #title>
            {{ $t('song.song_search_title') }}
        </template>
        <template #subtitle>
            <i18n-t keypath="song.song_search_subtitle" tag="span">
                <template #br>
                    <br />
                </template>
            </i18n-t>
        </template>
        <song_id_name v-model="song_dict" :rules="[required]" :readonly="loading" clearable />
    </select_card>
    <v-sheet class="my-2 mx-auto" max-width="1000">
        <song_card v-if="song.value" :song="song" :difficulty_selected="difficulty_selected" :loading="loading"
            elevation="1"></song_card>
        <rank_card v-for="(item, index) in rank_list.data" :key="index" :data="item" />
    </v-sheet>
</template>

<script setup>
import song_card from '@/components/song_card.vue'
import select_card from '@/components/select_card.vue'
import song_id_name from '@/components/text_field/song_id_name.vue'
import rank_card from '@/components/rank_card.vue'
import { reactive, ref, inject, watch } from 'vue'

const $axios = inject('$axios')

const loading = ref(false)
const song_dict = reactive({ 'key': 'song_id', 'value': '' })

const song = reactive({})
const difficulty_selected = reactive({ 'difficulty': undefined })

const rank_list = reactive({ data: [] })

const select_song = async () => {
    loading.value = true
    difficulty_selected.difficulty = undefined
    $axios._get('/songs', { 'fuzzy_query': { [song_dict.key]: song_dict.value } }).then(res => {
        song.value = res.data[0]
        loading.value = false
        // $axios.get('/users/' + user.value.user_id + '/b30').then(res => {
        //     user.value.b30_ptt = res.data.b30_ptt
        //     user.value.b30_scores = res.data.data
        //     loading.value = false
        // }).catch(err => {
        //     console.log(err)
        //     loading.value = false
        // })
    }).catch(err => {
        loading.value = false
        console.log(err)
    })
}

const get_song_ranklist = async () => {
    loading.value = true
    $axios._get('/songs/' + song.value.song_id + '/' + difficulty_selected.difficulty + '/rank', { 'limit': 20 }).then(res => {
        // console.log(res.data)
        rank_list.data = res.data
        loading.value = false
    }).catch(err => {
        loading.value = false
        console.log(err)
    })
}

watch(difficulty_selected, () => {
    if (difficulty_selected.difficulty !== undefined) {
        get_song_ranklist()
    } else {
        rank_list.data = []
    }
    // console.log(difficulty_selected.difficulty)
})

const required = (v) => { return (!!v && v.length <= 256) || 'Required' }
</script>