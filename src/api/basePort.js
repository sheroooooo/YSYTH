import axios from '@/api/api.request'

/* 申请单、网报单据类型 */
export const getTypeFormRegister = (data) => {
  let cardType = data.cardType || '9981'
  let urlMap = {
    '3': '/gsp/register/getTypeFormRegister',
    '9981': '/gsp/register/getTypeFormRegister',
    '9982': '/oer/oerRegister/getTypeFormRegister'
  }
  return axios.request({
    url: urlMap[cardType],
    data,
    method: 'post'
  })
}

/* 审核流日志 */
export const getReviewLog = (data) => {
  return axios.request({
    url: '/pub/workFlow/getReviewLog',
    data,
    method: 'post'
  })
}

/* 附件展示 */
export const getFileList = (data) => {
  return axios.request({
    url: '/pub/fileOpertion/getFileList',
    data,
    method: 'post'
  })
}

/* 附件删除 */
export const deleteFile = (data) => {
  return axios.request({
    url: '/pub/fileOpertion/delete',
    data,
    method: 'post'
  })
}

/* 附件下载 */
export const downloadFile = (params) => {
  return axios.request({
    url: '/pub/fileOpertion/download',
    params,
    method: 'get',
    responseType: 'blob'
  })
}

/* export const downloadInc = (data) => {
  return axios.request({
    url: '/pub/homePage/downloadInc?incId=' + data,
    data,
    method: 'get',
    responseType: 'blob'
  })
} */
/* 打印 */
export const printFile = (data) => {
  return axios.request({
    url: '/' + data.url + '/applyForm/printFile',
    data,
    method: 'post',
    responseType: 'blob',
    waitfor: true
  })
}
export const cancelPrint = (data) => {
  return axios.request({
    url: '/' + data.url + '/applyForm/cancelPrint',
    data,
    method: 'post'
  })
}
// 用款计划打印
export const printYKJHRegister = (data) => {
  return axios.request({
    url: '/gcp/print/printYKJHRegister',
    data,
    method: 'post',
    responseType: 'blob',
    waitfor: true
  })
}
// 采购管理模块打印
// export const getPrintData = ({ groupNo, reportCode, templId, gsdm, kjnd, djlxid, infoList }) => {
//   return axios.request({
//     url: '/gpmc/Print/getPrintData',
//     data: { groupNo, reportCode, templId, gsdm, kjnd, djlxid, infoList },
//     method: 'post',
//     responseType: 'blob',
//     waitfor: true
//   })
// }
export const getPrintData = (data) => {
  return axios.request({
    url: '/gpmc/Print/getPrintData',
    data,
    method: 'post',
    responseType: 'blob',
    waitfor: true
  })
}
// 打印前检验
export const checkPrintReport = data => {
  return axios.request({
    url: '/pub/checkPrintReport/check',
    data,
    method: 'post'
  })
}

// 获取打印模板 （核算系统）
export const getPrintTemplate = (data) => {
  return axios.request({
    url: '/SA/ireportPrint/getPrintFuncTemplate',
    data,
    method: 'post'
  })
}
export const printFileGl = data => {
  return axios.request({
    url: '/gl/voucherPrint/printFile',
    data,
    method: 'post',
    responseType: 'blob'
  })
}
// 自定义数据源打印
export const SJYPrint = (data) => {
  let urlMap = {
    'OER': '/oer/applyForm/templateScriptPrint'
  }
  return axios.request({
    url: urlMap[data.MODCODE],
    data,
    method: 'post',
    responseType: 'blob'
  })
}
