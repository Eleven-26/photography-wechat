/**
 * 认证模块 —— 员工（摄影师）端登录
 *
 * 后端路由（internal/presentation/wechat/staff.go → RegisterStaffPublic，已逐条核对）：
 *   POST /wechat/staff/auth/login          { username, password, device_name?, platform? }
 *   POST /wechat/staff/auth/sms-code       { mobile }                                ⏳ 预留
 *   POST /wechat/staff/auth/login-by-code  { mobile, code, device_name?, platform? }  ⏳ 预留
 *
 * 2026-09-14：主登录方式由「手机号 + 验证码」改为「账号 + 密码」，与 PC 后台同口径
 * —— 后端两端**共用同一套凭据校验与失败锁定**（IP 10 次 / 账号 5 次，各锁 15 分钟，
 * 见 service/auth.go → verifyPasswordCredential），不存在「小程序比 PC 更容易爆破」的缺口。
 *
 * 保留验证码两条：发码（sms-code）与验证码登录（login-by-code）是一对，只留其一能力即残缺；
 * 将来接「手机验证码登录」时前端直接调用即可、无需再动后端。微信授权登录规划在同前缀下扩展。
 *
 * 响应结构与 PC 的 /auth/login 完全一致：
 *   { token, user: { ...sys_user 全字段, role_code, role_name, data_scope, permissions } }
 *
 * ⚠️ 易错点（对照后端实测）：请求体字段是 **username / password**（不是 account / pwd）；
 *    保留的验证码登录字段是 **code**（不是 smsCode）。
 * 本端**不需要** slug（员工身份按账号在 sys_user 表定位，不依赖工作室短链）。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/**
 * 账号密码登录（当前唯一接入 UI 的登录方式）
 * @param {string} username 登录账号（sys_user.username）
 * @param {string} password 登录密码
 * @param {Object} [extra] 选填：{ device_name, platform }（用于「我的 → 登录设备」管理）
 * @returns {Promise<{token: string, user: Object}>}
 */
export const loginByPassword = (username, password, extra = {}) =>
  rpc(API_PATHS.auth.login, { username, password, ...extra })

/* ---------------------------------------------------------------------
 * 以下两项为**预留能力**：页面暂未接入，但接口与后端均已就绪，勿当作死代码删除。
 * 用途：手机验证码登录（与微信授权登录同属后续登录方式扩展）。
 * ------------------------------------------------------------------- */

/** ⏳ 预留：发送短信验证码 @param {string} mobile 手机号 */
export const sendSmsCode = (mobile) => rpc(API_PATHS.auth.smsCode, { mobile })

/**
 * ⏳ 预留：手机验证码登录（与 sendSmsCode 成对使用）
 * @param {string} mobile
 * @param {string} code
 * @param {Object} [extra] 选填：{ device_name, platform }
 * @returns {Promise<{token: string, user: Object}>}
 */
export const loginByCode = (mobile, code, extra = {}) =>
  rpc(API_PATHS.auth.loginByCode, { mobile, code, ...extra })
