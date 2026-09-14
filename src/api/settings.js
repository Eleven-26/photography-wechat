/**
 * 工作室设置模块
 *
 * 后端路由：POST /wechat/staff/studio/get、POST /wechat/staff/studio/update
 * （预约主页 / 接单规则 / 改期政策 / 收款方式等工作室级配置）
 *
 * 读取响应在工作室设置字段之外，另含服务端拼装的 `homepage_url` —— 预约主页分享链接
 * （形如 https://slot.app/?slug=lusheng-photography&staff_id=12）。域名由服务端按
 * share.homepage_base_url 下发，前端不自行拼接：改域名只需改 Nacos 配置，不必重新发版小程序。
 * 域名后的参数：?slug= 定位工作室，&staff_id= 是**分享人**（当前登录员工的账号 id），
 * 客户从这条链接进来下单，订单即归到该员工名下。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/**
 * 读取工作室设置
 * @param {Object} [extra] 透传 { loading, silent }。tab 页 onShow 静默刷新传
 *                         { loading: false, silent: true }，避免每次切 tab 弹「加载中」
 */
export const getStudioSettings = (extra = {}) => rpc(API_PATHS.settings.get, {}, null, extra)

/** 更新工作室设置 @param {Object} payload */
export const updateStudioSettings = (payload) => rpc(API_PATHS.settings.update, payload)

/* ──── 收款方式（settings/payment-method/*；list 归 settings:view、增删改归 settings:update） ──── */

/** 收款方式列表 → model.PaymentMethod[]（含 status/sort，员工端可维护） */
export const listPaymentMethods = () => rpc(API_PATHS.settings.paymentMethodList, {})

/**
 * 新建收款方式
 * @param {Object} payload dto.PaymentMethodReq
 *   { name, type(alipay/wechat/bank/cash), account_name?, account_no?, qrcode?, status(1启用/0禁用), sort }
 */
export const createPaymentMethod = (payload) => rpc(API_PATHS.settings.paymentMethodCreate, payload)

/** 更新收款方式 @param {number} id @param {Object} payload dto.PaymentMethodReq */
export const updatePaymentMethod = (id, payload) =>
  rpc(API_PATHS.settings.paymentMethodUpdate, payload, id)

/** 删除收款方式 @param {number} id */
export const deletePaymentMethod = (id) => rpc(API_PATHS.settings.paymentMethodDelete, {}, id)
