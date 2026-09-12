<template>
  <view class="page-list page-wrap">
    <!-- ① 顶栏：44 圆钮（白 88% + 阴影，加号=录入订单入口）+ 标题「订单」17 Bold（D01 实测 y44 h60 pad16） -->
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起（1:8122 等实测） -->
    <view class="status-bar" />
    <view class="page-list__header">
      <view class="page-list__top-btn pressable" @click="goEntry">
        <!-- 加号与首页（工作台 Hero 圆钮）统一：同用画板导出的 plus-head-dark
             （加号主体占画布 11.67/20，原 plus-dark 撑满画布致 44 圆内显得过大） -->
        <AppIcon name="plus-head-dark" :size="20" />
      </view>
      <text class="page-list__title">订单</text>
    </view>

    <!-- ② 线索入口：一行入口进「线索列表」（线索不铺在订单页上）。
         设计依据：线索→报价→订单是同一条业务链，入口跟在订单旁；金调区分"未成交"。
         数据源：待报价数量走 /api/lead/list?status=pending（联调核对）。 -->
    <view v-if="leadCount" class="page-list__lead-entry pressable" @click="goLeadList">
      <view class="page-list__lead-entry-left">
        <text class="page-list__lead-entry-title">待报价</text>
        <view class="page-list__lead-entry-badge"><text>{{ leadCount }}</text></view>
      </view>
      <view class="page-list__lead-entry-right">
        <text>查看全部</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- ③ 状态 Tab：白容器 343×44，选中黑块 112×40（D01 实测；容器/黑块圆角稿未定义，r22 推导） -->
    <view class="page-list__tabs">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="page-list__tab pressable"
        :class="{ 'page-list__tab--on': tab === t.key }"
        @click="tab = t.key"
      >
        <text class="page-list__tab-text">{{ t.label }}</text>
        <text v-if="counts[t.key] != null" class="page-list__tab-count">{{ counts[t.key] }}</text>
      </view>
    </view>

    <!-- ③ 订单卡列表：白 r16，行间 9% 深灰分隔线（D01 实测） -->
    <view class="page-list__card">
      <view
        v-for="(o, i) in filtered"
        :key="o.id"
        class="page-list__row pressable"
        :class="{ 'page-list__row--line': i > 0 }"
        @click="goDetail(o)"
      >
        <view class="page-list__row-main">
          <view class="page-list__row-head">
            <text class="page-list__name">{{ o.customer_name }}</text>
            <view class="page-list__badge" :class="`page-list__badge--${badgeTone(o)}`">
              <text>{{ o.status_text }}</text>
            </view>
          </view>
          <text class="page-list__sub">{{ subText(o) }}</text>
        </view>
        <view class="page-list__row-side">
          <text class="page-list__amount">¥{{ formatAmount(o.total_amt) }}</text>
          <text class="page-list__pay">{{ payText(o) }}</text>
        </view>
      </view>
      <AppEmpty v-if="!loading && !filtered.length" text="暂无相关订单" />
    </view>

    <!-- ④ 底部导航（1:8370 实测 Variant2=订单） -->
    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D01 订单列表（画板 1:8122 一比一还原）
 *
 * 数据源：摄影师订单列表（后端 /api/order/list，字段联调核对；biz_order 用
 *   code/package_name/customer/shoot_date/total_amt/status/payment_status）。
 * Tab 过滤（稿口径）：进行中=status 0-5 / 待付款=payment_status=1 / 已完成=status 6。
 * 收款态文案（右列）：未收款/定金已收/尾款待收/已收齐（D01 稿内样例，映射联调核对）。
 * 演示兜底：接口失败用 DEMO_ORDERS（联调后移除）。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import AppEmpty from '@/components/AppEmpty.vue'
import { getOrderList } from '@/api/order'
import { formatAmount } from '@/utils/format'
import { DEMO_ORDERS, isDemo } from '@/utils/demo'

