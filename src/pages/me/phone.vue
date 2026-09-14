<template>
  <view class="page-ph page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「修改手机号」（11:239 实测） -->
    <view class="page-ph__header">
      <view class="page-ph__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-ph__title">修改手机号</text>
    </view>

    <!-- 账号卡 343x90：52 头像 + 昵称 + 说明 -->
    <view class="page-ph__profile">
      <view class="page-ph__avatar"><text>{{ avatarText }}</text></view>
      <view class="page-ph__profile-main">
        <text class="page-ph__profile-name">{{ displayName }}</text>
        <text class="page-ph__profile-sub">更换手机号后，登录与通知都会发到新号码</text>
      </view>
      <AppIcon name="chevron-right-gray" :size="16" />
    </view>

    <!-- 验证（y225 标题 + y256 三行） -->
    <text class="page-ph__sec">验证</text>
    <view class="page-ph__card">
      <view class="info-row page-ph__row">
        <text class="page-ph__label">当前手机号</text>
        <text class="page-ph__value">{{ mobileText }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-ph__row pressable" @click="focusCode">
        <text class="page-ph__label">短信验证码</text>
        <text class="page-ph__value page-ph__value--ph">{{ codeHint }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <view class="info-row page-ph__row pressable" @click="focusNew">
        <text class="page-ph__label">新手机号</text>
        <text class="page-ph__value page-ph__value--ph">{{ newPhone || '输入需更换的新手机号' }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 安全（y421 标题行 + 右提示 + y471 一行卡） -->
    <view class="page-ph__sec-row">
      <text class="page-ph__sec">安全</text>
      <text class="page-ph__sec-hint">验证通过后即时生效</text>
    </view>
    <view class="page-ph__card">
      <view class="info-row page-ph__row info-row--last">
        <view class="page-ph__row-icon"><AppIcon name="me-shield" :size="17" /></view>
        <view class="page-ph__row-main">
          <text class="page-ph__row-label">更换生效后</text>
          <text class="page-ph__row-sub">原手机号立即失效，需用新号重新登录</text>
        </view>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 下一步 343x52 黑胶囊（y556） -->
    <view class="page-ph__next pressable" @click="next"><text>下一步</text></view>
    <view class="page-ph__safe" />
  </view>
</template>

<script>
/**
 * ME11b 修改手机号（稿 11:239 实测 1:1）
 * 账号卡 → 验证三行（当前手机号/短信验证码/新手机号）→ 安全说明行 → 下一步黑胶囊 52。
 *
 * 数据源（2026-09-14 第六批接线）：
 *   /user/profile（当前手机号，展示脱敏）、/user/mobile-code（发码到**当前**手机号）、
 *   /user/change-mobile（body { code, new_mobile }）。
 * ⚠️ 验证码场景是 change_mobile，与登录验证码隔离；后端在「换绑」流程里先验旧号再落新号。
 * ⚠️ 换绑成功后本地登录态里的手机号不会自动刷新：需重新拉 /user/profile（本页 done 后返回上一页，
 *    上一页 onShow 会重新读取，故不额外改写本地存储）。
 */
import { getProfile, sendMobileCode, changeMobile } from '@/api/user'

export default {
  name: 'MePhone',
  data() {
    return {
      profile: null,
      code: '',
      newPhone: '',
      cooldown: 0, // 重发倒计时（秒）
      timer: null,
      submitting: false,
    }
  },
  computed: {
    displayName() {
      const p = this.profile || {}
      return p.nickname || p.username || '未命名'
    },
    avatarText() {
      return this.displayName.slice(0, 1)
    },
    mobileText() {
      const m = (this.profile && this.profile.mobile) || ''
      if (!m) return '未绑定'
      return m.length >= 7 ? `${m.slice(0, 3)}****${m.slice(-4)}` : m
    },
    codeHint() {
      if (this.code) return this.code
      if (this.cooldown > 0) return `${this.cooldown}s 后可重发`
      return '点击获取验证码'
    },
  },
  onLoad() {
    this.fetchProfile()
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async fetchProfile() {
      const res = await getProfile().catch(() => null)
      if (res) this.profile = res
    },
    goBack() {
      uni.navigateBack()
    },
    /** 点「短信验证码」行：未发码/冷却结束则先发码，再弹输入框 */
    async focusCode() {
      if (this.cooldown > 0) return this.promptCode()
      const ok = await sendMobileCode().then(() => true).catch(() => false)
      if (!ok) return
      uni.showToast({ title: '验证码已发送至当前手机号', icon: 'none' })
      this.startCooldown()
      this.promptCode()
    },
    promptCode() {
      uni.showModal({
        title: '输入短信验证码',
        editable: true,
        placeholderText: '6 位数字',
        content: this.code,
        success: (res) => {
          if (res.confirm) this.code = String(res.content || '').trim()
        },
      })
    },
    startCooldown() {
      this.cooldown = 60
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.cooldown -= 1
        if (this.cooldown <= 0) {
          clearInterval(this.timer)
          this.timer = null
        }
      }, 1000)
    },
    focusNew() {
      uni.showModal({
        title: '输入新手机号',
        editable: true,
        placeholderText: '11 位手机号',
        content: this.newPhone,
        success: (res) => {
          if (res.confirm) this.newPhone = String(res.content || '').trim()
        },
      })
    },
    async next() {
      if (this.submitting) return
      if (!this.code) return uni.showToast({ title: '请先获取并填写验证码', icon: 'none' })
      if (!/^1\d{10}$/.test(this.newPhone)) return uni.showToast({ title: '请输入正确的 11 位手机号', icon: 'none' })
      this.submitting = true
      const ok = await changeMobile(this.code, this.newPhone).then(() => true).catch(() => false)
      this.submitting = false
      if (!ok) return
      uni.showToast({ title: '手机号已更换', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 900)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ph {
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
    color: #151617;
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 20rpx 32rpx 0; /* 稿：卡 @114 */
    box-sizing: border-box;
    height: 180rpx;
    background-color: $white;
    border-radius: 32rpx;
    padding: 0 32rpx;
  }
  &__avatar {
    box-sizing: border-box;
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background-color: #161616;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 32rpx; color: #FFFFFF; }
  }
  &__profile-main { flex: 1; min-width: 0; }
  &__profile-name { display: block; font-size: 30rpx; font-weight: 500; color: #000000; }
  &__profile-sub {
    display: block;
    margin-top: 6rpx;
    font-size: 21rpx;
    color: #666666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sec { display: block; margin: 40rpx 36rpx; font-size: 30rpx; font-weight: 500; color: #1A1A1A; } /* 左右 32rpx：与卡片左缘对齐（2026-09-10 补，原缺失致贴屏边） */
  &__profile + &__sec { margin-top: 32rpx; } /* 稿：卡底 204 → 标签 225 */
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0;
    .page-ph__sec { margin: 0; } /* 行内标题清空左右 margin（sec-row 已提供边距，避免二次缩进） */
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
  }
  &__row { gap: 16rpx; }
  &__label { font-size: 28rpx; color: #666666; flex-shrink: 0; }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 26rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &--ph { color: #666666; }
  }
  &__row-icon {
    box-sizing: border-box;
    width: 68rpx;
    height: 68rpx;
    border-radius: 50%;
    background-color: #F1F1F3;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  &__row-main { flex: 1; min-width: 0; }
  &__row-label { font-size: 30rpx; color: #1A1A1A; }
  &__row-sub { display: block; margin-top: 6rpx; font-size: 21rpx; color: #666666; }

  &__next {
    box-sizing: border-box;
    margin: 40rpx 32rpx 0;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #FFFFFF; }
  }

  &__safe { height: 60rpx; }
}
</style>
