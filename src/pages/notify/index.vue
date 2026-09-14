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

    <!-- 分组列表：今天 / 昨天 / 更早按「M月D日」（未读财务=黑卡，其余=白卡组） -->
    <template v-for="g in groups" :key="g.key">
      <text class="page-notify__day" :class="{ 'page-notify__day--yest': g.key !== 'today' }">{{ g.label }}</text>
      <!-- ① 黑卡：未读财务（收款待确认）343×72 #121212、金 40 r10 图标、右上白胶囊 -->
      <view
        v-for="n in g.dark"
        :key="n.id"
        class="page-notify__card page-notify__card--dark pressable"
        @click="openItem(n)"
      >
        <view class="page-notify__icon" style="background-color: #FFDA08">
          <AppIcon :name="n.icon" :size="20" />
        </view>
        <view class="page-notify__main">
          <text class="page-notify__item-title page-notify__item-title--dark">{{ n.title }}</text>
          <text class="page-notify__item-sub page-notify__item-sub--dark">{{ n.sub }}</text>
        </view>
        <view class="page-notify__badge page-notify__badge--white">
          <text>{{ n.badge }}</text>
        </view>
      </view>
      <!-- ② 白卡组（r16 / r20，行 pad16/13、32 r8 图标、行间 9% 线） -->
      <view
        v-if="g.rest.length"
        class="page-notify__group"
        :class="g.key === 'today' ? 'page-notify__group--r16' : 'page-notify__group--r20'"
      >
        <view
          v-for="(n, i) in g.rest"
          :key="n.id"
          class="page-notify__gcell pressable"
          :class="{ 'page-notify__gcell--line': i > 0 }"
          @click="openItem(n)"
        >
          <view class="page-notify__gicon" :class="{ 'page-notify__gicon--gray': n.read }" :style="{ backgroundColor: n.iconBg }">
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
    </template>

    <AppEmpty v-if="!loading && !groups.length" text="暂无通知" />

    <AppTabBar active="work" />
    <view class="page-notify__safe" />
  </view>
</template>

<script>
/**
 * W02 通知（稿 1:3020 实测 1:1）
 * 结构：头部（返回+居中标题）→ 分段 Tab（全部/待处理/已读）→ 按日期分组列表 → 底部导航。
 * 稿内黑卡右上「待处理」白底胶囊、消息/提醒黄胶囊（bg #FFE9AF 字 #B66E00）、已读灰胶囊（bg #F1F2F2 字 #747881）。
 *
 * 数据源（2026-09-14 接线）：/notification/list（sys_notification，服务端按 receiver_type=1+本人ID 隔离）、
 *   /notification/unread-count（Tab 角标）、/notification/read/:id（点开即已读）。
 * 分组规则：今天 / 昨天 / 更早按「M月D日」；未读「财务」类渲染为黑卡（收款待确认），其余走白卡组。
 * 点击行为：未读先标记已读并本地减计数，再按 biz_type 跳转（order → 订单详情）。
 */
import { getNotificationList, getUnreadCount, readNotification } from '@/api/notification'
import { fromNow } from '@/utils/format'

/** 通知类型（enum.NotificationType）→ 图标 / 图标底色：1-订单 2-财务 3-系统 */
const TYPE_ICON = { 1: 'calendar-gray', 2: 'money-dark-sm', 3: 'info-gray-sm' }
const TYPE_BG = { 1: '#FFFFFF', 2: '#FFDA08', 3: '#FFFFFF' }

export default {
  name: 'NotifyIndex',
  data() {
    return {
      tab: 'all',
      list: [],
      unread: 0,
      loading: true,
    }
  },
  computed: {
    tabs() {
      return [
        { key: 'all', label: '全部' },
        { key: 'pending', label: '待处理', count: this.unread || null },
        { key: 'read', label: '已读' },
      ]
    },
    /** 按当前 Tab 过滤（待处理=未读 / 已读=is_read=1 / 全部） */
    filtered() {
      if (this.tab === 'pending') return this.list.filter((n) => !n.is_read)
      if (this.tab === 'read') return this.list.filter((n) => n.is_read)
      return this.list
    },
    /** 列表项：补齐展示字段（图标/底色/徽章/副行） */
    items() {
      return this.filtered.map((n) => this.decorate(n))
    },
    /** 按日期分组 → [{ key, label, dark, rest }] */
    groups() {
      const out = []
      const index = {}
      const now = new Date()
      const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const todayKey = dayKey(now)
      const yestKey = dayKey(new Date(now.getTime() - 86400000))
      for (const n of this.items) {
        const t = n._time
        let key = 'older'
        let label = '更早'
        if (t) {
          const dk = dayKey(t)
          if (dk === todayKey) { key = 'today'; label = '今天' }
          else if (dk === yestKey) { key = 'yesterday'; label = '昨天' }
          else { key = dk; label = `${t.getMonth() + 1}月${t.getDate()}日` }
        }
        if (!index[key]) {
          index[key] = { key, label, dark: [], rest: [] }
          out.push(index[key])
        }
        if (n.dark) index[key].dark.push(n)
        else index[key].rest.push(n)
      }
      return out
    },
  },
  onShow() {
    this.fetchList()
  },
  methods: {
    /** 单条通知补展示字段；_time 供分组用（保留 Date 便于跨日比较） */
    decorate(n) {
      const unread = !n.is_read
      const dark = unread && n.type === 2 // 未读财务 = 收款待确认（黑卡）
      return {
        ...n,
        _time: this.parseTime(n.created_at),
        read: !unread,
        dark,
        icon: TYPE_ICON[n.type] || 'info-gray-sm',
        iconBg: TYPE_BG[n.type] || '#FFFFFF',
        sub: [n.content, fromNow(n.created_at)].filter(Boolean).join(' · '),
        badge: this.badgeText(n, unread),
        tone: unread ? (dark ? 'white' : 'gold') : 'read',
      }
    },
    badgeText(n, unread) {
      if (!unread) return '已读'
      if (n.type === 2) return '待处理'
      if (n.type === 1) return '订单'
      return '未读'
    },
    /** 后端时间（Go time.Time → RFC3339 含 T）解析；兼容 'yyyy-MM-dd HH:mm:ss' */
    parseTime(val) {
      if (!val) return null
      const s = String(val)
      const d = s.includes('T') ? new Date(s) : new Date(s.replace(/-/g, '/'))
      return Number.isNaN(d.getTime()) ? null : d
    },
    async fetchList() {
      this.loading = true
      const [listRes, countRes] = await Promise.all([
        getNotificationList({ page: 1, page_size: 50 }).catch(() => null),
        getUnreadCount().catch(() => null),
      ])
      this.list = Array.isArray(listRes) ? listRes : (listRes && listRes.list) || []
      this.unread = (countRes && countRes.count) || this.list.filter((n) => !n.is_read).length
      this.loading = false
    },
    async openItem(n) {
      if (!n.is_read) {
        await readNotification(n.id).catch(() => null)
        n.is_read = 1
        this.unread = Math.max(0, this.unread - 1)
      }
      if (n.biz_type === 'order' && n.biz_id) {
        uni.navigateTo({ url: `/pages/order/detail?id=${n.biz_id}` })
      }
    },
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
