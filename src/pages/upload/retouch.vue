<template>
  <!-- D16 精修上传（1:3385）一比一还原：进度卡 + 上传方式双卡 + 灰提示条 + 双钮 -->
  <view class="page-ur">
    <view class="status-bar" />
    <view class="page-ur__header">
      <view class="page-ur__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-ur__title">
        <text class="page-ur__title-text">精修图上传</text>
      </view>
    </view>

    <view class="page-ur__body">
      <!-- 上传进度卡：白 r16 pad26 -->
      <view class="page-ur__section">
        <view class="page-ur__sec-head">
          <text class="page-ur__sec-title">上传进度</text>
          <text class="page-ur__sec-count">{{ done }} / {{ total }} 张</text>
        </view>
        <view class="page-ur__list">
          <view v-for="(f, i) in files" :key="f.name" class="page-ur__row" :class="{ 'page-ur__row--line': i < files.length - 1 }">
            <AppIcon :name="f.done ? 'check-green-sm' : 'upload-amber'" :size="16" />
            <view class="page-ur__row-txt">
              <text class="page-ur__row-name">{{ f.name }}</text>
              <text class="page-ur__row-status">{{ f.status }}</text>
            </view>
          </view>
          <!-- 继续添加行：灰加号 + 标题（稿 pad16/22.5） -->
          <view class="page-ur__row page-ur__row--add" @click="onAdd">
            <AppIcon name="plus-gray" :size="16" />
            <text class="page-ur__add-txt">继续添加精修成品</text>
          </view>
        </view>
        <!-- 原型演示钮：补齐剩余成品（稿自带此演示钮） -->
        <view class="page-ur__demo-btn" @click="fillRest">
          <text class="page-ur__demo-btn-txt">原型演示：补齐剩余 {{ total - done }} 张成品</text>
        </view>
        <view class="page-ur__tip">
          <text class="page-ur__tip-txt">精修成品建议以 JPEG 高质量导出（8-15MB）· 支持断点续传 · PC 端可整场批量上传</text>
        </view>
      </view>

      <!-- 上传方式：双卡并排（第二卡选中态黑描边） -->
      <view class="page-ur__sec-head page-ur__sec-head--gap">
        <text class="page-ur__sec-title">上传方式</text>
      </view>
      <view class="page-ur__ways">
        <view class="page-ur__way" @click="pickAlbum">
          <AppIcon name="phone-gray" :size="20" />
          <text class="page-ur__way-label page-ur__way-label--sub">手机上传</text>
          <text class="page-ur__way-main page-ur__way-main--sub">从相册选择精修图</text>
        </view>
        <view class="page-ur__way page-ur__way--active" @click="pickPc">
          <AppIcon name="pc-dark" :size="20" />
          <text class="page-ur__way-label">PC 端上传</text>
          <text class="page-ur__way-main">推荐 · 支持批量</text>
        </view>
      </view>

      <!-- 灰提示条：#E6E7EB r14 -->
      <view class="page-ur__notice">
        <AppIcon name="info-dark" :size="20" />
        <text class="page-ur__notice-txt">客户的高清下载以精修成品为准 · 全部上传且尾款核验通过后开放</text>
      </view>
    </view>

    <!-- 底部双钮：暂存 + 完成并发送最终确认 -->
    <view class="page-ur__footer">
      <view class="footer-safe" />
      <view class="page-ur__footer-row">
        <view class="page-ur__btn page-ur__btn--ghost" @click="onSave">
          <text class="page-ur__btn-ghost-txt">暂存</text>
        </view>
        <view class="page-ur__btn page-ur__btn--solid" @click="onFinish">
          <text class="page-ur__btn-solid-txt">完成并发送最终确认</text>
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
      orderId: '',
      total: 24,
      done: 20,
      files: [
        { name: 'IMG_0142_final.jpg', status: '已上传 · 14.2MB', done: true },
        { name: 'IMG_0143_final.jpg', status: '上传中 · 62%', done: false },
      ],
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
    onAdd() {
      uni.showToast({ title: '选择精修图（演示）', icon: 'none' }) // 联调后接上传
    },
    // 原型演示：把剩余张数补齐为已上传
    fillRest() {
      this.done = this.total
      this.files = [{ name: 'IMG_0142_final.jpg', status: '已上传 · 14.2MB', done: true }]
      uni.showToast({ title: '已补齐 24/24（演示）', icon: 'none' })
    },
    pickAlbum() {
      uni.showToast({ title: '从相册选择（演示）', icon: 'none' })
    },
    pickPc() {
      uni.showToast({ title: '请在 PC 端打开上传', icon: 'none' })
    },
    onSave() {
      uni.showToast({ title: '已暂存（演示）', icon: 'none' })
    },
    onFinish() {
      uni.navigateTo({ url: '/pages/delivery/final?id=' + (this.orderId || '90004') })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ur {
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

  &__body {
    padding: 16rpx $page-pad 0; /* 稿容器 y114 上距 8，卡间 g20 */
  }
  &__section {
    background-color: $white;
    border-radius: 32rpx;
    padding: 52rpx; /* 稿 26 */
  }
  &__sec-head {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    margin-bottom: 20rpx; /* 稿 p 0/10 */
  }
  &__sec-head--gap {
    margin: 40rpx $page-pad 20rpx; /* 独立 label 行 */
  }
  &__sec-title {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__sec-count {
    color: #9CA3AF; /* 实测 */
    font-size: 24rpx;
    font-weight: 700;
  }
  &__list {
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 32rpx; /* 稿 r16 */
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 27rpx 32rpx; /* 稿 13.3 */
  }
  &__row--line {
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__row--add {
    padding: 45rpx 32rpx; /* 稿 22.5 */
  }
  &__row-txt {
    display: flex;
    flex-direction: column;
    gap: 2rpx;
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
  &__add-txt {
    color: $text-2;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__demo-btn {
    margin-top: 24rpx; /* 稿 12 */
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 999rpx;
  }
  &__demo-btn-txt {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__tip {
    margin-top: 24rpx;
    background-color: #FAFAF8; /* 实测 */
    border-radius: 20rpx; /* 稿 r10 */
    padding: 20rpx 28rpx; /* 稿 10/14 */
  }
  &__tip-txt {
    color: $text-2;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  &__ways {
    display: flex;
    gap: 16rpx; /* 稿 g8 */
    margin: 0 $page-pad;
  }
  &__way {
    flex: 1;
    background-color: $white;
    border: 1rpx solid transparent;
    border-radius: 28rpx; /* 稿 r14 */
    padding: 28rpx; /* 稿 14 */
    display: flex;
    flex-direction: column;
  }
  &__way--active {
    border-color: #171717; /* 稿选中态黑描边 */
  }
  &__way-label {
    color: $text-1;
    font-size: 26rpx;
    font-weight: 700;
    margin-top: 2rpx;
  }
  &__way-label--sub {
    color: $text-2;
    font-weight: 400;
  }
  &__way-main {
    color: $text-1;
    font-size: 30rpx;
    margin-top: 2rpx;
  }
  &__way-main--sub {
    color: $text-2;
    font-weight: 400;
  }

  &__notice {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin: 20rpx $page-pad 0;
    background-color: #E6E7EB; /* 实测 */
    border-radius: 28rpx;
    padding: 24rpx 32rpx; /* 稿 12/16 */
  }
  &__notice-txt {
    color: #171717;
    font-size: 24rpx;
    line-height: 38rpx;
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
