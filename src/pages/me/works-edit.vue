<template>
  <view class="page-we page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「编辑作品」（1:6698 实测） -->
    <view class="page-we__header">
      <view class="page-we__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-we__title">编辑作品</text>
    </view>

    <!-- 封面图卡 343x263 r16：底部黑渐变上标题 14.8 白 + 日期地点 10；右上 32 编辑圆钮 -->
    <view class="page-we__cover">
      <view class="page-we__cover-edit pressable" @click="changeCover">
        <AppIcon name="me-img" :size="15" />
      </view>
      <view class="page-we__cover-foot">
        <text class="page-we__cover-title">越秀公园 · 秋日家庭写真</text>
        <text class="page-we__cover-sub">2026/08/08 · 越秀公园</text>
      </view>
    </view>

    <!-- 分类 chips（y427：写真选中） -->
    <text class="page-we__sec">分类</text>
    <view class="page-we__chips">
      <view
        v-for="c in chips"
        :key="c"
        class="page-we__chip"
        :class="{ 'page-we__chip--on': chip === c }"
        @click="chip = c"
      >
        <text>{{ c }}</text>
      </view>
    </view>

    <!-- 关联套餐（y468 标题行 + 提示 + y518 勾选卡两行） -->
    <view class="page-we__sec-row">
      <text class="page-we__sec">关联套餐</text>
      <text class="page-we__sec-hint">该作品可展示在此套餐下</text>
    </view>
    <view class="page-we__card">
      <view
        v-for="p in pkgs"
        :key="p.name"
        class="info-row page-we__row"
        @click="togglePkg(p)"
      >
        <view class="page-we__check" :class="{ 'page-we__check--on': p.on }">
          <AppIcon v-if="p.on" name="check-gold-step" :size="11" />
        </view>
        <text class="page-we__pkg-name" :class="{ 'page-we__pkg-name--off': !p.on }">{{ p.name }}</text>
        <text class="page-we__pkg-price" :class="{ 'page-we__pkg-price--off': !p.on }">{{ p.price }}</text>
      </view>
    </view>

    <!-- 可见性分段（y646：精选展示选中 + 说明） -->
    <view class="page-we__card page-we__card--flush">
      <view class="page-we__seg">
        <view
          v-for="s in ['精选展示', '公开', '未公开']"
          :key="s"
          class="page-we__seg-item"
          :class="{ 'page-we__seg-item--on': vis === s }"
          @click="vis = s"
        >
          <text>{{ s }}</text>
        </view>
      </view>
      <text class="page-we__vis-hint">展示在主页顶部 + 套餐详情页</text>
    </view>

    <!-- 授权卡（y759：绿圆勾 + 已获客户授权 + 已授权徽章） -->
    <view class="page-we__card page-we__card--mt">
      <view class="info-row page-we__row info-row--last">
        <!-- 绿圆内白勾：稿实测圆 ⌀34px、勾宽 ≈15px（占圆 45%）→ check-white size 28（勾占画布 55%） -->
        <view class="page-we__auth-icon"><AppIcon name="check-white" :size="28" /></view>
        <view class="page-we__row-main">
          <text class="page-we__auth-title">已获客户授权</text>
          <text class="page-we__auth-sub">{{ '陈雨已于 2026/08/20 同意展示 · 未授权\n作品不可公开' }}</text>
        </view>
        <view class="page-we__auth-badge"><text>已授权</text></view>
      </view>
    </view>

    <!-- 底栏：删除 / 发布（双钮 52） -->
    <view class="page-we__foot">
      <view class="page-we__foot-ghost pressable" @click="del"><text>删除</text></view>
      <view class="page-we__foot-main pressable" @click="publish"><text>发布</text></view>
    </view>
    <view class="page-we__safe" />
  </view>
</template>

<script>
/**
 * ME08 编辑作品（稿 1:6698 实测 1:1）
 * 封面卡（标题/日期地点浮层 + 32 编辑圆钮）→ 分类 chips → 关联套餐勾选（黑勾 20 r6 / 灰描边未选）→ 可见性分段（精选展示选中）→ 已授权绿卡 → 底栏 删除/发布。
 * 稿内「亲自写真 · 基础」按 ME04 口径修正为「亲子写真 · 基础」。
 */
