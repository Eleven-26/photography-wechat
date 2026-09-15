/**
 * 账号自助模块 —— 登录者本人的资料 / 改密 / 退出
 *
 * 后端路由（**免权限点**：自助类，操作对象是登录者本人账号）：
 *   POST /wechat/staff/user/profile          读取本人资料（含 role_code / data_scope / permissions）
 *   POST /wechat/staff/user/change-password  body { old_password, new_password }
 *   POST /wechat/staff/user/logout           退出登录（服务端注销当前令牌）
 *   POST /wechat/staff/user/mobile-code      发送换绑验证码（发往**当前**手机号）
 *   POST /wechat/staff/user/change-mobile    body { code, new_mobile }
 *
 * ⚠️ 后两条是**员工端独有**（挂 staffExtra），PC 侧没有：PC 的员工手机号由管理员在「用户管理」改。
 * ⚠️ 验证码场景是 change_mobile，**不能**复用登录验证码 —— 后端按场景隔离。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/**
 * 读取本人资料
 * @param {Object} [extra] 透传 { loading, silent }。「我的」等 tab 页 onShow 刷新传
 *                         { loading: false, silent: true }，避免每次切 tab 弹「加载中」
 */
export const getProfile = (extra = {}) => rpc(API_PATHS.user.profile, {}, null, extra)

/**
 * 修改密码
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changePassword = (oldPassword, newPassword) =>
  rpc(API_PATHS.user.changePassword, { old_password: oldPassword, new_password: newPassword })

/** 退出登录（服务端注销当前令牌） */
export const logout = () => rpc(API_PATHS.user.logout, {})

/** 发送换绑手机验证码（发往当前绑定手机号，无需参数） */
export const sendMobileCode = () => rpc(API_PATHS.user.mobileCode, {})

/**
 * 换绑手机号
 * @param {string} code 收到的短信验证码
 * @param {string} newMobile 新手机号
 */
export const changeMobile = (code, newMobile) =>
  rpc(API_PATHS.user.changeMobile, { code, new_mobile: newMobile })
