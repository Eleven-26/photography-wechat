/**
 * 地址工具 —— 后端媒体地址 → 可直接加载的地址
 *
 * 背景：后端 `/upload/file` 返回的是**站内相对路径**（`/uploads/…` 需鉴权、`/media/…` 免鉴权），
 * 由 devServer / 容器 nginx 反代到 backend:8080。H5 端同源，相对路径直接可用；
 * 但**小程序没有 origin 概念**，`<image src="/uploads/x.png">` 会当成无效地址加载失败 ——
 * 表现为「后端有图、列表却全是灰块」，很容易被误判成后端没数据。
 *
 * 与 PC 端同名口径：作品集封面/图集这类对外物料存 `/media/…`（免鉴权，H5 分享页未登录也能看），
 * 订单样片/凭证存 `/uploads/…`（强制鉴权，小程序端带 token 的 request 才能取）。
 */
import { API_BASE } from '@/config/env'

/** 后端媒体目录前缀：只有这两类才需要补 API_BASE */
const BACKEND_MEDIA_PREFIXES = ['/uploads/', '/media/']

/**
 * 拼接媒体地址
 *
 * - 空值 → ''
 * - 绝对地址（`http(s)://`、`//cdn…`、`data:`）→ 原样返回（云存储/外链）
 * - 后端媒体相对路径（`/uploads/…`、`/media/…`）→ 补 `API_BASE` 前缀
 * - 其余（如小程序包内静态资源 `/static/img/…`）→ 原样返回，**不要**误加后端域名
 *
 * @param {string} u 后端返回的地址
 * @returns {string}
 */
export function mediaUrl(u) {
  if (!u) return ''
  const s = String(u).trim()
  if (!s) return ''
  if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:')) return s
  if (BACKEND_MEDIA_PREFIXES.some((p) => s.startsWith(p))) return `${API_BASE}${s}`
  return s
}
