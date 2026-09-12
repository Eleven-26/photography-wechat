<template>
  <view class="page-pfr page-wrap">
    <!-- ① 顶栏：返回 + 「退款申请」（D14 实测 y44 h60） -->
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起（1:8122 等实测） -->
    <view class="status-bar" />
    <view class="page-pfr__header">
      <view class="page-pfr__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <text class="page-pfr__title">退款申请</text>
    </view>

    <!-- ② 订单摘要卡（D14 Group 实测 y114） -->
    <AppOrderBrief
      :name="order.customer_name"
      :package-name="order.package_name"
      :code="order.code"
      :subtitle="order.subtitle"
    />

    <!-- ③ 金警示卡：白底金描边 #D9A735 r16（实测 343×74 y196）
         三态共用卡体：review/transfer 金框（D14/D14-2），confirming 绿框（D14-3 推导描边色随徽章） -->
    <view class="page-pfr__alert" :class="{ 'page-pfr__alert--green': stage === 'confirming' }">
      <view class="page-pfr__alert-main">
        <text class="page-pfr__alert-title" :class="{ 'page-pfr__alert-title--green': stage === 'confirming' }">
          {{ stage === 'confirming' ? '待客户确认' : '待处理' }}
        </text>
        <view class="page-pfr__alert-dot" />
        <text v-if="stage !== 'confirming'" class="page-pfr__alert-title">退款申请</text>
        <text class="page-pfr__alert-amount">￥{{ formatAmount(refund.amount) }}</text>
      </view>
      <text class="page-pfr__alert-sub">
        {{ stage === 'confirming' ? '客户在 H5 确认收到 ¥' + formatAmount(refund.amount) + ' 后，订单自动完结' : '客户申请取消并退定金 ¥' + formatAmount(refund.amount) + ' · 系统校验已通过' }}
      </text>
    </view>

    <!-- ④ 退款明细：5 行白卡（实测 y320，行间 hairline #151617@9%） -->
    <text class="page-pfr__sec-title">退款明细</text>
    <view class="page-pfr__detail">
      <view class="info-row page-pfr__row">
        <text class="page-pfr__label">订单总额</text>
        <text class="page-pfr__value">¥{{ formatAmount(refund.total_amt) }}</text>
      </view>
      <view class="info-row page-pfr__row">
        <text class="page-pfr__label">已收定金</text>
        <text class="page-pfr__value">¥{{ formatAmount(refund.paid_amt) }}</text>
      </view>
      <view class="info-row page-pfr__row">
        <text class="page-pfr__label">退款比例</text>
        <text class="page-pfr__value page-pfr__value--green">{{ refund.rate_text }}</text>
      </view>
      <view class="info-row page-pfr__row">
        <text class="page-pfr__label">需退款</text>
        <text class="page-pfr__value page-pfr__value--refund">¥{{ formatAmount(refund.amount) }}</text>
      </view>
      <view class="info-row info-row--last page-pfr__row page-pfr__row--last">
        <text class="page-pfr__label">客户收款方式</text>
        <text class="page-pfr__value page-pfr__value--strong">{{ refund.channel_text }}</text>
      </view>
    </view>

    <!-- ⑤ 客户联系卡（D14 Rectangle 152 实测 y660，公共组件；仅审核态展示） -->
    <AppContactCard v-if="stage === 'review'" :name="order.customer_name" :sub="order.contact_sub" @phone="onPhone" @wechat="onWechat" />

    <!-- ⑥ 取消原因：灰块 + 系统校验行（实测 341×114 y832；仅审核态展示） -->
    <template v-if="stage === 'review'">
    <text class="page-pfr__sec-title">取消原因</text>
    <view class="page-pfr__reason">
      <view class="page-pfr__reason-block">
        <text class="page-pfr__reason-tag">{{ refund.reason_tag }}</text>
        <text class="page-pfr__reason-text">{{ refund.reason }}</text>
      </view>
      <view class="page-pfr__reason-foot">
        <text class="page-pfr__reason-label">系统校验</text>
        <text class="page-pfr__reason-ok">{{ refund.check_text }}</text>
      </view>
    </view>
    </template>

    <!-- ⑥' 转账凭证卡（D14-2「上传转账凭证」/D14-3「重新上传凭证」实测文本；仅后两态展示）
         稿内按钮文案「已上传账凭证」「从新上传凭证」为疑似错字，按语义实现为「已上传转账凭证」「重新上传凭证」并在此标注 -->
    <template v-if="stage !== 'review'">
      <text class="page-pfr__sec-title">{{ stage === 'confirming' ? '重新上传凭证' : '上传转账凭证' }}</text>
      <view class="page-pfr__voucher" @click="uploadVoucher">
        <view class="page-pfr__voucher-row">
          <AppIcon name="upload-amber" :size="18" />
          <text class="page-pfr__voucher-title">{{ stage === 'confirming' ? '凭证已提交 · 如转账有误可重新上传' : '点击上传转账凭证' }}</text>
        </view>
        <text class="page-pfr__voucher-sub">微信/银行卡转账成功后，截图上传凭证 · 客户会收到确认通知</text>
        <text class="page-pfr__voucher-sub page-pfr__voucher-sub--tip">
          {{ stage === 'confirming' ? '客户在 H5 确认收到退款后，订单自动完结（已取消 · 已退款）' : '已批准 2 天 · 请尽快转账，超 72h 未上传凭证系统将提醒客户与你沟通' }}
        </text>
      </view>
    </template>

    <!-- ⑦ 灰提示卡（实测 343×61 #E6E7EB y956） -->
    <view class="page-pfr__tip">
      <AppIcon name="info-gray-sm" :size="13" />
      <text class="page-pfr__tip-text">同意后：档期自动释放 · 进入「待转账」，请你线下转账后上传凭证</text>
    </view>

    <!-- ⑧ 底部按钮：审核态双钮（D14）；transfer/confirming 单黑钮（D14-2/3，推导：稿深底白字钮） -->
    <view class="page-pfr__footer">
      <template v-if="stage === 'review'">
        <view class="page-pfr__btn page-pfr__btn--ghost pressable" @click="submit(false)"><text>拒绝申请</text></view>
        <view class="page-pfr__btn page-pfr__btn--solid pressable" :class="{ 'page-pfr__btn--loading': submitting }" @click="submit(true)">
          <text>{{ submitting ? '提交中…' : '同意取消' }}</text>
        </view>
      </template>
      <view v-else class="page-pfr__btn page-pfr__btn--solid page-pfr__btn--solo pressable" @click="onStageAction">
        <text>{{ stage === 'confirming' ? '通知客户确认' : '已上传转账凭证' }}</text>
      </view>
    </view>

    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D14 退款申请审核（画板 1:3641「D14 退款申请」一比一还原）
 *
 * 业务：客户取消订单并发起退款申请（biz_refund，status=0 待审核）→ 摄影师审核：
 *   同意 → 订单取消、档期释放、进入「待转账」（摄影师线下转账后登记凭证）；
 *   拒绝 → 申请驳回，订单恢复原状态。
 * 系统校验口径：取消政策 48-72h 退 80% / 24-48h 退 50% / 72h+ 全额（全额退款场景为 72h+）。
 * 数据：refund 申请单（金额/比例/收款方式）+ 订单摘要；审核走 /refund/audit/:id（联调核对）。
 * 演示数据：联调后移除。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import { auditRefund } from '@/api/order'
