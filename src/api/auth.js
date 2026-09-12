/**
 * 认证模块 —— 员工 / 摄影师手机号验证码登录
 *
 * 后端路由（internal/presentation/wechat/staff.go → RegisterStaffPublic，已逐条核对）：
 *   POST /wechat/staff/auth/sms-code  { mobile }
 *   POST /wechat/staff/auth/login     { mobile, code, device_name?, platform? }
 *        → { token, user: {id, username, nickname, avatar, mobile, role_id, store_id} }
 *
 * ⚠️ 两处易错点（对照后端实测）：
 *   1. 路径是 `auth/sms-code`，不是 /auth/send-code；
 *   2. 请求体字段是 **code**，不是 smsCode。
 * 本端**不需要** slug（员工身份按手机号在 user 表定位，不依赖工作室短链）。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 发送验证码 @param {string} mobile 手机号 */
export const sendSmsCode = (mobile) => rpc(API_PATHS.auth.smsCode, { mobile })

/**
 * 验证码登录
 * @param {string} mobile
 * @param {string} code
 * @param {Object} [extra] 选填：{ device_name, platform }（用于设备管理）
 * @returns {Promise<{token: string, user: Object}>}
 */
export const loginByCode = (mobile, code, extra = {}) =>
  rpc(API_PATHS.auth.login, { mobile, code, ...extra })
