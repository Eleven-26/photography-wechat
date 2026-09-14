<template>
  <view class="page-cu page-wrap">
    <view class="status-bar" />
    <!-- Header：「客户」17 Bold 居中，tab 根页无返回钮（1:5677 实测） -->
    <view class="page-cu__header">
      <text class="page-cu__title">客户</text>
    </view>

    <!-- 搜索行：白胶囊搜索框 284×44 + 44 黑胶囊新建钮（1:5692/1:5687 实测 y104） -->
    <view class="page-cu__search-row">
      <view class="page-cu__search">
        <AppIcon name="search-gray" :size="14" />
        <input v-model="keyword" class="page-cu__search-input" placeholder="搜姓名/手机号" placeholder-class="page-cu__ph" />
      </view>
      <view class="page-cu__add pressable" @click="addCustomer">
        <!-- 加号用画板导出件（plus-head-white = plus-head-dark 白色变体），替换原 CSS 手画加号 -->
        <AppIcon name="plus-head-white" :size="20" />
      </view>
    </view>

    <!-- 今日待跟进黑卡（1:700 实测 344×112 #121212：金点+标题+两个深灰客户条+电话钮） -->
    <view class="page-cu__follow">
      <view class="page-cu__follow-head">
        <view class="page-cu__follow-dot" />
        <text class="page-cu__follow-title">今日待跟进</text>
        <text class="page-cu__follow-count">3位</text>
      </view>
      <scroll-view class="page-cu__follow-scroll" scroll-x :show-scrollbar="false">
        <view class="page-cu__follow-list">
          <view v-for="f in followUps" :key="f.id" class="page-cu__follow-item">
            <view class="page-cu__follow-main">
              <text class="page-cu__follow-name">{{ f.name }}</text>
              <text class="page-cu__follow-sub">{{ f.sub }}</text>
            </view>
            <view class="page-cu__follow-btn pressable" @click="call(f)"><text>电话</text></view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 过滤 chips：全部(黑)/最近合作/待跟进/已完成（1:719 实测） -->
    <view class="page-cu__chips">
      <view
        v-for="c in chips"
        :key="c"
        class="page-cu__chip"
        :class="{ 'page-cu__chip--on': chip === c }"
        @click="chip = c"
      >
        <text>{{ c }}</text>
      </view>
    </view>

    <!-- 客户行：40 彩色圆头像 + 名 + 副 + 右侧状态点/字 + 拍摄日（1:5627-5668 实测：每行独立白底 343×60 r8，pitch 62） -->
    <view class="page-cu__list">
      <view
        v-for="(c, i) in filtered"
        :key="c.id"
        class="page-cu__row pressable"
        :class="{ 'page-cu__row--line': i > 0 }"
        @click="goDetail(c)"
      >
        <view class="page-cu__avatar" :style="{ backgroundColor: c.avatar }">
          <text>{{ c.name[0] }}</text>
        </view>
        <view class="page-cu__row-main">
          <text class="page-cu__name">{{ c.name }}</text>
          <text class="page-cu__sub">{{ c.sub }}</text>
        </view>
        <view class="page-cu__right">
          <view v-if="c.status" class="page-cu__status">
            <view v-if="c.dot" class="page-cu__status-dot" :style="{ backgroundColor: c.dot }" />
            <text class="page-cu__status-text" :style="{ color: c.dot || '#666666' }">{{ c.status }}</text>
          </view>
          <text v-if="c.date" class="page-cu__date">{{ c.date }}</text>
        </view>
      </view>
      <AppEmpty v-if="!loading && !filtered.length" text="暂无客户" />
    </view>

    <AppTabBar active="customer" />
    <view class="page-cu__safe" />
  </view>
</template>

<script>
/**
 * CU01 客户列表（稿 1:5625 实测 1:1）
 * 搜索+新建（44 黑方块加号）→ 今日待跟进黑卡（深灰客户条+电话钮）→ 过滤 chips → 客户行。
 * 头像底色实测：李 #F89494 / 林 #08A4FF / 孟 #EFA803 / 王 #00CB8E / 姜 #699EFF / 许 #FF6ABE。
 *
 * 数据源（2026-09-14 接线）：
 *   /customer/list        → 客户分页（name/mobile/status/order_count/total_amount/prefer_style…）
 *   /customer/today-follow→ 今日待跟进线索（黑卡横滑条）
 * chips 为稿内文案，按客户状态映射：最近合作=活跃(2) / 待跟进=潜在(1) / 已完成=流失(3)（待评审确认）。
 * 头像无色板字段，按姓名哈希取族色；客户 status：1-潜在 2-活跃 3-流失。
 */
