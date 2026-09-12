/**
 * 定制需求模块（员工端）
 *
 * 后端路由：
 *   POST /wechat/staff/custom-request/list         body { status?, page, page_size }
 *   POST /wechat/staff/custom-request/respond/:id  响应定制需求
 *
 * 口径②：定制需求走报价流程，不产生直约订单。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 定制需求列表 @param {Object} params { status?, page, page_size } → PageOK */
export const getCustomRequestList = (params) => rpc(API_PATHS.customRequest.list, params)

/**
 * 响应定制需求 @param {number} id
 * @param {Object} payload dto.StaffCustomRequestRespondReq { response }
 */
export const respondCustomRequest = (id, payload) =>
  rpc(API_PATHS.customRequest.respond, payload, id)
