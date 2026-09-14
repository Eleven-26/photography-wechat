/**
 * 报价模块 —— 员工端「基于线索创建报价 / 查看报价 / 流转报价状态」
 *
 * 后端路由（复用 PC 同一 Handler 与权限点，2026-09-14 第四批补开，
 * 注册点 internal/presentation/routes/customer.go 末段）：
 *   POST /wechat/staff/quote/create            dto.QuoteCreateReq（lead_id 在 body，为**线索 ID**）
 *   POST /wechat/staff/quote/list/:lead_id     → 该线索下全部报价单
 *   POST /wechat/staff/quote/status/:id        body { status }（:id 为**报价单 ID**）
 *
 * ⚠️ 路径参数口径不同：create / list 的路径参数是**线索 ID**，status 的是**报价单 ID**，勿传错。
 * ⚠️ 报价状态流转归 quote:update（**无独立审批接口** —— quote:audit 已随 2026-09-11 权限点清理移除）。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/**
 * 创建报价单
 * @param {number} leadId 线索 ID
 * @param {Object} payload dto.QuoteCreateReq
 *   { package_id(必填), title?, addon_price?, shoot_date?, remark? }
 */
export const createQuote = (leadId, payload) => rpc(API_PATHS.quote.create, { ...payload, lead_id: leadId })

/** 线索下的报价单列表 @param {number} leadId 线索 ID */
export const getQuoteList = (leadId) => rpc(API_PATHS.quote.list, {}, leadId)

/**
 * 变更报价单状态
 * @param {number} id 报价单 ID
 * @param {number} status 1草稿/2已发送/3已接受/4已拒绝/5已成交
 */
export const setQuoteStatus = (id, status) => rpc(API_PATHS.quote.status, { status }, id)
