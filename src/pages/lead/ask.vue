<template>
  <view class="page-ask page-wrap has-footer">
    <view class="status-bar" />
    <!-- Header：返回 + 「一键追问」（1:8041 实测） -->
    <view class="page-ask__header">
      <view class="page-ask__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-ask__title">一键追问</text>
    </view>

    <text class="page-ask__h1">发送前确认</text>
    <text class="page-ask__desc">3 条问题将一次性发给客户，发送前可直接修改，取消勾选则不发送该条</text>

    <!-- 三张问题卡：右上勾选框（选中黑底白勾/未选灰底描边），灰底问题框 + 换一条（1:14 Group 66 实测 343×172） -->
    <view v-for="(q, idx) in questions" :key="q.id" class="page-ask__card">
      <view class="page-ask__head">
        <view class="page-ask__num"><text>{{ idx + 1 }}</text></view>
        <text class="page-ask__qtitle">{{ q.title }}</text>
        <view class="page-ask__badge" :class="q.impact === 'quote' ? 'page-ask__badge--quote' : 'page-ask__badge--sched'">
          <text>{{ q.impact === 'quote' ? '影响报价' : '影响排期' }}</text>
        </view>
        <view class="page-ask__check pressable" :class="{ 'page-ask__check--on': q.checked }" @click="q.checked = !q.checked">
          <AppIcon v-if="q.checked" name="check-sm" :size="12" />
        </view>
      </view>
      <view class="page-ask__qbox">
        <text class="page-ask__qbox-text">{{ q.text }}</text>
      </view>
      <view class="page-ask__foot">
        <AppIcon name="star" :size="10" />
        <text class="page-ask__ai-tag">AI 生成 · 点击文本可直接修改</text>
        <view class="page-ask__refresh pressable" @click="refresh(idx)">
          <AppIcon name="refresh-xs" :size="14" />
          <text>换一条</text>
        </view>
      </view>
    </view>
    <AppEmpty v-if="!loading && !questions.length" text="暂无待追问项" />

    <!-- 底部毛玻璃栏：提示 + 返回 + 一键发送（1:70 实测） -->
    <view class="glass-footer">
      <text class="page-ask__foot-tip">已勾选 {{ checkedCount }} 条 · 客户逐题回复后简报自动更新</text>
      <view class="page-ask__foot-btns">
        <view class="page-ask__btn-ghost pressable" @click="goBack">
          <text>返回</text>
        </view>
        <view class="page-ask__btn-dark pressable" @click="sendAll">
          <text>一键发送</text>
        </view>
      </view>
    </view>
    <view class="page-ask__safe" />
  </view>
</template>

<script>
/**
 * L04 一键追问（稿 1:8041 实测 1:1）
 * 发送前确认：三卡可勾选（取消勾选不发送）、问题文本可改、「换一条」换话术。
 * 勾选框实测：选中黑底白勾 20×20 / 未选 #F2F3F5 描边 #B7B7B7。
 *
 * 数据源（2026-09-14 接线）：/brief/list/:lead_id 的待追问项（status=1）。
 *   title ← 摘要项标题；text ← AI 问题（question，空则退回 ai_suggestion）；
 *   impact ← affects_pricing（1=影响报价 / 0=影响排期）。
 *   「换一条」在后端给的两条候选（question / ai_suggestion）间切换，不重新请求。
 *   发送走 /brief/send/:id（把该条追问推给客户，状态 1→2）。
 */
import { listBriefs, sendBrief } from '@/api/lead'

