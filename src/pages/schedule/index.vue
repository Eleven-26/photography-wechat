<template>
  <view class="page-sc page-wrap">
    <view class="status-bar" />
    <!-- Header：44 白圆钮（日历）+ 「日程」17 Bold 居中（SC01 1:3960 实测） -->
    <view class="page-sc__header">
      <view class="page-sc__rbtn pressable" @click="goManage">
        <AppIcon name="calendar-dark" :size="20" />
      </view>
      <text class="page-sc__title">日程</text>
    </view>

    <!-- 分段 Tab：今日 / 本周 / 可约档期（SC01-03 三板同构一页化） -->
    <view class="page-sc__tabs">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="page-sc__tab pressable"
        :class="{ 'page-sc__tab--on': tab === t.key }"
        @click="tab = t.key"
      >
        <text class="page-sc__tab-text">{{ t.label }}</text>
      </view>
    </view>

    <!-- ======== 今日 ======== -->
    <template v-if="tab === 'today'">
      <view class="page-sc__day-row">
        <text class="page-sc__day">8月8日 周六 · 今日</text>
        <view class="page-sc__count"><text>2场拍摄</text></view>
      </view>
      <!-- 拍摄卡 1：即将开始（1:28 实测 343×172 r16、双钮 导航/开始拍摄） -->
      <view class="page-sc__shoot">
        <view class="page-sc__shoot-head">
          <text class="page-sc__shoot-time">09:00-11:00</text>
          <view class="page-sc__badge page-sc__badge--soon"><text>即将开始</text></view>
        </view>
        <text class="page-sc__shoot-name">陈雨 · 家庭纪念写真</text>
        <text class="page-sc__shoot-place">越秀公园 · 2.5h</text>
        <view class="page-sc__shoot-btns">
          <view class="page-sc__sbtn page-sc__sbtn--ghost pressable" @click="nav"><text>导航</text></view>
          <view class="page-sc__sbtn page-sc__sbtn--dark pressable" @click="start"><text>开始拍摄</text></view>
        </view>
      </view>
      <!-- 拍摄卡 2：待开始（1:45 实测、单钮 联系客户） -->
      <view class="page-sc__shoot">
        <view class="page-sc__shoot-head">
          <text class="page-sc__shoot-time">14:00-16:00</text>
          <view class="page-sc__badge page-sc__badge--wait"><text>待开始</text></view>
        </view>
        <text class="page-sc__shoot-name">蓝桥 · 家庭纪念写真</text>
        <text class="page-sc__shoot-place">越秀公园 · 2.5h</text>
        <view class="page-sc__shoot-btns">
          <view class="page-sc__sbtn page-sc__sbtn--ghost page-sc__sbtn--wide pressable" @click="contact"><text>联系客户</text></view>
        </view>
      </view>
      <!-- 转场提示（1:59 实测 343×61 #E6E7EB r14） -->
      <view class="page-sc__tip">
        <AppIcon name="info-gray-sm" :size="13" />
        <text class="page-sc__tip-text">两场间隔 1.5h · 越秀公园→天河工作室转场约 40 分钟，时间可控</text>
      </view>
      <text class="page-sc__sec">空闲时段</text>
      <!-- 空闲卡（1:65 实测 343×70） -->
      <view class="page-sc__idle">
        <view class="page-sc__idle-main">
          <text class="page-sc__idle-t1">16:00 - 18:00 空闲</text>
          <text class="page-sc__idle-t2">可临时接单或处理后期</text>
        </view>
        <view class="page-sc__badge page-sc__badge--free"><text>可约</text></view>
      </view>
    </template>

    <!-- ======== 本周 ======== -->
    <template v-if="tab === 'week'">
      <text class="page-sc__day page-sc__day--top">8月5日 - 8月11日</text>
      <!-- 周历条（1:24 Group 117 实测 343×80：7 格 40×60，选中黑块，下方状态点；可点选联动当日任务） -->
      <view class="page-sc__weekbar">
        <view
          v-for="(d, i) in weekDays"
          :key="d.n"
          class="page-sc__wday pressable"
          :class="{ 'page-sc__wday--on': selWeekIdx === i }"
          @click="selWeekIdx = i"
        >
          <text class="page-sc__wday-head" :class="{ 'page-sc__wday-head--on': selWeekIdx === i }">{{ d.w }}</text>
          <text class="page-sc__wday-num" :class="{ 'page-sc__wday-num--on': selWeekIdx === i }">{{ d.n }}</text>
          <view class="page-sc__wdot" :style="{ backgroundColor: d.dot }" />
        </view>
      </view>
      <text class="page-sc__day">{{ selWeekLabel }}</text>
      <!-- 当日任务卡：随周历点选联动（数据驱动，今日=稿原样） -->
      <template v-for="(it, i) in selWeekSchedule" :key="i">
        <view v-if="it.type === 'shoot'" class="page-sc__shoot page-sc__shoot--slim">
          <view class="page-sc__shoot-head">
            <text class="page-sc__shoot-time">{{ it.time }}</text>
            <view class="page-sc__badge" :class="'page-sc__badge--' + it.tone"><text>{{ it.badge }}</text></view>
          </view>
          <text class="page-sc__shoot-name">{{ it.name }}</text>
          <text class="page-sc__shoot-place">{{ it.place }}</text>
        </view>
        <view v-else class="page-sc__idle page-sc__idle--slim">
          <view class="page-sc__idle-main">
            <text class="page-sc__idle-t1">{{ it.time }}</text>
            <text class="page-sc__idle-t2">{{ it.desc }}</text>
          </view>
          <view class="page-sc__badge page-sc__badge--free"><text>可约</text></view>
        </view>
      </template>
      <!-- 本周概况（1:81 实测：三行 kv，可约日期绿字） -->
      <text class="page-sc__sec">本周概况</text>
      <view class="page-sc__card">
        <view class="page-sc__kv">
          <text class="page-sc__kv-label">本周拍摄</text>
          <text class="page-sc__kv-val">5 场 · 2 场已完成</text>
        </view>
        <view class="page-sc__kv page-sc__kv--line">
          <text class="page-sc__kv-label">待修图任务</text>
          <text class="page-sc__kv-val">1 个 · 婚礼跟拍 24 张</text>
        </view>
        <view class="page-sc__kv">
          <text class="page-sc__kv-label">可约日期</text>
          <text class="page-sc__kv-val page-sc__kv-val--green">8/10 · 8/16 · 8/23</text>
        </view>
      </view>
    </template>

    <!-- ======== 可约档期 ======== -->
    <template v-if="tab === 'avail'">
      <!-- 月历（1:22 Group 123 实测：月份头+星期头+40×40 格+图例） -->
      <view class="page-sc__cal">
        <view class="page-sc__month-nav">
          <view class="page-sc__month-btn pressable" @click="prevMonth"><AppIcon name="chevron-left-gray" :size="20" /></view>
          <text class="page-sc__month">{{ monthLabel }}</text>
          <view class="page-sc__month-btn pressable" @click="nextMonth"><AppIcon name="chevron-right-gray" :size="20" /></view>
        </view>
        <view class="page-sc__week-heads">
          <text v-for="w in weekHeads" :key="w">{{ w }}</text>
        </view>
        <view class="page-sc__grid">
          <view
            v-for="(c, i) in availCells"
            :key="i"
            class="page-sc__cell"
            :class="[c ? 'page-sc__cell--' + c.tone : '', c && selDay === c.day ? 'page-sc__cell--sel' : '']"
            @click="pickDay(c)"
          >
            <text v-if="c">{{ c.day }}</text>
          </view>
        </view>
        <view class="page-sc__legend">
          <view class="page-sc__lg"><view class="page-sc__lg-dot" style="background-color:#76D596" /><text>可约</text></view>
          <view class="page-sc__lg"><view class="page-sc__lg-dot" style="background-color:#FFDA08" /><text>部分可约</text></view>
          <view class="page-sc__lg"><view class="page-sc__lg-dot" style="background-color:#FF8181" /><text>已占/关闭</text></view>
          <view class="page-sc__lg"><view class="page-sc__lg-dot" style="background-color:#D4D4D4" /><text>今日</text></view>
          <view class="page-sc__lg"><view class="page-sc__lg-dot page-sc__lg-dot--sel" /><text>选中</text></view>
        </view>
      </view>
      <!-- 选中日时段（点击月历联动：标题+档态徽章+时段 chips，红 chip 带「订单」角标） -->
      <template v-if="selDay">
        <view class="page-sc__day-row page-sc__day-row--mt">
          <text class="page-sc__day page-sc__day--nomargin">{{ selLabel }}</text>
          <view class="page-sc__badge" :class="'page-sc__badge--' + selBadge.tone"><text>{{ selBadge.text }}</text></view>
        </view>
        <view class="page-sc__slots">
          <view
            v-for="(s, i) in selSlots"
            :key="i"
            class="page-sc__slot"
            :class="'page-sc__slot--' + s.tone"
          >
            <text>{{ s.range }}</text>
            <view v-if="s.tag" class="page-sc__slot-tag"><text>{{ s.tag }}</text></view>
          </view>
        </view>
      </template>
      <view v-else class="page-sc__day-row page-sc__day-row--mt">
        <text class="page-sc__day page-sc__day--nomargin">点击日期查看当天可约时段</text>
      </view>
    </template>

    <!-- 档期管理入口（SC01/SC03 共有，1:72 实测） -->
    <view class="page-sc__manage pressable" @click="goManage">
      <AppIcon name="calendar-dark-md" :size="20" />
      <view class="page-sc__manage-main">
        <text class="page-sc__manage-title">档期管理</text>
        <text class="page-sc__manage-sub">关闭特定日期或时段 · 同步到 H5 预约页</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <AppTabBar active="schedule" />
    <view class="page-sc__safe" />
  </view>
