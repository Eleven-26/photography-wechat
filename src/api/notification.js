/**
 * 站内通知模块 —— 员工本人通知（后端按 receiver_type=1 + 操作人 UserID 隔离）
 *
 * 后端路由（与 PC 同一 Handler，2026-09-12 补开）：
 *   POST /wechat/staff/notification/list、unread-count、read/:id、read-all
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 通知列表 @param {Object} params { page, page_size, unread? } → PageOK */
export const getNotificationList = (params) => rpc(API_PATHS.notification.list, params)

/** 未读数量（铃铛红点）→ { count } */
export const getUnreadCount = () => rpc(API_PATHS.notification.unreadCount, {})

/** 标记单条已读 @param {number} id */
export const readNotification = (id) => rpc(API_PATHS.notification.read, {}, id)

/** 全部标记已读 */
export const readAllNotifications = () => rpc(API_PATHS.notification.readAll, {})
