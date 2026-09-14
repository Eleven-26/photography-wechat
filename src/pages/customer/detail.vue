<template>
  <view class="page-cd page-wrap">
    <view class="status-bar" />
    <!-- Header：返回 + 「客户档案」（1:7031 实测） -->
    <view class="page-cd__header">
      <view class="page-cd__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-cd__title">客户档案</text>
    </view>

    <!-- 客户头卡：头像+名+统计+右 32 黑圆电话（1:41 Group 153 实测 343×72） -->
    <view class="page-cd__head">
      <view class="page-cd__avatar" :style="{ backgroundColor: avatarColor }">
        <text>{{ (customer.name || '')[0] }}</text>
      </view>
      <view class="page-cd__head-main">
        <text class="page-cd__name">{{ customer.name }}</text>
        <text class="page-cd__stat">{{ statText }}</text>
      </view>
      <!-- 呼叫客户：黑底圆内为白色听筒（原误用 phone-gray＝手机外框形状，语义不符；2026-09-10 修正） -->
      <view class="page-cd__call pressable" @click="call">
        <AppIcon name="phone-white" :size="16" />
      </view>
    </view>

    <!-- 待跟进黑卡（仅潜在客户展示；1:52 实测 343×60：金点+状态+金钮发选片链接） -->
    <view v-if="isPending" class="page-cd__follow">
      <view class="page-cd__follow-dot" />
      <view class="page-cd__follow-main">
        <text class="page-cd__follow-t1">待跟进 · {{ followHint }}</text>
        <text class="page-cd__follow-t2">来自今日待跟进提醒</text>
      </view>
      <view class="page-cd__follow-btn pressable" @click="sendLink"><text>发选片链接</text></view>
    </view>

    <text class="page-cd__sec">全部订单</text>
    <!-- 订单卡（1:60 Group 157 实测 343×74；多单纵向排列） -->
    <view v-for="o in orders" :key="o.id" class="page-cd__order pressable" @click="goOrder(o)">
      <view class="page-cd__order-head">
        <text class="page-cd__order-name">{{ o.package_name || o.code }}</text>
        <view class="page-cd__status">
          <view class="page-cd__status-dot" />
          <text>{{ o.status_text }}</text>
        </view>
      </view>
      <view class="page-cd__order-row2">
        <text class="page-cd__order-sub">{{ orderSub(o) }}</text>
        <text class="page-cd__order-price">￥{{ formatAmount(o.total_amt) }}</text>
      </view>
    </view>
    <AppEmpty v-if="!loading && !orders.length" text="暂无订单" />

    <text class="page-cd__sec">客户资料</text>
    <!-- 资料卡 r20：手机/微信/渠道（1:67 实测） -->
    <view class="page-cd__card">
      <view class="page-cd__cell" @click="call">
        <text class="page-cd__cell-label">手机</text>
        <text class="page-cd__cell-val">{{ maskedMobile }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="page-cd__cell page-cd__cell--line" @click="fillWechat">
        <text class="page-cd__cell-label">微信</text>
        <text
          class="page-cd__cell-val"
          :class="{ 'page-cd__cell-val--dim': !customer.wechat }"
        >{{ customer.wechat || '未填写' }}</text>
        <text v-if="!customer.wechat" class="page-cd__cell-fill">填补</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="page-cd__cell">
        <text class="page-cd__cell-label">渠道</text>
        <text class="page-cd__cell-val">{{ customer.source || '—' }}</text>
      </view>
    </view>

    <AppTabBar active="customer" />
    <view class="page-cd__safe" />
  </view>
</template>

<script>
/**
 * CU02 客户档案（稿 1:7027 实测 1:1）
 * 客户头卡（统计+电话圆钮）→ 待跟进黑卡（发选片链接金钮）→ 全部订单 → 客户资料（手机/微信/渠道）。
 * 微信未填写行带「填补」入口（稿实测）；手机脱敏展示。
 *
 * 数据源（2026-09-14 接线）：
 *   /customer/detail/:id → 客户档案（name/mobile/wechat/source/status/order_count/total_amount…）
 *   /customer/orders/:id → 客户名下订单（package_name/code/status/shoot_date/total_amt…）
 * 待跟进黑卡仅对「潜在（status=1）」客户展示。
 */
import { getCustomerDetail, getCustomerOrders } from '@/api/customer'
import { formatAmount, contactPhotographer } from '@/utils/format'

/** 头像底色（与客户列表同一族色，按姓名哈希取色） */
const AVATAR_COLORS = ['#F89494', '#08A4FF', '#EFA803', '#00CB8E', '#699EFF', '#FF6ABE']
/** 订单状态文案（biz_order.status 0-7） */
const ORDER_STATUS = {
  0: '待确认', 1: '待定金', 2: '待拍摄', 3: '拍摄中',
  4: '精修中', 5: '待交付', 6: '已完成', 7: '已取消',
}

export default {
  name: 'CustomerDetail',
  data() {
    return {
      customerId: '',
      customer: {},
      orders: [],
      loading: false,
    }
  },
  computed: {
    avatarColor() {
      const name = this.customer.name || ''
      let h = 0
      for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 997
      return AVATAR_COLORS[h % AVATAR_COLORS.length]
    },
    /** 头卡统计行：累计金额 · 单数 · 最近拍摄日 */
    statText() {
      const last = this.orders[0] && this.orders[0].shoot_date
      return [
        `累计 ¥${formatAmount(this.customer.total_amount || 0)}`,
        `${this.customer.order_count || 0} 单`,
        last ? `最近 ${String(last).slice(5).replace('-', '/')}` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    },
    isPending() { return Number(this.customer.status) === 1 },
    followHint() { return this.customer.remark || '待回访确认拍摄意向' },
    maskedMobile() { return this.maskMobile(this.customer.mobile) },
  },
  onLoad(query) {
    this.customerId = (query && query.id) || ''
    this.fetchAll()
  },
  methods: {
    formatAmount,
    async fetchAll() {
      if (!this.customerId) return
      this.loading = true
      try {
        const [c, orders] = await Promise.all([
          getCustomerDetail(this.customerId).catch(() => null),
          getCustomerOrders(this.customerId).catch(() => null),
        ])
        this.customer = c || {}
        const list = Array.isArray(orders) ? orders : (orders && orders.list) || []
        this.orders = list.map((o) => ({ ...o, status_text: ORDER_STATUS[Number(o.status)] || '' }))
      } finally {
        this.loading = false
      }
    },
    /** 手机号脱敏：138****2546 */
    maskMobile(mobile) {
      const m = String(mobile || '')
      return m.length === 11 ? `${m.slice(0, 3)}****${m.slice(7)}` : m || '—'
    },
    orderSub(o) {
      const d = String(o.shoot_date || '')
      return [o.package_name, d.slice(5).replace('-', '/'), o.photographer].filter(Boolean).join(' · ')
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/customer/list' }) })
    },
    call() { contactPhotographer(this.customer.mobile) },
    /** 发选片链接：跳该客户最近订单的选片结果页 */
    sendLink() {
      const first = this.orders[0]
      if (!first) return uni.showToast({ title: '该客户暂无订单', icon: 'none' })
      uni.navigateTo({ url: `/pages/select/result?id=${first.id}` })
    },
    goOrder(o) { uni.navigateTo({ url: `/pages/order/detail?id=${o.id}` }) },
    fillWechat() {
      uni.showToast({ title: '微信号请在管理端完善', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-cd {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
  }
  &__back {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.88);
    border: 1rpx solid rgba(21, 22, 24, 0.05);
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
    color: #151617;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 20rpx;
    height: 144rpx; /* 稿：卡 343×72，内容垂直居中（头像距顶 16） */
    box-sizing: border-box;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx; /* 稿 1:7042 实测 cornerRadius 16px → 32rpx */
    padding: 0 32rpx;
  }
  &__avatar {
    box-sizing: border-box;
    width: 80rpx;
    height: 80rpx;
    border-radius: 24rpx; /* 稿同头像族：cornerRadius 12px → 24rpx 圆角方 */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 28rpx; font-weight: 500; color: #FFFFFF; }
  }
  &__head-main { flex: 1; min-width: 0; }
  &__name { display: block; font-size: 28rpx; font-weight: 500; color: #333333; }
  &__stat { display: block; margin-top: 6rpx; font-size: 22rpx; color: #666666; }
  &__call {
    box-sizing: border-box;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background-color: #171717;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__follow {
    display: flex;
    align-items: center;
    gap: 24rpx; /* 稿：金点右缘→文本 12px */
    height: 120rpx; /* 稿：黑卡 343×60，内容垂直居中 */
    box-sizing: border-box;
    margin: 20rpx 32rpx 0;
    background-color: #121212;
    border-radius: 32rpx; /* 稿 1:7052 实测 cornerRadius 16px → 32rpx */
    padding: 0 32rpx;
  }
  &__follow-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background-color: #FFDA08; flex-shrink: 0; }
  &__follow-main { flex: 1; min-width: 0; }
  &__follow-t1 { display: block; font-size: 28rpx; font-weight: 500; color: #FFFFFF; }
  &__follow-t2 { display: block; margin-top: 4rpx; font-size: 22rpx; color: #CCCCCC; }
  &__follow-btn {
    box-sizing: border-box;
    background-color: #FFDA08;
    border-radius: 999rpx; /* 稿 1:7056 实测 cornerRadius 20 → 28 高全胶囊 */
    padding: 12rpx 24rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; font-weight: 500; color: #121212; }
  }

  &__sec {
    display: block;
    margin: 40rpx 36rpx 0; /* 稿：卡底→标题 20px */
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
  }
  &__order {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx; /* 稿 1:7061 实测 cornerRadius 16px → 32rpx */
    padding: 32rpx;
  }
  &__order-head { display: flex; align-items: center; justify-content: space-between; }
  &__order-name { font-size: 30rpx; line-height: 36rpx; font-weight: 700; color: #171819; }
  &__status {
    display: flex;
    align-items: center;
    gap: 10rpx;
    text { font-size: 22rpx; font-weight: 500; color: #B66E00; }
  }
  &__status-dot { width: 12rpx; height: 12rpx; border-radius: 50%; background-color: #B66E00; }
  &__order-row2 {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-top: 8rpx;
  }
  &__order-sub { font-size: 24rpx; line-height: 35rpx; color: #747981; }
  &__order-price { font-size: 30rpx; line-height: 36rpx; font-weight: 700; color: #171819; font-family: $font-family-num; }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 40rpx;
  }
  &__cell {
    display: flex;
    align-items: center;
    gap: 20rpx;
    box-sizing: border-box;
    min-height: 128rpx; /* 全站 kv 行统一 64px */
    padding: 0 32rpx;
    &--line { border-top: 1rpx solid rgba(21, 22, 24, 0.09); }
  }
  &__cell-label { font-size: 30rpx; color: #666666; }
  &__cell-val {
    margin-left: auto;
    font-size: 30rpx;
    font-weight: 500;
    color: #171717;
    &--dim { color: #999999; font-weight: 400; }
  }
  &__cell-fill { font-size: 30rpx; font-weight: 500; color: #333333; }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
