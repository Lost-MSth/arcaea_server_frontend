const BASE_HOST = ''; // 'http://192.168.1.200:8081';
const CHAR_IMG_PATH = BASE_HOST + '/static/char/';
const SONG_IMG_PATH = BASE_HOST + '/static/songs/';


export const get_char_icon = (char_id, is_uncapped = false, is_uncapped_override = false) => {
    let uncapped = is_uncapped && !is_uncapped_override;
    return CHAR_IMG_PATH + char_id + (uncapped ? 'u' : '') + '_icon.png';
}

export const get_song_img = (song_id) => {
    return SONG_IMG_PATH + song_id + '/base.jpg';
}