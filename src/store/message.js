import {
    defineStore
} from 'pinia';

const message_type = {
    success: {
        color: 'success',
        icon: 'mdi-check-circle'
    },
    info: {
        color: 'info',
        icon: 'mdi-information'
    },
    warning: {
        color: 'warning',
        icon: 'mdi-alert-circle'
    },
    error: {
        color: 'error',
        icon: 'mdi-close-circle'
    }
}

export const messageStore = defineStore("message", {
    state: () => {
        return {
            messages: [],
        };
    },
    actions: {
        show_message(message, type = 'info', timeout = 3000) {
            let message_object = {
                text: message,
                showing: true,
                timeout: timeout,
                key: type + '-' + Math.random().toString(36),
                ...message_type[type]
            }
            this.messages = this.messages.filter((m) => m.showing).concat(message_object);
        },
        info(message) {
            this.show_message(message)
        },
        success(message) {
            this.show_message(message, 'success')
        },
        warning(message) {
            this.show_message(message, 'warning')
        },
        error(message) {
            this.show_message(message, 'error')
        }
    }
});