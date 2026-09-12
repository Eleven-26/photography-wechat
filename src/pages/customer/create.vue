<template>
  <view class="page-cc page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「添加客户」（CU03 30:150 实测） -->
    <view class="page-cc__header">
      <view class="page-cc__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-cc__title">添加客户</text>
    </view>

    <!-- 姓名*（* 号红色 #FC2F2F 稿图采样） -->
    <text class="page-cc__label page-cc__label--first">姓名<text class="page-cc__req">*</text></text>
    <input class="page-cc__input" v-model="form.name" placeholder="客户姓名" placeholder-class="page-cc__ph" />

    <!-- 联系电话* -->
    <text class="page-cc__label">联系电话<text class="page-cc__req">*</text></text>
    <input class="page-cc__input" v-model="form.phone" type="number" maxlength="11" placeholder="用于订单与拍摄提醒" placeholder-class="page-cc__ph" />

    <!-- 来源（选填）chips -->
    <text class="page-cc__label">来源（选填）</text>
    <view class="page-cc__chips">
      <view
        v-for="s in sources"
        :key="s"
        class="page-cc__chip"
        :class="{ 'page-cc__chip--on': form.source === s }"
        @click="form.source = form.source === s ? '' : s"
      >{{ s }}</view>
    </view>

    <!-- 确认添加：稿 32:1，343x52 @(16,430) 黑胶囊 r999 -->
    <button class="page-cc__submit pressable" @click="save">确认添加</button>

    <!-- 稿内含底部导航（客户 tab 激活），30:207 实例 -->
    <AppTabBar active="customer" />
  </view>
</template>

<script>
export default {
  name: 'CustomerCreate',
  data() {
    return {
      sources: ['朋友介绍', '小红书', '抖音', '老客户转介绍', '其他'],
      form: { name: '', phone: '', source: '' },
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({ url: '/pages/customer/list' })
      }
    },
    save() {
      // 必填校验：错误仅提示，不清空已填内容
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请填写客户姓名', icon: 'none' })
        return
      }
      if (!this.form.phone.trim()) {
        uni.showToast({ title: '请填写联系电话', icon: 'none' })
        return
      }
      // 演示态：联调时替换为创建客户接口（api/customer）
      uni.showToast({ title: '已添加（演示）', icon: 'success' })
      setTimeout(() => this.goBack(), 600)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-cc {
  min-height: 100vh;
  &__header {
    position: relative;
    height: 120rpx; /* 60px 容器，稿 @(0,44) 高 60 */
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
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055); /* 稿 y5 blur16 5.5% */
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
  /* 稿：header 底(104) 到首标签(120) 16px；输入框底到下个标签 20px */
  &__label {
    display: block;
    margin: 40rpx 40rpx 0;
    font-size: 24rpx;
    line-height: 24rpx;
    font-weight: 500;
    color: #666666;
    &--first {
      margin-top: 32rpx;
    }
  }
  &__req {
    color: #fc2f2f; /* 稿图采样 */
  }
  /* 稿：343x48 白底 #EAEAEA 描边 r≈11（稿图采样），文字内缩 16 */
  &__input {
    margin: 20rpx 32rpx 0;
    box-sizing: border-box;
    width: calc(100% - 64rpx);
    height: 96rpx;
    padding: 0 32rpx;
    background-color: $white;
    border: 1rpx solid #eaeaea;
    border-radius: 16rpx; /* 稿 30:220 实测 cornerRadius 8px → 16rpx */
    font-size: 28rpx;
    color: #151617;
  }
  &__ph {
    color: #666666;
    font-weight: 500;
  }
  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    /* 稿：左 15px，右仅 10px——老客户转介绍须留在首行（右缘 x354） */
    margin: 20rpx 20rpx 0 30rpx;
  }
  &__chip {
    box-sizing: border-box;
    /* 稿总高 32 含上下 border：1+6+17(行高)+7+1 */
    padding: 12rpx 32rpx 14rpx;
    border-radius: 999rpx;
    background-color: #f7f8fa;
    border: 1rpx solid #dbdbdb;
    font-size: 24rpx;
    line-height: 34rpx;
    font-weight: 700;
    color: #333333;
    &--on {
      background-color: #17181a;
      border-color: #17181a;
      color: $white;
    }
  }
  &__submit {
    margin: 68rpx 32rpx 0; /* 稿 @(16,430)，chips 底到钮顶 34px */
    width: calc(100% - 64rpx);
    height: 104rpx; /* 52px */
    box-sizing: border-box;
    border-radius: 999rpx;
    background-color: #17181a;
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 104rpx;
    padding: 0;
    /* 重置 uni button 默认样式 */
    &::after { border: none; }
  }
}
</style>
