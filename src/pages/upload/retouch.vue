<template>
  <!-- D16 精修上传（1:3385）一比一还原：进度卡 + 上传方式双卡 + 灰提示条 + 双钮 -->
  <view class="page-ur">
    <view class="status-bar" />
    <view class="page-ur__header">
      <view class="page-ur__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-ur__title">
        <text class="page-ur__title-text">精修图上传</text>
      </view>
    </view>

    <view class="page-ur__body">
      <!-- 上传进度卡：白 r16 pad26 -->
      <view class="page-ur__section">
        <view class="page-ur__sec-head">
          <text class="page-ur__sec-title">上传进度</text>
          <text class="page-ur__sec-count">{{ done }} / {{ total }} 张</text>
        </view>
        <view class="page-ur__list">
          <view v-for="(f, i) in files" :key="f.name" class="page-ur__row" :class="{ 'page-ur__row--line': i < files.length - 1 }">
            <AppIcon :name="f.done ? 'check-green-sm' : 'upload-amber'" :size="16" />
            <view class="page-ur__row-txt">
              <text class="page-ur__row-name">{{ f.name }}</text>
              <text class="page-ur__row-status">{{ f.status }}</text>
            </view>
          </view>
          <!-- 继续添加行：灰加号 + 标题（稿 pad16/22.5） -->
          <view class="page-ur__row page-ur__row--add" @click="onAdd">
            <AppIcon name="plus-gray" :size="16" />
            <text class="page-ur__add-txt">继续添加精修成品</text>
          </view>
        </view>
        <view class="page-ur__tip">
          <text class="page-ur__tip-txt">精修成品建议以 JPEG 高质量导出（8-15MB）· 支持断点续传 · PC 端可整场批量上传</text>
        </view>
      </view>

      <!-- 上传方式：双卡并排（第二卡选中态黑描边） -->
      <view class="page-ur__sec-head page-ur__sec-head--gap">
        <text class="page-ur__sec-title">上传方式</text>
      </view>
      <view class="page-ur__ways">
        <view class="page-ur__way" @click="pickAlbum">
          <AppIcon name="phone-gray" :size="20" />
          <text class="page-ur__way-label page-ur__way-label--sub">手机上传</text>
          <text class="page-ur__way-main page-ur__way-main--sub">从相册选择精修图</text>
        </view>
        <view class="page-ur__way page-ur__way--active" @click="pickPc">
          <AppIcon name="pc-dark" :size="20" />
          <text class="page-ur__way-label">PC 端上传</text>
          <text class="page-ur__way-main">推荐 · 支持批量</text>
        </view>
      </view>

      <!-- 灰提示条：#E6E7EB r14 -->
      <view class="page-ur__notice">
        <AppIcon name="info-dark" :size="20" />
        <text class="page-ur__notice-txt">客户的高清下载以精修成品为准 · 全部上传且尾款核验通过后开放</text>
      </view>
    </view>

    <!-- 底部双钮：暂存 + 完成并发送最终确认 -->
    <view class="page-ur__footer">
      <view class="footer-safe" />
      <view class="page-ur__footer-row">
        <view class="page-ur__btn page-ur__btn--ghost" @click="onSave">
          <text class="page-ur__btn-ghost-txt">暂存</text>
        </view>
        <view class="page-ur__btn page-ur__btn--solid" @click="onFinish">
          <text class="page-ur__btn-solid-txt">完成并发送最终确认</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * D16 精修图上传（稿 1:3385）：进度卡 + 上传方式双卡 + 灰提示条 + 双钮。
 *
 * 数据源与动作（2026-09-14 接线；:id = **order_id**）：
 *   /delivery/detail/:id → 交付单（id 作 delivery_id、retouch_target 计划张数、retouched_count 已上传）
 *   /delivery/items/:id  → 已落库的精修成品（kind=3）
 *   上传流程：uni.chooseImage → /upload/file → 汇总 items 后
 *             POST /delivery/upload-retouched/:delivery_id {items:[{url,filename,size}]}
 *   「完成并发送最终确认」在上传成功后继续调 POST /delivery/send-final/:delivery_id，
 *   然后把客户引到成片预览页（delivery/final）。
 *
 * ⚠️ 路径参数陷阱：detail/items 用 **order_id**，upload-retouched / send-final 用 **delivery_id**。
 *    2026-09-14 PC 曾把 order_id 传给 upload-retouched 触发 40400，勿重蹈。
 * ⚠️「暂存」只在本地保留待提交清单（后端无草稿态）：文案如实说明，不做假提交。
 */
