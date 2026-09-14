<template>
  <view class="page-ld page-wrap has-footer">
    <view class="status-bar" />
    <!-- Header：返回 + 「陈雨 · 家庭写真」（1:3177 实测：名 17 Bold + 类目 12 #6B7280） -->
    <view class="page-ld__header">
      <view class="page-ld__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <view class="page-ld__title-wrap">
        <text class="page-ld__title">{{ lead.name }}</text>
        <text class="page-ld__title-sub">· {{ lead.project_type }}</text>
      </view>
    </view>

    <!-- 客户来源卡：白 r16（1:13 实测 y114） -->
    <view class="page-ld__card page-ld__card--src">
      <text class="page-ld__name">{{ lead.name }}</text>
      <text class="page-ld__src">{{ sourceText }}</text>
    </view>

    <!-- 等待回复卡：白 r16 + 图标行 + 黑胶囊发送作品 + 说明（1:20 实测 y214） -->
    <view class="page-ld__card page-ld__card--wait">
      <view class="page-ld__wait-row">
        <AppIcon name="clock-dark-sm" :size="20" />
        <text class="page-ld__wait-text">{{ waitText }}</text>
      </view>
      <view class="page-ld__send-btn pressable" @click="sendWorks">
        <text>发送作品给客户</text>
      </view>
      <text class="page-ld__wait-note">从作品集选择作品，生成链接通过客户端站点发送</text>
    </view>

    <text class="page-ld__sec">需求摘要</text>
    <view class="page-ld__card">
      <text class="page-ld__brief">{{ lead.remark }}</text>
    </view>

    <!-- AI 建议（1:35 实测：标题+徽章 / 已整理 Brief 卡） -->
    <view class="page-ld__sec-row">
      <text class="page-ld__sec page-ld__sec--nomargin">AI 建议</text>
      <view class="page-ld__ai-badge"><text>AI 已整理</text></view>
    </view>
    <view class="page-ld__card page-ld__card--brief pressable" @click="goBrief">
      <view class="page-ld__brief-head">
        <text class="page-ld__brief-title">AI 已整理 Brief</text>
        <AppIcon name="chevron-right-dark" :size="20" />
      </view>
      <text class="page-ld__brief-sub">{{ briefSummary }}</text>
    </view>

    <!-- 沟通记录（1:50 实测：三行、行间 #F0F0EB） -->
    <text class="page-ld__sec">沟通记录</text>
    <view class="page-ld__card">
      <view
        v-for="(msg, i) in messageRows"
        :key="msg.id"
        class="page-ld__msg"
        :class="{ 'page-ld__msg--line': i > 0 }"
      >
        <text class="page-ld__msg-time">{{ msg.time }}</text>
        <text class="page-ld__msg-text">{{ msg.text }}</text>
      </view>
    </view>

    <!-- 底部毛玻璃操作栏：提示 + 白描边追问 + 黑创建报价（1:71 实测） -->
    <view class="glass-footer">
      <text class="page-ld__foot-tip">追问和报价将通过客户端站点发送给客户</text>
      <view class="page-ld__foot-btns">
        <view class="page-ld__btn-ghost pressable" @click="goAsk">
          <text>追问客户</text>
        </view>
        <view class="page-ld__btn-dark pressable" @click="goQuote">
          <text>创建报价</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * L02 线索详情（稿 1:3177 实测 1:1）
 * 客户来源卡 → 客户端站点等待卡（发送作品黑胶囊）→ 需求摘要 → AI 建议（进 L03）→ 沟通记录 → 底栏（追问/创建报价）。
 * 底栏提示「追问和报价将通过客户端站点发送给客户」为稿内固定文案。
 *
 * 数据源（2026-09-14 接线）：
 *   /lead/detail/:id    → 线索主体（name/project_type/source/remark/created_at）
 *   /lead/messages/:id  → 沟通记录（direction 1-客户发来 2-工作室发出、content、created_at）
 *   /brief/list/:lead_id→ 需求摘要项（status 3-已确认 / 1-待追问；affects_pricing 影响报价）
 */
import { getLeadDetail, getLeadMessages, listBriefs } from '@/api/lead'
import { fromNow } from '@/utils/format'

