<template>
  <view class="page-me page-wrap">
    <view class="status-bar" />
    <!-- Header：「我的」17 居中，tab 根页无返回钮（1:5731 实测） -->
    <view class="page-me__header">
      <text class="page-me__title">我的</text>
    </view>

    <!-- 资料卡：52 圆头像 + 名 17 + 副 12 #8E8E93 + 右箭头（y104 白卡 r16） -->
    <view class="page-me__profile pressable" @click="goProfile">
      <view class="page-me__avatar">
        <text>路</text>
      </view>
      <view class="page-me__profile-main">
        <text class="page-me__name">路先生</text>
        <text class="page-me__sub">独立摄影师 · 路先生摄影</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <!-- 预约主页推广黑卡 #161616 r16（y196）：金点标题 + 说明 + 链接条 + 双钮 -->
    <view class="page-me__promo">
      <view class="page-me__promo-head">
        <view class="page-me__promo-dot" />
        <text class="page-me__promo-title">我的预约主页</text>
        <text class="page-me__promo-hint">客户看到的门面</text>
      </view>
      <text class="page-me__promo-desc">作品展示 · 套餐报价 · 可约档期 · 直接下单</text>
      <view class="page-me__promo-link" @click="copyLink">
        <AppIcon name="me-link" :size="13" />
        <text class="page-me__promo-url">{{ shareUrl || '主页标识未设置' }}</text>
        <text class="page-me__promo-copy">复制</text>
      </view>
      <view class="page-me__promo-btns">
        <view class="page-me__promo-gold pressable" @click="goBookingHome"><text>管理主页</text></view>
        <view class="page-me__promo-ghost pressable" @click="goPreview"><text>客户视角预览</text></view>
      </view>
    </view>

    <!-- 套餐与作品（y397 标题 + y422 白卡两行） -->
    <view class="page-me__sec">套餐与作品</view>
    <view class="page-me__card">
      <view class="info-row page-me__row pressable" @click="goPackages">
        <view class="page-me__row-icon"><AppIcon name="me-pkg" :size="18" /></view>
        <text class="page-me__row-label">套餐管理</text>
        <text class="page-me__row-value">4 个已上架</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row page-me__row--plain" @click="goWorks">
        <view class="page-me__row-icon"><AppIcon name="me-works" :size="17" /></view>
        <text class="page-me__row-label">作品集</text>
        <text class="page-me__row-value">86 张 · 12 精选</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 接单与收款（y554 标题 + y595 白卡） -->
    <view class="page-me__sec">接单与收款</view>
    <view class="page-me__card">
      <view class="info-row page-me__row">
        <!-- 稿内该行图标为齿轮（设置）；原误用 me-booking（内容实为箭头）已替换 -->
        <view class="page-me__row-icon page-me__row-icon--round"><AppIcon name="me-gear" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">接收新预约</text>
          <text class="page-me__row-sub">接单中 · 客户可在预约主页直接下单</text>
        </view>
        <view class="page-me__toggle page-me__toggle--on" @click="toggleAccept">
          <view class="page-me__toggle-knob" />
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row" @click="goPay">
        <view class="page-me__row-icon page-me__row-icon--round"><AppIcon name="me-wallet" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">收款设置</text>
          <text class="page-me__row-sub">银行卡 · 微信 · 支付宝</text>
        </view>
        <view class="page-me__badge-ok"><text>已设</text></view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 通用（y747 标题 + y778 白卡三行） -->
    <view class="page-me__sec">通用</view>
    <view class="page-me__card">
      <view class="info-row page-me__row" @click="goNotify">
        <view class="page-me__row-icon page-me__row-icon--round"><AppIcon name="me-bell" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">通知设置</text>
          <text class="page-me__row-sub">档期变更 / 订单动态 / 拍摄提醒</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row" @click="goAccount">
        <view class="page-me__row-icon page-me__row-icon--round page-me__row-icon--alt"><AppIcon name="me-shield" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">账号与安全</text>
          <text class="page-me__row-sub">手机号 · 登录设备</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row" @click="goHelp">
        <view class="page-me__row-icon page-me__row-icon--round page-me__row-icon--alt"><AppIcon name="me-help" :size="17" /></view>
        <text class="page-me__row-label">帮助与关于</text>
        <text class="page-me__row-ver">V2.0.0</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <AppTabBar active="me" />
    <view class="page-me__safe" />
  </view>
</template>

<script>
import { getStudioSettings } from '@/api/settings'

/**
 * ME01 我的（稿 1:5731 实测 1:1）
 * 资料卡 → 预约主页黑卡（金点+链接条+双钮 150/152x38）→ 套餐与作品两行 → 接单与收款（toggle #34C759 / 已设徽章）→ 通用三行。
 * 行图标均从画板导出（me-pkg/me-works/me-booking/me-wallet/me-bell/me-shield/me-help）。
 *
 * 预约主页链接由**服务端**下发（studio/get 的 homepage_url =
 * share.homepage_base_url + ?slug=xxx&staff_id=<我的账号id>），前端不拼域名；
 * 未设 slug 或服务端未配基址时为空串，链接条给兜底文案。
 * staff_id 即分享人：客户从这条链接进来下单，订单就归到我名下（biz_order.photographer_id），
 * 因此在员工端「我的订单」里能直接看到自己的客户单。
 */
