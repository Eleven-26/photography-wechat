/**
 * 线索与 AI 简报模块
 *
 * 后端路由：
 *   POST /wechat/staff/lead/list、lead/detail/:id
 *   POST /wechat/staff/lead/messages/:id              沟通记录
 *   POST /wechat/staff/lead/message/send/:id          发送消息
 *   POST /wechat/staff/brief/list/:lead_id            简报项列表
 *   POST /wechat/staff/brief/generate/:lead_id        生成 AI 简报
 *   POST /wechat/staff/brief/send/:id                 发送追问
 *   POST /wechat/staff/brief/confirm/:id              确认简报项
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 线索列表 @param {Object} params { page, page_size, status? } → PageOK */
export const getLeadList = (params) => rpc(API_PATHS.lead.list, params)

/** 线索详情 @param {number} id */
export const getLeadDetail = (id) => rpc(API_PATHS.lead.detail, {}, id)

/** 沟通记录 @param {number} id 线索 ID */
export const getLeadMessages = (id) => rpc(API_PATHS.lead.messages, {}, id)

/** 发送沟通消息 @param {number} id 线索 ID @param {Object} payload */
export const sendLeadMessage = (id, payload) => rpc(API_PATHS.lead.messageSend, payload, id)

/** 简报项列表 @param {number} leadId 线索 ID */
export const listBriefs = (leadId) => rpc(API_PATHS.lead.briefList, {}, leadId)

/** 生成 AI 简报（返回简报项集合）@param {number} leadId 线索 ID */
export const generateBrief = (leadId) => rpc(API_PATHS.lead.briefGenerate, {}, leadId)

/** 发送追问 @param {number} id 简报项 ID */
export const sendBrief = (id) => rpc(API_PATHS.lead.briefSend, {}, id)

/** 确认简报项 @param {number} id 简报项 ID @param {Object} payload dto.StaffBriefConfirmReq { value } */
export const confirmBrief = (id, payload) => rpc(API_PATHS.lead.briefConfirm, payload, id)
