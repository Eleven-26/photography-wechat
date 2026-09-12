<template>
  <view class="page-prs page-wrap">
    <!-- ① 顶栏：返回 + 「改期申请」（D15 实测 y44 h60） -->
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起（1:8122 等实测） -->
    <view class="status-bar" />
    <view class="page-prs__header">
      <view class="page-prs__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <text class="page-prs__title">改期申请</text>
    </view>

    <!-- ② 订单摘要卡（D15 Group 实测 y114，公共组件） -->
    <AppOrderBrief
      :name="order.customer_name"
      :package-name="order.package_name"
      :code="order.code"
      :subtitle="order.subtitle"
    />

    <!-- ③ 绿状态卡：白底绿描边 #2FAF5E + 绿圆勾 40（实测 343×74 y196） -->
    <view class="page-prs__status">
      <AppIcon name="check-green-lg" :size="40" />
      <view class="page-prs__status-text">
        <text class="page-prs__status-title">符合改期条件</text>
        <text class="page-prs__status-sub">拍摄未开始 · 距拍摄 6 天 · 不收调度费</text>
      </view>
    </view>

    <!-- ④ 档期变更：原档期灰块 → 黑圆换向箭头 → 新档期金浅底块（实测 341×164 y320） -->
    <text class="page-prs__sec-title">档期变更</text>
    <view class="page-prs__change">
      <view class="page-prs__change-cards">
        <!-- 原档期：#F2F3F5 + 描边 #CCCCCC（实测） -->
        <view class="page-prs__slot page-prs__slot--old">
          <text class="page-prs__slot-label">原档期</text>
          <text class="page-prs__slot-muted">{{ change.old_date }}</text>
          <text class="page-prs__slot-muted">{{ change.old_time }}</text>
          <view class="page-prs__slot-foot">
            <text class="page-prs__slot-addr">{{ change.address }}</text>
            <view class="page-prs__slot-dot" />
            <text class="page-prs__slot-addr">{{ change.duration }}</text>
          </view>
        </view>
        <!-- 换向箭头：黑圆 30 + 白箭头（实测圆 #171819 30×30，箭头 10×7.7 白，居中） -->
        <view class="page-prs__change-arrow">
          <AppIcon name="arrow-swap" :size="14" />
        </view>
        <!-- 新档期：金浅底 #FFF9D9（实测），日期/时间金 #B66E00 -->
        <view class="page-prs__slot page-prs__slot--new">
          <text class="page-prs__slot-label">新档期</text>
          <text class="page-prs__slot-gold">{{ change.new_date }}</text>
          <text class="page-prs__slot-gold">{{ change.new_time }}</text>
          <view class="page-prs__slot-foot">
            <text class="page-prs__slot-addr">{{ change.address }}</text>
            <view class="page-prs__slot-dot" />
            <text class="page-prs__slot-addr">{{ change.duration }}</text>
          </view>
        </view>
      </view>
      <!-- 费用变化行（实测 y450：左 #666 15，右绿 15 Medium） -->
      <view class="page-prs__change-foot">
        <text class="page-prs__change-label">费用变化</text>
        <text class="page-prs__change-fee">￥{{ change.fee_text }} {{ change.fee_note }}</text>
      </view>
    </view>

    <!-- ⑤ 改期原因：灰块（实测 341×112 y534，文案两行） -->
    <text class="page-prs__sec-title">改期原因</text>
    <view class="page-prs__reason">
      <view class="page-prs__reason-block">
        <text class="page-prs__reason-tag">{{ change.reason_tag }}</text>
        <text class="page-prs__reason-text">{{ change.reason }}</text>
      </view>
    </view>

    <!-- ⑥ 客户联系卡（D15 Rectangle 152 实测 y666，公共组件） -->
    <AppContactCard :name="order.customer_name" :sub="order.contact_sub" @phone="onPhone" @wechat="onWechat" />

    <!-- ⑦ 底部双钮：白描边「拒绝申请」+ 黑「同意改期」（实测 r999 h52 y798） -->
    <view class="page-prs__footer">
      <view class="page-prs__btn page-prs__btn--ghost pressable" @click="submit(false)"><text>拒绝申请</text></view>
      <view class="page-prs__btn page-prs__btn--solid pressable" :class="{ 'page-prs__btn--loading': submitting }" @click="submit(true)">
        <text>{{ submitting ? '提交中…' : '同意改期' }}</text>
      </view>
    </view>

    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D15 改期申请审核（画板 1:3880「D15-改期申请」一比一还原）
 *
 * 业务：客户发起改期申请（biz_calendar_change，status=0 待审核）→ 摄影师审核：
 *   同意 → 档期变更生效（原档期释放、新档期锁定），费用变化随单展示；
 *   拒绝 → 申请驳回，档期不变。
 * 改期口径：72h 外免费 / 72h 内 20% 调度费 / 24h 内不可改（本稿 6 天 = 免调度费场景）。
 * 数据：改期申请单（原/新档期 + 费用）+ 订单摘要；审核走 /calendar/audit/:id（联调核对）。
 * 演示数据：联调后移除。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import { auditReschedule } from '@/api/order'
