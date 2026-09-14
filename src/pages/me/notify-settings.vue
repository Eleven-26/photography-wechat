<template>
  <view class="page-ns page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「通知设置」（1:6238 实测） -->
    <view class="page-ns__header">
      <view class="page-ns__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-ns__title">通知设置</text>
    </view>

    <!-- 提醒开关（y108 标题 + 四行卡：全部 toggle on #34C759） -->
    <text class="page-ns__sec">提醒开关</text>
    <view class="page-ns__card">
      <view v-for="(t, i) in toggles" :key="t.key" class="info-row page-ns__row" :class="{ 'info-row--last': i === toggles.length - 1 }">
        <view class="page-ns__row-main">
          <text class="page-ns__row-label">{{ t.label }}</text>
          <text class="page-ns__row-sub">{{ t.sub }}</text>
        </view>
        <view class="page-ns__toggle" :class="{ 'page-ns__toggle--on': t.on }" @click="toggle(t)">
          <view class="page-ns__knob" />
        </view>
      </view>
    </view>

    <!-- 灰提示条 -->
    <view class="page-ns__note">
      <text>通过微信「服务通知」送达，也可在微信设置里关闭所有。</text>
    </view>
    <view class="page-ns__safe" />
  </view>
</template>

<script>
/**
 * ME10 通知设置（稿 1:6238 实测 1:1）
 * 提醒开关四行（档期变更/订单动态/日程与拍摄提醒/客户消息，toggle on #34C759）→ 微信服务通知灰条。
 *
 * 数据源（2026-09-14 第六批接线）：复用 /studio/get、/studio/update 的 notify_settings 字段
 * （biz_studio_setting.notify_settings，JSON 串 {schedule,order,remind,message}）。
 * ⚠️ 开关粒度是**工作室级**而非员工级：后端未按员工存储通知偏好，同租户员工共享一份。
 *    若将来要按人隔离，需把该字段迁到 sys_user 或新建独立表。
 * ⚠️ 开关是**即时保存**（点一下存一次），不做「保存」按钮：开关类配置即时生效符合直觉，
 *    也避免用户改完忘记点保存。失败时回滚本地开关状态。
 */
import { getStudioSettings, updateStudioSettings } from '@/api/settings'

/** 开关键 → 文案（键与后端 JSON 字段一一对应） */
const TOGGLE_DEFS = [
  { key: 'schedule', label: '档期变更提醒', sub: '客户改期 / 你改期后确认状态变化' },
  { key: 'order', label: '订单动态', sub: '下单 / 确认 / 到账登记 / 尾款结清' },
  { key: 'remind', label: '日程与拍摄提醒', sub: '今日拍摄 / 开拍前提醒 / 档期规则更新' },
  { key: 'message', label: '客户消息', sub: '客户通过预约主页发来的咨询' },
]

export default {
  name: 'MeNotifySettings',
  data() {
    return {
      // 默认全开：与稿一致，也避免设置未初始化时"静默全部静音"
      toggles: TOGGLE_DEFS.map((d) => ({ ...d, on: true })),
    }
  },
  onShow() {
    this.fetchSettings()
  },
  methods: {
    async fetchSettings() {
      const res = await getStudioSettings().catch(() => null)
      if (!res) return
      const raw = res.notify_settings
      if (!raw) return
      let saved = {}
      try {
        saved = typeof raw === 'string' ? JSON.parse(raw) : raw
      } catch {
        return // 脏数据保持默认值，不下发
      }
      this.toggles = TOGGLE_DEFS.map((d) => ({ ...d, on: saved[d.key] !== false }))
    },
    /** 切换并即时保存；失败回滚 */
    async toggle(t) {
      const next = !t.on
      t.on = next
      const payload = {}
      this.toggles.forEach((x) => { payload[x.key] = x.key === t.key ? next : x.on })
      const ok = await updateStudioSettings({ notify_settings: JSON.stringify(payload) })
        .then(() => true)
        .catch(() => false)
      if (!ok) {
        t.on = !next
        return
      }
      uni.showToast({ title: next ? '已开启' : '已关闭', icon: 'none' })
    },
    goBack() {
      uni.navigateBack()
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ns {
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

  &__sec {
    display: block;
    margin: 40rpx 36rpx 0; /* 稿内容容器 y108（header 底 104 + 4px）；默认页口径 y104，本页按稿低 8rpx */
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row { gap: 24rpx; }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 28rpx; color: #000000; }
  &__row-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 24rpx;
    color: #8E8E93;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  &__note {
    box-sizing: border-box;
    margin: 40rpx 32rpx 0;
    background-color: #E6E7EB;
    border-radius: 24rpx;
    padding: 20rpx 24rpx;
    text { font-size: 24rpx; line-height: 34rpx; color: #6D6D72; }
  }

  &__safe { height: 60rpx; }
}
</style>
