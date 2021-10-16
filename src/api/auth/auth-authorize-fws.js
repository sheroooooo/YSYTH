import axios from '@/api/api.request'

export const getAllCsmpOrders = ({ startDate, endDate, agentIndeid, serviceid, pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getAllCsmpOrders',
    params: { startDate, endDate, agentIndeid, serviceid, pageNum, pageSize },
    desc: '查询表格数据',
    method: 'get',
    waitfor: true
  })
}
export const getAllAgents = ({ }) => {
  return axios.request({
    url: '/csmp/getAllAgents',
    params: {},
    desc: '查询服务商',
    method: 'get',
    waitfor: true
  })
}
export const getAllCsmpServer = ({ }) => {
  return axios.request({
    url: '/csmp/getAllCsmpServer',
    params: {},
    desc: '查询服务内容',
    method: 'get',
    waitfor: true
  })
}
export const getTableData = (data) => {
  let urlMap = {
    'agentName': '/csmp/getAllAgents',
    'customerName': '/csmp/getAllCustomers'
  }
  return axios.request({
    url: urlMap[data.key],
    params: data,
    desc: '查询表格数据',
    method: 'get',
    waitfor: true
  })
}
export const getProviderName = ({ }) => {
  return axios.request({
    url: '/csmp/getProviderName',
    params: {},
    desc: '查询所属运营商',
    method: 'get',
    waitfor: true
  })
}
export const deleteCsmpOrders = (data) => {
  return axios.request({
    url: '/csmp/deleteCsmpOrders',
    data,
    desc: '删除服务商数据',
    method: 'post',
    waitfor: true
  })
}
export const saveCsmpOrder = (data) => {
  let url = '/csmp/saveCsmpOrder' //新增保存
  if (data.hasOwnProperty('orderId')) {
    url = '/csmp/updateCsmpOrder' //修改保存
  }
  return axios.request({
    url,
    data,
    desc: '保存',
    method: 'post',
    waitfor: true
  })
}
export const getCsmpOrder = (data) => {
  return axios.request({
    url: '/csmp/getCsmpOrder',
    params: data,
    desc: '查询单条数据',
    method: 'get',
    waitfor: true
  })
}
export const checkCanUpdate = (data) => {
  return axios.request({
    url: '/csmp/checkCanUpdate',
    params: data,
    desc: '修改前检查',
    method: 'get',
    waitfor: true
  })
}
export const getModules = (data) => {
  return axios.request({
    url: '/csmp/getModules',
    params: data,
    desc: '获取订购内容',
    method: 'get',
    waitfor: true
  })
}
export const importFile = (data) => {
  return axios.request({
    url: '/csmp/importCsmpOrders',
    data,
    desc: '导入',
    method: 'post',
    waitfor: true,
    responseType: 'blob'
  })
}