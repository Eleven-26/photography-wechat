/**
 * API 路径注册表 —— 单一事实来源
 *
 * 对齐 SLOT 管理端 photography-frontend/src/api/common/apiPath.ts：
 * 路径只在这里声明一次，api/*.js 只引用常量、不写字面量。
 *
 * ⚠️ 本端有**两个**端前缀，务必区分（前缀在本文件定义；后端源地址见 config/env.js）：
 *   员工区 /wechat/staff —— 本端主体能力（StaffAuth：订单/日程/线索/客户/通知/设备…）
 *   客户区 /wechat       —— 仅「客户视角预览」等客户身份场景
 * 因此这里也维护两张表：API_PATHS（员工端）与 CLIENT_API_PATHS（客户区）。
 *
 * ⚠️ 路径口径（2026-09-12 按后端真实路由逐条核对，见 internal/router/endpoints.go 的 staffInclude/staffExtra）：
 * 1. 所有接口一律 **POST + JSON body**，路径参数走 URL、业务参数走 body（后端不读 query，见 internal/pkg/params）；
 * 2. **员工端没有 `/order/confirm/:id`** ——「确认档期」走状态机 `/order/status/:id`，
 *    待确认(0) 的合法流转只有 待定金(1) / 已取消(7)（见 internal/domain/order.go）；
 * 3. 退款审核的员工端字段是 **approve**（bool），与 PC 的 approved 不同（有意保留的端差异）。
 */

/* eslint-disable no-useless-assignment -- uni-app 条件编译约定：``先给默认值、再按平台重赋值``。
   ESLint 不解析 `// #ifdef` 注释，会把默认值赋值误判为「后续未被使用」；而改成重复 `const`
   声明又会在预处理前变成非法 JS（重复声明）。故仅对本文件豁免该规则，其余文件照常生效。 */

/** 员工端前缀 */
let staffPrefix = '/wechat/staff'
// #ifdef H5
staffPrefix = '/api/wechat/staff'
// #endif
export const API_PREFIX_STAFF = staffPrefix

/** 客户区前缀（仅客户视角预览等客户身份场景使用） */
let clientPrefix = '/wechat'
// #ifdef H5
clientPrefix = '/api/wechat'
// #endif
export const API_PREFIX_CLIENT = clientPrefix

/** 员工端路径（去掉 /wechat/staff 前缀） */
export const API_PATHS = {
  // 认证（公开）
  auth: {
    smsCode: 'auth/sms-code',
    login: 'auth/login'
  },
  // 工作台
  dashboard: { overview: 'overview' },
  // 订单
  order: {
    list: 'order/list',
    detail: 'order/detail',
    logs: 'order/logs',
    create: 'order/create',
    /** 状态流转（确认档期/推进状态）：body { status } */
    status: 'order/status',
    /** :id = order_id */
    cancel: 'order/cancel',
    // 加项（增删改同事务重算订单金额）
    addonList: 'order/addon/list',
    addonCreate: 'order/addon/create',
    addonUpdate: 'order/addon/update',
    addonDelete: 'order/addon/delete',
    // 发起改期（与 PC 同一 Handler）
    rescheduleApply: 'order/reschedule/apply'
  },
  // 改期审核（员工端字段 approve:bool）
  reschedule: {
    list: 'reschedule/list',
    audit: 'reschedule/audit'
  },
  // 日程与档期模板
  schedule: {
    list: 'schedule/list',
    slotTemplateList: 'slot-template/list',
    slotTemplateSave: 'slot-template/save',
    slotTemplateDelete: 'slot-template/delete'
  },
  // 客户档案
  customer: {
    list: 'customer/list',
    detail: 'customer/detail',
    mobile: 'customer/mobile',
    todayFollow: 'customer/today-follow'
  },
  // 线索与 AI 简报
  lead: {
    list: 'lead/list',
    detail: 'lead/detail',
    messages: 'lead/messages',
    messageSend: 'lead/message/send',
    briefList: 'brief/list',
    briefGenerate: 'brief/generate',
    briefSend: 'brief/send',
    briefConfirm: 'brief/confirm'
  },
  // 交付
  delivery: {
    create: 'delivery/create',
    detail: 'delivery/detail',
    uploadSamples: 'delivery/upload-samples',
    uploadRetouched: 'delivery/upload-retouched',
    feedbackList: 'delivery/feedback/list',
    feedbackHandle: 'delivery/feedback/handle'
  },
  // 财务（收款核验 / 退款审核）
  finance: {
    paymentList: 'payment/list',
    paymentCreate: 'payment/create',
    paymentConfirm: 'payment/confirm',
    refundList: 'refund/list',
    refundAudit: 'refund/audit'
  },
  // 站内通知
  notification: {
    list: 'notification/list',
    unreadCount: 'notification/unread-count',
    read: 'notification/read',
    readAll: 'notification/read-all'
  },
  // 工作室设置
  settings: {
    get: 'studio/get',
    update: 'studio/update'
  },
  // 登录设备
  device: {
    list: 'device/list',
    remove: 'device/remove'
  },
  // 评价
  review: {
    list: 'review/list',
    reply: 'review/reply'
  },
  // 定制需求
  customRequest: {
    list: 'custom-request/list',
    respond: 'custom-request/respond'
  }
}

/** 客户区路径（去掉 /wechat 前缀）—— 仅供「客户视角预览」等客户身份场景 */
export const CLIENT_API_PATHS = {
  auth: {
    smsCode: 'auth/sms-code',
    login: 'auth/login'
  },
  studio: { info: 'studio/info' },
  package: { list: 'package/list', detail: 'package/detail' },
  asset: { list: 'asset/list', detail: 'asset/detail' },
  slot: { list: 'slot/list' },
  order: { list: 'order/list', detail: 'order/detail', submit: 'order/submit' },
  notification: { list: 'notification/list' }
}
