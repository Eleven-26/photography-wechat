<template>
  <view class="page-pw page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「作品集」居中（1:6503 实测） -->
    <view class="page-pw__header">
      <view class="page-pw__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-pw__title">作品集</text>
    </view>

    <!-- 统计条 y114 白 r16：86 总作品 | 12 精选 | 4 分类（22/11 + #F0F0F2 竖线） -->
    <view class="page-pw__stats">
      <view class="page-pw__stat">
        <text class="page-pw__stat-num">86</text>
        <text class="page-pw__stat-label">总作品</text>
      </view>
      <view class="page-pw__divider" />
      <view class="page-pw__stat">
        <text class="page-pw__stat-num">12</text>
        <text class="page-pw__stat-label">精选</text>
      </view>
      <view class="page-pw__divider" />
      <view class="page-pw__stat">
        <text class="page-pw__stat-num">4</text>
        <text class="page-pw__stat-label">分类</text>
      </view>
    </view>

    <!-- 精选作品（y198 标题行 + 右提示 11.6 #9A9AA0 + y248 四张 110 精选格；稿内为横滑，第 4 张右缘裁切） -->
    <view class="page-pw__sec-row">
      <text class="page-pw__sec">精选作品</text>
      <text class="page-pw__sec-hint">展示在主页顶部 · 12 张</text>
    </view>
    <scroll-view class="page-pw__featured" scroll-x :show-scrollbar="false">
      <view class="page-pw__featured-list">
        <view v-for="(g, i) in featured" :key="i" class="page-pw__featured-cell">
          <image class="page-pw__img" :src="g" mode="aspectFill" />
          <view class="page-pw__featured-badge"><text>精选</text></view>
        </view>
      </view>
    </scroll-view>

    <!-- 分类 chips（y378：全部黑底选中 + 写真/全家福/跟拍/证件照 白底描边 #E9E9EC） -->
    <view class="page-pw__chips">
      <view
        v-for="c in chips"
        :key="c"
        class="page-pw__chip"
        :class="{ 'page-pw__chip--on': chip === c }"
        @click="chip = c"
      >
        <text>{{ c }}</text>
      </view>
    </view>

    <view class="page-pw__grid">
      <view v-for="(g, i) in grid" :key="i" class="page-pw__grid-cell" @click="goEdit">
        <image class="page-pw__img" :src="g" mode="aspectFill" />
      </view>
    </view>

    <!-- 底栏：上传作品 黑胶囊 52 -->
    <view class="page-pw__foot">
      <view class="page-pw__add pressable" @click="goUpload">
        <view class="page-pw__add-plus" />
        <text>上传作品</text>
      </view>
    </view>
    <view class="page-pw__safe" />
  </view>
</template>

<script>
/**
 * ME06 作品集（稿 1:6503 实测 1:1）
 * 统计条（86/12/4 三列 #F0F0F2 分隔）→ 精选作品 横滑 4 张 110 格（金「精选」角标 @右上）→ 分类 chips（34 高胶囊）→ 3x3 九宫格 → 底部上传作品黑胶囊。
 * 作品图：工程内置演示实拍图 static/img/（work-1~6 / pkg-1~2 / hero），联调后换成后端返回的作品 URL。
 */
