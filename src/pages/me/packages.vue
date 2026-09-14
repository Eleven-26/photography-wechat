<template>
  <view class="page-pk page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「套餐管理」居中（1:6079 实测） -->
    <view class="page-pk__header">
      <view class="page-pk__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-pk__title">套餐管理</text>
    </view>

    <!-- 概览行 y114：左（已上架·客户可见 12 灰 + 4/5 个 22/13）右（两行灰提示 12） -->
    <view class="page-pk__overview">
      <view class="page-pk__ov-left">
        <text class="page-pk__ov-label">已上架 · 客户可见</text>
        <view class="page-pk__ov-nums">
          <text class="page-pk__ov-num">{{ liveCount }}</text>
          <text class="page-pk__ov-total"> / {{ packages.length }} 个</text>
        </view>
      </view>
      <text class="page-pk__ov-hint">{{ '下架套餐客户不可见\n不影响已成交订单' }}</text>
    </view>

    <!-- 全部套餐列表（白 r16，行：38 方块色标 + 名 14 + 副 11 + 价 12.4 + toggle 46x27） -->
    <text class="page-pk__sec">全部套餐</text>
    <view class="page-pk__card">
      <view
        v-for="p in rows"
        :key="p.id"
        class="info-row page-pk__row pressable"
        @click="goEdit(p)"
      >
        <view class="page-pk__thumb" :style="{ backgroundColor: p.color }">
          <text>{{ p.tag }}</text>
        </view>
        <view class="page-pk__main">
          <view class="page-pk__name-row">
            <text class="page-pk__name">{{ p.name }}</text>
            <view v-if="p.draft" class="page-pk__draft"><text>草稿</text></view>
          </view>
          <text class="page-pk__sub">{{ p.spec }}</text>
        </view>
        <text class="page-pk__price">{{ p.price }}</text>
        <view class="page-pk__toggle" :class="{ 'page-pk__toggle--on': p.live }" @click.stop="toggle(p)">
          <view class="page-pk__knob" />
        </view>
      </view>
      <AppEmpty v-if="!loading && !rows.length" text="暂无套餐" />
    </view>

    <!-- 底栏：新建套餐 黑胶囊 52 高（fillx52 within 343） -->
    <view class="page-pk__foot">
      <view class="page-pk__add pressable" @click="goCreate">
        <view class="page-pk__add-plus" />
        <text>新建套餐</text>
      </view>
    </view>
    <view class="page-pk__safe" />
  </view>
</template>

<script>
/**
 * ME04 套餐管理（稿 1:6079 实测 1:1）
 * 概览（已上架/总数）→ 套餐行（38 色块方标按分类取色；toggle 上架绿 #34C759 下架 #DFDFE3；草稿徽章）→ 底部新建套餐。
 * 稿内「亲自写真」按上下文语义修正为「亲子写真」（待评审核对，同 CU01 口径）。
 *
 * 数据源（2026-09-14 接线）：
 *   /package/list        → 套餐分页（name/category/base_price/photos_included/shoot_hours/status…）
 *   /package/status/:id  → 上下架（status 2-已上架 / 3-已下线；1-草稿）
 * 套餐分类无固定色板，按分类/名称哈希取族色。
 */
import { getPackageList, setPackageStatus } from '@/api/package'
import { formatAmount } from '@/utils/format'

const THUMB_COLORS = ['#3E5C76', '#7C6BA8', '#B0654A', '#6E8A5B', '#9AA0A6']

function pickColor(key) {
  const s = key || ''
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 997
  return THUMB_COLORS[h % THUMB_COLORS.length]
}

