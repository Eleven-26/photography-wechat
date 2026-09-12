<template>
  <view class="page-scm page-wrap">
    <view class="status-bar" />
    <!-- Header：返回 + 「档期管理」（1:4297 实测） -->
    <view class="page-scm__header">
      <view class="page-scm__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-scm__title">档期管理</text>
    </view>

    <!-- 周条：8 格 44×66（含跨周首格），今日黑块，底部状态点（1:12 Group 125 实测 380 宽 → 横向滑动） -->
    <scroll-view class="page-scm__weekbar" scroll-x :show-scrollbar="false">
      <view class="page-scm__weekbar-inner">
        <view
          v-for="(d, i) in weekDays"
          :key="i"
          class="page-scm__wday pressable"
          :class="{ 'page-scm__wday--on': selIdx === i, 'page-scm__wday--dim': d.past }"
          @click="pickDay(i)"
        >
          <text class="page-scm__wday-head" :class="{ 'page-scm__wday-head--on': selIdx === i }">{{ d.w }}</text>
          <text class="page-scm__wday-num" :class="{ 'page-scm__wday-num--on': selIdx === i }">{{ d.label }}</text>
          <view class="page-scm__wdot" :style="{ backgroundColor: d.dot }" />
        </view>
      </view>
    </scroll-view>

    <!-- 时段开关（1:44 实测：标题+右侧说明 / 四行 toggle + 关闭全天黑条） -->
    <view class="page-scm__sec-row">
      <text class="page-scm__sec">时段开关</text>
      <text class="page-scm__sec-note">{{ selNote }}</text>
    </view>
    <view class="page-scm__card">
      <view
        v-for="(s, i) in slots"
        :key="s.time"
        class="page-scm__slot"
        :class="{ 'page-scm__slot--line': i > 0 }"
      >
        <view class="page-scm__slot-main">
          <text class="page-scm__slot-time" :class="{ 'page-scm__slot-time--dim': !s.on || s.locked }">{{ s.time }}</text>
          <text class="page-scm__slot-state">{{ s.locked ? s.state : (s.on ? '可约' : '已关闭') }}</text>
        </view>
        <view
          class="page-scm__toggle"
          :class="{ 'page-scm__toggle--on': s.on, 'page-scm__toggle--locked': s.locked }"
          @click="!s.locked && (s.on = !s.on)"
        >
          <view class="page-scm__toggle-dot" :class="{ 'page-scm__toggle-dot--on': s.on }" />
        </view>
      </view>
      <view class="page-scm__close-all pressable" @click="toggleAll">
        <text>{{ allOff ? '开放全天' : '关闭全天' }}</text>
      </view>
    </view>

    <!-- 占用时段订单（1:79 实测 343×143：拍摄卡样式+发起改期/联系客户） -->
    <text class="page-scm__sec page-scm__sec--gap">占用时段订单</text>
    <view class="page-scm__order">
      <view class="page-scm__order-head">
        <text class="page-scm__order-time">09:00-11:00</text>
        <view class="page-scm__badge"><text>已确认 · 定金已收</text></view>
      </view>
      <view class="page-scm__order-mid">
        <text class="page-scm__order-name">王浩 · 亲子写真</text>
        <text class="page-scm__order-place">越秀公园 · 2.5h</text>
      </view>
      <view class="page-scm__order-btns">
        <view class="page-scm__obtn page-scm__obtn--ghost pressable" @click="reschedule">
          <text>发起改期</text>
        </view>
        <view class="page-scm__obtn page-scm__obtn--dark pressable" @click="contact">
          <text>联系客户</text>
        </view>
      </view>
    </view>

    <!-- 底部提示（1:97 实测 343×61 #E6E7EB r14） -->
    <view class="page-scm__tip">
      <AppIcon name="info-gray-sm" :size="13" />
      <text class="page-scm__tip-text">手动关闭只影响还没被订单占用的时段 · 已占时段由订单控制</text>
    </view>

    <AppTabBar active="schedule" />
    <view class="page-scm__safe" />
  </view>
</template>

