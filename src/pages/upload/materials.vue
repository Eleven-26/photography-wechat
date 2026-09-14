<template>
  <!-- D07 上传素材（1:7639）一比一还原：进度环卡 + 文件列表卡 + 双钮底栏 -->
  <view class="page-um">
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0) -->
    <view class="status-bar" />
    <view class="page-um__header">
      <view class="page-um__top-btn" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <view class="page-um__title">
        <text class="page-um__title-text">上传素材</text>
      </view>
    </view>

    <view class="page-um__body">
      <!-- 进度卡：白 r16 pad26，120 圆环位 + 计数 + 进度条 -->
      <view class="page-um__section">
        <view class="page-um__ring">
          <view class="page-um__ring-num">
            <text class="page-um__pct">{{ progress }}</text>
            <text class="page-um__pct-sign">%</text>
          </view>
          <text class="page-um__ring-label">{{ uploading ? '上传中' : '已完成' }}</text>
        </view>
        <view class="page-um__count">
          <text class="page-um__count-num">{{ done }} / {{ total }} 张</text>
        </view>
        <text class="page-um__caption">已自动压缩为预览图 · 支持断点续传</text>
        <view class="page-um__track">
          <view class="page-um__track-fill" :style="{ width: progress + '%' }" />
        </view>
        <!-- 文件列表：白底 r20 描边 9%，行 pad16/13.3 + hairline -->
        <view class="page-um__list">
          <view v-for="f in files" :key="f.key" class="page-um__row">
            <AppIcon :name="f.done ? 'check-green-sm' : 'upload-amber'" :size="16" />
            <view class="page-um__row-txt">
              <text class="page-um__row-name">{{ f.name }}</text>
              <text class="page-um__row-status">{{ f.status }}</text>
            </view>
          </view>
          <view class="page-um__row page-um__row--last pressable" @click="pickFiles">
            <AppIcon name="plus-gray" :size="16" />
            <view class="page-um__row-txt">
              <text class="page-um__row-name">继续添加素材</text>
              <text class="page-um__row-status">已自动压缩为预览图 · 可多选</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部双钮：稿 y640，ghost 白描边 + solid 黑胶囊，h52 -->
    <view class="page-um__footer">
      <view class="footer-safe" />
      <view class="page-um__footer-row">
        <view class="page-um__btn page-um__btn--ghost" @click="togglePause">
          <text class="page-um__btn-ghost-txt">{{ paused ? '继续上传' : '暂停上传' }}</text>
        </view>
        <view class="page-um__btn page-um__btn--solid" @click="goSelect">
          <text class="page-um__btn-solid-txt">进入选片</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * D07 上传素材（稿 1:7639）：进度环卡 + 文件列表卡 + 双钮底栏。
 *
 * 数据源与动作（2026-09-14 接线；:id = **order_id**）：
 *   /delivery/detail/:id → 交付单（取 id 作 delivery_id，后续上传接口都用它）
 *   /delivery/items/:id  → 已在服务端的样片（kind=1），作为「已完成」列表回显
 *   上传流程：uni.chooseImage → /upload/file（换 URL）→ 汇总 items 后
 *             POST /delivery/upload-samples/:delivery_id {items:[{url,filename,size}]}
 *
 * ⚠️ 路径参数陷阱：detail/items 用 **order_id**，upload-samples 用 **delivery_id**。
 *    本页先查交付单拿到 delivery.id 再上传，绝不能把 order_id 传进去（后端 40400）。
 * ⚠️ 上传是**串行队列**：小程序并发上传易被限流，且串行才能让「暂停/继续」有意义
 *    （暂停 = 队列停在前一张与后一张之间，不是中断请求本身）。
 */
import { getDeliveryDetail, getDeliveryItems, uploadSamples } from '@/api/delivery'
import { uploadFile } from '@/api/upload'

/** DeliveryItem.kind：1-样片 2-已选 3-精修成品 */
const KIND_SAMPLE = 1

