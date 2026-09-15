<template>
  <!-- D08 修图任务（1:7458）一比一还原：黑白双段头卡 + 待修/已修双栏看板 + 底部提示与黑钮 -->
  <page-meta :page-style="dragging ? 'overflow:hidden;' : ''" />
  <view class="page-rt" :class="{ 'page-rt--drag': dragging }">
    <view class="status-bar" />
    <view class="page-rt__header">
      <view class="page-rt__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-rt__title">
        <text class="page-rt__title-text">修图任务</text>
      </view>
    </view>

    <!-- 头卡 343x147：上 76 黑段 + 下白段（单号徽章/客户/进度/截止） -->
    <view class="page-rt__hero">
      <view class="page-rt__hero-top">
        <view class="page-rt__hero-txts">
          <text class="page-rt__hero-name">{{ heroName }}</text>
          <text class="page-rt__hero-sub">{{ heroSub }}</text>
        </view>
        <view class="page-rt__hero-no"><text class="page-rt__hero-no-txt">{{ orderNo }}</text></view>
      </view>
      <view class="page-rt__hero-bottom">
        <view class="page-rt__hero-progress">
          <text class="page-rt__hero-num">{{ fixed }}</text>
          <text class="page-rt__hero-total">/{{ total }}</text>
          <text class="page-rt__hero-unit">已修</text>
        </view>
        <view class="page-rt__hero-deadline">
          <text class="page-rt__hero-deadline-txt">{{ deadlineText }}</text>
        </view>
      </view>
      <view class="page-rt__track">
        <view class="page-rt__track-fill" :style="{ width: percent + '%' }" />
      </view>
    </view>

    <!-- 双栏看板：左待修 #F2F3F5 / 右已修 #EFFFF4；长按卡片拖拽跨栏，点按看大图 -->
    <view class="page-rt__board">
      <view
        class="page-rt__col page-rt__col--todo"
        :class="{ 'page-rt__col--hot': dragging && dragTarget === 'todo' && dragFrom !== 'todo' }"
      >
        <view class="page-rt__col-head">
          <text class="page-rt__col-title">待修</text>
          <view class="page-rt__col-badge page-rt__col-badge--todo">
            <text class="page-rt__col-badge-txt page-rt__col-badge-txt--todo">{{ todoList.length }}</text>
          </view>
        </view>
        <view
          v-for="p in todoList"
          :key="p.id"
          class="page-rt__card"
          :class="{ 'page-rt__card--lift': dragging && dragItem && dragItem.name === p.name }"
          @touchstart="tst($event, p, 'todo')"
          @longpress="lift($event, p, 'todo')"
          @touchmove="tm"
          @touchend="te"
          @touchcancel="tc"
          @click="preview(p)"
        >
          <view class="page-rt__pic"><image class="page-rt__pic-img" :src="p.img" mode="aspectFill" /></view>
          <text class="page-rt__card-name">{{ p.name }}</text>
          <text v-if="p.note" class="page-rt__card-note">{{ p.note }}</text>
        </view>
      </view>
      <view
        class="page-rt__col page-rt__col--done"
        :class="{ 'page-rt__col--hot': dragging && dragTarget === 'done' && dragFrom !== 'done' }"
      >
        <view class="page-rt__col-head">
          <text class="page-rt__col-title page-rt__col-title--done">已修</text>
          <view class="page-rt__col-badge page-rt__col-badge--done">
            <text class="page-rt__col-badge-txt page-rt__col-badge-txt--done">{{ doneList.length }}</text>
          </view>
        </view>
        <view
          v-for="p in doneList"
          :key="p.id"
          class="page-rt__card"
          :class="{ 'page-rt__card--lift': dragging && dragItem && dragItem.name === p.name }"
          @touchstart="tst($event, p, 'done')"
          @longpress="lift($event, p, 'done')"
          @touchmove="tm"
          @touchend="te"
          @touchcancel="tc"
          @click="preview(p)"
        >
          <view class="page-rt__pic"><image class="page-rt__pic-img" :src="p.img" mode="aspectFill" /></view>
          <text class="page-rt__card-name">{{ p.name }}</text>
          <text v-if="p.note" class="page-rt__card-note">{{ p.note }}</text>
        </view>
      </view>
    </view>

    <!-- 拖拽浮影：跟手缩略图，pointer-events 关闭不挡落点 -->
    <view v-if="dragging && dragItem" class="page-rt__ghost" :style="ghostStyle">
      <image class="page-rt__ghost-img" :src="dragItem.img" mode="aspectFill" />
    </view>

    <!-- 底部：拖拽提示 + 黑钮（稿容器 y1216） -->
    <view class="page-rt__footer">
      <view class="footer-safe" />
      <text class="page-rt__tip">按住卡片拖到右栏 = 标记修好 · 拖回左栏撤销 · 点看大图</text>
      <view class="page-rt__btn" @click="goUpload">
        <text class="page-rt__btn-txt">上传精修图</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * D08 修图任务看板（稿 1:7458 实测 1:1）
 * 头卡（订单/进度/截止）+ 待修/已修双栏看板（拖拽跨栏标记）+ 底部「上传精修图」。
 *
 * 数据源（2026-09-14 接线）：
 *   /order/detail/:id       → 头卡（客户·套餐 / 拍摄时间地点 / 订单号）
 *   /delivery/detail/:id    → 计划精修张数(retouch_target)、选片截止(select_deadline)   :id = order_id
 *   /delivery/items/:id     → 交付明细，按 kind 分栏：2-已选（待修） / 3-精修成品（已修）
 *
 * ⚠️ 左栏「待修」= 客户已选但还没上传精修成品的片子；右栏「已修」= 已落库的精修成品。
 *    两栏都是**服务端事实**，不是本地标记：拖拽只做本地归类（便于自己理片），
 *    真正的"修好"以上传精修图为准（右栏张数随后端数据变化）——避免前端造出
 *    "服务器不存在的已修状态"。
 */
