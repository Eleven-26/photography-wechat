/**
 * 通用上传模块 —— 图片 / 视频文件上传
 *
 * 后端路由：POST /wechat/staff/upload/file（见 routes/user.go）
 *   multipart/form-data，字段：
 *     file      —— 文件本体（必填，扩展名需命中白名单，仅图片/视频）
 *     store_id  —— 所属门店（选填）
 *     biz_type  —— 业务类型（选填，如 avatar/asset/voucher/delivery）
 *     biz_id    —— 业务 ID（选填）
 *     public    —— 选填，'1' 时落**免鉴权**公开目录（返回 /media/…，未登录可访问）；
 *                  缺省落 /uploads/…（强制鉴权）。对外宣传物料用 public，隐私文件不要用。
 *   响应：{ url, file_name, file_type, size }
 *
 * ⚠️ 该路由**免权限点**（收款凭证/作品/交付多条链路共用），内容安全由各业务接口
 *    自身的归属校验与类型白名单保证。文件大小上限由服务端 config upload.max_size_mb 控制。
 *
 * ⚠️ 本模块不能用 rpc()：rpc 走 JSON body，上传必须 multipart。
 */
import { API_BASE } from '@/config/env'
import { API_PREFIX_STAFF } from '@/api/common/apiPath'
import { API_PATHS } from '@/api/common/apiPath'
import { getToken, clearAuth } from '@/utils/auth'

/**
 * 上传单个文件
 * @param {string} filePath 本地临时文件路径（uni.chooseImage / chooseMedia 返回）
 * @param {Object} [extra]  { store_id, biz_type, biz_id, public }
 *   public=true 时表单带 `public=1`，后端落**免鉴权**公开目录并返回 /media/… URL。
 *   ⚠️ 对外物料（套餐封面、预约主页分享封面等）**必须**传 true ——
 *   客户在 H5 分享页浏览时通常未登录，走默认 /uploads 鉴权目录会整片 401、图片全裂。
 * @returns {Promise<{url: string, file_name: string, file_type: number, size: number}>}
 */
export function uploadFile(filePath, extra = {}) {
  const form = { store_id: extra.store_id || 0, biz_type: extra.biz_type || '', biz_id: extra.biz_id || 0 }
  // public 只在 true 时上报，保持与后端 c.PostForm("public") == "1" 的判定一致
  if (extra.public) form.public = '1'
  return new Promise((resolve, reject) => {
    uni.showLoading({ title: '上传中…', mask: true })
    uni.uploadFile({
      url: `${API_BASE}${API_PREFIX_STAFF}/${API_PATHS.upload.file}`,
      filePath,
      name: 'file',
      formData: form,
      header: (() => {
        const h = {}
        const token = getToken()
        if (token) h.Authorization = `Bearer ${token}`
        return h
      })(),
      success: (res) => {
        if (res.statusCode === 401) {
          clearAuth()
          uni.reLaunch({ url: '/pages/login/index' })
          return reject(new Error('未登录或登录已过期'))
        }
        let body = res.data
        try { body = typeof body === 'string' ? JSON.parse(body) : body } catch (e) { /* 保持原值 */ }
        if (!body || typeof body.code !== 'number') {
          return reject(new Error('上传响应异常'))
        }
        if (body.code !== 0) {
          uni.showToast({ title: body.msg || '上传失败', icon: 'none' })
          return reject(Object.assign(new Error(body.msg || '上传失败'), { code: body.code, body }))
        }
        resolve(body.data)
      },
      fail: (err) => {
        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
        reject(err)
      },
      complete: () => uni.hideLoading(),
    })
  })
}

/**
 * 批量上传（串行，避免小程序并发上传被限流）
 * @param {string[]} filePaths
 * @param {Object} [extra]
 * @returns {Promise<Array>} 每项为上传结果对象（与 filePaths 同序）
 */
export async function uploadFiles(filePaths, extra = {}) {
  const out = []
  for (const p of filePaths) {
    out.push(await uploadFile(p, extra))
  }
  return out
}
