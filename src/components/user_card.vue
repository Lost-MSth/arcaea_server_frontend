<template>
    <v-card min-width="300" max-width="800">
        <v-card-title>
            <v-layout>
                <span class="font-weight-black text-h5">{{props.user.name}}</span>
                <v-chip v-if="props.user.is_banned" label class="mx-2 text-button font-weight-bold" color="red">
                    BANNED
                </v-chip>
                <v-spacer />
                <div class="text-h5 font-weight-bold">
                    {{(props.user.rating_ptt / 100).toFixed(2)}}
                </div>
            </v-layout>
        </v-card-title>
        <v-card-subtitle>
            User ID: {{props.user.user_id}}
            <br />
            User Code: {{props.user.user_code}}
        </v-card-subtitle>
        <v-card-text>
            <div class="text-body-2">
                {{t('user.ticket')}}: {{props.user.ticket}}
            </div>
            <div class="text-body-2">
                {{t('user.join_date')}}:
                {{moment(props.user.join_date).utc().format('YYYY-MM-DD HH:mm:ss UTC')}}
            </div>
            <div class="text-body-2" v-if="props.user.b30_ptt">
                {{t('user.b30_ptt')}}: {{props.user.b30_ptt.toFixed(4)}}
            </div>
            <div class="text-body-2" v-if="props.user.r10_ptt">
                {{t('user.r10_ptt')}}: {{props.user.r10_ptt.toFixed(4)}}
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup>
import moment from 'moment';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const props = defineProps(['user'])
</script>