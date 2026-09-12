/**
 * 演示模式数据（联调后整体移除）
 *
 * 背景：后端未联调期间，用登录页「演示模式」（demo-token）进入后，
 * 订单列表 → 订单详情 → 档期确认/收款核验/改期退款审核链路需可走通。
 * 口径对齐统一数据：套餐 ¥2,680 / 定金 30% ¥804 / 尾款基数 ¥1,876；
 * 客户陈雨/王浩；金额展示用元值，后端字段为 *_cents 分（联调核对）。
 *
 * 判定：token === 'demo-token'（登录页「演示模式」写入）。
 * 联调切换：删除本文件 + 各页 isDemo() 分支即可，不影响真实接口逻辑。
 */
import { getToken } from '@/utils/auth'

/** 是否演示模式（登录页「演示模式」入口写入的 demo-token） */
export function isDemo() {
  try {
    return getToken() === 'demo-token'
  } catch (e) {
    return false
  }
}

/** 演示摄影师（W01 工作台 Hero 问候等使用） */
export const photographer = { name: '路先生' }

/** 金额格式化（元值 → 千分位字符串；后端为 *_cents 分，联调核对） */
export function formatAmount(yuan) {
  return Number(yuan).toLocaleString('zh-CN')
}

/**
 * 演示订单列表（对应 D01 稿内样例多态）：
 * status：0-待确认档期 1-已确认档期 2-拍摄准备中 3-拍摄中 4-后期中 5-交付中 6-已完成 7-已取消（enums.js 口径）
 * payment_status：1-待确认收款 2-已确认 3-已全额（enums.PAYMENT_STATUS）
 * 各订单覆盖摄影师端主要操作入口：确认档期/收款核验/改期审核/退款审核/选片结果/反馈整理。
 */
export const DEMO_ORDERS = [
  {
    id: 90001, code: 'S20260907001', package_name: '家庭纪念写真',
    customer_name: '陈雨', customer_mobile: '138****6688',
    shoot_date: '2026-08-08', shoot_time: '10:00-12:30', shoot_address: '越秀公园',
    total_amt: 2680, deposit_amt: 804, final_amt: 1876,
    status: 0, payment_status: 1,
    status_text: '待确认档期', source_text: '客户预约',
  },
  {
    id: 90002, code: 'S20260729018', package_name: '家庭套餐',
    customer_name: '陈雨', customer_mobile: '138****6688',
    shoot_date: '2026-08-08', shoot_time: '10:00-12:30', shoot_address: '越秀公园',
    total_amt: 3120, deposit_amt: 804, final_amt: 2316, /* D02 口径：含妆造+200、加选+240 */
    status: 1, payment_status: 1,
    status_text: '待收款核验', source_text: '客户预约',
    note: '越秀公园拍摄，记得提前 30 分钟到场',
    addons: [ { name: '妆造服务', price: 200 }, { name: '精修 x4', price: 240 } ],
    package_meta: '拍摄2.5h · 越秀公园 · 精修20张 · 小清新',
    package_price: 2680, quote_tag: '家庭基础 报价V2',
  },
  {
    id: 90003, code: 'S20260801012', package_name: '个人形象照',
    customer_name: '李婷', customer_mobile: '137****9900',
    shoot_date: '2026-09-02', shoot_time: '14:00-16:00', shoot_address: '摄影棚',
    total_amt: 1680, deposit_amt: 504, final_amt: 1176,
    status: 2, payment_status: 2,
    status_text: '拍摄准备中', source_text: '代客下单',
    reschedule_pending: { old_time: '8月8日 10:00-12:30', new_time: '8月19日 10:00-12:30', reason: '客户临时出差' },
  },
  {
    id: 90004, code: 'S20260715009', package_name: '情侣写真',
    customer_name: '赵倩', customer_mobile: '136****3344',
    shoot_date: '2026-08-12', shoot_time: '09:00-11:30', shoot_address: '沙面',
    total_amt: 2680, deposit_amt: 804, final_amt: 1876,
    status: 4, payment_status: 2,
    status_text: '后期中', source_text: '客户预约',
  },
  {
    id: 90005, code: 'S20260720021', package_name: '家庭纪念写真',
    customer_name: '陈雨', customer_mobile: '138****6688',
    shoot_date: '2026-07-28', shoot_time: '15:00-17:30', shoot_address: '二沙岛',
    total_amt: 2680, deposit_amt: 804, final_amt: 1876, refund_amt: 804,
    status: 7, payment_status: 2,
    status_text: '退款审核', source_text: '客户预约',
    refund_pending: { amount: 643, rate: '80%', reason: '距拍摄 48-72 小时取消' },
  },
  {
    id: 90006, code: 'S20260610003', package_name: '个人形象照',
    customer_name: '周敏', customer_mobile: '135****7788',
    shoot_date: '2026-07-20', shoot_time: '10:00-12:00', shoot_address: '摄影棚',
    total_amt: 1680, deposit_amt: 504, final_amt: 1176,
    status: 6, payment_status: 3,
    status_text: '已完成', source_text: '客户预约',
  },
]

/** 演示订单详情兜底（订单详情页接口失败时使用，联调后移除） */
export function demoOrderById(id) {
  const found = DEMO_ORDERS.find((o) => String(o.id) === String(id))
  return found || DEMO_ORDERS[1]
}
