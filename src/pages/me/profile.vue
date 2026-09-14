<template>
  <view class="page-mp page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 白圆钮 44 + 「个人资料」居中（1:5866 实测） -->
    <view class="page-mp__header">
      <view class="page-mp__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-mp__title">个人资料</text>
    </view>

    <!-- 资料入口卡 343x90 白 r16：52头像 + 店名15 + 说明10.5 + 箭头（y114） -->
    <view class="page-mp__entry pressable" @click="pickAvatar">
      <view class="page-mp__avatar"><text>{{ avatarText }}</text></view>
      <view class="page-mp__entry-main">
        <text class="page-mp__entry-name">{{ studio.slogan || '未设置店名' }}</text>
        <text class="page-mp__entry-sub">头像 / 店名 / 简介展示在预约主页，客户第一眼看到的就是这里</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <!-- 资料（y225 标题 + y256 三行） -->
    <view class="page-mp__sec">资料</view>
    <view class="page-mp__card">
      <view class="info-row page-mp__row pressable" @click="edit('店名')">
        <text class="page-mp__label">店名</text>
        <text class="page-mp__value page-mp__value--dark">{{ studio.slogan || '未填写' }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-mp__row pressable" @click="edit('简介')">
        <text class="page-mp__label">简介</text>
        <text class="page-mp__value">{{ studio.intro || '未填写' }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-mp__row pressable" @click="edit('微信号')">
        <text class="page-mp__label">微信号</text>
        <text class="page-mp__value">{{ wechatText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 档期（y421 标题行 + 右灰提示） -->
    <view class="page-mp__sec-row">
      <text class="page-mp__sec">档期</text>
      <text class="page-mp__sec-hint">客户可预约的时间来自日程档期</text>
    </view>
    <view class="page-mp__card">
      <view class="info-row page-mp__row pressable" @click="goSchedule">
        <view class="page-mp__row-icon"><AppIcon name="me-calendar" :size="17" /></view>
        <view class="page-mp__row-main">
          <text class="page-mp__row-label">档期与可约时段</text>
          <text class="page-mp__row-sub">在日程 Tab 统一管理</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 保存 343x52 黑胶囊（y556） -->
    <view class="page-mp__save pressable" @click="save"><text>保存</text></view>

    <AppTabBar active="me" />
    <view class="page-mp__safe" />
  </view>
</template>

<script>
/**
 * ME02 个人资料（稿 1:5866 实测 1:1）
 * 资料入口卡 → 资料 3 行（店名黑 13 / 简介灰 13 / 微信号灰 13）→ 档期一行 → 保存 52 黑胶囊。
 *
 * 数据源（2026-09-14 接线）：/studio/get、/studio/update（biz_studio_setting）
 * ⚠️ 后端 StudioSetting 无独立「店名 / 微信号」字段：店名暂以 slogan（工作室标语）承载，
 *    微信号无对应字段，仅展示为未填写（需在管理端维护）—— 待后端补字段后替换绑定。
 */
import { getStudioSettings, updateStudioSettings } from '@/api/settings'

export default {
  name: 'MeProfile',
  data() {
    return {
      studio: {},
      submitting: false,
    }
  },
  computed: {
    avatarText() {
      const s = this.studio.slogan || '摄影'
      return s.slice(0, 1)
    },
    wechatText() {
      return '未填写 · 展示在主页 · 选填'
    },
  },
  onShow() {
    this.fetchStudio()
  },
  methods: {
    async fetchStudio() {
      const res = await getStudioSettings().catch(() => null)
      this.studio = res || {}
    },
    goBack() {
      uni.navigateBack()
    },
    pickAvatar() {
      uni.showToast({ title: '头像请在管理端维护', icon: 'none' })
    },
    /** 行内编辑（editable modal）：店名→slogan、简介→intro；微信号后端无字段 */
    edit(label) {
      const field = label === '店名' ? 'slogan' : (label === '简介' ? 'intro' : '')
      if (!field) return uni.showToast({ title: `${label}请在管理端维护`, icon: 'none' })
      uni.showModal({
        title: `编辑${label}`,
        editable: true,
        placeholderText: `请输入${label}`,
        content: this.studio[field] || '',
        success: (res) => {
          if (!res.confirm) return
          this.studio = { ...this.studio, [field]: res.content || '' }
        },
      })
    },
    goSchedule() {
      uni.switchTab({ url: '/pages/schedule/index' })
    },
    async save() {
      if (this.submitting) return
      this.submitting = true
      const ok = await updateStudioSettings({
        ...this.studio,
        slogan: this.studio.slogan || '',
        intro: this.studio.intro || '',
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
.page-mp {
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

  &__entry {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 20rpx 32rpx 0; /* 稿：入口卡左缘 x16 = 32rpx；顶距 header 底 104→114 = 10px */
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
    text { font-size: 32rpx; color: #FFFFFF; }
  }
  &__entry-main { flex: 1; min-width: 0; }
  &__entry-name { display: block; font-size: 30rpx; font-weight: 500; color: #000000; }
  &__entry-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 21rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sec { margin: 40rpx 36rpx; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 左右 32rpx：与卡片左缘对齐（2026-09-10 补，原缺失致贴屏边） */
  &__entry + &__sec { margin-top: 40rpx; } /* 稿：卡底 204 → 「资料」228（上 20px） */
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0;
    .page-mp__sec { margin: 0; } /* 行内标题清空左右 margin（sec-row 已提供边距，避免二次缩进） */
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：标题墨迹 243 → 卡片 256（下 12px） */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }
  &__label { font-size: 28rpx; color: #666666; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 26rpx;
    color: #666666;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--dark { color: #1A1A1A; }
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

  &__save {
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

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
