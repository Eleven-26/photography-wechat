/**
 * 账号自助模块 —— 登录者本人的资料 / 改密 / 退出
 *
 * 后端路由（routes/user.go，**免权限点**：自助类，操作对象是登录者本人账号）：
 *   POST /wechat/staff/user/profile          读取本人资料（含 role_code / data_scope / permissions）
 *   POST /wechat/staff/user/change-password  body { old_password, new_password }
 *   POST /wechat/staff/user/logout           退出登录（服务端注销当前令牌）
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 读取本人资料 */
export const getProfile = () => rpc(API_PATHS.user.profile, {})

/**
 * 修改密码
 * @param {string} oldPassword
 * @param {string} newPassword
 */
export const changePassword = (oldPassword, newPassword) =>
  rpc(API_PATHS.user.changePassword, { old_password: oldPassword, new_password: newPassword })

/** 退出登录（服务端注销当前令牌） */
export const logout = () => rpc(API_PATHS.user.logout, {})
