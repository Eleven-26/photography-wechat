<template>
  <view class="page-ps page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「收款设置」（稿 1:6425 实测，画板名误标「接单设置」） -->
    <view class="page-ps__header">
      <view class="page-ps__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-ps__title">收款设置</text>
    </view>

    <!-- 灰提示条 y114 #E6E7EB r12：资金不经平台说明 -->
    <view class="page-ps__note">
      <AppIcon name="info-gray-sm" :size="14" />
      <text>资金不经平台。客户在客户端站点下单后按以下方式线下转账，你在订单中确认到账（登记）。</text>
    </view>

    <!-- 银行卡（y178 标题行 + 已启用徽章 + y233 三行） -->
    <view class="page-ps__sec-row">
      <text class="page-ps__sec">银行卡</text>
      <view class="page-ps__badge" :class="{ 'page-ps__badge--off': !enabled('bank') }">
        <text>{{ enabled('bank') ? '已启用' : '未设置' }}</text>
      </view>
    </view>
    <view class="page-ps__card">
      <!-- 稿实测：三行右侧**均带** chevron 箭头（原仅「户名」行有，缺两个） -->
      <view
        v-for="r in bankRows"
        :key="r.field"
        class="info-row page-ps__row pressable"
        @click="editBank(r.field, r.label)"
      >
        <text class="page-ps__label">{{ r.label }}</text>
        <text class="page-ps__value" :class="{ 'page-ps__value--empty': !r.value }">{{ r.value || '未设置' }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 微信收款码（y398 标题行 + 已启用 + y453 二维码卡） -->
    <view class="page-ps__sec-row">
      <text class="page-ps__sec">微信收款码</text>
      <view class="page-ps__badge" :class="{ 'page-ps__badge--off': !enabled('wechat') }">
        <text>{{ enabled('wechat') ? '已启用' : '未设置' }}</text>
      </view>
    </view>
    <view class="page-ps__card page-ps__card--qr">
      <!-- 稿：纵向布局——二维码图在上（居中）、提示文案在下（居中） -->
      <image class="page-ps__qr-img pressable" :src="qrOf('wechat')" mode="aspectFit" @click="changeQr('微信', 'wechat')" />
      <text class="page-ps__qr-hint">点击更换 · 客户扫码转账后无需凭证，你确认到账</text>
    </view>

    <!-- 支付宝收款码（y670 标题行 + 已启用 + y725 二维码卡） -->
    <view class="page-ps__sec-row">
      <text class="page-ps__sec">支付宝收款码</text>
      <view class="page-ps__badge" :class="{ 'page-ps__badge--off': !enabled('alipay') }">
        <text>{{ enabled('alipay') ? '已启用' : '未设置' }}</text>
      </view>
    </view>
    <view class="page-ps__card page-ps__card--qr">
      <!-- 稿：纵向布局（同上），未设置时回落占位图 -->
      <image class="page-ps__qr-img pressable" :src="qrOf('alipay')" mode="aspectFit" @click="changeQr('支付宝', 'alipay')" />
      <text class="page-ps__qr-hint">点击更换 · 客户扫码转账后无需凭证，你确认到账</text>
    </view>

    <!-- 确认规则灰条 y942 -->
    <view class="page-ps__note page-ps__note--mt">
      <text>确认规则：微信 / 支付宝转账无需上传凭证，你确认到账后在订单里点确认；银行卡转账由客户上传凭证，系统识别金额与流水供你比对。</text>
    </view>
    <view class="page-ps__safe" />
  </view>
</template>

<script>
/**
 * ME09-2 收款设置（稿 1:6425 实测 1:1）
 * 资金不经平台灰条 → 银行卡三行（开户行/卡号/户名）→ 微信收款码（159 方码 + 更换提示）→ 支付宝收款码 → 确认规则灰条。
 *
 * 数据源（2026-09-14 接线）：/settings/payment-method/{list,create,update}（biz_payment_method）
 *   银行卡 → type=bank（开户行=name、卡号=account_no、户名=account_name）
 *   微信收款码 → type=wechat（qrcode） / 支付宝收款码 → type=alipay（qrcode）
 * ⚠️ 后端无独立「开户行」字段：以 name（收款方式名称）承载，语义等价于「银行名称 · 支行」。
 * ⚠️ 收款码走通用上传 /upload/file（biz_type 记类型名）后再写回 qrcode。
 *
 * ⚠️⚠️ 2026-09-15：**收款功能尚未上线，本页当前无入口可达** ——
 *   me/index.vue 与 me/booking-home.vue 中的「收款设置」入口均已注释隐藏（仅断入口、未删代码），
 *   本页文件与 pages.json 路由**原样保留**。功能上线时把那两处入口接回即可，本页无需改动。
 */
import { listPaymentMethods, createPaymentMethod, updatePaymentMethod } from '@/api/settings'
import { uploadFile } from '@/api/upload'
import { mediaUrl } from '@/utils/url'

const QR_PLACEHOLDER = '/static/img/qr-pay.png'

export default {
  name: 'MePaySettings',
  data() {
    return { methods: [] }
  },
  computed: {
    /** type=bank 的收款方式（不存在为 null） */
    bank() {
      return this.find('bank')
    },
    bankRows() {
      const b = this.bank || {}
      return [
        { field: 'name', label: '开户行', value: b.name || '' },
        { field: 'account_no', label: '卡号', value: b.account_no || '' },
        { field: 'account_name', label: '户名', value: b.account_name || '' },
      ]
    },
  },
  onShow() {
    this.fetchMethods()
  },
  methods: {
    find(type) {
      return this.methods.find((m) => m.type === type) || null
    },
    /** 该类型是否已配置且启用 */
    enabled(type) {
      const m = this.find(type)
      return !!(m && m.status === 1)
    },
    /** 收款码 URL（未设置回落占位图）。
     *  上传返回的是站内相对路径（/uploads/…），小程序无 origin，须补 API_BASE 才能加载；
     *  /static/… 这类包内资源由 mediaUrl 原样返回，不会被误加后端域名。 */
    qrOf(type) {
      const m = this.find(type)
      return mediaUrl((m && m.qrcode) || QR_PLACEHOLDER)
    },
    async fetchMethods() {
      const res = await listPaymentMethods().catch(() => null)
      this.methods = Array.isArray(res) ? res : (res && res.list) || []
    },
    goBack() {
      uni.navigateBack()
    },
    /** 银行卡行内编辑：开户行→name / 卡号→account_no / 户名→account_name */
    editBank(field, label) {
      const cur = (this.bank && this.bank[field]) || ''
      uni.showModal({
        title: `编辑${label}`,
        editable: true,
        placeholderText: `请输入${label}`,
        content: cur,
        success: (res) => {
          if (!res.confirm) return
          this.saveMethod('bank', '银行卡', { [field]: String(res.content || '').trim() })
        },
      })
    },
    /** 更换收款码：选图 → 通用上传 → 写回 qrcode */
    changeQr(label, type) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: async (res) => {
          const path = res.tempFilePaths && res.tempFilePaths[0]
          if (!path) return
          const up = await uploadFile(path, { biz_type: type }).catch(() => null)
          if (!up || !up.url) return
          await this.saveMethod(type, `${label}收款码`, { qrcode: up.url })
        },
      })
    },
    /** 新建（无 id）或更新（有 id）收款方式；携带未改动字段以免被零值覆盖 */
    async saveMethod(type, fallbackName, patch) {
      const cur = this.find(type) || {}
      const payload = {
        name: cur.name || fallbackName,
        type,
        account_name: cur.account_name || '',
        account_no: cur.account_no || '',
        qrcode: cur.qrcode || '',
        status: cur.status != null ? cur.status : 1,
        sort: cur.sort || 0,
        ...patch,
      }
      const ok = cur.id
        ? await updatePaymentMethod(cur.id, payload).then(() => true).catch(() => false)
        : await createPaymentMethod(payload).then(() => true).catch(() => false)
      if (!ok) return
      uni.showToast({ title: '已保存', icon: 'success' })
      this.fetchMethods()
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ps {
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

  &__note {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    box-sizing: border-box;
    margin: 20rpx 32rpx 0; /* 稿：note @114 */
    background-color: #E6E7EB;
    border-radius: 24rpx;
    padding: 30rpx 24rpx; /* 稿：高 64（两行文字 34） */
    text { font-size: 24rpx; line-height: 34rpx; color: #6D6D72; }
    &--mt { margin-top: 28rpx; } /* 稿：支付宝码卡底 942 → 确认规则灰条（padding-top 14px） */
  }

  &__sec { font-size: 30rpx; line-height: 46rpx; font-weight: 500; color: #1A1A1A; } /* line-height 对齐稿的 23px 标题行高 */
  /* 稿：标题行容器紧接上一元素（无外间距），间距做在容器内（上 20px / 下 9px）——
     用内边距而非外边距，否则每处都会多出一个 20px，三处累积成 48px 偏差 */
  &__sec-row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 0 36rpx;
    padding: 40rpx 0 18rpx;
  }
  &__badge {
    box-sizing: border-box;
    background-color: #DFF5E9;
    border-radius: 999rpx;
    padding: 6rpx 20rpx;
    text { font-size: 24rpx; color: #00A860; }
    &--off { background-color: #EDEEF0; text { color: #8E8E93; } }
  }

  &__card {
    margin: 6rpx 32rpx 0; /* 稿：标题行底 230 → 卡 233（3px）；原 28rpx 偏大 */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
    /* 稿 1:6490 实测：纵向布局——二维码图在上、提示文案在下，两者水平居中
       卡高 217 = 上下 16×2 + 码图 159 + 间距 10 + 文案 16 */
    &--qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20rpx;        /* 稿：码图与提示文案间距 10px */
      box-sizing: border-box;
      margin-top: 6rpx; /* 稿：标题行底 → 码卡 453（3px，与银行卡卡一致） */
      padding: 32rpx;
    }
  }
  &__row { gap: 16rpx; min-height: 110rpx; } /* 稿：银行卡每行 55px（16+23+16）；原用 info-row 全局 64px 偏高 */
  &__label { font-size: 28rpx; color: #86868B; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--empty { color: #B0B0B5; }
  }
  /* 稿：卡内为真实二维码图（Ardot 导出 qr-pay.png，159px）；原为深色格子占位块 */
  &__qr-img {
    display: block;
    width: 318rpx;   /* 159px */
    height: 318rpx;
    flex-shrink: 0;
  }
  &__qr-hint {
    font-size: 24rpx;
    line-height: 34rpx;
    color: #8E8E93;
    text-align: center;   /* 稿：文案水平居中 */
  }

  &__safe { height: 60rpx; }
}
</style>
