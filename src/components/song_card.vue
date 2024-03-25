<template>
    <v-card min-width="250" :loading="props.loading" class="overflow-auto">
        <div class="d-flex justify-space-between">
            <div>
                <v-card-title>
                    {{ song.value.name }}
                </v-card-title>
                <v-card-subtitle>
                    {{ song.value.song_id }}
                </v-card-subtitle>
                <v-card-text>
                    <v-chip-group v-model="props.difficulty_selected.difficulty" filter variant="outlined"
                        :disabled="props.loading">
                        <v-chip v-for="(_, index) in 5" label class="mx-2 text-button font-weight-bold"
                            :color="'difficulty_' + index">
                            {{ difficulty_short_name[index] + ": " + (chart_consts[index] >= 0 ?
                                chart_consts[index].toFixed(1) :
                                "N/A") }}
                        </v-chip>
                    </v-chip-group>
                </v-card-text>
            </div>
            <v-avatar class="px-2 my-2" size="125" rounded="0">
                <v-img :src="song_img_url"></v-img>
            </v-avatar>
        </div>
    </v-card>
</template>

<script setup>
// difficulty_selected.difficulty: 0~3 / undefined  这是为了避免readonly
import { difficulty_short_name } from '@/config/index.js';
import { computed } from 'vue';
import { get_song_img } from '@/utils/img_getter.js'

const props = defineProps(['song', 'difficulty_selected', 'loading'])

const chart_consts = computed(() => {
    return props.song.value.charts.map(chart => chart.chart_const)
})

const song_img_url = computed(() => {
    return get_song_img(props.song.value.song_id)
})

</script>