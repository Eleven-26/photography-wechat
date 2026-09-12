/**
 * 传输层 —— uni.request Promise 封装（SLOT 摄影师端 / 员工端）
 *
 * 目录位置对齐 SLOT 管理端 photography-frontend/src/api/common/http.ts：
 * 「传输层」放在 api/common/ 下，与「路径注册表」(apiPath.js) 同为 API 层基础设施。
 *
 * 设计要点：
 * 1. 统一拼接 API_BASE + 端前缀。**本端有两个前缀**，用 `kind` 区分：
 *      kind: 'staff'（默认）→ 员工区 /wechat/staff
 *      kind: 'client'       → 客户区 /wechat（仅「客户视角预览」等客户身份场景）
 * 2. 自动携带登录 token（auth.js）；
 * 3. 401 → 清登录态并跳登录页（保留回跳地址）；
 * 4. 业务错误：uni.showToast 提示后端 msg，并 reject；
 * 5. 响应结构：后端 photography-server 实际返回 `{code, msg, data, trace_id}`，`code=0` 为成功
 *    （见 internal/presentation/response/response.go），与本文件判断一致。
 *
 * ⚠️ 项目铁律：**业务接口一律 POST + JSON body**，后端不读 query（见 internal/pkg/params）。
 */
import { API_BASE } from '@/config/env'
import { API_PREFIX_STAFF, API_PREFIX_CLIENT } from '@/api/common/apiPath'
import { getToken, clearAuth } from '@/utils/auth'

/**
 * 不需要登录态的白名单 —— 与后端员工区公开路由一致
 * （见 internal/presentation/wechat/staff.go → RegisterStaffPublic）。
 * 写的是**去掉端前缀**后的相对路径。
 */
const PUBLIC_PATHS = ['auth/']

/** 登录页路径（401 跳转用） */
const LOGIN_PAGE = '/pages/login/index'

/** 按端类型取前缀，默认员工区 */
function prefixOf(kind) {
  return kind === 'client' ? API_PREFIX_CLIENT : API_PREFIX_STAFF
}

/**
 * 发起请求
 * @param {Object} options
 * @param {string} options.url         - 接口路径（不含端前缀，如 'order/list'）
 * @param {Object} [options.data]      - 请求参数（字段名严格按后端 DTO，不自造）
 * @param {string} [options.kind]      - 'staff'（默认，员工区）| 'client'（客户区）
 * @param {boolean} [options.loading]  - 是否显示 loading（默认 true）
 * @param {boolean} [options.silent]   - 出错是否静默（默认 false：toast 后端 msg）
 * @returns {Promise<any>} data 字段
 */
export function request(options) {
  const { url, data = {}, kind = 'staff', loading = true, silent = false } = options

  if (loading) uni.showLoading({ title: '加载中…', mask: true })

  const needAuth = !PUBLIC_PATHS.some((p) => url.startsWith(p))
  const header = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (needAuth && token) header.Authorization = `Bearer ${token}`

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${prefixOf(kind)}/${url}`,
      method: 'POST',
      data,
      header,
      timeout: 15000,
      success: (res) => {
        const { statusCode, data: body } = res

        // HTTP 401：登录态失效 → 清态跳登录（携带回跳）
        if (statusCode === 401) {
          clearAuth()
          const pages = getCurrentPages()
          const current = pages[pages.length - 1]
          const redirect = current ? current.route : ''
          uni.reLaunch({ url: `${LOGIN_PAGE}?redirect=/${redirect}` })
          return reject(new Error('未登录或登录已过期'))
        }

        // HTTP 层错误
        if (statusCode < 200 || statusCode >= 300) {
          if (!silent) uni.showToast({ title: `请求失败（${statusCode}）`, icon: 'none' })
          return reject(new Error(`HTTP ${statusCode}`))
        }

        // 业务层：{code, msg, data, trace_id}，code=0 为成功
        if (body && typeof body.code === 'number' && body.code !== 0) {
          if (!silent) uni.showToast({ title: body.msg || '操作失败', icon: 'none' })
          return reject(Object.assign(new Error(body.msg || '操作失败'), { code: body.code, body }))
        }

        resolve(body && 'data' in body ? body.data : body)
      },
      fail: (err) => {
        // 网络层失败：保留调用方 catch 权限，toast 提示但不重试（避免重复提交）
        if (!silent) uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        reject(err)
      },
      complete: () => {
        if (loading) uni.hideLoading()
      }
    })
  })
}

/**
 * RPC 调用助手 —— 与后端「所有业务路由均为 POST /{apiPath}[/:id]」一一对应。
 * @param {string} apiPath - API_PATHS / CLIENT_API_PATHS 中的相对路径
 * @param {Object} [data]  - JSON body
 * @param {number|string} [id] - 路径参数（存在则拼到末尾）
 * @param {Object} [extra] - 透传 { kind, loading, silent }
 */
export const rpc = (apiPath, data, id, extra = {}) =>
  request({ url: id != null ? `${apiPath}/${id}` : apiPath, data, ...extra })
