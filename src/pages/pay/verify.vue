<template>
  <view class="page-pv page-wrap">
    <!-- ① 顶栏：返回 + 标题「收款确认（登记）」（D12 实测） -->
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起（1:8122 等实测） -->
    <view class="status-bar" />
    <view class="page-pv__header">
      <view class="page-pv__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <text class="page-pv__title">收款确认（登记）</text>
    </view>

    <!-- ② 金额区：36 Bold + 客户·比例 + 待确认徽章（D12 实测 y112 h198） -->
    <view class="page-pv__amount">
      <text class="page-pv__amount-num">¥{{ formatAmount(pay.amount) }}</text>
      <text class="page-pv__amount-sub">{{ pay.customer_name }} · {{ pay.type_text }}</text>
      <view class="page-pv__amount-badge"><text>待确认</text></view>
    </view>

    <!-- ③ 红警示卡：白底红描边 #D94B4B r16（D12 实测） -->
    <view class="page-pv__alert">
      <AppIcon name="alert-red-d12" :size="20" />
      <view class="page-pv__alert-text">
        <text class="page-pv__alert-title">{{ pay.customer_name }}已通过{{ pay.channel }}转账 ¥{{ formatAmount(pay.amount) }} · 请确认收款</text>
        <text class="page-pv__alert-sub">{{ pay.voucher ? '客户已上传凭证，请核对' : `客户未上传凭证 · 请核对您的${pay.channel}收款记录` }}</text>
      </view>
    </view>

    <!-- ④ 收款信息：15 Bold + 白卡 r16（D12 实测 4 行） -->
    <text class="page-pv__sec-title">收款信息</text>
    <view class="page-pv__info">
      <view class="info-row page-pv__info-row">
        <text class="page-pv__info-label">订单</text>
        <text class="page-pv__info-value">{{ orderRef.label }}</text>
      </view>
      <view class="info-row page-pv__info-row">
        <text class="page-pv__info-label">金额</text>
        <text class="page-pv__info-value page-pv__info-value--bold">¥{{ formatAmount(orderRef.amount) }}</text>
      </view>
      <view class="info-row page-pv__info-row">
        <text class="page-pv__info-label">收款方式</text>
        <text class="page-pv__info-value">{{ orderRef.channel_text }}</text>
      </view>
      <view class="info-row info-row--last page-pv__info-row page-pv__info-row--last">
        <text class="page-pv__info-label">客户操作</text>
        <text class="page-pv__info-value page-pv__info-value--ok">{{ orderRef.client_action }}</text>
      </view>
    </view>

    <!-- ⑤ 底部双钮：白描边「暂不处理」+ 黑「确认收款」（D12 实测 r999 h52） -->
    <view class="page-pv__footer">
      <view class="page-pv__btn page-pv__btn--ghost pressable" @click="goBack"><text>暂不处理</text></view>
      <view class="page-pv__btn page-pv__btn--solid pressable" :class="{ 'page-pv__btn--loading': submitting }" @click="submit">
        <text>{{ submitting ? '提交中…' : '确认收款' }}</text>
      </view>
    </view>

    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D12 收款核验（画板 1:7095「收款确认（登记）」一比一还原）
 *
 * 业务：客户转账登记（biz_order_payment status=1 待确认收款）→ 摄影师核对收款记录后确认，
 *   确认后 status=2（定金确认→档期正式锁定；尾款确认→订单进入交付）。
 * 数据：payment 记录（金额/渠道/凭证）+ 关联订单摘要；确认走 /payment/confirm/:id（联调核对）。
 * 注意：稿内 Hero 为尾款 ¥2,116、信息卡为关联订单定金 ¥804（两笔数据并存，按稿渲染）。
 * 演示数据：联调后移除。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import { confirmPayment } from '@/api/finance'
import { formatAmount } from '@/utils/format'
import { isDemo } from '@/utils/demo'

