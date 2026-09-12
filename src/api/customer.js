/**
 * 客户档案模块
 *
 * 后端路由：
 *   POST /wechat/staff/customer/list              body 分页
 *   POST /wechat/staff/customer/detail/:id
 *   POST /wechat/staff/customer/mobile            改绑客户手机号（body { customer_id, mobile }）
 *   POST /wechat/staff/customer/today-follow      今日待跟进（body { limit? }）
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 客户列表 @param {Object} params { page, page_size, keyword? } → PageOK */
export const getCustomerList = (params) => rpc(API_PATHS.customer.list, params)

/** 客户档案详情 @param {number} id crm_customer.id */
export const getCustomerDetail = (id) => rpc(API_PATHS.customer.detail, {}, id)

/**
 * 修改客户手机号（换绑，含格式与占用校验）
 * @param {Object} payload dto.StaffCustomerMobileReq { customer_id, mobile }
 */
export const updateCustomerMobile = (payload) => rpc(API_PATHS.customer.mobile, payload)

/** 今日待跟进（到期/逾期且未成交未流失的线索）@param {Object} [params] { limit? } */
export const getTodayFollow = (params) => rpc(API_PATHS.customer.todayFollow, params)
