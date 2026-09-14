<template>
  <view class="page-od page-wrap">
    <!-- ① 顶栏：44 圆钮返回 + 标题「订单详情」17 Bold（D02 实测 y44 h60） -->
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起（1:8122 等实测） -->
    <view class="status-bar" />
    <view class="page-od__header">
      <view class="page-od__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <text class="page-od__title">订单详情</text>
    </view>

    <!-- ② 黑色 Hero 卡：343×223 #121212（D02 实测），客户/备注/状态徽章/金 CTA/6 步进度 -->
    <view class="page-od__hero">
      <view class="page-od__hero-head">
        <text class="page-od__hero-name">{{ order.customer_name }} · {{ order.package_name }}</text>
        <view class="page-od__hero-badge">
          <view class="page-od__hero-dot" />
          <text>{{ heroBadge.stateText }}</text>
          <view class="page-od__hero-dot page-od__hero-dot--sm" />
          <text>{{ heroBadge.timeText }}</text>
        </view>
      </view>
      <text class="page-od__hero-note">{{ order.remark || '暂无备注' }}</text>
      <view class="page-od__hero-cta pressable" @click="onHeroAction">
        <text>{{ heroAction ? heroAction.label : heroBadge.stateText }}</text>
      </view>
      <!-- 6 步进度：预约/定金/拍摄/选片/精修/交付（D02 实测 22 圆 + 10px 标签） -->
      <view class="page-od__steps">
        <template v-for="(s, i) in STEPS" :key="s">
          <view class="page-od__step">
            <view
              class="page-od__step-dot"
              :class="{
                'page-od__step-dot--done': i + 1 < currentStep,
                'page-od__step-dot--current': i + 1 === currentStep,
              }"
            >
              <AppIcon v-if="i + 1 < currentStep" name="check-gold-step" :size="12" />
              <text v-else>{{ i + 1 }}</text>
            </view>
            <text
              class="page-od__step-label"
              :class="{ 'page-od__step-label--current': i + 1 === currentStep }"
            >{{ s }}</text>
          </view>
          <view v-if="i < STEPS.length - 1" class="page-od__step-line" />
        </template>
      </view>
    </view>

    <!-- ③ 本单套餐：15 Bold + 绿徽章（D02 实测「家庭基础 报价V2」） -->
      <view class="page-od__sec-head">
        <text class="page-od__sec-title">本单套餐</text>
        <view v-if="order.package_version" class="page-od__quote-badge"><text>报价V{{ order.package_version }}</text></view>
      </view>
      <view class="page-od__pkg">
        <view class="page-od__pkg-row">
          <text class="page-od__pkg-name">{{ order.package_name }}</text>
          <text class="page-od__pkg-price">¥{{ formatAmount(order.base_price || order.total_amt) }}</text>
        </view>
        <template v-for="(a, i) in addons || []" :key="i">
          <view class="page-od__pkg-hairline" />
          <view class="page-od__pkg-row page-od__pkg-row--addon">
            <text class="page-od__pkg-addon">+{{ a.name }}</text>
            <text class="page-od__pkg-addon-price">+{{ formatAmount(a.amount) }}</text>
          </view>
        </template>
      </view>

    <!-- ④ 订单信息：15 Bold + 白卡 r20，行 14（D02 实测；已收绿/待收金） -->
    <view class="page-od__sec-head"><text class="page-od__sec-title">订单信息</text></view>
    <view class="page-od__info">
      <view class="info-row page-od__info-row">
        <text class="page-od__info-label">订单总额</text>
        <text class="page-od__info-value">¥{{ formatAmount(order.total_amt) }}</text>
      </view>
      <view class="info-row page-od__info-row">
        <text class="page-od__info-label">已收</text>
        <text class="page-od__info-value page-od__info-value--ok">¥{{ formatAmount(receivedAmt) }}</text>
      </view>
      <view class="info-row page-od__info-row">
        <text class="page-od__info-label">待收</text>
        <text class="page-od__info-value page-od__info-value--gold">¥{{ formatAmount(order.final_amt) }}</text>
      </view>
      <!-- 拍摄日期为纯展示信息（不可点击）：去掉了 pressable/@click 与右侧箭头 -->
      <view class="info-row info-row--last page-od__info-row">
        <text class="page-od__info-label">拍摄日期</text>
        <view class="page-od__info-right">
          <text class="page-od__info-value page-od__info-value--plain">{{ dateText }}</text>
        </view>
      </view>
    </view>

    <!-- ④-② 操作记录：来自 /order/logs（裸数组） -->
    <view class="page-od__sec-head"><text class="page-od__sec-title">操作记录</text></view>
    <view v-if="logs.length" class="page-od__logs">
      <view v-for="(l, i) in logs" :key="i" class="page-od__log">
        <view class="page-od__log-main">
          <text class="page-od__log-action">{{ l.action || '操作' }}</text>
          <text class="page-od__log-content">{{ l.content || '' }}</text>
        </view>
        <text class="page-od__log-time">{{ l.created_at || '' }}</text>
      </view>
    </view>
    <view v-else class="page-od__logs-empty"><text>暂无操作记录</text></view>

    <!-- ⑤ 更多操作：白描边胶囊 hug 钮两行（D02 实测 r20 pad20/10 14 Medium） -->
    <view class="page-od__sec-head"><text class="page-od__sec-title">更多操作</text></view>
    <view class="page-od__ops">
      <view class="page-od__op pressable" @click="goVerify"><text>收款记录</text></view>
      <view class="page-od__op pressable" @click="onBuilding('文件管理')"><text>文件管理</text></view>
      <view class="page-od__op pressable" @click="onBuilding('客户档案')"><text>客户档案</text></view>
      <view class="page-od__op pressable" @click="goRefund"><text>退款/改期</text></view>
    </view>

    <!-- ⑥ 底部导航（D02 稿内保留，Variant2=订单） -->
    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D02 订单详情（画板 9:369「D02-订单详情·修正」一比一还原）
 *
 * 数据源：POST /wechat/staff/order/detail/:id（含 order + allowed_transitions，驱动可执行动作）
 *        + POST /wechat/staff/order/logs/:id（裸数组日志）
 *        + POST /wechat/staff/order/addon/list/:id（加项 name/amount）。
 * 动作按钮按后端 allowed_transitions 渲染，不在前端硬编码状态机。
 * 金额口径（元，前端只格式化不计算）：总额 total_amt / 已收 paid_amt / 待收 final_amt / 定金 deposit_amt。
 * 6 步进度映射 status（0-6）→ 步 1-6。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import { getOrderDetail, getOrderLogs, listAddons, confirmBooking, updateOrderStatus, cancelOrder } from '@/api/order'
