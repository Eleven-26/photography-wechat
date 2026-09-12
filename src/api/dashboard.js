/**
 * 工作台模块
 *
 * 后端路由：POST /wechat/staff/overview（待办统计）
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 工作台待办统计（今日拍摄/待核验收款/待处理反馈等） */
export const getOverview = () => rpc(API_PATHS.dashboard.overview, {})
