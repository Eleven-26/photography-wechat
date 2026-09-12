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
          <text>{{ isEdit ? '必填项已完成' : '必填项未填写' }}</text>
        </view>
        <view class="page-pe__check-badge"><text>{{ isEdit ? '8/8' : '0/8' }}</text></view>
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
 * 结构同构：基础信息3 + 价格3 + 服务内容5 + 拍摄地点（编辑态多 3 地点行）+ 关联作品（编辑态多 2 作品行）+ 规则3 + 发布前检查（0/8 vs 8/8）。
 * 底栏双钮：create=存草稿(白描边)/保存并上架(黑)；edit=删除套餐/保存修改。
 */
export default {
  name: 'MePackageEdit',
  data() {
    return {
      isEdit: false,
      basicRows: [
        { label: '套餐名称', value: '亲子写真 · 基础' },
        { label: '封面', value: '越秀公园 · 秋日样片 已设' },
        { label: '简介', value: '点击编辑 · 一句话说明适合谁' },
      ],
      priceRows: [
        { label: '基础价格', value: '¥2,680' },
        { label: '定金比例', value: '30%' },
        { label: '加选单价', value: '¥60 / 张' },
      ],
      serviceRows: [
        { label: '适用人数', value: '2 人' },
        { label: '拍摄时长', value: '约 2 小时' },
        { label: '精修数量', value: '30 张' },
        { label: '包含项', value: '实体相册 1 本' },
        { label: '拍摄场景', value: '户外 · 室内' },
      ],
      places: [
        { name: '珠江公园', fee: '默认 · ¥0' },
        { name: '越秀公园', fee: '场地费 +¥200' },
        { name: '二沙岛', fee: '场地费 +¥200' },
      ],
      linkedWorks: [
        { title: '越秀公园 · 秋日家庭写真', sub: '家庭写真 · 精选', tag: '写真', color: '#3E5C76' },
        { title: '室内亲子时光', sub: '家庭写真 · 精选', tag: '亲子', color: '#7C6BA8' },
      ],
      ruleRows: [
        { label: '改期政策', value: '提前 24h 免费' },
        { label: '取消政策', value: '定金不退' },
        { label: '交付周期', value: '7 个工作日' },
      ],
    }
  },
  onLoad(query) {
    this.isEdit = query.mode === 'edit'
    if (query.name) this.basicRows[0].value = decodeURIComponent(query.name)
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    edit(label) {
      uni.showToast({ title: `编辑${label}（演示）`, icon: 'none' })
    },
    primary1() {
      uni.showToast({ title: this.isEdit ? '已保存修改（演示）' : '已上架（演示）', icon: 'success' })
    },
    primary2() {
      if (this.isEdit) {
        uni.showModal({
          title: '删除套餐',
          content: '下架后客户不可见，不影响已成交订单',
          success: (res) => {
            if (res.confirm) uni.navigateBack()
          },
        })
      } else {
        uni.showToast({ title: '已存草稿（演示）', icon: 'success' })
      }
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
