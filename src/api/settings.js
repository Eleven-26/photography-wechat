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
