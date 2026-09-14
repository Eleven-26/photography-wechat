<template>
  <view class="page-quote page-wrap has-footer">
    <view class="status-bar" />
    <!-- Header：返回 + 「编辑报价」（1:7886 实测） -->
    <view class="page-quote__header">
      <view class="page-quote__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-quote__title">编辑报价</text>
    </view>

    <!-- 黑卡：V1 + 标题 + 总价 + 修改总价 + 预算提示（1:17 Group 69 实测 343×160） -->
    <view class="page-quote__hero">
      <view class="page-quote__hero-top">
        <text class="page-quote__hero-title">家庭纪念 · 周末户外定制</text>
        <view class="page-quote__ver"><text>V1</text></view>
      </view>
      <view class="page-quote__hero-price-row">
        <text class="page-quote__hero-price">¥2,680</text>
        <view class="page-quote__edit-price pressable" @click="editPrice"><text>修改总价</text></view>
      </view>
      <view class="page-quote__budget">
        <view class="page-quote__budget-check"><AppIcon name="check-sm" :size="10" /></view>
        <text>在客户预算范围内（¥2,000-3,000）</text>
      </view>
    </view>

    <!-- AI 预填提示条（1:32 实测 343×66 白底） -->
    <view class="page-quote__ai-tip">
      <view class="page-quote__ai-icon"><AppIcon name="star" :size="16" /></view>
      <view class="page-quote__ai-main">
        <text class="page-quote__ai-t1">AI 已按客户简报预填以下报价</text>
        <text class="page-quote__ai-t2">黄色标记项来自已确认信息，点开任意一行即可调整</text>
      </view>
    </view>

    <!-- 基础套餐卡（可展开，1:77/1:7990 实测展开态 343×213） -->
    <view class="page-quote__card">
      <view class="page-quote__row pressable" @click="toggle('pkg')">
        <view class="page-quote__row-icon"><AppIcon name="pkg-gray" :size="16" /></view>
        <view class="page-quote__row-main">
          <view class="page-quote__row-head">
            <text class="page-quote__row-title">基础套餐</text>
            <view class="page-quote__chip page-quote__chip--blue"><text>来自套餐库</text></view>
          </view>
          <text class="page-quote__row-sub">按"家庭纪念·2大1小"从 2 个套餐中匹配</text>
        </view>
        <text class="page-quote__row-val">¥2,680</text>
        <view class="page-quote__arrow" :class="{ 'page-quote__arrow--open': open.pkg }" />
      </view>
      <view v-if="open.pkg" class="page-quote__expand">
        <view class="page-quote__pkg-chips">
          <view class="page-quote__pkg page-quote__pkg--on">
            <text class="page-quote__pkg-name">基础套餐</text>
            <text class="page-quote__pkg-sub">￥2,680 引用12次</text>
          </view>
          <view class="page-quote__pkg pressable" @click="pickPkg('lux')">
            <text class="page-quote__pkg-name">家庭轻奢</text>
            <text class="page-quote__pkg-sub">￥3,880 引用五次</text>
          </view>
        </view>
        <view class="page-quote__custom pressable" @click="customPkg">
          <view class="page-quote__custom-plus" />
          <text>库里没有合适的，自定义填价</text>
        </view>
      </view>
    </view>

    <!-- 拍摄时长卡（可展开，1:27/1:7927 实测展开态 343×155） -->
    <view class="page-quote__card">
      <view class="page-quote__row pressable" @click="toggle('hours')">
        <view class="page-quote__row-icon"><AppIcon name="clock-gray-md" :size="16" /></view>
        <view class="page-quote__row-main">
          <view class="page-quote__row-head">
            <text class="page-quote__row-title">拍摄时长</text>
            <view class="page-quote__chip page-quote__chip--green"><text>AI 预填</text></view>
          </view>
          <text class="page-quote__row-sub">套餐含 20 张 · 超出按 ¥60/张</text>
        </view>
        <text class="page-quote__row-val page-quote__row-val--md">2.5 <text class="page-quote__unit">小时</text></text>
        <view class="page-quote__arrow" :class="{ 'page-quote__arrow--open': open.hours }" />
      </view>
      <view v-if="open.hours" class="page-quote__expand">
        <view class="page-quote__stepper">
          <view class="page-quote__step-btn pressable" @click="stepHours(-1)"><text>−</text></view>
          <text class="page-quote__step-val">{{ hours }} <text class="page-quote__unit">小时</text></text>
          <view class="page-quote__step-btn pressable" @click="stepHours(1)"><text>+</text></view>
        </view>
        <text class="page-quote__expand-note">当前 2.5 小时为基础套餐含时，不产生加时费</text>
      </view>
    </view>

    <!-- 拍摄地点/场地费卡（可展开，1:51/1:7951 实测展开态 343×243） -->
    <view class="page-quote__card">
      <view class="page-quote__row pressable" @click="toggle('place')">
        <view class="page-quote__row-icon"><AppIcon name="pin-gray-md" :size="16" /></view>
        <view class="page-quote__row-main">
          <view class="page-quote__row-head">
            <text class="page-quote__row-title">拍摄地点/场地费</text>
            <view class="page-quote__chip page-quote__chip--green"><text>AI 提取</text></view>
          </view>
          <text class="page-quote__row-sub">客户消息中提到"越秀公园"</text>
        </view>
        <text class="page-quote__row-val page-quote__row-val--md">越秀公园</text>
        <view class="page-quote__arrow" :class="{ 'page-quote__arrow--open': open.place }" />
      </view>
      <view v-if="open.place" class="page-quote__expand">
        <view class="page-quote__place-chips">
          <view class="page-quote__place page-quote__place--on" @click="placeMode = 'out'">
            <text class="page-quote__pkg-name">外拍</text>
            <text class="page-quote__pkg-sub">场地费 0 元</text>
          </view>
          <view class="page-quote__place pressable" @click="placeMode = 'studio'">
            <text class="page-quote__pkg-name">合作影棚</text>
            <text class="page-quote__pkg-sub">场地费 200 元</text>
          </view>
        </view>
        <text class="page-quote__addr-label">拍摄地址</text>
        <view class="page-quote__addr">
          <text class="page-quote__addr-tag">AI提取</text>
          <view class="page-quote__addr-line" />
          <text class="page-quote__addr-val">越秀公园</text>
          <AppIcon name="edit-gray" :size="16" />
        </view>
      </view>
    </view>

    <!-- 添加可加项目卡（可展开，1:74/1:8003 实测展开态 343×171） -->
    <view class="page-quote__card">
      <view class="page-quote__row pressable" @click="toggle('addon')">
        <view class="page-quote__row-icon"><AppIcon name="plus-gray-md" :size="16" /></view>
        <view class="page-quote__row-main">
          <view class="page-quote__row-head">
            <text class="page-quote__row-title">添加可加项目</text>
          </view>
          <text class="page-quote__row-sub">勾选即计入报价</text>
        </view>
        <text class="page-quote__row-val page-quote__row-val--md page-quote__row-val--bold">妆造</text>
        <view class="page-quote__arrow" :class="{ 'page-quote__arrow--open': open.addon }" />
      </view>
      <view v-if="open.addon" class="page-quote__expand page-quote__expand--addons">
        <view
          v-for="a in addons"
          :key="a.name"
          class="page-quote__addon"
          @click="a.on = !a.on"
        >
          <view class="page-quote__addon-check" :class="{ 'page-quote__addon-check--on': a.on }">
            <AppIcon v-if="a.on" name="check-sm" :size="12" />
          </view>
          <text class="page-quote__addon-name">{{ a.name }}</text>
          <text class="page-quote__addon-price">{{ a.price }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮：保存草稿 + 发送报价（1:96 实测） -->
    <view class="glass-footer">
      <view class="page-quote__foot-btns">
        <view class="page-quote__btn-ghost pressable" @click="saveDraft">
          <text>保存草稿</text>
        </view>
        <view class="page-quote__btn-dark pressable" @click="sendQuote">
          <text>发送报价</text>
        </view>
      </view>
    </view>
    <view class="page-quote__safe" />
  </view>
</template>

<script>
/**
 * L05 编辑报价（稿 L05-1 收起态 1:7813 / L05-2 展开态 1:7903，本页为可展开完整版）
 * 黑卡（V1/总价/修改/预算绿提示）→ AI 预填提示 → 基础套餐/拍摄时长/拍摄地点/可加项目四张可展开卡 → 底栏双钮。
 * 徽章色实测：AI 预填/提取 #E5F6ED/#20855C、来自套餐库 #DBEAFE/#2D69EC；预算提示绿 #83DDA2（黑卡内）。
 * 稿内「装造」按 L03/L04 口径统一为「妆造」（联调评审核对）；勾选即计入报价对应加选差价自动并入尾款口径。
 */
import { formatAmount } from '@/utils/format'

export default {
  name: 'QuoteCreate',
  data() {
    return {
      open: { pkg: false, hours: false, place: false, addon: false }, /* 稿 L05-1 默认全收起，点击行展开（L05-2） */
      hours: 2.5,
      placeMode: 'out',
      addons: [
        { name: '妆造服务（客户尚未确认）', price: '+¥200', on: true },
        { name: '加急交付 7天→3天', price: '+¥100', on: false },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/lead/detail' }) })
    },
    toggle(k) {
      this.open[k] = !this.open[k]
    },
    pickPkg() {
      uni.showToast({ title: '切换套餐（演示）', icon: 'none' })
    },
    customPkg() {
      uni.showToast({ title: '自定义填价（演示）', icon: 'none' })
    },
    stepHours(d) {
      const v = Math.round((this.hours + d * 0.5) * 10) / 10
      if (v < 1 || v > 12) return
      this.hours = v
    },
    editPrice() {
      uni.showToast({ title: '修改总价（演示）', icon: 'none' })
    },
    saveDraft() {
      uni.showToast({ title: '草稿已保存（演示）', icon: 'none' })
    },
    sendQuote() {
      uni.showToast({ title: `报价已发送（${formatAmount(2680)} 起，演示）`, icon: 'none' })
      setTimeout(() => uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/lead/list' }) }), 900)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-quote {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 32rpx;
  }
  &__back {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.88);
    border: 1rpx solid rgba(21, 22, 24, 0.05);
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
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

  &__hero {
    margin: 20rpx 32rpx 0;
    background-color: #17181A;
    border-radius: 32rpx; /* 稿 Rectangle109 cornerRadius 16px=32rpx */
    padding: 32rpx 32rpx 36rpx; /* 稿：黑卡 160 高（114-274） */
  }
  &__hero-top {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__hero-title {
    font-size: 36rpx;
    font-weight: 500;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__ver {
    margin-left: auto;
    background-color: #333333;
    border-radius: 999rpx;
    padding: 6rpx 18rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; font-weight: 500; color: #FFDA08; }
  }
  &__hero-price-row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-top: 24rpx;
  }
  &__hero-price {
    font-size: 64rpx;
    line-height: 64rpx;
    font-weight: 700;
    color: #FFFFFF;
    font-family: $font-family-num;
  }
  &__edit-price {
    background-color: #2C2E36;
    border: 1rpx solid #393B41;
    border-radius: 8rpx;
    padding: 14rpx 26rpx;
    text { font-size: 28rpx; color: #FFFFFF; }
  }
  &__budget {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background-color: #2C2E36;
    border-radius: 12rpx;
    padding: 12rpx 24rpx;
    margin-top: 24rpx;
    text { font-size: 28rpx; font-weight: 500; color: #83DDA2; }
  }
  &__budget-check {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background-color: #83DDA2;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__ai-tip {
    display: flex;
    align-items: center;
    gap: 20rpx; /* 稿：副标单行放下（可用宽 260） */
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx; /* 稿 Rectangle112 cornerRadius 16px */
    padding: 30rpx 32rpx; /* 稿：条高 66（284-350） */
  }
  &__ai-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 12rpx;
    background-color: #E5F6ED;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__ai-t1 { display: block; font-size: 30rpx; line-height: 34rpx; font-weight: 500; color: #333333; white-space: nowrap; }
  &__ai-t2 { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 30rpx; font-weight: 500; color: #999999; white-space: nowrap; /* 稿：条高 66 = 15×2 + 17+4+15 */ }

  &__card {
    margin: 40rpx 32rpx 0; /* 稿：首行 @370（提示条底 350 + 20） */
    background-color: $white;
    border-radius: 32rpx; /* 稿 Rectangle114/130 cornerRadius 16px */
  }
  .page-quote__card + .page-quote__card { margin-top: 20rpx; } /* 稿：行距 10 */
  &__row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 32rpx 32rpx; /* 稿收起态行卡 343×68px：内容(icon 72rpx=36px)+上下 16px 内距=68px → 垂直 32rpx（原 20rpx≈56px 偏小） */
  }
  &__row-icon {
    width: 72rpx;
    height: 72rpx;
    border-radius: 12rpx;
    background-color: #F3F4F5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  &__row-title {
    font-size: 30rpx;
    font-weight: 500;
    color: #333333;
    width: max-content;
    flex-shrink: 0;
  }
  &__row-sub {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    font-weight: 500;
    color: #999999;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__row-val {
    font-size: 30rpx;
    font-weight: 700;
    color: #333333;
    flex-shrink: 0;
    font-family: $font-family-num;
    &--md { font-weight: 500; }
    &--bold { font-weight: 700; }
  }
  &__unit { font-size: 22rpx; font-weight: 500; color: #999999; }
  &__chip {
    border-radius: 4rpx;
    padding: 4rpx 12rpx 6rpx;
    flex-shrink: 0;
    text { font-size: 20rpx; font-weight: 500; }
    &--green { background-color: #E5F6ED; text { color: #20855C; } }
    &--blue { background-color: #DBEAFE; text { color: #2D69EC; } }
  }
  &__arrow {
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background-color: #D9D9D9;
    flex-shrink: 0;
    position: relative;
    transition: transform 0.15s ease;
    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 12rpx;
      height: 12rpx;
      border-right: 3rpx solid #666666;
      border-bottom: 3rpx solid #666666;
      transform: translate(-60%, -65%) rotate(45deg);
    }
    &--open { transform: rotate(90deg); }
  }

  &__expand {
    border-top: 1rpx solid #EFEFEF;
    padding: 24rpx 32rpx 32rpx;
    &--addons { padding-top: 8rpx; }
  }
  &__pkg-chips {
    display: flex;
    gap: 22rpx;
  }
  &__pkg {
    flex: 1;
    box-sizing: border-box;
    border: 1rpx solid #E6E6E6;
    border-radius: 12rpx;
    padding: 20rpx 22rpx;
    &--on { border: 2rpx solid #F0AC00; }
  }
  &__pkg-name { display: block; font-size: 28rpx; font-weight: 500; color: #333333; }
  &__pkg-sub { display: block; margin-top: 10rpx; font-size: 24rpx; font-weight: 500; color: #999999; }
  &__custom {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    margin-top: 32rpx; /* 稿 Rectangle129 y527 = 选项卡底 511 + 16px */
    border: 1rpx solid #E6E6E6;
    border-radius: 12rpx;
    padding: 20rpx 0;
    text { font-size: 28rpx; font-weight: 500; color: #333333; }
  }
  &__custom-plus {
    position: relative;
    width: 24rpx;
    height: 24rpx;
    &::before, &::after {
      content: '';
      position: absolute;
      background-color: #666666;
    }
    &::before { left: 0; top: 11rpx; width: 24rpx; height: 4rpx; }
    &::after { left: 10rpx; top: 0; width: 4rpx; height: 24rpx; }
  }

  &__stepper {
    display: flex;
    align-items: center;
    gap: 36rpx;
  }
  &__step-btn {
    box-sizing: border-box;
    width: 64rpx;
    height: 64rpx;
    background-color: #F2F3F5;
    border: 1rpx solid #E6E6E6;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 32rpx; font-weight: 500; color: #666666; }
  }
  &__step-val {
    font-size: 30rpx;
    font-weight: 700;
    color: #333333;
    font-family: $font-family-num;
  }
  &__expand-note {
    display: block;
    margin-top: 28rpx;
    font-size: 24rpx;
    font-weight: 500;
    color: #999999;
  }

  &__place-chips {
    display: flex;
    gap: 22rpx;
  }
  &__place {
    flex: 1;
    box-sizing: border-box;
    border: 1rpx solid #E6E6E6;
    border-radius: 12rpx;
    padding: 20rpx 22rpx;
    &--on { border: 2rpx solid #F0AC00; }
  }
  &__addr-label { display: block; margin-bottom: 16rpx; font-size: 30rpx; font-weight: 500; color: #333333; }
  &__addr {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 24rpx;
    background-color: #F2F3F5;
    border-radius: 12rpx;
    padding: 22rpx 24rpx;
  }
  &__addr-tag { font-size: 24rpx; font-weight: 500; color: #999999; }
  &__addr-line { width: 1rpx; height: 20rpx; background-color: #CCCCCC; }
  &__addr-val { flex: 1; font-size: 28rpx; font-weight: 500; color: #333333; }

  &__addon {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 24rpx 0;
    border-top: 1rpx solid #EFEFEF;
    &:first-child { border-top: none; }
  }
  &__addon-check {
    box-sizing: border-box;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%; /* 稿 20×20 cornerRadius 20px 全圆（L05-2 1:8035/1:8037 实测） */
    border: 1rpx solid #B7B7B7;
    background-color: #F2F3F5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--on { background-color: #171717; border-color: #171717; }
  }
  &__addon-name { flex: 1; font-size: 28rpx; font-weight: 500; color: #333333; }
  &__addon-price { font-size: 28rpx; font-weight: 700; color: #333333; font-family: $font-family-num; }

  &__foot-btns {
    display: flex;
    gap: 20rpx;
    padding: 0; /* 横向 0：glass-footer 已含 32rpx 左右 padding（稿两钮距边 16px=32rpx） */
  }
  &__btn-ghost {
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #151617; }
  }
  &__btn-dark {
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #17181A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }

  &__safe { height: 40rpx; }
}
</style>
