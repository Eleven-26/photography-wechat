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

    <!-- 日条：31 天（含昨日）横向滑动，今日黑块，底部状态点 -->
    <scroll-view class="page-scm__weekbar" scroll-x :show-scrollbar="false">
      <view class="page-scm__weekbar-inner">
        <view
          v-for="(d, i) in days"
          :key="d.date"
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

    <!-- 时段开关（标题+右侧说明 / 逐行 toggle + 关闭全天） -->
    <view class="page-scm__sec-row">
      <text class="page-scm__sec">时段开关</text>
      <text class="page-scm__sec-note">{{ selNote }}</text>
    </view>
    <view class="page-scm__card">
      <view
        v-for="(s, i) in slots"
        :key="s.id || s.time"
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
          @click="!s.locked && toggleSlot(s)"
        >
          <view class="page-scm__toggle-dot" :class="{ 'page-scm__toggle-dot--on': s.on }" />
        </view>
      </view>
      <AppEmpty v-if="!slots.length" text="当天没有可约时段模板" />
      <view v-if="slots.length" class="page-scm__close-all pressable" @click="toggleAll">
        <text>{{ allOff ? '开放全天' : '关闭全天' }}</text>
      </view>
    </view>

    <!-- 占用时段订单 -->
    <text class="page-scm__sec page-scm__sec--gap">占用时段订单</text>
    <view v-for="b in dayBlocks" :key="b.id" class="page-scm__order">
      <view class="page-scm__order-head">
        <text class="page-scm__order-time">{{ hm(b.time_range) }}</text>
        <view class="page-scm__badge"><text>已确认 · 档期锁定</text></view>
      </view>
      <view class="page-scm__order-mid">
        <text class="page-scm__order-name">{{ orderTitle(b) }}</text>
        <text class="page-scm__order-place">{{ b.photographer || '未指派摄影师' }}</text>
      </view>
      <view class="page-scm__order-btns">
        <view class="page-scm__obtn page-scm__obtn--ghost pressable" @click="reschedule(b)">
          <text>发起改期</text>
        </view>
        <view class="page-scm__obtn page-scm__obtn--dark pressable" @click="contact(b)">
          <text>联系客户</text>
        </view>
      </view>
    </view>
    <AppEmpty v-if="!dayBlocks.length" text="当天没有订单占用" />

    <!-- 底部提示 -->
    <view class="page-scm__tip">
      <AppIcon name="info-gray-sm" :size="13" />
      <text class="page-scm__tip-text">时段模板按**星期几**生效（同周几的日期共享一套）· 已占时段由订单控制，不可手动关闭</text>
    </view>

    <AppTabBar active="schedule" />
    <view class="page-scm__safe" />
  </view>
</template>

<script>
/**
 * SC04 档期管理（稿 1:4297 实测 1:1）
 * 日条（31 天可横滑、点选联动下方时段开关）→ 时段开关 → 占用时段订单卡 → 提示。
 *
 * 数据源（2026-09-14 接线）：
 *   /slot-template/list → 可约时段模板 biz_slot_template（**按星期几** + status 启停）
 *   /schedule/list      → 档期锁 biz_calendar_block（当天已被订单占用的时段）
 *   /slot-template/save → 开关落库（关闭用 status=0，保留模板行不删除）
 *   /order/detail/:id   → 「联系客户」时取客户手机号（档期锁本身不带电话）
 *
 * ⚠️ 语义边界（重要）：后端**没有**"某天某时段开关"这种按日期的开放表，
 *    只有按**星期几**的模板。因此这里的开关改的是"每周几的模板"，
 *    影响所有同星期几的日期（同周几的日期共享一套）——UI 已如实标注，不假装按日期生效。
 * ⚠️ 已占时段（当天有档期锁）行锁定不可手关：与「手动关闭只影响未被占用的时段」口径一致。
 */
import { getScheduleList, listSlotTemplates, saveSlotTemplate } from '@/api/schedule'
import { getOrderDetail } from '@/api/order'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const DAY_COUNT = 31
const DOT_OK = '#76D596'
const DOT_OFF = '#FF8181'
const DOT_TODAY = 'transparent'

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hm(t) {
  return String(t || '').slice(0, 5)
}

