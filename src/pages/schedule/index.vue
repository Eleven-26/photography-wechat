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
        <text class="page-sc__day">{{ todayLabel }}</text>
        <view class="page-sc__count"><text>{{ todayShoots.length }}场拍摄</text></view>
      </view>
      <view
        v-for="it in todayShoots"
        :key="it.id"
        class="page-sc__shoot pressable"
        @click="openOrder(it)"
      >
        <view class="page-sc__shoot-head">
          <text class="page-sc__shoot-time">{{ it.timeText }}</text>
          <view class="page-sc__badge" :class="'page-sc__badge--' + it.tone"><text>{{ it.badge }}</text></view>
        </view>
        <text class="page-sc__shoot-name">{{ it.name }}</text>
        <text class="page-sc__shoot-place">{{ it.place }}</text>
        <view class="page-sc__shoot-btns">
          <view class="page-sc__sbtn page-sc__sbtn--ghost pressable" @click.stop="nav(it)"><text>导航</text></view>
          <view class="page-sc__sbtn page-sc__sbtn--dark pressable" @click.stop="contact(it)"><text>联系客户</text></view>
        </view>
      </view>
      <AppEmpty v-if="!todayShoots.length" text="今天没有拍摄安排" />

      <template v-if="todayIdle.length">
        <view class="page-sc__tip">
          <AppIcon name="info-gray-sm" :size="13" />
          <text class="page-sc__tip-text">今天还有 {{ todayIdle.length }} 段空闲 · 可约时段在「档期管理」里调整</text>
        </view>
        <text class="page-sc__sec">空闲时段</text>
        <view v-for="(t, i) in todayIdle" :key="i" class="page-sc__idle">
          <view class="page-sc__idle-main">
            <text class="page-sc__idle-t1">{{ t.range }} 空闲</text>
            <text class="page-sc__idle-t2">可临时接单或处理后期</text>
          </view>
          <view class="page-sc__badge page-sc__badge--free"><text>可约</text></view>
        </view>
      </template>
    </template>

    <!-- ======== 本周 ======== -->
    <template v-if="tab === 'week'">
      <text class="page-sc__day page-sc__day--top">{{ weekRangeLabel }}</text>
      <!-- 周历条：7 格，选中黑块，下方状态点；点选联动当日任务 -->
      <view class="page-sc__weekbar">
        <view
          v-for="(d, i) in weekDays"
          :key="d.date"
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
      <template v-for="it in selWeekItems" :key="it.key">
        <view v-if="it.type === 'shoot'" class="page-sc__shoot page-sc__shoot--slim pressable" @click="openOrder(it)">
          <view class="page-sc__shoot-head">
            <text class="page-sc__shoot-time">{{ it.timeText }}</text>
            <view class="page-sc__badge" :class="'page-sc__badge--' + it.tone"><text>{{ it.badge }}</text></view>
          </view>
          <text class="page-sc__shoot-name">{{ it.name }}</text>
          <text class="page-sc__shoot-place">{{ it.place }}</text>
        </view>
        <view v-else class="page-sc__idle page-sc__idle--slim">
          <view class="page-sc__idle-main">
            <text class="page-sc__idle-t1">{{ it.range }} 空闲</text>
            <text class="page-sc__idle-t2">可临时接单或处理后期</text>
          </view>
          <view class="page-sc__badge page-sc__badge--free"><text>可约</text></view>
        </view>
      </template>
      <AppEmpty v-if="!selWeekItems.length" text="当天暂无拍摄安排" />

      <text class="page-sc__sec">本周概况</text>
      <view class="page-sc__card">
        <view class="page-sc__kv">
          <text class="page-sc__kv-label">本周拍摄</text>
          <text class="page-sc__kv-val">{{ weekSummary.shoots }}</text>
        </view>
        <view class="page-sc__kv page-sc__kv--line">
          <text class="page-sc__kv-label">待修图任务</text>
          <text class="page-sc__kv-val">{{ weekSummary.retouch }}</text>
        </view>
        <view class="page-sc__kv">
          <text class="page-sc__kv-label">可约日期</text>
          <text class="page-sc__kv-val page-sc__kv-val--green">{{ weekSummary.free }}</text>
        </view>
      </view>
    </template>

    <!-- ======== 可约档期 ======== -->
    <template v-if="tab === 'avail'">
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
      <template v-if="selDay">
        <view class="page-sc__day-row page-sc__day-row--mt">
          <text class="page-sc__day page-sc__day--nomargin">{{ selLabel }}</text>
          <view class="page-sc__badge" :class="'page-sc__badge--' + selBadge.tone"><text>{{ selBadge.text }}</text></view>
        </view>
        <view v-if="selSlots.length" class="page-sc__slots">
          <view v-for="(s, i) in selSlots" :key="i" class="page-sc__slot" :class="'page-sc__slot--' + s.tone">
            <text>{{ s.range }}</text>
            <view v-if="s.tag" class="page-sc__slot-tag"><text>{{ s.tag }}</text></view>
          </view>
        </view>
        <AppEmpty v-else text="当天未开放可约时段" />
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
        <text class="page-sc__manage-sub">关闭特定日期或时段 · 同步到客户端站点预约页</text>
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
 *
 * 数据源（2026-09-14 接线）：
 *   /order/list        → 全部订单（今日/本周的拍摄卡；shoot_date + shoot_time + status）
 *   /schedule/list     → 档期锁 biz_calendar_block（start_date~end_date 区间查询），
 *                        用于「某天已被占用」与状态点/档态判定
 *   /slot-template/list→ 档期时段模板 biz_slot_template（按**星期几**开放的可约时段）
 *
 * ⚠️ 后端没有"某天可约/已关闭"这种按日期的开放表：可约性 = 模板（按周几）× 档期锁（按日期）。
 *    本页据此推导三种档态：可约（当天周几有模板且无锁）/ 部分可约（有锁但未占满）/
 *    已占或关闭（无模板，或模板时段全被锁）。
 * ⚠️ 拍摄卡的后端事实只有一个"状态"（enum.OrderStatus：2-待拍摄 3-拍摄中 4-精修中 5-待交付
 *    6-已完成 7-已取消）：稿内"即将开始/待开始"的细分是"当前时间 vs 拍摄时段"的展示层推导，
 *    本页按状态映射为「拍摄中 / 待开始 / 已取消」，不做无后端支撑的伪状态。
 */
