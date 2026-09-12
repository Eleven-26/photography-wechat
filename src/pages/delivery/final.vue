<template>
  <!-- D11 最终成片（1:3468）一比一还原：黑 Hero 九宫格 + 精修成品 + 交付检查 + 高清下载说明 + 单钮 -->
  <view class="page-df">
    <view class="status-bar" />
    <view class="page-df__header">
      <view class="page-df__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-df__title">
        <text class="page-df__title-text">最终成片</text>
      </view>
    </view>

    <!-- 黑 Hero 卡 343x383 r16 pad20：徽章行 + 3x3 图格（95.7 方格 r16 gap8） -->
    <view class="page-df__hero">
      <view class="page-df__hero-top">
        <view class="page-df__hero-badge">
          <text class="page-df__hero-badge-txt">V2 预览版</text>
        </view>
        <text class="page-df__hero-count">{{ photoCount }} 张</text>
      </view>
      <view class="page-df__grid">
        <view v-for="(p, i) in photos" :key="i" class="page-df__pic">
          <!-- 原型占位：稿内为真实样片填充，接入后换 image 组件 -->
          <view class="page-df__pic-ph" :style="{ background: phColor(i) }" />
        </view>
      </view>
    </view>

    <!-- 精修成品卡 -->
    <view class="page-df__label">精修成品</view>
    <view class="page-df__card page-df__card--row">
      <view class="page-df__up">
        <text class="page-df__up-title">已重新上传 24 / 24 张</text>
        <text class="page-df__up-sub">精修图完成后上传 · 高清下载以此为准</text>
      </view>
      <view class="page-df__badge-green"><text class="page-df__badge-green-txt">已上传</text></view>
    </view>

    <!-- 交付检查卡：预览水印 / 文件校验 两行 -->
    <view class="page-df__label">交付检查</view>
    <view class="page-df__card page-df__card--list">
      <view class="page-df__check-row page-df__check-row--line">
        <AppIcon name="check-green-sm" :size="16" />
        <text class="page-df__check-title">预览水印</text>
        <view class="page-df__badge-green"><text class="page-df__badge-green-txt">通过</text></view>
      </view>
      <view class="page-df__check-row">
        <AppIcon name="check-green-sm" :size="16" />
        <text class="page-df__check-title">文件校验</text>
        <view class="page-df__badge-green"><text class="page-df__badge-green-txt">通过</text></view>
      </view>
    </view>

    <!-- 高清下载说明卡 343x72 -->
    <view class="page-df__dl">
      <view class="page-df__dl-top">
        <text class="page-df__dl-title">高清下载</text>
        <view class="page-df__badge-green page-df__badge-green--sm">
          <text class="page-df__badge-green-txt">尾款确认后</text>
        </view>
      </view>
      <text class="page-df__dl-sub">成品上传完 + 客户付尾款后自动开放，下载窗口 30 天</text>
    </view>

    <!-- 底部单黑钮：发送最终确认（稿 y904） -->
    <view class="page-df__footer">
      <view class="footer-safe" />
      <view class="page-df__btn" @click="onConfirm">
        <text class="page-df__btn-txt">发送最终确认</text>
      </view>
    </view>
  </view>
</template>

<script>
import { demoOrderById } from '@/utils/demo'

export default {
  data() {
    return {
      orderId: '',
      photoCount: 24, // 稿内徽章文案「24 张」
      photos: new Array(9).fill(0), // 稿 3x3 九宫格（展示占位，接入后为真实缩略图列表）
      palette: ['#D8D5D0', '#C9CDC9', '#D6CFC4', '#CFD3D8', '#D9D2C6', '#C8CCC8', '#D5D0CA', '#CCC9C4', '#D0D4CE'],
    }
  },
  onLoad(options) {
    this.orderId = (options && options.id) || ''
    this.order = demoOrderById(this.orderId) || null
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    phColor(i) {
      return this.palette[i % this.palette.length]
    },
    onConfirm() {
      // 联调后接「发送最终确认」接口，此处演示提示
      uni.showToast({ title: '已发送最终确认（演示）', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-df {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 200rpx;

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
    margin: 8rpx $page-pad 0; /* 稿 y112 */
    background-color: #171819; /* 实测 */
    border-radius: 32rpx;
    padding: 40rpx; /* 稿 20 */
  }
  &__hero-top {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx; /* 稿 g12 */
  }
  &__hero-badge {
    background-color: #333333; /* 实测 */
    border-radius: 999rpx;
    padding: 6rpx 18rpx;
  }
  &__hero-badge-txt {
    color: #F6A41A; /* 实测 */
    font-size: 22rpx;
    font-weight: 500;
  }
  &__hero-count {
    color: $white;
    font-size: 24rpx;
  }
  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx; /* 稿 g8 */
  }
  &__pic {
    width: calc((100% - 32rpx) / 3); /* 稿 95.67 方格 3 列 */
    height: 192rpx; /* 96px */
    border-radius: 32rpx; /* 稿 r16 */
    overflow: hidden;
  }
  &__pic-ph {
    width: 100%;
    height: 100%;
  }

  &__label {
    margin: 40rpx $page-pad 20rpx;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 40rpx;
  }
  &__card {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 32rpx;
  }
  &__card--row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 28rpx 32rpx; /* 稿 14/16 */
  }
  &__up {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  &__up-title {
    color: $text-1;
    font-size: 28rpx;
    font-weight: 700;
  }
  &__up-sub {
    color: $text-2;
    font-size: 24rpx;
    margin-top: 2rpx;
  }
  &__card--list {
    overflow: hidden;
  }
  &__check-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 39rpx 32rpx; /* 稿 19.5 */
  }
  &__check-row--line {
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__check-title {
    flex: 1;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__badge-green {
    background-color: $badge-green-bg;
    border-radius: 999rpx;
    padding: 6rpx 18rpx;
  }
  &__badge-green--sm {
    padding: 4rpx 14rpx;
  }
  &__badge-green-txt {
    color: $badge-green-text;
    font-size: 22rpx;
    font-weight: 500;
  }

  &__dl {
    margin: 20rpx $page-pad 0; /* 稿 y812 与检查卡间 20 */
    background-color: $white;
    border-radius: 32rpx;
    padding: 26rpx 32rpx; /* 高 72 */
  }
  &__dl-top {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__dl-title {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__dl-sub {
    display: block;
    color: $text-2;
    font-size: 24rpx;
    font-weight: 500;
    margin-top: 10rpx; /* 稿 829→858 */
  }

  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $bg-page;
  }
  &__btn {
    margin: 20rpx 32rpx 28rpx;
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #171819;
    border-radius: 999rpx;
  }
  &__btn-txt {
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
  }
}
</style>
