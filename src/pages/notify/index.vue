<template>
  <view class="page-notify page-wrap">
    <view class="status-bar" />
    <!-- Header：44 白圆钮返回 + 标题「通知」17 Bold 居中（1:3022 实测 y44 h60） -->
    <view class="page-notify__header">
      <view class="page-notify__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-notify__title">通知</text>
    </view>

    <!-- 分段 Tab：白容器 343×44 三段各 112×40，选中黑底（1:3033 实测；容器 r16px、胶囊 r14px） -->
    <view class="page-notify__tabs">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="page-notify__tab pressable"
        :class="{ 'page-notify__tab--on': tab === t.key }"
        @click="tab = t.key"
      >
        <text class="page-notify__tab-text">{{ t.label }}</text>
        <text v-if="t.count != null" class="page-notify__tab-count">{{ t.count }}</text>
      </view>
    </view>

    <!-- 今天 -->
    <text class="page-notify__day">今天</text>
    <!-- ① 黑卡：收款待确认（1:3046 实测 343×72 #121212、金 40 r10 图标、右上白胶囊） -->
    <view
      v-for="n in todayList"
      :key="n.title"
      class="page-notify__card"
      :class="n.dark ? 'page-notify__card--dark' : 'page-notify__card--white'"
    >
      <view class="page-notify__icon" :style="{ backgroundColor: n.dark ? '#FFDA08' : '#FFFFFF' }">
        <AppIcon :name="n.icon" :size="n.dark ? 20 : 20" />
      </view>
      <view class="page-notify__main">
        <text class="page-notify__item-title" :class="{ 'page-notify__item-title--dark': n.dark }">{{ n.title }}</text>
        <text class="page-notify__item-sub" :class="{ 'page-notify__item-sub--dark': n.dark }">{{ n.sub }}</text>
      </view>
      <view class="page-notify__badge" :class="`page-notify__badge--${n.tone}`">
        <text>{{ n.badge }}</text>
      </view>
    </view>
    <!-- ② 白卡组（1:3058 实测 r16、行 pad16/13、32 r8 图标、行间 9% 线） -->
    <view class="page-notify__group page-notify__group--r16">
      <view
        v-for="(n, i) in todayGroup"
        :key="n.title"
        class="page-notify__gcell"
        :class="{ 'page-notify__gcell--line': i > 0 }"
      >
        <view class="page-notify__gicon" :style="{ backgroundColor: n.iconBg }">
          <AppIcon :name="n.icon" :size="20" />
        </view>
        <view class="page-notify__main">
          <text class="page-notify__item-title">{{ n.title }}</text>
          <text class="page-notify__item-sub">{{ n.sub }}</text>
        </view>
        <view class="page-notify__badge" :class="`page-notify__badge--${n.tone}`">
          <text>{{ n.badge }}</text>
        </view>
      </view>
    </view>

    <!-- 昨天 -->
    <text class="page-notify__day page-notify__day--yest">昨天</text>
    <view class="page-notify__group page-notify__group--r20">
      <view
        v-for="(n, i) in yesterdayGroup"
        :key="n.title"
        class="page-notify__gcell"
        :class="{ 'page-notify__gcell--line': i > 0 }"
      >
        <view class="page-notify__gicon page-notify__gicon--gray" :style="{ backgroundColor: n.iconBg }">
          <AppIcon :name="n.icon" :size="20" />
        </view>
        <view class="page-notify__main">
          <text class="page-notify__item-title">{{ n.title }}</text>
          <text class="page-notify__item-sub">{{ n.sub }}</text>
        </view>
        <view class="page-notify__badge page-notify__badge--read">
          <text>{{ n.badge }}</text>
        </view>
      </view>
    </view>

    <AppTabBar active="work" />
    <view class="page-notify__safe" />
  </view>
</template>

<script>
/**
 * W02 通知（稿 1:3020 实测 1:1）
 * 结构：头部（返回+居中标题）→ 分段 Tab（全部/待处理/已读）→ 今天（黑卡收款+白卡组）→ 昨天（白卡组）→ 底部导航。
 * 稿内黑卡右上「待处理」白底胶囊、消息/提醒黄胶囊（bg #FFE9AF 字 #B66E00）、已读灰胶囊（bg #F1F2F2 字 #747881）。
 */