export default {
  name: 'MePackages',
  data() {
    return {
      packages: [],
      loading: false,
      switching: false,
    }
  },
  computed: {
    liveCount() { return this.packages.filter((p) => Number(p.status) === 2).length },
    rows() {
      return this.packages.map((p) => ({
        id: p.id,
        name: p.name || '',
        spec: [
          p.category,
          p.shoot_hours ? `约${p.shoot_hours}h` : '',
          p.photos_included ? `精修${p.photos_included}张` : '',
        ]
          .filter(Boolean)
          .join('·'),
        price: p.base_price ? `¥${formatAmount(p.base_price)}` : '—',
        color: pickColor(p.category || p.name),
        tag: String(p.category || '套餐').slice(0, 2),
        live: Number(p.status) === 2,
        draft: Number(p.status) === 1,
      }))
    },
  },
  onShow() {
    this.fetchPackages()
  },
  methods: {
    async fetchPackages() {
      this.loading = true
      const res = await getPackageList({ page: 1, page_size: 50 }).catch(() => null)
      this.packages = (res && res.list) || []
      this.loading = false
    },
    goBack() {
      uni.navigateBack()
    },
    goCreate() {
      uni.navigateTo({ url: '/pages/me/package-edit?mode=create' })
    },
    goEdit(p) {
      uni.navigateTo({ url: `/pages/me/package-edit?mode=edit&id=${p.id}` })
    },
    /** 上下架：2-已上架 ↔ 3-已下线 */
    async toggle(p) {
      if (this.switching) return
      this.switching = true
      const next = p.live ? 3 : 2
      const ok = await setPackageStatus(p.id, next).then(() => true).catch(() => false)
      this.switching = false
      if (!ok) return
      uni.showToast({ title: next === 2 ? '已上架' : '已下架', icon: 'none' })
      this.fetchPackages()
    },
  },
}
</script>

<style lang="scss" scoped>
.page-pk {
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

  &__overview {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin: 20rpx 32rpx 0; /* 稿：白卡 @114 */
    padding: 24rpx 32rpx;  /* 稿：卡高 81px（内容 58 + 上下 11.5×2）；原无卡背景致整页上移 ~15px */
    background-color: $white;
    border-radius: 32rpx;
  }
  &__ov-left { display: flex; flex-direction: column; gap: 8rpx; }
  &__ov-label { font-size: 24rpx; color: #8E8E93; }
  &__ov-nums { display: flex; align-items: baseline; }
  &__ov-num { font-size: 44rpx; font-weight: 700; color: #1A1A1A; }
  &__ov-total { font-size: 26rpx; color: #8E8E93; }
  &__ov-hint {
    margin-left: auto;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #9A9AA0;
    text-align: right;
    white-space: pre-line;
  }

  &__sec {
    display: block;
    margin: 40rpx 36rpx 0; /* 稿：概览卡底 194 → 全部套餐 ink 219（bg 24px，减行高 1.6 留白≈4.5 → 20px=40rpx）；原 32rpx 偏小 */
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
  }

  &__card {
    margin: 24rpx 32rpx 0; /* 稿：标题 ink 底 233 → 套餐卡 249（bg 15px，减留白≈4.5 → 11px≈24rpx）；原 20rpx */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row { gap: 20rpx; }
  &__thumb {
    box-sizing: border-box;
    width: 76rpx;
    height: 76rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 20rpx; color: #FFFFFF; }
  }
  &__main { flex: 1; min-width: 0; }
  &__name-row { display: flex; align-items: center; gap: 12rpx; }
  &__name { font-size: 28rpx; color: #000000; white-space: nowrap; }
  &__draft {
    box-sizing: border-box;
    background-color: #F1F1F3;
    border-radius: 999rpx;
    padding: 2rpx 14rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #8E8E93; }
  }
  &__sub {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #8E8E93;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__price { font-size: 25rpx; color: #000000; flex-shrink: 0; }

  &__toggle {
    box-sizing: border-box;
    width: 92rpx;
    height: 54rpx;
    border-radius: 999rpx;
    background-color: #DFDFE3;
    padding: 6rpx;
    flex-shrink: 0;
    &--on { background-color: #34C759; display: flex; justify-content: flex-end; }
  }
  &__knob { width: 42rpx; height: 42rpx; border-radius: 50%; background-color: #FFFFFF; }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    box-sizing: border-box;
    padding: 16rpx 32rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
    background-color: rgba(242, 243, 245, 0.92);
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
