/**
 * 改期审核模块
 *
 * 后端路由（员工端独有 handler，见 wechat/staff.go → RescheduleAudit）：
 *   POST /wechat/staff/reschedule/list       body { status?, page, page_size }
 *   POST /wechat/staff/reschedule/audit/:id  改期审批
 *
 * ⚠️ 字段陷阱：改期审批的员工端字段是 `approved`，
 *    而**退款审核**（api/finance.js）是 `approve` —— 有意保留的端差异，别写混。
 * 发起改期见 api/order.js 的 applyReschedule。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 改期单列表 @param {Object} params { status?, page, page_size } → PageOK */
export const getRescheduleList = (params) => rpc(API_PATHS.reschedule.list, params)

/**
 * 改期审批
 * @param {number} id 改期单 ID
 * @param {Object} payload dto.StaffRescheduleAuditReq { approved: boolean, remark?: string }
 */
export const auditReschedule = (id, payload) => rpc(API_PATHS.reschedule.audit, payload, id)