export default {
  name: 'LeadDetail',
  data() {
    return {
      leadId: '',
      lead: {},
      messages: [],
      briefs: [],
    }
  },
  computed: {
    /** 「已确认 X 项 · 还有 Y 项影响报价」（Y = 未确认且影响报价的待追问项） */
    briefSummary() {
      const confirmed = this.briefs.filter((b) => Number(b.status) === 3).length
      const pricing = this.briefs.filter(
        (b) => Number(b.affects_pricing) === 1 && Number(b.status) !== 3
      ).length
      return `已确认 ${confirmed} 项 · 还有 ${pricing} 项影响报价`
    },
    /** 沟通记录展示行（方向 + 相对时间） */
    messageRows() {
      return this.messages.map((m) => ({
        id: m.id,
        time: [Number(m.direction) === 1 ? '客户发来' : '工作室发出', fromNow(m.created_at)]
          .filter(Boolean)
          .join(' · '),
        text: m.content,
      }))
    },
    /** 等待时长文案（自线索创建起算；无时间字段时退化为不带时长） */
    waitText() {
      const at = this.lead && (this.lead.created_at || this.lead.next_follow_at)
      const t = at ? new Date(String(at).replace(/-/g, '/')).getTime() : NaN
      if (Number.isNaN(t)) return '客户正在客户端站点等待回复'
      const min = Math.max(0, Math.floor((Date.now() - t) / 60000))
      return `客户正在客户端站点等待回复 · 已等待 ${min} 分钟`
    },
    /** 来源卡副行 */
    sourceText() {
      const first = fromNow(this.lead && (this.lead.created_at || this.lead.next_follow_at))
      return [this.lead && this.lead.source, first && `${first}首次咨询`]
        .filter(Boolean)
        .join(' · ')
    },
  },
  onLoad(query) {
    this.leadId = (query && query.id) || ''
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      if (!this.leadId) return
      const [lead, messages, briefs] = await Promise.all([
        getLeadDetail(this.leadId).catch(() => null),
        getLeadMessages(this.leadId).catch(() => []),
        listBriefs(this.leadId).catch(() => []),
      ])
      this.lead = lead || {}
      this.messages = Array.isArray(messages) ? messages : (messages && messages.list) || []
      this.briefs = Array.isArray(briefs) ? briefs : (briefs && briefs.list) || []
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/lead/list' }) })
    },
    goBrief() {
      uni.navigateTo({ url: `/pages/lead/ai-brief?id=${this.leadId}` })
    },
    goAsk() {
      uni.navigateTo({ url: `/pages/lead/ask?id=${this.leadId}` })
    },
    goQuote() {
      uni.navigateTo({ url: `/pages/quote/create?lead_id=${this.leadId}` })
    },
    sendWorks() {
      uni.navigateTo({ url: '/pages/me/works' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ld {
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
  &__title-wrap {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4rpx;
  }
  &__title { font-size: 34rpx; line-height: 48rpx; font-weight: 700; color: #151617; }
  &__title-sub { font-size: 24rpx; color: #6B7280; }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    border-radius: 32rpx;
    padding: 28rpx 32rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
    &--src { margin-top: 20rpx; }
    &--wait { padding: 32rpx; margin-top: 40rpx; } /* 稿：来源卡底 194 → 本卡 214 */
  }
  &__name { display: block; font-size: 30rpx; font-weight: 700; color: #151617; }
  &__src { display: block; margin-top: 6rpx; font-size: 26rpx; color: #747981; }

  &__wait-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__wait-text { font-size: 25rpx; color: #666666; }
  &__send-btn {
    margin-top: 30rpx; /* 稿：卡高 ~154 */
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #121212;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }
  &__wait-note {
    display: block;
    margin-top: 30rpx; /* 稿：卡高 ~154（214-368） */
    font-size: 24rpx;
    color: #666666;
  }

  &__sec {
    display: block;
    margin: 36rpx 36rpx 0;
    font-size: 30rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
    &--nomargin { margin: 0; }
  }
  &__sec-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 36rpx 36rpx 0;
  }
  &__ai-badge {
    background-color: #E5F6ED;
    border-radius: 999rpx;
    padding: 2rpx 14rpx 4rpx;
    text { font-size: 22rpx; font-weight: 500; color: #20845C; }
  }
  &__brief {
    font-size: 28rpx;
    line-height: 44rpx;
    color: #151617;
  }
  &__brief-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__brief-title { font-size: 30rpx; font-weight: 700; color: #151617; }
  &__brief-sub { display: block; margin-top: 6rpx; font-size: 26rpx; color: #747981; }

  &__msg {
    padding: 24rpx 0;
    &--line { border-top: 1rpx solid #F0F0EB; }
  }
  &__msg-time { display: block; font-size: 24rpx; color: #747981; }
  &__msg-text { display: block; margin-top: 8rpx; font-size: 28rpx; line-height: 42rpx; color: #151617; }

  &__foot-tip {
    display: block;
    margin: 0 0 20rpx; /* 横向 0：glass-footer 已含 32rpx 左右 padding（稿内容距边 16px=32rpx） */
    font-size: 24rpx;
    color: #747981;
  }
  &__foot-btns {
    display: flex;
    gap: 18rpx;
    padding: 0; /* 同 foot-tip：去重复横向内缩 */
  }
  &__btn-ghost {
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 24, 0.09);
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #151617; }
  }
  &__btn-dark {
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
  }
}
</style>
