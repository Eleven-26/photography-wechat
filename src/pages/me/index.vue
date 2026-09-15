<template>
  <view class="page-me page-wrap">
    <view class="status-bar" />
    <!-- Header：「我的」17 居中，tab 根页无返回钮（1:5731 实测） -->
    <view class="page-me__header">
      <text class="page-me__title">我的</text>
    </view>

    <!-- 资料卡：52 圆头像 + 名 17 + 副 12 #8E8E93 + 右箭头（y104 白卡 r16） -->
    <view class="page-me__profile pressable" @click="goProfile">
      <view class="page-me__avatar">
        <text>{{ avatarText }}</text>
      </view>
      <view class="page-me__profile-main">
        <text class="page-me__name">{{ displayName }}</text>
        <text class="page-me__sub">{{ roleLine }}</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <!-- 预约主页推广黑卡 #161616 r16（y196）：金点标题 + 说明 + 链接条 + 双钮 -->
    <view class="page-me__promo">
      <view class="page-me__promo-head">
        <view class="page-me__promo-dot" />
        <text class="page-me__promo-title">我的预约主页</text>
        <text class="page-me__promo-hint">客户看到的门面</text>
      </view>
      <text class="page-me__promo-desc">作品展示 · 套餐报价 · 可约档期 · 直接下单</text>
      <view class="page-me__promo-link" @click="copyLink">
        <AppIcon name="me-link" :size="13" />
        <text class="page-me__promo-url">{{ shareUrl || '主页标识未设置' }}</text>
        <text class="page-me__promo-copy">复制</text>
      </view>
      <view class="page-me__promo-btns">
        <view class="page-me__promo-gold pressable" @click="goBookingHome"><text>管理主页</text></view>
        <view class="page-me__promo-ghost pressable" @click="goPreview"><text>客户视角预览</text></view>
      </view>
    </view>

    <!-- 套餐与作品（y397 标题 + y422 白卡两行） -->
    <view class="page-me__sec">套餐与作品</view>
    <view class="page-me__card">
      <view class="info-row page-me__row pressable" @click="goPackages">
        <view class="page-me__row-icon"><AppIcon name="me-pkg" :size="18" /></view>
        <text class="page-me__row-label">套餐管理</text>
        <text class="page-me__row-value">{{ pkgLiveText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row page-me__row--plain" @click="goWorks">
        <view class="page-me__row-icon"><AppIcon name="me-works" :size="17" /></view>
        <text class="page-me__row-label">作品集</text>
        <text class="page-me__row-value">{{ assetText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 接单（y554 标题 + y595 白卡） -->
    <!-- ⚠️ 2026-09-15：收款功能尚未上线，原「接单与收款」段内的「收款设置」入口已隐藏
         （下方整行代码以注释保留）。标题同步去掉「与收款」；恢复时改回「接单与收款」并接回该行。 -->
    <view class="page-me__sec">接单</view>
    <view class="page-me__card">
      <view class="info-row page-me__row">
        <!-- 稿内该行图标为齿轮（设置）；原误用 me-booking（内容实为箭头）已替换 -->
        <view class="page-me__row-icon page-me__row-icon--round"><AppIcon name="me-gear" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">接收新预约</text>
          <text class="page-me__row-sub">{{ acceptSubText }}</text>
        </view>
        <view
          class="page-me__toggle"
          :class="{ 'page-me__toggle--on': acceptOn }"
          @click="toggleAccept"
        >
          <view class="page-me__toggle-knob" />
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <!-- ⚠️ 收款设置入口 —— 2026-09-15 起隐藏：收款功能尚未上线（biz_payment_method 配置链路未开放），
           整行代码原样保留，仅用注释包裹。恢复步骤：① 去掉本注释包裹；② 段标题改回「接单与收款」；
           ③ 放开 loadAll 中被注释的 this.loadPayMethods()。
      <view class="info-row page-me__row" @click="goPay">
        <view class="page-me__row-icon page-me__row-icon--round"><AppIcon name="me-wallet" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">收款设置</text>
          <text class="page-me__row-sub">{{ paySubText }}</text>
        </view>
        <view
          v-if="payLoaded"
          class="page-me__badge-ok"
          :class="{ 'page-me__badge-ok--off': !paySet }"
        >
          <text>{{ paySet ? '已设' : '未设置' }}</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      -->
    </view>

    <!-- 通用（y747 标题 + y778 白卡三行） -->
    <view class="page-me__sec">通用</view>
    <view class="page-me__card">
      <view class="info-row page-me__row" @click="goNotify">
        <view class="page-me__row-icon page-me__row-icon--round"><AppIcon name="me-bell" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">通知设置</text>
          <text class="page-me__row-sub">档期变更 / 订单动态 / 拍摄提醒</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row" @click="goAccount">
        <view class="page-me__row-icon page-me__row-icon--round page-me__row-icon--alt"><AppIcon name="me-shield" :size="17" /></view>
        <view class="page-me__row-main">
          <text class="page-me__row-label">账号与安全</text>
          <text class="page-me__row-sub">手机号 · 登录设备</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-me__row" @click="goHelp">
        <view class="page-me__row-icon page-me__row-icon--round page-me__row-icon--alt"><AppIcon name="me-help" :size="17" /></view>
        <text class="page-me__row-label">帮助与关于</text>
        <text class="page-me__row-ver">V{{ appVersion }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <AppTabBar active="me" />
    <view class="page-me__safe" />
  </view>
</template>

<script>
import { getStudioSettings, updateStudioSettings, listPaymentMethods } from '@/api/settings'
import { getProfile } from '@/api/user'
import { getPackageList } from '@/api/package'
import { getAssetList } from '@/api/asset'
import { APP_VERSION } from '@/config/env'

/** 收款方式类型 → 展示名（后端 type 枚举：wechat/alipay/bank/cash/other） */
const PAY_TYPE_LABELS = {
  wechat: '微信',
  alipay: '支付宝',
  bank: '银行卡',
  cash: '现金',
  other: '其他',
}

/**
 * ME01 我的（稿 1:5731 实测 1:1）
 * 资料卡 → 预约主页黑卡（金点+链接条+双钮 150/152x38）→ 套餐与作品两行 → 接单（toggle #34C759）→ 通用三行。
 * 行图标均从画板导出（me-pkg/me-works/me-booking/me-wallet/me-bell/me-shield/me-help）。
 *
 * ⚠️ 2026-09-15：本页原为一整套**写死的样例值**（路先生 / 4 个已上架 / 86 张 · 12 精选 /
 * 已设 / 接单中 / V2.0.0），现已全部改接后端真实数据，页面不再有硬编码展示值：
 *   - 资料卡     → POST /user/profile（nickname / username / role_name）+ /studio/get 的 slogan（店名）
 *   - 套餐管理   → POST /package/list?status=2 的 **total**（只统计已上架）
 *   - 作品集     → POST /asset/list 的 total + featured=1 的 total
 *   - 接收新预约 → /studio/get 的 accept_new（1 接收 / 0 暂停），切换走 /studio/update
 * 计数一律取**分页 total** 而非列表长度：列表页固定 page_size=50，超过 50 会被截断算错。
 *
 * ⚠️ 2026-09-15（同日）：**收款功能未上线，收款相关入口全部隐藏** ——
 * 原「接单与收款」段中的「收款设置」行（→ /settings/payment-method/list 徽章）已注释摘除，
 * 段标题改为「接单」；loadAll 不再调用 loadPayMethods（该请求已无消费者）。
 * 相关代码（模板整行 + pay* computed + loadPayMethods + goPay）**全部保留**，仅断入口，便于功能上线后接回。
 *
 * 预约主页链接由**服务端**下发（studio/get 的 homepage_url =
 * share.h5_base_url + ?slug=xxx&staff_id=<我的账号id>），前端不拼域名；
 * 未设 slug 或服务端未配基址时为空串，链接条给兜底文案。
 * staff_id 即分享人：客户从这条链接进来下单，订单就归到我名下（biz_order.photographer_id），
 * 因此在员工端「我的订单」里能直接看到自己的客户单。
 */
export default {
  name: 'MeIndex',
  data() {
    return {
      /** 预约主页分享链接（服务端拼装，含 ?slug= 租户标识与 &staff_id= 分享人） */
      shareUrl: '',
      /** 本人账号（POST /user/profile：nickname / username / role_name） */
      staff: {},
      /** 工作室设置（POST /studio/get：slogan 店名、accept_new 接单开关、homepage_url 分享链接） */
      studio: {},
      /** 收款方式（POST /settings/payment-method/list） */
      payMethods: [],
      payLoaded: false,
      /** 套餐「已上架」数；null = 尚未取到（渲染占位符，绝不回落假数字） */
      pkgLive: null,
      /** 作品总数 / 精选数；null 同上 */
      assetTotal: null,
      assetFeatured: null,
      /** 接单开关请求中（防连点重复提交） */
      switchingAccept: false,
      appVersion: APP_VERSION,
    }
  },
  computed: {
    /** 展示名：优先昵称，其次登录账号 */
    displayName() {
      return this.staff.nickname || this.staff.username || ''
    },
    /** 头像占位文字：展示名首字；资料未取到时给中性字，不冒充某个人 */
    avatarText() {
      return this.displayName ? this.displayName.slice(0, 1) : '摄'
    },
    /** 副标题：角色名 + 店名（店名由 slogan 承载，与 ME02 个人资料页同口径） */
    roleLine() {
      return (
        [this.staff.role_name, this.studio.slogan].filter(Boolean).join(' · ') || '完善资料后展示'
      )
    },
    /** 是否接收新预约（biz_studio_setting.accept_new，默认 1）；设置未拉到时按默认口径 */
    acceptOn() {
      const v = this.studio.accept_new
      if (v === undefined || v === null) return true
      return Number(v) === 1
    },
    acceptSubText() {
      return this.acceptOn
        ? '接单中 · 客户可在预约主页直接下单'
        : '已暂停 · 客户无法在预约主页下单'
    },
    pkgLiveText() {
      return this.pkgLive === null ? '—' : `${this.pkgLive} 个已上架`
    },
    assetText() {
      if (this.assetTotal === null) return '—'
      return `${this.assetTotal} 个作品 · ${this.assetFeatured || 0} 精选`
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
    // tab 页每次显示都刷新：从「个人资料 / 收款设置 / 套餐管理」等子页返回后即时反映改动。
    // 全部静默（loading:false + silent:true）——切 tab 不该弹「加载中」，失败也不该用 toast 打断。
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
      return Promise.all([
        this.loadStudio(),
        this.loadProfile(),
        this.loadCounts(),
        // 2026-09-15：收款功能未上线，「收款设置」入口已隐藏 → 不再拉取收款方式
        // this.loadPayMethods(),
      ])
    },
    /** 工作室设置：既供资料卡店名与接单开关，也供预约主页分享链接 */
    async loadStudio() {
      const st = await getStudioSettings({ loading: false, silent: true }).catch(() => null)
      // 静默失败：保留原值，不打断页面
      if (!st) return
      this.studio = st
      this.shareUrl = st.homepage_url || ''
    },
    /** 本人资料（POST /user/profile） */
    async loadProfile() {
      const res = await getProfile({ loading: false, silent: true }).catch(() => null)
      if (res) this.staff = res
    },
    /** 三处计数：page_size=1 只取分页 total，不拉整页列表 */
    async loadCounts() {
      const quiet = { loading: false, silent: true }
      const [pkg, all, featured] = await Promise.all([
        getPackageList({ page: 1, page_size: 1, status: '2' }, quiet).catch(() => null),
        getAssetList({ page: 1, page_size: 1 }, quiet).catch(() => null),
        getAssetList({ page: 1, page_size: 1, featured: '1' }, quiet).catch(() => null),
      ])
      if (pkg) this.pkgLive = Number(pkg.total) || 0
      if (all) this.assetTotal = Number(all.total) || 0
      if (featured) this.assetFeatured = Number(featured.total) || 0
    },
    /**
     * 收款方式配置情况（决定「已设 / 未设置」徽章与渠道文案）
     *
     * ⚠️ 2026-09-15：收款功能尚未上线，「收款设置」入口已在模板中以注释隐藏，
     *    故本方法当前**无调用方**（loadAll 中的调用已一并注释）。代码保留，功能上线后接回即可。
     */
    async loadPayMethods() {
      const res = await listPaymentMethods({ loading: false, silent: true }).catch(() => null)
      if (!res) return
      this.payMethods = Array.isArray(res) ? res : res.list || []
      this.payLoaded = true
    },
    goProfile() {
      uni.navigateTo({ url: '/pages/me/profile' })
    },
    goBookingHome() {
      uni.navigateTo({ url: '/pages/me/booking-home' })
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
    goPay() {
      uni.navigateTo({ url: '/pages/me/pay-settings' })
    },
    goNotify() {
      uni.navigateTo({ url: '/pages/me/notify-settings' })
    },
    goAccount() {
      uni.navigateTo({ url: '/pages/me/account' })
    },
    goHelp() {
      uni.navigateTo({ url: '/pages/me/help' })
    },
    copyLink() {
      if (!this.shareUrl) {
        this.promptSetSlug()
        return
      }
      // setClipboardData 在小程序端自带系统提示，无需再 toast
      uni.setClipboardData({ data: this.shareUrl })
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
    /** 链接尚未生成时的统一引导：去设置主页标识 */
    promptSetSlug() {
      uni.showModal({
        title: '还没有可分享的链接',
        content: '设置主页标识后，系统会生成你的专属预约主页链接',
        confirmText: '去设置',
        success: (r) => {
          if (r.confirm) uni.navigateTo({ url: '/pages/me/homepage-setting' })
        },
      })
    },
    /**
     * 接收新预约开关：写库成功后回写本地状态。
     * ⚠️ 不做乐观更新 —— 这是会影响客户能否下单的开关，界面必须反映**落库结果**，
     * 失败（含无 settings:update 权限）时保持原状，由 request 层 toast 说明原因。
     */
    async toggleAccept() {
      if (this.switchingAccept) return
      const next = this.acceptOn ? 0 : 1
      this.switchingAccept = true
      const ok = await updateStudioSettings({ accept_new: next })
        .then(() => true)
        .catch(() => false)
      this.switchingAccept = false
      if (!ok) return
      this.studio = { ...this.studio, accept_new: next }
      uni.showToast({
        title: next === 1 ? '已开启接收新预约' : '已暂停接收新预约',
        icon: 'none',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-me {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
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

  &__profile {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 0 32rpx; /* 稿：资料卡左缘 x16 = 32rpx（横向扫描 x16–358） */
    padding: 30rpx 32rpx;
    background-color: $white;
    border-radius: 32rpx;
  }
  &__avatar {
    box-sizing: border-box;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background-color: #161616;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 32rpx; color: #FFFFFF; }
  }
  &__profile-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8rpx; }
  &__name { font-size: 34rpx; font-weight: 500; color: #000000; }
  &__sub { font-size: 24rpx; color: #8E8E93; }

  &__promo {
    margin: 20rpx 32rpx 0;
    background-color: #161616;
    border-radius: 32rpx;
    padding: 32rpx;
  }
  &__promo-head { display: flex; align-items: center; gap: 16rpx; }
  &__promo-dot {
    box-sizing: border-box;
    width: 14rpx;
    height: 14rpx;
    border-radius: 4rpx;
    background-color: #FFD60A;
    flex-shrink: 0;
  }
  &__promo-title { font-size: 30rpx; font-weight: 500; color: #FFFFFF; }
  &__promo-hint { margin-left: auto; font-size: 22rpx; color: #8D8D93; }
  &__promo-desc { display: block; margin-top: 16rpx; font-size: 22rpx; color: #B9B9BF; }
  &__promo-link {
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
  &__promo-url {
    flex: 1;
    min-width: 0;
    font-size: 24rpx;
    color: #C9C9CF;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &__promo-copy { font-size: 22rpx; font-weight: 500; color: #FFD60A; flex-shrink: 0; }
  &__promo-btns { display: flex; gap: 16rpx; margin-top: 32rpx; }
  &__promo-gold {
    box-sizing: border-box;
    width: 300rpx;
    height: 76rpx;
    border-radius: 999rpx;
    background-color: #FFD60A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 26rpx; font-weight: 500; color: #161616; }
  }
  &__promo-ghost {
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

  &__sec {
    margin: 40rpx 36rpx 0; /* 稿：promo 底 376 → 标题 397（上 20px） */
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：标题墨迹 411 → 卡片 422（下 12px） */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    &--plain { background-color: $white; }
  }
  &__row-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 16rpx;
    background-color: #F3F3F5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--round { border-radius: 50%; }
    &--alt { background-color: #F1F1F3; }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 28rpx; color: #1A1A1A; }
  &__row-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__row-value { margin-left: auto; font-size: 22rpx; color: #666666; flex-shrink: 0; }
  &__row-ver { margin-left: auto; font-size: 24rpx; color: #666666; flex-shrink: 0; }

  &__toggle {
    box-sizing: border-box;
    width: 92rpx;
    height: 54rpx;
    border-radius: 999rpx;
    background-color: #D9D9D9;
    padding: 6rpx;
    flex-shrink: 0;
    &--on { background-color: #34C759; display: flex; justify-content: flex-end; }
  }
  &__toggle-knob { width: 42rpx; height: 42rpx; border-radius: 50%; background-color: #FFFFFF; }

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

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
