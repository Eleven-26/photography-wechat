<template>
  <view class="page-sc page-wrap">
    <!-- ① 顶栏：返回圆钮 + 标题「选择拍摄时间」（D03 实测） -->
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起（1:8122 等实测） -->
    <view class="status-bar" />
    <view class="page-sc__header">
      <view class="page-sc__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <text class="page-sc__title">选择拍摄时间</text>
    </view>

    <!-- ② 日历卡：343×309 白 r16 pad16（D03 实测） -->
    <view class="page-sc__cal">
      <view class="page-sc__cal-head">
        <view class="page-sc__cal-arrow pressable" @click="prevMonth"><AppIcon name="cal-prev" :size="20" /></view>
        <text class="page-sc__cal-title">{{ year }}年{{ month }}月</text>
        <view class="page-sc__cal-arrow pressable" @click="nextMonth"><AppIcon name="cal-next" :size="20" /></view>
      </view>
      <view class="page-sc__cal-week">
        <text v-for="w in ['日','一','二','三','四','五','六']" :key="w" class="page-sc__cal-week-cell">{{ w }}</text>
      </view>
      <view class="page-sc__cal-grid">
        <view
          v-for="(d, i) in days"
          :key="i"
          class="page-sc__day pressable"
          :class="{
            'page-sc__day--selected': d.date === selectedDate,
            'page-sc__day--today': d.isToday && d.date !== selectedDate,
          }"
          @click="selectDay(d)"
        >
          <text
            class="page-sc__day-num"
            :class="{
              'page-sc__day-num--selected': d.date === selectedDate,
              'page-sc__day-num--today': d.isToday && d.date !== selectedDate,
            }"
          >{{ d.day }}</text>
          <text v-if="d.date === selectedDate" class="page-sc__day-tag">已选</text>
          <view
            v-else-if="d.dot"
            class="page-sc__day-dot"
            :class="`page-sc__day-dot--${d.dot}`"
          />
        </view>
      </view>
    </view>

    <!-- ③ 可选时段：15 Bold 标题 + 白卡 r16（D03 实测行 pad16/19.5） -->
    <text class="page-sc__sec-title">{{ selectedCn }}可选时段</text>
    <view class="page-sc__slots">
      <view
        v-for="s in slots"
        :key="s.time"
        class="page-sc__slot pressable"
        :class="{ 'page-sc__slot--disabled': s.state === 'busy' }"
        @click="selectSlot(s)"
      >
        <view class="page-sc__slot-time">
          <text>{{ s.time }}</text>
          <AppIcon v-if="s.time === selectedTime" name="check-sm-dark" :size="14" />
        </view>
        <view class="page-sc__slot-badge" :class="`page-sc__slot-badge--${s.time === selectedTime ? 'selected' : s.state}`">
          <text>{{ s.time === selectedTime ? '已选' : s.state === 'busy' ? '已占用' : '空闲' }}</text>
        </view>
      </view>
    </view>

    <!-- ④ 拍摄信息：15 Bold + 白卡 r16（D03 实测地点/预计占用/缓冲时间） -->
    <text class="page-sc__sec-title">拍摄信息</text>
    <view class="page-sc__info">
      <view class="page-sc__info-row">
        <text class="page-sc__info-label">地点</text>
        <text class="page-sc__info-value">{{ order.shoot_address || '越秀公园' }}</text>
      </view>
      <view class="page-sc__info-row">
        <text class="page-sc__info-label">预计占用</text>
        <text class="page-sc__info-value">{{ durationText }}</text>
      </view>
      <view class="page-sc__info-row page-sc__info-row--last">
        <text class="page-sc__info-label">缓冲时间</text>
        <text class="page-sc__info-value">前后各30分钟</text>
      </view>
    </view>

    <!-- ⑤ 黑胶囊主钮：fill h52「确认并锁定档期」（D03 实测 r999 15 Bold） -->
    <view class="page-sc__footer">
      <AppButton block :loading="submitting" @click="submit">确认并锁定档期</AppButton>
    </view>

    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D03 档期确认（画板 1:7157「选择拍摄时间」一比一还原）
 *
 * 业务：客户预约订单（status=0 待确认档期）→ 摄影师确认日期时段 → 正式锁档
 *   （锁档口径 2026-09-07：支付定金后正式锁定；本页为摄影师核对环节，确认后订单流转 status=1）。
 * 日历态（实测）：选中=金底+「已选」字；红/金点=已被占用/其他预约；白底黑描边=今日。
 * 时段态（实测）：空闲（灰徽章）/ 已选（金徽章+时间旁黑勾）/ 已占用（浅红徽章，不可点）。
 * 数据源：/api/calendar（档期占用）+ 订单详情；确认提交 /order/confirm/:id（联调核对）。
 * 演示数据：联调后移除。
 */
