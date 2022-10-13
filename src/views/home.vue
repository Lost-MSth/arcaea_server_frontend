<template>
  <v-layout class="primary fill-height" row>
    <arc_routebar />
    <v-main>
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup>
import arc_routebar from './routebar.vue'
</script>