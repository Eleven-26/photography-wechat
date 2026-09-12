<template>
  <view class="page-pv page-wrap page-pv--dark">
    <view class="status-bar" />
    <!-- Hero：360 高图区（稿 studio-space 实拍图 HARD_LIGHT，H5 演示深色渐变替代，联调换图） -->
    <view class="page-pv__hero">
      <view class="page-pv__nav">
        <view class="page-pv__nav-btn pressable" @click="goBack"><view class="page-pv__nav-arrow" /></view>
        <view class="page-pv__nav-btn pressable" @click="share"><AppIcon name="me-share" :size="18" /></view>
      </view>
      <view class="page-pv__hero-main">
        <text class="page-pv__hero-title">路先生摄影</text>
        <text class="page-pv__hero-sub">专注亲子 / 家庭 · 用光影记录值得珍藏的瞬间</text>
        <view class="page-pv__hero-meta">
          <view class="page-pv__meta-item">
            <AppIcon name="pv-star" :size="14" />
            <text>4.9</text>
          </view>
          <text class="page-pv__meta-item">326次服务</text>
          <text class="page-pv__meta-item">8年经验</text>
        </view>
      </view>
    </view>

    <!-- 数据条 #1D1E22 r16 stroke #2B2C30 三列 -->
    <view class="page-pv__stats">
      <view class="page-pv__stat">
        <text class="page-pv__stat-num">100+</text>
        <text class="page-pv__stat-label">原创作品</text>
      </view>
      <view class="page-pv__divider" />
      <view class="page-pv__stat">
        <text class="page-pv__stat-num">326</text>
        <text class="page-pv__stat-label">服务客户</text>
      </view>
      <view class="page-pv__divider" />
      <view class="page-pv__stat">
        <text class="page-pv__stat-num">98%</text>
        <text class="page-pv__stat-label">好评率</text>
      </view>
    </view>

    <!-- 精选服务（y442 标题 + y493 横滑卡 200x215） -->
    <view class="page-pv__sec">精选服务</view>
    <scroll-view scroll-x class="page-pv__svc-scroll" :show-scrollbar="false">
      <view class="page-pv__svc-row">
        <view v-for="s in services" :key="s.name" class="page-pv__svc">
          <view class="page-pv__svc-img" :style="{ background: s.bg }" />
          <view class="page-pv__svc-body">
            <text class="page-pv__svc-name">{{ s.name }}</text>
            <text class="page-pv__svc-spec">{{ s.spec }}</text>
            <text class="page-pv__svc-price">{{ s.price }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 精选作品（y708 标题 + 双列 165x220） -->
    <view class="page-pv__sec-row">
      <text class="page-pv__sec">精选作品</text>
      <text class="page-pv__more">查看全部 ›</text>
    </view>
    <view class="page-pv__works">
      <view v-for="(w, i) in works" :key="i" class="page-pv__work" :style="{ background: w }">
        <view class="page-pv__work-fav"><AppIcon name="pv-fav" :size="13" /></view>
      </view>
    </view>

    <!-- 服务流程（y1443 标题 + y1492 流程卡 4+3 两行） -->
    <view class="page-pv__sec">服务流程</view>
    <view class="page-pv__flow">
      <view class="page-pv__flow-row">
        <template v-for="(st, i) in flowRow1" :key="st.label">
          <view class="page-pv__flow-step">
            <AppIcon :name="st.icon" :size="22" />
            <text>{{ st.label }}</text>
          </view>
          <AppIcon v-if="i < flowRow1.length - 1" name="chevron-right-gray" :size="14" />
        </template>
      </view>
      <view class="page-pv__flow-row">
        <template v-for="(st, i) in flowRow2" :key="st.label">
          <view class="page-pv__flow-step">
            <AppIcon :name="st.icon" :size="22" />
            <text>{{ st.label }}</text>
          </view>
          <AppIcon v-if="i < flowRow2.length - 1" name="chevron-right-gray" :size="14" />
        </template>
      </view>
    </view>

    <!-- 常见问题（y1642 标题 + y1693 三组 QA） -->
    <view class="page-pv__sec">常见问题</view>
    <view class="page-pv__faq">
      <view v-for="(q, i) in faqs" :key="i" class="page-pv__qa" :class="{ 'page-pv__qa--line': i > 0 }">
        <text class="page-pv__q">{{ q.q }}</text>
        <text class="page-pv__a">{{ q.a }}</text>
      </view>
    </view>

    <!-- 底栏：毛玻璃 + 白胶囊「定制需求」56 高（y1919） -->
    <view class="page-pv__foot">
      <view class="page-pv__foot-btn pressable" @click="custom"><text>定制需求</text></view>
    </view>
    <view class="page-pv__safe" />
  </view>
</template>

<script>
/**
 * ME03b 客户视角预览（稿 11:623 实测 1:1）——客户端暗色沉浸样式
 * Hero 360（实拍图→渐变替代，联调换图）→ 数据条 → 精选服务横滑 → 精选作品双列 → 服务流程 4+3 → 常见问题 → 白胶囊「定制需求」底栏。
 */
export default {
  name: 'MePreview',
  data() {
    return {
      services: [
        { name: '家庭纪念写真', spec: '2.5h · 20张精修', price: '¥2,680', bg: 'linear-gradient(135deg, #3A3D44 0%, #22252A 100%)' },
        { name: '个人写真', spec: '1.5h · 20张精修', price: '¥1,580', bg: 'linear-gradient(135deg, #42454C 0%, #26282D 100%)' },
      ],
      works: ['#2A2C31', '#34363B', '#2E3035', '#383A3F', '#2A2C31', '#313338'],
      flowRow1: [
        { icon: 'pv-step1', label: '浏览作品' },
        { icon: 'pv-step2', label: '选择套餐' },
        { icon: 'pv-step3', label: '预约档期' },
        { icon: 'pv-step4', label: '拍摄' },
      ],
      flowRow2: [
        { icon: 'pv-step5', label: '在线选片' },
        { icon: 'pv-step6', label: '精修交付' },
        { icon: 'pv-step7', label: '下载成片' },
      ],
      faqs: [
        { q: '拍摄需要提前多久预约？', a: '建议提前3-5天预约，周末档期较紧张，建议尽早预约。' },
        { q: '如果下雨怎么办？', a: '72 小时外免费改期；72 小时内需支付 20% 调度费。' },
        { q: '照片多久能拿到？', a: '拍摄后7个工作日内完成精修并交付，高清下载有效期30天。' },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    share() {
      uni.showToast({ title: '分享（演示）', icon: 'none' })
    },
    custom() {
      uni.showToast({ title: '定制需求（演示）', icon: 'none' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-pv--dark {
  background-color: #17181C;
}

.page-pv {
  &__hero {
    position: relative;
    box-sizing: border-box;
    height: 720rpx;
    /* 稿：hero 沉浸，从状态栏后 @1 起 360 高 */
    /* #ifdef H5 */
    margin-top: -44px;
    /* #endif */
    /* #ifdef MP-WEIXIN */
    margin-top: calc(-1 * var(--status-bar-height));
    /* #endif */
    background:
      linear-gradient(180deg, rgba(23, 24, 28, 0.1) 0%, rgba(23, 24, 28, 0.55) 55%, #17181C 100%),
      linear-gradient(135deg, #3A3D44 0%, #22252A 60%, #1A1B1F 100%);
  }
  &__nav {
    position: absolute;
    top: var(--status-bar-height, 44px); /* 稿 11:626 钮 y44 起（状态栏之下）；hero 已被负 margin 吸顶，须下移状态栏高避开系统状态区 */
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx;
    height: 88rpx;
  }
  &__nav-btn {
    box-sizing: border-box;
    width: 72rpx;
    height: 72rpx;
    border-radius: 24rpx;
    background-color: rgba(23, 24, 28, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__nav-arrow {
    box-sizing: border-box;
    width: 24rpx;
    height: 24rpx;
    border-left: 4rpx solid #FFFFFF;
    border-bottom: 4rpx solid #FFFFFF;
    transform: rotate(45deg);
    margin-left: 8rpx;
  }
  &__hero-main {
    position: absolute;
    left: 40rpx;
    right: 40rpx;
    bottom: 60rpx;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }
  &__hero-title { font-size: 64rpx; font-weight: 700; color: #FFFFFF; line-height: 1.2; }
  &__hero-sub { font-size: 28rpx; color: #FFFFFF; }
  &__hero-meta { display: flex; align-items: center; gap: 32rpx; margin-top: 6rpx; }
  &__meta-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #FFFFFF;
    flex-shrink: 0;
  }

  &__stats {
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    margin: 0 32rpx; /* 同族口径：内容卡左缘 16px（原 30rpx 少 1px） */
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 32rpx;
    padding: 22rpx 0; /* 稿：stats 高 ~66 */
  }
  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }
  &__stat-num { font-size: 40rpx; font-weight: 700; color: #F7F8F8; }
  &__stat-label { font-size: 24rpx; color: #85878D; }
  &__divider { width: 1rpx; background-color: #2B2C30; }

  &__sec {
    margin: 40rpx 36rpx 0; /* 稿：stats 底 → 精选服务 442 */
    font-size: 28rpx;
    font-weight: 500;
    color: #B8BABF;
  }
  &__sec-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 48rpx 36rpx 0;
  }
  &__more { font-size: 24rpx; color: #85878D; }

  &__svc-scroll { white-space: nowrap; margin-top: 20rpx; }
  &__svc-row { display: inline-flex; gap: 32rpx; padding: 0 32rpx; }
  &__svc {
    display: inline-flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 400rpx;
    height: 430rpx;
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 24rpx;
    overflow: hidden;
    flex-shrink: 0;
  }
  &__svc-img { height: 240rpx; width: 100%; }
  &__svc-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    box-sizing: border-box;
    padding: 20rpx 24rpx 24rpx;
  }
  &__svc-name { font-size: 28rpx; color: #F7F8F8; }
  &__svc-spec { font-size: 24rpx; color: #85878D; }
  &__svc-price { margin-top: auto; font-size: 36rpx; font-weight: 700; color: #F7F8F8; }

  &__works {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    margin: 20rpx 32rpx 0;
  }
  &__work {
    box-sizing: border-box;
    position: relative;
    width: 330rpx;
    height: 440rpx;
    border-radius: 16rpx;
    overflow: hidden;
  }
  &__work-fav {
    position: absolute;
    left: 24rpx;
    bottom: 24rpx;
    box-sizing: border-box;
    width: 48rpx;
    height: 48rpx;
    border-radius: 24rpx;
    background-color: #17181C;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__flow {
    margin: 20rpx 32rpx 0;
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 24rpx;
    box-sizing: border-box;
    padding: 28rpx 24rpx;
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }
  &__flow-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  &__flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    width: 120rpx;
    text {
      font-size: 22rpx;
      color: #85878D;
      white-space: nowrap;
    }
  }

  &__faq {
    margin: 92rpx 32rpx 0; /* 稿：flow 底 → faq 卡 1693 */
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 24rpx;
    box-sizing: border-box;
    padding: 8rpx 32rpx;
  }
  &__qa {
    padding: 24rpx 0;
    &--line { border-top: 1rpx solid rgba(255, 255, 255, 0.06); }
  }
  &__q { display: block; font-size: 28rpx; color: #F7F8F8; }
  &__a { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 34rpx; color: #85878D; }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    box-sizing: border-box;
    background-color: rgba(23, 24, 28, 0.92);
    border-top: 1rpx solid #2B2C30;
    padding: 16rpx 32rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  }
  &__foot-btn {
    box-sizing: border-box;
    height: 112rpx;
    border-radius: 999rpx;
    background-color: #F7F8F8;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 32rpx; font-weight: 500; color: #17181C; }
  }
  &__safe { height: 180rpx; }
}
</style>