</template>

<script>
/**
 * SC01-03 日程（稿三板同构 tab 页一页化：1:3960 今日 / 1:4047 本周 / 1:4152 可约档期）
 * 今日：拍摄卡（导航/开始拍摄、联系客户）+ 转场提示 + 空闲时段。
 * 本周：周历条（今日黑块+状态点）+ 当日卡 + 本周概况 kv。
 * 可约档期：月历（40×40 格、图例五色）+ 选中日时段 chips（红 chip 订单角标）。
 * 周历状态点实测：灰 #C3C3C3 已过 / 金 #B66E00 部分 / 绿 #20845C 可约 / 白 今日。
 */
export default {
  name: 'ScheduleIndex',
  data() {
    return {
      tab: 'today',
      tabs: [
        { key: 'today', label: '今日' },
        { key: 'week', label: '本周' },
        { key: 'avail', label: '可约档期' },
      ],
      weekDays: [
        { w: '一', n: '5', dot: '#C3C3C3' },
        { w: '二', n: '6', dot: '#C2C2C2' },
        { w: '三', n: '7', dot: 'transparent' }, /* 稿 7/11 无状态点 */
        { w: '四', n: '8', dot: '#FFFFFF', today: true },
        { w: '五', n: '9', dot: '#B66E00' },
        { w: '六', n: '10', dot: '#20845C' },
        { w: '日', n: '11', dot: 'transparent' },
      ],
      selWeekIdx: 3, /* 默认选中今日（周四 8） */
      /* 周历点选联动的当日任务演示数据（今日=稿原样；过去日=已完成，未来日=待开始/空闲） */
      weekSchedules: [
        [
          { type: 'shoot', time: '09:00-11:00', badge: '已完成', tone: 'wait', name: '陈雨 · 家庭纪念写真', place: '越秀公园 · 2.5h' },
          { type: 'shoot', time: '14:00-16:00', badge: '已完成', tone: 'wait', name: '王浩 · 结婚登记照', place: '天河工作室 · 1.5h' },
        ],
        [
          { type: 'shoot', time: '10:00-12:00', badge: '已完成', tone: 'wait', name: '林七月 · 亲子写真', place: '流花湖公园 · 2h' },
        ],
        [
          { type: 'shoot', time: '09:00-12:00', badge: '已完成', tone: 'wait', name: '孟川 · 商务形象照', place: '天河工作室 · 3h' },
          { type: 'idle', time: '14:00 - 18:00 空闲', desc: '可临时接单或处理后期' },
        ],
        [
          { type: 'shoot', time: '09:00-11:00', badge: '即将开始', tone: 'soon', name: '陈雨 · 家庭纪念写真', place: '越秀公园 · 2.5h' },
          { type: 'shoot', time: '14:00-16:00', badge: '待开始', tone: 'wait', name: '蓝桥 · 商务形象', place: '越秀公园 · 2.5h' },
          { type: 'idle', time: '16:00 - 18:00 空闲', desc: '可临时接单或处理后期' },
        ],
        [
          { type: 'shoot', time: '10:00-12:00', badge: '待开始', tone: 'wait', name: '蓝桥 · 商务形象照', place: '天河工作室 · 2h' },
          { type: 'idle', time: '14:00 - 18:00 空闲', desc: '可临时接单或处理后期' },
        ],
        [
          { type: 'idle', time: '09:00 - 18:00 空闲', desc: '全天空闲 · 可接单或约拍' },
        ],
        [
          { type: 'idle', time: '09:00 - 18:00 空闲', desc: '全天空闲 · 可接单或约拍' },
        ],
      ],
      monthOffset: 0,
      selDay: 17, /* 默认选中 17（与稿 SC03 时段卡一致），切月清空 */
      weekHeads: ['一', '二', '三', '四', '五', '六', '日'],
      /* SC03 实测 8 月格色（稿 1:50-92）：1,4,6 红 / 9,17 黄 / 10,16,23?,30 绿 / 12 灰今日（推导）/ 23 红已占 */
      availTones: { 1: 'off', 4: 'off', 6: 'off', 9: 'part', 10: 'ok', 12: 'today', 16: 'ok', 17: 'part', 23: 'off', 30: 'ok' },
    }
  },
  computed: {
    /* 周历选中日标题：8月8日 周四 · 今日 */
    selWeekLabel() {
      const d = this.weekDays[this.selWeekIdx]
      return `8月${d.n}日 周${d.w}${this.selWeekIdx === 3 ? ' · 今日' : ''}`
    },
    /* 周历选中日任务卡 */
    selWeekSchedule() {
      return this.weekSchedules[this.selWeekIdx] || []
    },
    monthLabel() {
      const m = (8 + this.monthOffset + 12) % 12 || 12
      const y = 2026 + Math.floor((8 - 1 + this.monthOffset) / 12)
      return `${y}年${m}月`
    },
    availCells() {
      const m = (8 + this.monthOffset + 12) % 12 || 12
      const days = new Date(2026, m, 0).getDate()
      const first = new Date(2026, m - 1, 1).getDay() || 7
      const cells = Array(first - 1).fill(null)
      for (let d = 1; d <= days; d++) {
        cells.push({ day: d, tone: this.monthOffset === 0 ? (this.availTones[d] || 'plain') : 'plain' })
      }
      return cells
    },
    /* 选中日标题：8月17日 周一（星期几实算，稿「周二」系笔误不沿用） */
    selLabel() {
      const m = (8 + this.monthOffset + 12) % 12 || 12
      const w = '日一二三四五六'[new Date(2026, m - 1, this.selDay).getDay()]
      return `${m}月${this.selDay}日 周${w}`
    },
    selTone() {
      return this.monthOffset === 0 ? (this.availTones[this.selDay] || 'plain') : 'plain'
    },
    selBadge() {
      const map = {
        ok: { tone: 'free', text: '可约' },
        part: { tone: 'part', text: '部分可约' },
        off: { tone: 'wait', text: '已占 / 关闭' },
        today: { tone: 'wait', text: '今日' },
        plain: { tone: 'wait', text: '未开放' },
      }
      return map[this.selTone]
    },
    /* 选中日时段 chips：17 为稿原样数据，其余按档态生成演示 */
    selSlots() {
      if (this.monthOffset === 0 && this.selDay === 17) {
        return [
          { range: '09:00-11:00', tone: 'off', tag: '订单' },
          { range: '11:00-14:00', tone: 'ok' },
          { range: '14:00-16:00', tone: 'ok' },
          { range: '16:00-18:00', tone: 'plain' },
        ]
      }
      const t = this.selTone
      if (t === 'ok') {
        return [
          { range: '09:00-11:00', tone: 'ok' },
          { range: '11:00-14:00', tone: 'ok' },
          { range: '14:00-16:00', tone: 'ok' },
          { range: '16:00-18:00', tone: 'ok' },
        ]
      }
      if (t === 'part') {
        return [
          { range: '09:00-11:00', tone: 'off', tag: '订单' },
          { range: '11:00-14:00', tone: 'ok' },
          { range: '14:00-16:00', tone: 'plain' },
          { range: '16:00-18:00', tone: 'plain' },
        ]
      }
      if (t === 'off') {
        return [
          { range: '09:00-11:00', tone: 'off' },
          { range: '11:00-14:00', tone: 'off' },
          { range: '14:00-16:00', tone: 'off' },
          { range: '16:00-18:00', tone: 'off' },
        ]
      }
      return [
        { range: '09:00-11:00', tone: 'plain' },
        { range: '11:00-14:00', tone: 'plain' },
        { range: '14:00-16:00', tone: 'plain' },
        { range: '16:00-18:00', tone: 'plain' },
      ]
    },
  },
  methods: {
    goManage() {
      uni.navigateTo({ url: '/pages/schedule/manage' })
    },
    prevMonth() { this.monthOffset -= 1; this.selDay = null },
    nextMonth() { this.monthOffset += 1; this.selDay = null },
    pickDay(c) {
      if (!c) return
      this.selDay = c.day
    },
    nav() { uni.showToast({ title: '唤起地图导航（演示）', icon: 'none' }) },
    start() { uni.navigateTo({ url: '/pages/order/detail' }) },
    contact() { uni.showToast({ title: '联系客户（演示）', icon: 'none' }) },
  },
}
</script>

