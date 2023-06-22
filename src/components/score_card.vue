<template>
    <v-card>
        <v-card-title>
            <v-layout class="overflow-auto">
                <span class="font-weight-black">{{ score.song_name }}</span>
                <div>
                    <v-chip label class="mx-2 text-button font-weight-bold" :color="'difficulty_' + score.difficulty">
                        {{ difficulty_short_name[score.difficulty] }}
                    </v-chip>
                </div>
                <v-spacer />
                <div class="text-h5 font-weight-bold" v-if="rank">
                    #{{ rank }}
                </div>
            </v-layout>
        </v-card-title>
        <v-card-subtitle class="overflow-auto">
            {{ score.song_id }}
        </v-card-subtitle>
        <v-card-text>
            <v-row>
                <v-col cols="8">
                    <div class="text-h5 font-weight-bold">
                        {{ score.score.toLocaleString('en-US') }}
                    </div>
                    <div class="text-subtitle-1">
                        {{ clear_type_name[score.clear_type] }} ({{ clear_type_name[score.best_clear_type] }})
                    </div>
                    <div class="text-body-2">
                        {{ t('score.rating') }}: {{ score.rating.toFixed(4) }}
                    </div>
                    <div class="text-body-2">
                        {{ t('score.time_played') }}:
                        {{ moment(score.time_played * 1000).fromNow() }}
                        <v-tooltip activator="parent" location="top">
                            {{ moment(score.time_played * 1000).format('YYYY-MM-DD HH:mm:ss Z') }}
                        </v-tooltip>
                    </div>
                </v-col>
                <v-col cols="4">
                    <div class="text-body-1">
                        <div>
                            PURE: {{ score.perfect_count }} ({{ score.shiny_perfect_count }})
                        </div>
                        <div>
                            FAR: {{ score.near_count }}
                        </div>
                        <div>
                            LOST: {{ score.miss_count }}
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import moment from 'moment';
import { useI18n } from 'vue-i18n';
import { clear_type_name, difficulty_short_name } from '@/config';

const { t } = useI18n()
moment.locale(localStorage.getItem('lang') || "en-US");

const props = defineProps(['score', 'rank'])
const score = props.score
const rank = props.rank
</script>