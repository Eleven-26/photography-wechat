<template>
  <view class="page-fq page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「常见问题」（11:387 实测） -->
    <view class="page-fq__header">
      <view class="page-fq__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-fq__title">常见问题</text>
    </view>

    <!-- 改期（y104 标题 + 一行卡） -->
    <text class="page-fq__sec">改期</text>
    <view class="page-fq__card">
      <view class="info-row page-fq__row info-row--last">
        <view class="page-fq__row-icon"><AppIcon name="me-help" :size="17" /></view>
        <view class="page-fq__row-main">
          <text class="page-fq__row-label">客户改期要收调度费吗？</text>
          <text class="page-fq__row-sub">72 小时外免费；72 小时内收 20%（¥536）</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 退款（y224 标题 + 两行卡） -->
    <text class="page-fq__sec">退款</text>
    <view class="page-fq__card">
      <view class="info-row page-fq__row">
        <view class="page-fq__row-icon"><AppIcon name="me-wallet" :size="17" /></view>
        <view class="page-fq__row-main">
          <text class="page-fq__row-label">定金支持退款吗？</text>
          <text class="page-fq__row-sub">48-72h 退 80% · 24-48h 退 50%</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-fq__row info-row--last">
        <view class="page-fq__row-icon page-fq__row-icon--alt"><AppIcon name="me-send" :size="17" /></view>
        <view class="page-fq__row-main">
          <text class="page-fq__row-label">改期要提前多久申请？</text>
          <text class="page-fq__row-sub">至少提前 24 小时 · 24 小时内不可改期</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 加选与交付（y410 标题 + 三行卡：Q/A 上下两行结构） -->
    <text class="page-fq__sec">加选与交付</text>
    <view class="page-fq__card">
      <view class="info-row page-fq__row page-fq__row--qa">
        <view class="page-fq__qa-main">
          <text class="page-fq__q">加选差价怎么付？</text>
          <text class="page-fq__a">自动计入尾款 · 结清时一次付清</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-fq__row info-row--last page-fq__row--kv">
        <text class="page-fq__label">精修何时交付？</text>
        <text class="page-fq__value">约 7 个工作日</text>
      </view>
    </view>
    <view class="page-fq__safe" />
  </view>
</template>

<script>
/**
 * ME12c 常见问题（稿 11:387 实测 1:1）
 * 改期一行 → 退款两行 → 加选与交付三行（加选差价 Q/A + 精修交付 kv）。
 * 口径对齐：调度费 72h 规则、定金退款 48-72h 退 80% / 24-48h 退 50%、加选差价自动计入尾款。
 */
export default {
  name: 'MeFaq',
  methods: {
    goBack() {
      uni.navigateBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.page-fq {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
  }
  &__back {
    box-sizing: border-box;
    position: absolute;
    left: 32rpx;
    z-index: 1;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
    color: #1A1A1A;
  }

  &__sec {
    display: block;
    margin: 40rpx 36rpx; /* 稿：卡底紧贴下一标签 */
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
    &:first-of-type { margin-top: 0; }
  }

  &__card {
    margin: 62rpx 32rpx 0; /* 稿：标签顶→卡顶 55px */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row { gap: 24rpx; }
  &__row-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 50%;
    background-color: #F1F1F3;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--alt { background-color: #F1F1F3; }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 28rpx; color: #1A1A1A; }
  &__row-sub { display: block; margin-top: 6rpx; font-size: 20rpx; color: #8E8E93; }

  &__row--qa {
    flex-direction: row;
    align-items: center;
    .page-fq__qa-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
  }
  &__row--kv { gap: 16rpx; }
  &__q { font-size: 28rpx; color: #1A1A1A; }
  &__a { font-size: 24rpx; color: #8E8E93; }
  &__label { flex: 1; min-width: 0; font-size: 28rpx; color: #1A1A1A; }
  &__value { font-size: 26rpx; color: #6D6D72; }

  &__safe { height: 60rpx; }
}
</style>
