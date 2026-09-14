<template>
  <view class="page-pe page-wrap">
    <view class="status-bar" />
    <!-- Header：返回箭头 + 标题（新建套餐/编辑套餐，1:11+1:6789 实测同构） -->
    <view class="page-pe__header">
      <view class="page-pe__back pressable" @click="goBack"><AppIcon name="back-dark" :size="20" /></view>
      <text class="page-pe__title">{{ isEdit ? '编辑套餐' : '新建套餐' }}</text>
    </view>

    <!-- 基础信息（y115 标题 + y146 三行） -->
    <text class="page-pe__sec">基础信息</text>
    <view class="page-pe__card page-pe__card--first">
      <view v-for="r in basicRows" :key="r.label" class="info-row page-pe__row pressable" @click="edit(r.label)">
        <text class="page-pe__label">{{ r.label }}</text>
        <text class="page-pe__value">{{ r.value }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 价格（y313 标题 + y368 三行） -->
    <text class="page-pe__sec">价格</text>
    <view class="page-pe__card">
      <view v-for="r in priceRows" :key="r.label" class="info-row page-pe__row pressable" @click="edit(r.label)">
        <text class="page-pe__label">{{ r.label }}</text>
        <text class="page-pe__value">{{ r.value }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 服务内容（y533 标题 + y588 五行） -->
    <text class="page-pe__sec">服务内容</text>
    <view class="page-pe__card">
      <view v-for="r in serviceRows" :key="r.label" class="info-row page-pe__row pressable" @click="edit(r.label)">
        <text class="page-pe__label">{{ r.label }}</text>
        <text class="page-pe__value">{{ r.value }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 拍摄地点（y868 标题 + y918 卡：地点模式 + 编辑态三地点 + 添加行） -->
    <text class="page-pe__sec">拍摄地点</text>
    <view class="page-pe__card">
      <view class="info-row page-pe__row pressable" @click="edit('地点模式')">
        <text class="page-pe__label">地点模式</text>
        <text class="page-pe__value">客户可选地点</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
      <template v-if="isEdit">
        <view v-for="p in places" :key="p.name" class="info-row page-pe__row pressable" @click="edit(p.name)">
          <text class="page-pe__label">{{ p.name }}</text>
          <text class="page-pe__value">{{ p.fee }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </template>
      <view class="info-row page-pe__row page-pe__row--add">
        <text class="page-pe__add">＋ 添加地点</text>
        <text class="page-pe__add-hint">允许客户自定地址 · 可能产生交通费</text>
      </view>
    </view>

    <!-- 关联作品（标题行 + 右灰提示 + 卡） -->
    <view class="page-pe__sec-row">
      <text class="page-pe__sec">关联作品</text>
      <text class="page-pe__sec-hint">展示在套餐详情页</text>
    </view>
    <view class="page-pe__card">
      <template v-if="isEdit">
        <view v-for="(w, i) in linkedWorks" :key="w.title" class="info-row page-pe__row" :class="{ 'info-row--last': i === linkedWorks.length - 1 }">
          <view class="page-pe__w-thumb" :style="{ backgroundColor: w.color }">
            <text>{{ w.tag }}</text>
          </view>
          <view class="page-pe__w-main">
            <text class="page-pe__w-title">{{ w.title }}</text>
            <text class="page-pe__w-sub">{{ w.sub }}</text>
          </view>
          <AppIcon name="edit-gray" :size="14" />
        </view>
      </template>
      <view class="info-row page-pe__row page-pe__row--add">
        <text class="page-pe__add page-pe__add--sm">＋ 添加关联作品</text>
      </view>
    </view>

    <!-- 规则（三行，label #86868B） -->
    <text class="page-pe__sec">规则</text>
    <view class="page-pe__card">
      <view v-for="r in ruleRows" :key="r.label" class="info-row page-pe__row pressable" @click="edit(r.label)">
        <text class="page-pe__label page-pe__label--dim">{{ r.label }}</text>
        <text class="page-pe__value">{{ r.value }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- 发布前检查（绿点 20 + 文案 14 #6D6D72 + 0/8 徽章） -->
    <text class="page-pe__sec">发布前检查</text>
    <view class="page-pe__card">
      <view class="info-row page-pe__row info-row--last">
        <view class="page-pe__check">
          <view class="page-pe__check-dot" />
          <text>{{ filledCount === 8 ? '必填项已完成' : `必填项 ${8 - filledCount} 项待填` }}</text>
        </view>
        <view class="page-pe__check-badge"><text>{{ filledCount }}/8</text></view>
      </view>
    </view>

    <!-- 底栏：新建=存草稿/保存并上架；编辑=删除套餐/保存修改（双钮 52 高） -->
    <view class="page-pe__foot">
      <view class="page-pe__foot-ghost pressable" @click="primary2"><text>{{ isEdit ? '删除套餐' : '存草稿' }}</text></view>
      <view class="page-pe__foot-main pressable" @click="primary1"><text>{{ isEdit ? '保存修改' : '保存并上架' }}</text></view>
    </view>
    <view class="page-pe__safe" />
  </view>
</template>

<script>
/**
 * ME04b 新建套餐（11:1）+ ME05 编辑套餐（1:6789）双态一页。
 * 结构同构：基础信息3 + 价格3 + 服务内容5 + 拍摄地点 + 关联作品 + 规则3 + 发布前检查。
 * 底栏双钮：create=存草稿(白描边)/保存并上架(黑)；edit=删除套餐/保存修改。
 *
 * 数据源（2026-09-14 接线）：
 *   /package/detail/:id → 编辑态回填（form 取自 Package 字段）
 *   /package/create、/package/update/:id、/package/status/:id（上架）、/package/delete/:id
 *   /studio/get → 规则卡「改期政策」取工作室设置（无权限时整卡退化为 —）
 * ⚠️ 后端 Package 无「适用人数 / 拍摄场景 / 拍摄地点 / 关联作品」字段 —— 这几项显「—」或保留稿内展示，
 *    待后端补字段后再接（本页只负责把已有字段落库）。
 * ⚠️ 稿内行内编辑控件尚未定稿：点行仅提示，字段值以表单/后端数据为准。
 */
import { getPackageDetail, createPackage, updatePackage, setPackageStatus, deletePackage } from '@/api/package'
import { getStudioSettings } from '@/api/settings'
import { formatAmount } from '@/utils/format'

const EMPTY_FORM = {
  name: '', cover: '', category: '', base_price: 0, deposit_rate: 0, deposit_amt: 0,
  photos_included: 0, shoot_hours: 0, content_desc: '', addon_unit_price: 0,
}

export default {
  name: 'MePackageEdit',
  data() {
    return {
      isEdit: false,
      packageId: 0,
      form: { ...EMPTY_FORM },
      studio: {},
      submitting: false,
      /* 后端无对应字段，保留稿内展示（照片墙型内容） */
      places: [
        { name: '珠江公园', fee: '默认 · ¥0' },
        { name: '越秀公园', fee: '场地费 +¥200' },
        { name: '二沙岛', fee: '场地费 +¥200' },
      ],
      linkedWorks: [
        { title: '越秀公园 · 秋日家庭写真', sub: '家庭写真 · 精选', tag: '写真', color: '#3E5C76' },
        { title: '室内亲子时光', sub: '家庭写真 · 精选', tag: '亲子', color: '#7C6BA8' },
      ],
    }
  },
  computed: {
    basicRows() {
      const f = this.form
      return [
        { label: '套餐名称', value: f.name || '未填写' },
        { label: '封面', value: f.cover ? `${f.cover} 已设` : '未设置' },
        { label: '简介', value: f.content_desc || '未填写' },
      ]
    },
    priceRows() {
      const f = this.form
      return [
        { label: '基础价格', value: f.base_price ? `¥${formatAmount(f.base_price)}` : '未填写' },
        {
          label: '定金',
          value: f.deposit_amt
            ? `¥${formatAmount(f.deposit_amt)}`
            : (f.deposit_rate ? `${f.deposit_rate}%` : '未填写'),
        },
        {
          label: '加选单价',
          value: f.addon_unit_price ? `¥${formatAmount(f.addon_unit_price)} / 张` : '未填写',
        },
      ]
    },
    serviceRows() {
      const f = this.form
      return [
        { label: '适用人数', value: '—' },
        { label: '拍摄时长', value: f.shoot_hours ? `约 ${f.shoot_hours} 小时` : '未填写' },
        { label: '精修数量', value: f.photos_included ? `${f.photos_included} 张` : '未填写' },
        { label: '包含项', value: f.content_desc || '未填写' },
        { label: '拍摄场景', value: '—' },
      ]
    },
    ruleRows() {
      const s = this.studio || {}
      const free = Number(s.reschedule_free_hours || 0)
      return [
        { label: '改期政策', value: free ? `提前 ${free}h 免费` : '—' },
        { label: '取消政策', value: '—' },
        { label: '交付周期', value: '—' },
      ]
    },
    /** 发布前检查 8 项必填（与后端 create 校验字段对齐） */
    filledCount() {
      const f = this.form
      const checks = [
        f.name, f.cover, f.category, f.base_price, f.deposit_rate,
        f.photos_included, f.shoot_hours, f.content_desc,
      ]
      return checks.filter((v) => v !== '' && v !== 0 && v !== null && v !== undefined).length
    },
  },
  onLoad(query) {
    this.isEdit = query.mode === 'edit'
    this.packageId = Number(query.id || 0)
    this.fetchAll()
  },
  methods: {
    async fetchAll() {
      const tasks = [getStudioSettings().catch(() => null)]
      if (this.isEdit && this.packageId) tasks.push(getPackageDetail(this.packageId).catch(() => null))
      const [studio, pkg] = await Promise.all(tasks)
      this.studio = studio || {}
      if (pkg) {
        this.form = {
          ...EMPTY_FORM,
          ...Object.keys(EMPTY_FORM).reduce((acc, k) => {
            acc[k] = pkg[k] !== undefined && pkg[k] !== null ? pkg[k] : EMPTY_FORM[k]
            return acc
          }, {}),
        }
      }
    },
    goBack() {
      uni.navigateBack()
    },
    /** 行内编辑控件待设计稿；此处仅提示，避免误改后端数据 */
    edit(label) {
      uni.showToast({ title: `${label}：请在管理端编辑`, icon: 'none' })
    },
    /** 主钮：create=保存并上架；edit=保存修改 */
    async primary1() {
      const id = await this.persist()
      if (!id) return
      if (!this.isEdit) {
        const ok = await setPackageStatus(id, 2).then(() => true).catch(() => false)
        if (!ok) return
      }
      uni.showToast({ title: this.isEdit ? '已保存修改' : '已上架', icon: 'success' })
      setTimeout(() => this.goBack(), 700)
    },
    /** 次钮：create=存草稿；edit=删除套餐 */
    primary2() {
      if (this.isEdit) {
        uni.showModal({
          title: '删除套餐',
          content: '下架后客户不可见，不影响已成交订单',
          success: async (res) => {
            if (!res.confirm) return
            const ok = await deletePackage(this.packageId).then(() => true).catch(() => false)
            if (ok) {
              uni.showToast({ title: '已删除', icon: 'none' })
              setTimeout(() => this.goBack(), 700)
            }
          },
        })
      } else {
        this.persist().then((id) => {
          if (id) uni.showToast({ title: '已存草稿', icon: 'success' })
        })
      }
    },
    /** 落库（新建或更新），返回套餐 id；失败返回 0 */
    async persist() {
      if (this.submitting) return 0
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请填写套餐名称', icon: 'none' })
        return 0
      }
      this.submitting = true
      const payload = { ...this.form }
      const res = this.isEdit
        ? await updatePackage(this.packageId, payload).catch(() => null)
        : await createPackage(payload).catch(() => null)
      this.submitting = false
      const id = this.isEdit
        ? this.packageId
        : (res && (res.id || (res.package && res.package.id))) || 0
      if (!id) {
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
        return 0
      }
      return id
    },
  },
}
</script>

<style lang="scss" scoped>
.page-pe {
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
    color: #1A1A1A;
  }

  &__sec {
    display: block;
    margin: 40rpx 36rpx 0; /* 稿：header 底 104 → 基础信息 115；卡底→下标签 7px */
    font-size: 30rpx;
    font-weight: 500;
    color: #1A1A1A;
    &:first-of-type { margin-top: 12rpx; }
  }
  &__sec-row {
    display: flex;
    align-items: flex-end;
    gap: 24rpx;
    margin: 40rpx 36rpx 0; /* 稿：卡底→下标签 7px */
  }
  &__sec-hint { font-size: 24rpx; color: #9A9AA0; }

  &__card {
    margin: 68rpx 32rpx 0; /* 稿：标签底→卡 34px */
    background-color: $white;
    border-radius: 32rpx;
    overflow: hidden;
    &--first { margin-top: 20rpx; } /* 稿：基础信息底 136 → 卡 146 */
  }
  &__row { gap: 16rpx; }
  &__label { font-size: 28rpx; color: #666666; flex-shrink: 0; &--dim { color: #86868B; } }
  &__value {
    flex: 1;
    min-width: 0;
    font-size: 28rpx;
    color: #1A1A1A;
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__row--add {
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }
  &__add { font-size: 30rpx; font-weight: 500; color: #00A860; &--sm { font-size: 30rpx; } }
  &__add-hint { font-size: 24rpx; color: #6D6D72; }

  &__w-thumb {
    box-sizing: border-box;
    width: 72rpx;
    height: 72rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    text { font-size: 20rpx; color: #FFFFFF; }
  }
  &__w-main { flex: 1; min-width: 0; }
  &__w-title { display: block; font-size: 25rpx; color: #000000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__w-sub { display: block; margin-top: 4rpx; font-size: 22rpx; color: #8E8E93; }

  &__check { display: flex; align-items: center; gap: 20rpx; }
  &__check-dot {
    box-sizing: border-box;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: #34C759;
  }
  &__check-badge {
    box-sizing: border-box;
    background-color: #DFF5E9;
    border-radius: 999rpx;
    padding: 4rpx 16rpx;
    text { font-size: 20rpx; color: #00A860; }
  }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    box-sizing: border-box;
    display: flex;
    gap: 20rpx;
    padding: 16rpx 32rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
    background-color: rgba(242, 243, 245, 0.92);
  }
  &__foot-ghost {
    box-sizing: border-box;
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: $white;
    border: 2rpx solid #151617;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #151617; }
  }
  &__foot-main {
    box-sizing: border-box;
    flex: 1;
    height: 104rpx;
    border-radius: 999rpx;
    background-color: #171819;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 30rpx; color: #FFFFFF; }
  }

  &__safe { height: 180rpx; }
}
</style>
