<template>
  <view class="page-pv page-wrap page-pv--dark">
    <view class="status-bar" />
    <!-- Hero：360 高图区。图源 = biz_studio_setting.cover_url —— 工作室在
         「我的 → 我的预约主页 → 主页封面图」上传的分享封面图，与 H5 客户端首页（C01）
         Hero 用的是**同一张图**。未设置时不渲染 image，仅留底色渐变 + 压暗遮罩，
         避免空 src 触发一次无意义的图片请求。 -->
    <view class="page-pv__hero">
      <image v-if="coverUrl" class="page-pv__hero-img" :src="coverUrl" mode="aspectFill" />
      <view class="page-pv__hero-mask" />
      <view class="page-pv__nav">
        <view class="page-pv__nav-btn pressable" @click="goBack"><view class="page-pv__nav-arrow" /></view>
        <view class="page-pv__nav-btn pressable" @click="share"><AppIcon name="me-share" :size="18" /></view>
      </view>
      <view class="page-pv__hero-main">
        <text class="page-pv__hero-title">{{ heroTitle }}</text>
        <text v-if="studio.intro" class="page-pv__hero-sub">{{ studio.intro }}</text>
      </view>
    </view>

    <!-- 数据条：只保留有真实来源的一项。
         原设计三项（100+ 原创作品 / 326 服务客户 / 98% 好评率）中，「服务客户数」「好评率」
         后端既无对应列（StudioSetting 无 served_count / positive_rate）也无聚合接口，
         按「无接口先隐藏」处理 —— 不再用写死值顶替。 -->
    <view class="page-pv__stats">
      <view class="page-pv__stat">
        <text class="page-pv__stat-num">{{ statWorks }}</text>
        <text class="page-pv__stat-label">原创作品</text>
      </view>
    </view>

    <!-- 精选服务（y442 标题 + y493 横滑卡 200x215）：取已上架套餐（biz_package status=2） -->
    <view class="page-pv__sec">精选服务</view>
    <scroll-view scroll-x class="page-pv__svc-scroll" :show-scrollbar="false">
      <view class="page-pv__svc-row">
        <view v-for="p in packages" :key="p.id" class="page-pv__svc">
          <image v-if="p.cover" class="page-pv__svc-img" :src="p.cover" mode="aspectFill" />
          <view v-else class="page-pv__svc-img page-pv__svc-img--ph" />
          <view class="page-pv__svc-body">
            <text class="page-pv__svc-name">{{ p.name }}</text>
            <text class="page-pv__svc-spec">{{ pkgMeta(p) }}</text>
            <text class="page-pv__svc-price">{{ priceText(p) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 精选作品（y708 标题 + 双列 165x220）：取 asset/list?featured=1 -->
    <view class="page-pv__sec-row">
      <text class="page-pv__sec">精选作品</text>
      <text class="page-pv__more">查看全部 ›</text>
    </view>
    <view class="page-pv__works">
      <view v-for="(w, i) in works" :key="w.id || i" class="page-pv__work">
        <image v-if="w.cover" class="page-pv__work-img" :src="w.cover" mode="aspectFill" />
        <view v-else class="page-pv__work-ph" />
        <view class="page-pv__work-fav"><AppIcon name="pv-fav" :size="13" /></view>
      </view>
    </view>

    <!-- 服务流程（y1443 标题 + y1492 流程卡 4+3 两行）：取 studio.service_flow，为空回落通用步骤文案 -->
    <view class="page-pv__sec">服务流程</view>
    <view class="page-pv__flow">
      <view class="page-pv__flow-row">
        <template v-for="(label, i) in flowRow1" :key="label">
          <view class="page-pv__flow-step">
            <AppIcon :name="`pv-step${i + 1}`" :size="22" />
            <text>{{ label }}</text>
          </view>
          <AppIcon v-if="i < flowRow1.length - 1" name="chevron-right-gray" :size="14" />
        </template>
      </view>
      <view class="page-pv__flow-row">
        <template v-for="(label, i) in flowRow2" :key="label">
          <view class="page-pv__flow-step">
            <AppIcon :name="`pv-step${i + 5}`" :size="22" />
            <text>{{ label }}</text>
          </view>
          <AppIcon v-if="i < flowRow2.length - 1" name="chevron-right-gray" :size="14" />
        </template>
      </view>
    </view>

    <!-- 常见问题（y1642 标题 + y1693 三组 QA）：取 studio.faq（JSON 数组），无数据整段隐藏 -->
    <template v-if="faqs.length">
      <view class="page-pv__sec">常见问题</view>
      <view class="page-pv__faq">
        <view v-for="(q, i) in faqs" :key="i" class="page-pv__qa" :class="{ 'page-pv__qa--line': i > 0 }">
          <text class="page-pv__q">{{ q.q }}</text>
          <text class="page-pv__a">{{ q.a }}</text>
        </view>
      </view>
    </template>

    <!-- 底栏：毛玻璃 + 白胶囊「定制需求」56 高（y1919） -->
    <view class="page-pv__foot">
      <view class="page-pv__foot-btn pressable" @click="custom"><text>定制需求</text></view>
    </view>
    <view class="page-pv__safe" />
  </view>
</template>

<script>
/**
 * ME03b 客户视角预览（稿 11:623 实测 1:1）——客户端暗色沉浸样式
 * Hero 360（图源 cover_url，未设置回退深色渐变）→ 数据条 → 精选服务横滑 → 精选作品双列
 * → 服务流程 4+3 → 常见问题 → 白胶囊「定制需求」底栏。
 *
 * ⚠️ 2026-09-15：本页原为**整页样例数据**（店名「路先生摄影」、数据条 100+/326/98%、
 * 2 个写死套餐、6 个灰块「作品」、3 条写死 FAQ），现已改接真实数据，口径与 H5 客户端首页（C01）一致：
 *   - Hero 封面图   → /studio/get 的 cover_url（2026-09-15 新增列；与 H5 首页顶部大图同一张），
 *                     未设置时不渲染 image，回退底色渐变
 *   - 店名 / 简介   → /studio/get 的 slogan / intro
 *   - 原创作品数    → POST /asset/list 的 **total**
 *   - 精选服务      → POST /package/list?status=2（已上架套餐，最多 6 个）
 *   - 精选作品      → POST /asset/list?featured=1（封面取 cover，缺省回退 images 首图）
 *   - 服务流程      → /studio/get 的 service_flow（JSON 数组）；为空回退设计稿通用步骤文案（纯 UI 文案）
 *   - 常见问题      → /studio/get 的 faq（JSON 数组）；无数据整段隐藏，不摆假问答
 *   - 「服务客户数 / 好评率」后端**无来源字段**也无聚合接口 → 整项隐藏，不用写死值顶替
 *
 * ⚠️ 小程序无 origin：后端返回的 `/media/…`、`/uploads/…` 是站内相对路径，
 *    必须经 `mediaUrl()` 补 API_BASE 才能加载（否则列表全是灰块，看着像后端没数据）。
 */
import { getStudioSettings } from '@/api/settings'
import { getPackageList } from '@/api/package'
import { getAssetList } from '@/api/asset'
import { formatAmount } from '@/utils/format'
import { mediaUrl } from '@/utils/url'

/** 解析后端 JSON 数组字符串（biz_studio_setting.faq / service_flow）；空值或非法返回 [] */
function parseList(raw) {
  if (!raw) return []
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** 服务流程兜底：设计稿通用步骤（纯 UI 文案、非业务数据），与 H5 端 C01 同口径 */
const DEFAULT_FLOW = ['浏览作品', '选择套餐', '预约档期', '拍摄', '在线选片', '精修交付', '下载成片']

export default {
  name: 'MePreview',
  data() {
    return {
      /** 工作室设置（slogan 店名 / intro 简介 / faq / service_flow / homepage_url） */
      studio: {},
      shareUrl: '',
      /** 作品总数；null = 未取到（渲染占位符，不显示假数字） */
      assetTotal: null,
      /** 已上架套餐 / 精选作品（封面已解析为可加载地址） */
      packages: [],
      works: [],
      faqs: [],
      flow: [],
    }
  },
  computed: {
    heroTitle() {
      return this.studio.slogan || '工作室主页'
    },
    /**
     * Hero 封面图（biz_studio_setting.cover_url）—— 与 H5 客户端首页顶部大图同一张。
     * ⚠️ 小程序无 origin：后端下发的是 `/media/…` 站内相对路径，必须经 `mediaUrl()` 补
     * API_BASE 才能加载，否则会出现「上传成功、预览页却是灰底」的假故障。
     * 未设置时返回空串 → 模板 `v-if` 不渲染 image，走底色渐变兜底。
     */
    coverUrl() {
      return mediaUrl(this.studio.cover_url)
    },
    statWorks() {
      return this.assetTotal === null ? '—' : String(this.assetTotal)
    },
    flowRow1() {
      return (this.flow.length ? this.flow : DEFAULT_FLOW).slice(0, 4)
    },
    flowRow2() {
      return (this.flow.length ? this.flow : DEFAULT_FLOW).slice(4)
    },
  },
  onLoad() {
    this.loadAll()
  },
  methods: {
    formatAmount,
    /** 封面：优先 cover，否则取 images（逗号分隔）首图；统一补成可加载地址 */
    coverOf(row) {
      const raw = row.cover || String(row.images || '').split(',')[0] || ''
      return mediaUrl(raw)
    },
    /** 套餐规格行：分类 · 时长 · 精修张数（对齐 biz_package 字段） */
    pkgMeta(p) {
      const hours = p.shoot_hours != null ? `约${p.shoot_hours}h` : ''
      const photos = p.photos_included != null ? `精修${p.photos_included}张` : ''
      return [p.category, hours, photos].filter(Boolean).join(' · ') || '详情咨询'
    },
    priceText(p) {
      return p.base_price != null ? `¥${formatAmount(p.base_price)}` : '面议'
    },
    /** 全量拉取并映射为展示结构；各自失败时保持空态，不回落样例数据 */
    async loadAll() {
      const quiet = { loading: false, silent: true }
      const [st, pkg, featured, all] = await Promise.all([
        getStudioSettings(quiet).catch(() => null),
        getPackageList({ page: 1, page_size: 6, status: '2' }, quiet).catch(() => null),
        getAssetList({ page: 1, page_size: 6, featured: '1' }, quiet).catch(() => null),
        getAssetList({ page: 1, page_size: 1 }, quiet).catch(() => null),
      ])
      if (st) {
        this.studio = st
        this.shareUrl = st.homepage_url || ''
        this.faqs = parseList(st.faq)
        this.flow = parseList(st.service_flow)
      }
      if (pkg) {
        this.packages = (pkg.list || []).map((p) => ({ ...p, cover: this.coverOf(p) }))
      }
      if (featured) {
        this.works = (featured.list || []).map((a) => ({ id: a.id, cover: this.coverOf(a) }))
      }
      if (all) this.assetTotal = Number(all.total) || 0
    },
    goBack() {
      uni.navigateBack()
    },
    /** 分享 = 复制主页链接（小程序无法用代码唤起转发面板，也不能转发外部 H5 链接） */
    share() {
      if (!this.shareUrl) {
        uni.showToast({ title: '主页链接尚未生成，请先设置主页标识', icon: 'none' })
        return
      }
      uni.setClipboardData({ data: this.shareUrl })
    },
    /** 本页是「客户视角预览」：定制需求是**客户端**入口，预览态不可提交 */
    custom() {
      uni.showToast({
        title: '此为客户端入口，客户在主页提交后可在「定制需求」列表处理',
        icon: 'none',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-pv--dark {
  background-color: #17181C;
}

.page-pv {
  &__hero {
    position: relative;
    box-sizing: border-box;
    height: 720rpx;
    /* 稿：hero 沉浸，从状态栏后 @1 起 360 高 */
    /* #ifdef H5 */
    margin-top: -44px;
    /* #endif */
    /* #ifdef MP-WEIXIN */
    margin-top: calc(-1 * var(--status-bar-height));
    /* #endif */
    /* 底层：未设封面图时的深色斜向渐变兜底（原为 background 的下层，拆分后保留同样观感）。
       设了封面图时该层被 __hero-img 完全覆盖，不影响成品视觉 */
    background: linear-gradient(135deg, #3A3D44 0%, #22252A 60%, #1A1B1F 100%);
  }
  /* 封面图：绝对铺满 Hero，位于底色之上、压暗遮罩之下 */
  &__hero-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  /* 压暗遮罩：顶部轻压、底部融入页面底色 #17181C，保证标题在任意封面上都可读。
     原为 __hero 自身 background 的上层渐变，拆出独立一层才能叠在封面图之上 */
  &__hero-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba(23, 24, 28, 0.1) 0%,
      rgba(23, 24, 28, 0.55) 55%,
      #17181C 100%
    );
  }
  &__nav {
    position: absolute;
    top: var(--status-bar-height, 44px); /* 稿 11:626 钮 y44 起（状态栏之下）；hero 已被负 margin 吸顶，须下移状态栏高避开系统状态区 */
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx;
    height: 88rpx;
  }
  &__nav-btn {
    box-sizing: border-box;
    width: 72rpx;
    height: 72rpx;
    border-radius: 24rpx;
    background-color: rgba(23, 24, 28, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__nav-arrow {
    box-sizing: border-box;
    width: 24rpx;
    height: 24rpx;
    border-left: 4rpx solid #FFFFFF;
    border-bottom: 4rpx solid #FFFFFF;
    transform: rotate(45deg);
    margin-left: 8rpx;
  }
  &__hero-main {
    position: absolute;
    left: 40rpx;
    right: 40rpx;
    bottom: 60rpx;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }
  &__hero-title { font-size: 64rpx; font-weight: 700; color: #FFFFFF; line-height: 1.2; }
  &__hero-sub { font-size: 28rpx; color: #FFFFFF; }

  /* 数据条：#1D1E22 + stroke #2B2C30。原设计三列（原创作品/服务客户/好评率），
     后两项后端无来源已隐藏，故不再保留列分隔线（保留会画出两处悬空竖线） */
  &__stats {
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    margin: 0 32rpx; /* 同族口径：内容卡左缘 16px（原 30rpx 少 1px） */
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 32rpx;
    padding: 22rpx 0; /* 稿：stats 高 ~66 */
  }
  &__stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }
  &__stat-num { font-size: 40rpx; font-weight: 700; color: #F7F8F8; }
  &__stat-label { font-size: 24rpx; color: #85878D; }

  &__sec {
    margin: 40rpx 36rpx 0; /* 稿：stats 底 → 精选服务 442 */
    font-size: 28rpx;
    font-weight: 500;
    color: #B8BABF;
  }
  &__sec-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 48rpx 36rpx 0;
  }
  &__more { font-size: 24rpx; color: #85878D; }

  &__svc-scroll { white-space: nowrap; margin-top: 20rpx; }
  &__svc-row { display: inline-flex; gap: 32rpx; padding: 0 32rpx; }
  &__svc {
    display: inline-flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 400rpx;
    height: 430rpx;
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 24rpx;
    overflow: hidden;
    flex-shrink: 0;
  }
  &__svc-img {
    display: block;
    height: 240rpx;
    width: 100%;
    /* 套餐无封面时的占位（渐变色块，非图片） */
    &--ph { background: linear-gradient(135deg, #3A3D44 0%, #22252A 100%); }
  }
  &__svc-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    box-sizing: border-box;
    padding: 20rpx 24rpx 24rpx;
  }
  &__svc-name { font-size: 28rpx; color: #F7F8F8; }
  &__svc-spec { font-size: 24rpx; color: #85878D; }
  &__svc-price { margin-top: auto; font-size: 36rpx; font-weight: 700; color: #F7F8F8; }

  &__works {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    margin: 20rpx 32rpx 0;
  }
  &__work {
    box-sizing: border-box;
    position: relative;
    width: 330rpx;
    height: 440rpx;
    border-radius: 16rpx;
    overflow: hidden;
  }
  &__work-img { display: block; width: 100%; height: 100%; }
  /* 作品无封面时的占位（纯色块，非图片） */
  &__work-ph { width: 100%; height: 100%; background-color: #2A2C31; }
  &__work-fav {
    position: absolute;
    left: 24rpx;
    bottom: 24rpx;
    box-sizing: border-box;
    width: 48rpx;
    height: 48rpx;
    border-radius: 24rpx;
    background-color: #17181C;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__flow {
    margin: 20rpx 32rpx 0;
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 24rpx;
    box-sizing: border-box;
    padding: 28rpx 24rpx;
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }
  &__flow-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  &__flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    width: 120rpx;
    text {
      font-size: 22rpx;
      color: #85878D;
      white-space: nowrap;
    }
  }

  &__faq {
    margin: 92rpx 32rpx 0; /* 稿：flow 底 → faq 卡 1693 */
    background-color: #1D1E22;
    border: 1rpx solid #2B2C30;
    border-radius: 24rpx;
    box-sizing: border-box;
    padding: 8rpx 32rpx;
  }
  &__qa {
    padding: 24rpx 0;
    &--line { border-top: 1rpx solid rgba(255, 255, 255, 0.06); }
  }
  &__q { display: block; font-size: 28rpx; color: #F7F8F8; }
  &__a { display: block; margin-top: 8rpx; font-size: 24rpx; line-height: 34rpx; color: #85878D; }

  &__foot {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    box-sizing: border-box;
    background-color: rgba(23, 24, 28, 0.92);
    border-top: 1rpx solid #2B2C30;
    padding: 16rpx 32rpx;
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  }
  &__foot-btn {
    box-sizing: border-box;
    height: 112rpx;
    border-radius: 999rpx;
    background-color: #F7F8F8;
    display: flex;
    align-items: center;
    justify-content: center;
    text { font-size: 32rpx; font-weight: 500; color: #17181C; }
  }
  &__safe { height: 180rpx; }
}
</style>
