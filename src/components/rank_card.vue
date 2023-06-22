<template>
    <v-card min-width="300">
        <v-row class="mx-2 my-1">
            <v-col cols="1">
                <div class="text-h5 font-weight-bold">
                    #{{ data.rank }}
                </div>
            </v-col>
            <v-col cols="3">
                <div class="font-weight-black">
                    {{ data.name }}
                </div>
                <div class="text-h6 font-weight-bold">
                    {{ data.score.toLocaleString('en-US') }}
                </div>
            </v-col>
            <v-col>
                <div class="text-subtitle-1">
                    {{ clear_type_name[data.clear_type] }} ({{ clear_type_name[data.best_clear_type] }})
                </div>
                <div class="text-body-2">
                    {{ t('score.time_played') }}:
                    {{ moment(data.time_played * 1000).fromNow() }}
                    <v-tooltip activator="parent" location="top">
                        {{ moment(data.time_played * 1000).format('YYYY-MM-DD HH:mm:ss Z') }}
                    </v-tooltip>
                </div>
            </v-col>
            <v-col cols="3">
                <div class="text-caption">
                    PURE: {{ data.perfect_count }} ({{ data.shiny_perfect_count }})
                    <br />
                    FAR: {{ data.near_count }}
                    <br />
                    LOST: {{ data.miss_count }}
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>
<script setup>

import moment from 'moment';
import { useI18n } from 'vue-i18n';
import { clear_type_name } from '@/config';
import { computed } from 'vue';

const { t } = useI18n();
moment.locale(localStorage.getItem('lang') || "en-US");

const props = defineProps({
    data: {
        type: Object,
        required: true,
    },
})

const data = computed(() => props.data)

</script>