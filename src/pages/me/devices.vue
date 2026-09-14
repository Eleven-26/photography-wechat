<template>
  <view class="page-dv page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「登录设备」（11:468 实测） -->
    <view class="page-dv__header">
      <view class="page-dv__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-dv__title">登录设备</text>
    </view>

    <!-- 当前设备（y104 标题 + y159 一行卡） -->
    <text class="page-dv__sec">当前设备</text>
    <view class="page-dv__card">
      <view class="info-row page-dv__row info-row--last">
        <view class="page-dv__row-icon"><AppIcon name="me-help" :size="17" /></view>
        <view class="page-dv__row-main">
          <text class="page-dv__row-label">{{ curDevice.label }}</text>
          <text class="page-dv__row-sub">{{ curDevice.sub }}</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 其他设备（y224 标题 + y279 两行卡：暂无其他设备/退出登录） -->
    <text class="page-dv__sec">其他设备</text>
    <view class="page-dv__card">
      <!-- 有设备：逐台列出，点击踢出；无设备：空态提示 -->
      <view
        v-for="d in otherDevices"
        :key="d.id"
        class="info-row page-dv__row pressable"
        @click="kick(d)"
      >
        <view class="page-dv__row-icon"><AppIcon name="me-shield" :size="17" /></view>
        <view class="page-dv__row-main">
          <text class="page-dv__row-label">{{ d.label }}</text>
          <text class="page-dv__row-sub">{{ d.sub }} · 点击退出该设备</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view v-if="!otherDevices.length" class="info-row page-dv__row">
        <view class="page-dv__row-icon"><AppIcon name="me-shield" :size="17" /></view>
        <view class="page-dv__row-main">
          <text class="page-dv__row-label">暂无其他登录设备</text>
          <text class="page-dv__row-sub">新设备登录需短信验证码确认</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-dv__row info-row--last pressable" @click="logout">
        <view class="page-dv__row-icon page-dv__row-icon--alt"><AppIcon name="edit-gray" :size="17" /></view>
        <view class="page-dv__row-main">
          <text class="page-dv__row-label">退出登录</text>
          <text class="page-dv__row-sub">退出后需重新登录，本地数据保留</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 关于（y410 标题 + y465 三行卡：上次登录/时间/账号保护） -->
    <text class="page-dv__sec">关于</text>
    <view class="page-dv__card">
      <view class="info-row page-dv__row">
        <text class="page-dv__label">上次登录</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-dv__row">
        <text class="page-dv__label">{{ lastLoginText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-dv__row info-row--last">
        <text class="page-dv__label">账号保护</text>
        <text class="page-dv__value">已开启</text>
      </view>
    </view>
    <view class="page-dv__safe" />
  </view>
</template>

<script>
/**
 * ME11c 登录设备（稿 11:468 实测 1:1）
 * 当前设备一行 → 其他设备（逐台可踢出 / 空态）→ 退出登录 → 关于三行（上次登录/时间/账号保护）。
 *
 * 数据源（2026-09-14 接线）：/device/list（sys_user_device，按 last_active_at DESC）、
 *   /device/remove/:id（踢出设备）、/user/logout（服务端注销当前令牌）。
 * ⚠️ 后端无「当前设备」标记：取 last_active_at 最新的一条视为本机（repo 已按其倒序）。
 * ⚠️ 后端无归属地字段：副行以「最近活跃时间 · 最近登录 IP」呈现，不展示城市。
 */
import { getDeviceList, removeDevice } from '@/api/device'
import { logout as apiLogout } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { fromNow, formatDate } from '@/utils/format'

const PLATFORM_LABEL = { ios: 'iPhone', android: 'Android', pc: '电脑', wechat: '微信' }

export default {
  name: 'MeDevices',
  data() {
    return { devices: [] }
  },
  computed: {
    /** 统一成展示结构（label/sub/raw），供两处卡片复用 */
    normalized() {
      return this.devices.map((d) => ({
        id: d.id,
        label: d.device_name || PLATFORM_LABEL[d.platform] || '未知设备',
        sub: [d.last_active_at ? `最近活跃 · ${fromNow(d.last_active_at)}` : '暂无活跃记录', d.last_ip || '']
          .filter(Boolean)
          .join(' · '),
        raw: d,
      }))
    },
    curDevice() {
      return this.normalized[0] || { label: '本机', sub: '最近活跃 · 刚刚' }
    },
    otherDevices() {
      return this.normalized.slice(1)
    },
    lastLoginText() {
      const d = this.normalized[0]
      const t = d && d.raw && d.raw.last_active_at
      if (!t) return '—'
      const when = `${formatDate(t, 'MM-dd HH:mm')}`
      return d.raw.last_ip ? `${when} · ${d.raw.last_ip}` : when
    },
  },
  onShow() {
    this.fetchDevices()
  },
  methods: {
    async fetchDevices() {
      const res = await getDeviceList().catch(() => null)
      const list = Array.isArray(res) ? res : (res && res.list) || []
      this.devices = list.filter((d) => d.status !== 0)
    },
    goBack() {
      uni.navigateBack()
    },
    /** 踢出指定设备（服务端置 status=0） */
    kick(d) {
      uni.showModal({
        title: '退出该设备',
        content: `确定在「${d.label}」上退出登录？`,
        success: async (res) => {
          if (!res.confirm) return
          const ok = await removeDevice(d.id).then(() => true).catch(() => false)
          if (!ok) return
          uni.showToast({ title: '已退出该设备', icon: 'success' })
          this.fetchDevices()
        },
      })
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '退出后需重新登录，本地数据保留',
        success: async (res) => {
          if (!res.confirm) return
          await apiLogout().catch(() => null)
          useUserStore().logout()
          uni.reLaunch({ url: '/pages/login/index' })
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-dv {
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
    margin: 40rpx 36rpx;
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 62rpx 32rpx 0; /* 稿：标签顶→卡顶 55px */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
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
    &--alt { background-color: #F1F1F3; }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 28rpx; color: #1A1A1A; }
  &__row-sub { display: block; margin-top: 6rpx; font-size: 20rpx; color: #8E8E93; }
  &__label {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
  }
  &__value { font-size: 26rpx; color: #6D6D72; }

  &__safe { height: 60rpx; }
}
</style>