import { getCustomerList, getTodayFollow } from '@/api/customer'
import { formatAmount, fromNow, contactPhotographer } from '@/utils/format'

const AVATAR_COLORS = ['#F89494', '#08A4FF', '#EFA803', '#00CB8E', '#699EFF', '#FF6ABE']
/** 客户状态 → 右侧状态字 + 圆点色 */
const STATUS_MAP = {
  1: { text: '潜在', dot: '#00B972' },
  2: { text: '活跃', dot: '#B66E00' },
  3: { text: '流失', dot: '#999999' },
}

/** 按姓名哈希取头像底族色（后端无头像色字段） */
function pickColor(name) {
  const s = name || ''
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default {
  name: 'CustomerList',
  data() {
    return {
      keyword: '',
      chip: '全部',
      chips: ['全部', '最近合作', '待跟进', '已完成'],
      followUps: [],
      customers: [],
      loading: false,
    }
  },
  computed: {
    /** 客户展示行（模板字段与稿一致：name/avatar/sub/status/dot） */
    rows() {
      return this.customers.map((c) => {
        const st = STATUS_MAP[Number(c.status)] || {}
        return {
          id: c.id,
          name: c.name || '',
          avatar: pickColor(c.name),
          sub: [
            c.prefer_style || c.tags,
            `${c.order_count || 0} 单`,
            c.total_amount ? `¥${formatAmount(c.total_amount)}` : '',
          ]
            .filter(Boolean)
            .join(' · '),
          status: st.text || '',
          dot: st.dot || '',
          rawStatus: Number(c.status),
        }
      })
    },
    filtered() {
      let list = this.rows
      if (this.chip === '待跟进') list = list.filter((c) => c.rawStatus === 1)
      else if (this.chip === '最近合作') list = list.filter((c) => c.rawStatus === 2)
      else if (this.chip === '已完成') list = list.filter((c) => c.rawStatus === 3)
      const kw = this.keyword.trim()
      if (kw) list = list.filter((c) => c.name.includes(kw) || String(c.sub).includes(kw))
      return list
    },
  },
  onShow() {
    this.fetchCustomers()
    this.fetchFollowUps()
  },
  methods: {
    async fetchCustomers() {
      this.loading = true
      const res = await getCustomerList({ page: 1, page_size: 50 }).catch(() => null)
      this.customers = (res && res.list) || []
      this.loading = false
    },
    async fetchFollowUps() {
      const res = await getTodayFollow({ limit: 10 }).catch(() => null)
      const list = Array.isArray(res) ? res : (res && res.list) || []
      this.followUps = list.map((f) => ({
        id: f.id,
        name: f.name || f.customer_name || '',
        mobile: f.mobile || '',
        sub: [
          f.project_type,
          f.shoot_time ? `${f.shoot_time}拍摄` : '',
          fromNow(f.next_follow_at),
        ]
          .filter(Boolean)
          .join(' · '),
      }))
    },
    addCustomer() {
      uni.navigateTo({ url: '/pages/customer/create' })
    },
    call(f) {
      contactPhotographer(f && f.mobile)
    },
    goDetail(c) {
      uni.navigateTo({ url: `/pages/customer/detail?id=${c.id}` })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-cu {
  &__header {
    position: relative;
    box-sizing: border-box;
    height: 60px;
    display: flex;
    align-items: center;
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

  &__search-row {
    display: flex;
    align-items: center;
    gap: 32rpx;
    margin: 0 32rpx; /* 稿：搜索行 @104（header 底） */
  }
  &__search {
    flex: none;
    width: 568rpx; /* 稿：搜索框 284 宽 @15 */
    display: flex;
    align-items: center;
    gap: 20rpx;
    box-sizing: border-box;
    height: 88rpx;
    background-color: $white;
    border-radius: 999rpx; /* 稿 1:5693 实测 cornerRadius 30 → 44 高全胶囊 */
    padding: 0 32rpx;
  }
  &__search-input { flex: 1; font-size: 26rpx; color: #151617; }
  &__ph { color: #999999; font-size: 26rpx; }
  &__add {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    border-radius: 999rpx; /* 稿 1:5688 实测 cornerRadius 30 → 44×44 全圆 */
    background-color: #171717;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  /* __add-plus（CSS 手画加号 28rpx/线宽 4rpx）已移除：改用画板导出的 plus-head-white 图标，2026-09-10 */

  &__follow {
    margin: 40rpx 32rpx 0; /* 稿：黑卡 @168（搜索底 148 + 20） */
    background-color: #121212;
    border-radius: 32rpx; /* 稿 1:5700 实测 cornerRadius 16px → 32rpx */
    padding: 26rpx 32rpx 32rpx;
    overflow: hidden; /* 跟进条在黑框内横滑，超出裁切 */
  }
  &__follow-head { display: flex; align-items: center; gap: 16rpx; }
  &__follow-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background-color: #FFDA08; }
  &__follow-title { font-size: 26rpx; font-weight: 500; color: #FFFFFF; }
  &__follow-count { margin-left: auto; font-size: 20rpx; font-weight: 500; color: #FFFFFF; }
  &__follow-scroll {
    margin-top: 20rpx;
    width: 100%;
    white-space: nowrap;
    &::-webkit-scrollbar { display: none; }
  }
  &__follow-list {
    display: inline-flex; /* scroll-view 内 inline-flex 撑出可滑宽度 */
    min-width: max-content; /* 防 content 层把宽压回容器，滑动失效 */
    gap: 20rpx;
  }
  &__follow-item {
    flex: none;
    width: 480rpx; /* 定宽 240px，露出下一条边缘，横滑查看 */
    background-color: #252526;
    border-radius: 12rpx;
    padding: 10rpx 20rpx 10rpx 24rpx; /* 稿：条高 52 */
    display: flex;
    align-items: center;
  }
  &__follow-main { flex: 1; min-width: 0; }
  &__follow-name { display: block; font-size: 28rpx; font-weight: 500; color: #FFFFFF; }
  &__follow-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 22rpx;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__follow-btn {
    margin-left: 12rpx;
    box-sizing: border-box;
    width: 88rpx;
    height: 52rpx;
    background-color: #121212;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 22rpx; color: #FFFFFF; }
  }

  &__chips {
    display: flex;
    gap: 16rpx;
    margin: 24rpx 32rpx 0;
  }
  &__chip {
    background-color: $white;
    border-radius: 999rpx;
    padding: 16rpx 36rpx; /* 稿 chip h=34px=68rpx（原 14rpx≈64rpx 略短，上下各 +2rpx） */
    text { font-size: 28rpx; font-weight: 500; color: #666666; }
    &--on { background-color: #17181A; text { color: #FFFFFF; font-weight: 700; } }
  }

  &__list { margin: 50rpx 32rpx 0; } /* 稿：首行 @354（chips 底 341 + 13） */
  &__row {
    display: flex;
    align-items: center;
    gap: 24rpx;
    box-sizing: border-box;
    min-height: 120rpx; /* 稿：行高 60（avatar 40 撑底，内容不足时兜底） */
    padding: 10rpx 16rpx;
    background-color: $white; /* 稿 1:5628：每行独立白底矩形 */
    border-radius: 32rpx; /* 稿实测 cornerRadius 16px → 32rpx（此前误写 16rpx，px→rpx 漏乘 2） */
    &--line { margin-top: 4rpx; } /* 稿 pitch 62 = 行 60 + 2px 灰缝，无分隔线 */
  }
  &__avatar {
    box-sizing: border-box;
    width: 80rpx;
    height: 80rpx;
    border-radius: 24rpx; /* 稿 1:5629 实测 cornerRadius 12px → 24rpx 圆角方（40×40） */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 28rpx; font-weight: 500; color: #FFFFFF; }
  }
  &__row-main { flex: 1; min-width: 0; }
  &__name { display: block; font-size: 28rpx; font-weight: 500; color: #333333; }
  &__sub {
    display: block;
    margin-top: 4rpx;
    font-size: 22rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8rpx;
    flex-shrink: 0;
  }
  &__status { display: flex; align-items: center; gap: 10rpx; }
  &__status-dot { width: 12rpx; height: 12rpx; border-radius: 50%; }
  &__status-text { font-size: 22rpx; font-weight: 500; }
  &__date { font-size: 22rpx; color: #999999; }

  &__safe { height: calc(166rpx + env(safe-area-inset-bottom)); }
}
</style>
