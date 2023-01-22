import i18n from '../i18n'

const { t } = i18n.global


export const is_number = (v) => {
    return !isNaN(v) || t('validate.is_number');
}

export const required = (v) => {
    return !!v && v.length > 0 || t('validate.required');
}