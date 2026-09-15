<template>
  <view class="page-bh page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 白圆钮 + 「我的预约主页」居中（1:5940 实测） -->
    <view class="page-bh__header">
      <view class="page-bh__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-bh__title">我的预约主页</text>
    </view>

    <!-- 状态黑卡 #161616 r16（y114）：金点 + 说明 + 链接条 + 双钮 -->
    <view class="page-bh__hero">
      <view class="page-bh__hero-head">
        <view class="page-bh__hero-dot" />
        <text class="page-bh__hero-title">{{ heroTitle }}</text>
        <text class="page-bh__hero-hint">{{ heroHint }}</text>
      </view>
      <text class="page-bh__hero-desc">客户在微信里打开链接：看作品 → 选套餐 → 挑档期 → 线下付款 → 系统记档</text>
      <view class="page-bh__hero-link" @click="copyLink">
        <AppIcon name="me-link" :size="13" />
        <text class="page-bh__hero-url">{{ shareUrl || '主页标识未设置' }}</text>
        <text class="page-bh__hero-copy">复制</text>
      </view>
      <view class="page-bh__hero-btns">
        <view class="page-bh__hero-gold pressable" @click="share">
          <AppIcon name="me-share" :size="13" />
          <text>分享到微信</text>
        </view>
        <view class="page-bh__hero-ghost pressable" @click="goPreview"><text>客户视角预览</text></view>
      </view>
    </view>

    <!-- 主页内容（y335 标题 + y366 三行卡） -->
    <view class="page-bh__sec">主页内容</view>
    <view class="page-bh__card">
      <view class="info-row page-bh__row pressable" @click="goHomepageSetting">
        <view class="page-bh__row-icon"><AppIcon name="me-link" :size="17" /></view>
        <view class="page-bh__row-main">
          <text class="page-bh__row-label">主页标识</text>
          <text class="page-bh__row-sub">{{ slug || '未设置' }} · 客户凭它进入你的主页</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-bh__row pressable" @click="goPackages">
        <view class="page-bh__row-icon"><AppIcon name="me-pkg2" :size="17" /></view>
        <view class="page-bh__row-main">
          <text class="page-bh__row-label">套餐报价</text>
          <text class="page-bh__row-sub">客户在主页选择并下单</text>
        </view>
        <text class="page-bh__row-count">{{ pkgCountText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-bh__row pressable" @click="goWorks">
        <view class="page-bh__row-icon"><AppIcon name="me-img" :size="17" /></view>
        <view class="page-bh__row-main">
          <text class="page-bh__row-label">作品展示</text>
          <text class="page-bh__row-sub">主页顶部轮播</text>
        </view>
        <text class="page-bh__row-count">{{ workCountText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-bh__row pressable" @click="goSchedule">
        <view class="page-bh__row-icon"><AppIcon name="me-cal2" :size="17" /></view>
        <view class="page-bh__row-main">
          <text class="page-bh__row-label">可约档期</text>
          <text class="page-bh__row-sub">去日程 Tab 管理</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- ⚠️ 收款方式整段 —— 2026-09-15 起隐藏：收款功能尚未上线（biz_payment_method 配置链路未开放），
         原样保留代码，仅用注释包裹。恢复步骤：① 去掉本注释包裹；② 放开 loadAll 中被注释的
         this.loadPayMethods()。
    <view class="page-bh__sec-row">
      <text class="page-bh__sec">收款方式</text>
      <text class="page-bh__sec-hint">客户下单后按此转账</text>
    </view>
    <view class="page-bh__card page-bh__card--mt">
      <view class="info-row page-bh__row pressable" @click="goPay">
        <view class="page-bh__row-icon page-bh__row-icon--round"><AppIcon name="me-wallet2" :size="17" /></view>
        <view class="page-bh__row-main">
          <text class="page-bh__row-label">收款设置</text>
          <text class="page-bh__row-sub">{{ paySubText }}</text>
        </view>
        <view
          v-if="payLoaded"
          class="page-bh__badge-ok"
          :class="{ 'page-bh__badge-ok--off': !paySet }"
        >
          <text>{{ paySet ? '已设' : '未设置' }}</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>
    -->

    <!-- 分享给客户 -->
    <!-- 原「最近分享」为**纯虚构的活动记录**（写死「保存主页二维码 · 3天前」「发给微信好友「王浩」· 昨天 16:20」），
         而后端并没有分享记录/埋点接口，无法取真；故整段改为真实可用的分享入口，不再展示任何伪造记录。 -->
    <view class="page-bh__sec page-bh__sec--mt">分享给客户</view>
    <view class="page-bh__card">
      <view class="info-row page-bh__row pressable" @click="share">
        <view class="page-bh__row-icon page-bh__row-icon--round page-bh__row-icon--alt"><AppIcon name="me-send" :size="17" /></view>
        <view class="page-bh__row-main">
          <text class="page-bh__row-label">复制主页链接</text>
          <text class="page-bh__row-sub">发到微信给客户；客户凭链接下单会归到你名下</text>
        </view>
        <view class="page-bh__badge-gray"><text>复制</text></view>
      </view>
    </view>

    <AppTabBar active="me" />
    <view class="page-bh__safe" />
  </view>
</template>

<script>
import { getStudioSettings, listPaymentMethods } from '@/api/settings'
import { getPackageList } from '@/api/package'
import { getAssetList } from '@/api/asset'

/** 收款方式类型 → 展示名（后端 type 枚举：wechat/alipay/bank/cash/other） */
const PAY_TYPE_LABELS = {
  wechat: '微信',
  alipay: '支付宝',
  bank: '银行卡',
  cash: '现金',
  other: '其他',
}

/**
 * ME03 我的预约主页（稿 1:5940 实测 1:1）
 * 状态黑卡（主页状态+链接条+分享/预览双钮）→ 主页内容四行 → ~~收款方式~~ → 分享给客户。
 *
 * ⚠️ 2026-09-15：本页原有四处写死样例值（「主页已就绪」「4 个」「86 张」「已设」）
 * 与一整段虚构的「最近分享」活动记录，现已全部改接后端真实数据：
 *   - 主页状态   → /studio/get 的 homepage_slug（是否已设标识）+ accept_new（是否接单）
 *   - 套餐报价   → POST /package/list?status=2 的 **total**
 *   - 作品展示   → POST /asset/list 的 total
 *   - 最近分享   → 后端**无分享记录接口**，整段改为真实可用的「复制主页链接」入口
 * 计数一律取**分页 total** 而非列表长度（列表页固定 page_size=50，超过 50 会截断算错）。
 *
 * ⚠️ 2026-09-15（同日）：**收款功能未上线，「收款方式」整段已隐藏**（模板中以注释包裹），
 * loadAll 亦不再调用 loadPayMethods；pay* computed / loadPayMethods / goPay 代码全部保留，仅断入口。
 *
 * 预约主页链接由**服务端**下发（studio/get 的 homepage_url =
 * share.h5_base_url + ?slug=xxx&staff_id=<我的账号id>），前端不拼域名；
 * 未设 slug 或服务端未配基址时为空串，链接条给兜底文案。
 * staff_id 即分享人：客户从这条链接进来下单，订单就归到我名下（biz_order.photographer_id）。
 */
export default {
  name: 'MeBookingHome',
  data() {
    return {
      /** 预约主页分享链接（服务端拼装，含 ?slug= 租户标识与 &staff_id= 分享人） */
      shareUrl: '',
      /** 预约主页短链标识（租户级；服务端在为空时会按公司 ID 兜底生成） */
      slug: '',
      /** 工作室设置（/studio/get：accept_new 接单开关） */
      studio: {},
      /** 已上架套餐数 / 作品数；null = 尚未取到（渲染占位符，不显示假数字） */
      pkgCount: null,
      workCount: null,
      /** 收款方式（/settings/payment-method/list） */
      payMethods: [],
      payLoaded: false,
    }
  },
  computed: {
    /** 是否接收新预约（accept_new 默认 1）；设置未拉到时按默认口径 */
    acceptOn() {
      const v = this.studio.accept_new
      if (v === undefined || v === null) return true
      return Number(v) === 1
    },
    heroTitle() {
      if (!this.slug) return '主页标识未设置'
      return this.acceptOn ? '主页已就绪' : '已暂停接单'
    },
    heroHint() {
      if (!this.slug) return '设置标识后客户才能访问'
      return this.acceptOn ? '客户可直接下单' : '客户暂无法下单'
    },
    pkgCountText() {
      return this.pkgCount === null ? '—' : `${this.pkgCount} 个`
    },
    workCountText() {
      return this.workCount === null ? '—' : `${this.workCount} 个`
    },
    /** 已启用（status=1）的收款方式展示名（去重） */
    payTypes() {
      const names = this.payMethods
        .filter((m) => Number(m.status) === 1)
        .map((m) => PAY_TYPE_LABELS[m.type] || m.type)
        .filter(Boolean)
      return [...new Set(names)]
    },
    paySet() {
      return this.payTypes.length > 0
    },
    paySubText() {
      if (!this.payLoaded) return ''
      return this.paySet ? this.payTypes.join(' · ') : '未配置收款方式'
    },
  },
  onShow() {
    // 从「个人资料 / 收款设置 / 套餐管理」等子页返回时即时刷新；全部静默，不弹 loading
    this.loadAll()
    this.enableShareMenu()
  },
  /** 转发小程序卡片 → web-view 承接页打开 H5 预约主页（需在小程序后台配业务域名） */
  onShareAppMessage() {
    return this.buildShare()
  },
  onShareTimeline() {
    const s = this.buildShare()
    return { title: s.title, query: s.path ? s.path.split('?')[1] : '' }
  },
  methods: {
    /** 并发拉取本页全部数据；各 loader 内部已吞错，互不影响（失败项保留「—」占位而非假数据） */
    loadAll() {
      // 2026-09-15：收款功能未上线，「收款方式」整段已隐藏 → 不再拉取收款方式
      return Promise.all([this.loadStudio(), this.loadCounts() /* , this.loadPayMethods() */])
    },
    /** 工作室设置：主页链接 + 标识（主页状态）+ 接单开关 */
    async loadStudio() {
      const st = await getStudioSettings({ loading: false, silent: true }).catch(() => null)
      // 静默失败：保留原值，不打断页面
      if (!st) return
      this.studio = st
      this.shareUrl = st.homepage_url || ''
      this.slug = st.homepage_slug || ''
    },
    /** 两处计数：page_size=1 只取分页 total，不拉整页列表 */
    async loadCounts() {
      const quiet = { loading: false, silent: true }
      const [pkg, all] = await Promise.all([
        getPackageList({ page: 1, page_size: 1, status: '2' }, quiet).catch(() => null),
        getAssetList({ page: 1, page_size: 1 }, quiet).catch(() => null),
      ])
      if (pkg) this.pkgCount = Number(pkg.total) || 0
      if (all) this.workCount = Number(all.total) || 0
    },
    /**
     * 收款方式配置情况（决定「已设 / 未设置」徽章与渠道文案）
     *
     * ⚠️ 2026-09-15：收款功能尚未上线，「收款方式」整段已在模板中以注释隐藏，
     *    故本方法当前**无调用方**（loadAll 中的调用已一并注释）。代码保留，功能上线后接回即可。
     */
    async loadPayMethods() {
      const res = await listPaymentMethods({ loading: false, silent: true }).catch(() => null)
      if (!res) return
      this.payMethods = Array.isArray(res) ? res : res.list || []
      this.payLoaded = true
    },
    goBack() {
      uni.navigateBack()
    },
    goHomepageSetting() {
      uni.navigateTo({ url: '/pages/me/homepage-setting' })
    },
    /** 开放右上角菜单的「发送给朋友 / 分享到朋友圈」（仅小程序端有效） */
    enableShareMenu() {
      // #ifdef MP-WEIXIN
      uni.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] })
      // #endif
    },
    /** 分享卡片内容：path 指向 web-view 承接页并带上主页地址 */
    buildShare() {
      const title = '预约拍摄 · 看作品选套餐约档期'
      if (!this.shareUrl) return { title }
      return { title, path: `/pages/common/webview?url=${encodeURIComponent(this.shareUrl)}` }
    },
    copyLink() {
      if (!this.shareUrl) {
        this.promptSetSlug()
        return
      }
      // setClipboardData 在小程序端自带系统提示，无需再 toast
      uni.setClipboardData({ data: this.shareUrl })
    },
    /**
     * 分享给客户：微信小程序**无法用代码唤起转发面板**，也无法直接转发外部 H5 链接，
     * 故封装为「复制链接 + 一次性引导」，用户到微信里粘贴发送即可。
     * 转发小程序卡片（右上角菜单）走 onShareAppMessage → web-view 承接页。
     */
    share() {
      if (!this.shareUrl) {
        this.promptSetSlug()
        return
      }
      uni.setClipboardData({
        data: this.shareUrl,
        success: () => {
          // 等系统自带的「内容已复制」提示展示完再弹引导，避免两条提示叠加
          setTimeout(() => {
            uni.showModal({
              title: '链接已复制',
              content: '到微信里粘贴发送给客户即可。客户从这条链接下单，订单会自动归到你名下。',
              showCancel: false,
              confirmText: '知道了',
            })
          }, 800)
        },
      })
    },
    /** 链接尚未生成时的统一引导：去设置主页标识 */
    promptSetSlug() {
      uni.showModal({
        title: '还没有可分享的链接',
        content: '设置主页标识后，系统会生成你的专属预约主页链接',
        confirmText: '去设置',
        success: (r) => {
          if (r.confirm) this.goHomepageSetting()
        },
      })
    },
    goPreview() {
      uni.navigateTo({ url: '/pages/me/preview' })
    },
    goPackages() {
      uni.navigateTo({ url: '/pages/me/packages' })
    },
    goWorks() {
      uni.navigateTo({ url: '/pages/me/works' })
    },
    goSchedule() {
      uni.switchTab({ url: '/pages/schedule/index' })
    },
    goPay() {
      uni.navigateTo({ url: '/pages/me/pay-settings' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-bh {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
  }
  &__back {
    box-sizing: border-box;
    position: absolute;
    left: 32rpx;
    z-index: 1;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
    color: #1A1A1A;
  }

  &__hero {
    margin: 20rpx 32rpx 0; /* 稿：hero 左缘 x16 = 32rpx；顶距 header 底 104→114 = 10px */
    background-color: #161616;
    border-radius: 32rpx;
    padding: 32rpx;
  }
  &__hero-head { display: flex; align-items: center; gap: 16rpx; }
  &__hero-dot { width: 14rpx; height: 14rpx; border-radius: 4rpx; background-color: #FFD60A; flex-shrink: 0; }
  &__hero-title { font-size: 30rpx; font-weight: 500; color: #FFFFFF; }
  &__hero-hint { margin-left: auto; font-size: 22rpx; color: #8D8D93; }
  &__hero-desc { display: block; margin-top: 16rpx; font-size: 23rpx; line-height: 36rpx; color: #B9B9BF; }
  &__hero-link {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 24rpx;
    background-color: #272727;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
  }
  /* 链接为服务端下发的完整 URL（含协议与 ?slug=，域名可能较长）需截断显示；
   * min-width: 0 是 flex 子项能收缩到小于内容宽度的前提，缺它 ellipsis 不生效 */
  &__hero-url {
    flex: 1;
    min-width: 0;
    font-size: 22rpx;
    color: #C9C9CF;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__hero-copy { font-size: 22rpx; font-weight: 500; color: #FFD60A; flex-shrink: 0; }
  &__hero-btns { display: flex; gap: 16rpx; margin-top: 32rpx; }
  &__hero-gold {
    box-sizing: border-box;
    width: 300rpx;
    height: 76rpx;
    border-radius: 999rpx;
    background-color: #FFD60A;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    text { font-size: 26rpx; font-weight: 500; color: #161616; }
  }
  &__hero-ghost {
    box-sizing: border-box;
    flex: 1;
    height: 76rpx;
    border-radius: 999rpx;
    border: 2rpx solid #3D3D3D;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 26rpx; color: #FFFFFF; }
  }

  &__sec { margin: 40rpx 36rpx 0; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 稿：hero 底 315 → 「主页内容」339（上 20px） */
  &__sec--mt { margin-top: 40rpx; }
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0;
    .page-bh__sec { margin: 0; }
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; white-space: nowrap; flex-shrink: 0; }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：标题墨迹 354 → 卡片 366（下 12px） */
    &--mt { margin-top: 24rpx; } /* 稿：sec-row 标题 587–602 → 卡2 613（下 12px） */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }
  &__row-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 50%;
    background-color: #F1F1F3;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--round { border-radius: 50%; }
    &--alt { background-color: #F1F1F3; }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 30rpx; color: #1A1A1A; }
  &__row-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 21rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__row-count { font-size: 24rpx; color: #8E8E93; flex-shrink: 0; }

  &__badge-ok {
    box-sizing: border-box;
    background-color: #DFF5E9;
    border-radius: 999rpx;
    padding: 8rpx 20rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #00A860; }
    /* 未配置收款方式：灰底灰字，与「已设」的绿底绿字区分（不给假绿） */
    &--off {
      background-color: #F0F0F2;
      text { color: #8E8E93; }
    }
  }
  &__badge-gray {
    box-sizing: border-box;
    background-color: #F1F1F3;
    border-radius: 999rpx;
    padding: 8rpx 20rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #8E8E93; }
  }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
