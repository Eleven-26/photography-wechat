/**
 * 格式化工具 —— 金额 / 日期 / 倒计时
 * 金额口径：后端 DECIMAL(12,2) 元（如 2116.00），前端仅做展示格式化，
 *           不在前端做金额运算（金额计算一律以服务端返回为准，防止精度差异）。
 */

/**
 * 金额格式化：2116.00 → "2,116"
 * @param {number|string} amount 金额（元）
 * @param {boolean} [withSymbol=false] 是否带 ¥
 * @param {boolean} [keepDecimal=false] 是否保留两位小数
 */
export function formatAmount(amount, withSymbol = false, keepDecimal = false) {
  if (amount === null || amount === undefined || amount === '') return withSymbol ? '¥0' : '0'
  const num = Number(amount)
  if (Number.isNaN(num)) return withSymbol ? '¥0' : '0'
  const text = keepDecimal
    ? num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : num.toLocaleString('zh-CN', { maximumFractionDigits: 0 })
  return withSymbol ? `¥${text}` : text
}

/**
 * 统一时间解析（内部）：兼容后端两种时间串与时间戳。
 *   1. RFC 3339 / ISO（含 'T'，如 2026-09-14T14:06:24+08:00）—— Go time.Time 的 JSON 默认形态
 *   2. 'yyyy-MM-dd HH:mm:ss' / 'yyyy-MM-dd' —— 需把 '-' 换 '/'，否则 iOS Safari 解析为 Invalid Date
 * @returns {Date|null}
 */
function parseTime(val) {
  if (val === null || val === undefined || val === '') return null
  if (val instanceof Date) return val
  if (typeof val === 'number') {
    const dn = new Date(val)
    return Number.isNaN(dn.getTime()) ? null : dn
  }
  const s = String(val)
  const d = s.includes('T') ? new Date(s) : new Date(s.replace(/-/g, '/'))
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * 日期时间格式化
 * @param {string|number|Date} val 支持 RFC3339 / 'yyyy-MM-dd' / 'yyyy-MM-dd HH:mm:ss' / 时间戳
 * @param {string} [fmt='yyyy-MM-dd']
 */
export function formatDate(val, fmt = 'yyyy-MM-dd') {
  if (!val) return ''
  const d = parseTime(val)
  if (!d) return String(val)
  const map = {
    yyyy: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    dd: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
  }
  return Object.keys(map).reduce((acc, k) => acc.replace(k, map[k]), fmt)
}

/** 剩余毫秒 → 倒计时文案（报价 48h / 选片 72h 倒计时用） */
export function remainText(deadline) {
  const d = parseTime(deadline)
  if (!d) return ''
  const diff = d.getTime() - Date.now()
  if (diff <= 0) return '已过期'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return h >= 24 ? `${Math.floor(h / 24)} 天 ${h % 24} 小时` : `${h} 小时 ${m} 分`
}

/**
 * 相对时间文案（列表副行用）：刚刚 / N分钟前 / N小时前 / 昨天 / M-D
 * 注：解析走 parseTime，兼容 RFC3339（含 T）与 'yyyy-MM-dd HH:mm:ss'（iOS 需换斜杠）。
 */
export function fromNow(val) {
  const d = parseTime(val)
  if (!d) return ''
  const t = d.getTime()
  const diff = Date.now() - t
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 172800000) return '昨天'
  return `${d.getMonth() + 1}-${d.getDate()}`
}

/** 联系动作统一走端外（需求文档 §3.2：站内不建 IM） */
export function contactPhotographer(mobile) {
  if (!mobile) {
    uni.showToast({ title: '暂无联系电话', icon: 'none' })
    return
  }
  uni.makePhoneCall({ phoneNumber: String(mobile) })
}
