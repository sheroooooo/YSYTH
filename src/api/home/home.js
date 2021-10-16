import axios from '@/api/api.request'

// 待办事项
export const getUpcoming = (data) => {
  return axios.request({
    url: '/pub/homePage/getUpcoming',
    data,
    desc: '获取待办事项',
    method: 'post'
  })
}

// 通知发文
export const getPtInfoList = (data) => {
  return axios.request({
    url: '/cim/portal/getPtInfoList',
    data,
    method: 'post'
  })
}

// 通知发文详情页
export const getPtInfo = (data) => {
  return axios.request({
    url: '/cim/portal/getPtInfo',
    data,
    method: 'post'
  })
}

// 通知发文详情页的下载附件
export const downloadInc = (data) => {
  return axios.request({
    url: '/cim/portal/downloadInc?incId=' + data,
    data,
    method: 'get',
    responseType: 'blob'
  })
}

// 常用功能
export const getCommonFunctions = (data) => {
  return axios.request({
    url: '/pub/homePage/getCommonFunctions',
    data,
    method: 'post'
  })
}

// 获取菜单
export const getMenu = (data) => {
  return axios.request({
    url: '/pub/menu/getMenu',
    data,
    method: 'post',
    waitfor: true
  })
}

// 常用功能保存
export const saveCommon = (data) => {
  return axios.request({
    url: '/pub/homePage/saveCommonFunctions',
    data,
    method: 'post'
  })
}

// 执行情况表
export const getSatusTable = (data) => {
  return axios.request({
    url: '/pub/workPlatform/getDepartmentExecute',
    data,
    method: 'post'
  })
}
