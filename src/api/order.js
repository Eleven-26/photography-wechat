/**
 * 订单模块 —— 员工端订单查询与操作
 *
 * 后端路由（internal/router/endpoints.go 的 staffInclude，均复用 PC 同一 Handler）：
 *   POST /wechat/staff/order/list                        body 分页
 *   POST /wechat/staff/order/detail/:id                  含 allowed_transitions
 *   POST /wechat/staff/order/logs/:id
 *   POST /wechat/staff/order/create
 *   POST /wechat/staff/order/status/:id                  body { status }
 *   POST /wechat/staff/order/cancel/:id
 *   POST /wechat/staff/order/addon/{list,create,update,delete}
 *   POST /wechat/staff/order/reschedule/apply/:order_id  发起改期
 *
 * ⚠️ 员工端**没有** `/order/confirm/:id`：请勿臆造 —— 「确认档期」是一次状态流转。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 订单列表 @param {Object} params { page, page_size, status?, customer_id? } → PageOK */
export const getOrderList = (params) => rpc(API_PATHS.order.list, params)

/** 订单详情（含 allowed_transitions，驱动可执行动作）@param {number} id biz_order.id */
export const getOrderDetail = (id) => rpc(API_PATHS.order.detail, {}, id)

/** 订单操作日志 @param {number} id */
export const getOrderLogs = (id) => rpc(API_PATHS.order.logs, {}, id)

/** 创建订单 @param {Object} payload dto.OrderCreateReq */
export const createOrder = (payload) => rpc(API_PATHS.order.create, payload)

/**
 * 状态流转 —— **唯一**的状态变更入口
 * 合法流转见 internal/domain/order.go 的 orderTransitions；
 * 详情页应优先读 `allowed_transitions` 再决定可选项，不要在前端硬编码状态机。
 * @param {number} id
 * @param {number} status 目标状态
 */
export const updateOrderStatus = (id, status) => rpc(API_PATHS.order.status, { status }, id)

/**
 * 确认档期：待确认(0) → 待定金(1)
 * 员工端无 /order/confirm/:id；「摄影师确认」在状态机里就是 PendingConfirm → PendingDeposit
 * （见 internal/domain/order.go 第 7 行注释「客户预约 → 摄影师确认/取消」）。
 */
export const confirmBooking = (orderId) => rpc(API_PATHS.order.status, { status: 1 }, orderId)

/** 取消订单 @param {number} id @param {Object} [payload] { reason? } */
export const cancelOrder = (id, payload = {}) => rpc(API_PATHS.order.cancel, payload, id)

// ──── 订单加项 ────────────────────────────────────
// 增删改在后端同事务内重算订单金额，调用成功后需重新拉取订单详情，不要在前端自行累加。

/** @param {number} orderId */
export const listAddons = (orderId) => rpc(API_PATHS.order.addonList, {}, orderId)

/** @param {number} orderId @param {Object} payload */
export const createAddon = (orderId, payload) => rpc(API_PATHS.order.addonCreate, { ...payload, order_id: orderId })

/** @param {number} id 加项 ID */
export const updateAddon = (id, payload) => rpc(API_PATHS.order.addonUpdate, { ...payload, id })

/** @param {number} id 加项 ID */
export const deleteAddon = (id) => rpc(API_PATHS.order.addonDelete, {}, id)

// ──── 发起改期 ────────────────────────────────────
// 员工端可发起改期（与 PC 同一 Handler）；审批见 api/reschedule.js。

/** @param {number} orderId @param {Object} payload { new_date, new_time, reason_label?, reason? } */
export const applyReschedule = (orderId, payload) =>
  rpc(API_PATHS.order.rescheduleApply, payload, orderId)