<style lang="scss" scoped>
.page-sc {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
  }
  &__rbtn {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: $white;
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
    border-radius: 40rpx;
    padding: 4rpx;
  }
  &__tab {
    flex: 1;
    height: 80rpx;
    border-radius: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    &--on { background-color: #121212; }
  }
  &__tab-text { font-size: 26rpx; color: #666666; }
  &__tab--on .page-sc__tab-text { color: #FFFFFF; font-weight: 700; }

  &__day-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 32rpx; /* 稿：日期行 @16 */
    &--mt { margin-top: 44rpx; } /* 稿：月历底 562 → 标签 584 */
    .page-sc__day { margin-left: 0; margin-right: 0; }
  }
  &__day {
    display: block;
    margin: 40rpx 36rpx 0; /* 稿：标签 @178（tabs 底 158 + 20） */
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
    &--nomargin { margin: 0; }
  }
  &__count {
    background-color: #E6E7EB;
    border-radius: 999rpx;
    padding: 2rpx 16rpx 4rpx;
    text { font-size: 22rpx; font-weight: 500; color: #151617; }
  }

  &__badge {
    border-radius: 999rpx;
    padding: 2rpx 16rpx 4rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; line-height: 32rpx; font-weight: 500; }
    &--soon { background-color: #FFF3D6; text { color: #B66E00; } }
    &--wait { background-color: #E6E7EB; text { color: #666666; } }
    &--free { background-color: #E5F6ED; text { color: #20845C; } }
    &--part { background-color: #FFF3D6; text { color: #B66E00; } }
  }

  &__shoot {
    box-sizing: border-box;
    margin: 28rpx 36rpx 0 28rpx; /* 稿：卡 343×172 @14,212（右缘 357） */
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 32rpx 34rpx 32rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    &--slim { padding-bottom: 32rpx; margin: 20rpx 32rpx 0; } /* 稿：SC02 卡 343×114 @16,338 */
  }
  &__shoot-head { display: flex; align-items: center; justify-content: space-between; }
  &__shoot-time {
    font-size: 32rpx;
    font-weight: 700;
    color: #151617;
    font-family: $font-family-num;
    width: max-content;
  }
  &__shoot-name {
    display: block;
    margin-top: 20rpx;
    font-size: 36rpx;
    line-height: 44rpx;
    font-weight: 700;
    color: #171819;
  }
  &__shoot-place { display: block; margin-top: 8rpx; font-size: 26rpx; color: #666666; }
  &__shoot-btns {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx; /* 稿：卡高 172 */
  }
  &__sbtn {
    flex: 1;
    height: 88rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; }
    &--ghost { background-color: $white; border: 1rpx solid rgba(21, 22, 24, 0.09); text { color: #666666; } }
    &--dark { background-color: #121212; text { color: #FFFFFF; } }
    &--wide { flex: none; width: 300rpx; }
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

  &__sec {
    display: block;
    margin: 40rpx 36rpx 0;
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
  }
  &__idle {
    display: flex;
    align-items: center;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 28rpx 32rpx;
    &--slim { padding: 24rpx 32rpx; }
  }
  &__idle-main { flex: 1; }
  &__idle-t1 { display: block; font-size: 26rpx; font-weight: 700; color: #333333; }
  &__idle-t2 { display: block; margin-top: 8rpx; font-size: 26rpx; color: #666666; }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
  }
  &__kv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 26rpx 32rpx;
    &--line { border-top: 1rpx solid rgba(21, 22, 24, 0.09); }
  }
  &__kv-label { font-size: 30rpx; color: #666666; }
  &__kv-val {
    font-size: 30rpx;
    color: #333333;
    &--green { color: #20845C; }
  }

  &__weekbar {
    display: flex;
    gap: 10rpx;
    margin: 20rpx 34rpx 0;
    background-color: $white;
    border-radius: 24rpx;
    padding: 20rpx 16rpx;
  }
  &__wday {
    flex: 1;
    border-radius: 12rpx;
    padding: 12rpx 0 14rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    &--on { background-color: #121212; }
  }
  &__wday-head { font-size: 22rpx; color: #999999; }
  &__wday--on .page-sc__wday-head { color: #CCCCCC; }
  &__wday-num { font-size: 26rpx; font-weight: 700; color: #151617; font-family: $font-family-num; }
  &__wday--on .page-sc__wday-num { color: #FFFFFF; }
  &__wdot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    margin-top: 4rpx;
  }

  /* 月历（SC03 实测：白卡 343、月份头、40×40 格） */
  &__cal {
    margin: 40rpx 32rpx 0; /* 稿：月历卡 @178（tabs 底 + 20） */
    background-color: $white;
    border-radius: 24rpx;
    padding: 24rpx 32rpx 28rpx;
  }
  &__month-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__month { font-size: 30rpx; font-weight: 700; color: #333333; }
  &__week-heads {
    display: flex;
    margin: 16rpx 0 8rpx;
    text { flex: 1; text-align: center; font-size: 24rpx; font-weight: 500; color: #999999; }
  }
  &__grid { display: flex; flex-wrap: wrap; gap: 10rpx; }
  &__cell {
    box-sizing: border-box;
    width: calc((100% - 60rpx) / 7);
    height: 82rpx; /* 稿：40×40 格 + 间距，6 行 → 卡高 384 */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    text { font-size: 26rpx; font-weight: 700; color: #151617; font-family: $font-family-num; }
    &--ok { background-color: #DCFCE7; text { color: #20845C; } }
    &--part { background-color: #FEF3C7; text { color: #B66E00; } }
    &--off { background-color: #FEE2E2; text { color: #D94B4B; } }
    &--today { background-color: #EBECEF; }
    &--sel { box-shadow: inset 0 0 0 4rpx #17181A; } /* 选中描边（叠加档态底色） */
  }
  &__legend {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-top: 24rpx;
    flex-wrap: wrap;
  }
  &__lg {
    display: flex;
    align-items: center;
    gap: 10rpx;
    text { font-size: 24rpx; color: #000000; }
  }
  &__lg-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    &--sel { background-color: $white; border: 1rpx solid #D4D4D4; }
  }

  /* 选中日时段 chips（SC03 实测） */
  &__slots {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 16rpx;
    padding: 24rpx; /* 稿：选中日时段卡 108 高 */
  }
  &__slot {
    position: relative;
    border-radius: 999rpx;
    padding: 14rpx 24rpx;
    text { font-size: 24rpx; font-weight: 500; line-height: 34rpx; }
    &--off { background-color: #FEE2E2; text { color: #D94B4B; } }
    &--ok { background-color: #DCFCE7; text { color: #20845C; } }
    &--plain { background-color: #F7F8FA; text { color: #333333; } }
  }
  &__slot-tag {
    position: absolute;
    top: -16rpx;
    right: 0;
    background-color: #D94B4B;
    border-radius: 8rpx;
    padding: 0 10rpx;
    text { font-size: 20rpx; color: #FFFFFF; line-height: 32rpx; }
  }

  &__manage {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin: 32rpx 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 30rpx 32rpx;
  }
  &__manage-main { flex: 1; min-width: 0; }
  &__manage-title { display: block; font-size: 30rpx; font-weight: 700; color: #151617; }
  &__manage-sub { display: block; margin-top: 4rpx; font-size: 24rpx; color: #747981; }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
