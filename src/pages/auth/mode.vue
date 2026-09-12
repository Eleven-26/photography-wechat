<template>
  <view class="page-mode page-wrap">
    <view class="status-bar" />
    <!-- Header：返回 + 「选择模式」居中（1:8289 实测） -->
    <view class="page-mode__header">
      <view class="page-mode__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-mode__title">选择模式</text>
    </view>

    <view class="page-mode__body">
      <text class="page-mode__step">第二步：你主要做什么？</text>

      <!-- 三张模式卡：选中白底金描边（1:8299 实测 r16 pad18 gap8），余白底 -->
      <view
        v-for="m in modes"
        :key="m.key"
        class="page-mode__card pressable"
        :class="{ 'page-mode__card--on': form.mode === m.key }"
        @click="form.mode = m.key"
      >
        <view class="page-mode__row">
          <AppIcon :name="m.icon" :size="20" />
          <text class="page-mode__name">{{ m.label }}</text>
          <AppIcon v-if="form.mode === m.key" name="check-chevron-dark" :size="20" />
        </view>
        <text class="page-mode__sub">{{ m.sub }}</text>
      </view>

      <view class="page-mode__spacer" />
      <!-- 进入工作台黑胶囊（1:8329 实测） -->
      <view class="page-mode__btn pressable" @click="enter">
        <text>进入工作台</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * A04 选择工作模式（稿 1:8287 实测 1:1）
 * 第二步引导：摄影服务（选中金描边）/ 摄像服务 / 后期修图 → 进入工作台。
 */
export default {
  name: 'AuthMode',
  data() {
    return {
      form: { mode: 'photo' },
      modes: [
        { key: 'photo', label: '摄影服务', sub: '人像 · 家庭 · 商务 · 婚礼等', icon: 'camera-dark' },
        { key: 'video', label: '摄像服务', sub: '商业视频 · 短片 · 活动记录', icon: 'video-dark' },
        { key: 'retouch', label: '后期修图', sub: '独立修图师 · 不接单只做后期', icon: 'retouch-dark' },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/auth/workspace' }) })
    },
    enter() {
      uni.reLaunch({ url: '/pages/work/index' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-mode {
  min-height: 100vh;
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
  }
  &__back {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.88);
    border: 1rpx solid rgba(21, 22, 24, 0.05);
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
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

  &__body { padding: 12rpx 32rpx 68rpx; }
  &__step {
    display: block;
    font-size: 52rpx;
    line-height: 68rpx;
    font-weight: 700;
    color: #151617;
    padding: 36rpx 0 56rpx; /* 稿：标题字形 ~130、首卡 @194 */
  }
  &__card {
    box-sizing: border-box;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    box-shadow: 0 14rpx 44rpx rgba(21, 22, 24, 0.067);
    padding: 34rpx; /* 稿：卡高 ~89 */
    margin-bottom: 28rpx; /* 稿：卡距 ~14（pitch 104） */
    &--on { border: 2rpx solid #FFDA08; }
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }
  &__name {
    flex: 1;
    font-size: 32rpx;
    font-weight: 700;
    color: #151617;
  }
  &__sub {
    display: block;
    margin-top: 16rpx;
    font-size: 26rpx;
    color: #747881;
    padding-left: 44rpx;
  }

  &__spacer { height: 186rpx; } /* 稿：进入工作台 @596（末卡 margin14 + 93） */
  &__btn {
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #17181A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }
}
</style>
