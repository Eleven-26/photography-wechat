/**
 * 作品集模块 —— 员工端作品列表 / 详情 / 增删改与发布状态开关
 *
 * 后端路由（复用 PC 同一 Handler 与权限点，2026-09-14 第四批补开，见 internal/router/endpoints.go；
 * 注册点 internal/presentation/routes/payment.go 首段）：
 *   POST /wechat/staff/asset/list           body 分页 { page, page_size, keyword?, category?, status?, featured? } → PageOK
 *   POST /wechat/staff/asset/detail/:id
 *   POST /wechat/staff/asset/create         dto.AssetCreateReq
 *   POST /wechat/staff/asset/update         dto.AssetUpdateReq（id 在 body）
 *   POST /wechat/staff/asset/status/:id     dto.AssetFlagsReq（局部开关，见下）
 *   POST /wechat/staff/asset/delete/:id     （权限点 asset:delete）
 *
 * ⚠️ 权限点：/asset/list|detail 归 asset:view、/asset/create 归 asset:upload、
 *    /asset/status 归 **asset:audit**（发布审核）。摄影师通常无 asset:audit ——
 *    放行路由不等于授予能力，能否操作由登录员工的角色权限点决定，与 PC 一致。
 * ⚠️ update 与 status 语义不同：update 要求**全字段回传**（title 必填）；
 *    「取消精选」（featured=0）必须走 status —— update 里 0 会被当成"未传"而保持原值。
 *    故 status 的字段是**指针语义**：不传 = 不改，传 0 = 显式置 0。
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 作品列表 @param {Object} params { page, page_size, keyword?, category?, status?, featured? } → PageOK */
export const getAssetList = (params) => rpc(API_PATHS.asset.list, params)

/** 作品详情 @param {number} id */
export const getAssetDetail = (id) => rpc(API_PATHS.asset.detail, {}, id)

/**
 * 新建作品
 * @param {Object} payload dto.AssetCreateReq
 *   { title(必填), category?, cover?, images?(逗号分隔 URL), description?, photographer?,
 *     model?, location?, shoot_date?, package_ids?(逗号分隔), status?(1草稿/2已发布),
 *     visibility?(1公开/2未公开), featured?(0否/1是), authorization?(1待授权/2已授权) }
 */
export const createAsset = (payload) => rpc(API_PATHS.asset.create, payload)

/** 更新作品（全字段回传） @param {number} id @param {Object} payload dto.AssetUpdateReq */
export const updateAsset = (id, payload) => rpc(API_PATHS.asset.update, { ...payload, id })

/**
 * 发布状态 / 可见性 / 精选开关（局部更新，不要求回传全字段）
 * @param {number} id
 * @param {Object} flags { status?, visibility?, featured? } —— 只传要改的字段
 */
export const setAssetFlags = (id, flags) => rpc(API_PATHS.asset.status, flags, id)

/** 删除作品 @param {number} id */
export const deleteAsset = (id) => rpc(API_PATHS.asset.delete, {}, id)