export default {
  name: 'ScheduleManage',
  data() {
    return {
      days: [],
      selIdx: 1,
      templates: [],
      blocks: [],
      slots: [],
      saving: false,
    }
  },
  computed: {
    todayStr() {
      return ymd(new Date())
    },
    selDate() {
      return (this.days[this.selIdx] || {}).date || this.todayStr
    },
    selWeekday() {
      return new Date(`${this.selDate}T00:00:00`).getDay()
    },
    selNote() {
      const d = this.days[this.selIdx]
      if (!d) return ''
      return `${d.m}月${d.dom}日 · 周${d.w} · ${this.slots.length} 个时段模板（同周${d.w}共享）`
    },
    dayBlocks() {
      return this.blocks.filter((b) => b.date === this.selDate)
    },
    /** 非锁定时段全部关闭 → 按钮切「开放全天」 */
    allOff() {
      const open = this.slots.filter((s) => !s.locked)
      return open.length > 0 && open.every((s) => !s.on)
    },
  },
  onLoad() {
    this.buildDays()
    this.selIdx = 1 // 默认选中今日（days[0] 为昨日）
    this.fetchAll()
  },
  methods: {
    hm,
    /** 31 天日条：今日在 index 1（与稿一致），index 0 为昨日（置灰） */
    buildDays() {
      const out = []
      const now = new Date()
      for (let i = 0; i < DAY_COUNT; i++) {
        const d = new Date(now)
        d.setDate(d.getDate() + i - 1)
        const date = ymd(d)
        out.push({
          date,
          w: WEEK[d.getDay()],
          dom: d.getDate(),
          m: d.getMonth() + 1,
          label: date === this.todayStr ? '今' : String(d.getDate()),
          past: date < this.todayStr,
          dot: this.dotFor(date),
        })
      }
      this.days = out
    },
    dotFor(date) {
      if (date < this.todayStr) return '#D4D4D4'
      if (date === this.todayStr) return DOT_TODAY
      const locked = this.blocks.some((b) => b.date === date)
      if (locked) return DOT_OFF
      return this.templatesFor(date).length ? DOT_OK : 'transparent'
    },
    templatesFor(date) {
      const wd = new Date(`${date}T00:00:00`).getDay()
      return this.templates.filter((t) => Number(t.weekday) === wd)
    },
    async fetchAll() {
      const start = ymd(new Date(new Date().getTime() - 86400000))
      const end = ymd(new Date(new Date().getTime() + 40 * 86400000))
      const [tplRes, blockRes] = await Promise.all([
        listSlotTemplates().catch(() => null),
        getScheduleList({ start_date: start, end_date: end }).catch(() => null),
      ])
      this.templates = Array.isArray(tplRes) ? tplRes : []
      this.blocks = (Array.isArray(blockRes) ? blockRes : []).filter((b) => b.status !== 2)
      this.buildDays()
      this.buildSlots()
    },
    /** 由模板 + 当天档期锁推导开关行 */
    buildSlots() {
      const locked = this.blocks.filter((b) => b.date === this.selDate)
      this.slots = this.templatesFor(this.selDate)
        .map((t) => {
          const range = `${hm(t.start_time)}-${hm(t.end_time)}`
          const hit = locked.find((b) => b.time_range === range)
          return {
            id: t.id,
            time: range,
            start: hm(t.start_time),
            end: hm(t.end_time),
            on: t.status !== 0,
            locked: !!hit,
            state: hit ? `已占用 · ${hit.customer_name || '订单'}（订单控制，不可手动关）` : '',
          }
        })
        .sort((a, b) => a.time.localeCompare(b.time))
    },
    pickDay(i) {
      if (this.selIdx === i) return
      this.selIdx = i
      this.buildSlots()
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/schedule/index' }) })
    },
    /** 单个开关：写回该星期的模板 status（1-启用 0-停用） */
    async toggleSlot(s) {
      if (this.saving) return
      const next = !s.on
      s.on = next
      this.saving = true
      const ok = await this.persist(s, next)
      this.saving = false
      if (!ok) {
        s.on = !next
        return
      }
      uni.showToast({ title: next ? '已开放该时段' : '已关闭该时段', icon: 'none' })
    },
    async toggleAll() {
      if (this.saving) return
      const open = this.allOff
      const targets = this.slots.filter((s) => !s.locked)
      if (!targets.length) return uni.showToast({ title: '没有可调整的时段', icon: 'none' })
      this.saving = true
      for (const s of targets) {
        s.on = open
      }
      let ok = true
      for (const s of targets) {
        // 串行写回，避免并发写同一星期模板互相覆盖
        if (!(await this.persist(s, open))) {
          ok = false
          break
        }
      }
      this.saving = false
      if (!ok) {
        this.buildSlots()
        return
      }
      uni.showToast({ title: open ? '已开放全天' : '已关闭全天', icon: 'none' })
    },
    /**
     * 落库：模板启停用 status 表达（后端无单独的"停用"接口）。
     * 关闭 = status 0；重新开放 = status 1（保留模板行，避免删了再建丢 id / 丢历史）。
     */
    async persist(s, on) {
      const payload = {
        photographer_id: 0,
        weekday: this.selWeekday,
        start_time: s.start,
        end_time: s.end,
        status: on ? 1 : 0,
      }
      const ok = await saveSlotTemplate(payload, s.id).then(() => true).catch(() => false)
      if (ok) this.syncLocalTemplate(s.id, on)
      return ok
    },
    syncLocalTemplate(id, on) {
      const t = this.templates.find((x) => x.id === id)
      if (t) t.status = on ? 1 : 0
    },
    orderTitle(b) {
      return [b.customer_name || '未命名', b.project_type].filter(Boolean).join(' · ')
    },
    reschedule(b) {
      if (!b.order_id) return uni.showToast({ title: '该档期未关联订单', icon: 'none' })
      uni.navigateTo({ url: '/pages/schedule/reschedule?id=' + b.order_id })
    },
    /** 联系客户：档期锁不带电话，按 order_id 反查订单取手机号 */
    async contact(b) {
      if (!b.order_id) return uni.showToast({ title: '该档期未关联订单', icon: 'none' })
      const res = await getOrderDetail(b.order_id).catch(() => null)
      const mobile = res && res.order && res.order.customer_mobile
      if (!mobile) return uni.showToast({ title: '暂无联系电话', icon: 'none' })
      uni.makePhoneCall({ phoneNumber: String(mobile) })
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
