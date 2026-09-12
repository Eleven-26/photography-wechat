<template>
  <view class="page-hp page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「帮助与关于」（1:6344 实测，画板名「帮主」系稿内笔误） -->
    <view class="page-hp__header">
      <view class="page-hp__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-hp__title">帮助与关于</text>
    </view>

    <!-- 帮助（y104 标题 + y159 常见问题行） -->
    <text class="page-hp__sec">帮助</text>
    <view class="page-hp__card">
      <view class="info-row page-hp__row info-row--last pressable" @click="goFaq">
        <view class="page-hp__row-icon"><AppIcon name="me-help" :size="17" /></view>
        <view class="page-hp__row-main">
          <text class="page-hp__row-label">常见问题</text>
          <text class="page-hp__row-sub">下单 / 档期 / 收款 / 交付</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 联系（y224 标题 + y279 两行卡：客服电话/意见反馈） -->
    <text class="page-hp__sec">联系</text>
    <view class="page-hp__card">
      <view class="info-row page-hp__row pressable" @click="callService">
        <view class="page-hp__row-icon"><AppIcon name="phone" :size="17" /></view>
        <view class="page-hp__row-main">
          <text class="page-hp__row-label">客服电话</text>
          <text class="page-hp__row-sub">工作日 9:00-19:00</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-hp__row info-row--last pressable" @click="goFeedback">
        <view class="page-hp__row-icon page-hp__row-icon--alt"><AppIcon name="edit-gray" :size="17" /></view>
        <view class="page-hp__row-main">
          <text class="page-hp__row-label">意见反馈</text>
          <text class="page-hp__row-sub">把问题告诉我们</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 关于（y410 标题 + y465 三行卡：用户协议/隐私政策/版本） -->
    <text class="page-hp__sec">关于</text>
    <view class="page-hp__card">
      <view class="info-row page-hp__row pressable" @click="goAgreement">
        <text class="page-hp__label">用户协议</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-hp__row pressable" @click="goAgreement">
        <text class="page-hp__label">隐私政策</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-hp__row info-row--last">
        <text class="page-hp__label">版本</text>
        <text class="page-hp__value">V2.0.0</text>
      </view>
    </view>
    <view class="page-hp__safe" />
  </view>
</template>

<script>
/**
 * ME12 帮助与关于（稿 1:6344 实测 1:1）
 * 帮助（常见问题）→ 联系（客服电话/意见反馈）→ 关于（用户协议/隐私政策/版本 V2.0.0）。
 */
export default {
  name: 'MeHelp',
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goFaq() {
      uni.navigateTo({ url: '/pages/me/faq' })
    },
    goFeedback() {
      uni.navigateTo({ url: '/pages/me/feedback' })
    },
    goAgreement() {
      uni.navigateTo({ url: '/pages/me/agreement' })
    },
    callService() {
      uni.showToast({ title: '呼叫客服（演示）', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-hp {
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
    /* 稿实测：header 底 104 → 「帮助」文字 123；「联系」上方卡底 222 → 244。
       即标题「离上 20px、离下 12px」——原 margin-top:0 让标题贴死在 header/卡上，方向反了 */
    margin: 40rpx 36rpx 0;
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：标题底 147 → 卡顶 159（12px） */
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
  &__label {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
  }
  &__value { font-size: 26rpx; color: #6D6D72; }

  &__safe { height: 60rpx; }
}
</style>
