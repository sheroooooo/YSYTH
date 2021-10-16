import axios from '@/api/api.request'

export const getFplxs = ({ }) => {
  return axios.request({
    url: '/csmp/getFplxs',
    params: {},
    desc: '查询发票类型',
    method: 'get',
    waitfor: true
  })
}
export const getUserCustomers = ({ }) => {
  return axios.request({
    url: '/csmp/getUserCustomers ',
    params: {},
    desc: '查询所属单位',
    method: 'get',
    waitfor: true
  })
}
// startDate（开票开始时间yyyyMMdd） fpdm（票据代码，String） pid（票据类型，String）
export const getFps = ({ pid, customerIndeid, startDate, endDate, fpdm, pageNum, pageSize, fileexport }) => {
  return axios.request({
    url: '/csmp/getFps',
    params: { pid, customerIndeid, startDate, endDate, fpdm, pageNum, pageSize, fileexport },
    desc: '查询票据夹',
    method: 'get',
    waitfor: true
  })
}

export const getFpDetail = ({ fpid }) => {
  return axios.request({
    url: '/csmp/getFpDetail',
    params: { fpid },
    desc: '查询票据详情',
    method: 'get',
    waitfor: true
  })
}

export const exportFpData = ({ fpids }) => {
  return axios.request({
    url: '/csmp/exportFpData',
    data: { fpids },
    desc: '票据夹导出',
    method: 'post',
    responseType: 'blob',
    waitfor: true
  })
}

export const previewFile = ({ fjid }) => {
  return axios.request({
    url: '/csmp/previewFile',
    params: { fjid },
    desc: '查看附件',
    method: 'GET',
    responseType: 'blob',
    waitfor: true
  })
}
export const checkInvoicesBatch = (data) => {
  return axios.request({
    url: '/csmp/checkInvoicesBatch',
    data,
    desc: '批量查验',
    method: 'post',
    waitfor: true
  })
}