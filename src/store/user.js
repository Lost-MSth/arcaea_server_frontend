import router from '@/router';
import { async_routes } from '@/router/permission.js';
import {
    defineStore
} from 'pinia';

import axios from '../plugins/axios';

const has_permission = (powers, route) => {
    if (route.meta && route.meta.powers) {
        return powers.some((power) => {
            if (route.meta?.powers !== undefined) {
                return route.meta.powers.includes(power)
            } else {
                return false
            }
        })
    } else {
        return true
    }
}

const filter_routes = (routes, powers) => {
    const res = []
    routes.forEach((route) => {
        const r = { ...route }
        if (has_permission(powers, r)) {
            if (r.children) {
                r.children = filter_routes(r.children, powers)
            }
            res.push(r)
        }
    })
    return res
}


export const userStore = defineStore("user", {
    state: () => {
        return {
            token: null,
            role: null,
            powers: [],
            user_id: null,
            user_code: null,
            name: null,
            rating_ptt: null,
            is_hide_rating: false,
            join_date: null,
            ticket: null,
            character: {
                character_id: null,
                is_uncapped: false,
                is_uncapped_override: false,
            },
            b30_ptt: null,
            r10_ptt: null,
            b30_scores: [],
            r30_scores: [],
        };
    },
    persist: {
        paths: ['token', 'role', 'powers', 'user_id', 'user_code']
    },
    getters: {
        accessed_routes() {
            return filter_routes(async_routes, this.powers)
        },
        // character_id_display() {
        //     return this.character.character_id
        // }
    },
    actions: {
        async get_user_info() {
            await axios.get('/users/' + this.user_id).then(res => {
                this.user_code = res.data.user_code
                this.name = res.data.name
                this.rating_ptt = res.data.rating
                this.is_hide_rating = res.data.is_hide_rating
                this.ticket = res.data.ticket
                this.join_date = res.data.join_date

                this.character.character_id = res.data.character
                res.data.character_stats.find((char) => {
                    if (char.character_id === this.character.character_id) {
                        this.character.is_uncapped = char.is_uncapped
                        this.character.is_uncapped_override = char.is_uncapped_override
                        return true
                    }
                    return false
                })

            })
        },
        async get_user_role() {
            await axios.get('/users/' + this.user_id + '/role').then(res => {
                this.role = res.data.role
                this.powers = res.data.powers
            })
        },
        generate_routes() {
            this.accessed_routes.forEach((route) => {
                router.addRoute('home', route)
            })
        },
        async get_user_b30() {
            await axios.get('/users/' + this.user_id + '/b30').then(res => {
                this.b30_ptt = res.data.b30_ptt
                this.b30_scores = res.data.data
            })
        },
        async get_user_recent() {
            await axios.get('/users/' + this.user_id + '/r30').then(res => {
                this.r10_ptt = res.data.r10_ptt
                this.r30_scores = res.data.data
            })
        }
    }
});