import { formatAmount } from '@/utils/format'
import { isDemo } from '@/utils/demo'

export default {
  components: { AppTabBar },
  data() {
    return {
      orderId: 0,
      refundId: 0,
      submitting: false,
      /* 页面三态（对应画板 D14 / D14-2 / D14-3）：
         review     待审核（默认，双钮）
         transfer   已批准待上传凭证（单钮「已上传转账凭证」）
         confirming 待客户确认（单钮「通知客户确认」） */
      stage: 'review',
      /* 订单摘要（演示数据对齐 D14 稿值，联调后移除） */
      order: {
        customer_name: '陈雨',
        package_name: '家庭纪念写真',
        code: 'SL-260808-12',
        subtitle: '8/8 10:00 拍摄 · 越秀公园 · 2大1小',
        contact_sub: '138****2874 · 已确认收款（登记）',
      },
      /* 退款申请单（真实结构 = biz_refund 行 + 订单聚合，联调核对） */
      refund: {
        id: 0,
        total_amt: 2920,
        paid_amt: 804,
        rate_text: '全额退款',
        amount: 804,
        channel_text: '微信 chenyu_88',
        reason_tag: '时间冲突',
        reason: '家里临时有事，档期需要重新安排，抱歉给您添麻烦了。',
        check_text: '拍摄前 72h+ · 全额退款',
      },
    }
  },
  onLoad(query) {
    this.orderId = query.id
    this.refundId = query.refundId
    if (query.state === 'transfer' || query.state === 'confirming') this.stage = query.state
    this.fetchData()
  },
  methods: {
    formatAmount,
    async fetchData() {
      if (isDemo()) return /* 演示态直接用稿值 */
      /* 联调：getRefundDetail(refundId) 取申请单聚合（联调核对） */
    },
    /** 审核退款：/refund/audit/:id（联调核对）；演示直接成功（联调后移除） */
    async submit(approve) {
      if (this.submitting) return
      this.submitting = true
      try {
        if (!isDemo()) {
          await auditRefund(this.refundId, { approve })
        }
        uni.showToast({ title: approve ? '已同意，档期已释放' : '已拒绝该申请', icon: 'none' })
        setTimeout(() => this.goBack(), 600)
      } catch (e) {
        uni.showToast({ title: (e && e.message) || '提交失败，请重试', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },
    /** 电话联系：H5 拨号（小程序端真机验证） */
    onPhone() {
      uni.makePhoneCall({ phoneNumber: '13800002874', fail: () => {} })
    },
    /** 微信沟通：复制微信号占位 */
    onWechat() {
      uni.setClipboardData({ data: 'chenyu_88', success: () => uni.showToast({ title: '微信号已复制', icon: 'none' }) })
    },
    /** 凭证卡点击：演示态提示（联调接上传组件，联调后移除） */
    uploadVoucher() {
      if (isDemo()) return uni.showToast({ title: '演示环境：凭证上传联调后开放', icon: 'none' })
    },
    /** 后两态主按钮：transfer → 上传凭证（演示直入 confirming）；confirming → 通知客户 */
    onStageAction() {
      if (isDemo()) {
        if (this.stage === 'transfer') {
          this.stage = 'confirming'
          uni.showToast({ title: '凭证已登记 · 进入待客户确认', icon: 'none' })
          window.scrollTo && window.scrollTo(0, 0)
        } else {
          uni.showToast({ title: '已通知客户确认（演示）', icon: 'none' })
        }
        return
      }
      /* 联调：transfer 态调凭证上传接口；confirming 态调催确认通知接口（联调核对） */
    },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-pfr {
  padding-bottom: 340rpx;

  /* ① 顶栏（同 D01/D12 实测规格） */
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

  /* ③ 金警示卡：白底金描边 #D9A735 r16（推导）pad16/12（实测） */
  &__alert {
    margin: 16rpx $page-pad 0;
    padding: 32rpx; /* 实测：标题 y212-卡顶 y196 = 16px 上下对称 */
    background-color: $white;
    border: 1rpx solid #D9A735; /* 实测 */
    border-radius: $radius-card;
  }
  &__alert-main {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__alert-title { color: #B66E00; font-size: 30rpx; font-weight: 700; line-height: 40rpx; }
  &__alert-dot {
    width: 8rpx;
    height: 8rpx;
    background-color: #B66E00;
    border-radius: 50%;
  }
  &__alert-amount { margin-left: auto; color: #B66E00; font-size: 30rpx; font-weight: 700; font-family: $font-family-num; }
  &__alert-sub { display: block; margin-top: 12rpx; color: #666666; font-size: 24rpx; line-height: 24rpx; }
  /* D14-3 待客户确认态：绿框绿字（徽章色实测 #2FAF5E，描边色推导同族） */
  &__alert--green { border-color: #2FAF5E; }
  &__alert-title--green { color: #2FAF5E; }

  /* ⑥' 转账凭证卡（D14-2/3，推导卡体同灰提示卡族，白底描边） */
  &__voucher {
    margin: 0 $page-pad;
    padding: 28rpx 32rpx;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: $radius-card;
  }
  &__voucher-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }
  &__voucher-title { color: $text-1; font-size: 28rpx; font-weight: 700; }
  &__voucher-sub { display: block; margin-top: 14rpx; color: #666666; font-size: 24rpx; line-height: 34rpx; }
  &__voucher-sub--tip { color: #999999; }

  /* ④ 区块标题 + 退款明细卡（同 D02 信息卡规格） */
  &__sec-title {
    display: block;
    padding: 40rpx 36rpx 20rpx;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__detail {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: $radius-card;
    overflow: hidden;
  }
  /* 布局与行高由公共类 .info-row 统一（44px 行高，2026-09-08 全站统一口径） */
  &__row {
    &--last { border-bottom: none; }
  }
  &__label { color: $text-2; font-size: 30rpx; } /* 实测 #747981 */
  &__value { color: #333333; font-size: 30rpx; }
  &__value--green { color: #2F855A; }           /* 实测 */
  &__value--refund { color: #D94B4B; font-size: 36rpx; font-weight: 700; font-family: $font-family-num; } /* 实测 18 Bold 红 */
  &__value--strong { font-size: 32rpx; font-weight: 700; } /* 实测 16 Bold */

  /* ⑥ 取消原因卡：灰块 + 校验行（实测 341×114） */
  &__reason {
    margin: 0 $page-pad;
    padding: 24rpx 24rpx 20rpx;
    background-color: $white;
    border-radius: $radius-card;
  }
  &__reason-block {
    padding: 24rpx;
    background-color: #F2F3F5; /* 实测 */
    border-radius: 16rpx;      /* 推导：稿灰块未标圆角 */
  }
  &__reason-tag { display: block; color: #666666; font-size: 24rpx; font-weight: 500; line-height: 24rpx; }
  &__reason-text { display: block; margin-top: 12rpx; color: #333333; font-size: 24rpx; font-weight: 500; line-height: 44rpx; }
  &__reason-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 22rpx;
  }
  &__reason-label { color: #666666; font-size: 24rpx; }
  &__reason-ok { color: $badge-green-text; font-size: 24rpx; } /* 实测 #20845C */

  /* ⑦ 灰提示卡（实测 343×61 #E6E7EB r14 推导） */
  &__tip {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin: 24rpx $page-pad 0;
    padding: 24rpx 32rpx;
    background-color: #E6E7EB; /* 实测 */
    border-radius: 28rpx;
  }
  &__tip-text { flex: 1; color: #666666; font-size: 24rpx; line-height: 34rpx; }

  /* ⑧ 底部双钮：ghost 167.5 + solid 165.5，r999 h52（实测，同 D12） */
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
      background-color: $btn-primary; /* 实测 #171819 */
      text { color: $white; }
    }
    &--loading { opacity: 0.6; }
  }
}
</style>
