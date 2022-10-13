<template>
    <v-data-table :headers="headers" :items="table_data"></v-data-table>
    <!-- <el-form>
        <slot name="filter"></slot>
        <el-form-item>
            <el-button type="primary" :loading="loading" @click="get_data">
                <el-icon style="vertical-align: middle;">
                    <Search />
                </el-icon>
                {{ t('main.select') }}
            </el-button>
        </el-form-item>
    </el-form>
    <el-table :data="table_data.slice((current_page - 1) * page_size, current_page * page_size)" style="width: 100%">
        <el-table-column prop="song_id" label="Song ID" width="150" sortable />
        <el-table-column label="Difficulty" width="100" :filters="[
            { text: 'Past', value: 0 },
            { text: 'Present', value: 1 },
            { text: 'Future', value: 2 },
            { text: 'Beyond', value: 3 }
        ]" :filter-method="filter_difficulty">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <el-tag type='dark' :class="['difficulty-' + scope.row.difficulty]"> {{
                            difficulty_name[scope.row.difficulty]
                    }} </el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="score" label="Score" width="100" sortable />
        <el-table-column prop="shiny_perfect_count" label="Shiny Pure Count" width="100" sortable />
        <el-table-column prop="perfect_count" label="Pure Count" width="100" sortable />
        <el-table-column prop="near_count" label="Far Count" width="100" sortable />
        <el-table-column prop="miss_count" label="Lost Count" width="100" sortable />
        <el-table-column prop="health" label="Health" width="100" sortable />
        <el-table-column prop="time_played" label="Played Time" width="200" :formatter="format_date" sortable />
        <el-table-column prop="best_clear_type" label="Best Clear Type" width="160" :filters="[
            { text: clear_type_name[0], value: 0 },
            { text: clear_type_name[1], value: 1 },
            { text: clear_type_name[2], value: 2 },
            { text: clear_type_name[3], value: 3 },
            { text: clear_type_name[4], value: 4 },
            { text: clear_type_name[5], value: 5 }
        ]" :filter-method="filter_clear_type">
            <template #default="scope">
                <div style="display: flex; align-items: center">
                    <el-tag type='dark' :class="['clear_type-' + scope.row.best_clear_type]"> {{
                            clear_type_name[scope.row.best_clear_type]
                    }} </el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column prop="rating" label="Rating" width="100" :formatter="format_rating" sortable />

    </el-table>
    <el-pagination v-model:current-page="current_page" v-model:page-size="page_size"
        :page-sizes="[30, 100, 200, 500, 1000]" layout="total, sizes, prev, pager, next, jumper"
        :total="table_data.length" @size-change="handleSizeChange" @current-change="handleCurrentChange" /> -->
</template>



<script setup>
import { difficulty_name, clear_type_name } from '@/config'
import { reactive, toRefs, inject } from 'vue'
import { userStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import moment from 'moment'

const user = userStore()
const { t } = useI18n()
const $axios = inject('$axios')

let state = reactive({
    loading: false,
    table_data: []
})

const headers = [
    {
        text: 'Song ID',
        sortable: true,
        value: 'song_id',
    },
    { text: 'Difficulty', value: 'difficulty' },
    { text: 'Best score', value: 'score' },
    { text: 'Carbs (g)', value: 'carbs' },
    { text: 'Protein (g)', value: 'protein' },
    { text: 'Iron (%)', value: 'iron' },
]

const get_data = () => {
    state.table_data = []
    state.loading = true
    $axios.get('/users/' + user.user_id + '/best').then(res => {
        state.loading = false
        state.table_data = res.data.data
    }).catch(err => {
        state.loading = false
        console.log(err)
    })
}

let { loading, table_data } = toRefs(state)

const handleSizeChange = (val) => {
    console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
    console.log(`current page: ${val}`)
}

const format_date = (row, column) => {
    const date = row[column.property] * 1000
    if (date === undefined) {
        return ''
    }
    return moment(date).utc().format('YYYY-MM-DD HH:mm:ss')
}
const filter_difficulty = (value, row) => {
    return row.difficulty === value
}
const filter_clear_type = (value, row) => {
    return row.best_clear_type === value
}

const format_rating = (row, column) => {
    const rating = row[column.property]
    if (rating === undefined) {
        return 0
    }
    return rating.toFixed(3)
}



</script>