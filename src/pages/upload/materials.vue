<template>
  <!-- D07 上传素材（1:7639）一比一还原：进度环卡 + 文件列表卡 + 双钮底栏 -->
  <view class="page-um">
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0) -->
    <view class="status-bar" />
    <view class="page-um__header">
      <view class="page-um__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-um__title">
        <text class="page-um__title-text">上传素材</text>
      </view>
    </view>

    <view class="page-um__body">
      <!-- 进度卡：白 r16 pad26，120 圆环位 + 计数 + 进度条 -->
      <view class="page-um__section">
        <view class="page-um__ring">
          <view class="page-um__ring-num">
            <text class="page-um__pct">{{ progress }}</text>
            <text class="page-um__pct-sign">%</text>
          </view>
          <text class="page-um__ring-label">上传中</text>
        </view>
        <view class="page-um__count">
          <text class="page-um__count-num">{{ done }} / {{ total }} 张</text>
        </view>
        <text class="page-um__caption">已自动压缩为预览图 · 支持断点续传</text>
        <view class="page-um__track">
          <view class="page-um__track-fill" :style="{ width: progress + '%' }" />
        </view>
        <!-- 文件列表：白底 r20 描边 9%，行 pad16/13.3 + hairline -->
        <view class="page-um__list">
          <view v-for="(f, i) in files" :key="f.name" class="page-um__row" :class="{ 'page-um__row--last': i === files.length - 1 }">
            <AppIcon :name="f.done ? 'check-green-sm' : 'upload-amber'" :size="16" />
            <view class="page-um__row-txt">
              <text class="page-um__row-name">{{ f.name }}</text>
              <text class="page-um__row-status">{{ f.status }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部双钮：稿 y640，ghost 白描边 + solid 黑胶囊，h52 -->
    <view class="page-um__footer">
      <view class="footer-safe" />
      <view class="page-um__footer-row">
        <view class="page-um__btn page-um__btn--ghost" @click="togglePause">
          <text class="page-um__btn-ghost-txt">{{ paused ? '继续上传' : '暂停上传' }}</text>
        </view>
        <view class="page-um__btn page-um__btn--solid" @click="goSelect">
          <text class="page-um__btn-solid-txt">进入选片</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { demoOrderById } from '@/utils/demo'

export default {
  data() {
    return {
      total: 152,
      done: 148,
      paused: false,
      timer: null,
      files: [
        { name: 'IMG_0142.jpg', status: '已完成 · 1.8MB', done: true },
        { name: 'IMG_0143.jpg', status: '已完成 · 1.6MB', done: true },
        { name: 'IMG_0144.jpg', status: '上传中 · 64%', done: false },
      ],
    }
  },
  computed: {
    // 稿内进度环 97%、进度条 282/311≈90.6%，演示统一用 done/total
    progress() {
      return Math.min(99, Math.round((this.done / this.total) * 100))
    },
  },
  onLoad(options) {
    // 演示模式：订单信息仅用于上下文（联调后走 getOrderDetail）
    this.orderId = (options && options.id) || ''
    this.order = demoOrderById(this.orderId) || null
  },
  onUnload() {
    if (this.timer) clearTimeout(this.timer)
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goSelect() {
      uni.navigateTo({ url: '/pages/select/result?id=' + (this.orderId || '90004') })
    },
    // 演示态：暂停/继续只切文案（联调后接上传任务接口）
    togglePause() {
      this.paused = !this.paused
      uni.showToast({ title: this.paused ? '已暂停' : '继续上传', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-um {
  min-height: 100vh;
  background-color: $bg-page;

  &__header {
    position: relative; /* 标题绝对居中（全站规范） */
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box; /* 稿 60 高，按钮/标题垂直居中 */
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
  }
  &__title-text {
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  &__body {
    padding: 10rpx $page-pad 0; /* 稿容器 y114，上内距 10 */
  }
  &__section {
    background-color: $white;
    border-radius: 32rpx; /* 稿 r16 */
    padding: 52rpx; /* 稿 pad 26 */
  }
  &__ring {
    width: 240rpx; /* 稿 120 */
    height: 240rpx;
    border-radius: 50%;
    background-color: $white;
    border: 1rpx solid #E1E1E1; /* 实测 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rpx;
  }
  &__ring-num {
    display: flex;
    align-items: baseline;
  }
  &__pct {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__pct-sign {
    color: $text-1;
    font-size: 32rpx;
    font-weight: 700;
  }
  &__ring-label {
    color: $text-2;
    font-size: 30rpx;
  }
  &__count {
    margin-top: 32rpx; /* 稿 Margin top16 + 文字 1/3 */
  }
  &__count-num {
    color: $text-1;
    font-size: 32rpx;
    font-weight: 700;
  }
  &__caption {
    display: block;
    margin-top: 2rpx;
    color: $text-2;
    font-size: 26rpx;
    line-height: 40rpx;
  }
  &__track {
    margin-top: 48rpx; /* 稿 Margin 24 */
    height: 16rpx; /* 稿 8 */
    border-radius: 8rpx;
    background-color: #E8E8E3; /* 实测 */
    overflow: hidden;
  }
  &__track-fill {
    height: 100%;
    background-color: #171717; /* 实测 */
    border-radius: 8rpx;
  }
  &__list {
    margin-top: 48rpx; /* 稿 Margin 24 */
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 40rpx; /* 稿 r20 */
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 20rpx; /* 稿 g10 */
    padding: 27rpx 32rpx; /* 稿 13.3 */
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__row--last {
    border-bottom: none;
  }
  &__row-txt {
    display: flex;
    flex-direction: column;
    gap: 2rpx; /* 稿 g1 */
  }
  &__row-name {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__row-status {
    color: $text-2;
    font-size: 24rpx;
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
    gap: 20rpx; /* 稿 g10 */
    padding: 20rpx 32rpx 28rpx; /* 稿 pad 16/16/10/14 */
  }
  &__btn {
    flex: 1;
    height: 104rpx; /* 摄影师端按钮统一 52 */
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
    background-color: #171819; /* 实测黑胶囊 */
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
