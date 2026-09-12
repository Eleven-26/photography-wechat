<template>
  <view class="page-cc">
    <!-- 头像：40 黑圆 #171819 + 姓氏首字（15 白，实测） -->
    <view class="page-cc__avatar">
      <text>{{ avatarText }}</text>
    </view>

    <!-- 右：姓名 15 Bold + 副行 12 #666（实测） -->
    <view class="page-cc__info">
      <text class="page-cc__name">{{ name }}</text>
      <text class="page-cc__sub">{{ sub }}</text>
    </view>

    <!-- 双联系钮：150×36 白底描边 #C8C8C8 胶囊（实测），图标 + 14px 字 -->
    <view class="page-cc__btns">
      <view class="page-cc__btn pressable" @click="$emit('phone')">
        <AppIcon name="phone" :size="12" />
        <text>电话联系</text>
      </view>
      <view class="page-cc__btn pressable" @click="$emit('wechat')">
        <AppIcon name="wechat-sm" :size="14" />
        <text>微信沟通</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * AppContactCard — 客户联系卡（D14 退款申请 / D15 改期申请共用，画板 Rectangle 152 实测）
 *
 * 稿值：白卡 341×122 pad16；头像 40 黑圆 #171819 + 姓氏首字 15 白；
 *   姓名 15 Bold、副行 12 #666（如「138****2874 · 已确认收款」）；
 *   双钮 150×36 白底描边 #C8C8C8 r999（胶囊推导：Rectangle 未标圆角，按 h36 半圆推导）+ 字 14 #333。
 * 点击事件只做拨号/复制微信占位（H5 环境 uni.makePhoneCall 可用，小程序端真机验证）。
 */
export default {
  name: 'AppContactCard',
  props: {
    /** 客户名（orders.customer_name） */
    name: { type: String, default: '' },
    /** 副行：手机号 + 状态说明 */
    sub: { type: String, default: '' },
  },
  emits: ['phone', 'wechat'],
  computed: {
    /** 姓氏首字（取第一个字符做头像文字，与稿「陈」一致） */
    avatarText() {
      return this.name ? this.name.charAt(0) : ''
    },
  },
}
</script>

<style lang="scss" scoped>
.page-cc {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 22rpx;
  margin: 0 $page-pad;
  padding: 32rpx;
  background-color: $white;
  border-radius: $radius-card; /* 推导：同体系 r16 */

  &__avatar {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #171819; /* 实测 */
    border-radius: 50%;
    text { color: $white; font-size: 30rpx; font-weight: 700; }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }
  &__name { color: $text-1; font-size: 30rpx; font-weight: 700; line-height: 30rpx; }
  &__sub { color: #666666; font-size: 24rpx; line-height: 24rpx; }

  /* 双钮占满整行（稿：位于卡片第二行 y728，非与头像同排） */
  &__btns {
    flex-basis: 100%;
    display: flex;
    justify-content: space-between;
  }
  &__btn {
    width: 300rpx;   /* 实测 150 */
    height: 72rpx;   /* 实测 36 */
    box-sizing: border-box; /* 稿 36 含描边，content-box 会撑到 38 */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    background-color: $white;
    border: 1rpx solid #C8C8C8; /* 实测 */
    border-radius: 999rpx;
    text { color: #333333; font-size: 28rpx; line-height: 40rpx; }
  }
}
</style>
