<template>
  <view class="page-hs page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 「主页标识」 -->
    <view class="page-hs__header">
      <view class="page-hs__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-hs__title">主页标识</text>
    </view>

    <!-- 标识输入 -->
    <view class="page-hs__card">
      <text class="page-hs__label">主页标识</text>
      <input
        v-model="slug"
        class="page-hs__input"
        type="text"
        placeholder="如 lu-studio"
        placeholder-class="page-hs__ph"
        :maxlength="50"
      />
      <text class="page-hs__hint">客户打开你的链接后，系统据此定位你的工作室。仅支持小写字母、数字与连字符，2–50 位。</text>
    </view>

    <!-- 链接预览 -->
    <view class="page-hs__card">
      <text class="page-hs__label">链接预览</text>
      <text class="page-hs__url">{{ previewUrl || '保存后自动生成完整链接' }}</text>
      <text class="page-hs__hint">域名由服务端下发，换域名只需改服务端配置，不必重新发布小程序。</text>
    </view>

    <view class="page-hs__save pressable" :class="{ 'page-hs__save--busy': saving }" @click="save">
      <text>{{ saving ? '保存中…' : '保存' }}</text>
    </view>
    <view class="page-hs__safe" />
  </view>
</template>

<script>
import { getStudioSettings, updateStudioSettings } from '@/api/settings'

/**
 * ME 主页标识设置
 *
 * 预约主页链接 = 服务端基址 + ?slug=<本标识>&staff_id=<我的账号id>（见 dto.NewStaffStudioSettingResp）。
 * 标识为空时整条链接返回空串，员工端「我的预约主页」会显示「主页标识未设置」——
 * 本页是该标识的员工端自助入口（服务端在标识为空时会按公司 ID 兜底生成，这里做人工覆盖）。
 *
 * 保存走 studio/update（需 settings:update 权限），格式约束与服务端
 * service.NormalizeHomepageSlug 一致：小写字母 / 数字 / 连字符，首字符非连字符。
 */
export default {
  name: 'MeHomepageSetting',
  data() {
    return {
      /** 当前输入的标识 */
      slug: '',
      /** 服务端下发的完整链接（含旧标识），用于预览与基线比对 */
      shareUrl: '',
      saving: false,
    }
  },
  computed: {
    /** 预览链接：把服务端基址里的 slug 换成当前输入，编辑时即时可见 */
    previewUrl() {
      const s = String(this.slug || '')
        .trim()
        .toLowerCase()
      if (!this.shareUrl) return ''
      if (!s) return this.shareUrl
      return this.shareUrl.replace(/([?&]slug=)[^&]*/, `$1${s}`)
    },
  },
  onLoad() {
    this.load()
  },
  methods: {
    async load() {
      try {
        const st = await getStudioSettings({ loading: false, silent: true })
        this.slug = (st && st.homepage_slug) || ''
        this.shareUrl = (st && st.homepage_url) || ''
      } catch {
        // 静默失败：保留默认空值，用户可继续输入
      }
    },
    goBack() {
      uni.navigateBack()
    },
    async save() {
      const slug = String(this.slug || '')
        .trim()
        .toLowerCase()
      if (slug.length < 2 || slug.length > 50) {
        uni.showToast({ title: '长度需为 2–50 位', icon: 'none' })
        return
      }
      if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
        uni.showToast({ title: '仅小写字母、数字与连字符', icon: 'none' })
        return
      }
      if (this.saving) return
      this.saving = true
      try {
        await updateStudioSettings({ homepage_slug: slug })
        uni.showToast({ title: '已保存', icon: 'success' })
        // 返回上一页；「我的预约主页」/「我的」在 onShow 会重新拉取，链接自动刷新
        setTimeout(() => uni.navigateBack(), 600)
      } catch {
        // 请求层已按后端 msg 弹提示，此处不重复
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.page-hs {
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
    color: #1a1a1a;
  }

  &__card {
    margin: 20rpx 32rpx 0;
    background-color: $white;
    border-radius: 32rpx;
    padding: 32rpx;
  }
  &__label {
    display: block;
    font-size: 30rpx;
    font-weight: 500;
    color: #1a1a1a;
  }
  &__input {
    box-sizing: border-box;
    height: 88rpx;
    margin-top: 20rpx;
    padding: 0 24rpx;
    background-color: #f1f1f3;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #1a1a1a;
  }
  &__ph {
    color: #9a9aa0;
  }
  &__url {
    display: block;
    margin-top: 20rpx;
    font-size: 24rpx;
    line-height: 36rpx;
    color: #666666;
    word-break: break-all;
  }
  &__hint {
    display: block;
    margin-top: 16rpx;
    font-size: 22rpx;
    line-height: 34rpx;
    color: #9a9aa0;
  }

  &__save {
    box-sizing: border-box;
    height: 96rpx;
    margin: 48rpx 32rpx 0;
    border-radius: 999rpx;
    background-color: #161616;
    display: flex;
    align-items: center;
    justify-content: center;
    &--busy {
      opacity: 0.6;
    }
    text {
      font-size: 30rpx;
      font-weight: 500;
      color: $white;
    }
  }
  &__safe {
    height: calc(60rpx + env(safe-area-inset-bottom));
  }
}
</style>
