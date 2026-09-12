<template>
  <!-- D13 订单完成（1:3550）一比一还原：绿圆+完成态 + 交付状态 + 尾款/汇总/照片保留 + 双钮 -->
  <view class="page-oc">
    <view class="status-bar" />
    <view class="page-oc__header">
      <view class="page-oc__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-oc__title">
        <text class="page-oc__title-text">订单完成</text>
      </view>
    </view>

    <!-- 完成标置：绿圆 40 @(167,144) 居中 + 标题 18 Bold -->
    <view class="page-oc__hero">
      <AppIcon name="check-green-lg" :size="40" />
      <text class="page-oc__hero-txt">订单已完成</text>
    </view>

    <!-- 交付状态卡 343x135 r16：两行 绿勾+标题/副行+完成徽章 -->
    <view class="page-oc__label">交付状态</view>
    <view class="page-oc__deliver">
      <view class="page-oc__deliver-row page-oc__deliver-row--line">
        <AppIcon name="check-green-sm" :size="16" />
        <view class="page-oc__deliver-txt">
          <text class="page-oc__deliver-title">高清下载已开放</text>
          <text class="page-oc__deliver-sub">30 天有效 · 9/16 到期</text>
        </view>
        <view class="page-oc__badge-done"><text class="page-oc__badge-done-txt">完成</text></view>
      </view>
      <view class="page-oc__deliver-row">
        <AppIcon name="check-green-sm" :size="16" />
        <view class="page-oc__deliver-txt">
          <text class="page-oc__deliver-title">客户已确认收片</text>
        </view>
        <view class="page-oc__badge-done"><text class="page-oc__badge-done-txt">完成</text></view>
      </view>
    </view>

    <!-- 尾款卡：36 Bold 金额 + 绿色到账行（稿 Section y465） -->
    <view class="page-oc__label page-oc__label--mt">尾款</view>
    <view class="page-oc__final">
      <text class="page-oc__final-amt">¥{{ order.final_due || '2,116' }}</text>
      <view class="page-oc__final-row">
        <AppIcon name="check-green-wide" :size="20" />
        <text class="page-oc__final-txt">已确认到账 · 8/17 15:30</text>
      </view>
    </view>

    <!-- 收款汇总卡：定金/尾款两列 + 总额行（hairline #F0F0EB） -->
    <view class="page-oc__label page-oc__label--mt">收款汇总</view>
    <view class="page-oc__summary">
      <view class="page-oc__sum-grid">
        <view class="page-oc__sum-item">
          <text class="page-oc__sum-label">定金</text>
          <text class="page-oc__sum-val">¥{{ order.deposit || '804' }}</text>
        </view>
        <view class="page-oc__sum-item">
          <text class="page-oc__sum-label">尾款</text>
          <text class="page-oc__sum-val">¥{{ order.final_due || '2,116' }}</text>
        </view>
      </view>
      <view class="page-oc__sum-total">
        <text class="page-oc__sum-total-label">订单总额</text>
        <text class="page-oc__sum-total-val">¥{{ order.total || '2,920' }}</text>
      </view>
    </view>

    <!-- 照片保留卡：保留期 + 延期钮 -->
    <view class="page-oc__label page-oc__label--mt">照片保留</view>
    <view class="page-oc__keep">
      <view class="page-oc__keep-line">
        <text class="page-oc__keep-txt">未选中照片（128 张）保留至 </text>
        <text class="page-oc__keep-date">10/8</text>
        <text class="page-oc__keep-txt"> 自动清理</text>
      </view>
      <text class="page-oc__keep-sub">清理前 7 天提醒 · 可手动延期</text>
      <view class="page-oc__keep-btn" @click="onExtend">
        <text class="page-oc__keep-btn-txt">延期 30 天</text>
      </view>
    </view>

    <!-- 底部双钮 -->
    <view class="page-oc__footer">
      <view class="footer-safe" />
      <view class="page-oc__footer-row">
        <view class="page-oc__btn page-oc__btn--ghost" @click="onReview">
          <text class="page-oc__btn-ghost-txt">查看客户评价</text>
        </view>
        <view class="page-oc__btn page-oc__btn--solid" @click="onArchive">
          <text class="page-oc__btn-solid-txt">完成归档</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { demoOrderById } from '@/utils/demo'

