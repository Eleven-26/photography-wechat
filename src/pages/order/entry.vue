<template>
  <view class="page-oe page-wrap">
    <!-- 状态栏占位：稿内 Iphone 375×44 @(0,0)（1:4403 实测） -->
    <view class="status-bar" />
    <!-- ① 顶栏：返回 + 「录入订单」（稿 60 高容器；标题居中为 2026-09-08 用户定稿） -->
    <view class="page-oe__header">
      <view class="page-oe__top-btn pressable" @click="goBack">
        <AppIcon name="nav-back" :size="20" />
      </view>
      <text class="page-oe__title">录入订单</text>
    </view>

    <!-- ② 客户信息（稿 sec-title @(18,112) + 卡 343×50 @(16,142)） -->
    <text class="page-oe__sec-title">客户信息</text>
    <view class="info-row page-oe__cust pressable" @click="openSheet('customer')">
      <text class="page-oe__label">客户姓名</text>
      <view class="page-oe__val">
        <text class="page-oe__val-name">{{ form.customerName || '未选择' }}</text>
        <view v-if="form.customerName" class="page-oe__val-dot" />
        <text v-if="form.customerMobile" class="page-oe__val-name">{{ form.customerMobile }}</text>
        <AppIcon name="chevron-right-gray" :size="16" />
      </view>
    </view>

    <!-- ③ 订单信息（稿 Section @(16,212)：白卡 r20 五行，行 pad16 g10） -->
    <text class="page-oe__sec-title">订单信息</text>
    <view class="page-oe__card">
      <view class="info-row pressable" @click="openSheet('package')">
        <text class="page-oe__label">套餐</text>
        <view class="page-oe__val">
          <text class="page-oe__value" :class="{ 'page-oe__value--ph': !form.pkgName }">{{ form.pkgName || '未选择' }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <view class="info-row pressable" @click="openSheet('date')">
        <text class="page-oe__label">拍摄日期</text>
        <view class="page-oe__val">
          <text class="page-oe__value" :class="{ 'page-oe__value--ph': !form.dateText }">{{ form.dateText || '选择日期' }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <view class="info-row pressable" @click="openSheet('location')">
        <text class="page-oe__label">拍摄地点</text>
        <view class="page-oe__val">
          <text class="page-oe__value" :class="{ 'page-oe__value--ph': !form.location }">{{ form.location || '未选择' }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <view class="info-row">
        <text class="page-oe__label">订单金额</text>
        <view class="page-oe__val">
          <text class="page-oe__value page-oe__value--bold">¥{{ formatAmount(totalFen) }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <view class="info-row info-row--last pressable" @click="openSheet('remark')">
        <text class="page-oe__label">备注</text>
        <view class="page-oe__val">
          <text class="page-oe__value page-oe__value--med" :class="{ 'page-oe__value--ph': !form.remark }">{{ form.remark || '孩子3岁，上午状态好' }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
    </view>

    <!-- ④ 收款信息（稿 sec-title @(16,582) + 白卡 @612：总价/状态/比例/金额/尾款/方式） -->
    <text class="page-oe__sec-title">收款信息</text>
    <view class="page-oe__card">
      <!-- 套餐总价：稿副提示「来自套餐库 · 点击可手动改价」，点击弹改价 -->
      <view class="info-row pressable" @click="editTotal">
        <view class="page-oe__val page-oe__val--col">
          <text class="page-oe__value page-oe__value--med">套餐总价</text>
          <text class="page-oe__hint">来自套餐库 · 点击可手动改价</text>
        </view>
        <view class="page-oe__val">
          <text class="page-oe__total">¥{{ formatAmount(totalFen) }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <!-- 定金状态 pills（稿：选中 #171819 白字 / 未选 #F7F8FA 黑字，12 Bold r999） -->
      <view class="info-row">
        <text class="page-oe__label">定金状态</text>
        <view class="page-oe__pills">
          <view
            v-for="opt in depositStates" :key="opt"
            class="page-oe__pill pressable"
            :class="{ 'page-oe__pill--on': form.depositPaid === opt }"
            @click="form.depositPaid = opt"
          ><text>{{ opt }}</text></view>
        </view>
      </view>
      <!-- 定金比例 pills（30%/50%/自定义） -->
      <view class="info-row">
        <text class="page-oe__label">定金比例</text>
        <view class="page-oe__pills">
          <view
            v-for="opt in ratioOptions" :key="opt"
            class="page-oe__pill pressable"
            :class="{ 'page-oe__pill--on': form.ratio === opt }"
            @click="pickRatio(opt)"
          ><text>{{ opt }}</text></view>
        </view>
      </view>
      <view class="info-row pressable" @click="editDeposit">
        <text class="page-oe__label">定金金额</text>
        <view class="page-oe__val">
          <text class="page-oe__value page-oe__value--bold">￥{{ formatAmount(depositFen) }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <view class="info-row">
        <text class="page-oe__label">尾款</text>
        <view class="page-oe__val">
          <text class="page-oe__value page-oe__value--bold">¥{{ formatAmount(finalFen) }}</text>
          <AppIcon name="chevron-right-gray" :size="16" />
        </view>
      </view>
      <!-- 收款方式 pills（稿：银行转账选中） -->
      <view class="info-row info-row--last">
        <text class="page-oe__label">收款方式</text>
        <view class="page-oe__pills">
          <view
            v-for="opt in payChannels" :key="opt"
            class="page-oe__pill pressable"
            :class="{ 'page-oe__pill--on': form.channel === opt }"
            @click="form.channel = opt"
          ><text>{{ opt }}</text></view>
        </view>
      </view>
    </view>

    <!-- ⑤ 灰提示条（稿 343×61 #E6E7EB r14 @(16,1021)） -->
    <view class="page-oe__tip">
      <AppIcon name="info-gray-sm" :size="13" />
      <text class="page-oe__tip-text">创建后：占用档期 + 进订单列表 + 客户端站点可见，客户无需任何操作。</text>
    </view>

    <!-- ⑥ 底部双钮：保存草稿（白）+ 创建订单（黑），r999 h52（稿 @0,1092） -->
    <view class="page-oe__footer">
      <view class="page-oe__btn page-oe__btn--ghost pressable" @click="submit(false)"><text>保存草稿</text></view>
      <view class="page-oe__btn page-oe__btn--solid pressable" :class="{ 'page-oe__btn--loading': submitting }" @click="submit(true)">
        <text>{{ submitting ? '创建中…' : '创建订单' }}</text>
      </view>
    </view>

    <AppTabBar active="order" />

    <!-- ===== 弹层：选择客户（稿 1:4539：灰底板 + 搜索 + 4 行列表 + 白「新建客户」钮） ===== -->
    <view v-if="sheet === 'customer'" class="page-oe__mask pressable" @click="closeSheet">
      <view class="page-oe__sheet page-oe__sheet--gray" @click.stop>
        <text class="page-oe__sheet-title">选择客户</text>
        <view class="page-oe__search">
          <input v-model="custKeyword" class="page-oe__search-input" placeholder="搜索姓名或电话" placeholder-class="page-oe__ph" />
        </view>
        <scroll-view scroll-y class="page-oe__cust-list">
          <view
            v-for="c in filteredCustomers" :key="c.mobile"
            class="page-oe__cust-row pressable"
            @click="pickCustomer(c)"
          >
            <view class="page-oe__avatar" :style="{ backgroundColor: c.color }"><text>{{ c.name.slice(0, 1) }}</text></view>
            <view class="page-oe__cust-main">
              <text class="page-oe__cust-name">{{ c.name }}</text>
              <text class="page-oe__cust-sub">{{ c.mobile }} · {{ c.lastTag }} · {{ c.vipText }}</text>
            </view>
          </view>
        </scroll-view>
        <view class="page-oe__sheet-btn page-oe__sheet-btn--white pressable" @click="openSheet('newCustomer')">
          <view class="page-oe__plus"><view /><view /></view>
          <text>新建客户</text>
        </view>
      </view>
    </view>

    <!-- ===== 弹层：新建客户（稿 1:4713：白板 458 高，姓名/电话/来源 pills） ===== -->
    <view v-if="sheet === 'newCustomer'" class="page-oe__mask pressable" @click="closeSheet">
      <view class="page-oe__sheet" @click.stop>
        <text class="page-oe__sheet-title">新建客户</text>
        <text class="page-oe__field-label">姓名*</text>
        <view class="page-oe__field">
          <input v-model="newCust.name" class="page-oe__field-input" placeholder="客户姓名" placeholder-class="page-oe__ph" />
        </view>
        <text class="page-oe__field-label">联系电话*</text>
        <view class="page-oe__field">
          <input v-model="newCust.mobile" class="page-oe__field-input" type="number" maxlength="11" placeholder="用于订单与拍摄提醒" placeholder-class="page-oe__ph" />
        </view>
        <text class="page-oe__field-label">来源（选填）</text>
        <!-- 稿内 4 个来源 pills 文本为深层压缩未捕获，标签按业务推导标注待核对 -->
        <view class="page-oe__pills page-oe__pills--field">
          <view
            v-for="opt in sourceOptions" :key="opt"
            class="page-oe__pill pressable"
            :class="{ 'page-oe__pill--on': newCust.source === opt }"
            @click="newCust.source = opt"
          ><text>{{ opt }}</text></view>
        </view>
        <view class="page-oe__sheet-btn page-oe__sheet-btn--dark pressable" @click="saveNewCustomer"><text>保存并选择</text></view>
      </view>
    </view>

    <!-- ===== 弹层：套餐选择（稿 1:4862：白板 401 高，4 行 套餐+副行+价格+勾选） ===== -->
    <view v-if="sheet === 'package'" class="page-oe__mask pressable" @click="closeSheet">
      <view class="page-oe__sheet" @click.stop>
        <text class="page-oe__sheet-title">套餐选择</text>
        <view
          v-for="p in packages" :key="p.name"
          class="page-oe__pkg pressable"
          @click="pickPackage(p)"
        >
          <view class="page-oe__pkg-main">
            <text class="page-oe__pkg-name">{{ p.name }}</text>
            <text class="page-oe__pkg-sub">{{ p.spec }}</text>
          </view>
          <text class="page-oe__pkg-price">￥{{ formatAmount(p.priceFen) }}</text>
          <view class="page-oe__check" :class="{ 'page-oe__check--on': form.pkgName === p.name }">
            <!-- 稿：选中黑圆 #000 + 白勾（1:4862 实测；勾 ⌀ 圆内占比 55%、笔画 2.4 → size 20）。
                 原用 check-sm-dark（深色勾）在黑底上不可见；2026-09-10 修正并校尺寸 -->
            <AppIcon v-if="form.pkgName === p.name" name="check-white" :size="20" />
          </view>
        </view>
        <view class="page-oe__sheet-btn page-oe__sheet-btn--dark pressable" @click="closeSheet"><text>确定</text></view>
      </view>
    </view>

    <!-- ===== 弹层：选择拍摄日期与时段（稿 1:5026 实测：白底板；白卡月历 r20[月份头/星期头/40×40 四色格/图例] + 时段白卡 + 黑钮 343×52） ===== -->
    <view v-if="sheet === 'date'" class="page-oe__mask pressable" @click="closeSheet">
      <view class="page-oe__sheet" @click.stop>
        <text class="page-oe__sheet-title">选择拍摄日期与时段</text>
        <!-- 月历白卡（稿 Rectangle 170：白底描边 #E7E8EB，月份头/星期头/格子/图例都在卡内） -->
        <view class="page-oe__cal-card">
          <!-- 月份头：稿 1:5224 左右箭头 #85878D + 「2026年8月」15 Bold #333 -->
          <view class="page-oe__month">
            <view class="page-oe__month-nav pressable" @click="shiftMonth(-1)"><AppIcon name="chevron-left-gray" :size="20" /></view>
            <text class="page-oe__month-label">{{ monthLabel }}</text>
            <view class="page-oe__month-nav pressable" @click="shiftMonth(1)"><AppIcon name="chevron-right-gray" :size="20" /></view>
          </view>
          <view class="page-oe__week">
            <text v-for="w in weekHeads" :key="w">{{ w }}</text>
          </view>
          <!-- 日期格：稿 40×40 间距5；普通格无底色（日期直接落在白卡上）；今日 #EBECEF；选中=保留原底色+黑描边（非实底黑） -->
          <view class="page-oe__cal">
            <view
              v-for="(cell, i) in calCells" :key="i"
              class="page-oe__cell"
              :class="[cell && form.selDay && form.selDay.month === cell.month && form.selDay.day === cell.day ? 'page-oe__cell--sel' : cell ? 'page-oe__cell--' + cell.tone : '']"
              @click="cell && pickDate(cell)"
            >
              <text v-if="cell">{{ cell.day }}</text>
            </view>
          </view>
          <!-- 图例（稿 @535：可约/部分可约/已占关闭/今日/选中，在卡内） -->
          <view class="page-oe__legend">
            <view class="page-oe__legend-item"><view class="page-oe__legend-dot" style="background-color:#76D596" /><text>可约</text></view>
            <view class="page-oe__legend-item"><view class="page-oe__legend-dot" style="background-color:#FFDA08" /><text>部分可约</text></view>
            <view class="page-oe__legend-item"><view class="page-oe__legend-dot" style="background-color:#FF8181" /><text>已占/关闭</text></view>
            <view class="page-oe__legend-item"><view class="page-oe__legend-dot" style="background-color:#D4D4D4" /><text>今日</text></view>
            <view class="page-oe__legend-item"><view class="page-oe__legend-dot page-oe__legend-dot--sel" /><text>选中</text></view>
          </view>
        </view>
        <!-- 时段卡（稿 Group 141 343×108 白卡：09:00-11:00 已占+「订单」角标 / 11:00-14:00 可约 / 14:00-16:00 可约 / 16:00-18:00 灰） -->
        <view class="page-oe__slots">
          <view
            v-for="s in slotOptions" :key="s.label"
            class="page-oe__slot"
            :class="['page-oe__slot--' + s.tone, { 'page-oe__slot--on': form.slot === s.label }]"
            @click="pickSlot(s)"
          ><text :class="{ 'page-oe__slot-line': s.tone === 'off' }">{{ s.label }}</text><view v-if="s.badge" class="page-oe__slot-badge"><text>{{ s.badge }}</text></view></view>
        </view>
        <view class="page-oe__sheet-btn page-oe__sheet-btn--dark pressable" @click="confirmDate"><text>确定</text></view>
      </view>
    </view>

    <!-- ===== 弹层：拍摄地点（稿 1:5264：白板 283 高，2 快捷 pills + 输入框 + 黑钮） ===== -->
    <view v-if="sheet === 'location'" class="page-oe__mask pressable" @click="closeSheet">
      <view class="page-oe__sheet" @click.stop>
        <text class="page-oe__sheet-title">拍摄地点</text>
        <!-- 稿 2 枚快捷 pills 文本压缩未捕获，按常用地点推导标注待核对 -->
        <view class="page-oe__pills page-oe__pills--field">
          <view
            v-for="loc in quickLocations" :key="loc"
            class="page-oe__pill pressable"
            :class="{ 'page-oe__pill--on': form.location === loc }"
            @click="form.location = loc"
          ><text>{{ loc }}</text></view>
        </view>
        <view class="page-oe__field">
          <input v-model="form.location" class="page-oe__field-input" placeholder="地点，如：越秀公园" placeholder-class="page-oe__ph" />
        </view>
        <view class="page-oe__sheet-btn page-oe__sheet-btn--dark pressable" @click="closeSheet"><text>确定</text></view>
      </view>
    </view>

    <!-- ===== 弹层：备注（稿 1:5402：白板 229 高；稿占位与地点页重复疑复制错误，按主屏示例值修正并标注） ===== -->
    <view v-if="sheet === 'remark'" class="page-oe__mask pressable" @click="closeSheet">
      <view class="page-oe__sheet" @click.stop>
        <text class="page-oe__sheet-title">备注</text>
        <view class="page-oe__field">
          <input v-model="form.remark" class="page-oe__field-input" placeholder="孩子3岁，上午状态好" placeholder-class="page-oe__ph" />
        </view>
        <view class="page-oe__sheet-btn page-oe__sheet-btn--dark pressable" @click="closeSheet"><text>确定</text></view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * D16 录入订单·一页化（主屏画板 1:4403 + 6 个弹层画板 1:4539/4713/4862/5026/5264/5402）
 *
 * 业务：摄影师代客下单（S3 仅此入口为手动，其余系统自动生成）。创建后：占用档期 +
 * 进订单列表 + 客户端站点可见。定金比例 30%/50%/自定义；尾款 = 总价 - 定金。
 * 稿内 7 屏在稿库为独立画板，工程上一页化：差异仅为弹层状态，避免 7 个路由。
 * 金额单位为「元」（formatAmount 口径），联调提交时转 *_cents 分并对齐后端字段名。
 * 演示数据：联调后移除。
 */
import AppTabBar from '@/components/AppTabBar.vue'
import { formatAmount } from '@/utils/format'
import { isDemo } from '@/utils/demo'

export default {
  components: { AppTabBar },
  data() {
    return {
      sheet: '',            // 当前弹层：customer/newCustomer/package/date/location/remark
      submitting: false,
      /* 表单（演示初值 = 稿 1:4403 稿值） */
      form: {
        customerName: '王浩',
        customerMobile: '138****5241',
        pkgName: '亲自写真 · 基础',
        dateText: '8月20日 周四 · 16:00-18:00',
        location: '',
        remark: '',
        depositPaid: '已收',
        ratio: '30%',
        channel: '银行转账',
        slot: '',
        selDay: { month: 8, day: 17 },  // 弹层内选中日期格（非提交字段；稿 1:5026 示例选中 17）
      },
      totalFen: 2680,
      customDepositFen: 0,  // 「自定义」比例时的定金
      depositStates: ['已收', '未收'],
      ratioOptions: ['30%', '50%', '自定义'],
      payChannels: ['银行转账', '微信', '支付宝'],
      /* 客户列表（稿 1:4539 四行：头像色/姓名/手机/标签；演示数据联调后移除） */
      customers: [
        { name: '王浩', mobile: '138****5210', lastTag: '上次8/亲子', vipText: '老客户·第3单', color: '#FFB508' },
        { name: '陈雨', mobile: '138****5210', lastTag: '上次8/亲子', vipText: '老客户·第3单', color: '#6BABFF' },
        { name: '李婷婷', mobile: '138****5210', lastTag: '上次8/亲子', vipText: '老客户·第3单', color: '#FB79FF' },
        { name: '柳神', mobile: '138****5210', lastTag: '上次8/亲子', vipText: '老客户·第3单', color: '#00CB8E' },
      ],
      custKeyword: '',
      newCust: { name: '', mobile: '', source: '' },
      /* 稿 pills 文本实测（1:4846-1:4854：朋友介绍 选中/小红书/抖音/老客户转介绍/其他） */
      sourceOptions: ['朋友介绍', '小红书', '抖音', '老客户转介绍', '其他'],
      quickLocations: ['合作影棚', '外拍'],
      /* 套餐库（稿 1:4862 四行实测） */
      packages: [
        { name: '亲自写真 · 基础', spec: '2人 · 精修20张 · 约2h', priceFen: 2680 },
        { name: '亲自写真 · 轻奢', spec: '2人 · 约2h · 精修30张 · 含相册', priceFen: 3980 },
        { name: '家庭纪实', spec: '不限人数 · 约3h · 精修40张', priceFen: 4580 },
        { name: '个人写真', spec: '1人 · 约1.5h · 精修20张', priceFen: 1580 },
      ],
      weekHeads: ['一', '二', '三', '四', '五', '六', '日'],
      /* 月历（稿 1:5026 实测 2026年8月：1,4,6,23 已占 / 9,17 部分可约 / 10,16,30 可约 / 12 今日 / 17 选中示例，余普通） */
      calCells: [],
      monthYear: 2026,
      monthNum: 8,
      monthLabel: '2026年8月',
      /* 时段 chips（稿 Group 141 逐节点实测，禁自造）：09:00-11:00 已占+「订单」角标 / 11:00-14:00 可约 / 14:00-16:00 可约 / 16:00-18:00 灭 */
      slotOptions: [
        { label: '09:00-11:00', tone: 'off', badge: '订单' },
        { label: '11:00-14:00', tone: 'ok' },
        { label: '14:00-16:00', tone: 'ok' },
        { label: '16:00-18:00', tone: 'plain' },
      ],
    }
  },
  computed: {
    /** 定金（分）：30%→804 / 50%→1340 / 自定义→手输 */
    depositFen() {
      if (this.form.ratio === '30%') return Math.round(this.totalFen * 0.3)
      if (this.form.ratio === '50%') return Math.round(this.totalFen * 0.5)
      return this.customDepositFen
    },
    /** 尾款 = 总价 - 定金（加选差价联调后由后端并入，此处前端演示口径） */
    finalFen() {
      return Math.max(this.totalFen - this.depositFen, 0)
    },
    filteredCustomers() {
      const k = (this.custKeyword || '').trim()
      if (!k) return this.customers
      return this.customers.filter(c => c.name.includes(k) || c.mobile.includes(k))
    },
  },
  created() {
    this.buildCalendar()
  },
  methods: {
    formatAmount,
    openSheet(name) {
      this.sheet = name
      if (name === 'customer') this.custKeyword = ''
    },
    closeSheet() { this.sheet = '' },
    pickCustomer(c) {
      this.form.customerName = c.name
      this.form.customerMobile = c.mobile
      this.closeSheet()
    },
    /** 新建客户：演示态本地入列（联调接 POST /customer，联调核对） */
    saveNewCustomer() {
      if (!this.newCust.name || !this.newCust.mobile) {
        return uni.showToast({ title: '请填写姓名与联系电话', icon: 'none' })
      }
      const colors = ['#FFB508', '#6BABFF', '#FB79FF', '#00CB8E']
      this.customers.unshift({
        name: this.newCust.name,
        mobile: this.newCust.mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
        lastTag: '新客户',
        vipText: '首次下单',
        color: colors[this.customers.length % colors.length],
      })
      this.pickCustomer(this.customers[0])
    },
    pickPackage(p) {
      this.form.pkgName = p.name
      this.totalFen = p.priceFen
    },
    /**
     * 选日期：已占/关闭拦截 + 即时高亮（原版点后无反馈被用户点名）。
     * 注意：uni-app 模板编译把方法编译为 $options.method()（this≠实例），
     * 因此模板里的选中判断直接内联比较 $data.selDay，不抽方法（isSel 已移除）。
     */
    pickDate(cell) {
      if (cell.tone === 'off') return uni.showToast({ title: '该日期已占用/关闭', icon: 'none' })
      this.form.selDay = { month: cell.month, day: cell.day }
      this.form.dateText = `${cell.month}月${cell.day}日`
      this.form.slot = ''
    },
    confirmDate() {
      if (!this.form.dateText) return uni.showToast({ title: '请先选择日期', icon: 'none' })
      if (this.form.slot) this.form.dateText = `${this.form.dateText} · ${this.form.slot}`
      this.closeSheet()
    },
    /** 套餐总价手动改价（稿提示「点击可手动改价」） */
    editTotal() {
      uni.showModal({
        title: '手动改价',
        editable: true,
        placeholderText: `当前 ¥${formatAmount(this.totalFen)}，输入新价格（元）`,
        success: (r) => {
          if (!r.confirm) return
          const n = parseFloat(r.content)
          if (isNaN(n) || n <= 0) return uni.showToast({ title: '请输入有效金额', icon: 'none' })
          this.totalFen = Math.round(n)
        },
      })
    },
    /** 定金金额编辑（仅自定义比例开放；联调口径：定金即时线下支付不并入尾款） */
    editDeposit() {
      if (this.form.ratio !== '自定义') {
        return uni.showToast({ title: '切换「自定义」比例后可改定金', icon: 'none' })
      }
      uni.showModal({
        title: '定金金额',
        editable: true,
        placeholderText: '输入定金（元）',
        success: (r) => {
          if (!r.confirm) return
          const n = parseFloat(r.content)
          if (isNaN(n) || n < 0) return uni.showToast({ title: '请输入有效金额', icon: 'none' })
          this.customDepositFen = Math.round(n)
        },
      })
    },
    pickRatio(opt) {
      this.form.ratio = opt
      if (opt === '自定义') this.editDeposit()
    },
    /**
     * 月历静态稿值复刻（稿 1:5026：2026年8月整月 1-31；1,4,6,23 已占 / 9,17 部分 / 10,16,30 可约 / 12 今日）
     * tone: ok 可约 / part 部分可约 / off 已占关闭 / today 今日 / plain 普通
     * 联调后改走 /calendar/:month 档期接口（联调核对）
     */
    buildCalendar() {
      const { monthYear: y, monthNum: m } = this
      if (y === 2026 && m === 8) {
        /* 稿面原样：8/1 落「日」列（稿内即如此，1:1 还原不做日历纠正） */
        const tones = { 1: 'off', 4: 'off', 6: 'off', 9: 'part', 10: 'ok', 12: 'today', 16: 'ok', 17: 'part', 23: 'off', 30: 'ok' }
        const cells = [null, null, null, null, null, null]
        for (let d = 1; d <= 31; d++) cells.push({ day: d, month: m, tone: tones[d] || 'plain' })
        this.calCells = cells
        return
      }
      /* 其他月份：真实星期推导，档期接口未联调前全部普通格 */
      const firstDow = (new Date(y, m - 1, 1).getDay() + 6) % 7 // 周一=0
      const days = new Date(y, m, 0).getDate()
      const cells = Array(firstDow).fill(null)
      for (let d = 1; d <= days; d++) cells.push({ day: d, month: m, tone: 'plain' })
      this.calCells = cells
    },
    /** 月份切换（稿左右箭头）：档期数据联调后接入，非 8 月暂全普通格 */
    shiftMonth(dir) {
      let m = this.monthNum + dir
      let y = this.monthYear
      if (m < 1) { m = 12; y-- }
      if (m > 12) { m = 1; y++ }
      this.monthNum = m
      this.monthYear = y
      this.monthLabel = `${y}年${m}月`
      this.buildCalendar()
    },
    /** 时段选择（稿：仅可约绿 chip 可选；已占/灰 chip 点选拦截） */
    pickSlot(s) {
      if (s.tone !== 'ok') return uni.showToast({ title: s.tone === 'off' ? '该时段已被占用' : '该时段未开放', icon: 'none' })
      this.form.slot = s.label
    },
    /** 创建/保存草稿：/order（联调核对）；演示态提示（联调后移除） */
    async submit(create) {
      if (create && !this.form.customerName) return uni.showToast({ title: '请选择客户', icon: 'none' })
      if (create && !this.form.pkgName) return uni.showToast({ title: '请选择套餐', icon: 'none' })
      if (this.submitting) return
      this.submitting = true
      try {
        if (isDemo()) {
          return uni.showToast({ title: create ? '订单已创建（演示）' : '草稿已保存（演示）', icon: 'none' })
        }
        /* 联调：createOrder({ ...this.form, total_fen, deposit_fen, final_fen, channel }) */
      } finally {
        this.submitting = false
      }
    },
    goBack() { uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/order/list' }) }) },
  },
}
</script>

<style lang="scss" scoped>
.page-oe {
  padding-bottom: 320rpx;

  /* ① 顶栏（同 D01/D12 实测规格；标题居中为用户定稿） */
  &__header {
    position: relative;
    display: flex;
    align-items: center;
    height: 120rpx;
    box-sizing: border-box;
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
    text-align: center;
    pointer-events: none;
    color: $text-1;
    font-size: 34rpx;
    font-weight: 700;
  }

  /* 区块标题（稿 15 Bold #151617，左 18 → 卡左 16 + 2 内缩，统一 36rpx） */
  &__sec-title {
    display: block;
    padding: 28rpx 36rpx 20rpx;
    color: $text-1;
    font-size: 30rpx;
    font-weight: 700;
  }

  /* 卡体（稿白卡 r20） */
  &__card {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 40rpx;
    overflow: hidden;
  }
  &__cust {
    margin: 0 $page-pad;
    background-color: $white;
    border-radius: 32rpx; /* 稿 1:4878 Rectangle 151 实测 cornerRadius 16px → 32rpx */
    /* D-6（用户拍板）：客户信息选择行按稿 343×50px 收，页面级覆盖全局 .info-row 的 128rpx 行高（common.scss 不动，D02/D12/D14 仍为 64px 口径） */
    min-height: 100rpx;
  }
  /* 行内布局：.info-row 统一 64px 行高（全站口径），此处只管 label/value/箭头排布 */
  &__label { color: #666666; font-size: 30rpx; flex-shrink: 0; }
  &__val {
    display: flex;
    align-items: center;
    gap: 8rpx;
    min-width: 0;
  }
  &__val--col {
    flex-direction: column;
    align-items: flex-start;
    gap: 4rpx;
  }
  &__val-name { color: $text-1; font-size: 28rpx; font-weight: 700; flex-shrink: 0; }
  &__val-dot { width: 8rpx; height: 8rpx; background-color: $text-1; border-radius: 50%; flex-shrink: 0; }
  &__value { color: #171717; font-size: 30rpx; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__value--bold { font-weight: 700; color: #333333; }
  &__value--med { font-weight: 500; }
  &__value--ph { color: #6B7280; } /* 稿占位色实测 */
  &__hint { color: #999999; font-size: 24rpx; }
  &__total { color: #000000; font-size: 36rpx; font-weight: 700; font-family: $font-family-num; }

  /* pills（稿：选中 #171819 白字 / 未选 #F2F3F5，12 Bold r999 pad20/7-8） */
  &__pills {
    display: flex;
    gap: 12rpx;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  &__pills--field { justify-content: flex-start; margin: 20rpx 0 8rpx; }
  &__pill {
    padding: 14rpx 40rpx;
    background-color: #F2F3F5; /* 稿 1:4937 未选 #F2F3F5（原 #F7F8FA 偏亮；稿面自相矛盾按就低） */
    border-radius: 999rpx;
    text { color: #333333; font-size: 24rpx; font-weight: 700; line-height: 32rpx; }
    &--on {
      background-color: #171819; /* 实测 */
      text { color: $white; }
    }
  }

  /* ⑤ 灰提示条（稿 343×61 #E6E7EB r14） */
  &__tip {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    margin: 24rpx $page-pad 0;
    padding: 24rpx 32rpx;
    background-color: #E6E7EB; /* 实测 */
    border-radius: 28rpx;
  }
  &__tip-text { flex: 1; color: #666666; font-size: 24rpx; line-height: 34rpx; }

  /* ⑥ 底部双钮（稿：白 167.5 + 黑 165.5 r999 h52） */
  &__footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 166rpx;
    z-index: 99;
    display: flex;
    gap: 20rpx;
    padding: 20rpx $page-pad;
    background: linear-gradient(to top, rgba(242, 243, 245, 1) 70%, rgba(242, 243, 245, 0));
  }
  &__btn {
    flex: 1;
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999rpx;
    text { font-size: 30rpx; font-weight: 700; }
    &--ghost {
      background-color: $white;
      border: 1rpx solid rgba(21, 22, 23, 0.09);
      text { color: $text-1; }
    }
    &--solid {
      background-color: $btn-primary; /* 实测 #171819 */
      text { color: $white; }
    }
    &--loading { opacity: 0.6; }
  }

  /* ===== 弹层（mask + 底部板） ===== */
  &__mask {
    position: fixed;
    inset: 0;
    z-index: 999;
    background-color: rgba(21, 22, 23, 0.45);
    display: flex;
    align-items: flex-end;
  }
  &__sheet {
    width: 100%;
    max-height: 76vh;
    box-sizing: border-box;
    padding: 32rpx 32rpx calc(#{$footer-safe} + 140rpx);
    background-color: $white;           /* 稿：套餐/新建/地点/备注板为白底 */
    border-radius: 40rpx 40rpx 0 0;
    &--gray { background-color: #FFFFFF; } /* 稿 1:4539/1:5026 Vector 实测纯白板（原误标灰底已修正） */
  }
  &__sheet-title { display: block; margin-bottom: 24rpx; color: $text-1; font-size: 30rpx; font-weight: 700; }
  &__sheet-btn {
    margin-top: 28rpx;
    height: 104rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border-radius: 999rpx;
    text { font-size: 30rpx; font-weight: 700; }
    &--white {
      background-color: $white;
      border: 1rpx solid rgba(21, 22, 23, 0.09);
      text { color: #333333; font-weight: 500; }
    }
    &--dark {
      background-color: $btn-primary;
      text { color: $white; }
    }
  }
  /* 客户搜索框（稿 343×48 #F7F8FA） */
  &__search {
    padding: 24rpx 32rpx;
    background-color: #F7F8FA; /* 实测 */
    border-radius: 16rpx;      /* 推导：稿未标圆角 */
  }
  &__search-input { width: 100%; height: 40rpx; color: $text-1; font-size: 28rpx; font-weight: 500; }
  &__ph { color: #666666; font-size: 28rpx; font-weight: 500; }
  &__cust-list { max-height: 480rpx; margin-top: 8rpx; }
  &__cust-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    height: 100rpx; /* 稿行 50 */
    border-bottom: 1rpx solid #EBEBEB; /* 实测（仅文字列宽 291，简化整行） */
    &:last-child { border-bottom: none; }
  }
  &__avatar {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    text { color: $white; font-size: 28rpx; font-weight: 500; }
  }
  &__cust-main { flex: 1; min-width: 0; }
  &__cust-name { display: block; color: #333333; font-size: 28rpx; font-weight: 500; }
  &__cust-sub { display: block; margin-top: 4rpx; color: #999999; font-size: 24rpx; font-weight: 500; }
  /* 「新建客户」加号（稿 14×14 双杠 #999999） */
  &__plus {
    position: relative;
    width: 28rpx;
    height: 28rpx;
    view {
      position: absolute;
      left: 0;
      top: 13rpx;
      width: 28rpx;
      height: 4rpx;
      background-color: #999999;
      &:last-child { transform: rotate(90deg); }
    }
  }
  /* 新建客户表单域（稿 label 12M #666 + 输入 343×48 #F7F8FA） */
  &__field-label { display: block; margin: 26rpx 0 12rpx; color: #666666; font-size: 24rpx; font-weight: 500; }
  &__field {
    padding: 24rpx 32rpx;
    background-color: #F7F8FA; /* 实测 */
    border-radius: 16rpx;
  }
  &__field-input { width: 100%; height: 40rpx; color: $text-1; font-size: 28rpx; font-weight: 500; }
  /* 套餐行（稿 1:4992-1:5015 实测：文字组高 40px，行 pitch 60px = 120rpx）
     2026-09-10 修正：原写死 height:80rpx 装不下「名称+副行」两行文字（实际约 80rpx）而溢出，
     各行的视觉高度因此不匀；改为 min-height:120rpx（= 稿 pitch 60px）+ 固定行内 line-height，
     行高严格一致、内容不溢出。 */
  &__pkg {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-height: 120rpx;
    padding: 18rpx 0;
    border-bottom: 1rpx solid rgba(21, 22, 23, 0.06);
    &:last-of-type { border-bottom: none; }
  }
  &__pkg-main { flex: 1; min-width: 0; }
  &__pkg-name { display: block; color: #171717; font-size: 28rpx; font-weight: 500; line-height: 40rpx; }
  &__pkg-sub { display: block; margin-top: 6rpx; color: #999999; font-size: 24rpx; font-weight: 500; line-height: 34rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__pkg-price { color: #171717; font-size: 30rpx; font-weight: 700; font-family: $font-family-num; flex-shrink: 0; }
  &__check {
    box-sizing: border-box;
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F2F3F5; /* 实测未选 */
    border-radius: 50%;
    flex-shrink: 0;
    &--on { background-color: #000000; } /* 实测选中黑圆 + 白勾 */
  }
  /* ===== 月历（稿 1:5026 实测：白卡 r20 描边 #E7E8EB，月份头/星期头/格子/图例都在卡内） ===== */
  &__cal-card {
    background-color: $white;
    border: 1rpx solid #E7E8EB; /* 实测 */
    border-radius: 32rpx;       /* 稿 1:5154 实测 cornerRadius 16px → 32rpx */
    padding: 32rpx;
  }
  &__month {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 26rpx;
  }
  &__month-nav {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__month-label { color: #333333; font-size: 30rpx; font-weight: 700; } /* 实测 15 Bold #333 */
  &__week {
    display: flex;
    margin-bottom: 20rpx;
    text { flex: 1; text-align: center; color: #999999; font-size: 24rpx; } /* 实测 12 Medium #999 */
  }
  &__cal {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx 10rpx; /* 稿格 40 间距 5 */
  }
  &__cell {
    box-sizing: border-box;
    width: calc((100% - 60rpx) / 7);
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent; /* 稿：普通日期直接落在白卡上，无独立白底 */
    border: 2rpx solid transparent; /* 占位，选中描边不抖动 */
    border-radius: 16rpx; /* 稿 1:5155-1:5204 实测 cornerRadius 8px → 16rpx */
    text { font-size: 26rpx; font-weight: 700; color: $text-1; font-family: $font-family-num; }
    &--ok { background-color: #DCFCE7; text { color: #20845C; } }   /* 实测 */
    &--part { background-color: #FEF3C7; text { color: #B66E00; } } /* 实测 */
    &--off { background-color: #FEE2E2; text { color: #D94B4B; } }  /* 实测 */
    &--today { background-color: #EBECEF; }                          /* 实测今日灰 */
    &--sel { border-color: #121212; } /* 实测：选中=原色底+黑描边（稿 17 黄底黑框），非实底黑 */
  }
  &__legend {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin: 20rpx 0 0;
    flex-wrap: wrap;
  }
  &__legend-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    text { color: #000000; font-size: 24rpx; }
  }
  &__legend-dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    &--sel { background-color: $white; border: 2rpx solid #121212; } /* 实测：白点黑描边 */
  }
  /* ===== 时段卡（稿 Group 141：白卡描边，4 chips 逐节点实测，禁自造） ===== */
  &__slots {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;                 /* 稿间隙 14rpx（原 16rpx 偏 2rpx） */
    margin-top: 20rpx;
    padding: 32rpx 24rpx 28rpx; /* 实测 chip 距卡左 12/顶 16 */
    background-color: $white;
    border: 1rpx solid #E8E9EB;
    border-radius: 32rpx; /* 稿 1:5248 Rectangle 207 实测 cornerRadius 16px → 32rpx */
  }
  &__slot {
    position: relative;
    padding: 16rpx 24rpx;
    border-radius: 999rpx;
    text { font-size: 24rpx; font-weight: 500; line-height: 36rpx; }
    .page-oe__slot-line { text-decoration: line-through; } /* 稿：已占时段删除线（截图实测） */
    &--ok { background-color: #DCFCE7; border: 1rpx solid #DCFCE7; text { color: #20845C; } } /* 实测 */
    &--off { background-color: #FEE2E2; text { color: #D94B4B; } }  /* 实测：已占+订单角标 */
    &--plain { background-color: #F7F8FA; border: 1rpx solid #DBDBDB; text { color: #333333; } } /* 实测 */
    &--on { box-shadow: inset 0 0 0 2rpx #121212; } /* 推导：chip 选中态稿未定义，沿用日期黑描边语言 */
  }
  &__slot-badge {
    position: absolute;
    top: -16rpx;
    right: 0;
    padding: 1rpx 10rpx;
    background-color: #D94B4B; /* 实测 */
    border-radius: 8rpx;
    text { color: $white; font-size: 20rpx; font-weight: 500; line-height: 28rpx; }
  }
}
</style>
