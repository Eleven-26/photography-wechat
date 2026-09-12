<template>
  <view class="page-space page-wrap">
    <view class="status-bar" />
    <!-- Header：返回 + 「创建工作空间」居中（1:8249 实测） -->
    <view class="page-space__header">
      <view class="page-space__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-space__title">创建工作空间</text>
    </view>

    <view class="page-space__body">
      <text class="page-space__step">第一步：创建你的工作空间</text>

      <!-- 名称输入卡：白 r16 描边 9% +阴影（1:8259 实测 pad16/12） -->
      <view class="page-space__card">
        <text class="page-space__label">工作空间名称</text>
        <input v-model="form.name" class="page-space__input" placeholder="如：路先生摄影工作室" placeholder-class="page-space__ph" />
      </view>

      <text class="page-space__type-title">空间类型</text>
      <!-- 两卡横排 gap12：选中黑底白字 / 未选白底（1:8268/1:8275 实测 r16 pad18） -->
      <view class="page-space__types">
        <view
          v-for="t in types"
          :key="t.key"
          class="page-space__type pressable"
          :class="{ 'page-space__type--on': form.type === t.key }"
          @click="form.type = t.key"
        >
          <AppIcon :name="t.icon" :size="20" />
          <text class="page-space__type-name" :class="{ 'page-space__type-name--on': form.type === t.key }">{{ t.label }}</text>
          <text class="page-space__type-sub" :class="{ 'page-space__type-sub--on': form.type === t.key }">{{ t.sub }}</text>
        </view>
      </view>

      <view class="page-space__spacer" />
      <!-- 继续黑胶囊 343×52（1:8284 实测） -->
      <view class="page-space__btn pressable" :class="{ 'page-space__btn--off': !form.name }" @click="next">
        <text>继续</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * A03 创建工作空间（稿 1:8247 实测 1:1）
 * 第一步引导：空间名称 + 空间类型（个人摄影师黑卡选中 / 团队工作室白卡）→ 继续进入第二步选模式。
 */
export default {
  name: 'AuthWorkspace',
  data() {
    return {
      form: { name: '', type: 'personal' },
      types: [
        { key: 'personal', label: '个人摄影师', sub: '独立接单和管理', icon: 'user-white-sm' },
        { key: 'team', label: '团队工作室', sub: '多人协作管理', icon: 'team-dark' },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/auth/register' }) })
    },
    next() {
      if (!this.form.name) return uni.showToast({ title: '请填写工作空间名称', icon: 'none' })
      uni.navigateTo({ url: '/pages/auth/mode' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-space {
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
    padding: 36rpx 0 56rpx; /* 稿：标题字形 130、名称卡 @190 */
  }
  &__card {
    box-sizing: border-box;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    box-shadow: 0 14rpx 44rpx rgba(21, 22, 24, 0.067);
    padding: 20rpx 32rpx; /* 稿：卡高 64（190-254） */
  }
  &__label { display: block; font-size: 24rpx; color: #7A7A7F; }
  &__input { margin-top: 8rpx; font-size: 30rpx; color: #151617; }
  &__ph { color: #757575; font-size: 30rpx; }

  &__type-title {
    display: block;
    margin: 54rpx 4rpx 0; /* 稿：空间类型字形 ~287 */
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
  }
  &__types {
    display: flex;
    gap: 24rpx;
    margin-top: 32rpx; /* 稿：类型卡 @317 */
  }
  &__type {
    flex: 1;
    box-sizing: border-box;
    border-radius: 32rpx;
    padding: 40rpx 36rpx; /* 稿：卡高 114（317-431） */
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    &--on { background-color: #171717; border-color: #171717; }
  }
  &__type-name {
    display: block;
    margin-top: 12rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #151617;
    &--on { color: #FFFFFF; }
  }
  &__type-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 24rpx;
    color: #747881;
    &--on { color: #999999; }
  }

  &__spacer { height: 500rpx; } /* 稿：继续钮 @683 */
  &__btn {
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #17181A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
    &--off { opacity: 0.4; }
  }
}
</style>
