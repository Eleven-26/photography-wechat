<template>
  <view class="page-wrap login">
    <!-- 品牌区（结构 1:1 对齐客户端登录页，浅色 token 适配；slogan 改摄影师口径） -->
    <view class="login__brand">
      <text class="login__logo">SLOT</text>
      <text class="login__slogan">摄影师工作台</text>
    </view>

    <!-- 表单区：账号 + 密码（与 PC 后台同口径；手机验证码 / 微信授权登录为预留方式） -->
    <view class="login__form">
      <view class="login__field">
        <input
          v-model="form.username"
          class="login__input"
          type="text"
          maxlength="50"
          placeholder="账号"
          placeholder-class="login__placeholder"
          @confirm="onLogin"
        />
      </view>

      <view class="login__field">
        <input
          v-model="form.password"
          class="login__input"
          type="password"
          password
          maxlength="32"
          placeholder="密码"
          placeholder-class="login__placeholder"
          @confirm="onLogin"
        />
      </view>

      <!-- 登录按钮：黑胶囊主钮（摄影师端 $btn-primary）；提交中 loading 防重复 -->
      <AppButton class="login__btn" :loading="submitting" @click="onLogin">登 录</AppButton>

      <!-- 账号说明：员工账号由管理员在后台创建，无自助注册 / 找回密码入口 -->
      <text class="login__agreement">账号由工作室管理员创建；忘记密码请联系管理员重置</text>
    </view>
  </view>
</template>

<script>
/**
 * 摄影师端登录 —— 结构 1:1 平移客户端登录页（客户端已验收稿），浅色 token 适配
 *
 * 登录方式（2026-09-14 调整）：**账号 + 密码**，与 PC 后台同口径 ——
 *   后端两端共用同一套凭据校验与失败锁定（IP 10 次 / 账号 5 次，各锁 15 分钟）。
 *   原「手机号 + 验证码」登录退为预留：接口在 api/auth.js 中保留（发码 + 验证码登录成对），
 *   将来与「微信授权登录」一并接入，届时本页需加登录方式切换。
 * 摄影师身份由后端 token 角色区分（响应含 role_code / permissions）。
 * 错误处理：校验失败仅提示，绝不清空已输入内容。
 * 接口：api/auth.js（loginByPassword）。
 */
import { loginByPassword } from '@/api/auth'
import { useUserStore } from '@/stores/user'

export default {
  data() {
    return {
      form: { username: '', password: '' },
      submitting: false,
    }
  },
  methods: {
    async onLogin() {
      const username = this.form.username.trim()
      if (!username) return uni.showToast({ title: '请输入账号', icon: 'none' })
      if (!this.form.password) return uni.showToast({ title: '请输入密码', icon: 'none' })
      if (this.submitting) return

      this.submitting = true
      try {
        /* 摄影师角色由后端 token 判定；user 结构与 PC 一致（含 role_code / permissions） */
        const data = await loginByPassword(username, this.form.password)
        useUserStore().login(data.token, data.user || {})
        uni.reLaunch({ url: '/pages/order/list' })
      } catch {
        // 错误提示由 request 层统一 toast（后端统一文案「账号或密码错误」，不泄露账号是否存在）；输入保留不清空
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.login {
  padding-top: 200rpx;
  &__brand { text-align: center; }
  &__logo {
    font-size: 96rpx;
    font-weight: 700;
    color: $gold;
    letter-spacing: 8rpx;
  }
  &__slogan {
    display: block;
    margin-top: 16rpx;
    color: $text-2;
    font-size: $fs-md;
  }
  &__form { margin: 120rpx $page-pad 0; }
  &__field {
    display: flex;
    align-items: center;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: $radius-cell;
    padding: 0 32rpx;
    height: $touch-min;
    margin-bottom: $touch-gap + 8rpx;
  }
  &__input {
    flex: 1;
    color: $text-1;
    font-size: $fs-lg;
    height: 100%;
  }
  &__placeholder { color: $text-disabled; }
  &__btn { margin-top: 64rpx; width: 100%; }
  &__agreement {
    display: block;
    margin-top: 32rpx;
    color: $text-2;
    font-size: $fs-xs;
    text-align: center;
    line-height: 1.7;
  }
}
</style>
