/**
 * 认证模块 —— 手机号验证码登录（摄影师端 / 员工端）
 *
 * 后端实际路由（internal/presentation/wechat/staff.go → RegisterStaffPublic，已逐条核对）：
 *   POST /wechat/staff/auth/sms-code   { mobile }                        发送验证码
 *   POST /wechat/staff/auth/login      { mobile, code, device_name?, platform? }
 *                                      → { token, user: {id, username, nickname, avatar, mobile, role_id, store_id} }
 *
 * ⚠️ 两处易错点（对照后端实测）：
 *   1. 路径是 `/auth/sms-code`，不是 /auth/send-code；
 *   2. 请求体字段是 **code**，不是 smsCode。
 * 本端**不需要** slug（与 h5 客户侧不同：员工身份按手机号在 user 表定位，不依赖工作室短链）。
 */
import { post } from '@/utils/request'

/** 发送验证码 @param {string} mobile 手机号 */
export const sendSmsCode = (mobile) => post('/auth/sms-code', { mobile })

/**
 * 验证码登录
 * @param {string} mobile 手机号
 * @param {string} code   短信验证码
 * @param {Object} [extra] 选填：{ device_name, platform }（用于设备管理）
 * @returns {Promise<{token: string, user: Object}>}
 */
export const loginByCode = (mobile, code, extra = {}) =>
  post('/auth/login', { mobile, code, ...extra })
