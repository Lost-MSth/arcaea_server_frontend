import axios from "axios"
import {
    baseURL
} from "../config"
import {
    userStore
} from "../store/user"
import i18n from '../i18n'
import {
    messageStore
} from '../store/message'

const {
    t
} = i18n.global

axios.defaults.withCredentials = true
axios.defaults.headers["Content-Type"] = "application/json; charset=utf-8"

const service = axios.create({
    baseURL: baseURL,
    timeout: 50000
})

service.interceptors.request.use(
    config => {
        const user = userStore()
        if (user.token !== null && user.token !== '') {
            config.headers['Token'] = user.token
        }
        return config
    },
)

service.interceptors.response.use(
    response => {
        const message = messageStore()
        if (response.data.code < 0) {
            if (response.data.code === -1) {
                message.error(t('error.' + response.data.code.toString().slice(1)))
            } else {
                message.error(t('error.' + response.data.code.toString().slice(1)))
            }
            return Promise.reject(response)
        }
        return response.data
    },
    error => {
        let status = error.response.status;
        const message = messageStore();
        if (status === 401) {
            message.error(t('error.status_401'))
            userStore().$reset()
            return Promise.reject(error)
        }
        if (error.response.data.code === undefined) console.log('response err:\n' + JSON.stringify(error.response));
        if (error.response) {
            const res = error.response.data
            if (res.code !== undefined) {
                message.error(res.msg)
            } else {
                message.error(t('error.unknown'))
            }
        } else if (error.message.includes('timeout')) {
            message.error(t('error.timeout'));
        } else {
            message.error(t('error.unknown'));
        }
        return Promise.reject(error.response.data)
    }
)

export default service