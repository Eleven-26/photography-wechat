<template>
  <view class="page-lead page-wrap">
    <view class="status-bar" />
    <!-- Header：返回 + 「线索」居中（1:3110 实测） -->
    <view class="page-lead__header">
      <view class="page-lead__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-lead__title">线索</text>
    </view>

    <!-- 分段 Tab：待处理(选中黑) / 全部 18 / 已报价（1:11 Group 49 实测） -->
    <view class="page-lead__tabs">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="page-lead__tab pressable"
        :class="{ 'page-lead__tab--on': tab === t.key }"
        @click="tab = t.key"
      >
        <text class="page-lead__tab-text">{{ t.label }}</text>
        <text v-if="t.count != null" class="page-lead__tab-count">{{ t.count }}</text>
      </view>
    </view>

    <!-- 线索卡：白 r20，行间 9% 线；徽章三色（1:21 实测） -->
    <view class="page-lead__card">
      <view
        v-for="(l, i) in filtered"
        :key="l.id"
        class="page-lead__row pressable"
        :class="{ 'page-lead__row--line': i > 0 }"
        @click="goDetail(l)"
      >
        <view class="page-lead__row-main">
          <view class="page-lead__row-head">
            <text class="page-lead__name">{{ l.name }}</text>
            <view class="page-lead__badge" :class="`page-lead__badge--${l.tone}`">
              <text>{{ l.status }}</text>
            </view>
          </view>
          <text class="page-lead__sub">{{ l.sub }}</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <AppEmpty v-if="!loading && !filtered.length" text="暂无线索" />
    </view>

    <AppTabBar active="order" />
    <view class="page-lead__safe" />
  </view>
</template>

<script>
/**
 * L01 线索列表（稿 1:3110 实测 1:1）
 * 分段 Tab：待处理（选中黑底）/ 全部 / 已报价；线索卡白 r20。
 * 徽章色实测：待回复 #FFE9AF/#B66E00、待报价 #FFF3D6/#B47200、已报价 #E5F6ED/#20845C。
 *
 * 数据源（2026-09-14 接线）：/lead/list —— 一次性拉取后前端按 Tab 过滤
 *   （与订单列表同模式，线索量小、避免三次请求）。
 * 后端线索状态（enum.LeadStatus）：1-待回复 2-待报价 3-已报价 4-已成交 5-已流失。
 * Tab 口径：待处理 = 1|2（尚未报价的活跃线索）/ 已报价 = 3 / 全部 = 不过滤。
 */
import { getLeadList } from '@/api/lead'
import { fromNow } from '@/utils/format'

/** 状态 → 徽章色调 / 文案（稿内三色族 + 流失灰） */
const TONE = { 1: 'reply', 2: 'quote', 3: 'confirm', 4: 'confirm', 5: 'lost' }
const LABEL = { 1: '待回复', 2: '待报价', 3: '已报价', 4: '已成交', 5: '已流失' }

export default {
  name: 'LeadList',
  data() {
    return {
      tab: 'pending',
      leads: [],
      loading: false,
    }
  },
  computed: {
    /** Tab（「全部」计数走动态；无数据时不渲染计数） */
    tabs() {
      return [
        { key: 'pending', label: '待处理' },
        { key: 'all', label: '全部', count: this.leads.length || null },
        { key: 'quoted', label: '已报价' },
      ]
    },
    filtered() {
      const rows = this.leads.map((l) => ({
        id: l.id,
        rawStatus: Number(l.status),
        name: (l.name || '').trim(),
        status: LABEL[Number(l.status)] || '待跟进',
        tone: TONE[Number(l.status)] || 'reply',
        sub: [l.project_type, l.source, fromNow(l.last_follow_at || l.next_follow_at)]
          .filter(Boolean)
          .join(' · '),
      }))
      if (this.tab === 'all') return rows
      if (this.tab === 'quoted') return rows.filter((r) => r.rawStatus === 3)
      return rows.filter((r) => r.rawStatus === 1 || r.rawStatus === 2)
    },
  },
  onShow() {
    this.fetchLeads()
  },
  methods: {
    async fetchLeads() {
      this.loading = true
      /* request 层已 toast；失败保持空态，不注入演示线索 */
      const res = await getLeadList({ page: 1, page_size: 50 }).catch(() => null)
      this.leads = (res && res.list) || []
      this.loading = false
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/work/index' }) })
    },
    goDetail(l) {
      uni.navigateTo({ url: `/pages/lead/detail?id=${l.id}` })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-lead {
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

  &__tabs {
    display: flex;
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx; /* 稿 Group49 外胶囊 cornerRadius 16px */
    padding: 4rpx;
    gap: 4rpx; /* 稿段间白缝 2px */
  }
  &__tab {
    flex: 1;
    height: 80rpx;
    border-radius: 28rpx; /* 稿激活段 Rectangle65 cornerRadius 14px */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    &--on { background-color: #121212; }
  }
  &__tab-text { font-size: 26rpx; color: #666666; }
  &__tab--on .page-lead__tab-text { color: #FFFFFF; font-weight: 700; }
  &__tab-count { font-size: 24rpx; color: #9CA3AF; }

  &__card {
    margin: 42rpx 32rpx 0; /* 稿：卡 @179（tabs 底 158 + 21） */
    background-color: $white;
    border-radius: 40rpx;
    border: 1rpx solid rgba(21, 22, 24, 0.05);
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx 32rpx; /* 稿：行高 70 */
    &--line { border-top: 1rpx solid rgba(21, 22, 24, 0.09); }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  &__name {
    font-size: 30rpx;
    line-height: 42rpx;
    font-weight: 700;
    color: #151617;
    width: max-content;
    flex-shrink: 0;
  }
  &__badge {
    border-radius: 999rpx;
    padding: 2rpx 14rpx 4rpx;
    flex-shrink: 0;
    text { font-size: 22rpx; line-height: 32rpx; font-weight: 500; }
    &--reply { background-color: #FFE9AF; text { color: #B66E00; } }
    &--quote { background-color: #FFF3D6; text { color: #B47200; } }
    &--confirm { background-color: #E5F6ED; text { color: #20845C; } }
    &--lost { background-color: #F2F3F5; text { color: #747981; } }
  }
  &__sub {
    display: block;
    margin-top: 4rpx;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #747981;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
