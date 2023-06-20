import i18n from '../i18n'

const { t } = i18n.global


export const is_number = (v) => {
    return !isNaN(v) || t('validate.is_number');
}

export const only_one_decimal_place = (v) => {
    if (typeof(v) != 'string') {
        v = v.toString();
    }
    let x = v.split('.');
    return (x.length == 1 || (x.length == 2 && x[1].length <= 1)) || t('validate.only_one_decimal_place');
}

export const required = (v) => {
    return !!v && v.length > 0 || t('validate.required');
}