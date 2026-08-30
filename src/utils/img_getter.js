import { resolveApiBase } from '@/config'

// Static assets (jackets, character icons) live next to the API, so derive
// their host from the API base. Same-origin -> '/static'; remote backend ->
// 'https://host/static'. This keeps images working in every deployment mode.
function staticBase() {
  const base = resolveApiBase()
  try {
    if (/^https?:\/\//i.test(base)) {
      return new URL(base).origin + '/static'
    }
  } catch (e) {
    /* fall through */
  }
  return '/static'
}

export const get_char_icon = (char_id, is_uncapped = false, is_uncapped_override = false) => {
  const uncapped = is_uncapped && !is_uncapped_override
  return staticBase() + '/char/' + char_id + (uncapped ? 'u' : '') + '_icon.png'
}

export const get_song_img = (song_id, is_256 = true) => {
  return staticBase() + '/songs/' + song_id + (is_256 ? '/1080_base_256.jpg' : '/1080_base.jpg')
}
