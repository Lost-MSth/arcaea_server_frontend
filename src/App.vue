<template>
  <v-app>
    <v-main class="primary fill-height pb-5">
      <arc_message />
      <router-view></router-view>
    </v-main>
    <v-footer height="18px">
      <div class="py-1 text-center w-100">
        Made by Lost @ 2020-{{ new Date().getFullYear() }}
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import arc_message from '@/components/message.vue'

export default {
  name: 'App',

  components: {
    arc_message,
  },

  data: () => ({
    //
  }),
}
</script>
