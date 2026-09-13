/**
 * 登录态管理 —— token 与**员工（摄影师）**信息存取
 *
 * 登录方式：**账号 + 密码**（2026-09-14 起，与 PC 后台同口径）。
 *   手机验证码登录 / 微信授权登录为预留方式（接口在 api/auth.js 中已备好）。
 * 存储：uni.setStorageSync（H5 → localStorage / 小程序 → storage，跨端一致）
 *
 * ⚠️ 本仓是**员工端**：存的是员工（user 表）信息，不是客户（crm_customer）。
 *    storage key 由 slot_customer_* 改为 slot_staff_*，避免与客户端仓（photography-h5）串号
 *    （两个端若部署在同域，localStorage 是共享的，key 必须区分）。
 *    首次读取会把旧的 slot_customer_* 迁移过来，登录一次后自然覆盖。
 */
const KEY_TOKEN = 'slot_staff_token'
const KEY_STAFF = 'slot_staff_info'

/** 历史 key（客户口径）——仅用于一次性迁移，勿在新代码使用 */
const LEGACY_KEY_TOKEN = 'slot_customer_token'
const LEGACY_KEY_STAFF = 'slot_customer_info'

/** 保存登录态 */
export function setAuth(token, staffInfo) {
  uni.setStorageSync(KEY_TOKEN, token)
  if (staffInfo) uni.setStorageSync(KEY_STAFF, JSON.stringify(staffInfo))
}

/** 读取 token（首次自动从旧 key 迁移） */
export function getToken() {
  let token = uni.getStorageSync(KEY_TOKEN)
  if (!token) {
    token = uni.getStorageSync(LEGACY_KEY_TOKEN)
    if (token) uni.setStorageSync(KEY_TOKEN, token)
  }
  return token || ''
}

/**
 * 读取员工信息（后端 staff.go → StaffPasswordLogin 返回的 user 字段，结构同 PC 的
 * UserInfoVO：内嵌 sys_user 全字段 id / username / nickname / avatar / mobile /
 * role_id / company_id / store_id…，另加 role_code / role_name / data_scope / permissions）
 */
export function getStaff() {
  const raw = uni.getStorageSync(KEY_STAFF) || uni.getStorageSync(LEGACY_KEY_STAFF)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** @deprecated 旧名（客户口径）——保留别名以免遗漏调用点，请改用 getStaff() */
export const getCustomer = getStaff

/** 是否已登录 */
export function isLoggedIn() {
  return !!getToken()
}

/** 清除登录态（401 或主动退出） */
export function clearAuth() {
  uni.removeStorageSync(KEY_TOKEN)
  uni.removeStorageSync(KEY_STAFF)
}
