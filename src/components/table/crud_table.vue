<template>
    <v-data-table density="compact" :headers="props.headers" :items="data" :search="search"
        :show-select="props.delete_data !== undefined || props.put_data !== undefined" multi-sort v-model="selected"
        return-object>
        <template v-slot:top>
            <v-toolbar flat class="overflow-auto">
                <v-toolbar-title v-if="props.title.length > 0">{{ props.title }}</v-toolbar-title>
                <v-spacer v-if="props.title.length > 0" />
                <v-responsive min-width="125">
                <v-text-field v-model="search" class="mx-4" prepend-icon="mdi-magnify" label='Search'
                    single-line hide-details density="compact" variant="underlined"></v-text-field>
                </v-responsive>
                <v-spacer v-if="props.title.length === 0" />
                <v-dialog v-model="new_dialog" max-width="500" v-if="props.post_data !== undefined">
                    <template v-slot:activator="{ props }">
                        <v-btn color="primary" v-bind="props">
                            New Item
                        </v-btn>
                    </template>
                    <item_card :save="save_new_item" :close="close_new_dialog" v-model:items="props.new_items" />
                </v-dialog>
                <v-dialog v-model="edit_dialog" max-width="500" v-if="props.put_data !== undefined">
                    <template v-slot:activator="{ props }">
                        <v-btn color="secondary" v-bind="props" :disabled="selected == undefined || selected.length !== 1"
                            @click="init_edit">
                            Edit
                        </v-btn>
                    </template>
                    <item_card title="Edit Item" :save="save_edit_item" :close="close_edit_dialog"
                        v-model:items="props.put_items" />
                </v-dialog>
                <v-dialog v-model="delete_dialog" max-width="500" v-if="props.delete_data !== undefined">
                    <template v-slot:activator="{ props }">
                        <v-btn color="error" v-bind="props" :disabled="selected == undefined || selected.length <= 0">
                            Delete
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="text-h5 my-2">{{ t('form.delete_confirm') }}</v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="close_delete_dialog">{{
                                t('form.cancel')
                            }}</v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="delete_items">{{ t('form.ok') }}</v-btn>
                            <v-spacer></v-spacer>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-toolbar>
        </template>
    </v-data-table>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import item_card from './item_card.vue'

const { t } = useI18n()

const new_dialog = ref(false)
const edit_dialog = ref(false)
const delete_dialog = ref(false)

const search = ref('')
const selected = ref([])
const data = ref([])


const close_delete_dialog = () => {
    delete_dialog.value = false
}

const delete_items = () => {
    props.delete_data(selected.value).then(res => {
        close_delete_dialog()
        // get_table_data()
        // console.log(res)
        if (res) { return }
        selected.value.forEach((item) => {
            data.value.splice(data.value.indexOf(item), 1)
        })
        selected.value = []
    })
}

const close_new_dialog = () => {
    new_dialog.value = false
}

const save_new_item = () => {
    let item = {}
    props.new_items.forEach((x) => {
        item[x.key] = x.value
    })
    props.post_data(item).then(res => {
        close_new_dialog()
        // get_table_data()
        // console.log(res)
        if (res.code !== 0) { return }
        data.value.push(item)
    })
}

const close_edit_dialog = () => {
    edit_dialog.value = false
}

const init_edit = () => {
    props.put_items.forEach((item) => {
        item.value = selected.value[0][item.key]
    })
}

const save_edit_item = () => {
    let item = {}
    let key_number = 0
    props.put_items.forEach((x) => {
        if (x.value != selected.value[0][x.key]) {
            item[x.key] = x.value
        } else if (x.hasOwnProperty('type') && x.type === 'primary_key') {
            key_number++
            item[x.key] = x.value
        }
    })
    if (key_number === Object.keys(item).length) {
        close_edit_dialog()
        return
    }
    props.put_data(item).then(res => {
        close_edit_dialog()
        //get_table_data()
        if (res.code !== 0) { return }
        for (let key in item) {
            selected.value[0][key] = item[key]
        }
        selected.value = []
    })
}

const props = defineProps({
    get_data: {
        type: Function,
        default: () => { }
    },
    put_data: {
        type: Function,
        default: undefined
    },
    post_data: {
        type: Function,
        default: undefined
    },
    delete_data: {
        type: Function,
        default: undefined
    },
    headers: {
        type: Array,
        default: () => []
    },
    new_items: {
        type: Array,
        default: () => []
    },
    put_items: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: ''
    }
})

const get_table_data = () => {
    props.get_data().then(res => {
        data.value = res
    })
}

onMounted(() => {
    get_table_data()
})

</script>