import { getOrderDetail } from '@/api/order'
import { getDeliveryDetail, getDeliveryItems } from '@/api/delivery'
import { mediaUrl } from '@/utils/url'

/** DeliveryItem.kind：1-样片 2-已选 3-精修成品（enum.DeliveryItemKind） */
const KIND_SELECTED = 2
const KIND_RETOUCHED = 3

export default {
  data() {
    return {
      orderId: '',
      order: null,
      delivery: null,
      todoList: [],
      doneList: [],
      // 拖拽状态：长按抬起 → 浮影跟手 → 松手按落点列跨栏
      dragging: false,
      dragItem: null,
      dragFrom: '',
      gx: 0,
      gy: 0,
      sx: 0,
      sy: 0,
      ww: 375,
    }
  },
  computed: {
    /** 计划精修张数（交付单未建时回落到两栏合计） */
    total() {
      const d = this.delivery || {}
      return d.retouch_target || this.todoList.length + this.doneList.length
    },
    /** 已修张数 = 右栏实际张数（服务端精修成品明细） */
    fixed() {
      return this.doneList.length
    },
    percent() {
      return this.total > 0 ? Math.min(100, (this.fixed / this.total) * 100) : 0
    },
    heroName() {
      const o = this.order || {}
      return [o.customer_name, o.package_name].filter(Boolean).join(' · ') || '修图任务'
    },
    heroSub() {
      const o = this.order || {}
      const when = [o.shoot_date, o.shoot_time].filter(Boolean).join(' ')
      return [when, o.shoot_address, o.people_count].filter(Boolean).join(' · ') || '待补充拍摄信息'
    },
    orderNo() {
      return (this.order && this.order.code) || ''
    },
    deadlineText() {
      const raw = (this.delivery && this.delivery.select_deadline) || ''
      if (!raw) return '未设截止'
      const s = String(raw)
      const d = s.includes('T') ? new Date(s) : new Date(s.replace(/-/g, '/'))
      if (Number.isNaN(d.getTime())) return `截止${s.slice(5, 10)}`
      return `截止${d.getMonth() + 1}/${d.getDate()}`
    },
    dragTarget() {
      if (!this.dragging) return ''
      return this.gx > this.ww / 2 ? 'done' : 'todo'
    },
    ghostStyle() {
      return `left:${this.gx}px;top:${this.gy}px;`
    },
  },
  onLoad(options) {
    this.orderId = (options && options.id) || ''
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      if (!this.orderId) return
      const [orderRes, deliveryRes, itemsRes] = await Promise.all([
        getOrderDetail(this.orderId).catch(() => null),
        getDeliveryDetail(this.orderId).catch(() => null),
        getDeliveryItems(this.orderId).catch(() => null),
      ])
      this.order = (orderRes && orderRes.order) || null
      this.delivery = deliveryRes || null
      const items = Array.isArray(itemsRes) ? itemsRes : []
      const toCard = (it) => ({
        id: it.id,
        name: it.filename || `IMAGE_${it.id}`,
        note: it.feedback_content || '',
        // 文件 url 是站内相对路径（/uploads/…），小程序须经 mediaUrl 补 API_BASE 才能加载
        img: mediaUrl(it.url),
      })
      this.doneList = items.filter((it) => it.kind === KIND_RETOUCHED).map(toCard)
      this.todoList = items.filter((it) => it.kind === KIND_SELECTED).map(toCard)
    },
    goBack() {
      uni.navigateBack()
    },
    // 按下：记起点与候选卡，等待横向意图或长按兜底
    tst(e, p, from) {
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0])
      if (!t) return
      this.sx = t.clientX
      this.sy = t.clientY
      this.gx = t.clientX
      this.gy = t.clientY
      this._pend = { p, from }
    },
    // 长按兜底：按住不动 350ms 也可抬起
    lift(e, p, from) {
      this._pend = { p, from }
      this.liftNow()
    },
    liftNow() {
      if (this.dragging || !this._pend) return
      this.ww = uni.getSystemInfoSync().windowWidth || 375
      this.dragItem = this._pend.p
      this.dragFrom = this._pend.from
      this.dragging = true
      this._pend = null
      if (uni.vibrateShort) uni.vibrateShort({ type: 'light' })
    },
    // 跟手：横向位移主导时立即抬起进入拖拽；垂直滑动不拦截（页面照常滚）
    tm(e) {
      const t = e.touches && e.touches[0]
      if (!t) return
      this.gx = t.clientX
      this.gy = t.clientY
      if (this.dragging) {
        if (e.cancelable) e.preventDefault() // H5 拖动中禁页面滚动，MP 走 page-meta
        return
      }
      if (!this._pend) return
      const dx = t.clientX - this.sx
      const dy = t.clientY - this.sy
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) this.liftNow()
    },
    // 松手：按落点列归属跨栏移动（同栏 = 吸回原位）
    te() {
      if (!this.dragging) return
      const item = this.dragItem
      const from = this.dragFrom
      const to = this.dragTarget
      this.dragging = false
      this.dragItem = null
      this.dragFrom = ''
      if (!item || to === from) return
      if (from === 'todo') {
        this.todoList = this.todoList.filter((x) => x.id !== item.id)
        this.doneList = [item, ...this.doneList]
        uni.showToast({ title: '已移到已修 · 上传成品后正式生效', icon: 'none' })
      } else {
        this.doneList = this.doneList.filter((x) => x.id !== item.id)
        this.todoList = [item, ...this.todoList]
        uni.showToast({ title: '已退回待修', icon: 'none' })
      }
      this._dropGuard = Date.now() // 拖完误触 click 不弹大图
    },
    tc() {
      this.dragging = false
      this.dragItem = null
      this.dragFrom = ''
    },
    // 点按：原生大图浏览（整任务照片可左右滑看）
    preview(p) {
      if (Date.now() - (this._dropGuard || 0) < 500) return
      const urls = [...this.todoList, ...this.doneList].map((x) => x.img)
      uni.previewImage({ urls, current: p.img })
    },
    goUpload() {
      if (!this.orderId) return uni.showToast({ title: '缺少订单信息', icon: 'none' })
      uni.navigateTo({ url: '/pages/upload/retouch?id=' + this.orderId })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-rt {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 240rpx;
  &--drag {
    touch-action: none; /* 拖动中禁触控滚动（H5），MP 走 page-meta overflow:hidden */
    user-select: none;
  }

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box;
    padding: 0 $page-pad;
  }
  &__top-btn {
    box-sizing: border-box;
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
    text-align: center;
    pointer-events: none;
  }
  &__title-text {
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  &__hero {
    margin: 10rpx $page-pad 0; /* 稿 y114 */
    background-color: $white;
    border-radius: 16rpx;
    overflow: hidden;
  }
  &__hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background-color: #000000; /* 稿黑段 76 高 */
    padding: 32rpx 32rpx 20rpx; /* 名字 y130-114=16 */
    min-height: 152rpx; /* 76px */
    box-sizing: border-box;
  }
  &__hero-txts {
    display: flex;
    flex-direction: column;
  }
  &__hero-name {
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__hero-sub {
    color: #999999; /* 实测 */
    font-size: 24rpx;
    margin-top: 7rpx;
  }
  &__hero-no {
    background-color: #212121; /* 实测 */
    border-radius: 8rpx;
    padding: 4rpx 20rpx; /* 稿 22 高 */
  }
  &__hero-no-txt {
    color: #CCCCCC; /* 实测 */
    font-size: 20rpx;
  }
  &__hero-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 32rpx 0; /* 稿 y200 */
  }
  &__hero-progress {
    display: flex;
    align-items: baseline;
  }
  &__hero-num {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__hero-total {
    color: $text-1;
    font-size: 24rpx;
    font-weight: 700;
  }
  &__hero-unit {
    color: $text-2;
    font-size: 24rpx;
    margin-left: 8rpx;
  }
  &__hero-deadline {
    border: 1rpx solid #D9A735; /* 稿金描边 */
    border-radius: 999rpx;
    padding: 6rpx 18rpx;
  }
  &__hero-deadline-txt {
    color: $badge-gold-text;
    font-size: 22rpx;
    font-weight: 500;
  }
  &__track {
    margin: 14rpx 32rpx 28rpx; /* 稿 y235 */
    height: 12rpx; /* 稿 6 */
    border-radius: 8rpx;
    background-color: #E8E8E3;
    overflow: hidden;
  }
  &__track-fill {
    height: 100%;
    background-color: #171717;
    border-radius: 8rpx;
  }

  &__board {
    display: flex;
    gap: 22rpx; /* 列宽 166+166 gap11 */
    margin: 20rpx $page-pad 0; /* 稿 y281 */
  }
  &__col {
    flex: 1;
    border: 1rpx solid #CCCCCC; /* 实测 */
    border-radius: 12rpx;
    padding: 24rpx 16rpx; /* 头 y293-281=12 */
    min-height: 400rpx;
    transition: box-shadow 0.15s;
  }
  &__col--todo {
    background-color: #F2F3F5;
  }
  &__col--done {
    background-color: #EFFFF4; /* 实测 */
  }
  &__col--hot {
    box-shadow: inset 0 0 0 4rpx #17181A; /* 拖拽悬停目标栏高亮 */
  }
  &__col--done.page-rt__col--hot {
    box-shadow: inset 0 0 0 4rpx #2F855A;
  }
  &__col-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
  }
  &__col-title {
    color: #000000;
    font-size: 28rpx;
    font-weight: 500;
  }
  &__col-title--done {
    color: #2F855A; /* 实测 */
  }
  &__col-badge {
    min-width: 48rpx; /* 稿 24x16 */
    box-sizing: border-box;
    border-radius: 6rpx;
    padding: 0 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32rpx;
  }
  &__col-badge--todo {
    background-color: #E2E2E2; /* 实测 */
  }
  &__col-badge--done {
    background-color: #B3EBC6; /* 实测 */
  }
  &__col-badge-txt {
    font-size: 24rpx;
    font-weight: 700;
  }
  &__col-badge-txt--todo {
    color: #000000;
  }
  &__col-badge-txt--done {
    color: #2F855A;
  }
  &__card {
    background-color: $white;
    border-radius: 8rpx;
    padding: 12rpx 12rpx 14rpx;
    margin-bottom: 18rpx; /* 稿卡距约 10 */
  }
  &__card--lift {
    opacity: 0.25; /* 原位卡半透明，浮影跟手 */
  }
  &__pic {
    width: 100%;
    height: 320rpx; /* 稿 160 */
    border-radius: 6rpx;
    overflow: hidden;
    background-color: #CAC8C8; /* 实测占位 */
  }
  &__pic-img {
    display: block;
    width: 100%;
    height: 100%;
  }
  &__card-name {
    display: block;
    color: #000000;
    font-size: 24rpx;
    margin-top: 10rpx; /* 稿 490-481 */
  }
  &__card-note {
    display: block;
    color: $badge-gold-text;
    font-size: 24rpx;
    line-height: 30rpx;
    margin-top: 4rpx;
  }

  &__ghost {
    position: fixed;
    z-index: 999;
    width: 264rpx;
    height: 264rpx;
    transform: translate(-50%, -55%) scale(1.04);
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.28);
    pointer-events: none; /* 不挡 touch 落点判定 */
  }
  &__ghost-img {
    display: block;
    width: 100%;
    height: 100%;
  }

  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $bg-page;
  }
  &__tip {
    display: block;
    text-align: center;
    color: $text-2;
    font-size: 24rpx;
    padding-top: 10rpx;
  }
  &__btn {
    margin: 10rpx 32rpx 28rpx;
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #171819;
    border-radius: 999rpx;
  }
  &__btn-txt {
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
  }
}
</style>