export default {
  name: 'MeIndex',
  data() {
    return {
      /** 预约主页分享链接（服务端拼装，含 ?slug= 租户标识与 &staff_id= 分享人） */
      shareUrl: '',
    }
  },
  onShow() {
    // tab 页每次显示都刷新，保证在「个人资料」改完资料返回后链接即时更新；静默不弹 loading
    this.loadShareUrl()
  },
  methods: {
    async loadShareUrl() {
      try {
        const st = await getStudioSettings({ loading: false, silent: true })
        this.shareUrl = (st && st.homepage_url) || ''
      } catch {
        // 静默失败：保留原值，不打断页面
      }
    },
    goProfile() {
      uni.navigateTo({ url: '/pages/me/profile' })
    },
    goBookingHome() {
      uni.navigateTo({ url: '/pages/me/booking-home' })
    },
    goPreview() {
      uni.navigateTo({ url: '/pages/me/preview' })
    },
    goPackages() {
      uni.navigateTo({ url: '/pages/me/packages' })
    },
    goWorks() {
      uni.navigateTo({ url: '/pages/me/works' })
    },
    goPay() {
      uni.navigateTo({ url: '/pages/me/pay-settings' })
    },
    goNotify() {
      uni.navigateTo({ url: '/pages/me/notify-settings' })
    },
    goAccount() {
      uni.navigateTo({ url: '/pages/me/account' })
    },
    goHelp() {
      uni.navigateTo({ url: '/pages/me/help' })
    },
    copyLink() {
      if (!this.shareUrl) {
        uni.showToast({ title: '工作室尚未设置预约主页标识', icon: 'none' })
        return
      }
      // setClipboardData 在小程序端自带系统提示，无需再 toast
      uni.setClipboardData({ data: this.shareUrl })
    },
    toggleAccept() {
      uni.showToast({ title: '已切换接收新预约（演示）', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-me {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
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
    margin: 0 32rpx; /* 稿：资料卡左缘 x16 = 32rpx（横向扫描 x16–358） */
    padding: 30rpx 32rpx;
    background-color: $white;
    border-radius: 32rpx;
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
    text { font-size: 32rpx; color: #FFFFFF; }
  }
  &__profile-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
  &__name { font-size: 34rpx; font-weight: 500; color: #000000; }
  &__sub { font-size: 24rpx; color: #8E8E93; }

  &__promo {
    margin: 20rpx 32rpx 0;
    background-color: #161616;
    border-radius: 32rpx;
    padding: 32rpx;
  }
  &__promo-head { display: flex; align-items: center; gap: 16rpx; }
  &__promo-dot {
    box-sizing: border-box;
    width: 14rpx;
    height: 14rpx;
    border-radius: 4rpx;
    background-color: #FFD60A;
    flex-shrink: 0;
  }
  &__promo-title { font-size: 30rpx; font-weight: 500; color: #FFFFFF; }
  &__promo-hint { margin-left: auto; font-size: 22rpx; color: #8D8D93; }
  &__promo-desc { display: block; margin-top: 16rpx; font-size: 22rpx; color: #B9B9BF; }
  &__promo-link {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 24rpx;
    background-color: #272727;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
  }
  /* 链接为服务端下发的完整 URL（含协议与 ?slug=，域名可能较长）需截断显示；
   * min-width: 0 是 flex 子项能收缩到小于内容宽度的前提，缺它 ellipsis 不生效 */
  &__promo-url {
    flex: 1;
    min-width: 0;
    font-size: 24rpx;
    color: #C9C9CF;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__promo-copy { font-size: 22rpx; font-weight: 500; color: #FFD60A; flex-shrink: 0; }
  &__promo-btns { display: flex; gap: 16rpx; margin-top: 32rpx; }
  &__promo-gold {
    box-sizing: border-box;
    width: 300rpx;
    height: 76rpx;
    border-radius: 999rpx;
    background-color: #FFD60A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 26rpx; font-weight: 500; color: #161616; }
  }
  &__promo-ghost {
    box-sizing: border-box;
    flex: 1;
    height: 76rpx;
    border-radius: 999rpx;
    border: 2rpx solid #3D3D3D;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 26rpx; color: #FFFFFF; }
  }

  &__sec {
    margin: 40rpx 36rpx 0; /* 稿：promo 底 376 → 标题 397（上 20px） */
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：标题墨迹 411 → 卡片 422（下 12px） */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    &--plain { background-color: $white; }
  }
  &__row-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 16rpx;
    background-color: #F3F3F5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--round { border-radius: 50%; }
    &--alt { background-color: #F1F1F3; }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 28rpx; color: #1A1A1A; }
  &__row-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__row-value { margin-left: auto; font-size: 22rpx; color: #666666; flex-shrink: 0; }
  &__row-ver { margin-left: auto; font-size: 24rpx; color: #666666; flex-shrink: 0; }

  &__toggle {
    box-sizing: border-box;
    width: 92rpx;
    height: 54rpx;
    border-radius: 999rpx;
    background-color: #D9D9D9;
    padding: 6rpx;
    flex-shrink: 0;
    &--on { background-color: #34C759; display: flex; justify-content: flex-end; }
  }
  &__toggle-knob { width: 42rpx; height: 42rpx; border-radius: 50%; background-color: #FFFFFF; }

  &__badge-ok {
    box-sizing: border-box;
    background-color: #DFF5E9;
    border-radius: 999rpx;
    padding: 8rpx 20rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #00A860; }
  }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
