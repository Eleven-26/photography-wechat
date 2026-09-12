<template>
  <view class="page-sr page-wrap">
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)，头部容器 y44 起 -->
    <view class="status-bar" />

    <!-- ① 顶栏：标题居中（2026-09-08 全站定稿），返回钮独立居左 -->
    <view class="page-sr__header">
      <view class="page-sr__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="18" />
      </view>
      <text class="page-sr__title">客户已选</text>
    </view>

    <!-- ② 进度卡 343×102 @(16,114)：主行「已选/套餐张」+ 进度条 + 口径行
         稿值：主行 @(32,128)、进度条 311×6 @(32,163)、口径行 @(32,179) -->
    <view class="page-sr__prog">
      <view class="page-sr__prog-top">
        <text class="page-sr__prog-num">{{ cur.picked }}/{{ cur.quota }}<text class="page-sr__prog-unit">张</text></text>
        <text class="page-sr__prog-tag">{{ cur.tag }}</text>
      </view>
      <view class="page-sr__prog-bar">
        <view class="page-sr__prog-fill" :style="{ width: percent + '%' }" />
      </view>
      <view class="page-sr__prog-bottom">
        <text>套餐含{{ cur.quota }}张，超出部分 ¥{{ cur.pricePer }}/张</text>
        <text class="page-sr__prog-orig">原片{{ cur.orig }}张</text>
      </view>
    </view>

    <!-- ③ 状态卡 343×136 @(16,226)：9:1376 金边待确认 / 1:7385 绿边未选完
         稿值：标题行 @(32,242)、副行 @(32,272)、卡内黑胶囊 311×44 @(32,302) -->
    <view class="page-sr__state" :class="'page-sr__state--' + state">
      <view class="page-sr__state-top">
        <text class="page-sr__state-title">{{ cur.title }}</text>
        <text v-if="cur.fee" class="page-sr__state-fee">+¥{{ cur.fee }}</text>
      </view>
      <text class="page-sr__state-sub">{{ cur.sub }}</text>
      <view class="page-sr__state-btn pressable" @click="onStateAction">{{ cur.action }}</view>
    </view>

    <!-- ④ 已选图片网格 Group 37 342×452 @(16,382)：
         4 张 165×220 两列 gap12（与客户端 C13 Group 37 同构实测），金勾角标 20×20 右上 inset 10 -->
    <view class="page-sr__grid">
      <view v-for="(p, i) in shownPics" :key="i" class="page-sr__pic">
        <!-- 稿：网格内为真实选片缩略图（原为灰底占位块 + 文件名文字，与稿不符） -->
        <image class="page-sr__pic-img" :src="p.img" mode="aspectFill" />
        <view class="page-sr__pic-tick">
          <AppIcon name="check-sm-dark" :size="12" />
        </view>
      </view>
    </view>

    <!-- ⑤ 查看全部已选：稿 @(142,854) #747981 居中文字钮 -->
    <view class="page-sr__more pressable" @click="onExpand">
      <text>{{ expanded ? '收起' : '查看全部已选' }}</text>
      <AppIcon v-if="!expanded" name="chevron-right-gray" :size="14" />
    </view>

    <!-- ⑥ 底部 CTA：容器 @(0,894) 上10/下14/左右16，胶囊 343×52 r999 黑 #171819 白字 15 粗体 -->
    <view class="page-sr__footer">
      <view class="page-sr__cta pressable" @click="onCreateTask">创建修图任务</view>
    </view>

    <!-- ⑦ 底部导航（D08 稿内保留，Variant2=订单） -->
    <AppTabBar active="order" />
  </view>
</template>