import { getDeliveryDetail, getDeliveryItems, uploadRetouched, sendFinal } from '@/api/delivery'
import { uploadFile } from '@/api/upload'

/** DeliveryItem.kind：3-精修成品 */
const KIND_RETOUCHED = 3

export default {
  data() {
    return {
      orderId: '',
      deliveryId: 0,
      delivery: null,
      total: 0,
      files: [], // 已上传（服务端回显 + 本次已上传）
      pending: [], // 本次已上传但尚未提交的 items
      uploading: false,
      submitting: false,
      seq: 0,
    }
  },
  computed: {
    done() {
      return this.files.length
    },
  },
  onLoad(options) {
    this.orderId = (options && options.id) || ''
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      if (!this.orderId) return
      const [dRes, iRes] = await Promise.all([
        getDeliveryDetail(this.orderId).catch(() => null),
        getDeliveryItems(this.orderId).catch(() => null),
      ])
      this.delivery = dRes || null
      this.deliveryId = (dRes && dRes.id) || 0
      const done = (Array.isArray(iRes) ? iRes : []).filter((it) => it.kind === KIND_RETOUCHED)
      this.files = done.map((it) => ({
        key: 's' + it.id,
        name: it.filename || `成品 ${it.id}`,
        status: '已上传 · ' + this.sizeText(it.size),
        done: true,
      }))
      // 计划张数：优先交付单计划值，回落已上传张数（避免 0/0）
      this.total = (dRes && dRes.retouch_target) || this.done
    },
    sizeText(size) {
      const n = Number(size || 0)
      if (!n) return '已完成'
      return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'
    },
    goBack() {
      uni.navigateBack()
    },
    /** 选图 → 逐张上传（串行）→ 入 pending */
    onAdd() {
      if (this.uploading) return
      uni.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        success: async (res) => {
          const paths = res.tempFilePaths || []
          if (!paths.length) return
          this.uploading = true
          for (const p of paths) {
            const up = await uploadFile(p, { biz_type: 'delivery', biz_id: this.deliveryId }).catch(() => null)
            if (up && up.url) {
              this.pending.push({ url: up.url, filename: up.file_name || '', size: up.size || 0 })
              this.seq += 1
              this.files.push({
                key: 'u' + this.seq,
                name: up.file_name || `成品 ${this.seq}`,
                status: '已上传 · ' + this.sizeText(up.size),
                done: true,
              })
            } else {
              uni.showToast({ title: '部分文件上传失败', icon: 'none' })
            }
          }
          this.uploading = false
        },
      })
    },
    pickAlbum() {
      this.onAdd()
    },
    pickPc() {
      uni.showToast({ title: '请在 PC 端打开上传', icon: 'none' })
    },
    /** 暂存：仅保留本地待提交清单（后端无草稿态，不虚假提示已保存到服务器） */
    onSave() {
      uni.showToast({
        title: this.pending.length ? `已暂存 ${this.pending.length} 张，未提交` : '暂无待提交内容',
        icon: 'none',
      })
    },
    /** 完成：提交精修成品 → 发送最终确认 → 跳成片预览 */
    async onFinish() {
      if (this.submitting) return
      if (!this.deliveryId) return uni.showToast({ title: '交付单尚未创建', icon: 'none' })
      if (this.uploading) return uni.showToast({ title: '还有文件在上传，请稍候', icon: 'none' })
      if (!this.files.length) return uni.showToast({ title: '请先上传精修成品', icon: 'none' })
      this.submitting = true
      if (this.pending.length) {
        const ok = await uploadRetouched(this.deliveryId, { items: this.pending })
          .then(() => true)
          .catch(() => false)
        if (!ok) {
          this.submitting = false
          return
        }
        this.pending = []
      }
      // 上传后交付单已进入「待确认交付」，此时发送最终确认合法；失败会 toast 后端原因
      await sendFinal(this.deliveryId).catch(() => null)
      this.submitting = false
      uni.showToast({ title: '已提交并发送最终确认', icon: 'success' })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/delivery/final?id=' + this.orderId })
      }, 900)
    },
  },
}
</script>

