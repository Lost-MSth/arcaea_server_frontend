<template>
    <v-snackbar v-for="(item, i) in message.messages.filter(s => s.showing)" :key="item.key" v-model="item.showing"
        :color="item.color" elevation="24" :timeout="item.timeout" :style="`top: ${i * 60 + 30}px`" location="top">
        <v-icon v-if="item.icon" size="large" start>{{ item.icon }}</v-icon>
        {{ item.text }}
    </v-snackbar>
</template>

<script setup>
import { messageStore } from '@/store/message'
const message = messageStore()
</script>