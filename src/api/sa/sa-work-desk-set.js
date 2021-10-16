import axios from '@/api/api.request'

/* 可选的所有栏目 */
export const columnList = (data) => {
  return axios.request({
    url: '/columnList',
    data,
    desc: '可选的所有栏目',
    method: 'post'
  })
}

/* 工作桌面 */
export const WorkDesktopLR = (data) => {
  return axios.request({
    url: '/WorkDesktopLR',
    data,
    desc: '工作桌面',
    method: 'post'
  })
}

export const WorkDesktopTB = (data) => {
  return axios.request({
    url: '/WorkDesktopTB',
    data,
    desc: 'WorkDesktopTB',
    method: 'post'
  })
}

/* 现有方案 */
export const NowPlan = (data) => {
  return axios.request({
    url: '/pub/workPlatform/getDesignSchemeByUser',
    data,
    desc: '现有方案',
    method: 'post',
    waitfor: true
  })
}

/* 方案保存 */
export const savePlan = (data) => {
  return axios.request({
    url: '/pub/workPlatform/saveScheme',
    data,
    method: 'post',
    desc: '方案保存',
    waitfor: true
  })
}
/* 方案删除 */
export const delPlan = ({ SCHEMEGUID }) => {
  return axios.request({
    url: '/pub/workPlatform/deleteScheme',
    data: { SCHEMEGUID },
    method: 'post',
    desc: '删除工作台方案',
    waitfor: true
  })
}
/* 可选栏目 */
export const getColumnList = (data) => {
  return axios.request({
    url: '/pub/workPlatform/getColumnList',
    data,
    desc: '可选栏目',
    method: 'post',
    waitfor: true
  })
}

/* 方案修改 */
export const getPlanData = (data) => {
  return axios.request({
    url: '/pub/workPlatform/getScheme',
    data,
    method: 'post',
    desc: '方案修改',
    waitfor: true
  })
}

/* 是否有系统级判断 */
export const isSystem = (data) => {
  return axios.request({
    url: '/pub/workPlatform/getIsSystem',
    data,
    desc: '是否有系统级判断',
    method: 'post',
    waitfor: true
  })
}
