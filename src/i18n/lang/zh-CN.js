export const main = {
  title: 'Arcaea Server',
  select: '查询',
}


export const login = {
  title: '用户登录',
  username: '用户名',
  password: '密码',
  login: '登录',
  username_required: '请输入正确的用户名',
  password_required: '请输入正确的密码',
  error: '用户名或密码错误',
  logout: '退出登录'
};

export const route = {
  home: '首页',
  dashboard: '仪表盘',
  test: '测试',
  user: '用户',
  user_info: '查询用户信息',
  profile: '个人信息',
  system: '系统',
  song: '曲目',
  song_info: '全部曲目信息',
  song_search: '查询曲目信息',
}


export const error = {
  unknown: '未知异常',
  timeout: '请求超时',
  status: {
    401: '未授权',
    403: '禁止访问',
    429: '请求过于频繁',
  },
  1: '见状态码',
  2: '无数据',
  3: '无数据或无此用户',
  4: '数据已存在',
  100: '错误的post数据',
  101: '错误的数据类型',
  102: '错误的查询参数',
  103: '错误的排序参数',
  104: '错误的排序顺序参数',
  200: '无权限',
  201: '错误的用户名或密码',
  202: '用户已被封禁',
  203: '用户名已存在',
  204: '邮箱地址已存在',
  205: '登录尝试次数过多',
  999: '未知错误'
};

export const user = {
  join_date: '注册日期',
  ticket: '记忆源点',
  b30_ptt: 'Best 30 潜力值',
  r10_ptt: 'Recent Top 10 潜力值',
  user_select_title: '查询用户信息',
}

export const score = {
  rating: '谱面评价',
  time_played: '取得日期',
}

export const form = {
  search: '查找',
  change_user_select_way: '点击切换用户身份类型',
  change_song_select_way: '点击切换歌曲名称类型',
  ok: '确定',
  cancel: '取消',
  delete_confirm: '点击确定以执行删除操作',
  save: '保存',
}

export const validate = {
  required: '必填',
  is_number: '必须为数字',
  is_email: '必须为合法邮箱地址',
  only_one_decimal_place: '只能有一位小数',
}


export const song = {
  song_info_title: '全部曲目信息',
  song_info_subtitle: 'CC：谱面定数，最多为一位小数{br}' +
    '谱面定数不存在请填入负数，在默认情况下会作为 Unranked 谱面{br}' +
    'Song Name 允许留空',
  song_search_title: '查询曲目信息',
  song_search_subtitle: '可切换查询方式为 Song Name 或 Song ID，是模糊查询{br}' +
  '选择难度可以查看排行榜前 20 名',
}