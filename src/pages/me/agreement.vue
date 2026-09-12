<template>
  <view class="page-ag page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「用户协议与隐私政策」（11:549 实测） -->
    <view class="page-ag__header">
      <view class="page-ag__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-ag__title">用户协议与隐私政策</text>
    </view>

    <!-- 协议卡 343x90：SLOT 平台协议 V2.0.0 · 2026-08-01 更新 -->
    <view class="page-ag__profile">
      <view class="page-ag__avatar"><text>S</text></view>
      <view class="page-ag__profile-main">
        <text class="page-ag__profile-name">SLOT 平台协议</text>
        <text class="page-ag__profile-sub">V2.0.0 · 2026-08-01 更新</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <!-- 协议（y225 标题 + y256 三行条款） -->
    <text class="page-ag__sec">协议</text>
    <view class="page-ag__card">
      <view v-for="(r, i) in terms" :key="r.label" class="info-row page-ag__row pressable" :class="{ 'info-row--last': i === terms.length - 1 }" @click="read(r.label)">
        <text class="page-ag__label">{{ r.label }}</text>
        <text class="page-ag__value">{{ r.value }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 账号注销（y421 标题行 + 提示 + y471 争议协调行） -->
    <view class="page-ag__sec-row">
      <text class="page-ag__sec">账号注销</text>
      <text class="page-ag__sec-hint">注销后数据保留 30 天供导出</text>
    </view>
    <view class="page-ag__card">
      <view class="info-row page-ag__row info-row--last">
        <view class="page-ag__row-icon"><AppIcon name="me-shield" :size="17" /></view>
        <view class="page-ag__row-main">
          <text class="page-ag__row-label">争议协调</text>
          <text class="page-ag__row-sub">纠纷可提交平台协调</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 我已阅读并同意 343x52 黑胶囊（y556） -->
    <view class="page-ag__agree pressable" @click="agree"><text>我已阅读并同意</text></view>
    <view class="page-ag__safe" />
  </view>
</template>

<script>
/**
 * ME12d 用户协议与隐私政策（稿 11:549 实测 1:1）
 * 协议卡（V2.0.0 · 2026-08-01 更新）→ 协议三行（资金边界/内容权利/个人信息）→ 账号注销（争议协调行）→ 我已阅读并同意黑胶囊 52。
 */
export default {
  name: 'MeAgreement',
  data() {
    return {
      terms: [
        { label: '资金边界', value: '平台不经手资金' },
        { label: '内容权利', value: '作品版权归摄影师' },
        { label: '个人信息', value: '不向第三方提供' },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    read(label) {
      uni.showToast({ title: `查看${label}条款（演示）`, icon: 'none' })
    },
    agree() {
      uni.showToast({ title: '已同意（演示）', icon: 'success' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ag {
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
    color: #151617;
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 20rpx 32rpx 0; /* 稿：卡 @114，左右 32rpx=x16 与页内其余卡对齐 */
    box-sizing: border-box;
    height: 180rpx;
    background-color: $white;
    border-radius: 32rpx;
    padding: 0 32rpx;
  }
  &__avatar {
    box-sizing: border-box;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background-color: #161616;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 40rpx; font-weight: 700; color: #FFD60A; }
  }
  &__profile-main { flex: 1; min-width: 0; }
  &__profile-name { display: block; font-size: 30rpx; font-weight: 500; color: #000000; }
  &__profile-sub { display: block; margin-top: 6rpx; font-size: 21rpx; color: #666666; }

  &__sec { display: block; margin: 40rpx 36rpx; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 左右 32rpx：标题与卡片左缘对齐（2026-09-10 补，原缺失致贴屏边） */
  &__profile + &__sec { margin-top: 40rpx; } /* 同族口径：头卡底 204 → 标题（上 20px），与 ME02 对齐 */
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0;
    .page-ag__sec { margin: 0; } /* 行内标题清空左右 margin（sec-row 已提供边距，避免二次缩进） */
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; }

  &__card {
    margin: 24rpx 32rpx 0; /* 同族口径：标题 → 卡片（下 12px），与 ME02 对齐 */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row { gap: 16rpx; }
  &__label { font-size: 28rpx; color: #666666; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 26rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 30rpx; color: #1A1A1A; }
  &__row-sub { display: block; margin-top: 6rpx; font-size: 21rpx; color: #666666; }

  &__agree {
    box-sizing: border-box;
    margin: 40rpx 32rpx 0;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #FFFFFF; }
  }

  &__safe { height: 60rpx; }
}
</style>
