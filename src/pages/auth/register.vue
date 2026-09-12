<template>
  <view class="page-reg page-wrap">
    <view class="status-bar" />
    <!-- Header：44 白圆钮返回 + 「注册」17 Bold 居中（1:8206 实测） -->
    <view class="page-reg__header">
      <view class="page-reg__back pressable" @click="goBack">
        <AppIcon name="back-dark" :size="20" />
      </view>
      <text class="page-reg__title">注册</text>
    </view>

    <!-- Logo 区：金块 S 64 + SLOT 40 Bold + 副题（1:8217 实测 y124） -->
    <view class="page-reg__logo">
      <view class="page-reg__logo-mark"><text>S</text></view>
      <text class="page-reg__logo-name">SLOT</text>
      <text class="page-reg__logo-sub">摄影师移动工作台</text>
    </view>

    <!-- 表单：白底输入行 327×49（1:8227 实测；+86/验证码 前缀 14 Medium，占位 #757575） -->
    <view class="page-reg__form">
      <view class="page-reg__field">
        <text class="page-reg__prefix">+86</text>
        <view class="page-reg__divider" />
        <input v-model="form.phone" class="page-reg__input" type="number" maxlength="11" placeholder="请输入手机号" placeholder-class="page-reg__ph" />
      </view>
      <view class="page-reg__field page-reg__field--gap">
        <text class="page-reg__prefix">验证码</text>
        <view class="page-reg__divider" />
        <input v-model="form.code" class="page-reg__input" type="number" maxlength="6" placeholder="请输验证码" placeholder-class="page-reg__ph" />
        <text class="page-reg__code pressable" @click="sendCode">{{ counting ? `${count}s` : '获取验证码' }}</text>
      </view>
      <view class="page-reg__field page-reg__field--gap">
        <text class="page-reg__prefix page-reg__prefix--fix">密码</text>
        <view class="page-reg__divider" />
        <input v-model="form.password" class="page-reg__input" type="password" password placeholder="设置登录密码" placeholder-class="page-reg__ph" />
      </view>

      <!-- 协议勾选（1:8242 实测：20 描边框 + 11 文案） -->
      <view class="page-reg__agree pressable" @click="form.agree = !form.agree">
        <view class="page-reg__checkbox" :class="{ 'page-reg__checkbox--on': form.agree }">
          <AppIcon v-if="form.agree" name="check-sm-dark" :size="14" />
        </view>
        <text class="page-reg__agree-text">我已阅读并同意《服务协议》和《隐私政策》</text>
      </view>
    </view>

    <!-- 注册黑胶囊 343×52（1:8212 实测 y591） -->
    <view class="page-reg__btn pressable" :class="{ 'page-reg__btn--off': !canSubmit }" @click="submit">
      <text>注册</text>
    </view>
    <text class="page-reg__login pressable" @click="goLogin">已有账号？登录</text>
  </view>
</template>

<script>
/**
 * A02 注册（稿 1:8204 实测 1:1）
 * 结构：头部 → SLOT logo 区 → 手机号/验证码/密码三行 → 协议勾选 → 黑胶囊注册 → 登录入口。
 * 稿内密码行左侧前缀为「+86」（疑复制错误，影响演示观感）——按上下文改「密码」并标注，联调评审时与用户核对。
 * 验证码「获取验证码」稿实测绿 #00B973。
 */
export default {
  name: 'AuthRegister',
  data() {
    return {
      form: { phone: '', code: '', password: '', agree: false },
      counting: false,
      count: 60,
    }
  },
  computed: {
    canSubmit() {
      return this.form.phone.length === 11 && this.form.code && this.form.password && this.form.agree
    },
  },
  methods: {
    goBack() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/login/index' }) })
    },
    goLogin() {
      uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/login/index' }) })
    },
    sendCode() {
      if (this.counting) return
      if (!/^1\d{10}$/.test(this.form.phone)) return uni.showToast({ title: '请输入正确手机号', icon: 'none' })
      this.counting = true
      this.count = 60
      const timer = setInterval(() => {
        this.count -= 1
        if (this.count <= 0) { clearInterval(timer); this.counting = false }
      }, 1000)
      uni.showToast({ title: '验证码已发送（演示）', icon: 'none' })
    },
    submit() {
      if (!this.canSubmit) return uni.showToast({ title: '请完整填写并同意协议', icon: 'none' })
      uni.navigateTo({ url: '/pages/auth/workspace' })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-reg {
  min-height: 100vh;
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

  &__logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 40rpx;
    padding-bottom: 44rpx;
  }
  &__logo-mark {
    box-sizing: border-box;
    width: 128rpx;
    height: 128rpx;
    background-color: #FFDA08;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 56rpx; font-weight: 700; color: #151617; }
  }
  &__logo-name {
    margin-top: 48rpx; /* 稿：SLOT 字形顶 223（金块底 188 + 35） */
    font-size: 80rpx;
    line-height: 96rpx;
    font-weight: 700;
    color: #151617;
    letter-spacing: 2rpx;
  }
  &__logo-sub {
    margin-top: 18rpx; /* 稿：副标 ~270 */
    font-size: 26rpx;
    color: #747881;
  }

  &__form { padding: 36rpx 48rpx 0; } /* 稿：首行输入 @y330（logo 块底 311.8 + 18） */
  &__field {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 98rpx;
    background-color: $white;
    border-radius: 32rpx; /* 稿 Rectangle45 cornerRadius 16px=32rpx */
    padding: 0 30rpx;
    &--gap { margin-top: 40rpx; }
  }
  &__prefix {
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
    width: max-content;
    flex-shrink: 0;
  }
  &__divider {
    width: 1rpx;
    height: 22rpx;
    background-color: rgba(34, 37, 42, 0.2);
    margin: 0 32rpx;
    flex-shrink: 0;
  }
  &__input { flex: 1; font-size: 28rpx; color: #151617; }
  &__ph { color: #757575; font-size: 28rpx; }
  &__code {
    font-size: 28rpx;
    font-weight: 500;
    color: #00B973;
    flex-shrink: 0;
    width: max-content;
  }

  &__agree {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-top: 20rpx; /* 稿：协议 @y527（末行输入底 517 + 10） */
  }
  &__checkbox {
    box-sizing: border-box;
    width: 40rpx;
    height: 40rpx;
    border: 1rpx solid #E8E8E3;
    border-radius: 12rpx; /* 稿 Border 20×20 cornerRadius 6px=12rpx */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: $white;
    &--on { background-color: #FFDA08; border-color: #FFDA08; }
  }
  &__agree-text { font-size: 22rpx; color: #171717; }

  &__btn {
    margin: 88rpx 32rpx 0; /* 稿：按钮 @y591 */
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #17181A;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; font-weight: 700; color: #FFFFFF; }
    &--off { opacity: 0.4; }
  }
  &__login {
    display: block;
    margin-top: 32rpx;
    text-align: center;
    font-size: 26rpx;
    color: #747881;
    padding: 2rpx 0;
  }
}
</style>
