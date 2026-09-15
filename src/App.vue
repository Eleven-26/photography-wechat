<script>
/**
 * 应用根组件 —— 全局生命周期
 * 摄影师端设计语言：浅色工作台（底 #F2F3F5），在此统一注入全局样式。
 */
export default {
  onLaunch() {
    // 应用启动：可在此做静默登录态恢复（auth.js 已在请求层处理，这里预留）
  },
  onShow() {},
  onHide() {},
}
</script>

<style lang="scss">
/* 全局样式：tokens + common（具体变量见 styles/tokens.scss）
 * ⚠️ 用 @use 而非已废弃的 @import（sass 1.104 会刷 deprecation 警告）。
 *    @use 同样会把 common.scss 的类样式输出到全局，位置/顺序与 @import 一致；
 *    common.scss 内部自带 @use tokens，其变量不继承本文件作用域。
 *    这里显式 @use tokens（h5 端 App.vue 靠 uni.scss 注入而省略）—— 两种写法等价，
 *    显式写法不依赖注入机制；同单元重复 @use 同一模块不报错，已实测。 */
@use '@/styles/tokens.scss' as *;
@use '@/styles/common.scss' as *;

/* uni-app 全局默认文字色与字体（摄影师端浅色） */
page {
  background-color: $bg-page;
  color: $text-1;
  font-family: $font-family;
  font-size: 28rpx; /* 14px 设计稿基准 */
  line-height: 1.6;
}
</style>