import AppButton from '@/components/AppButton.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import { getOrderDetail, confirmSchedule } from '@/api/order'
import { demoOrderById, isDemo } from '@/utils/demo'

const WEEKS = ['日', '一', '二', '三', '四', '五', '六']

export default {
  components: { AppButton, AppTabBar },
  data() {
    const now = new Date()
    return {
      orderId: 0,
      order: {},
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      selectedDate: '',
      selectedTime: '',
      /* 档期占用示意（联调后改读 /api/calendar）：红=已占用 金=其他预约 */
      busyDots: { 10: 'red', 14: 'red', 18: 'gold' },
      /* 时段示意（联调后移除；稿内 4 档） */
      slots: [
        { time: '09:00', state: 'free' },
        { time: '10:00', state: 'free' },
        { time: '14:00', state: 'busy' },
        { time: '15:30', state: 'free' },
      ],
      submitting: false,
    }
  },
  computed: {
    /** 日历网格：当月天数 + 状态点 + 今日标记（42 格对齐星期） */
    days() {
      const first = new Date(this.year, this.month - 1, 1)
      const count = new Date(this.year, this.month, 0).getDate()
      const today = new Date()
      const pad = first.getDay()
      const cells = []
      for (let i = 0; i < pad; i++) cells.push({ day: '', date: '' })
      for (let d = 1; d <= count; d++) {
        const date = `${this.year}-${String(this.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        cells.push({
          day: d,
          date,
          dot: this.busyDots[d] || '',
          isToday: d === today.getDate() && this.month === today.getMonth() + 1 && this.year === today.getFullYear(),
        })
      }
      return cells
    },
    selectedCn() {
      if (!this.selectedDate) return '请选择日期'
      const d = new Date(`${this.selectedDate}T00:00:00`)
      return `${d.getMonth() + 1}月${d.getDate()}日（周${WEEKS[d.getDay()]}）`
    },
    durationText() {
      /* 时长读套餐 duration_hours；兜底 3 小时（D03 稿值） */
      return this.order.duration_hours ? `${this.order.duration_hours} 小时` : '3 小时'
    },
  },
  onLoad(query) {
    this.orderId = query.id
    /* 默认选中订单拍摄日（演示 2026-08-08） */
    const d = (query.date || '2026-08-08').split('-')
    this.year = Number(d[0])
    this.month = Number(d[1])
    this.selectedDate = `${d[0]}-${d[1]}-${d[2]}`
    this.selectedTime = '10:00'
    this.fetchOrder()
  },
  methods: {
    async fetchOrder() {
      if (isDemo()) { this.order = demoOrderById(this.orderId); return }
      try {
        const res = await getOrderDetail(this.orderId)
        const data = (res && res.data) || {}
        this.order = data.order || data
      } catch (e) { this.order = demoOrderById(this.orderId) }
    },
    prevMonth() {
      if (this.month === 1) { this.year -= 1; this.month = 12 } else { this.month -= 1 }
    },
    nextMonth() {
      if (this.month === 12) { this.year += 1; this.month = 1 } else { this.month += 1 }
    },
    selectDay(d) {
      if (!d.date) return
      this.selectedDate = d.date
    },
    selectSlot(s) {
      if (s.state === 'busy') {
        uni.showToast({ title: '该时段已被占用', icon: 'none' })
        return
      }
      this.selectedTime = s.time
    },
    /** 确认锁档：/order/confirm/:id（联调核对）；演示直接成功返回（联调后移除） */
    async submit() {
      if (this.submitting) return
      if (!this.selectedDate || !this.selectedTime) {
        uni.showToast({ title: '请选择日期与时段', icon: 'none' })
        return
      }
      this.submitting = true
      try {
        if (!isDemo()) {
          await confirmSchedule(this.orderId)
        }
        uni.showToast({ title: '档期已确认', icon: 'success' })
        setTimeout(() => this.goBack(), 600)
      } catch (e) {
        uni.showToast({ title: (e && e.message) || '确认失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-sc {
  padding-bottom: 320rpx; /* 黑钮 + 底导航留白 */

  /* ① 顶栏（同 D01 实测规格） */
  &__header {
    position: relative; /* 标题绝对居中（2026-09-08 用户定稿：所有头部标题居中） */
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box; /* 稿 60 高，按钮/标题垂直居中（中心 y74） */
    padding: 0 $page-pad;
  }
  &__top-btn {
    box-sizing: border-box; /* 稿 44 含描边 */
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.88);
    border: 1rpx solid rgba(21, 22, 23, 0.05);
    border-radius: 50%;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 23, 0.055);
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center; /* 头部标题水平居中（用户定稿） */
    pointer-events: none;
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700; }

  /* ② 日历卡：343 白 r16 pad16（实测 y114） */
  &__cal {
    margin: 28rpx $page-pad 0;
    padding: 32rpx;
    background-color: $white;
    border-radius: $radius-card;
  }
  &__cal-head { display: flex; align-items: center; justify-content: space-between; }
  &__cal-title { color: #333333; font-size: 30rpx; font-weight: 700; } /* 15 Bold 实测 */
  &__cal-arrow {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85; /* 箭头色 #85878D（SVG 为客户端导出浅色版，深浅端通用形状） */
  }
  &__cal-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-top: 16rpx;
  }
  &__cal-week-cell { text-align: center; color: #9CA3AF; font-size: $fs-xs; padding: 10rpx 0; } /* 11 实测 */
  &__cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    row-gap: 4rpx;
  }
  &__day {
    position: relative;
    height: 86rpx; /* 42.7px 实测 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx; /* r8 实测 */

    &--selected { background-color: #FFDA08; } /* 实测金底 */
    &--today { background-color: $white; border: 1rpx solid #17181A; } /* 实测白底黑描边 */
  }
  &__day-num { color: #9CA3AF; font-size: 28rpx; } /* 14 实测 Roboto Mono→统一字体 */
  &__day-num--selected { color: #000000; font-weight: 700; } /* 实测选中黑 Bold */
  &__day-num--today { color: #333333; font-weight: 700; } /* 实测今日 #333 Bold */
  &__day-tag { color: #6B5B00; font-size: 20rpx; } /* 实测「已选」0.4199/0.3569/0 */
  &__day-dot {
    position: absolute;
    bottom: 8rpx;
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;

    &--red { background-color: #E37B76; } /* 实测已占用红点 */
    &--gold { background-color: #D9A735; } /* 实测其他预约金点 */
  }

  /* ③④ 区块标题：15 Bold（实测 x18） */
  &__sec-title {
    display: block;
    padding: 44rpx 36rpx 20rpx;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }

  /* ③ 时段卡：白 r16，行 pad16/19.5（实测） */
  &__slots {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: $radius-card;
    overflow: hidden;
  }
  &__slot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 39rpx 32rpx;
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);

    &:last-child { border-bottom: none; }
    &--disabled { opacity: 0.7; }
  }
  &__slot-time {
    display: flex;
    align-items: center;
    gap: 20rpx;
    text { color: $text-1; font-size: 30rpx; font-weight: 700; font-family: $font-family-num; } /* 15 Bold 实测 */
  }
  &__slot-badge {
    padding: 6rpx 18rpx;
    border-radius: 999rpx;
    text { font-size: $fs-xs; font-weight: 500; line-height: 36rpx; }

    &--free { background-color: $badge-gray-bg; text { color: $text-2; } }
    &--selected { background-color: #FFDA08; text { color: #333333; } } /* 实测金底黑字 */
    &--busy { background-color: #FFDFDF; text { color: #FF0000; } } /* 实测浅红底纯红字 */
  }

  /* ④ 信息卡：白 r16 行 pad16/22（实测） */
  &__info {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: $radius-card;
    overflow: hidden;
  }
  &__info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 44rpx 32rpx;
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);

    &--last { border-bottom: none; }
  }
  &__info-label { color: $text-2; font-size: 28rpx; }
  &__info-value { color: #333333; font-size: 28rpx; }

  /* ⑤ 底部主钮区（实测 y990 pad16；底导航上方） */
  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 166rpx; /* 底导航 83px */
    z-index: 99;
    padding: 20rpx $page-pad;
    background: linear-gradient(to top, rgba(242, 243, 245, 1) 70%, rgba(242, 243, 245, 0));
  }
}
</style>
