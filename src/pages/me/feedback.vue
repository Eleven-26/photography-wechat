<template>
  <view class="page-fb page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「意见反馈」（11:313 实测） -->
    <view class="page-fb__header">
      <view class="page-fb__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-fb__title">意见反馈</text>
    </view>

    <!-- 账号卡 343x90：把问题告诉我们 + 回复说明 -->
    <view class="page-fb__profile">
      <view class="page-fb__avatar"><text>S</text></view>
      <view class="page-fb__profile-main">
        <text class="page-fb__profile-name">把问题告诉我们</text>
        <text class="page-fb__profile-sub">反馈会在 1-2 个工作日内回复到你的微信服务通知</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <!-- 反馈（y225 标题 + y256 三行：问题类型/问题描述/截图） -->
    <text class="page-fb__sec">反馈</text>
    <view class="page-fb__card">
      <view class="info-row page-fb__row pressable" @click="pickType">
        <text class="page-fb__label">问题类型</text>
        <text class="page-fb__value">功能异常 · 请选择</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-fb__row pressable" @click="editDesc">
        <text class="page-fb__label">问题描述</text>
        <text class="page-fb__value page-fb__value--ph">{{ desc || '请描述遇到的问题或建议，不少于 10 字' }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-fb__row pressable" @click="addShot">
        <text class="page-fb__label">截图</text>
        <text class="page-fb__value page-fb__value--ph">添加截图 · 选填 · 最多 3 张</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 联系方式（y421 标题行 + 提示 + y471 一行卡） -->
    <view class="page-fb__sec-row">
      <text class="page-fb__sec">联系方式</text>
      <text class="page-fb__sec-hint">仅用于回访，不会展示给客户</text>
    </view>
    <view class="page-fb__card">
      <view class="info-row page-fb__row info-row--last">
        <view class="page-fb__row-icon"><AppIcon name="me-calendar" :size="17" /></view>
        <view class="page-fb__row-main">
          <text class="page-fb__row-label">微信号 / 手机号</text>
          <text class="page-fb__row-sub">lusheng_0823 · 选填，方便回访</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 提交反馈 343x52 黑胶囊（y556） -->
    <view class="page-fb__submit pressable" @click="submit"><text>提交反馈</text></view>
    <view class="page-fb__safe" />
  </view>
</template>

<script>
/**
 * ME12b 意见反馈（稿 11:313 实测 1:1）
 * 账号卡 → 反馈三行（问题类型/问题描述/截图选填）→ 联系方式行 → 提交反馈黑胶囊 52。
 */
export default {
  name: 'MeFeedback',
  data() {
    return {
      desc: '',
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    pickType() {
      uni.showToast({ title: '选择问题类型（演示）', icon: 'none' })
    },
    editDesc() {
      uni.showToast({ title: '输入问题描述（演示）', icon: 'none' })
    },
    addShot() {
      uni.showToast({ title: '添加截图（演示）', icon: 'none' })
    },
    submit() {
      uni.showToast({ title: '已提交（演示）', icon: 'success' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-fb {
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
  &__profile-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 21rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sec { display: block; margin: 40rpx 36rpx; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 左右 32rpx：标题与卡片左缘对齐（2026-09-10 补，原缺失致贴屏边） */
  &__profile + &__sec { margin-top: 40rpx; } /* 同族口径：头卡底 204 → 标题（上 20px），与 ME02 对齐 */
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0;
    .page-fb__sec { margin: 0; } /* 行内标题清空左右 margin（sec-row 已提供边距，避免二次缩进） */
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
    &--ph { color: #666666; }
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

  &__submit {
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