export default {
  components: { AppTabBar },
  data() {
    return {
      orderId: 0,
      submitting: false,
      /* 待核验笔（演示数据对齐 D12 稿值，联调后移除；真实结构 = biz_order_payment 行） */
      pay: {
        id: 0,
        customer_name: '陈雨',
        amount: 2116,
        type_text: '尾款 70%',
        channel: '微信',
        voucher: null,
      },
      /* 关联订单摘要（D12 稿内信息卡） */
      orderRef: {
        label: '陈雨 · 定金 30%',
        amount: 804,
        channel_text: '微信收款码',
        client_action: '已转账 · 已通知',
      },
    }
  },
  onLoad(query) {
    this.orderId = query.id
    this.fetchData()
  },
  methods: {
    formatAmount,
    async fetchData() {
      if (isDemo()) return /* 演示态直接用稿值 */
      /* 联调：getPaymentList(orderId) 取待核验笔（status=1），联调核对聚合结构 */
    },
    /** 确认收款：/payment/confirm/:id（联调核对）；演示直接成功（联调后移除） */
    async submit() {
      if (this.submitting) return
      this.submitting = true
      try {
        if (!isDemo()) {
          await confirmPayment(this.pay.id)
        }
        uni.showToast({ title: '已确认收款', icon: 'success' })
        setTimeout(() => this.goBack(), 600)
      } catch (e) {
        uni.showToast({ title: (e && e.message) || '确认失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-pv {
  padding-bottom: 320rpx;

  /* ① 顶栏（同 D01 实测规格） */
  &__header {
    position: relative; /* 标题绝对居中（2026-09-08 用户定稿：所有头部标题居中） */
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box; /* 稿 60 高，按钮/标题垂直居中（中心 y74） */
    padding: 0 $page-pad;
  }
  &__top-btn {
    box-sizing: border-box; /* 稿 44 含描边 */
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.88);
    border: 1rpx solid rgba(21, 22, 23, 0.05);
    border-radius: 50%;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 23, 0.055);
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center; /* 头部标题水平居中（用户定稿） */
    pointer-events: none;
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700; }

  /* ② 金额区（实测：¥2,116 36 Bold 居中 + 14 副 + 灰徽章） */
  &__amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 0 40rpx;
  }
  &__amount-num {
    color: #171717;
    font-size: 72rpx;   /* 36 Bold 实测 */
    font-weight: 700;
    line-height: 79rpx; /* lh39.6 实测 */
    font-family: $font-family-num;
  }
  &__amount-sub { color: $text-2; font-size: 28rpx; margin-top: 8rpx; }
  &__amount-badge {
    margin-top: 16rpx;
    padding: 6rpx 18rpx;
    background-color: $badge-gray-bg;
    border-radius: 999rpx;
    text { color: $text-2; font-size: $fs-xs; font-weight: 500; line-height: 36rpx; }
  }

  /* ③ 红警示卡：白底红描边 #D94B4B r16 pad16/12（实测） */
  &__alert {
    display: flex;
    gap: 20rpx;
    margin: 0 $page-pad;
    padding: 24rpx 32rpx;
    background-color: $white;
    border: 1rpx solid #D94B4B;
    border-radius: $radius-card;
  }
  &__alert-text { flex: 1; display: flex; flex-direction: column; gap: 6rpx; }
  &__alert-title { color: #D94B4B; font-size: 27rpx; font-weight: 700; line-height: 1.5; } /* 13.7 Bold 实测 */
  &__alert-sub { color: $text-2; font-size: 24rpx; }

  /* ④ 区块标题 + 信息卡（同 D02/D03 实测规格） */
  &__sec-title {
    display: block;
    padding: 40rpx 36rpx 20rpx;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__info {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: $radius-card;
    overflow: hidden;
  }
  /* 布局与行高由公共类 .info-row 统一（44px 行高，2026-09-08 全站统一口径） */
  &__info-row {
    &--last { border-bottom: none; }
  }
  &__info-label { color: #666666; font-size: 30rpx; } /* 15 #666 实测 */
  &__info-value { color: #333333; font-size: 30rpx; }
  &__info-value--bold { font-weight: 700; font-family: $font-family-num; }
  &__info-value--ok { color: $badge-green-text; } /* 绿 #20845C 实测 */

  /* ⑤ 底部双钮：ghost 167.5 + solid 165.5，r999 h52 15 Bold（实测） */
  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 166rpx;
    z-index: 99;
    display: flex;
    gap: 20rpx;
    padding: 20rpx $page-pad;
    background: linear-gradient(to top, rgba(242, 243, 245, 1) 70%, rgba(242, 243, 245, 0));
  }
  &__btn {
    flex: 1;
    height: 104rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999rpx;
    text { font-size: 30rpx; font-weight: 700; }

    &--ghost {
      background-color: $white;
      border: 1rpx solid rgba(21, 22, 23, 0.09);
      text { color: $text-1; }
    }
    &--solid {
      background-color: $btn-primary; /* 实测 #17181A */
      text { color: $white; }
    }
    &--loading { opacity: 0.6; }
  }
}
</style>