export default {
  components: { AppTabBar, AppEmpty },
  data() {
    return {
      tab: 'doing',
      tabs: [
        { key: 'doing', label: '进行中' },
        { key: 'unpaid', label: '待付款' },
        { key: 'done', label: '已完成' },
      ],
      orders: [],
      loading: false,
      /* 待报价线索数（演示兜底；联调后取 /api/lead/list?status=pending 的 total） */
      leadCount: 2,
    }
  },
  computed: {
    filtered() {
      if (this.tab === 'unpaid') return this.orders.filter((o) => Number(o.payment_status) === 1)
      if (this.tab === 'done') return this.orders.filter((o) => Number(o.status) === 6)
      return this.orders.filter((o) => Number(o.status) >= 0 && Number(o.status) <= 5)
    },
    counts() {
      return {
        doing: this.orders.filter((o) => Number(o.status) >= 0 && Number(o.status) <= 5).length,
        unpaid: this.orders.filter((o) => Number(o.payment_status) === 1).length,
        /* 稿内「已完成」tab 无计数，保持 null 不渲染 */
        done: null,
      }
    },
  },
  onShow() {
    this.fetchOrders()
  },
  methods: {
    formatAmount,
    /* 进「线索列表」（待处理 / 全部 / 已报价） */
    goLeadList() {
      uni.navigateTo({ url: '/pages/lead/list' })
    },
    async fetchOrders() {
      /* 演示模式（联调后移除）：直接读本地演示订单 */
      if (isDemo()) {
        this.orders = DEMO_ORDERS
        return
      }
      this.loading = true
      try {
        const res = await getOrderList({ page: 1, page_size: 20 })
        this.orders = (res && res.data && res.data.list) || []
      } catch (e) {
        /* 接口未联调：降级演示数据（联调后移除） */
        this.orders = DEMO_ORDERS
      } finally {
        this.loading = false
      }
    },
    /** 徽章色调：映射 enums 订单状态 → D01 稿内四族（金/灰/绿/红） */
    badgeTone(o) {
      const s = Number(o.status)
      if (s === 6) return 'green'          // 已完成/待交付 绿
      if (s === 7 || o.refund_pending) return 'red'
      if (s <= 1) return 'gold'            // 待确认/待收款 金
      return 'gray'                        // 拍摄中/后期中 灰
    },
    /** 副标题：套餐 · 日期 · 地点（D01 稿内样例格式） */
    subText(o) {
      const d = String(o.shoot_date || '')
      return [o.package_name, d.slice(5).replace('-', '/'), o.shoot_address].filter(Boolean).join(' · ')
    },
    /** 收款态：D01 稿内样例四态（未收款/定金已收/尾款待收/已收齐），映射联调核对 */
    payText(o) {
      const p = Number(o.payment_status)
      if (p === 3) return '已收齐'
      if (p === 2) return Number(o.status) >= 4 ? '尾款待收' : '定金已收'
      return '未收款'
    },
    goDetail(o) {
      uni.navigateTo({ url: `/pages/order/detail?id=${o.id}` })
    },
    /** 顶部 44 圆钮（2026-09-08 用户定稿）：加号 = 录入订单入口，跳 D16 录入订单 */
    goEntry() {
      uni.navigateTo({ url: '/pages/order/entry' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-list {
  padding-bottom: 200rpx; /* 底导航 83px + 安全区留白 */

  /* ① 顶栏：y44 h60 pad16（H5 无状态栏，顶部留白用 padding 实现） */
  &__header {
    position: relative; /* 标题绝对居中（2026-09-08 用户定稿：所有头部标题居中） */
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box; /* 稿 60 含 padding，content-box 会叠加到 68 */
    padding: 0 $page-pad;
    /* 稿：按钮/标题在 60 容器内垂直居中（中心 y74），无额外 padding */
  }
  &__top-btn {
    box-sizing: border-box; /* 稿 44 含描边 */
    width: 88rpx;   /* 44px */
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.88); /* 实测白 88% */
    border: 1rpx solid rgba(21, 22, 23, 0.05);   /* 实测 5% 深描边 */
    border-radius: 50%;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 23, 0.055); /* 实测投影 y5 r16 5.5% */
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center; /* 头部标题水平居中（用户定稿） */
    pointer-events: none;
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700; } /* 17 Bold 实测 */

  /* ② 线索入口：一行入口进「线索列表」（线索不铺在订单页上） */
  &__lead-entry {
    display: flex;
    align-items: center;
    margin: 20rpx $page-pad 0;
    padding: 0 28rpx;
    height: 104rpx;              /* 52 */
    background-color: $white;
    border: 1rpx solid #F0DFB0;  /* 金调描边：与订单卡的灰白体系区分，一眼可辨"未成交" */
    border-radius: 32rpx;
  }
  &__lead-entry-left { display: flex; align-items: center; gap: 16rpx; }
  &__lead-entry-title { font-size: 30rpx; font-weight: 600; color: #151518; }
  &__lead-entry-badge {
    box-sizing: border-box;
    padding: 4rpx 18rpx;
    border-radius: 999rpx;
    background-color: #FFF3D6;
    text { font-size: 22rpx; font-weight: 600; color: #B47200; }
  }
  &__lead-entry-right {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-left: auto;
    text { font-size: 25rpx; color: #747881; }
  }

  /* ③ Tab：343×44 白容器，选中黑块 112×40（稿 Rectangle64 r16px、Rectangle65 r14px 实测） */
  &__tabs {
    display: flex;
    margin: 20rpx $page-pad 0; /* 实测 tab y114 = header 底 104 + 10 */
    height: 88rpx;
    box-sizing: border-box; /* 稿 44 含内衬 */
    background-color: $white;
    border-radius: 32rpx; /* 稿 r16px */
    padding: 4rpx;
  }
  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    border-radius: 28rpx; /* 稿 Rectangle65 r14px（黑块高40px非全胶囊） */

    &--on { background-color: $tab-active; } /* 实测 #121212 */
    &--on .page-list__tab-text { color: $white; font-weight: 700; }
  }
  &__tab-text { color: #666666; font-size: 26rpx; } /* 实测 13 Regular #666 */
  &__tab-count { color: #9CA3AF; font-size: 24rpx; } /* 实测 12 #9CA3AF */

  /* ③ 订单卡：343 白 r16（实测 y178 = tab 底 + 20） */
  &__card {
    margin: 40rpx $page-pad 0;
    background-color: $white;
    border-radius: $radius-card;
    overflow: hidden;
  }
  &__row {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    padding: 26rpx 32rpx; /* 实测 13/16 */

    &--line { border-top: 1rpx solid rgba(21, 22, 23, 0.09); } /* 实测 9% 深分隔线 */
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-head { display: flex; align-items: center; gap: 16rpx; }
  &__name { color: $text-1; font-size: 30rpx; font-weight: 700; } /* 15 Bold 实测 */
  &__badge {
    padding: 6rpx 18rpx; /* 实测 3/9 */
    border-radius: 999rpx;
    text { font-size: $fs-xs; font-weight: 500; line-height: 36rpx; } /* 11 Medium lh18 实测 */

    &--gold { background-color: $badge-gold-bg; text { color: $badge-gold-text; } }
    &--gray { background-color: $badge-gray-bg; text { color: $text-2; } }
    &--green { background-color: $badge-green-bg; text { color: $badge-green-text; } }
    &--red { background-color: $badge-red-bg; text { color: $dot-booked; } }
  }
  &__sub {
    display: block;
    margin-top: 2rpx;
    color: $text-2;
    font-size: 24rpx;
    line-height: 35rpx; /* 实测 lh17.4 */
  }
  &__row-side { flex: none; display: flex; flex-direction: column; align-items: flex-end; }
  &__amount { color: $text-1; font-size: 30rpx; font-weight: 700; font-family: $font-family-num; } /* 15 Bold 实测 */
  &__pay { color: $text-2; font-size: 24rpx; margin-top: 4rpx; }
}
</style>
