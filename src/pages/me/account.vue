<template>
  <view class="page-ac page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「账号与安全」（1:6298 实测） -->
    <view class="page-ac__header">
      <view class="page-ac__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-ac__title">账号与安全</text>
    </view>

    <!-- 登录账号（y104 标题 + y159 三行：手机号/微信/登录设备） -->
    <text class="page-ac__sec">登录账号</text>
    <view class="page-ac__card">
      <view class="info-row page-ac__row pressable" @click="goPhone">
        <text class="page-ac__label">手机号</text>
        <text class="page-ac__value">138****5200</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-ac__row pressable" @click="edit('微信')">
        <text class="page-ac__label">微信</text>
        <text class="page-ac__value">已绑定</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-ac__row pressable" @click="goDevices">
        <text class="page-ac__label">登录设备</text>
        <text class="page-ac__value page-ac__value--sub">当前手机 · 共 1 台</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 退出登录 343x52 白胶囊 r999 红字 #E5484D（y348） -->
    <view class="page-ac__logout pressable" @click="logout"><text>退出登录</text></view>
    <view class="page-ac__safe" />
  </view>
</template>

<script>
/**
 * ME11 账号与安全（稿 1:6298 实测 1:1）
 * 登录账号三行（手机号 138****5200 / 微信 已绑定 / 登录设备 当前手机·共 1 台）→ 退出登录白胶囊红字 #E5484D。
 */
export default {
  name: 'MeAccount',
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goPhone() {
      uni.navigateTo({ url: '/pages/me/phone' })
    },
    goDevices() {
      uni.navigateTo({ url: '/pages/me/devices' })
    },
    edit(label) {
      uni.showToast({ title: `${label}（演示）`, icon: 'none' })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定退出当前账号？',
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({ url: '/pages/login/index' })
          }
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ac {
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
    margin: 40rpx 36rpx;
    font-size: 32rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 62rpx 32rpx 0; /* 稿：标签顶→卡顶 55px */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row { gap: 16rpx; }
  &__label { font-size: 30rpx; color: #86868B; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 27rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--sub { font-size: 25rpx; color: #6D6D72; }
  }

  &__logout {
    box-sizing: border-box;
    margin: 40rpx 32rpx 0;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #E5484D; }
  }

  &__safe { height: 60rpx; }
}
</style>
