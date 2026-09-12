<template>
  <view class="page-scr page-wrap has-footer">
    <view class="status-bar" />
    <!-- Header：返回 + 「发起改期」（1:5536 实测） -->
    <view class="page-scr__header">
      <view class="page-scr__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-scr__title">发起改期</text>
    </view>

    <!-- 原档期卡（1:48 实测 343×78 r16） -->
    <view class="page-scr__orig">
      <text class="page-scr__orig-label">原档期 · 8/9 周日 09:00-12:00</text>
      <view class="page-scr__orig-mid">
        <text class="page-scr__orig-name">王浩 · 亲子写真</text>
        <text class="page-scr__orig-place">越秀公园 · 2.5h</text>
      </view>
    </view>

    <!-- 选新日期（1:44 实测：标题+左右滑动跨周 / 周条 8 格） -->
    <view class="page-scr__sec-row">
      <text class="page-scr__sec">选新日期</text>
      <text class="page-scr__sec-note">左右滑动跨周</text>
    </view>
    <scroll-view class="page-scr__weekbar" scroll-x :show-scrollbar="false">
      <view class="page-scr__weekbar-inner">
        <view
          v-for="d in weekDays"
          :key="d.n"
          class="page-scr__wday"
          :class="{ 'page-scr__wday--on': selDay === d.n, 'page-scr__wday--dim': d.dim }"
          @click="!d.dim && (selDay = d.n)"
        >
          <text class="page-scr__wday-head" :class="{ 'page-scr__wday-head--on': selDay === d.n }">{{ d.w }}</text>
          <text class="page-scr__wday-num" :class="{ 'page-scr__wday-num--on': selDay === d.n }">{{ d.label }}</text>
          <view class="page-scr__wdot" :style="{ backgroundColor: d.dot }" />
        </view>
      </view>
    </scroll-view>

    <!-- 选新时段（1:46/1:56 实测：红 chip 订单角标 / 绿可约 / 灰关闭；下方推荐条） -->
    <text class="page-scr__sec page-scr__sec--gap">选新时段</text>
    <view class="page-scr__slots">
      <view class="page-scr__slot page-scr__slot--off">
        <text>09:00-11:00</text>
        <view class="page-scr__slot-tag"><text>订单</text></view>
      </view>
      <view class="page-scr__slot page-scr__slot--ok" :class="{ 'page-scr__slot--sel': selSlot === '11:00-14:00' }" @click="selSlot = '11:00-14:00'">
        <text>11:00-14:00</text>
      </view>
      <view class="page-scr__slot page-scr__slot--ok" :class="{ 'page-scr__slot--sel': selSlot === '14:00-16:00' }" @click="selSlot = '14:00-16:00'">
        <text>14:00-16:00</text>
      </view>
      <view class="page-scr__slot page-scr__slot--plain"><text>16:00-18:00</text></view>
      <!-- 推荐灰条：稿内嵌于 slots 白卡底部（矩形207 343×162，灰条 319×48 四周留 12px） -->
      <view class="page-scr__hint">
        <AppIcon name="info-gray-sm" :size="13" />
        <text class="page-scr__hint-text">8/10 周一 14:00-16:00 空闲 · 与其他订单无冲突</text>
      </view>
    </view>

    <!-- 改期原因（1:74 实测：chips wrap，选中绿底） -->
    <text class="page-scr__sec page-scr__sec--gap">改期原因</text>
    <view class="page-scr__reasons">
      <view
        v-for="r in reasons"
        :key="r"
        class="page-scr__reason"
        :class="{ 'page-scr__reason--on': reason === r }"
        @click="reason = r"
      >
        <text>{{ r }}</text>
      </view>
    </view>

    <!-- 发送客户确认（1:83 实测 343×52 黑胶囊） -->
    <view class="page-scr__submit pressable" @click="submit">
      <text>发送客户确认</text>
    </view>
    <view class="page-scr__safe" />
  </view>
</template>

<script>
/**
 * SC04-2 发起改期（稿 1:5536 实测 1:1）
 * 原档期卡 → 选新日期周条（8 格可跨周）→ 选新时段（已占红 chip 订单角标不可选）→ 改期原因 chips → 发送客户确认。
 * 业务口径：改期 72h 外免费 / 72h 内 20% 调度费 / 24h 内不可改；客户确认制（非单方改）。
 */
