<template>
  <view class="page-os page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「接单设置」（1:6176 实测） -->
    <view class="page-os__header">
      <view class="page-os__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-os__title">接单设置</text>
    </view>

    <!-- 接收新预约卡 y114：开关 on #34C759 + 两行灰说明 -->
    <view class="page-os__card page-os__card--first">
      <view class="page-os__toggle-row">
        <view class="page-os__toggle-main">
          <text class="page-os__toggle-title">接收新预约</text>
          <text class="page-os__toggle-sub">{{ '关闭后客户无法在预约主页下单\n已有订单不受影响' }}</text>
        </view>
        <view class="page-os__toggle" :class="{ 'page-os__toggle--on': accept }" @click="accept = !accept">
          <view class="page-os__knob" />
        </view>
      </view>
    </view>

    <!-- 新单确认方式（标题行 + 提示 + 分段卡 + 说明） -->
    <view class="page-os__sec-row">
      <text class="page-os__sec">新单确认方式</text>
      <text class="page-os__sec-hint">决定客户下单后流程</text>
    </view>
    <view class="page-os__card">
      <view class="page-os__seg">
        <view
          v-for="s in ['手动确认', '自动确认']"
          :key="s"
          class="page-os__seg-item"
          :class="{ 'page-os__seg-item--on': mode === s }"
          @click="mode = s"
        >
          <text>{{ s }}</text>
        </view>
      </view>
      <text class="page-os__mode-hint">{{ modeHint }}</text>
    </view>

    <!-- 档期规则（标题行 + 提示 + 一行卡跳日程） -->
    <view class="page-os__sec-row">
      <text class="page-os__sec">档期规则</text>
      <text class="page-os__sec-hint">与日程档期联动</text>
    </view>
    <view class="page-os__card">
      <view class="info-row page-os__row info-row--last pressable" @click="goSchedule">
        <view class="page-os__row-icon"><AppIcon name="me-calendar" :size="17" /></view>
        <view class="page-os__row-main">
          <text class="page-os__row-label">每周可约时段 / 关闭日期</text>
          <text class="page-os__row-sub">统一在日程 Tab 管理</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 保存 48 高黑胶囊（fillx48） -->
    <view class="page-os__save pressable" @click="save"><text>保存</text></view>
    <view class="page-os__safe" />
  </view>
</template>

<script>
/**
 * ME09 接单设置（稿 1:6176 实测 1:1）
 * 接收新预约开关 → 新单确认方式分段（手动/自动确认）→ 档期规则行（跳日程 Tab）→ 保存黑胶囊 48。
 *
 * 数据源（2026-09-14 第六批接线）：复用 /studio/get、/studio/update：
 *   accept_new（biz_studio_setting 既有列，1-接收 0-暂停）、
 *   confirm_mode（本次新增列，manual-手动确认 auto-自动确认）。
 * ⚠️ 与「通知设置」不同，本页有显式保存按钮（档期策略属重要配置，不适合边点边存）。
 */
import { getStudioSettings, updateStudioSettings } from '@/api/settings'

const MODE_LABEL = { manual: '手动确认', auto: '自动确认' }

export default {
  name: 'MeOrderSettings',
  data() {
    return {
      accept: true,
      mode: '手动确认',
      submitting: false,
    }
  },
  computed: {
    modeHint() {
      return this.mode === '自动确认'
        ? '客户下单即自动占用档期并进入待定金——适合标准化套餐、可快速确认的拍摄。'
        : '客户下单后你收到提醒，确认后才占用档期——适合需要先沟通需求的拍摄。'
    },
  },
  onShow() {
    this.fetchSettings()
  },
  methods: {
    async fetchSettings() {
      const res = await getStudioSettings().catch(() => null)
      if (!res) return
      this.accept = res.accept_new !== 0
      this.mode = MODE_LABEL[res.confirm_mode] || '手动确认'
    },
    goBack() {
      uni.navigateBack()
    },
    goSchedule() {
      uni.switchTab({ url: '/pages/schedule/index' })
    },
    async save() {
      if (this.submitting) return
      this.submitting = true
      const ok = await updateStudioSettings({
        accept_new: this.accept ? 1 : 0,
        confirm_mode: this.mode === '自动确认' ? 'auto' : 'manual',
      })
        .then(() => true)
        .catch(() => false)
      this.submitting = false
      if (!ok) return
      uni.showToast({ title: '已保存', icon: 'success' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-os {
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

  &__sec { font-size: 30rpx; font-weight: 500; color: #1A1A1A; }
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0;
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
    padding: 24rpx 32rpx;
    &--first { margin-top: 20rpx; padding: 28rpx 32rpx; } /* 稿：首卡 @114 */
  }
  &__toggle-row { display: flex; align-items: center; gap: 24rpx; }
  &__toggle-main { flex: 1; min-width: 0; }
  &__toggle-title { font-size: 30rpx; color: #000000; }
  &__toggle-sub {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #8E8E93;
    white-space: pre-line;
  }
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
  &__knob { width: 42rpx; height: 42rpx; border-radius: 50%; background-color: #FFFFFF; }

  &__seg {
    display: flex;
    background-color: #F1F1F3;
    border-radius: 24rpx;
    padding: 4rpx;
  }
  &__seg-item {
    flex: 1;
    height: 68rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 26rpx; color: #8E8E93; }
    &--on {
      background-color: #1A1A1A;
      text { color: #FFFFFF; }
    }
  }
  &__mode-hint {
    display: block;
    margin-top: 16rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #86868B;
  }

  &__row { gap: 24rpx; }
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
  &__row-label { font-size: 29rpx; color: #1A1A1A; }
  &__row-sub { display: block; margin-top: 6rpx; font-size: 21rpx; color: #8E8E93; }

  &__save {
    box-sizing: border-box;
    margin: 48rpx 32rpx 0;
    height: 96rpx;
    border-radius: 999rpx;
    background-color: #1A1A1A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #FFFFFF; }
  }

  &__safe { height: 120rpx; }
}
</style>