export default {
  data() {
    return { orderId: '', order: {} }
  },
  onLoad(options) {
    this.orderId = (options && options.id) || ''
    // 演示数据兜底（联调后走 getOrderDetail，标注联调核对）
    this.order = demoOrderById(this.orderId) || { total: '2,920', deposit: '804', final_due: '2,116' }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    onExtend() {
      uni.showToast({ title: '已延期 30 天（演示）', icon: 'none' }) // 联调后接延期接口
    },
    onReview() {
      uni.showToast({ title: '评价页待设计稿', icon: 'none' }) // biz_order_review 稿未出
    },
    onArchive() {
      uni.showToast({ title: '已归档（演示）', icon: 'none' }) // 联调后接归档接口
    },
  },
}
</script>

<style lang="scss" scoped>
.page-oc {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 220rpx;

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box;
    padding: 0 $page-pad;
  }
  &__top-btn {
    box-sizing: border-box;
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
    text-align: center;
    pointer-events: none;
  }
  &__title-text {
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 80rpx; /* 稿圆 y144 = header 底 104 + 40px(80rpx) */
    gap: 42rpx; /* 圆底 184 → 文字 205 = 21px */
  }
  &__hero-txt {
    color: $text-1;
    font-size: 36rpx;
    font-weight: 700;
  }

  &__label {
    margin: 40rpx $page-pad 20rpx; /* 稿 label 与卡间 10，卡间 20 */
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 40rpx;
  }
  &__label--mt {
    margin-top: 40rpx;
  }

  &__deliver {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__deliver-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 40rpx 32rpx; /* 稿 20 */
  }
  &__deliver-row--line {
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__deliver-txt {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  &__deliver-title {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__deliver-sub {
    color: $text-2;
    font-size: 24rpx;
  }
  &__badge-done {
    background-color: $badge-green-bg;
    border-radius: 999rpx;
    padding: 6rpx 18rpx; /* 稿 3/9 */
  }
  &__badge-done-txt {
    color: $badge-green-text;
    font-size: 22rpx;
    font-weight: 500;
  }

  &__final {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 32rpx;
    padding: 30rpx 32rpx 32rpx; /* 稿 15/16 */
  }
  &__final-amt {
    color: #171717;
    font-size: 72rpx; /* 稿 36 */
    font-weight: 700;
  }
  &__final-row {
    display: flex;
    align-items: center;
    gap: 12rpx; /* 稿 g6 */
    margin-top: 8rpx;
  }
  &__final-txt {
    color: $badge-green-text;
    font-size: 26rpx;
  }

  &__summary {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 32rpx;
    padding: 20rpx 32rpx; /* 稿 10/16 */
  }
  &__sum-grid {
    display: flex;
  }
  &__sum-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 14rpx 0; /* 稿 7 */
  }
  &__sum-label {
    color: #6B7280; /* 实测 */
    font-size: 28rpx;
  }
  &__sum-val {
    color: $text-1;
    font-size: 28rpx;
    font-weight: 700;
    margin-top: 2rpx;
  }
  &__sum-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 0 14rpx; /* 稿 15/7 */
    border-top: 1rpx solid #F0F0EB; /* 实测 */
  }
  &__sum-total-label {
    color: #171717;
    font-size: 28rpx;
    font-weight: 700;
  }
  &__sum-total-val {
    color: $text-1;
    font-size: 36rpx; /* 稿 18 */
    font-weight: 700;
  }

  &__keep {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 32rpx;
    padding: 28rpx 32rpx; /* 稿 14/16 */
  }
  &__keep-line {
    display: flex;
    align-items: baseline;
  }
  &__keep-txt {
    color: $text-1;
    font-size: 26rpx;
  }
  &__keep-date {
    color: $text-1;
    font-size: 26rpx;
    font-weight: 700;
  }
  &__keep-sub {
    display: block;
    color: $text-2;
    font-size: 24rpx;
    margin-top: 2rpx;
  }
  &__keep-btn {
    margin-top: 20rpx; /* 稿 10 */
    box-sizing: border-box;
    display: inline-flex; /* 稿为 hug 小药丸，宽度由文字撑开 */
    align-items: center;
    justify-content: center;
    width: auto;
    height: 72rpx; /* 稿 36px */
    padding: 0 24rpx; /* 稿左右留白 12px */
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 999rpx;
  }
  &__keep-btn-txt {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }

  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $bg-page;
  }
  &__footer-row {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 32rpx 28rpx;
  }
  &__btn {
    flex: 1;
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999rpx;
  }
  &__btn--ghost {
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__btn--solid {
    background-color: #171819;
  }
  &__btn-ghost-txt {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__btn-solid-txt {
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
  }
}
</style>
