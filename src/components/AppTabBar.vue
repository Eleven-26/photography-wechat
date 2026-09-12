<template>
  <view class="app-tabbar">
    <view
      v-for="t in tabs"
      :key="t.key"
      class="app-tabbar__item pressable"
      @click="go(t)"
    >
      <image
        class="app-tabbar__icon"
        :src="`/static/icons/${t.icon}-${active === t.key ? 'on' : 'off'}.svg`"
        mode="aspectFit"
      />
      <text
        class="app-tabbar__label"
        :class="{ 'app-tabbar__label--on': active === t.key }"
      >{{ t.label }}</text>
    </view>
  </view>
</template>

<script>
/**
 * AppTabBar —— 摄影师端底部导航（组件实例 1:8370 实测）
 *
 * 规格：375×83 白底；图标 24px y8 + 文字 11px y32；
 * 选中：字 Bold #242424 / 未选：字 Regular #9198A2；
 * 图标两套 SVG 切换（用户定稿）：选中 #000 / 默认 #9E9E9E。
 * 5 个 tab：工作台 / 订单 / 日程 / 客户 / 我的（顺序与稿一致）。
 * 注意：工作台/日程/客户/我的页面属后续批次，当前点击提示建设中（非占位页，仅导航交互）。
 */
export default {
  name: 'AppTabBar',
  props: {
    /** 当前激活 tab key：work / order / schedule / customer / me */
    active: { type: String, default: 'order' },
  },
  data() {
    return {
      tabs: [
        { key: 'work', label: '工作台', icon: 'tab-work', url: '/pages/work/index' },
        { key: 'order', label: '订单', icon: 'tab-order', url: '/pages/order/list' },
        { key: 'schedule', label: '日程', icon: 'tab-schedule', url: '/pages/schedule/index' },
        { key: 'customer', label: '客户', icon: 'tab-customer', url: '/pages/customer/list' },
        { key: 'me', label: '我的', icon: 'tab-me', url: '/pages/me/index' },
      ],
    }
  },
  methods: {
    go(t) {
      if (t.key === this.active) return
      if (!t.url) {
        /* 后续批次开放（工作台/日程/客户/我的），先提示，不跳空白页 */
        uni.showToast({ title: '建设中，下一批开放', icon: 'none' })
        return
      }
      uni.reLaunch({ url: t.url })
    },
  },
}
</script>

<style lang="scss" scoped>
.app-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  background-color: $white; /* 1:8370 实测白底 */
  border-top: 1rpx solid $border-1;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 16rpx;   /* 图标 y8 */
    min-height: 96rpx;    /* 83px 组件高 - 安全区外部分 + 触摸目标 */
  }
  &__icon {
    width: 48rpx;         /* 24px */
    height: 48rpx;
    /* 两态形状不同、直接换图：选中 tab-X.svg（#000）/ 默认 tab-X-off.svg（#9E9E9E），用户定稿 10 icon */
  }
  &__label {
    margin-top: 0;        /* 文字 y32 = 图标 y8+24 */
    color: #9198A2;       /* 实测未选字色 */
    font-size: $fs-xs;    /* 11px */
  }
  &__label--on { color: #242424; font-weight: 700; } /* 实测选中 #242424 Bold */
}
</style>
