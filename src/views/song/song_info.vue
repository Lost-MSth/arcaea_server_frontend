<template>
    <v-row class="my-6">
        <v-spacer />
        <v-card width="1000" class="my-6" :loading="loading">
            <v-card-title>
                <span class="text-h5">{{ t('song.song_info_title') }}</span>
            </v-card-title>
            <v-card-subtitle class="my-2">
                <i18n-t keypath="song.song_info_subtitle" tag="span">
                    <template #br>
                        <br />
                    </template>
                </i18n-t>
            </v-card-subtitle>
            <crud_table :headers="headers" :get_data="get_song_info" :put_data="has_power() ? put_song_info : undefined"
                :put_items="put_items" :delete_data="has_power() ? delete_song_info : undefined"
                :post_data="has_power() ? post_song_info : undefined" :new_items="new_items" />
        </v-card>
        <v-spacer />
    </v-row>
</template>

<script setup>
import { inject, ref } from 'vue'
import crud_table from '@/components/table/crud_table.vue'
import { required, is_number } from '@/utils/validate.js'
import { useI18n } from 'vue-i18n';
import { userStore } from '@/store/user';

const { t } = useI18n()
const $axios = inject('$axios')
const user = userStore()

const loading = ref(false)

const headers = [
    { key: 'song_id', title: 'Song ID' },
    { key: 'name', title: 'Song Name' },
    { key: 'chart_const_0', title: 'Past CC' },
    { key: 'chart_const_1', title: 'Present CC' },
    { key: 'chart_const_2', title: 'Future CC' },
    { key: 'chart_const_3', title: 'Beyond CC' },
]

const get_song_info = async () => {
    loading.value = true
    return await $axios.get('/songs').then(res => {
        loading.value = false
        return res.data.map(item => {
            let chart_const = [-1, -1, -1, -1]
            item.charts.forEach(element => {
                chart_const[element.difficulty] = element.chart_const
            });
            return {
                song_id: item.song_id,
                name: item.name,
                chart_const_0: chart_const[0],
                chart_const_1: chart_const[1],
                chart_const_2: chart_const[2],
                chart_const_3: chart_const[3]
            }
        })
    }).catch(e => {
        loading.value = false
    })
}

const put_song_info = async (item) => {
    let data = {}
    loading.value = true
    for (let key in item) {
        if (key.startsWith('chart_const_')) {
            data.charts = data.charts || []
            data.charts.push({
                difficulty: parseInt(key[key.length - 1]),
                chart_const: parseFloat(item[key])
            })
        } else {
            data[key] = item[key]
        }
    }
    return await $axios.put('/songs/' + item.song_id, data).then(res => {
        loading.value = false
        return res
    }).catch(e => {
        loading.value = false
    })
}

const delete_song_info = async (items) => {
    loading.value = true
    items.map((x) => {
        $axios.delete('/songs/' + x.song_id).then(res => res).catch(e => e)
    })
    loading.value = false
}

const post_song_info = async (item) => {
    let data = {}
    loading.value = true
    for (let key in item) {
        if (key.startsWith('chart_const_')) {
            data.charts = data.charts || []
            data.charts.push({
                difficulty: parseInt(key[key.length - 1]),
                chart_const: parseFloat(item[key])
            })
        } else {
            data[key] = item[key]
        }
    }
    return await $axios.post('/songs', data).then(res => {
        return res
    }).catch(e => {
        loading.value = false
    })
}


const put_items = ref([
    { key: 'song_id', title: 'Song ID', 'value': '', 'type': 'primary_key' },
    { key: 'name', title: 'Song Name', 'value': '' },
    { key: 'chart_const_0', title: 'Past CC', 'value': 0, rules: [is_number] },
    { key: 'chart_const_1', title: 'Present CC', 'value': 0, rules: [is_number] },
    { key: 'chart_const_2', title: 'Future CC', 'value': 0, rules: [is_number] },
    { key: 'chart_const_3', title: 'Beyond CC', 'value': 0, rules: [is_number] }
])

const new_items = ref([
    { key: 'song_id', title: 'Song ID', 'value': '', rules: [required] },
    { key: 'name', title: 'Song Name', 'value': '' },
    { key: 'chart_const_0', title: 'Past CC', 'value': -1, rules: [is_number] },
    { key: 'chart_const_1', title: 'Present CC', 'value': -1, rules: [is_number] },
    { key: 'chart_const_2', title: 'Future CC', 'value': -1, rules: [is_number] },
    { key: 'chart_const_3', title: 'Beyond CC', 'value': -1, rules: [is_number] }
])

const has_power = () => {
    return user.powers.includes('change')
}
</script>