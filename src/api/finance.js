/**
 * 财务模块 —— 收款核验 / 退款审核（资金不经平台，平台仅登记与核验）
 *
 * 后端路由：
 *   POST /wechat/staff/payment/list/:order_id
 *   POST /wechat/staff/payment/create            （order_id 在 body）
 *   POST /wechat/staff/payment/confirm/:id      确认到账（客户登记后的核验闭环）
 *   POST /wechat/staff/refund/list/:order_id
 *   POST /wechat/staff/refund/audit/:id         退款审核
 *
 * ⚠️ 字段陷阱：**退款审核**的员工端字段是 `approve`（bool），
 *    改期审核（api/reschedule.js）才是 `approved` —— 这是有意保留的端差异。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 订单收款记录 @param {number} orderId */
export const getPaymentList = (orderId) => rpc(API_PATHS.finance.paymentList, {}, orderId)

/** 登记一笔收款 @param {number} orderId @param {Object} payload */
export const createPayment = (orderId, payload) =>
  rpc(API_PATHS.finance.paymentCreate, { ...payload, order_id: orderId })

/**
 * 确认到账（客户在客户端「登记转账」后的核验动作，写 status=2 并联动订单收款状态）
 * @param {number} paymentId 收款记录 ID
 */
export const confirmPayment = (paymentId) => rpc(API_PATHS.finance.paymentConfirm, {}, paymentId)

/** 订单退款记录 @param {number} orderId */
export const getRefundList = (orderId) => rpc(API_PATHS.finance.refundList, {}, orderId)

/**
 * 退款审核
 * @param {number} id 退款单 ID
 * @param {Object} payload { approve: boolean, remark?: string } —— 字段名是 **approve**
 */
export const auditRefund = (id, payload) => rpc(API_PATHS.finance.refundAudit, payload, id)