import { isDemo } from '@/utils/demo'

export default {
  components: { AppTabBar },
  data() {
    return {
      orderId: 0,
      changeId: 0,
      submitting: false,
      /* 订单摘要（演示数据对齐 D15 稿值，联调后移除） */
      order: {
        customer_name: '陈雨',
        package_name: '家庭纪念写真',
        code: 'SL-260808-12',
        subtitle: '8/8 10:00 拍摄 · 越秀公园 · 2大1小',
        contact_sub: '138****2874 · 已确认收款',
      },
      /* 改期申请单（真实结构 = biz_calendar_change 行 + 订单聚合，联调核对） */
      change: {
        id: 0,
        old_date: '8/8 周六',
        old_time: '10:00',
        new_date: '8/8 周六',
        new_time: '10:00',
        address: '越秀公园',
        duration: '约2.5h',
        fee_text: '0',
        fee_note: '套餐与加项不变',
        reason_tag: '时间冲突',
        reason: '家里临时有事，想改到下周六同一时间，公园和内容都不变，麻烦老师了。',
      },
    }
  },
  onLoad(query) {
    this.orderId = query.id
    this.changeId = query.changeId
    this.fetchData()
  },
  methods: {
    async fetchData() {
      if (isDemo()) return /* 演示态直接用稿值 */
      /* 联调：getRescheduleDetail(changeId) 取申请单聚合（联调核对） */
    },
    /** 审核改期：/calendar/audit/:id（联调核对）；演示直接成功（联调后移除） */
    async submit(approve) {
      if (this.submitting) return
      this.submitting = true
      try {
        if (!isDemo()) {
          await auditReschedule(this.changeId, { approve })
        }
        uni.showToast({ title: approve ? '已同意，档期已变更' : '已拒绝该申请', icon: 'none' })
        setTimeout(() => this.goBack(), 600)
      } catch (e) {
        uni.showToast({ title: (e && e.message) || '提交失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    onPhone() {
      uni.makePhoneCall({ phoneNumber: '13800002874', fail: () => {} })
    },
    onWechat() {
      uni.setClipboardData({ data: 'chenyu_88', success: () => uni.showToast({ title: '微信号已复制', icon: 'none' }) })
    },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-prs {
  padding-bottom: 300rpx;

  /* ① 顶栏（同 D01/D12/D14 实测规格） */
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

  /* ③ 绿状态卡：白底绿描边 #2FAF5E（实测）r16 推导 */
  &__status {
    display: flex;
    align-items: center;
    gap: 26rpx;
    margin: 16rpx $page-pad 0;
    padding: 32rpx; /* 实测：标题 y212-卡顶 y196 = 16px 上下对称 */
    background-color: $white;
    border: 1rpx solid #2FAF5E;
    border-radius: $radius-card;
  }
  &__status-text {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  &__status-title { color: #2FAF5E; font-size: 30rpx; font-weight: 700; line-height: 40rpx; }
  &__status-sub { color: #666666; font-size: 24rpx; line-height: 24rpx; }

  /* ④ 区块标题（同 D14） */
  &__sec-title {
    display: block;
    padding: 40rpx 36rpx 20rpx;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }

  /* 档期变更卡（实测 341×164） */
  &__change {
    margin: 0 $page-pad;
    padding: 32rpx 40rpx;
    background-color: $white;
    border-radius: $radius-card;
  }
  &__change-cards {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__change-arrow {
    flex-shrink: 0;
    width: 60rpx;   /* 实测 30 黑圆 */
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #171819; /* 实测稿 Ellipse 23 */
    border-radius: 50%;
  }

  /* 单个档期块 128×100（实测：原=灰 #F2F3F5+描边#CCC，新=金浅底 #FFF9D9） */
  &__slot {
    width: 256rpx;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    border-radius: 24rpx; /* 推导：稿档期块未标圆角 */

    &--old {
      background-color: #F2F3F5;
      border: 1rpx solid #CCCCCC;
    }
    &--new { background-color: #FFF9D9; }
  }
  &__slot-label { color: #666666; font-size: 30rpx; line-height: 30rpx; }
  &__slot-muted { color: #999999; font-size: 30rpx; line-height: 30rpx; }
  &__slot-gold { color: #B66E00; font-size: 30rpx; line-height: 30rpx; }
  &__slot-foot {
    display: flex;
    align-items: center;
    gap: 8rpx;
    width: max-content; /* 稿内「越秀公园·约2.5h」视觉上贴满块宽（超内容区不换行），与稿一致允许贴边 */
    white-space: nowrap;
    text { flex-shrink: 0; } /* 防 flex 压缩导致「越秀公/园」断行 */
  }
  &__slot-addr { color: #666666; font-size: 30rpx; line-height: 30rpx; }
  &__slot-dot {
    width: 4rpx;
    height: 4rpx;
    background-color: #666666;
    border-radius: 50%;
  }

  /* 费用变化行（实测 y450） */
  &__change-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 52rpx;
  }
  &__change-label { color: #666666; font-size: 30rpx; line-height: 36rpx; }
  &__change-fee { color: #2FAF5E; font-size: 30rpx; font-weight: 500; line-height: 36rpx; }

  /* ⑤ 改期原因卡：灰块（实测 341×112，两行文案 lh22） */
  &__reason {
    margin: 0 $page-pad;
    padding: 24rpx 24rpx;
    background-color: $white;
    border-radius: $radius-card;
  }
  &__reason-block {
    padding: 24rpx;
    background-color: #F2F3F5;
    border-radius: 16rpx; /* 推导：稿灰块未标圆角 */
  }
  &__reason-tag { display: block; color: #666666; font-size: 24rpx; font-weight: 500; line-height: 24rpx; }
  &__reason-text { display: block; margin-top: 12rpx; color: #333333; font-size: 24rpx; font-weight: 500; line-height: 44rpx; }

  /* ⑦ 底部双钮（同 D12/D14 实测规格） */
  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 166rpx;
    z-index: 99;
    display: flex;
    gap: 20rpx;
    padding: 20rpx $page-pad;
    background: linear-gradient(to top, rgba(242, 243, 245, 1) 70%, rgba(242, 243, 245, 0));
  }
  &__btn {
    flex: 1;
    height: 104rpx;
    box-sizing: border-box; /* 稿 52 含描边，content-box 会撑到 54 */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999rpx;
    text { font-size: 30rpx; font-weight: 700; }

    &--ghost {
      background-color: $white;
      border: 1rpx solid rgba(21, 22, 23, 0.09);
      text { color: $text-1; }
    }
    &--solid {
      background-color: $btn-primary;
      text { color: $white; }
    }
    &--loading { opacity: 0.6; }
  }
}
</style>
