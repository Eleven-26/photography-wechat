<template>
  <view class="page-work page-wrap">
    <!-- 深色 Hero（稿 Rectangle 44 #22252A + 图像叠加 HARD_LIGHT；演示数据用深色渐变替代图片，联调后换真实封面） -->
    <view class="page-work__hero">
      <!-- 背景图：稿 1:2876（黑底金色光轨，按画板 rotation-90 + 去饱和 + 叠加 #22252A 处理后导出为 hero-work.jpg）
           用 <image> 而非 CSS background —— 小程序 WXSS 不支持本地背景图路径 -->
      <image class="page-work__hero-bg" src="/static/img/hero-work.jpg" mode="aspectFill" />
      <view class="page-work__status" />
      <!-- Header：大日期数字 80 + 日期/问候 + 两个 44 白圆钮（1:2874 实测 y44 pad16 gap12） -->
      <view class="page-work__head">
        <text class="page-work__big">08</text>
        <view class="page-work__head-mid">
          <view class="page-work__head-date">
            <text class="page-work__date">8月8日</text>
            <text class="page-work__date">星期六</text>
          </view>
          <text class="page-work__hello">早上好，路先生</text>
          <text class="page-work__sub">今天有 2 场拍摄安排</text>
        </view>
        <view class="page-work__head-btns">
          <view class="page-work__rbtn pressable" @click="goEntry">
            <AppIcon name="plus-head-dark" :size="20" />
          </view>
          <view class="page-work__rbtn pressable" @click="goNotify">
            <AppIcon name="bell-dark" :size="20" />
          </view>
        </view>
      </view>
    </view>

    <!-- 浅色内容板：顶部两角大圆角压在深色 Hero 上（稿：圆角缺口露深色非灰底） -->
    <view class="page-work__body">
      <!-- ② 今日拍摄：横向滚动拍摄卡（1:2905 卡1 #121212 / 卡2 #292A2B，r24 pad20，右下详情钮） -->
      <view class="page-work__section">
      <view class="page-work__sec-head">
        <text class="page-work__sec-title">今日拍摄</text>
        <text class="page-work__sec-extra">2场</text>
      </view>
      <scroll-view class="page-work__shots" scroll-x :show-scrollbar="false" @scroll="onShotsScroll">
        <view
          v-for="(s, i) in shots"
          :key="s.time"
          class="page-work__shot"
          :class="{ 'page-work__shot--dim': i !== dotIdx }"
        >
          <view class="page-work__shot-top">
            <AppIcon name="clock-white-full" :size="20" />
            <text class="page-work__shot-time" :class="{ 'page-work__shot-time--lg': i === dotIdx }">{{ s.time }}</text>
          </view>
          <text class="page-work__shot-name">{{ s.title }}</text>
          <view class="page-work__shot-meta">
            <view class="page-work__meta-item">
              <AppIcon name="user-white" :size="20" />
              <text>{{ s.customer }}</text>
            </view>
            <view class="page-work__meta-item">
              <AppIcon name="pin-white" :size="20" />
              <text>{{ s.place }}</text>
            </view>
          </view>
          <view class="page-work__meta-dur">
            <AppIcon name="clock-white-mini" :size="14" />
            <text>{{ s.duration }}</text>
          </view>
          <!-- 左下角详情钮：统一规格（尺寸 52 / 主色 #EFFD00 / 同一箭头图标）；
               非当前卡不单独改按钮样式，靠卡片整体降不透明度自然淡出 -->
          <view class="page-work__shot-btn pressable" @click="goDetail(s)">
            <AppIcon name="arrow-right-dark" :size="20" />
          </view>
        </view>
      </scroll-view>
      <!-- 分页点（1:2961 实测 16×4 ×2，与横滑联动） -->
      <view class="page-work__dots">
        <view
          v-for="(s, i) in shots"
          :key="s.time"
          class="page-work__dot"
          :class="{ 'page-work__dot--on': dotIdx === i }"
        />
      </view>
    </view>

    <!-- ③ 现在需要处理：分隔线 + 两行待办（1:2968 实测 343×82、46 圆图标、右胶囊钮 h52） -->
    <view class="page-work__todo">
      <view class="page-work__sec-head page-work__sec-head--pad">
        <text class="page-work__sec-title page-work__sec-title--md">现在需要处理</text>
        <text class="page-work__sec-extra page-work__sec-extra--sm">2项</text>
      </view>
      <view class="page-work__hairline" />
      <view
        v-for="(t, i) in todos"
        :key="t.title"
        class="page-work__row pressable"
        @click="t.go && t.go()"
      >
        <view class="page-work__row-icon" :style="{ backgroundColor: t.iconBg }">
          <AppIcon :name="t.icon" :size="20" />
        </view>
        <view class="page-work__row-main">
          <text class="page-work__row-title">{{ t.title }}</text>
          <text class="page-work__row-sub">{{ t.sub }}</text>
        </view>
        <view
          class="page-work__row-btn pressable"
          :style="t.btnDark ? 'background-color:#24272C' : 'background-color:#FFFFFF; border: 1rpx solid rgba(20,21,24,0.09)'"
        >
          <text :style="{ color: t.btnDark ? '#FFFFFF' : '#141518' }">{{ t.btn }}</text>
        </view>
      </view>
      <view class="page-work__hairline" />

      <!-- ④ 其他待办（1:2992：行 343×64、黄胶囊紧急、chevron 灰） -->
      <view class="page-work__sec-head page-work__sec-head--pad">
        <text class="page-work__sec-title page-work__sec-title--md">其他待办</text>
        <text class="page-work__sec-extra page-work__sec-extra--sm">5项</text>
      </view>
      <view class="page-work__hairline" />
      <view
        v-for="(t, i) in others"
        :key="t.title"
        class="page-work__row2 pressable"
        :class="{ 'page-work__row2--line': i > 0 }"
        @click="t.go && t.go()"
      >
        <view class="page-work__row2-main">
          <text class="page-work__row2-title">{{ t.title }}</text>
          <text class="page-work__row2-sub">{{ t.sub }}</text>
        </view>
        <view v-if="t.urgent" class="page-work__urgent">
          <text>紧急</text>
        </view>
        <AppIcon name="arrow-row" :size="20" />
      </view>
    </view>

    </view>

    <AppTabBar active="work" />
    <view class="page-work__safe" />
  </view>
