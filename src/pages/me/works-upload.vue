<template>
  <view class="page-wu page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「上传作品」（1:6587 实测） -->
    <view class="page-wu__header">
      <view class="page-wu__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-wu__title">上传作品</text>
    </view>

    <!-- 选择图片（y104 标题行 + 右提示 + y154 3x3 格：首张「封面」黑标 + 末格虚加号） -->
    <view class="page-wu__sec-row">
      <text class="page-wu__sec">选择图片</text>
      <text class="page-wu__sec-hint">已选 {{ picks.length }} 张 · 首张为封面</text>
    </view>
    <view class="page-wu__grid">
      <view v-for="(g, i) in pickUrls" :key="i" class="page-wu__cell">
        <image class="page-wu__img" :src="g" mode="aspectFill" />
        <view v-if="i === 0" class="page-wu__cover"><text>封面</text></view>
      </view>
      <view class="page-wu__cell page-wu__cell--empty pressable" @click="addPic">
        <view class="page-wu__plus" />
      </view>
    </view>

    <!-- 作品信息（y518 标题 + y551 三行：标题输入/拍摄日期/关联套餐） -->
    <text class="page-wu__sec">作品信息</text>
    <view class="page-wu__card">
      <view class="info-row page-wu__row">
        <text class="page-wu__label">标题</text>
        <input v-model="title" class="page-wu__input" placeholder="点击输入 · 如「越秀公园 · 秋日」" placeholder-class="page-wu__ph" />
      </view>
      <picker mode="date" :value="shootDate" @change="onDateChange">
        <view class="info-row page-wu__row">
          <text class="page-wu__label">拍摄日期</text>
          <text class="page-wu__value">{{ shootDate || '请选择' }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </picker>
      <picker mode="selector" :range="pkgNames" @change="onPkgChange">
        <view class="info-row page-wu__row">
          <text class="page-wu__label">关联套餐</text>
          <text class="page-wu__value" :class="{ 'page-wu__value--ph': pkgIndex === 0 }">{{ pkgText }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </picker>
    </view>

    <!-- 分类（y718 标签行 + y771 chips：写真选中 + 全家福/跟拍/证件照/其他） -->
    <text class="page-wu__sec page-wu__sec--gap">分类</text>
    <view class="page-wu__chips">
      <view
        v-for="c in chips"
        :key="c"
        class="page-wu__chip"
        :class="{ 'page-wu__chip--on': chip === c }"
        @click="chip = c"
      >
        <text>{{ c }}</text>
      </view>
    </view>

    <!-- 客户授权（y815 标题行 + y865 金圆待授权卡 + 徽章） -->
    <view class="page-wu__sec-row page-wu__sec-row--mt">
      <text class="page-wu__sec">客户授权</text>
      <text class="page-wu__sec-hint">公开前必须获得</text>
    </view>
    <view class="page-wu__card page-wu__card--auth">
      <view class="info-row page-wu__row info-row--last">
        <view class="page-wu__auth-icon"><AppIcon name="clock-gold" :size="15" /></view>
        <view class="page-wu__row-main">
          <text class="page-wu__auth-title">待授权</text>
          <text class="page-wu__auth-sub">{{ authSub }}</text>
        </view>
        <view class="page-wu__auth-badge"><text>待授权</text></view>
      </view>
    </view>

    <!-- 可见性分段（精选展示/公开/未公开 + 说明）：按用户 2026-09-10 指示暂不开发，整块下线 -->

    <!-- 底栏：存草稿 / 发布（双钮 52） -->
    <view class="page-wu__foot">
      <view class="page-wu__foot-ghost pressable" @click="draft"><text>存草稿</text></view>
      <view class="page-wu__foot-main pressable" @click="publish"><text>发布</text></view>
    </view>
    <view class="page-wu__safe" />
  </view>
</template>

<script>
/**
 * ME07 上传作品（稿 1:6587 实测 1:1）
 * 选择图片 3x3（首张封面黑标金字）→ 作品信息三行 → 分类 chips → 客户授权待授权卡 → 底栏存草稿/发布。
 * 稿内「可见性分段（精选展示/公开/未公开）」按用户 2026-09-10 指示暂不开发，未实现。
 * 区块纵向坐标按 P_ME07-上传作品.png 逐行像素实测校正（2026-09-10）。
 *
 * 数据源（2026-09-14 接线）：
 *   uni.chooseImage + /upload/file → 逐张上传，取回服务端 URL 组成 images（首张作 cover）
 *   /package/list → 关联套餐（单选；package_ids 为逗号分隔串，此处传单个 id）
 *   /asset/create → 存草稿(status 1) / 发布(status 2 + authorization 1-待授权)
 */
import { uploadFile } from '@/api/upload'
import { getPackageList } from '@/api/package'
import { createAsset } from '@/api/asset'
import { formatDate } from '@/utils/format'
import { mediaUrl } from '@/utils/url'

export default {
  name: 'MeWorksUpload',
  data() {
    return {
      title: '',
      shootDate: '',
      chip: '写真',
      chips: ['写真', '全家福', '跟拍', '证件照', '其他'],
      packages: [],
      pkgIndex: 0,
      picks: [],
      uploading: false,
      submitting: false,
    }
  },
  computed: {
    pkgNames() { return ['不关联', ...this.packages.map((p) => p.name)] },
    /** 后端返回站内相对路径（/uploads/…），小程序无 origin 须补 API_BASE 才能显示 */
    pickUrls() { return this.picks.map((g) => mediaUrl(g)) },
    pkgText() {
      return this.pkgIndex > 0 ? this.pkgNames[this.pkgIndex] : '选填 · 展示在该套餐详情页'
    },
    authSub() { return '发布后向客户发送授权请求 · 同意前\n仅自己可见' },
  },
  onLoad() {
    this.shootDate = formatDate(new Date())
    this.fetchPackages()
  },
  methods: {
    async fetchPackages() {
      const res = await getPackageList({ page: 1, page_size: 50 }).catch(() => null)
      this.packages = (res && res.list) || []
    },
    goBack() {
      uni.navigateBack()
    },
    /** 选择图片并逐张上传，成功后追加服务端 URL */
    addPic() {
      const remain = 9 - this.picks.length
      if (remain <= 0) return uni.showToast({ title: '最多 9 张', icon: 'none' })
      uni.chooseImage({
        count: remain,
        success: (res) => this.uploadPicked(res.tempFilePaths || []),
      })
    },
    async uploadPicked(paths) {
      if (!paths.length || this.uploading) return
      this.uploading = true
      uni.showLoading({ title: '上传中' })
      const urls = await Promise.all(
        paths.map((p) =>
          uploadFile(p)
            .then((r) => (typeof r === 'string' ? r : (r && (r.url || (r.data && r.data.url))) || ''))
            .catch(() => '')
        )
      )
      this.picks.push(...urls.filter(Boolean))
      uni.hideLoading()
      this.uploading = false
      if (!this.picks.length) uni.showToast({ title: '上传失败，请重试', icon: 'none' })
    },
    onDateChange(e) { this.shootDate = e.detail.value },
    onPkgChange(e) { this.pkgIndex = Number(e.detail.value) },
    /** 落库：status 1-草稿 / 2-已发布（发布时初始为待授权） */
    async submit(status) {
      if (this.submitting) return
      if (!this.title.trim()) return uni.showToast({ title: '请填写作品标题', icon: 'none' })
      if (!this.picks.length) return uni.showToast({ title: '请至少上传 1 张图片', icon: 'none' })
      this.submitting = true
      const pkg = this.pkgIndex > 0 ? this.packages[this.pkgIndex - 1] : null
      const ok = await createAsset({
        title: this.title.trim(),
        category: this.chip,
        cover: this.picks[0],
        images: this.picks.join(','),
        shoot_date: this.shootDate,
        package_ids: pkg ? String(pkg.id) : '',
        status,
        authorization: status === 2 ? 1 : 0,
      })
        .then(() => true)
        .catch(() => false)
      this.submitting = false
      if (!ok) return
      uni.showToast({ title: status === 2 ? '已发布，授权请求已发送' : '已存草稿', icon: 'none' })
      setTimeout(() => this.goBack(), 800)
    },
    draft() { this.submit(1) },
    publish() { this.submit(2) },
  },
}
</script>

<style lang="scss" scoped>
.page-wu {
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

  /* 注意：独立使用的 __sec 必须自带左右 32rpx 边距（同卡片/pills），
     否则标题会紧贴屏幕左缘（2026-09-10 漏检修正：此前只写了 margin-top）。 */
  &__sec { display: block; margin: 40rpx 36rpx 0; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 稿：网格底 497 → 作品信息 ink 521（bg 24px，减行高 1.6 留白≈4.5 → 20px=40rpx） */
  &__sec--gap { margin-top: 40rpx; } /* 稿：信息卡底 718 → 分类 ink 743（bg 25px → 20px=40rpx） */
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0; /* 稿：header 底 104 → 「选择图片」ink 128（bg 23px → 20px=40rpx） */
    .page-wu__sec { margin: 0; } /* sec-row 已提供左右边距，行内标题须清空全部 margin（含左右） */
    &--mt { margin-top: 60rpx; } /* 稿：chips 底 804 → 客户授权 ink 839（bg 34px，远超口径 20px，按稿取 30px=60rpx） */
  }
  &__sec-hint { font-size: 23rpx; color: #9A9AA0; }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin: 16rpx 32rpx 0; /* 稿：「选择图片」标题行底 ~146 → 网格 154（8px） */
  }
  &__cell {
    box-sizing: border-box;
    position: relative;
    width: 220rpx;
    height: 220rpx;
    border-radius: 24rpx;
    overflow: hidden;
    &--empty {
      background-color: $white;
      border: 2rpx solid #DFDFE3;
      border-radius: 20rpx; /* 稿空格 r10px=20rpx；图格保持 24rpx */
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  &__img { display: block; width: 100%; height: 100%; }
  &__cover {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    box-sizing: border-box;
    background-color: #1A1A1A;
    border-radius: 8rpx;
    padding: 4rpx 12rpx;
    text { font-size: 18rpx; color: #FFD60A; }
  }
  &__plus {
    position: relative;
    width: 40rpx;
    height: 40rpx;
    &::before, &::after {
      content: '';
      position: absolute;
      background-color: #B9B9BE;
      border-radius: 2rpx;
    }
    &::before { left: 0; top: 18rpx; width: 40rpx; height: 4rpx; }
    &::after { left: 18rpx; top: 0; width: 4rpx; height: 40rpx; }
  }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：作品信息标题底 → 信息卡 551（13px） */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
    &--auth { margin-top: 14rpx; } /* 稿：客户授权标题底 858 → 授权卡 865（7px） */
  }
  &__row { gap: 16rpx; min-height: 112rpx; } /* 稿：信息行高 56px（页面级覆盖 info-row 全局 128rpx） */
  &__card--auth &__row { min-height: 160rpx; } /* 稿：授权卡高 80px（双行副文） */
  &__label { font-size: 28rpx; color: #86868B; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--ph { color: #B9B9BE; }
  }
  &__input {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
    text-align: right;
  }
  &__ph { color: #B9B9BE; font-size: 28rpx; }

  &__chips {
    display: flex;
    gap: 16rpx;
    margin: 16rpx 32rpx 0; /* 稿：分类标题行底 ~760 → chips 771（8px），原 64rpx 偏大 */
    flex-wrap: nowrap;
  }
  &__chip {
    box-sizing: border-box;
    flex-shrink: 0;  /* 防压缩致「全家福/证件照」文字换行 */
    height: 68rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 2rpx solid #E9E9EC;
    padding: 0 30rpx; /* 稿实测：5 枚 pill（含「其他」）单行排满 343 */
    display: flex;
    align-items: center;
    text { font-size: 26rpx; color: #6D6D72; white-space: nowrap; }
    &--on {
      background-color: #1A1A1A;
      border-color: #1A1A1A;
      text { color: #FFFFFF; }
    }
  }

  &__row-main { flex: 1; min-width: 0; }
  &__auth-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 50%;
    background-color: #FFF6D6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__auth-title { font-size: 30rpx; color: #1A1A1A; }
  &__auth-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    line-height: 32rpx;
    color: #8E8E93;
    white-space: pre-line;
  }
  &__auth-badge {
    box-sizing: border-box;
    background-color: #FFF6D6;
    border-radius: 999rpx;
    padding: 8rpx 20rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #B8860B; }
  }

  /* __seg / __seg-item / __vis-hint（可见性分段控件与说明）随该模块下线，2026-09-10 移除 */

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;  /* 二级页无 AppTabBar（D-1 口径），按钮贴底 */
    z-index: 10;
    box-sizing: border-box;
    display: flex;
    gap: 20rpx;
    padding: 16rpx 32rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
    background-color: $bg-page; /* 不透明铺底，防滚动内容从按钮间隙穿出 */
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
