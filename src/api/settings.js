/**
 * 工作室设置模块
 *
 * 后端路由：POST /wechat/staff/studio/get、POST /wechat/staff/studio/update
 * （预约主页 / 接单规则 / 改期政策 / 收款方式等工作室级配置）
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 读取工作室设置 */
export const getStudioSettings = () => rpc(API_PATHS.settings.get, {})

/** 更新工作室设置 @param {Object} payload */
export const updateStudioSettings = (payload) => rpc(API_PATHS.settings.update, payload)
