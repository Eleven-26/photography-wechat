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
          <text class="page-df__hero-badge-txt">V{{ retouchVersion }} 预览版</text>
        </view>
        <text class="page-df__hero-count">{{ photoCount }} 张</text>
      </view>
      <view class="page-df__grid">
        <view v-for="p in photos" :key="p.id" class="page-df__pic">
          <image class="page-df__pic-img" :src="p.url" mode="aspectFill" />
        </view>
        <view v-if="!photos.length" class="page-df__empty">
          <text class="page-df__empty-txt">暂无精修成品</text>
        </view>
      </view>
    </view>

    <!-- 精修成品卡 -->
    <view class="page-df__label">精修成品</view>
    <view class="page-df__card page-df__card--row">
      <view class="page-df__up">
        <text class="page-df__up-title">{{ retouchText }}</text>
        <text class="page-df__up-sub">精修图完成后上传 · 高清下载以此为准</text>
      </view>
      <view class="page-df__badge-green" :class="{ 'page-df__badge-green--off': !photoCount }">
        <text class="page-df__badge-green-txt">{{ photoCount ? '已上传' : '待上传' }}</text>
      </view>
    </view>

    <!-- 交付检查卡：预览水印 / 文件校验 两行 -->
    <view class="page-df__label">交付检查</view>
    <view class="page-df__card page-df__card--list">
      <view class="page-df__check-row page-df__check-row--line">
        <AppIcon name="check-green-sm" :size="16" />
        <text class="page-df__check-title">预览水印</text>
        <view class="page-df__badge-green" :class="{ 'page-df__badge-green--off': !checks.watermark.ok }">
          <text class="page-df__badge-green-txt">{{ checks.watermark.text }}</text>
        </view>
      </view>
      <view class="page-df__check-row">
        <AppIcon name="check-green-sm" :size="16" />
        <text class="page-df__check-title">文件校验</text>
        <view class="page-df__badge-green" :class="{ 'page-df__badge-green--off': !checks.files.ok }">
          <text class="page-df__badge-green-txt">{{ checks.files.text }}</text>
        </view>
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
/**
 * D11 最终成片（稿 1:3468 实测）：黑 Hero 九宫格 + 精修成品 + 交付检查 + 高清下载说明 + 单钮。
 *
 * 数据源（2026-09-14 接线；:id = **order_id**）：
 *   /delivery/detail/:id → 交付单（retouch_version 精修轮次 / retouch_target 计划张数 /
 *     sample_count 样片数 / stage 阶段）
 *   /delivery/items/:id  → 交付明细，取 kind=3（精修成品）作九宫格与计数
 * 底部按钮「发送最终确认」→ POST /delivery/send-final/:id（**:id = 交付单 ID**，非订单 ID）。
 * 后端要求 stage=4（待确认交付），否则 400 —— 即：没有成品就不能发确认。
 *
 * ⚠️ 交付检查两项均为**服务端事实推导**，不是常量：
 *    预览水印 ← 样片是否已上传（sample_count>0）；文件校验 ← 精修成品是否已落库。
 */
import { getDeliveryDetail, getDeliveryItems, sendFinal } from '@/api/delivery'

/** DeliveryItem.kind：1-样片 2-已选 3-精修成品 */
const KIND_RETOUCHED = 3
/** 九宫格最多展示 9 张 */
const GRID_MAX = 9

export default {
  data() {
    return {
      orderId: '',
      delivery: null,
      items: [],
      submitting: false,
    }
  },
  computed: {
    retouched() {
      return this.items.filter((it) => it.kind === KIND_RETOUCHED)
    },
    photoCount() {
      return this.retouched.length
    },
    photos() {
      return this.retouched.slice(0, GRID_MAX)
    },
    retouchVersion() {
      return (this.delivery && this.delivery.retouch_version) || 1
    },
    retouchText() {
      const target = (this.delivery && this.delivery.retouch_target) || this.photoCount
      return `已上传 ${this.photoCount} / ${target} 张`
    },
    checks() {
      const samples = Number((this.delivery && this.delivery.sample_count) || 0)
      return {
        watermark: samples > 0 ? { ok: true, text: '通过' } : { ok: false, text: '待上传样片' },
        files: this.photoCount > 0 ? { ok: true, text: '通过' } : { ok: false, text: '待上传成品' },
      }
    },
  },
  onLoad(options) {
    this.orderId = (options && options.id) || ''
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      if (!this.orderId) return
      const [dRes, iRes] = await Promise.all([
        getDeliveryDetail(this.orderId).catch(() => null),
        getDeliveryItems(this.orderId).catch(() => null),
      ])
      this.delivery = dRes || null
      this.items = Array.isArray(iRes) ? iRes : []
    },
    goBack() {
      uni.navigateBack()
    },
    async onConfirm() {
      if (this.submitting) return
      const d = this.delivery
      if (!d || !d.id) return uni.showToast({ title: '交付单尚未创建', icon: 'none' })
      if (!this.photoCount) return uni.showToast({ title: '请先上传精修成品', icon: 'none' })
      this.submitting = true
      const ok = await sendFinal(d.id).then(() => true).catch(() => false)
      this.submitting = false
      if (!ok) return
      uni.showToast({ title: '已发送最终确认', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 900)
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
  &__pic-img {
    width: 100%;
    height: 100%;
  }
  &__empty {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
  }
  &__empty-txt {
    color: rgba(255, 255, 255, 0.5);
    font-size: 26rpx;
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
  /* 未达成（灰色）—— 交付检查项未通过时用 */
  &__badge-green--off {
    background-color: #EDEEF0;
  }
  &__badge-green--off .page-df__badge-green-txt {
    color: #8E8E93;
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
