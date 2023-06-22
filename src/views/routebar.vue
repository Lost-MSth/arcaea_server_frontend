<template>
    <v-app-bar>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="text-h5">
            <span class="font-weight-bold">{{ $t('main.title') }}</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <div>
            <v-btn icon class="mx-2" @click="toggle_theme">
                <v-icon>
                    {{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
                </v-icon>
            </v-btn>
            <v-menu location="bottom" rounded offset-y>
                <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" class="mx-2">
                        <v-icon>
                            mdi-translate
                        </v-icon>
                    </v-btn>
                </template>
                <v-list nav density="compact" min-width="80px">
                    <v-list-item rounded key="zh-CN" @click="change_lang('zh-CN')" :active="locale === 'zh-CN'">
                        <v-list-item-title>中文</v-list-item-title>
                    </v-list-item>
                    <v-list-item rounded key="en-US" @click="change_lang('en-US')" :active="locale === 'en-US'">
                        <v-list-item-title>English</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-menu location="bottom" min-width="100px" rounded offset-y>
                <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props" class="mx-2">
                        <v-avatar color="rgba(0,0,0,0)" size="large">
                            <v-img cover
                                :src="get_char_icon(user.character.character_id, user.character.is_uncapped, user.character.is_uncapped_override)"
                                :alt="user.name"></v-img>
                            <!-- <span class="white--text text-h5">{{ user.name.slice(0, 2) }}</span> -->
                        </v-avatar>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-text>
                        <div class="mx-auto text-center">
                            <h3>{{ user.name }}</h3>
                            <v-divider class="my-3"></v-divider>
                            <v-btn rounded variant="text" @click="logout()">
                                {{ $t('login.logout') }}
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>
        </div>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" bottom temporary>
        <v-list>
            <v-list-group v-for="item in items" :key="item.title" :prepend-icon="item.icon">
                <template v-slot:activator="{ props }">
                    <v-list-item v-bind="props" :title="$t('route.' + item.title)"></v-list-item>
                </template>

                <v-list-item v-for="child in item.items" :key="child.title" :title="$t('route.' + child.title)"
                    :to="child.to">
                </v-list-item>
            </v-list-group>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { userStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { get_char_icon } from '@/utils/img_getter.js'

const user = userStore()
const { locale, t } = useI18n()

const drawer = ref(false)

const generate_route_list = (routes) => {
    let route_list = []
    routes.forEach((route) => {
        let item = {
            title: route.name,
            to: route.path
        }
        if (route.meta && route.meta.icon) {
            item.icon = route.meta.icon
        }
        if (route.children) {
            item.items = generate_route_list(route.children)
        }
        route_list.push(item)

    })
    return route_list
}

const items = generate_route_list(user.accessed_routes)

const theme = useTheme()

const toggle_theme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

import moment from 'moment';

const change_lang = (val) => {
    locale.value = val;
    moment.locale(val);
    localStorage.setItem("lang", val);
}

const logout = () => {
    user.$reset()
    router.push('/login')
    router.go(0) // 刷新页面，不然无法回到登录界面
}
</script>