<script>
/**
 * SC04 档期管理（稿 1:4297 实测 1:1）
 * 周条（今日黑块，31 天连续可横滑、点选联动下方时段开关，各日状态独立缓存）→ 时段开关（已占行锁定灰开关/可约绿开关/已关闭灰）+ 关闭全天 → 占用时段订单卡 → 提示。
 * 开关实测：开 #00B972 / 关 #D9D9D9，50×28 圆点 24。订单控制时段不可手关（与锁档口径一致）。
 */
export default {
  name: 'ScheduleManage',
  data() {
    /* 31 天连续日条（8/7-9/6）：星期几按稿基准 8/7=一 推算循环，14 之后 15、16…；红点=有订单占用 */
    const names = ['一', '二', '三', '四', '五', '六', '日']
    /* 前 8 天状态点按稿原值（10 红=订单占用 / 11 金），之后循环 */
    const first = { 2: '#76D596', 3: '#FF8181', 4: '#FFDA08', 5: '#76D596', 6: '#76D596', 7: '#76D596' }
    const pattern = ['#76D596', '#FF8181', '#FFDA08', '#76D596', '#76D596', '#D4D4D4', '#76D596']
    const days = []
    for (let i = 0; i < 31; i++) {
      const n = 7 + i
      const dom = n <= 31 ? n : n - 31
      days.push({
        w: names[i % 7],
        dom,
        m: n <= 31 ? 8 : 9,
        label: i === 1 ? '今' : String(dom),
        dot: i === 0 ? '#D4D4D4' : (i === 1 ? 'transparent' : (first[i] || pattern[(i - 2) % pattern.length])),
        past: i === 0,
      })
    }
    return {
      weekDays: days,
      selIdx: 1, /* 默认选中今日（8/8） */
      slotCache: {}, /* 各日开关状态，切日保留 */
      slots: [
        { time: '09:00-11:00', state: '已占用 · 王浩 · 亲子写真（订单控制，不可手动关）', on: false, locked: true },
        { time: '11:00-14:00', on: true },
        { time: '14:00-16:00', on: false },
        { time: '16:00-18:00', on: true },
      ],
    }
  },
  computed: {
    selNote() {
      const d = this.weekDays[this.selIdx]
      return `${d.m}月${d.dom}日 · 周${d.w} · 时段模板 4 个时段`
    },
    /* 非锁定时段全部关闭 → 按钮切「开放全天」 */
    allOff() {
      const open = this.slots.filter((s) => !s.locked)
      return open.length > 0 && open.every((s) => !s.on)
    },
  },
  methods: {
    /* 红点日=有订单占用（首行锁定），其余默认全部可约 */
    genSlots(d) {
      const hasOrder = d.dot === '#FF8181'
      return [
        { time: '09:00-11:00', state: hasOrder ? '已占用 · 订单控制，不可手动关' : '可约', on: !hasOrder, locked: hasOrder },
        { time: '11:00-14:00', on: true },
        { time: '14:00-16:00', on: !hasOrder },
        { time: '16:00-18:00', on: true },
      ]
    },
    pickDay(i) {
      if (this.weekDays[i].past || this.selIdx === i) return
      /* 当前日开关状态入缓存，恢复/生成目标日 */
      this.$set(this.slotCache, this.selIdx, JSON.parse(JSON.stringify(this.slots)))
      this.selIdx = i
      this.slots = this.slotCache[i] || this.genSlots(this.weekDays[i])
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/schedule/index' }) })
    },
    toggleAll() {
      const open = this.allOff
      this.slots.forEach((s) => { if (!s.locked) s.on = open })
      uni.showToast({ title: open ? '已开放全天可约时段（演示）' : '已关闭全部可约时段（演示）', icon: 'none' })
    },
    reschedule() {
      uni.navigateTo({ url: '/pages/schedule/reschedule' })
    },
    contact() {
      uni.showToast({ title: '联系客户（演示）', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-scm {
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

  &__weekbar {
    margin: 20rpx 0 0 32rpx; /* 稿 @(16,114) 左 16，右侧随滑动出血 */
    white-space: nowrap;
    &::-webkit-scrollbar { display: none; }
  }
  /* 稿 380 宽：8 格 88rpx + 8rpx 间隙，末格出屏 → scroll-x */
  &__weekbar-inner {
    display: inline-flex;
    gap: 8rpx;
  }
  &__wday {
    flex: none;
    width: 88rpx;
    box-sizing: border-box;
    background-color: $white;
    border-radius: 12rpx;
    padding: 10rpx 0 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    &--on { background-color: #121212; }
    &--dim .page-scm__wday-head { color: #999999; } /* 稿：过去格(7) 星期头与普通格同为 #999999，仅今(8) 用 #CCC */
  }
  &__wday-head { font-size: 22rpx; font-weight: 500; color: #999999; }
  &__wday--on .page-scm__wday-head { color: #CCCCCC; }
  &__wday-num {
    font-size: 28rpx;
    font-weight: 700;
    color: #151617;
    font-family: $font-family-num;
    &--on { color: #FFFFFF; }
  }
  &__wdot { width: 12rpx; height: 12rpx; border-radius: 50%; margin-top: 6rpx; }

  &__sec-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 40rpx 36rpx 0;
  }
  &__sec {
    display: block;
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
    &--gap { margin-top: 40rpx; } /* 稿：时段开关 @200（周条底 180 + 20） */
  }
  &__sec-note { font-size: 24rpx; font-weight: 500; color: #999999; }

  &__card {
    margin: 20rpx 32rpx 0;
    padding: 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__slot {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 34rpx 32rpx; /* 稿：行高 79（内容 45 + 上下 17） */
    &--line { border-top: 1rpx solid rgba(21, 22, 24, 0.09); }
  }
  &__slot-main { flex: 1; min-width: 0; }
  &__slot-time {
    display: block;
    font-size: 30rpx;
    font-weight: 700;
    color: #333333;
    font-family: $font-family-num;
    &--dim { color: #747981; }
  }
  &__slot-state {
    display: block;
    margin-top: 4rpx;
    font-size: 24rpx;
    font-weight: 500;
    color: #999999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__toggle {
    box-sizing: border-box;
    width: 100rpx;
    height: 56rpx;
    border-radius: 999rpx;
    background-color: #D9D9D9;
    padding: 4rpx;
    flex-shrink: 0;
    transition: background-color 0.15s ease;
    &--on { background-color: #00B972; }
    &--locked { opacity: 0.6; }
  }
  &__toggle-dot {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background-color: #FFFFFF;
    transition: transform 0.15s ease;
    &--on { transform: translateX(44rpx); }
  }
  &__close-all {
    margin: 0 32rpx; /* 稿：紧接开关行，卡底即收尾 */
    height: 88rpx;
    border-radius: 999rpx; /* 胶囊（稿内黑钮均为全圆角） */
    background-color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }

  &__order {
    margin: 20rpx 28rpx 0 36rpx; /* 稿：订单卡 343 @18,668 */
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 28rpx 34rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__order-head { display: flex; align-items: center; justify-content: space-between; }
  &__order-time {
    font-size: 32rpx;
    font-weight: 700;
    color: #151617;
    font-family: $font-family-num;
    width: max-content;
  }
  &__badge {
    background-color: #DCFCE7;
    border-radius: 999rpx;
    padding: 2rpx 16rpx 4rpx;
    text { font-size: 22rpx; font-weight: 500; color: #20845C; }
  }
  &__order-mid { display: flex; align-items: baseline; gap: 16rpx; margin-top: 16rpx; }
  &__order-name { font-size: 36rpx; font-weight: 700; color: #171819; }
  &__order-place { font-size: 26rpx; color: #666666; }
  &__order-btns {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
  }
  &__obtn {
    flex: 1;
    height: 88rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; }
    &--ghost { background-color: $white; border: 1rpx solid rgba(21, 22, 24, 0.09); text { color: #666666; } }
    &--dark { background-color: #121212; text { color: #FFFFFF; } }
  }

  &__tip {
    display: flex;
    align-items: flex-start;
    gap: 14rpx;
    margin: 20rpx 32rpx 0;
    background-color: #E6E7EB;
    border-radius: 28rpx;
    padding: 26rpx 30rpx;
  }
  &__tip-text { flex: 1; font-size: 24rpx; line-height: 34rpx; color: #666666; }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
