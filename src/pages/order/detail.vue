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
      <text class="page-od__hero-note">{{ order.note || '暂无备注' }}</text>
      <view class="page-od__hero-cta pressable" @click="onHeroAction">
        <text>{{ heroBadge.ctaText }}</text>
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
      <view v-if="order.quote_tag" class="page-od__quote-badge"><text>{{ order.quote_tag }}</text></view>
    </view>
    <view class="page-od__pkg">
      <view class="page-od__pkg-row">
        <text class="page-od__pkg-name">{{ order.package_name }}</text>
        <text class="page-od__pkg-price">¥{{ formatAmount(order.package_price || order.total_amt) }}</text>
      </view>
      <text class="page-od__pkg-meta">{{ order.package_meta || '' }}</text>
      <template v-for="(a, i) in order.addons || []" :key="i">
        <view class="page-od__pkg-hairline" />
        <view class="page-od__pkg-row page-od__pkg-row--addon">
          <text class="page-od__pkg-addon">+{{ a.name }}</text>
          <text class="page-od__pkg-addon-price">+{{ a.price }}</text>
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

    <!-- ⑤ 更多操作：白描边胶囊 hug 钮两行（D02 实测 r20 pad20/10 14 Medium） -->
    <view class="page-od__sec-head"><text class="page-od__sec-title">更多操作</text></view>
    <view class="page-od__ops">
      <view class="page-od__op pressable" @click="goVerify"><text>收款记录</text></view>
      <view class="page-od__op pressable" @click="onBuilding('文件管理')"><text>文件管理</text></view>
      <view class="page-od__op pressable" @click="onBuilding('客户档案')"><text>客户档案</text></view>
      <view class="page-od__op pressable" @click="onBuilding('操作记录')"><text>操作记录</text></view>
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
 * 数据源：/api/order/detail（聚合 reschedule/refund，联调核对）；演示兜底 demoOrderById（联调后移除）。
 * Hero 动态态（稿只给出「待开始·今日10:00 + 开始拍摄」态，其余态按业务口径推导已标注）：
 *   status 0 → 待确认档期（跳 D03 档期确认）
 *   status 1 + payment_status 1 → 待收款核验（跳 D12 收款核验）
 *   status 2/3 → 待开始·时间（稿态；「开始拍摄」当前 toast，拍摄态属后续批次）
 * 金额口径：总额=套餐+加项（biz_order_addon）；已收=已确认收款合计；待收=final_amt。
 * 6 步进度映射 status（0-6）→ 步 1-6（联调核对）。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import { getOrderDetail } from '@/api/order'
import { formatAmount } from '@/utils/format'
import { demoOrderById, isDemo } from '@/utils/demo'

const STEPS = ['预约', '定金', '拍摄', '选片', '精修', '交付']

export default {
  components: { AppTabBar },
  data() {
    return {
      orderId: 0,
      order: {},
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
  },
  onLoad(query) {
    this.orderId = query.id
    this.fetchDetail()
  },
  methods: {
    formatAmount,
    async fetchDetail() {
      if (isDemo()) {
        this.order = demoOrderById(this.orderId)
        return
      }
      try {
        const res = await getOrderDetail(this.orderId)
        const data = (res && res.data) || {}
        this.order = data.order || data
      } catch (e) {
        /* 接口未联调：降级 D02 稿态演示数据（联调后移除） */
        this.order = demoOrderById(this.orderId)
      }
    },
    onHeroAction() {
      const a = this.heroBadge.action
      if (a === 'schedule') return this.goSchedule()
      if (a === 'verify') return this.goVerify()
      if (a === 'select') return uni.navigateTo({ url: `/pages/select/result?id=${this.order.id}` })
      /* 「开始拍摄」：拍摄态操作属后续批次（D 组拍摄/上传画板），先确认提示 */
      uni.showToast({ title: '拍摄态操作下一批开放', icon: 'none' })
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
    text-overflow: ellipsis; /* 稿内「陈雨 · 家庭纪...」截断 */
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
