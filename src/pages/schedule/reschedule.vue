<template>
  <view class="page-scr page-wrap has-footer">
    <view class="status-bar" />
    <!-- Header：返回 + 「发起改期」（1:5536 实测） -->
    <view class="page-scr__header">
      <view class="page-scr__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-scr__title">发起改期</text>
    </view>

    <!-- 原档期卡（1:48 实测 343×78 r16） -->
    <view class="page-scr__orig">
      <text class="page-scr__orig-label">原档期 · {{ origLabel }}</text>
      <view class="page-scr__orig-mid">
        <text class="page-scr__orig-name">{{ origName }}</text>
        <text class="page-scr__orig-place">{{ origPlace }}</text>
      </view>
    </view>

    <!-- 选新日期 -->
    <view class="page-scr__sec-row">
      <text class="page-scr__sec">选新日期</text>
      <text class="page-scr__sec-note">左右滑动跨周</text>
    </view>
    <scroll-view class="page-scr__weekbar" scroll-x :show-scrollbar="false">
      <view class="page-scr__weekbar-inner">
        <view
          v-for="(d, i) in weekDays"
          :key="d.date"
          class="page-scr__wday"
          :class="{ 'page-scr__wday--on': selIdx === i, 'page-scr__wday--dim': d.past }"
          @click="!d.past && pickDay(i)"
        >
          <text class="page-scr__wday-head" :class="{ 'page-scr__wday-head--on': selIdx === i }">{{ d.w }}</text>
          <text class="page-scr__wday-num" :class="{ 'page-scr__wday-num--on': selIdx === i }">{{ d.label }}</text>
          <view class="page-scr__wdot" :style="{ backgroundColor: d.dot }" />
        </view>
      </view>
    </scroll-view>

    <!-- 选新时段 -->
    <text class="page-scr__sec page-scr__sec--gap">选新时段</text>
    <view v-if="slots.length" class="page-scr__slots">
      <view
        v-for="(s, i) in slots"
        :key="i"
        class="page-scr__slot"
        :class="['page-scr__slot--' + s.tone, { 'page-scr__slot--sel': selSlot === s.range && s.tone === 'ok' }]"
        @click="s.tone === 'ok' && (selSlot = s.range)"
      >
        <text>{{ s.range }}</text>
        <view v-if="s.tag" class="page-scr__slot-tag"><text>{{ s.tag }}</text></view>
      </view>
      <!-- 推荐灰条 -->
      <view v-if="recommend" class="page-scr__hint">
        <AppIcon name="info-gray-sm" :size="13" />
        <text class="page-scr__hint-text">{{ recommend }}</text>
      </view>
    </view>
    <AppEmpty v-else text="该日未开放可约时段，请换一天" />

    <!-- 改期原因 -->
    <text class="page-scr__sec page-scr__sec--gap">改期原因</text>
    <view class="page-scr__reasons">
      <view
        v-for="r in reasons"
        :key="r"
        class="page-scr__reason"
        :class="{ 'page-scr__reason--on': reason === r }"
        @click="reason = r"
      >
        <text>{{ r }}</text>
      </view>
    </view>

    <!-- 发送客户确认 -->
    <view class="page-scr__submit pressable" @click="submit">
      <text>{{ submitting ? '发送中…' : '发送客户确认' }}</text>
    </view>
    <view class="page-scr__safe" />
  </view>
</template>

<script>
/**
 * SC04-2 发起改期（稿 1:5536 实测 1:1）
 * 原档期卡 → 选新日期周条 → 选新时段（已占红 chip 带「订单」角标，不可选）→ 改期原因 → 发送客户确认。
 *
 * 数据源（2026-09-14 接线）：
 *   /order/detail/:id            → 原档期（shoot_date / shoot_time / customer_name / package_name / shoot_address）
 *   /slot-template/list          → 该星期几可约时段
 *   /schedule/list               → 档期锁（标记已被订单占用的时段）
 *   /order/reschedule/apply/:id  → 发起改期 body { new_date, new_time, reason_label }
 *
 * ⚠️ 后端改期是**申请制**：发起后进入待审核（biz_order_reschedule），
 *    不是单方改期。文案保持"发送客户确认"口径，实际提交的是改期申请。
 */