import { getScheduleList, listSlotTemplates } from '@/api/schedule'
import { getOrderList } from '@/api/order'
import { contactPhotographer } from '@/utils/format'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
/** 订单状态 → 徽章色调 / 文案（enum.OrderStatus） */
const ORDER_TONE = { 1: 'wait', 2: 'soon', 3: 'soon', 4: 'wait', 5: 'wait', 6: 'wait', 7: 'wait' }
const ORDER_BADGE = { 1: '待定金', 2: '待开始', 3: '拍摄中', 4: '精修中', 5: '待交付', 6: '已完成', 7: '已取消' }
/** 生效中的订单状态（已取消不计入日程） */
const ACTIVE_STATUS = [1, 2, 3, 4, 5, 6]
const DOT_OK = '#76D596'
const DOT_PART = '#FFDA08'
const DOT_OFF = '#FF8181'
const DOT_TODAY = '#FFFFFF'

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hm(t) {
  return String(t || '').slice(0, 5)
}

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
      orders: [],
      blocks: [],
      templates: [],
      weekHeads: ['一', '二', '三', '四', '五', '六', '日'],
      selWeekIdx: 0,
      monthOffset: 0,
      selDay: null,
      baseYear: 0,
      baseMonth: 0,
      loading: false,
    }
  },
  computed: {
    today() {
      return new Date()
    },
    todayStr() {
      return ymd(this.today)
    },
    todayLabel() {
      const d = this.today
      return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK[d.getDay()]} · 今日`
    },
    /** 当天有排期的订单（已取消不计） */
    todayShoots() {
      return this.shootsOn(this.todayStr)
    },
    /** 今天空闲时段（模板时段 - 已锁时段） */
    todayIdle() {
      return this.idleRanges(this.todayStr)
    },
    /** 本周一 */
    weekStart() {
      const d = new Date(this.today)
      const wd = d.getDay() || 7
      d.setDate(d.getDate() - wd + 1)
      return d
    },
    weekDays() {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(this.weekStart)
        d.setDate(d.getDate() + i)
        const date = ymd(d)
        return { w: WEEK[d.getDay()], n: String(d.getDate()), date, dot: this.dotFor(date) }
      })
    },
    weekRangeLabel() {
      const s = this.weekStart
      const e = new Date(s)
      e.setDate(e.getDate() + 6)
      return `${s.getMonth() + 1}月${s.getDate()}日 - ${e.getMonth() + 1}月${e.getDate()}日`
    },
    selWeekDate() {
      return (this.weekDays[this.selWeekIdx] || {}).date || this.todayStr
    },
    selWeekLabel() {
      const d = this.weekDays[this.selWeekIdx]
      if (!d) return ''
      return `${Number(d.date.slice(5, 7))}月${Number(d.date.slice(8, 10))}日 周${d.w}${d.date === this.todayStr ? ' · 今日' : ''}`
    },
    /** 选中日的任务卡（拍摄卡 + 空闲卡） */
    selWeekItems() {
      const date = this.selWeekDate
      const shoots = this.shootsOn(date).map((it) => ({ ...it, type: 'shoot', key: 's' + it.id }))
      const idles = this.idleRanges(date).map((t, i) => ({ ...t, type: 'idle', key: 'i' + i }))
      return [...shoots, ...idles]
    },
    weekSummary() {
      const dates = this.weekDays.map((d) => d.date)
      const inWeek = this.orders.filter((o) => o.shoot_date && dates.includes(o.shoot_date) && o.status !== 7)
      const doneCount = inWeek.filter((o) => o.status === 6).length
      const retouch = this.orders.filter((o) => o.status === 4).length
      const free = dates
        .filter((d) => d >= this.todayStr && this.dotFor(d) === DOT_OK)
        .slice(0, 3)
        .map((d) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`)
      return {
        shoots: inWeek.length ? `${inWeek.length} 场 · ${doneCount} 场已完成` : '暂无安排',
        retouch: retouch ? `${retouch} 个 · 精修中订单` : '暂无',
        free: free.length ? free.join(' · ') : '暂无',
      }
    },
    monthDate() {
      return new Date(this.baseYear, this.baseMonth + this.monthOffset, 1)
    },
    monthLabel() {
      return `${this.monthDate.getFullYear()}年${this.monthDate.getMonth() + 1}月`
    },
    availCells() {
      const first = this.monthDate
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
      const lead = (first.getDay() + 6) % 7 // 周一为首列
      const cells = Array(lead).fill(null)
      for (let d = 1; d <= days; d++) {
        const date = ymd(new Date(first.getFullYear(), first.getMonth(), d))
        cells.push({ day: d, date, tone: this.toneFor(date) })
      }
      return cells
    },
    selDate() {
      if (!this.selDay) return ''
      return ymd(new Date(this.monthDate.getFullYear(), this.monthDate.getMonth(), this.selDay))
    },
    selLabel() {
      if (!this.selDate) return ''
      const d = new Date(this.monthDate.getFullYear(), this.monthDate.getMonth(), this.selDay)
      return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK[d.getDay()]}`
    },
    selTone() {
      return this.selDate ? this.toneFor(this.selDate) : 'plain'
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
    /** 选中日时段 chips（模板时段 × 档期锁） */
    selSlots() {
      if (!this.selDate) return []
      const locked = this.blocksOn(this.selDate)
      return this.templatesFor(this.selDate).map((t) => {
        const range = `${hm(t.start_time)}-${hm(t.end_time)}`
        const hit = locked.find((b) => b.time_range === range)
        return hit ? { range, tone: 'off', tag: '订单' } : { range, tone: 'ok' }
      })
    },
  },
  onLoad() {
    const now = new Date()
    this.baseYear = now.getFullYear()
    this.baseMonth = now.getMonth()
    this.selWeekIdx = (now.getDay() || 7) - 1
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      this.loading = true
      // 档期锁：拉一个足够宽的区间（本月前后各 3 个月）覆盖月历翻页
      const start = ymd(new Date(this.baseYear, this.baseMonth - 3, 1))
      const end = ymd(new Date(this.baseYear, this.baseMonth + 4, 0))
      const [ordersRes, blocksRes, tplRes] = await Promise.all([
        getOrderList({ page: 1, page_size: 100 }).catch(() => null),
        getScheduleList({ start_date: start, end_date: end }).catch(() => null),
        listSlotTemplates().catch(() => null),
      ])
      const orders = ordersRes && ordersRes.list ? ordersRes.list : Array.isArray(ordersRes) ? ordersRes : []
      this.orders = orders.filter((o) => o.shoot_date)
      this.blocks = Array.isArray(blocksRes) ? blocksRes : []
      this.templates = (Array.isArray(tplRes) ? tplRes : []).filter((t) => t.status !== 0)
      this.loading = false
    },
    /** 指定日期的拍摄卡 */
    shootsOn(date) {
      return this.orders
        .filter((o) => o.shoot_date === date && ACTIVE_STATUS.includes(o.status))
        .map((o) => ({
          id: o.id,
          orderId: o.id,
          timeText: o.shoot_time ? String(o.shoot_time) : '全天',
          badge: ORDER_BADGE[o.status] || '进行中',
          tone: ORDER_TONE[o.status] || 'wait',
          name: [o.customer_name, o.package_name].filter(Boolean).join(' · ') || o.code || '未命名订单',
          place: [o.shoot_address, o.people_count].filter(Boolean).join(' · ') || '地点待定',
          mobile: o.customer_mobile || '',
          address: o.shoot_address || '',
        }))
        .sort((a, b) => String(a.timeText).localeCompare(String(b.timeText)))
    },
    /** 指定日期的档期锁 */
    blocksOn(date) {
      return this.blocks.filter((b) => b.date === date)
    },
    /** 指定日期的可用模板（按星期几） */
    templatesFor(date) {
      if (!date) return []
      const wd = new Date(`${date}T00:00:00`).getDay()
      return this.templates.filter((t) => Number(t.weekday) === wd)
    },
    /** 模板时段 - 已锁时段 = 空闲时段 */
    idleRanges(date) {
      const locked = this.blocksOn(date)
      return this.templatesFor(date)
        .filter((t) => !locked.some((b) => b.time_range === `${hm(t.start_time)}-${hm(t.end_time)}`))
        .map((t) => ({ range: `${hm(t.start_time)}-${hm(t.end_time)}` }))
        .sort((a, b) => a.range.localeCompare(b.range))
    },
    /** 周历/月历状态点与档态 */
    dotFor(date) {
      if (date === this.todayStr) return DOT_TODAY
      if (date < this.todayStr) return '#C3C3C3'
      const tone = this.toneFor(date)
      if (tone === 'ok') return DOT_OK
      if (tone === 'part') return DOT_PART
      if (tone === 'off') return DOT_OFF
      return 'transparent'
    },
    toneFor(date) {
      if (!date) return 'plain'
      if (date < this.todayStr) return 'plain'
      if (date === this.todayStr) return 'today'
      const tpls = this.templatesFor(date)
      if (!tpls.length) return 'off'
      const locked = this.blocksOn(date)
      if (!locked.length) return 'ok'
      return locked.length >= tpls.length ? 'off' : 'part'
    },
    goManage() {
      uni.navigateTo({ url: '/pages/schedule/manage' })
    },
    prevMonth() {
      this.monthOffset -= 1
      this.selDay = null
    },
    nextMonth() {
      this.monthOffset += 1
      this.selDay = null
    },
    pickDay(c) {
      if (!c) return
      this.selDay = c.day
    },
    openOrder(it) {
      if (!it.orderId) return
      uni.navigateTo({ url: `/pages/order/detail?id=${it.orderId}` })
    },
    /** 导航：无经纬度可用，退化为复制地址（不伪造 map 跳转） */
    nav(it) {
      if (!it.address) return uni.showToast({ title: '暂无拍摄地址', icon: 'none' })
      uni.setClipboardData({
        data: it.address,
        success: () => uni.showToast({ title: '地址已复制', icon: 'none' }),
      })
    },
    contact(it) {
      contactPhotographer(it.mobile)
    },
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
