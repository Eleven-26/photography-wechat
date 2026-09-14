/**
 * 交付模块 —— 交付单 / 样片与成品上传 / 客户反馈处理
 *
 * 后端路由：
 *   POST /wechat/staff/delivery/create/:order_id        创建交付单（**不收 body**，真实端差异）
 *   POST /wechat/staff/delivery/detail/:id              :id = **order_id**（与 PC 同口径）
 *   POST /wechat/staff/delivery/upload-samples/:id      :id = 交付单 ID
 *   POST /wechat/staff/delivery/upload-retouched/:id    :id = 交付单 ID
 *   POST /wechat/staff/delivery/feedback/list           客户修图反馈列表（body { status?, page, page_size }）
 *   POST /wechat/staff/delivery/feedback/handle/:item_id
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/**
 * 创建交付单（后端不收 body，真实端差异 —— 不要传参数）
 * @param {number} orderId
 */
export const createDelivery = (orderId) => rpc(API_PATHS.delivery.create, {}, orderId)

/** 交付单详情 @param {number} id **订单 ID**（按订单反查交付单） → { delivery, items } */
export const getDeliveryDetail = (id) => rpc(API_PATHS.delivery.detail, {}, id)

/**
 * 交付文件明细 @param {number} id **订单 ID**（按订单反查交付单）
 * 返回 model.DeliveryItem[]：{ id, delivery_id, order_id, url, file_type(1图/2视频/3文件),
 *   kind(1样片/2已选/3精修成品), filename, size, is_selected, feedback_content,
 *   feedback_types, feedback_priority, feedback_status, handled_at, handle_remark }
 */
export const getDeliveryItems = (id) => rpc(API_PATHS.delivery.items, {}, id)

/**
 * 上传样片 @param {number} id 交付单 ID
 * @param {Object} payload { items } —— items 必填且非空（空数组会 400）
 */
export const uploadSamples = (id, payload) => rpc(API_PATHS.delivery.uploadSamples, payload, id)

/** 上传精修成品 @param {number} id 交付单 ID @param {Object} payload { items } */
export const uploadRetouched = (id, payload) => rpc(API_PATHS.delivery.uploadRetouched, payload, id)

/** 客户修图反馈列表 @param {Object} params { status?, page, page_size } → PageOK */
export const listFeedback = (params) => rpc(API_PATHS.delivery.feedbackList, params)

/**
 * 标记反馈已处理并记录处理备注
 * @param {number} itemId 交付明细 ID
 * @param {Object} payload dto.StaffFeedbackHandleReq { remark }
 */
export const handleFeedback = (itemId, payload) =>
  rpc(API_PATHS.delivery.feedbackHandle, payload, itemId)