import { getScheduleList, listSlotTemplates } from '@/api/schedule'
import { getOrderDetail, applyReschedule } from '@/api/order'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']
const DAYS = 8
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
  name: 'ScheduleReschedule',
  data() {
    return {
      orderId: '',
      order: null,
      templates: [],
      blocks: [],
      weekDays: [],
      selIdx: 0,
      selSlot: '',
      reason: '与客户协商',
      reasons: ['时间冲突', '天气原因', '场地与场地问题', '与客户协商'],
      submitting: false,
    }
  },
  computed: {
    todayStr() {
      return ymd(new Date())
    },
    origLabel() {
      const o = this.order || {}
      if (!o.shoot_date) return '待确认'
      const d = new Date(String(o.shoot_date).replace(/-/g, '/'))
      const w = Number.isNaN(d.getTime()) ? '' : ` 周${WEEK[d.getDay()]}`
      return `${Number(String(o.shoot_date).slice(5, 7))}/${Number(String(o.shoot_date).slice(8, 10))}${w} ${o.shoot_time || ''}`.trim()
    },
    origName() {
      const o = this.order || {}
      return [o.customer_name, o.package_name].filter(Boolean).join(' · ') || '订单'
    },
    origPlace() {
      const o = this.order || {}
      return o.shoot_address || '地点待定'
    },
    selDate() {
      return (this.weekDays[this.selIdx] || {}).date || this.todayStr
    },
    /** 选中日时段：模板 ∩ 档期锁 */
    slots() {
      const locked = this.blocks.filter((b) => b.date === this.selDate)
      return this.templatesFor(this.selDate).map((t) => {
        const range = `${hm(t.start_time)}-${hm(t.end_time)}`
        const hit = locked.find((b) => b.time_range === range)
        return hit ? { range, tone: 'off', tag: '订单' } : { range, tone: 'ok' }
      })
    },
    recommend() {
      if (!this.selSlot) return ''
      const d = this.weekDays[this.selIdx]
      if (!d) return ''
      return `${this.mmdd(this.selDate)} 周${d.w} ${this.selSlot} 空闲 · 与其他订单无冲突`
    },
  },
  onLoad(options) {
    this.orderId = (options && options.id) || ''
    this.buildDays()
    this.fetchAll()
  },
  methods: {
    mmdd(date) {
      return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`
    },
    /** 8 天日条：昨日（置灰）+ 今日起 7 天，默认选今日 */
    buildDays() {
      const out = []
      const now = new Date()
      for (let i = 0; i < DAYS; i++) {
        const d = new Date(now)
        d.setDate(d.getDate() + i - 1)
        const date = ymd(d)
        out.push({
          date,
          w: WEEK[d.getDay()],
          label: date === this.todayStr ? '今' : String(d.getDate()),
          past: date < this.todayStr,
          dot: this.dotFor(date),
        })
      }
      this.weekDays = out
      this.selIdx = 1
    },
    dotFor(date) {
      if (date < this.todayStr) return '#D4D4D4'
      if (date === this.todayStr) return DOT_TODAY
      if (this.blocks.some((b) => b.date === date)) return DOT_OFF
      return this.templatesFor(date).length ? DOT_OK : 'transparent'
    },
    templatesFor(date) {
      const wd = new Date(`${date}T00:00:00`).getDay()
      return this.templates.filter((t) => Number(t.weekday) === wd && t.status !== 0)
    },
    async fetchAll() {
      const start = ymd(new Date(new Date().getTime() - 86400000))
      const end = ymd(new Date(new Date().getTime() + 10 * 86400000))
      const tasks = [
        getScheduleList({ start_date: start, end_date: end }).catch(() => null),
        listSlotTemplates().catch(() => null),
      ]
      if (this.orderId) tasks.push(getOrderDetail(this.orderId).catch(() => null))
      const [blockRes, tplRes, orderRes] = await Promise.all(tasks)
      this.blocks = (Array.isArray(blockRes) ? blockRes : []).filter((b) => b.status !== 2)
      this.templates = (Array.isArray(tplRes) ? tplRes : []).filter((t) => t.status !== 0)
      this.order = (orderRes && orderRes.order) || null
      this.buildDays()
      this.autoPickSlot()
    },
    /** 默认选一个可约时段（优先今天，其次往后找） */
    autoPickSlot() {
      for (let i = 1; i < this.weekDays.length; i++) {
        this.selIdx = i
        const first = this.slots.find((s) => s.tone === 'ok')
        if (first) {
          this.selSlot = first.range
          return
        }
      }
      this.selIdx = 1
      this.selSlot = ''
    },
    pickDay(i) {
      this.selIdx = i
      const first = this.slots.find((s) => s.tone === 'ok')
      this.selSlot = first ? first.range : ''
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/schedule/manage' }) })
    },
    async submit() {
      if (this.submitting) return
      if (!this.orderId) return uni.showToast({ title: '缺少订单信息', icon: 'none' })
      if (!this.selSlot) return uni.showToast({ title: '请选择新时段', icon: 'none' })
      this.submitting = true
      const ok = await applyReschedule(this.orderId, {
        new_date: this.selDate,
        new_time: this.selSlot,
        reason_label: this.reason,
      })
        .then(() => true)
        .catch(() => false)
      this.submitting = false
      if (!ok) return
      uni.showToast({ title: '改期申请已发送', icon: 'success' })
      setTimeout(() => uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/schedule/manage' }) }), 900)
    },
  },
}
</script>


<style lang="scss" scoped>
.page-scr {
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

  &__orig {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 28rpx 34rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__orig-label { display: block; font-size: 24rpx; font-weight: 700; color: #666666; }
  &__orig-mid { display: flex; align-items: baseline; gap: 16rpx; margin-top: 14rpx; }
  &__orig-name { font-size: 30rpx; font-weight: 700; color: #171819; }
  &__orig-place { font-size: 24rpx; color: #666666; }

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
    &--gap { margin: 48rpx 36rpx 0; } /* 稿：选新时段 @328、改期原因 @540（上段底 + 24） */
  }
  &__sec-note { font-size: 24rpx; font-weight: 500; color: #999999; }

  &__weekbar {
    margin: 20rpx 0 0 32rpx; /* 稿 380 宽 @(16,242) → 横向滑动，右侧出血 */
    white-space: nowrap;
    &::-webkit-scrollbar { display: none; }
  }
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
    &--dim { opacity: 0.5; }
  }
  &__wday-head { font-size: 22rpx; font-weight: 500; color: #999999; }
  &__wday--on .page-scr__wday-head { color: #CCCCCC; }
  &__wday-num {
    font-size: 28rpx;
    font-weight: 700;
    color: #151617;
    font-family: $font-family-num;
    &--on { color: #FFFFFF; }
  }
  &__wdot { width: 12rpx; height: 12rpx; border-radius: 50%; margin-top: 6rpx; }

  &__slots {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 16rpx;
    padding: 32rpx 24rpx 0; /* 稿：白卡底部由内嵌灰条收尾，底部留白交给 .__hint margin-bottom */
  }
  &__slot {
    position: relative;
    border-radius: 999rpx;
    padding: 14rpx 24rpx;
    text { font-size: 24rpx; font-weight: 500; line-height: 34rpx; }
    &--off { background-color: #FEE2E2; text { color: #D94B4B; } }
    &--ok { background-color: #DCFCE7; text { color: #20845C; } }
    &--plain { background-color: #F2F3F5; text { color: #333333; } }
    &--sel { box-shadow: inset 0 0 0 4rpx #121212; }
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

  &__hint {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex: 0 0 100%;              /* 占满白卡内容宽，位于时段 chips 之后一行 */
    box-sizing: border-box;
    min-height: 96rpx;           /* 稿：灰条 48px 高 */
    margin: 0 0 24rpx;           /* 底部留 12px=24rpx（稿内四周留 12px）；顶部由 slots flex gap 承担 */
    background-color: #F2F3F5;   /* 置于白卡上可见 */
    border-radius: 12rpx;
    padding: 0 24rpx;
  }
  &__hint-text { flex: 1; font-size: 24rpx; line-height: 34rpx; color: #666666; }

  &__reasons {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin: 20rpx 32rpx 0;
  }
  &__reason {
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 999rpx;
    padding: 14rpx 28rpx;
    text { font-size: 28rpx; line-height: 40rpx; color: #333333; }
    &--on { background-color: #00B972; border-color: #00B972; text { color: #FFFFFF; font-weight: 500; } }
  }

  &__submit {
    margin: 48rpx 32rpx 40rpx;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }

  &__safe { height: 40rpx; }
}
</style>
