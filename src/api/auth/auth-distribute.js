import axios from '@/api/api.request'

export const getCsmpAgentOrders = ({ startDate, endDate, odoId, serviceid, mode, pageNum, pageSize }) => {
  return axios.request({
    url: `/csmp/getCsmpAgentOrders?pageNum=${pageNum}&pageSize=${pageSize}`,
    data: { startDate, endDate, odoId, serviceid, mode },
    desc: '查询服务商授权数据',
    method: 'post',
    waitfor: true
  })
}

export const getAllCsmpServer = () => {
  return axios.request({
    url: '/csmp/getAllCsmpServer',
    params: {},
    desc: '查询服务内容',
    method: 'get',
    waitfor: true
  })
}

export const authorizeBatch = ({ orderIds }) => {
  return axios.request({
    url: '/csmp/authorizeBatch',
    data: { orderIds },
    desc: '批量授权',
    method: 'post',
    waitfor: true
  })
}

export const getAllCustomers = ({ agentIndeid }) => {
  return axios.request({
    url: '/csmp/getAllCustomers',
    params: { agentIndeid },
    desc: '查询服务商下属单位',
    method: 'get',
    waitfor: true
  })
}

export const saveCsmpOrderallocation = (data) => {
  return axios.request({
    url: '/csmp/saveCsmpOrderallocation',
    data,
    desc: '服务商授权分发',
    method: 'post',
    waitfor: true
  })
}

export const updateCsmpOrderallocation = (data) => {
  return axios.request({
    url: '/csmp/updateCsmpOrderallocation',
    data,
    desc: '服务商授权分发',
    method: 'post',
    waitfor: true
  })
}

export const deleteCsmpOrderallocations = ({ allocationId }) => {
  return axios.request({
    url: '/csmp/deleteCsmpOrderallocations',
    data: { allocationId },
    desc: '服务商授权信息删除',
    method: 'post',
    waitfor: true
  })
}

export const getCsmpOrderallocations = ({ orderId }) => {
  return axios.request({
    url: '/csmp/getCsmpOrderallocations',
    params: { orderId },
    desc: '服务商授权信息查询',
    method: 'get',
    waitfor: true
  })
}

export const activateCsmpOrderallocation = ({ allocationId }) => {
  return axios.request({
    url: '/csmp/activateCsmpOrderallocation',
    data: { allocationId },
    desc: '激活授权',
    method: 'post',
    waitfor: true
  })
}