export default {
  name: 'MeWorks',
  data() {
    return {
      chip: '全部',
      chips: ['全部', '写真', '全家福', '跟拍', '证件照'],
      featured: [
        '/static/img/work-1.jpg',
        '/static/img/work-2.jpg',
        '/static/img/work-3.jpg',
        '/static/img/work-4.jpg',
      ],
      grid: [
        '/static/img/work-5.jpg',
        '/static/img/work-6.jpg',
        '/static/img/pkg-1.jpg',
        '/static/img/pkg-2.jpg',
        '/static/img/hero.jpg',
        '/static/img/work-1.jpg',
        '/static/img/work-2.jpg',
        '/static/img/work-3.jpg',
        '/static/img/work-4.jpg',
      ],
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    goUpload() {
      uni.navigateTo({ url: '/pages/me/works-upload' })
    },
    goEdit() {
      uni.navigateTo({ url: '/pages/me/works-edit' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-pw {
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

  &__stats {
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    margin: 20rpx 32rpx 0; /* 稿：白卡 @114（header 底 104 + 10px） */
    background-color: $white;
    border-radius: 32rpx;
    padding: 28rpx 0;      /* 稿：卡 114-197 高 84px；行高 1.6 下内容 56px（数字22+间距3+标签11）
                              故上下 padding = (84-56)/2 = 14px = 28rpx（原 42rpx 使卡高≈98px） */
  }
  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
  }
  &__stat-num { font-size: 44rpx; font-weight: 700; color: #1A1A1A; }
  &__stat-label { font-size: 22rpx; color: #8E8E93; }
  &__divider { width: 2rpx; background-color: #F0F0F2; } /* 稿竖线 1px = 2rpx */

  &__sec { font-size: 30rpx; font-weight: 500; color: #1A1A1A; }
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0; /* 稿：统计卡底 197 → 标题 ink 222（bg 24px，减行高 1.6 留白≈4.5 → 20px=40rpx） */
  }
  &__sec-hint { font-size: 23rpx; color: #9A9AA0; }

  /* 精选作品横滑（稿：4 张 110 格，第 4 张右缘裁切 = 横向可滑） */
  &__featured {
    margin: 14rpx 0 0;      /* 稿：标题行底 245 → 卡片顶 248 */
    white-space: nowrap;
  }
  &__featured-list {
    display: inline-flex;
    gap: 12rpx;
    padding: 0 32rpx;       /* 页左右边距由横滑内容自带 */
    min-width: max-content; /* 防 inline-flex 被压回容器宽（uni scroll-view 横滑铁律） */
  }
  &__featured-cell {
    box-sizing: border-box;
    position: relative;
    width: 220rpx;
    height: 220rpx;
    border-radius: 24rpx;
    overflow: hidden;
    flex-shrink: 0;
  }
  &__img { display: block; width: 100%; height: 100%; }
  &__featured-badge {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    box-sizing: border-box;
    background-color: #FFD60A;
    border-radius: 16rpx;
    padding: 4rpx 12rpx;
    text { font-size: 18rpx; font-weight: 500; color: #161616; }
  }

  &__chips {
    display: flex;
    gap: 12rpx;
    margin: 40rpx 32rpx 0; /* 稿：精选卡底 357 → chips 378（bg 20px=40rpx） */
    flex-wrap: nowrap;
  }
  &__chip {
    box-sizing: border-box;
    flex-shrink: 0;        /* 关键：禁止压缩——曾因空间紧张被压致「写真/跟拍」文字换行 */
    height: 68rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 2rpx solid #E9E9EC;
    padding: 0 30rpx;      /* 稿实测：水平 15px（全部/写真 56px 宽、全家福/证件照 69px） */
    display: flex;
    align-items: center;
    text { font-size: 26rpx; color: #6D6D72; white-space: nowrap; }
    &--on {
      background-color: #1A1A1A;
      border-color: #1A1A1A;
      text { color: #FFFFFF; }
    }
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin: 40rpx 32rpx 0; /* 稿：chips 底 411 → grid 432（bg 20px=40rpx） */
  }
  &__grid-cell {
    box-sizing: border-box;
    width: 220rpx;
    height: 220rpx;
    border-radius: 24rpx;
    overflow: hidden;      /* 作品图裁入圆角 */
  }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;  /* 二级页无 AppTabBar（D-1 口径），按钮贴底；原按稿 tab 高度上移 206rpx 会悬空露内容 */
    z-index: 10;
    box-sizing: border-box;
    padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
    background-color: $bg-page; /* 不透明铺底，防滚动内容从按钮下缘穿出 */
  }
  &__add {
    box-sizing: border-box;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #1A1A1A;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    text { font-size: 30rpx; color: #FFFFFF; }
  }
  &__add-plus {
    position: relative;
    width: 28rpx;
    height: 28rpx;
    &::before, &::after {
      content: '';
      position: absolute;
      background-color: #FFFFFF;
    }
    &::before { left: 0; top: 12rpx; width: 28rpx; height: 4rpx; }
    &::after { left: 12rpx; top: 0; width: 4rpx; height: 28rpx; }
  }

  &__safe { height: 180rpx; }
}
</style>
