/**
 * 套餐模块 —— 员工端套餐列表 / 详情 / 增删改与上下架
 *
 * 后端路由（复用 PC 同一 Handler 与权限点，2026-09-14 第四批补开，见 internal/router/endpoints.go）：
 *   POST /wechat/staff/package/list           body 分页 { page, page_size, category?, status? } → PageOK
 *   POST /wechat/staff/package/detail/:id
 *   POST /wechat/staff/package/create         dto.PackageReq
 *   POST /wechat/staff/package/update/:id     dto.PackageReq
 *   POST /wechat/staff/package/status/:id     body { status }（上下架，权限点 package:publish）
 *   POST /wechat/staff/package/delete/:id     （权限点 package:delete）
 *
 * ⚠️ 字段口径：金额是**元**（float64，不是分）；`deposit_rate` 是百分比数值（如 30 表示 30%）。
 * ⚠️ 放行路由不等于授予能力：能否操作由登录员工的角色权限点决定，与 PC 一致。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 套餐列表 @param {Object} params { page, page_size, category?, status? } → PageOK */
export const getPackageList = (params) => rpc(API_PATHS.package.list, params)

/** 套餐详情 @param {number} id */
export const getPackageDetail = (id) => rpc(API_PATHS.package.detail, {}, id)

/**
 * 新建套餐
 * @param {Object} payload dto.PackageReq
 *   { name, cover?, category?, suitable_for?, introduction?, base_price, deposit_rate,
 *     photos_included, raw_count?, revision_count?, delivery_days?, download_days?,
 *     location_mode(fixed/custom), locations?JSON字符串, reschedule_policy?, cancel_policy?,
 *     shoot_hours?, content_desc?, addon_unit_price?, status(1草稿/2已上架/3已下线) }
 */
export const createPackage = (payload) => rpc(API_PATHS.package.create, payload)

/** 更新套餐 @param {number} id @param {Object} payload dto.PackageReq */
export const updatePackage = (id, payload) => rpc(API_PATHS.package.update, payload, id)

/** 上下架 @param {number} id @param {number} status 1草稿/2已上架/3已下线 */
export const setPackageStatus = (id, status) => rpc(API_PATHS.package.status, { status }, id)

/** 删除套餐 @param {number} id */
export const deletePackage = (id) => rpc(API_PATHS.package.delete, {}, id)
