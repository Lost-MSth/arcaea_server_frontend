<template>
    <v-card min-width="350" :loading="props.loading">
        <v-card-title>
            {{ song.value.name }}
        </v-card-title>
        <v-card-subtitle>
            {{ song.value.song_id }}
        </v-card-subtitle>
        <v-card-text>
            <v-chip-group v-model="props.difficulty_selected.difficulty" filter variant="outlined"
                :disabled="props.loading">
                <v-chip v-for="(_, index) in 4" label class="mx-2 text-button font-weight-bold"
                    :color="'difficulty_' + index">
                    {{ difficulty_short_name[index] + ": " + (chart_consts[index] >= 0 ? chart_consts[index].toFixed(1) :
                        "N/A") }}
                </v-chip>
            </v-chip-group>
        </v-card-text>
    </v-card>
</template>

<script setup>
// difficulty_selected.difficulty: 0~3 / undefined  这是为了避免readonly
import { difficulty_short_name } from '@/config/index.js';
import { computed } from 'vue'

const props = defineProps(['song', 'difficulty_selected', 'loading'])

const chart_consts = computed(() => {
    return props.song.value.charts.map(chart => chart.chart_const)
})

</script>