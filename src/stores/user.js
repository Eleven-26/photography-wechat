/**
 * 用户状态 —— Pinia（**员工 / 摄影师端**）
 *
 * 目录位置对齐 SLOT 管理端 photography-frontend/src/stores/（复数）。
 * 管理登录态与员工信息（后端 sys_user 行），全局响应式读取。
 */
import { defineStore } from 'pinia'
import { setAuth, clearAuth, getStaff, isLoggedIn } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 是否已登录 */
    loggedIn: isLoggedIn(),
    /** 员工信息（对齐 staff.go → StaffLogin 的 user 字段：id/username/nickname/avatar/mobile/role_id/store_id） */
    staff: getStaff(),
  }),
  getters: {
    /** 展示名：优先昵称（nickname），其次账号（username） */
    displayName: (state) => (state.staff && (state.staff.nickname || state.staff.username)) || '',
    /** @deprecated 旧名（客户口径）——保留别名，请改用 staff */
    customer: (state) => state.staff,
  },
  actions: {
    /** 登录成功：写入本地存储并同步 state */
    login(token, staffInfo) {
      setAuth(token, staffInfo)
      this.loggedIn = true
      this.staff = staffInfo || null
    },
    /** 退出登录 */
    logout() {
      clearAuth()
      this.loggedIn = false
      this.staff = null
    },
  },
})
