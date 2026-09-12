/**
 * 评价模块
 *
 * 后端路由：POST /wechat/staff/review/list、POST /wechat/staff/review/reply/:id
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 评价列表 @param {Object} params { min_rating?, page, page_size } → PageOK */
export const getReviewList = (params) => rpc(API_PATHS.review.list, params)

/**
 * 回复评价 @param {number} id 评价 ID
 * @param {Object} payload dto.StaffReviewReplyReq { reply }
 */
export const replyReview = (id, payload) => rpc(API_PATHS.review.reply, payload, id)
