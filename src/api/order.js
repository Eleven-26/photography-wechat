/**
 * 订单模块 —— 摄影师端订单查询与操作
 * 后端字段：biz_order（code/package_name/customer/shoot_date/total_amt/status/payment_status）
 * 后端分组：/api/order（list/detail/confirm/cancel 等路由已在后端注册，参数结构联调核对）
 * ⚠️ 客户端接口在 photography-h5/src/api/order.js；本文件仅放摄影师端用到的接口。
 */
import { get, post } from '@/utils/request'

/** 摄影师订单列表 @param {page, page_size, status?} 返回 { list, total }（结构联调核对） */
export const getOrderList = (params) => get('/order/list', params)

/** 订单详情 @param {number} id biz_order.id（含聚合 reschedule/refund/payment 结构，联调核对） */
export const getOrderDetail = (id) => get('/order/detail', { id })

/** 确认档期（D03：biz_order /confirm/:id，确认后正式锁档） */
export const confirmSchedule = (orderId) => post(`/order/confirm/${orderId}`)

/** 收款核验确认（D12：/payment/confirm/:id 登记到账；路由名联调核对） */
export const confirmPayment = (paymentId, payload) => post(`/payment/confirm/${paymentId}`, payload)

/** 改期申请审核（D15：/apply/:order_id 通过/驳回；字段联调核对） */
export const auditReschedule = (applyId, payload) => post(`/calendar/audit/${applyId}`, payload)

/** 退款申请审核（D14：/refund/audit/:id 通过/驳回；字段联调核对） */
export const auditRefund = (refundId, payload) => post(`/refund/audit/${refundId}`, payload)
