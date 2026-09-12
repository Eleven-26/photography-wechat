/**
 * 环境配置 —— 接口基址（SLOT 摄影师端 / 员工端小程序）
 *
 * 后端：photography-server（Gin）。本端涉及**两个**接口分组，务必区分：
 *   - 员工区 `/wechat/staff/...` ← 本端主体能力（员工认证 StaffAuth：订单/日程/线索/客户/通知/设备…）
 *   - 客户区 `/wechat/...`       ← 仅"客户视角预览"等少量客户身份场景（客户认证 CustomerAuth）
 *
 * `/api` 是网关前缀，由 devServer（开发）/ nginx（生产）**剥离**后再转发 ——
 * 后端真实路由本身不含 `/api`（见 photography-server/internal/router/router.go）。
 *
 * 写法说明：条件编译用「先给默认值、再按平台重赋值」而非重复声明同名常量 ——
 * 后者在预处理前不是合法 JS（重复声明报错），会影响 ESLint / IDE 解析。
 */

/** 后端源地址：H5 留空 = 同源相对路径（走 /api 代理）；小程序无代理，必须直连后端源 */
let apiBase = 'http://localhost:8080' // 小程序端：本地联调指向本机，上线改为 https 合法域名
// #ifdef H5
apiBase = ''
// #endif
export const API_BASE = apiBase

/**
 * 员工端接口前缀（本端默认，绝大多数页面用它）
 *   H5（API_BASE=''） → /api/wechat/staff/order/list → 代理剥 /api → 后端 /wechat/staff/order/list
 *   小程序（直连）     → /wechat/staff/order/list                  → 后端 /wechat/staff/order/list
 */
let staffPrefix = '/wechat/staff'
// #ifdef H5
staffPrefix = '/api/wechat/staff'
// #endif
export const API_PREFIX_STAFF = staffPrefix

/** 客户区接口前缀（仅 `pages/me/preview` 客户视角预览等客户身份场景使用） */
let clientPrefix = '/wechat'
// #ifdef H5
clientPrefix = '/api/wechat'
// #endif
export const API_PREFIX_CLIENT = clientPrefix

/**
 * 通知通道按环境降级（需求文档 v1.3 §8）：
 * - 微信内 H5 / 小程序：订阅消息
 * - 普通浏览器：短信触达
 * 判定方式：ua 含 MicroMessenger 即微信内
 */
export const IS_WECHAT = (() => {
  // #ifdef H5
  return /MicroMessenger/i.test(navigator.userAgent)
  // #endif
  // #ifndef H5
  return true // 小程序端视为微信生态，走订阅消息
  // #endif
})()
