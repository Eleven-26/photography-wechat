<template>
  <view class="page-ai page-wrap">
    <view class="status-bar" />
    <!-- Header：返回 + 「AI 简报」（1:7703 实测） -->
    <view class="page-ai__header">
      <view class="page-ai__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-ai__title">AI 简报</text>
    </view>

    <!-- 黑卡概览：标题+识别结果+9金3灰进度点+双钮（1:12 Group 57 实测 343×164） -->
    <view class="page-ai__hero">
      <view class="page-ai__hero-top">
        <text class="page-ai__hero-title">AI 已整理 简报</text>
        <view class="page-ai__hero-time"><text>2分钟前</text></view>
      </view>
      <text class="page-ai__hero-sub">从对话中识别 12 项关键信息 · 3 项待追问</text>
      <view class="page-ai__dots">
        <view v-for="i in 12" :key="i" class="page-ai__dot" :class="{ 'page-ai__dot--off': i > 9 }" />
      </view>
      <view class="page-ai__hero-btns">
        <view class="page-ai__hbtn page-ai__hbtn--gold pressable" @click="goAsk">
          <text>继续追问 3 项</text>
        </view>
        <view class="page-ai__hbtn page-ai__hbtn--gray pressable" @click="scrollConfirmed">
          <text>查看已确认 9 项</text>
        </view>
      </view>
    </view>

    <text class="page-ai__sec">待追问 · 按影响排序</text>

    <!-- 三张问题卡：序号+标题+影响徽章+说明+AI问题框+双钮（1:36 Group 61 实测 343×232） -->
    <view v-for="(q, idx) in questions" :key="q.title" class="page-ai__qcard">
      <view class="page-ai__qhead">
        <view class="page-ai__qnum"><text>{{ idx + 1 }}</text></view>
        <text class="page-ai__qtitle">{{ q.title }}</text>
        <view class="page-ai__qbadge" :class="q.impact === 'quote' ? 'page-ai__qbadge--quote' : 'page-ai__qbadge--sched'">
          <text>{{ q.impact === 'quote' ? '影响报价' : '影响排期' }}</text>
        </view>
      </view>
      <text class="page-ai__qdesc">{{ q.desc }}</text>
      <view class="page-ai__qbox">
        <view class="page-ai__qbox-head">
          <AppIcon name="star" :size="10" />
          <text class="page-ai__qbox-tag">AI 已生成问题</text>
        </view>
        <text class="page-ai__qbox-text">{{ q.question }}</text>
      </view>
      <view class="page-ai__qbtns">
        <view class="page-ai__qbtn page-ai__qbtn--ghost pressable" @click="editQuestion(idx)">
          <text>编辑问题</text>
        </view>
        <view class="page-ai__qbtn page-ai__qbtn--dark pressable" @click="sendOne(idx)">
          <text>发送给客户</text>
        </view>
      </view>
    </view>

    <!-- 已确认信息条（1:93 实测 343×50） -->
    <view id="confirmed" class="page-ai__confirmed pressable" @click="goDetail">
      <text class="page-ai__confirmed-title">已确认信息</text>
      <text class="page-ai__confirmed-count">9项</text>
      <view class="page-ai__arrow"><AppIcon name="chevron-right-gray" :size="16" /></view>
    </view>

    <!-- 安全绿框（1:99 实测 343×70 #DCFCE7） -->
    <view class="page-ai__safe-box">
      <view class="page-ai__safe-icon"><AppIcon name="shield-green" :size="20" /></view>
      <view class="page-ai__safe-main">
        <text class="page-ai__safe-title">未检测到高风险项</text>
        <text class="page-ai__safe-sub">预算与套餐价格匹配，需求描述清晰</text>
      </view>
    </view>

    <!-- 一键全部追问黑胶囊（1:104 实测 343×52） -->
    <view class="page-ai__all-btn pressable" @click="goAsk">
      <text>一键全部追问</text>
    </view>

    <AppTabBar active="order" />
    <view class="page-ai__safe" />
  </view>
</template>

<script>
/**
 * L03 AI 简报（稿 1:7703 实测 1:1）
 * 黑卡概览（12 点进度：9 金确认 / 3 灰待追问）→ 待追问三卡（编辑/单发）→ 已确认信息 → 安全绿框 → 一键全部追问。
 * 业务口径：无拒绝报价；追问通过客户端站点发给客户。
 * 稿内错字「产看已确认 9 项」按语义改「查看」（联调评审时与用户核对）。
 */