export default {
  name: 'MeWorksEdit',
  data() {
    return {
      chip: '写真',
      chips: ['写真', '全家福', '跟拍', '证件照'],
      vis: '精选展示',
      pkgs: [
        { name: '亲子写真 · 基础', price: '¥2,680', on: true },
        { name: '个人写真', price: '¥1,580', on: false },
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    changeCover() {
      uni.showToast({ title: '更换封面（演示）', icon: 'none' })
    },
    togglePkg(p) {
      p.on = !p.on
    },
    del() {
      uni.showModal({
        title: '删除作品',
        content: '删除后不可恢复',
        success: (res) => {
          if (res.confirm) uni.navigateBack()
        },
      })
    },
    publish() {
      uni.showToast({ title: '已保存发布（演示）', icon: 'success' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-we {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
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
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 34rpx;
    line-height: 48rpx;
    font-weight: 700;
    color: #1A1A1A;
  }

  &__cover {
    position: relative;
    box-sizing: border-box;
    height: 526rpx;
    margin: 20rpx 32rpx 0; /* 稿：cover @114 */
    border-radius: 32rpx;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.72) 100%),
      linear-gradient(150deg, #3A3D44 0%, #23252A 100%);
  }
  &__cover-edit {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    box-sizing: border-box;
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background-color: #4A4A4E;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__cover-foot {
    position: absolute;
    left: 28rpx;
    right: 28rpx;
    bottom: 30rpx;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  &__cover-title { font-size: 30rpx; color: #FFFFFF; }
  &__cover-sub { font-size: 20rpx; color: #EDEDEF; }

  &__sec { display: block; margin: 40rpx 36rpx 0; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 稿：cover 底 377 → 分类 ink 401（bg 23px，减行高 1.6 留白≈4.5 → 20px=40rpx）；原 margin-top:0 致标题贴死封面 */
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 48rpx 36rpx 0; /* 稿：chips 底 463 → 关联套餐 ink 492（bg 28px → 24px=48rpx，大于口径 20px，按稿取值） */
    .page-we__sec { margin: 0; } /* 行内标题清空全部 margin（sec-row 已提供边距，避免二次缩进） */
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; }

  &__chips {
    display: flex;
    gap: 16rpx;
    margin: 14rpx 32rpx 0; /* 稿：分类 ink 底 415 → chips 427（bg 11px，减留白≈4.5 → 7px=14rpx）；原 58rpx 把间距全压在标题下方，方向相反 */
    flex-wrap: nowrap;
  }
  &__chip {
    box-sizing: border-box;
    height: 68rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 2rpx solid #E9E9EC;
    padding: 0 32rpx;
    display: flex;
    align-items: center;
    text { font-size: 26rpx; color: #6D6D72; }
    &--on {
      background-color: #1A1A1A;
      border-color: #1A1A1A;
      text { color: #FFFFFF; }
    }
  }

  &__card {
    margin: 14rpx 32rpx 0; /* 稿：关联套餐 ink 底 506 → 卡 518（bg 11px，减留白≈4.5 → 7px=14rpx）；原 52rpx 偏大 */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
    &--flush {
      margin-top: 40rpx; /* 稿：卡1 底 625 → 卡2 646（bg 20px=40rpx）；原 0 致两卡贴死 */
      padding: 38rpx 32rpx; /* 稿：卡2 高 103px（646-748）＝内容 65px + 上下 19×2；原无 padding 致卡高≈65px 且分段贴边 */
    }
    &--mt { margin-top: 40rpx; } /* 稿：卡2 底 748 → 卡3 769（bg 20px=40rpx）；原 96rpx 过大 */
  }
  &__row { gap: 20rpx; min-height: 108rpx; } /* 稿：关联套餐行高 54px=108rpx（原继承全局 128rpx 每行偏高 10px） */
  &__row-main { flex: 1; min-width: 0; }
  &__check {
    box-sizing: border-box;
    width: 40rpx;
    height: 40rpx;
    border-radius: 12rpx;
    border: 2rpx solid #DFDFE3;
    background-color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--on {
      background-color: #161616;
      border-color: #161616;
    }
  }
  &__pkg-name {
    font-size: 28rpx;
    color: #000000;
    &--off { color: #6D6D72; }
  }
  &__pkg-price {
    margin-left: auto;
    font-size: 28rpx;
    color: #1A1A1A;
    &--off { font-size: 26rpx; color: #6D6D72; }
  }

  &__seg {
    display: flex;
    background-color: #F1F1F3;
    border-radius: 24rpx;
    padding: 4rpx;
  }
  &__seg-item {
    flex: 1;
    height: 68rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 26rpx; color: #8E8E93; }
    &--on {
      background-color: #1A1A1A;
      text { color: #FFFFFF; }
    }
  }
  &__vis-hint {
    display: block;
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #86868B;
  }

  &__auth-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 50%;
    background-color: #34C759;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__auth-title { font-size: 30rpx; color: #1A1A1A; }
  &__auth-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 20rpx;
    line-height: 30rpx;
    color: #8E8E93;
    white-space: pre-line;
  }
  &__auth-badge {
    box-sizing: border-box;
    background-color: #DFF5E9;
    border-radius: 999rpx;
    padding: 8rpx 20rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #00A860; }
  }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    box-sizing: border-box;
    display: flex;
    gap: 20rpx;
    padding: 16rpx 32rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
    background-color: rgba(242, 243, 245, 0.92);
  }
  &__foot-ghost {
    box-sizing: border-box;
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 2rpx solid #151617;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #151617; }
  }
  &__foot-main {
    box-sizing: border-box;
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #FFFFFF; }
  }

  &__safe { height: 180rpx; }
}
</style>