export default {
  name: 'LeadAsk',
  data() {
    return {
      leadId: '',
      questions: [],
      loading: false,
      sending: false,
    }
  },
  computed: {
    checkedCount() {
      return this.questions.filter((q) => q.checked).length
    },
  },
  onLoad(query) {
    this.leadId = (query && query.id) || ''
    this.fetchBriefs()
  },
  methods: {
    async fetchBriefs() {
      if (!this.leadId) return
      this.loading = true
      try {
        const items = await listBriefs(this.leadId).catch(() => [])
        const list = Array.isArray(items) ? items : (items && items.list) || []
        this.questions = list
          .filter((it) => Number(it.status) === 1)
          .map((it) => ({
            id: it.id,
            title: it.title,
            impact: Number(it.affects_pricing) === 1 ? 'quote' : 'sched',
            checked: true,
            text: it.question || it.ai_suggestion || '',
            alt: it.ai_suggestion || '',
          }))
      } finally {
        this.loading = false
      }
    },
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/lead/ai-brief' }) })
    },
    /** 换一条：在「AI 问题」与「AI 建议话术」间切换（后端仅提供这两条候选） */
    refresh(idx) {
      const q = this.questions[idx]
      if (!q || !q.alt || q.alt === q.text) return
      const cur = q.text
      q.text = q.alt
      q.alt = cur
    },
    async sendAll() {
      if (!this.checkedCount) return uni.showToast({ title: '请至少勾选一条问题', icon: 'none' })
      if (this.sending) return
      this.sending = true
      try {
        const picked = this.questions.filter((q) => q.checked)
        const results = await Promise.all(
          picked.map((q) => sendBrief(q.id).then(() => true).catch(() => false))
        )
        const ok = results.filter(Boolean).length
        if (!ok) {
          uni.showToast({ title: '发送失败，请重试', icon: 'none' })
          return
        }
        uni.showToast({ title: `已发送 ${ok} 条追问`, icon: 'success' })
        setTimeout(
          () => uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/lead/ai-brief' }) }),
          900
        )
      } finally {
        this.sending = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ask {
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

  &__h1 {
    display: block;
    margin: 20rpx 32rpx 0;
    font-size: 36rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #151617;
  }
  &__desc {
    display: block;
    margin: 20rpx 32rpx 0; /* 稿：说明 @144（标题 114+20+10） */
    font-size: 24rpx;
    line-height: 40rpx;
    font-weight: 700;
    color: #666666;
  }

  &__card {
    margin: 40rpx 32rpx 0; /* 稿：卡1 @204（说明底 184 + 20） */
    & + & { margin-top: 20rpx; } /* 稿：卡间距 10（pitch 182） */
    background-color: $white;
    border-radius: 32rpx;
    padding: 32rpx;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 24, 0.055);
  }
  &__head {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  &__num {
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
  &__qtitle {
    font-size: 30rpx;
    font-weight: 700;
    color: #000000;
    width: max-content;
    flex-shrink: 0;
  }
  &__badge {
    border-radius: 8rpx;
    padding: 2rpx 10rpx 4rpx;
    text { font-size: 20rpx; font-weight: 500; }
    &--quote { background-color: #FEF3C7; text { color: #B66E00; } }
    &--sched { background-color: #DBEAFE; text { color: #2D69EC; } }
  }
  &__check {
    margin-left: auto;
    box-sizing: border-box;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%; /* 稿 20×20 cornerRadius 20px 全圆（L04 1:8074 实测） */
    background-color: #F2F3F5;
    border: 1rpx solid #B7B7B7;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    &--on { background-color: #000000; border-color: #000000; }
  }

  &__qbox {
    margin-top: 24rpx;
    background-color: #F2F3F5;
    border-radius: 16rpx;
    padding: 30rpx 32rpx; /* 稿 1:8041 Rectangle102 灰问题框 311×72px(144rpx)：内容 2×42rpx + 上下 30rpx = 144rpx */
  }
  &__qbox-text {
    font-size: 28rpx;
    font-weight: 500;
    line-height: 48rpx; /* 稿 Rectangle102 311×72px：2 行 ×24px 行高 + 上下 padding 24rpx×2 = 72px（原 42rpx 仅约 66px） */
    color: #333333;
  }
  &__foot {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 24rpx;
    padding-left: 12rpx;
  }
  &__ai-tag { font-size: 22rpx; font-weight: 500; color: #999999; }
  &__refresh {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8rpx;
    text { font-size: 24rpx; font-weight: 500; color: #333333; }
  }

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

  &__safe { height: 40rpx; }
}
</style>