export default {
  data() {
    return {
      orderId: '',
      deliveryId: 0,
      delivery: null,
      files: [], // 已完成（服务端回显 + 本次已上传）
      pending: [], // 本次已上传但尚未提交给上传接口的 items
      queue: [], // 待上传的本地临时路径
      uploading: false,
      paused: false,
      seq: 0, // 列表 key 自增序号
    }
  },
  computed: {
    total() {
      return this.files.length + this.queue.length
    },
    done() {
      return this.files.length
    },
    progress() {
      return this.total ? Math.round((this.done / this.total) * 100) : 0
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
      const samples = (Array.isArray(iRes) ? iRes : []).filter((it) => it.kind === KIND_SAMPLE)
      this.files = samples.map((it) => ({
        key: 's' + it.id,
        name: it.filename || `样片 ${it.id}`,
        status: '已完成 · ' + this.sizeText(it.size),
        done: true,
      }))
    },
    sizeText(size) {
      const n = Number(size || 0)
      if (!n) return '已完成'
      return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'
    },
    goBack() {
      uni.navigateBack()
    },
    /** 选片 → 入队 → 启动串行上传泵 */
    pickFiles() {
      uni.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        success: (res) => {
          const paths = res.tempFilePaths || []
          if (!paths.length) return
          this.queue = this.queue.concat(paths)
          this.pump()
        },
      })
    },
    async pump() {
      if (this.uploading) return
      this.uploading = true
      while (this.queue.length) {
        if (this.paused) {
          await new Promise((r) => setTimeout(r, 300))
          continue
        }
        const path = this.queue.shift()
        const up = await uploadFile(path, { biz_type: 'delivery', biz_id: this.deliveryId }).catch(() => null)
        if (up && up.url) {
          this.pending.push({ url: up.url, filename: up.file_name || '', size: up.size || 0 })
          this.seq += 1
          this.files.push({
            key: 'u' + this.seq,
            name: up.file_name || `素材 ${this.seq}`,
            status: '已完成 · ' + this.sizeText(up.size),
            done: true,
          })
        } else {
          this.seq += 1
          this.files.push({ key: 'f' + this.seq, name: '上传失败', status: '请重新选择该文件', done: false })
        }
      }
      this.uploading = false
      this.paused = false
    },
    togglePause() {
      if (!this.queue.length) return uni.showToast({ title: '没有待上传的文件', icon: 'none' })
      this.paused = !this.paused
      if (!this.paused) this.pump()
      uni.showToast({ title: this.paused ? '已暂停' : '继续上传', icon: 'none' })
    },
    /** 进入选片：先把本次新上传的样片提交到交付单（空则跳过） */
    async goSelect() {
      if (!this.deliveryId) return uni.showToast({ title: '交付单尚未创建', icon: 'none' })
      if (!this.files.length) return uni.showToast({ title: '请先选择要上传的素材', icon: 'none' })
      if (this.queue.length) return uni.showToast({ title: '还有文件在上传，请稍候', icon: 'none' })
      if (this.pending.length) {
        const ok = await uploadSamples(this.deliveryId, { items: this.pending })
          .then(() => true)
          .catch(() => false)
        if (!ok) return
        this.pending = []
      }
      uni.navigateTo({ url: '/pages/select/result?id=' + this.orderId })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-um {
  min-height: 100vh;
  background-color: $bg-page;

  &__header {
    position: relative; /* 标题绝对居中（全站规范） */
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box; /* 稿 60 高，按钮/标题垂直居中 */
    padding: 0 $page-pad;
  }
  &__top-btn {
    box-sizing: border-box; /* 稿 44 含描边 */
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
    text-align: center; /* 头部标题水平居中（用户定稿） */
    pointer-events: none;
  }
  &__title-text {
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  &__body {
    padding: 10rpx $page-pad 0; /* 稿容器 y114，上内距 10 */
  }
  &__section {
    background-color: $white;
    border-radius: 32rpx; /* 稿 r16 */
    padding: 52rpx; /* 稿 pad 26 */
  }
  &__ring {
    width: 240rpx; /* 稿 120 */
    height: 240rpx;
    border-radius: 50%;
    background-color: $white;
    border: 1rpx solid #E1E1E1; /* 实测 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rpx;
  }
  &__ring-num {
    display: flex;
    align-items: baseline;
  }
  &__pct {
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }
  &__pct-sign {
    color: $text-1;
    font-size: 32rpx;
    font-weight: 700;
  }
  &__ring-label {
    color: $text-2;
    font-size: 30rpx;
  }
  &__count {
    margin-top: 32rpx; /* 稿 Margin top16 + 文字 1/3 */
  }
  &__count-num {
    color: $text-1;
    font-size: 32rpx;
    font-weight: 700;
  }
  &__caption {
    display: block;
    margin-top: 2rpx;
    color: $text-2;
    font-size: 26rpx;
    line-height: 40rpx;
  }
  &__track {
    margin-top: 48rpx; /* 稿 Margin 24 */
    height: 16rpx; /* 稿 8 */
    border-radius: 8rpx;
    background-color: #E8E8E3; /* 实测 */
    overflow: hidden;
  }
  &__track-fill {
    height: 100%;
    background-color: #171717; /* 实测 */
    border-radius: 8rpx;
  }
  &__list {
    margin-top: 48rpx; /* 稿 Margin 24 */
    border: 1rpx solid rgba(21, 22, 23, 0.09);
    border-radius: 40rpx; /* 稿 r20 */
    overflow: hidden;
  }
  &__row {
    display: flex;
    align-items: center;
    gap: 20rpx; /* 稿 g10 */
    padding: 27rpx 32rpx; /* 稿 13.3 */
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.09);
  }
  &__row--last {
    border-bottom: none;
  }
  &__row-txt {
    display: flex;
    flex-direction: column;
    gap: 2rpx; /* 稿 g1 */
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

  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $bg-page;
  }
  &__footer-row {
    display: flex;
    gap: 20rpx; /* 稿 g10 */
    padding: 20rpx 32rpx 28rpx; /* 稿 pad 16/16/10/14 */
  }
  &__btn {
    flex: 1;
    height: 104rpx; /* 摄影师端按钮统一 52 */
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
    background-color: #171819; /* 实测黑胶囊 */
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