export default {
  name: 'LeadAiBrief',
  data() {
    return {
      questions: [
        { title: '具体日期', impact: 'quote', desc: '客户说"周末"但未指定哪天，档期锁定依赖此项', question: '您希望安排在哪个周末？8月还有 17-18、24-25 两档可选。' },
        { title: '儿童作息', impact: 'sched', desc: '5岁儿童午休时间影响当天拍摄时段安排', question: '孩子平时午休是几点到几点？我们会避开午睡时间安排拍摄。' },
        { title: '妆造需求', impact: 'quote', desc: '是否需要化妆造型服务，直接影响套餐加项', question: '需要为大人或孩子安排化妆造型吗？可单加也可含在套餐内。' },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/lead/detail' }) })
    },
    goAsk() {
      uni.navigateTo({ url: '/pages/lead/ask' })
    },
    goDetail() {
      uni.navigateBack({ fail: () => {} })
    },
    editQuestion() {
      uni.showToast({ title: '点击文本可编辑（演示）', icon: 'none' })
    },
    sendOne(i) {
      uni.showToast({ title: `「${this.questions[i].title}」已发送给客户（演示）`, icon: 'none' })
    },
    scrollConfirmed() {
      uni.pageScrollTo({ scrollTop: 99999, duration: 300 })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ai {
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
    background-color: #121212;
    border-radius: 40rpx;
    padding: 32rpx 32rpx 50rpx; /* 稿：黑卡 164 高（114-278） */
  }
  &__hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__hero-title { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  &__hero-time {
    background-color: #333333;
    border-radius: 999rpx;
    padding: 2rpx 14rpx 4rpx;
    text { font-size: 22rpx; font-weight: 500; color: #FFDA08; }
  }
  &__hero-sub {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: #666666;
  }
  &__dots {
    display: flex;
    gap: 8rpx; /* 稿 Group56 点 pitch 26px、点 22px ⇒ gap 4px=8rpx */
    margin-top: 24rpx;
  }
  &__dot {
    width: 44rpx;
    height: 8rpx;
    border-radius: 4rpx;
    background-color: #FFDA08;
    &--off { background-color: #333333; }
  }
  &__hero-btns {
    display: flex;
    gap: 20rpx;
    margin-top: 28rpx;
  }
  &__hbtn {
    flex: 1;
    height: 88rpx;
    border-radius: 20rpx; /* 稿 150×44 cornerRadius 10px=20rpx 圆角矩形（L03 1:7736/1:7738 实测） */
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; }
    &--gold { background-color: #FFDA08; text { color: #000000; } }
    &--gray { background-color: #333333; text { color: #FFFFFF; } }
  }

  &__sec {
    display: block;
    margin: 40rpx 36rpx 0; /* 稿：待追问标签 @298（黑卡底 278 + 20） */
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
  }

  &__qcard {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 40rpx; /* 稿 Rectangle100 cornerRadius 20px=40rpx */
    padding: 32rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__qhead {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__qnum {
    box-sizing: border-box;
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background-color: #FEF3C7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 30rpx; font-weight: 700; color: #B66E00; }
  }
  &__qtitle { font-size: 30rpx; font-weight: 700; color: #000000; }
  &__qbadge {
    border-radius: 8rpx;
    padding: 2rpx 10rpx 4rpx;
    text { font-size: 20rpx; font-weight: 500; }
    &--quote { background-color: #FEF3C7; text { color: #B66E00; } }
    &--sched { background-color: #DBEAFE; text { color: #2D69EC; } }
  }
  &__qdesc {
    display: block;
    margin-top: 8rpx;
    padding-left: 72rpx;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 34rpx;
    color: #666666;
  }
  &__qbox {
    margin: 20rpx 0 0 72rpx;
    background-color: #F2F3F5;
    border-radius: 16rpx;
    padding: 14rpx 22rpx 16rpx; /* 稿：卡 232 高、按钮 offset 168 */
  }
  &__qbox-head {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-left: -10rpx;
  }
  &__qbox-tag { font-size: 22rpx; font-weight: 500; color: #999999; }
  &__qbox-text {
    display: block;
    margin-top: 16rpx;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 42rpx;
    color: #333333;
  }
  &__qbtns {
    display: flex;
    gap: 26rpx;
    margin: 24rpx 0 0 72rpx; /* 稿：按钮 offset 168 */
  }
  &__qbtn {
    flex: 1;
    height: 88rpx;
    border-radius: 999rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; }
    &--ghost { background-color: $white; border: 1rpx solid #C8C8C8; text { color: #666666; } }
    &--dark { background-color: #121212; text { color: #FFFFFF; } }
  }

  &__confirmed {
    display: flex;
    align-items: center;
    margin: 40rpx 32rpx 0; /* 稿：距上张追问卡 20px（L03 Rectangle104 y1064 = Group63 底 1044 + 20） */
    background-color: $white;
    border-radius: 32rpx; /* 稿 Rectangle104 cornerRadius 16px */
    padding: 24rpx 32rpx;
  }
  &__confirmed-title { font-size: 30rpx; font-weight: 700; color: #151617; }
  &__confirmed-count { margin-left: auto; font-size: 24rpx; color: #666666; }
  &__arrow {
    margin-left: 12rpx;
    width: 32rpx;
    height: 32rpx;
    background-color: #D9D9D9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__safe-box {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin: 20rpx 32rpx 0;
    background-color: #DCFCE7;
    border-radius: 32rpx; /* 稿 Rectangle107 cornerRadius 16px=32rpx */
    padding: 22rpx 32rpx;
  }
  &__safe-icon {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__safe-title { display: block; font-size: 28rpx; font-weight: 500; color: #2F855A; }
  &__safe-sub { display: block; margin-top: 4rpx; font-size: 24rpx; color: #2FAF5E; }

  &__all-btn {
    margin: 40rpx 32rpx 40rpx; /* 稿 Button 1:7809 距绿框底 20px=40rpx */
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