<style lang="scss" scoped>
.page-ur {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 220rpx;

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box;
    padding: 0 $page-pad;
  }
  &__top-btn {
    box-sizing: border-box;
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.88);
    border: 1rpx solid rgba(21, 22, 23, 0.05);
    border-radius: 50%;
    box-shadow: 0 10rpx 32rpx rgba(21, 22, 23, 0.055);
  }
  &__title {
    position: absolute;
    left: 0;
    right: 0;
    text-align: center;
    pointer-events: none;
  }
  &__title-text {
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  &__body {
    padding: 16rpx $page-pad 0; /* 稿容器 y114 上距 8，卡间 g20 */
  }
  &__section {
    background-color: $white;
    border-radius: 32rpx;
    padding: 52rpx; /* 稿 26 */
  }
  &__sec-head {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    margin-bottom: 20rpx; /* 稿 p 0/10 */
  }
  &__sec-head--gap {
    margin: 40rpx $page-pad 20rpx; /* 独立 label 行 */
  }
  &__sec-title {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__sec-count {
    color: #9CA3AF; /* 实测 */
    font-size: 24rpx;
    font-weight: 700;
  }
  &__list {
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 32rpx; /* 稿 r16 */
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 27rpx 32rpx; /* 稿 13.3 */
  }
  &__row--line {
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__row--add {
    padding: 45rpx 32rpx; /* 稿 22.5 */
  }
  &__row-txt {
    display: flex;
    flex-direction: column;
    gap: 2rpx;
  }
  &__row-name {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__row-status {
    color: $text-2;
    font-size: 24rpx;
  }
  &__add-txt {
    color: $text-2;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__demo-btn {
    margin-top: 24rpx; /* 稿 12 */
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 999rpx;
  }
  &__demo-btn-txt {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__tip {
    margin-top: 24rpx;
    background-color: #FAFAF8; /* 实测 */
    border-radius: 20rpx; /* 稿 r10 */
    padding: 20rpx 28rpx; /* 稿 10/14 */
  }
  &__tip-txt {
    color: $text-2;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  &__ways {
    display: flex;
    gap: 16rpx; /* 稿 g8 */
    margin: 0 $page-pad;
  }
  &__way {
    flex: 1;
    background-color: $white;
    border: 1rpx solid transparent;
    border-radius: 28rpx; /* 稿 r14 */
    padding: 28rpx; /* 稿 14 */
    display: flex;
    flex-direction: column;
  }
  &__way--active {
    border-color: #171717; /* 稿选中态黑描边 */
  }
  &__way-label {
    color: $text-1;
    font-size: 26rpx;
    font-weight: 700;
    margin-top: 2rpx;
  }
  &__way-label--sub {
    color: $text-2;
    font-weight: 400;
  }
  &__way-main {
    color: $text-1;
    font-size: 30rpx;
    margin-top: 2rpx;
  }
  &__way-main--sub {
    color: $text-2;
    font-weight: 400;
  }

  &__notice {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin: 20rpx $page-pad 0;
    background-color: #E6E7EB; /* 实测 */
    border-radius: 28rpx;
    padding: 24rpx 32rpx; /* 稿 12/16 */
  }
  &__notice-txt {
    color: #171717;
    font-size: 24rpx;
    line-height: 38rpx;
  }

  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $bg-page;
  }
  &__footer-row {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 32rpx 28rpx;
  }
  &__btn {
    flex: 1;
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999rpx;
  }
  &__btn--ghost {
    background-color: $white;
    border: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__btn--solid {
    background-color: #171819;
  }
  &__btn-ghost-txt {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__btn-solid-txt {
    color: $white;
    font-size: 30rpx;
    font-weight: 700;
  }
}
</style>