</template>

<script>
/**
 * W01 工作台（稿 1:2874 实测 1:1）
 * 结构：深色 Hero（大日期数字+问候+新建/通知钮）→ 今日拍摄横滑卡 → 现在需要处理 → 其他待办 → 底部导航。
 * 演示数据 utils/demo.js 口径：路先生 / 陈雨·家庭纪念写真·越秀公园·¥804 定金 / 蓝桥科技·商务形象照。
 * Hero 稿内为 #22252A+实拍图 HARD_LIGHT 叠加，H5 演示以深色渐变替代（标注：联调后换图）。
 */
import { photographer } from '@/utils/demo.js'

export default {
  name: 'WorkIndex',
  data() {
    return {
      name: photographer.name,
      dotIdx: 0,
      shots: [
        { time: '10:00', title: '家庭纪念写真', customer: '陈雨', place: '越秀公园', duration: '预计 3 小时', orderId: 'o1' },
        { time: '14:00', title: '商务形象照', customer: '蓝桥科技', place: '天河工作室', duration: '预计 2 小时', orderId: 'o2' },
      ],
      todos: [
        { title: '收款待确认', sub: '陈雨 · 微信转账 · ¥804', icon: 'money-dark', iconBg: '#FFDA08', btn: '立即确认', btnDark: true, go: () => this.goPay() },
        { title: '客户待回复', sub: '蓝桥科技 · 商务形象照 · 8分钟前', icon: 'bubble-dark', iconBg: '#E9EAEB', btn: '回复', btnDark: false, go: () => this.goLead() },
      ],
      others: [
        { title: '3 位客户待回复', sub: '含 1 条今日截止', urgent: true, go: () => this.goLead() },
        { title: '2 个后期任务', sub: '林柚负责 · 8月24日截止', urgent: false, go: () => this.goRetouch() },
      ],
    }
  },
  methods: {
    // 横滑拍摄卡与分页点联动：卡 614rpx + 间距 32rpx = pitch 646rpx，按比例取整判当前卡
    onShotsScroll(e) {
      const ww = (uni.getSystemInfoSync() || {}).windowWidth || 375
      const pitch = 646 * ww / 750
      const idx = Math.min(this.shots.length - 1, Math.max(0, Math.round((e.detail.scrollLeft || 0) / pitch)))
      if (idx !== this.dotIdx) this.dotIdx = idx
    },
    goEntry() {
      uni.navigateTo({ url: '/pages/order/entry' })
    },
    goNotify() {
      uni.navigateTo({ url: '/pages/notify/index' })
    },
    goPay() {
      uni.navigateTo({ url: '/pages/pay/verify' })
    },
    goLead() {
      uni.navigateTo({ url: '/pages/lead/list' })
    },
    goRetouch() {
      uni.navigateTo({ url: '/pages/retouch/task' })
    },
    goDetail(s) {
      uni.navigateTo({ url: `/pages/order/detail?id=${s.orderId}` })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-work {
  padding-bottom: 0;
  background-color: #F2F3F5; /* 稿 Rectangle 49：内容区整体灰底 @y164 起 */

  &__hero {
    position: relative;
    overflow: hidden;
    background-color: #22252A; /* 兜底底色（图片未加载时保持深色，避免闪白） */
    padding-bottom: 106rpx; /* 稿：暗区到 y164 + 48rpx 垫深色给内容板圆角缺口 */
  }
  &__hero-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  /* 浅色内容板：顶部两角 r24 圆角上提压住深色（缺口露深色，稿 P_W01） */
  &__body {
    position: relative;
    margin-top: -48rpx;
    border-radius: 48rpx 48rpx 0 0;
    background-color: #F2F3F5;
  }
  &__status { position: relative; z-index: 1; height: 44px; }

  /* Header：343 pad16 y44，大数字 80 / 问候 20 Bold / 两 44 圆钮 */
  &__head {
    position: relative;
    z-index: 1; /* 浮在 Hero 背景图上 */
    display: flex;
    align-items: center;
    gap: 16rpx; /* 稿单行问候：收紧间距防"路先生"换行 */
    padding: 0 32rpx;
  }
  &__big {
    font-size: 160rpx;
    line-height: 148rpx;
    color: #FFFFFF;
    font-weight: 400;
    font-family: $font-family-num;
    flex-shrink: 0;
    width: max-content;
  }
  &__head-mid { flex: 1; min-width: 0; }
  &__head-date {
    display: flex;
    gap: 20rpx;
    margin-bottom: 4rpx;
    text { font-size: 26rpx; font-weight: 700; color: #FFFFFF; white-space: nowrap; }
  }
  &__hello {
    display: block;
    font-size: 40rpx;
    line-height: 50rpx;
    font-weight: 700;
    color: #FFFFFF;
    white-space: nowrap; /* 稿：问候单行 */
  }
  &__sub {
    display: block;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #7A7D82;
    margin-top: 2rpx;
  }
  &__head-btns {
    display: flex;
    gap: 8rpx;
    flex-shrink: 0;
  }
  &__rbtn {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: #FFFFFF;
    border: 1rpx solid rgba(20, 21, 24, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 今日拍摄 */
  &__section { padding: 40rpx 32rpx 0; } /* 稿：section 标题 @y184（暗区 164 + 20 间距） */
  &__sec-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64rpx;
  }
  &__sec-head--pad { padding: 0 36rpx; }
  &__sec-title { font-size: 38rpx; line-height: 46rpx; font-weight: 700; color: #141414; }
  &__sec-title--md { font-size: 36rpx; }
  &__sec-extra { font-size: 28rpx; color: #7A7D82; font-weight: 500; }
  &__sec-extra--sm { font-size: 26rpx; }

  &__shots {
    margin: 0 -32rpx;
    padding: 20rpx 32rpx;
    white-space: nowrap;
    width: auto;
  }
  &__shot {
    position: relative;
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    width: 614rpx;
    height: 372rpx;
    border-radius: 48rpx;
    padding: 40rpx;
    margin-right: 32rpx;
    white-space: normal;
    /* 卡片底色统一为同一主色（原按「第一张 #121212 / 第二张 #292A2B」硬编码两色，与设计不符） */
    background-color: #292A2B;
    transition: opacity 0.24s ease;
    /* 非当前卡降低不透明度自然淡出，凸显中间主卡；状态随横滑实时切换（绑定 dotIdx） */
    &--dim { opacity: 0.55; }
  }
  &__shot-top {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__shot-time {
    font-size: 48rpx;
    font-weight: 700;
    color: #FFFFFF;
    font-family: $font-family-num;
    width: max-content;
  }
  &__shot-time--lg { font-size: 54rpx; }
  &__shot-name {
    display: block;
    margin-top: 20rpx;
    font-size: 54rpx;
    line-height: 60rpx;
    font-weight: 700;
    color: #FFFFFF;
  }
  &__shot-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx 28rpx;
    margin-top: 20rpx;
  }
  &__meta-item {
    display: flex;
    align-items: center;
    gap: 10rpx;
    text { font-size: 26rpx; color: rgba(255, 255, 255, 0.7); white-space: nowrap; }
  }
  &__meta-dur {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 14rpx; /* 稿：时长独立一行（用户定稿） */
    text { font-size: 26rpx; color: rgba(255, 255, 255, 0.62); white-space: nowrap; }
  }
  &__shot-btn {
    position: absolute;
    right: 32rpx;
    bottom: 32rpx;
    box-sizing: border-box;
    width: 88rpx;              /* 44px：按稿 1:2930 白色详情钮实测（原 104rpx/52px 偏大） */
    height: 88rpx;
    background-color: #FFFFFF; /* 稿：白底（原用 #EFFD00 黄块，过大过重） */
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__dots {
    display: flex;
    justify-content: center;
    gap: 10rpx;
    padding: 12rpx 0 8rpx; /* 稿：点条 422-426，与下段标题间距 20 */
  }
  &__dot {
    width: 32rpx;
    height: 8rpx;
    border-radius: 4rpx;
    background-color: #D6D7D8;
    &--on { background-color: #121212; }
  }

  /* 现在需要处理 / 其他待办 */
  &__todo { margin-top: 20rpx; }
  &__hairline { height: 1rpx; background-color: #EAEAEA; }
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 32rpx 32rpx; /* 稿：Article 343x82（内容 46 + 18×2） */
    /* 稿行透明底叠灰面，上下全宽 hairline（Rectangle 50/51），无白卡 */
  }
  &__row-icon {
    box-sizing: border-box;
    width: 92rpx;
    height: 92rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-title {
    display: block;
    font-size: 30rpx;
    line-height: 39rpx;
    font-weight: 700;
    color: #141518;
  }
  &__row-sub {
    display: block;
    font-size: 22rpx;
    line-height: 32rpx;
    color: #7A7D82;
    margin-top: 6rpx;
  }
  &__row-btn {
    box-sizing: border-box;
    width: 160rpx; /* 稿 1:2988/1:2977 实测 80×40 */
    height: 80rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 24rpx; font-weight: 700; white-space: nowrap; }
  }

  &__row2 {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 20rpx 32rpx;
    /* 稿行透明底叠灰面 */
    &--line { border-top: 1rpx solid #EAEAEA; }
  }
  &__row2-main { flex: 1; min-width: 0; padding-left: 4rpx; }
  &__row2-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #141518;
  }
  &__row2-sub {
    display: block;
    font-size: 24rpx;
    color: #7A7D82;
    margin-top: 6rpx;
  }
  &__urgent {
    box-sizing: border-box;
    width: 80rpx;  /* 用户定稿：40×24 胶囊 */
    height: 48rpx;
    background-color: #FFDA08;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 20rpx; font-weight: 700; color: #000000; }
  }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
