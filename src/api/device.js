/**
 * 登录设备模块（账号与安全）
 *
 * 后端路由：POST /wechat/staff/device/list、POST /wechat/staff/device/remove/:id
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 登录设备列表 */
export const getDeviceList = () => rpc(API_PATHS.device.list, {})

/** 踢出登录设备 @param {number} id 设备记录 ID */
export const removeDevice = (id) => rpc(API_PATHS.device.remove, {}, id)
