/**
 * 日程与档期模板模块
 *
 * 后端路由：
 *   POST /wechat/staff/schedule/list                body { start_date, end_date, photographer_id? }
 *   POST /wechat/staff/slot-template/list
 *   POST /wechat/staff/slot-template/save[/:id]
 *   POST /wechat/staff/slot-template/delete/:id
 */
import { rpc } from '@/api/common/http'
import { API_PATHS } from '@/api/common/apiPath'

/** 日程列表（不分页，返回业务集合）@param {Object} params { start_date, end_date, photographer_id? } */
export const getScheduleList = (params) => rpc(API_PATHS.schedule.list, params)

/** 档期模板（排班时段模板）列表 */
export const listSlotTemplates = () => rpc(API_PATHS.schedule.slotTemplateList, {})

/**
 * 保存档期模板（新建不传 id，编辑传 id）
 * @param {Object} payload
 * @param {number} [id]
 */
export const saveSlotTemplate = (payload, id) =>
  rpc(API_PATHS.schedule.slotTemplateSave, payload, id)

/** 删除档期模板 @param {number} id */
export const deleteSlotTemplate = (id) => rpc(API_PATHS.schedule.slotTemplateDelete, {}, id)
