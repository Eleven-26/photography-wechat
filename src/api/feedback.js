/**
 * 意见反馈模块（「我的 → 意见反馈」）
 *
 * 后端路由：POST /wechat/staff/feedback/submit（**免权限点**：操作对象是提交人本人）
 *   body { type, content, images[], contact }
 *   type: bug-功能异常 / advice-改进建议 / other-其他（空按 other）
 *   images: 截图 URL 数组（服务端最多留 3 张）；截图先走 /upload/file 换 URL
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/**
 * 提交反馈
 * @param {Object} payload { type, content, images?: string[], contact? }
 */
export const submitFeedback = (payload) => rpc(API_PATHS.feedback.submit, payload)
