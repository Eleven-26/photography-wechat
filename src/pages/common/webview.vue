<template>
  <web-view v-if="url" :src="url" />
  <view v-else class="page-wv">
    <text class="page-wv__tip">链接无效或已失效</text>
  </view>
</template>

<script>
/**
 * 通用 web-view 承接页 —— 小程序分享卡片的落地页
 *
 * 背景：微信小程序**不能**把外部 H5 地址直接放进 onShareAppMessage 的 path
 * （path 只能是小程序页面路径），所以「分享到微信」先把预约主页链接编码进
 * url 参数，再由本页用 <web-view> 打开，从而实现"分享卡片直接带上这条链接"。
 *
 * 使用前提：预约主页域名（服务端 share.homepage_base_url）已在小程序后台
 * 「开发管理 → 业务域名」配置并校验通过；否则 web-view 会拒绝加载。
 * H5 端本页由 uni-app 降级为 iframe，仅作兜底。
 */
export default {
  name: 'CommonWebview',
  data() {
    return {
      /** 目标地址（只放行 http/https） */
      url: '',
    }
  },
  onLoad(options) {
    const raw = options && options.url ? decodeURIComponent(options.url) : ''
    // 只接受 http(s)：避免被塞入 javascript: / data: 等伪协议
    this.url = /^https?:\/\//i.test(raw) ? raw : ''
  },
}
</script>

<style lang="scss" scoped>
.page-wv {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  &__tip {
    font-size: 28rpx;
    color: #9a9aa0;
  }
}
</style>