export default {
  name: 'ScheduleReschedule',
  data() {
    return {
      selDay: 10,
      selSlot: '14:00-16:00',
      reason: '与客户协商',
      weekDays: [
        { w: '一', n: 7, label: '7', dot: '#D4D4D4', dim: true },
        { w: '二', n: 8, label: '今', dot: 'transparent', today: true },
        { w: '三', n: 9, label: '9', dot: '#76D596' },
        { w: '四', n: 10, label: '10', dot: '#FF8181' },
        { w: '五', n: 11, label: '11', dot: '#FFDA08' },
        { w: '六', n: 12, label: '12', dot: '#76D596' },
        { w: '日', n: 13, label: '13', dot: '#76D596' },
        { w: '一', n: 14, label: '14', dot: '#76D596' },
      ],
      reasons: ['时间冲突', '天气原因', '场地与场地问题', '与客户协商'],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/schedule/manage' }) })
    },
    submit() {
      if (!this.selSlot) return uni.showToast({ title: '请选择新时段', icon: 'none' })
      uni.showToast({ title: '改期申请已发送客户确认（演示）', icon: 'none' })
      setTimeout(() => uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/schedule/manage' }) }), 900)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-scr {
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

  &__orig {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 28rpx 34rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__orig-label { display: block; font-size: 24rpx; font-weight: 700; color: #666666; }
  &__orig-mid { display: flex; align-items: baseline; gap: 16rpx; margin-top: 14rpx; }
  &__orig-name { font-size: 30rpx; font-weight: 700; color: #171819; }
  &__orig-place { font-size: 24rpx; color: #666666; }

  &__sec-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin: 40rpx 36rpx 0;
  }
  &__sec {
    display: block;
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
    &--gap { margin: 48rpx 36rpx 0; } /* 稿：选新时段 @328、改期原因 @540（上段底 + 24） */
  }
  &__sec-note { font-size: 24rpx; font-weight: 500; color: #999999; }

  &__weekbar {
    margin: 20rpx 0 0 32rpx; /* 稿 380 宽 @(16,242) → 横向滑动，右侧出血 */
    white-space: nowrap;
    &::-webkit-scrollbar { display: none; }
  }
  &__weekbar-inner {
    display: inline-flex;
    gap: 8rpx;
  }
  &__wday {
    flex: none;
    width: 88rpx;
    box-sizing: border-box;
    background-color: $white;
    border-radius: 12rpx;
    padding: 10rpx 0 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    &--on { background-color: #121212; }
    &--dim { opacity: 0.5; }
  }
  &__wday-head { font-size: 22rpx; font-weight: 500; color: #999999; }
  &__wday--on .page-scr__wday-head { color: #CCCCCC; }
  &__wday-num {
    font-size: 28rpx;
    font-weight: 700;
    color: #151617;
    font-family: $font-family-num;
    &--on { color: #FFFFFF; }
  }
  &__wdot { width: 12rpx; height: 12rpx; border-radius: 50%; margin-top: 6rpx; }

  &__slots {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 16rpx;
    padding: 32rpx 24rpx 0; /* 稿：白卡底部由内嵌灰条收尾，底部留白交给 .__hint margin-bottom */
  }
  &__slot {
    position: relative;
    border-radius: 999rpx;
    padding: 14rpx 24rpx;
    text { font-size: 24rpx; font-weight: 500; line-height: 34rpx; }
    &--off { background-color: #FEE2E2; text { color: #D94B4B; } }
    &--ok { background-color: #DCFCE7; text { color: #20845C; } }
    &--plain { background-color: #F2F3F5; text { color: #333333; } }
    &--sel { box-shadow: inset 0 0 0 4rpx #121212; }
  }
  &__slot-tag {
    position: absolute;
    top: -16rpx;
    right: 0;
    background-color: #D94B4B;
    border-radius: 8rpx;
    padding: 0 10rpx;
    text { font-size: 20rpx; color: #FFFFFF; line-height: 32rpx; }
  }

  &__hint {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex: 0 0 100%;              /* 占满白卡内容宽，位于时段 chips 之后一行 */
    box-sizing: border-box;
    min-height: 96rpx;           /* 稿：灰条 48px 高 */
    margin: 0 0 24rpx;           /* 底部留 12px=24rpx（稿内四周留 12px）；顶部由 slots flex gap 承担 */
    background-color: #F2F3F5;   /* 置于白卡上可见 */
    border-radius: 12rpx;
    padding: 0 24rpx;
  }
  &__hint-text { flex: 1; font-size: 24rpx; line-height: 34rpx; color: #666666; }

  &__reasons {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin: 20rpx 32rpx 0;
  }
  &__reason {
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 999rpx;
    padding: 14rpx 28rpx;
    text { font-size: 28rpx; line-height: 40rpx; color: #333333; }
    &--on { background-color: #00B972; border-color: #00B972; text { color: #FFFFFF; font-weight: 500; } }
  }

  &__submit {
    margin: 48rpx 32rpx 40rpx;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }

  &__safe { height: 40rpx; }
}
</style>