export default {
  name: 'NotifyIndex',
  data() {
    return {
      tab: 'all',
      tabs: [
        { key: 'all', label: '全部' },
        { key: 'pending', label: '待处理', count: 4 },
        { key: 'read', label: '已读' },
      ],
      todayList: [
        { dark: true, icon: 'money-dark-sm', iconBg: '#FFDA08', title: '陈雨已转账待确认', sub: '¥804 · 微信转账 · 无需凭证 · 09:16', badge: '待处理', tone: 'white' },
      ],
      todayGroup: [
        { icon: 'bubble-dark-sm', iconBg: '#FFFFFF', title: '蓝桥科技发来消息', sub: '"请问可以加一组全身照吗" · 8分钟前', badge: '待回复', tone: 'gold' },
        { icon: 'clock-dark-sm', iconBg: '#FFFFFF', title: '拍摄时间提醒', sub: '陈雨 · 10:00 越秀公园 · 家庭纪念写真', badge: '今日', tone: 'gold' },
      ],
      yesterdayGroup: [
        { icon: 'calendar-gray', iconBg: '#F3F4F5', title: '档期规则已更新', sub: '可约时间已发布 · 8/7 18:00', badge: '已读' },
        { icon: 'doc-gray', iconBg: '#F3F4F5', title: '订单状态更新', sub: '陈雨订单今日拍摄 · 10:00', badge: '已读' },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/work/index' }) })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-notify {
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

  &__tabs {
    display: flex;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx; /* 稿 Rectangle64 r16px=32rpx（原注释 r20 推导有误） */
    padding: 4rpx;
  }
  &__tab {
    flex: 1;
    height: 80rpx;
    border-radius: 28rpx; /* 稿 Rectangle65/66/67 112×40 r14px=28rpx */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    &--on { background-color: #121212; }
  }
  &__tab-text {
    font-size: 26rpx;
    color: #666666;
    &.page-notify__tab--on & { /* noop guard */ }
  }
  &__tab--on .page-notify__tab-text { color: #FFFFFF; font-weight: 700; }
  &__tab-count { font-size: 24rpx; color: #9CA3AF; }
  &__tab--on .page-notify__tab-count { color: rgba(255, 255, 255, 0.7); }

  &__day {
    display: block;
    margin: 40rpx 32rpx 0; /* 稿：今天标签 @y178、x16 */
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
    &--yest { margin-top: 36rpx; }
  }

  /* 黑卡：343×72（内容 40 = title 21 + 2 + sub 17） */
  &__card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin: 20rpx 32rpx 0;
    padding: 32rpx;
    border-radius: 32rpx; /* 稿 Rectangle68 黑卡 r16px=32rpx（--dark 共用） */
    .page-notify__item-title { line-height: 42rpx; }
    .page-notify__item-sub { line-height: 34rpx; margin-top: 4rpx; }
    &--dark { background-color: #121212; }
    &--white {
      background-color: $white;
      border-radius: 32rpx;
      box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    }
  }
  &__icon {
    box-sizing: border-box;
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__main { flex: 1; min-width: 0; }
  &__item-title {
    display: block;
    font-size: 30rpx;
    line-height: 44rpx; /* 稿：行高 70 = pad13×2 + 22+2+20 */
    font-weight: 700;
    color: #151617;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--dark { color: #FFFFFF; }
  }
  &__item-sub {
    display: block;
    font-size: 24rpx;
    line-height: 40rpx; /* 稿：同上行高链 */
    color: #747881;
    margin-top: 4rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--dark { color: rgba(255, 255, 255, 0.68); }
  }
  &__badge {
    flex-shrink: 0;
    border-radius: 999rpx;
    padding: 6rpx 18rpx 8rpx;
    text { font-size: 22rpx; line-height: 36rpx; font-weight: 500; white-space: nowrap; }
    &--white { background-color: #FFFFFF; text { color: #121212; } }
    &--gold { background-color: #FFE9AF; text { color: #B66E00; } }
    &--read { background-color: #F1F2F2; text { color: #747881; } }
  }

  /* 白卡组：r16 / r20，行 pad 32/26，行间 9% 线 */
  &__group {
    margin: 40rpx 32rpx 0; /* 稿：黑卡底 280 → 消息卡 300，间距 20 */
    background-color: $white;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    &--r16 { border-radius: 32rpx; }
    &--r20 { border-radius: 40rpx; margin-top: 20rpx; } /* 稿：昨天标签→已读卡间距 10 */
  }
  &__gcell {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 26rpx 32rpx;
    &--line { border-top: 1rpx solid rgba(21, 22, 24, 0.09); }
  }
  &__gicon {
    box-sizing: border-box;
    width: 64rpx;
    height: 64rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1rpx solid rgba(21, 22, 24, 0.05);
    &--gray { border: none; }
  }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