import { formatAmount } from '@/utils/format'

const STEPS = ['预约', '定金', '拍摄', '选片', '精修', '交付']

// 目标状态 → 主行动按钮文案/动作（由后端 allowed_transitions 决定可用性，不在前端写死状态机）
const TRANS_META = {
  1: { label: '确认档期', action: 'confirm' }, // 待确认 0 → 待定金 1
  2: { label: '开始拍摄', action: 'advance' }, // → 待拍摄
  3: { label: '完成拍摄', action: 'advance' }, // → 拍摄中
  4: { label: '提交精修', action: 'advance' }, // → 精修中
  5: { label: '交付成片', action: 'advance' }, // → 待交付
  6: { label: '完成订单', action: 'advance' }, // → 已完成
  7: { label: '取消订单', action: 'cancel' },   // → 已取消
}

export default {
  components: { AppTabBar },
  data() {
    return {
      orderId: 0,
      order: {},
      transitions: [],   // 后端 allowed_transitions：当前状态可流转到的目标状态
      logs: [],           // 订单操作日志（裸数组）
      addons: [],         // 加项（单独接口取，name/amount）
      STEPS,
    }
  },
  computed: {
    /** status 0-6 → 步 1-6（0 待确认=预约中；1 已确认=定金中；2/3=拍摄；4=精修；5/6=交付） */
    currentStep() {
      const s = Number(this.order.status ?? 1)
      return [1, 2, 3, 3, 5, 6, 6, 2][s] || 2
    },
    /** Hero 徽章与 CTA（非稿态为推导，已标注） */
    heroBadge() {
      const s = Number(this.order.status ?? 1)
      const p = Number(this.order.payment_status ?? 1)
      if (s === 0) return { stateText: '待确认档期', timeText: this.dateText, ctaText: '确认档期', action: 'schedule' }
      if (s === 1 && p === 1) return { stateText: '待收款核验', timeText: this.dateText, ctaText: '收款核验', action: 'verify' }
      if (s === 2 || s === 3) return { stateText: '待开始', timeText: this.dateText, ctaText: '开始拍摄', action: 'shoot' }
      if (s === 4) return { stateText: '后期中', timeText: this.dateText, ctaText: '查看选片', action: 'select' }
      if (s === 5) return { stateText: '交付中', timeText: this.dateText, ctaText: '查看成片', action: 'select' }
      return { stateText: '已完成', timeText: this.dateText, ctaText: '查看收款', action: 'verify' }
    },
    receivedAmt() {
      /* 已收=定金已确认（payment_status>=2）→ deposit_amt；全额→ total（联调核对聚合字段） */
      const p = Number(this.order.payment_status ?? 1)
      if (p === 3) return this.order.total_amt
      if (p === 2) return this.order.deposit_amt
      return 0
    },
    dateText() {
      const d = String(this.order.shoot_date || '')
      return d ? `${d.slice(5).replace('-', '/')} ${String(this.order.shoot_time || '').split('-')[0]}` : ''
    },
    /** 主行动按钮：取 allowed_transitions 里大于当前状态的最小目标态 */
    heroAction() {
      const cur = Number(this.order.status ?? 0)
      const next = (this.transitions || []).filter((s) => s > cur).sort((a, b) => a - b)[0]
      if (next == null) return null
      const m = TRANS_META[next]
      return m ? { label: m.label, status: next, action: m.action } : null
    },
  },
  onLoad(query) {
    this.orderId = query.id
    this.fetchDetail()
  },
  methods: {
    formatAmount,
    async fetchDetail() {
      try {
        const [detail, logs, addons] = await Promise.all([
          getOrderDetail(this.orderId),
          getOrderLogs(this.orderId),
          listAddons(this.orderId),
        ])
        this.order = (detail && detail.order) || {}
        this.transitions = (detail && detail.allowed_transitions) || []
        this.logs = Array.isArray(logs) ? logs : (logs && logs.list) || []
        this.addons = Array.isArray(addons) ? addons : (addons && addons.list) || []
      } catch (e) {
        /* 接口失败：保留空态，不回落演示数据 */
        this.order = {}
        this.transitions = []
        this.logs = []
        this.addons = []
      }
    },
    onHeroAction() {
      const a = this.heroAction
      if (!a) return
      if (a.action === 'confirm') return this.confirmBooking()
      if (a.action === 'cancel') return this.goCancel()
      if (a.action === 'advance') return this.advance(a.status)
    },
    /** 确认档期：待确认(0) → 待定金(1)（员工端无 /order/confirm，封装已处理） */
    async confirmBooking() {
      try {
        await confirmBooking(this.orderId)
        uni.showToast({ title: '已确认档期', icon: 'none' })
        this.fetchDetail()
      } catch (e) {
        /* request 已统一 toast */
      }
    },
    /** 状态推进：按 allowed_transitions 推到目标态，成功后重新拉详情 */
    async advance(status) {
      try {
        await updateOrderStatus(this.orderId, status)
        uni.showToast({ title: '状态已更新', icon: 'none' })
        this.fetchDetail()
      } catch (e) {
        /* request 已统一 toast */
      }
    },
    async goCancel() {
      try {
        await cancelOrder(this.orderId, { reason: '客户取消' })
        uni.showToast({ title: '已取消订单', icon: 'none' })
        this.fetchDetail()
      } catch (e) {
        /* request 已统一 toast */
      }
    },
    goSchedule() { uni.navigateTo({ url: `/pages/schedule/confirm?id=${this.order.id}` }) },
    goVerify() { uni.navigateTo({ url: `/pages/pay/verify?id=${this.order.id}` }) },
    goRefund() { uni.navigateTo({ url: `/pages/refund/review?id=${this.order.id}` }) },
    onBuilding(name) { uni.showToast({ title: `${name}下一批开放`, icon: 'none' }) },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-od {
  padding-bottom: 220rpx;

  /* ① 顶栏（同 D01 实测规格）：标题在 375 宽头部内水平居中，返回钮独立居左 */
  &__header {
    position: relative;
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box; /* 稿 60 高，按钮/标题垂直居中（中心 y74） */
    padding: 0 $page-pad;
  }
  &__top-btn {
    position: relative;
    z-index: 1;
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
    text-align: center; /* 稿：标题在头部容器内水平居中 */
    pointer-events: none;
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  /* ② 黑 Hero 卡：343×223 #121212（实测 y114 x16；圆角稿未定义，r20 推导） */
  &__hero {
    margin: 20rpx $page-pad 0; /* 稿 y114 = header 底 104 + 10px(20rpx) */
    padding: 40rpx 34rpx 0;
    background-color: #121212;
    border-radius: 40rpx;
  }
  &__hero-head { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
  &__hero-name {
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
    max-width: 300rpx;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis; /* 稿内长名截断（如「客户 · 套餐...」） */
  }
  &__hero-badge {
    flex: none;
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 6rpx 16rpx;
    background-color: #333333; /* 实测 0.2 底 */
    border-radius: 999rpx;
    text { color: #FFDA08; font-size: 24rpx; } /* 实测金字 #FFDA08 */
  }
  &__hero-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background-color: #FFDA08; }
  &__hero-dot--sm { width: 4rpx; height: 4rpx; }
  &__hero-note { display: block; margin-top: 12rpx; color: #999999; font-size: 24rpx; } /* 实测 #999 */

  /* 金 CTA：311×52 #FFDA08（实测；圆角稿未定义，胶囊推导） */
  &__hero-cta {
    margin-top: 28rpx;
    height: 104rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FFDA08;
    border-radius: 999rpx;
    text { color: #000000; font-size: 36rpx; font-weight: 700; } /* 18 Bold 黑 实测 */
  }

  /* 6 步进度（实测 y260：22 圆 + 10px 标签，连线 2px #42434A） */
  &__steps {
    display: flex;
    align-items: flex-start;
    margin-top: 28rpx;
    padding: 24rpx 0;
    border-top: none;
  }
  &__step { flex: none; display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
  &__step-dot {
    width: 44rpx;
    height: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #42434B; /* 实测未来步底 0.2599/0.262/0.2917 */
    text { color: #DDDDDD; font-size: 20rpx; font-weight: 700; } /* 实测未来步字 0.8654 */

    &--done { background-color: #333333; } /* 实测已完成步底 #333 + 金勾 */
    /* 当前步：稿内读数为 #333 底 + #171717 字（不可见，疑为设计残留），推导金底黑字 */
    &--current { background-color: #FFDA08; text { color: #171717; } }
  }
  &__step-label {
    color: rgba(255, 255, 255, 0.6); /* 实测白 60% */
    font-size: 20rpx;
    &--current { color: #FFDA08; font-weight: 700; } /* 实测当前步金 Bold */
  }
  &__step-line {
    flex: 1;
    height: 4rpx;
    margin-top: 20rpx; /* 线中心对齐圆心：圆点 44rpx 圆心在 22rpx，线高 4rpx → 22-2=20 */
    background-color: #42434A;
  }

  /* ③④⑤ 区块标题：15 Bold #151617（实测 x18） */
  &__sec-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 44rpx 36rpx 20rpx;
  }
  &__sec-title { color: $text-1; font-size: 30rpx; font-weight: 700; }
  &__quote-badge {
    padding: 6rpx 18rpx;
    background-color: $badge-green-bg;
    border-radius: 999rpx;
    text { color: $badge-green-text; font-size: $fs-xs; font-weight: 500; line-height: 36rpx; }
  }

  /* ③ 套餐卡（实测 344×190 白；圆角稿未定义，r16 推导） */
  &__pkg {
    margin: 0 $page-pad;
    padding: 28rpx 32rpx;
    background-color: $white;
    border-radius: $radius-card;
  }
  &__pkg-row { display: flex; align-items: center; justify-content: space-between; padding: 12rpx 0; }
  &__pkg-name { color: $text-1; font-size: 28rpx; font-weight: 700; } /* 14 Bold 实测 */
  &__pkg-price { color: #333333; font-size: 30rpx; font-weight: 700; font-family: $font-family-num; } /* 15 Bold 实测 */
  &__pkg-meta { display: block; margin-top: 8rpx; color: #666666; font-size: 24rpx; } /* 12 #666 实测 */
  &__pkg-hairline { height: 2rpx; background-color: #EEEEEE; margin: 16rpx 0; } /* 实测 #EEE */
  &__pkg-addon { color: #666666; font-size: 28rpx; } /* 14 #666 实测 */
  &__pkg-addon-price { color: #333333; font-size: 28rpx; font-weight: 700; font-family: $font-family-num; }

  /* ④ 订单信息卡：白 r20，行 pad16/10 行间 9% 线（实测） */
  &__info {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 40rpx;
    overflow: hidden;
  }
  /* 布局与行高由公共类 .info-row 统一（44px 行高，2026-09-08 全站统一口径） */
  &__info-row {
    &--last { border-bottom: none; }
  }
  &__info-label { color: $text-2; font-size: 28rpx; } /* 14 #747881 实测 */
  &__info-value { color: #333333; font-size: 28rpx; font-weight: 700; font-family: $font-family-num; }
  &__info-value--ok { color: $badge-green-text; }   /* 已收绿 #20845C 实测 */
  &__info-value--gold { color: #F59E0B; }           /* 待收金 #F59E0B 实测 */
  &__info-value--plain { font-weight: 400; }
  &__info-right { display: flex; align-items: center; gap: 12rpx; }

  /* ④-② 操作记录（裸数组日志） */
  &__logs {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: $radius-card;
    padding: 8rpx 32rpx;
  }
  &__log {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #EEEEEE;
    &:last-child { border-bottom: none; }
  }
  &__log-main { flex: 1; min-width: 0; }
  &__log-action { display: block; color: $text-1; font-size: 28rpx; font-weight: 700; }
  &__log-content { display: block; margin-top: 6rpx; color: #747881; font-size: 24rpx; line-height: 34rpx; }
  &__log-time { flex: none; color: #A0A3A8; font-size: 22rpx; font-family: $font-family-num; }
  &__logs-empty {
    margin: 0 $page-pad;
    padding: 40rpx 32rpx;
    background-color: $white;
    border-radius: $radius-card;
    text { color: #A0A3A8; font-size: 26rpx; }
  }

  /* ⑤ 更多操作：白底 10% 黑描边 r20 pad20/10 14 Medium（实测 hug 两行） */
  &__ops {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    padding: 0 $page-pad;
  }
  &__op {
    padding: 20rpx 40rpx;
    background-color: $white;
    border: 1rpx solid rgba(0, 0, 0, 0.1);
    border-radius: 40rpx;
    text { color: #333333; font-size: 28rpx; font-weight: 500; }
  }
}
</style>
