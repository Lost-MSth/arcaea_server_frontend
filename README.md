# Arcaea Server Frontend

> 声明：本项目目前主要由 LLM 开发，暂无人类审核。
>
> Declaration: This project is currently mainly developed by LLM and has not been reviewed by humans yet.

基于 **Vue 3 + Vite + Naive UI** 的 [Arcaea-server](https://github.com/Lost-MSth/Arcaea-server) 管理与玩家控制台（对接 `/api/v1` 管理 API）。

A management & player console for the self-hosted Arcaea server, built with Vue 3, Vite and Naive UI. Dark-first "aurora" design, fully themeable, i18n (中文/English), permission-aware UI, and a single build that can be deployed three different ways.

## 特性 Features

- 🎨 **极光风格设计**：深色 / 浅色随时切换，7 组可选主题色；全站 CSS token 驱动，字体自托管
- 🌐 **i18n**：中文 / English，右上角一键切换
- 🔐 **权限驱动**：菜单与路由按登录用户的 powers 动态生成，写操作按钮逐个显隐；玩家登录直达个人页，管理员看仪表盘
- 🎮 **玩家个人页**：Best 50 成绩（定数、PM / FR 标记）、PTT 四个分量（B50 / B30 / B10 / R10，权重来自服务端配置）、按游戏档位着色的 PTT 进度环、潜力值历史曲线（30 / 90 / 365 天）、最近游玩
- 📄 **覆盖全部管理 API**：
  | 页面 | 接口 | 说明 |
  | --- | --- | --- |
  | 仪表盘 | `/users` `/songs`（`count_only`）`/multiplay/rooms` `/system/constants` | 计数、潜力值排行榜、服务端版本 |
  | 个人信息 | `/users/<id>/brief` `/best` `/r30` `/rating` | Best 50、PTT 分量、评分曲线 |
  | 用户管理 | `/users` CRUD + `/best`（服务端分页） | 创建 / 编辑 / 封禁 / 解封、详情（Best 50 + 全部成绩） |
  | 曲目查询 | `/songs` `/songs/<id>/<diff>/rank` | 模糊搜索 + 难度排行榜（高亮自己） |
  | 曲目管理 | `/songs` CRUD | 定数编辑 |
  | 角色 | `/characters` + `/cores` | 数值 / 技能（下拉）编辑、觉醒核心 |
  | 物品 | `/items` CRUD | |
  | 购买项 | `/purchases` + `/items` PATCH | 价格、折扣窗口、内含物品 |
  | 奖励 | `/presents` + `/items` PATCH | 过期时间选择器、内含物品 |
  | 兑换码 | `/redeems` + `/items` PATCH | 批量生成 |
  | 联机 | `/multiplay/rooms` | 房间列表 |
  | 系统操作 | `/system/operations` | 维护任务（危险操作二次确认） |
  | 缓存 / 设置 | — | 请求缓存查看与刷新（管理员）；外观、语言、图片等前端设置（所有人） |
- 🧰 **通用 CRUD 表格**：前端筛选（`/` 聚焦）/ 多列排序 / 分页、跨页选中提示、字段化编辑弹窗（文本 / 数字 / 开关 / 下拉 / 日期时间）、嵌套物品编辑器；**编辑只提交改动的字段，增删改后就地更新、不重拉列表**
- ⚡ **对服务端友好**：按资源分级的请求缓存（常量 24h、曲目 / 角色 1h、成绩 5min…，写操作自动失效相关缓存）、并发去重、失败不缓存；启动仅 6 个请求，页面往返零请求
- 🖼️ **图片可选**：角色头像与曲绘懒加载，缺图就地降级为占位；资源默认取自后端 `/static/`（目录名 = `song_id`，去掉原始资源的 `dl_` 前缀），可在设置页指定 CDN 或关闭；`scripts/build_pages.py` 会把曲绘压到 208px、头像量化，Pages 部署包约 11 MB
- 📦 **性能**：Naive UI 按需引入，路由级代码分割（首屏 JS ≈ 164 KB gzip）；图表为自绘内联 SVG，零图表库

## 开发 Development

要求 Node.js ≥ 20.19（或 ≥ 22.12，Vite 8 要求）。

```bash
npm install
npm run dev        # 0.0.0.0:8848
```

开发代理：`/api` → `http://127.0.0.1:8080`（在 `vite.config.js` 的 `server.proxy` 里改成你的服务端地址）。

## 构建与部署 Build & Deploy

```bash
npm run build      # 产物在 dist/，纯静态文件
```

**运行时不需要 Node，也不需要 nginx。** 同一份 `dist/` 支持三种部署方式：

1. **打包进服务端（推荐）**：在服务端加一个蓝图把 `dist/` 挂到 `/console/`，同源、零 CORS、零配置；
2. **静态 Pages**：丢到 GitHub/Cloudflare Pages 等，登录页「高级」里填后端地址（后端需开 CORS；注意 https 页面无法调用 http 后端）。`scripts/build_pages.py` 可一键组装部署目录：打包图片资源（只取曲绘缩略图与角色头像、自动去 `dl_` 前缀）、`--api` 固定后端地址、生成 `_headers` 缓存策略，产物直接 `wrangler pages deploy`；
3. **自伺服**：任意静态服务器（例如 `python -m http.server`），跨域时同样在登录页填后端地址。

API 地址解析顺序：登录页填写的地址（localStorage）→ `window.__ARCAEA_API__`（index.html 注入）→ 同源 `/api/v1`。hash 路由 + 相对 base，挂在任何路径下都不需要 rewrite 规则。

图片资源地址解析同理：登录页「高级」填写（`assets_base`，`off` 为禁用）→ `window.__ARCAEA_ASSETS__` → 从 API 地址推导（同源 `/static`，远程后端 `https://host/static`）。三种部署方式默认零配置；跨域拉图无需 CORS。

## 技术栈 Stack

Vue 3.5 · Vite 8 · Naive UI 2.45 · Pinia 4 · Vue Router 5（hash 模式）· vue-i18n 11 · axios · dayjs · @fontsource（Sora / Manrope / Chakra Petch）

---

Made by Lost · 2020–2026
