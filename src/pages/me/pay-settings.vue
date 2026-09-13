<template>
  <view class="page-ps page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「收款设置」（稿 1:6425 实测，画板名误标「接单设置」） -->
    <view class="page-ps__header">
      <view class="page-ps__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-ps__title">收款设置</text>
    </view>

    <!-- 灰提示条 y114 #E6E7EB r12：资金不经平台说明 -->
    <view class="page-ps__note">
      <AppIcon name="info-gray-sm" :size="14" />
      <text>资金不经平台。客户在客户端站点下单后按以下方式线下转账，你在订单中确认到账（登记）。</text>
    </view>

    <!-- 银行卡（y178 标题行 + 已启用徽章 + y233 三行） -->
    <view class="page-ps__sec-row">
      <text class="page-ps__sec">银行卡</text>
      <view class="page-ps__badge"><text>已启用</text></view>
    </view>
    <view class="page-ps__card">
      <!-- 稿实测：三行右侧**均带** chevron 箭头（原仅「户名」行有，缺两个） -->
      <view class="info-row page-ps__row pressable" @click="edit('开户行')">
        <text class="page-ps__label">开户行</text>
        <text class="page-ps__value">招商银行 广州分行</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-ps__row pressable" @click="edit('卡号')">
        <text class="page-ps__label">卡号</text>
        <text class="page-ps__value">6217 8301 **** 2874</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-ps__row pressable" @click="edit('户名')">
        <text class="page-ps__label">户名</text>
        <text class="page-ps__value">路明</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 微信收款码（y398 标题行 + 已启用 + y453 二维码卡） -->
    <view class="page-ps__sec-row">
      <text class="page-ps__sec">微信收款码</text>
      <view class="page-ps__badge"><text>已启用</text></view>
    </view>
    <view class="page-ps__card page-ps__card--qr">
      <!-- 稿：纵向布局——二维码图在上（居中）、提示文案在下（居中）；原为横向排布 + 深色格子占位块 -->
      <image class="page-ps__qr-img pressable" src="/static/img/qr-pay.png" mode="aspectFit" @click="changeQr('微信')" />
      <text class="page-ps__qr-hint">点击更换 · 客户扫码转账后无需凭证，你确认到账</text>
    </view>

    <!-- 支付宝收款码（y670 标题行 + 已启用 + y725 二维码卡） -->
    <view class="page-ps__sec-row">
      <text class="page-ps__sec">支付宝收款码</text>
      <view class="page-ps__badge"><text>已启用</text></view>
    </view>
    <view class="page-ps__card page-ps__card--qr">
      <!-- 稿：纵向布局（同上），支付宝与微信共用同一张二维码示例图 -->
      <image class="page-ps__qr-img pressable" src="/static/img/qr-pay.png" mode="aspectFit" @click="changeQr('支付宝')" />
      <text class="page-ps__qr-hint">点击更换 · 客户扫码转账后无需凭证，你确认到账</text>
    </view>

    <!-- 确认规则灰条 y942 -->
    <view class="page-ps__note page-ps__note--mt">
      <text>确认规则：微信 / 支付宝转账无需上传凭证，你确认到账后在订单里点确认；银行卡转账由客户上传凭证，系统识别金额与流水供你比对。</text>
    </view>
    <view class="page-ps__safe" />
  </view>
</template>

<script>
/**
 * ME09-2 收款设置（稿 1:6425 实测 1:1）
 * 资金不经平台灰条 → 银行卡三行（开户行/卡号/户名）→ 微信收款码（159 方码 + 更换提示）→ 支付宝收款码 → 确认规则灰条。
 * 二维码稿内为实图（image 12），演示用占位块，联调换图。
 */
export default {
  name: 'MePaySettings',
  methods: {
    goBack() {
      uni.navigateBack()
    },
    edit(label) {
      uni.showToast({ title: `编辑${label}（演示）`, icon: 'none' })
    },
    changeQr(name) {
      uni.showToast({ title: `更换${name}收款码（演示）`, icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ps {
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

  &__note {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    box-sizing: border-box;
    margin: 20rpx 32rpx 0; /* 稿：note @114 */
    background-color: #E6E7EB;
    border-radius: 24rpx;
    padding: 30rpx 24rpx; /* 稿：高 64（两行文字 34） */
    text { font-size: 24rpx; line-height: 34rpx; color: #6D6D72; }
    &--mt { margin-top: 28rpx; } /* 稿：支付宝码卡底 942 → 确认规则灰条（padding-top 14px） */
  }

  &__sec { font-size: 30rpx; line-height: 46rpx; font-weight: 500; color: #1A1A1A; } /* line-height 对齐稿的 23px 标题行高 */
  /* 稿：标题行容器紧接上一元素（无外间距），间距做在容器内（上 20px / 下 9px）——
     用内边距而非外边距，否则每处都会多出一个 20px，三处累积成 48px 偏差 */
  &__sec-row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 0 36rpx;
    padding: 40rpx 0 18rpx;
  }
  &__badge {
    box-sizing: border-box;
    background-color: #DFF5E9;
    border-radius: 999rpx;
    padding: 6rpx 20rpx;
    text { font-size: 24rpx; color: #00A860; }
  }

  &__card {
    margin: 6rpx 32rpx 0; /* 稿：标题行底 230 → 卡 233（3px）；原 28rpx 偏大 */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
    /* 稿 1:6490 实测：纵向布局——二维码图在上、提示文案在下，两者水平居中
       卡高 217 = 上下 16×2 + 码图 159 + 间距 10 + 文案 16 */
    &--qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20rpx;        /* 稿：码图与提示文案间距 10px */
      box-sizing: border-box;
      margin-top: 6rpx; /* 稿：标题行底 → 码卡 453（3px，与银行卡卡一致） */
      padding: 32rpx;
    }
  }
  &__row { gap: 16rpx; min-height: 110rpx; } /* 稿：银行卡每行 55px（16+23+16）；原用 info-row 全局 64px 偏高 */
  &__label { font-size: 28rpx; color: #86868B; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* 稿：卡内为真实二维码图（Ardot 导出 qr-pay.png，159px）；原为深色格子占位块 */
  &__qr-img {
    display: block;
    width: 318rpx;   /* 159px */
    height: 318rpx;
    flex-shrink: 0;
  }
  &__qr-hint {
    font-size: 24rpx;
    line-height: 34rpx;
    color: #8E8E93;
    text-align: center;   /* 稿：文案水平居中 */
  }

  &__safe { height: 60rpx; }
}
</style>
