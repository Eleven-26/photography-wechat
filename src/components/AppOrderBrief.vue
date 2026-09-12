<template>
  <view class="page-ob">
    <!-- 左：客户名 · 套餐名（15 Bold，中间 4px 圆点分隔，D14/D15 Group 实测） -->
    <view class="page-ob__main">
      <text class="page-ob__name">{{ name }}</text>
      <view class="page-ob__dot" />
      <text class="page-ob__pkg">{{ packageName }}</text>
    </view>

    <!-- 右上：单号徽章（93×22 灰底 #F2F3F5 胶囊，字 10 #666） -->
    <view class="page-ob__code">
      <text>{{ code }}</text>
    </view>

    <!-- 副行：拍摄信息 12 Medium #747881（实测） -->
    <text class="page-ob__sub">{{ subtitle }}</text>
  </view>
</template>

<script>
/**
 * AppOrderBrief — 订单摘要卡（D14 退款申请 / D15 改期申请顶部共用，画板 Group 实测）
 *
 * 稿值：白卡 343×72 @y114（跟在 44 顶栏 + 60 页头之后），pad16；
 *   客户名 15 Bold + 4px 黑圆点 + 套餐名 15 Bold；单号徽章 93×22 #F2F3F5 胶囊 10px #666；
 *   副行 12 Medium #747981「8/8 10:00 拍摄 · 越秀公园 · 2大1小」。
 * 卡片圆角稿未标（Rectangle 无 cornerRadius），按体系推导 r16 —— 推导值，非实测。
 */
export default {
  name: 'AppOrderBrief',
  props: {
    /** 客户名（orders.customer_name） */
    name: { type: String, default: '' },
    /** 套餐名（orders.package_name） */
    packageName: { type: String, default: '' },
    /** 单号（orders.code），如 SL-260808-12 */
    code: { type: String, default: '' },
    /** 副行文案：拍摄日期时间 · 地点 · 人数 */
    subtitle: { type: String, default: '' },
  },
}
</script>

<style lang="scss" scoped>
.page-ob {
  position: relative;
  margin: 20rpx $page-pad 0; /* 实测：header 底 104 → 卡 y114，gap 10px */
  padding: 32rpx;
  background-color: $white;
  border-radius: $radius-card; /* 推导：稿 Rectangle 未标 cornerRadius */

  &__main {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__name,
  &__pkg {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 30rpx;
  }
  &__dot {
    width: 8rpx;
    height: 8rpx;
    background-color: $text-1;
    border-radius: 50%;
  }

  &__code {
    position: absolute;
    top: 26rpx;
    right: 32rpx;
    padding: 4rpx 20rpx;
    background-color: $badge-gray-bg; /* 实测 #F2F3F5 */
    border-radius: 999rpx;
    text { color: #666666; font-size: 20rpx; line-height: 28rpx; }
  }

  &__sub {
    display: block;
    margin-top: 18rpx;
    color: $text-2; /* 实测 #747981 */
    font-size: 24rpx;
    font-weight: 500;
    line-height: 24rpx;
  }
}
</style>