<script>
/**
 * D08 选片结果页「客户已选」（画板双态稿，已按 9:1376 / 1:7385 实测校正）。
 *
 * 结构：顶栏 → 进度卡(343×102) → 状态卡(343×136) → 图片网格(342×452)
 *      → 查看全部已选 → 底 CTA「创建修图任务」→ AppTabBar(order)。
 * 双态：9:1376 超选态（24/20，待客户确认加片）/ 1:7385 未选完态（15/20，提醒选片）；
 *      由 data.state('over' | 'pending') 驱动，联调后按 order_id 区分（演示默认 'over'）。
 *
 * 数据源：/api/delivery/select-result（联调核对）；下方为演示兜底（联调后移除）。
 * 金勾角标：稿内实色 #D9A735（r10）+ 黑勾 12×12。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import AppIcon from '@/components/AppIcon.vue'

export default {
  name: 'SelectResult',
  components: { AppTabBar, AppIcon },
  data() {
    return {
      expanded: false,
      orderId: 90001,          // 演示值（联调核对）
      state: 'over',           // 演示态：'over' 超选态 | 'pending' 未选完态（联调后按 order_id 区分）
      // 双态数据（画板 9:1376 / 1:7385 实测口径）
      meta: {
        over: {
          picked: 24, quota: 20, addon: 4, fee: 240,
          orig: 150, pricePer: 60,
          tag: '超选 4 张',
          title: '超选加片 · 待客户确认',
          /* 稿文案：加片 N 张 × 单价，确认后计入尾款（尾款基数 1876 + 加选 240 = 2116，与原口径一致） */
          sub: '加片 4 张 × ¥60，确认后计入尾款：¥1,876 → ¥2,116',
          action: '请客户确认加片',
        },
        pending: {
          picked: 15, quota: 20, left: 5,
          orig: 150, pricePer: 60,
          tag: '还差5张',
          title: '客户未选完',
          sub: '5张未选',
          action: '提醒用户选片',
        },
      },
      /* 稿：网格展示真实选片缩略图（工程内置演示实拍图，联调后换成客户实际选片） */
      pics: [
        { no: 'IMG_0812', img: '/static/img/work-1.jpg' },
        { no: 'IMG_0845', img: '/static/img/work-2.jpg' },
        { no: 'IMG_0903', img: '/static/img/work-3.jpg' },
        { no: 'IMG_0921', img: '/static/img/work-4.jpg' },
        { no: 'IMG_0930', img: '/static/img/work-5.jpg' },
        { no: 'IMG_0947', img: '/static/img/work-6.jpg' },
        { no: 'IMG_0952', img: '/static/img/work-1.jpg' },
        { no: 'IMG_0966', img: '/static/img/work-3.jpg' },
      ],
    }
  },
  computed: {
    /** 当前态数据 */
    cur() { return this.meta[this.state] },
    /** 进度百分比：01 态 24/20 → 封顶 100%，02 态 15/20 → 75% */
    percent() {
      const p = Math.round((this.cur.picked / this.cur.quota) * 100)
      return Math.min(100, Math.max(0, p))
    },
    /** 折叠态展示 4 张（稿态），展开显示全部演示片 */
    shownPics() {
      return this.expanded ? this.pics : this.pics.slice(0, 4)
    },
  },
  methods: {
    onExpand() {
      this.expanded = !this.expanded
    },
    /** 卡2 胶囊：01 态演示占位（联调后接确认加片接口）；02 态提醒选片 */
    onStateAction() {
      if (this.state === 'over') {
        uni.showToast({ title: '已提醒客户确认加片', icon: 'none' })
      } else {
        uni.showToast({ title: '已提醒用户选片', icon: 'none' })
      }
    },
    /** 创建修图任务（联调核对） */
    onCreateTask() {
      uni.navigateTo({ url: '/pages/retouch/task?id=' + this.orderId })
    },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-sr {
  padding-bottom: 360rpx; /* 留出固定 CTA(footer) + AppTabBar 空间，防遮挡 */

  /* ① 顶栏（同 D01/D02 实测规格）：60 容器垂直居中（中心 y74），标题绝对居中 */
  &__header {
    position: relative;
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box;
    padding: 0 $page-pad;
  }
  &__top-btn {
    position: relative;
    z-index: 1;
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
    text-align: center; /* 全站定稿：头部标题水平居中 */
    pointer-events: none;
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  /* ② 进度卡：343×102 @(16,114)，白底 r32 */
  &__prog {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 204rpx;            /* 102 */
    box-sizing: border-box;
    margin: 20rpx $page-pad 0;  /* 稿 y114 = 状态栏44 + 头部60 + 10 */
    padding: 28rpx 32rpx;       /* 主行 @(32,128) → 内距 16px */
    background-color: $white;
    border-radius: 32rpx;       /* r16 稿值 */
  }
  &__prog-top { display: flex; align-items: baseline; justify-content: space-between; gap: 16rpx; }
  &__prog-num {
    color: $text-1;
    font-size: 40rpx;
    font-weight: 700;
    font-family: $font-family-num;
    line-height: 44rpx;
  }
  &__prog-unit { margin-left: 2rpx; font-size: 28rpx; font-weight: 700; }
  &__prog-tag { flex: none; color: $text-2; font-size: 28rpx; } /* 灰 14px 稿值 */
  &__prog-bar {
    height: 12rpx;              /* 6 */
    border-radius: 999rpx;
    background-color: #E8E8E3;  /* 灰底（稿值） */
    overflow: hidden;
  }
  &__prog-fill {
    height: 100%;
    border-radius: 999rpx;
    background-color: #171717;  /* 黑填充（稿值） */
    transition: width 0.2s ease;
  }
  &__prog-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    color: $text-2;
    font-size: 24rpx;           /* 12px 稿值 */
  }
  &__prog-orig { flex: none; color: $text-2; }

  /* ③ 状态卡：343×136 @(16,226)，白底 + 描边（01 金 / 02 绿） */
  &__state {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 272rpx;             /* 136 */
    margin: 20rpx $page-pad 0;  /* 稿 y226 = 进度卡底 216 + 10 */
    padding: 32rpx;             /* 稿内距 16px */
    background-color: $white;
    border: 2rpx solid $border-1;
    border-radius: 32rpx;

    &--over { border-color: #D9A735; }    /* 稿金边 9:1376 */
    &--pending { border-color: #2FAF5E; } /* 稿绿边 1:7385 */
  }
  &__state-top { display: flex; align-items: baseline; justify-content: space-between; gap: 16rpx; }
  &__state-title {
    color: $gold;               /* #B66E00 稿值（01 金粗体） */
    font-size: 30rpx;
    font-weight: 700;
    line-height: 40rpx;
  }
  &__state--pending &__state-title { color: #2F855A; } /* 稿绿字 1:7385 */
  &__state-fee {
    flex: none;
    color: $gold;
    font-size: 30rpx;
    font-weight: 700;
    font-family: $font-family-num;
  }
  &__state-sub { margin-top: 20rpx; color: $text-2; font-size: 24rpx; line-height: 32rpx; }
  &__state-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: 88rpx;              /* 44 */
    margin-top: auto;           /* 贴卡底（稿 y302） */
    background-color: $btn-primary; /* 稿黑胶囊 #171819 */
    border-radius: 999rpx;
    color: $white;
    font-size: 30rpx;           /* 15 稿值 */
    font-weight: 700;
  }

  /* ④ 图片网格：342 宽两列 165×220 gap12（C13 同构实测）；圆角 r16（同 WorkGrid 先例） */
  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    margin: 40rpx $page-pad 0; /* 稿 y382 = 状态卡底 362 + 20px(40rpx) */
  }
  &__pic {
    position: relative;
    /* 两列等分：必须与 gap(24rpx) 用同一单位扣减。原 calc(50% - 6px) 用固定 px，
       视口一宽 gap 随之变大而扣减不变，两列总宽超出容器被挤成换行 → 退化为单列 */
    width: calc((100% - 24rpx) / 2);
    height: 440rpx;         /* 220 */
    border-radius: 16rpx;
    overflow: hidden;
    background-color: #E8E9EB;
    box-sizing: border-box;
  }
  /* 稿：网格为真实选片缩略图（aspectFill 裁满 165×220），原占位块样式已废弃 */
  &__pic-img {
    display: block;
    width: 100%;
    height: 100%;
  }
  &__pic-tick {
    position: absolute;
    top: 20rpx;
    right: 20rpx; /* C13 实测角标 inset 10/10 */
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #D9A735; /* 稿值实测（原 #FFDA08 推导色已废弃） */
    border-radius: 20rpx;
  }

  /* ⑤ 查看全部已选：稿 @(142,854) 14px #747981 居中 */
  &__more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    margin-top: 28rpx;
    min-height: 88rpx; /* 触摸目标 */
    color: #747981;    /* 实测 */
    font-size: 28rpx;  /* 14 稿值 */
    font-weight: 500;
  }

  /* ⑥ 底部 CTA：固定于 AppTabBar（83px）之上。
     注意 footer 不透明底须铺到屏幕底（bottom:0）——z-index 99 低于 AppTabBar 的 100 会被其盖住，
     这样 CTA 与 tab 之间的空隙不会让网格内容「穿模」透出（2026-09-10 H5 渲染抽查发现）。 */
  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    box-sizing: border-box;
    /* 稿：CTA 底 → 导航栏顶 = 24px。CTA 底 = 屏底 − padding-bottom，导航栏顶 = 屏底 − 57(tab 主体实高)，
       故 padding-bottom = 24 + 57 = 81px = 162rpx（原 28+166rpx 按含 Home Indicator 的 83 算，多出 16px） */
    padding: 20rpx $page-pad 162rpx;
    background-color: $bg-page;
  }
  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;                /* 343 → 686（页边距 16×2） */
    height: 104rpx;             /* 52 */
    background-color: $btn-primary; /* 稿 #171819 */
    border-radius: 999rpx;
    color: $white;
    font-size: 30rpx;           /* 15 稿值 */
    font-weight: 700;
  }
}
</style>
