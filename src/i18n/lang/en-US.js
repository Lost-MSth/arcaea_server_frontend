export const main = {
  title: 'Arcaea Server',
  select: 'Search',
}

export const login = {
  title: 'User Login',
  username: 'Username',
  password: 'Password',
  login: 'Login',
  username_required: 'Please enter the correct username',
  password_required: 'Please enter the correct password',
  error: 'Username or password is incorrect',
  logout: 'Logout'
};

export const route = {
  home: 'Main',
  dashboard: 'Dash',
  test: 'Test',
  user: 'User',
  profile: 'Profile',
  user_info: 'Search User',
  system: 'System',
  song: 'Song',
  song_info: 'All Song Info',
  song_search: 'Search Song',
}

export const error = {
  unknown: 'Unknow error',
  timeout: 'Timeout',
  status: {
    401: 'Unauthorized',
    403: 'Forbidden',
    429: 'Too many requests',
  },
  1: 'See status code',
  2: 'No data',
  3: 'No data or user',
  4: 'Data exist',
  100: 'Wrong post data',
  101: 'Wrong data type',
  102: 'Wrong query parameter',
  103: 'Wrong sort parameter',
  104: 'Wrong sort order parameter',
  200: 'No permission',
  201: 'Wrong username or password',
  202: 'User is banned',
  203: 'Username exists',
  204: 'Email address exists',
  205: 'Too many login attempts',
  999: 'Unknown error'
};

export const user = {
  join_date: 'Join date',
  ticket: 'Memories',
  b30_ptt: 'Best 30 Potential',
  r10_ptt: 'Recent Top 10 Potential',
  user_select_title: 'Search user',
}

export const score = {
  rating: 'Rating',
  time_played: 'Time played',
}

export const form = {
  search: 'Search',
  change_user_select_way: 'Click to change user identify type',
  change_song_select_way: 'Click to change song name type',
  ok: 'OK',
  cancel: 'Cancel',
  delete_confirm: 'Click OK to confirm the deletion',
  save: 'Save',
}

export const validate = {
  required: 'Required',
  is_number: 'Must be a number',
  is_email: 'Must be a valid email address',
  only_one_decimal_place: 'Can only have one decimal place',
}

export const song = {
  song_info_title: 'All Song Info',
  song_info_subtitle: 'CC: Chart Const, up to one decimal place{br}' +
    'When the chart does not exist or is unranked, its chart const should be a negative number, by default which means the chart is unranked.{br}' +
    "Song's name can be empty.",
  song_search_title: 'Search Song',
  song_search_subtitle: 'Fuzzy query by Song Name or Song ID{br}' +
  'Select difficulty to view the top 20 rankings.',
}