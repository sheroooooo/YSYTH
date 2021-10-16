import axios from '@/api/api.request'

export const getAllAgentsList = ({ agentCode, agentName, providerIndeid, pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getAllAgentsList',
    params: { agentCode, agentName, providerIndeid, pageNum, pageSize },
    desc: '查询服务商列表',
    method: 'get',
    waitfor: true
  })
}

export const getProviderByID = ({ }) => {
  return axios.request({
    url: '/csmp/getProviderByID',
    params: {},
    desc: '查询所属服务商',
    method: 'get',
    waitfor: true
  })
}

export const updateCsmpAgent = (data) => {
  return axios.request({
    url: '/csmp/updateCsmpAgent',
    data,
    desc: '修改服务商信息',
    method: 'post',
    waitfor: true
  })
}

export const saveCsmpAgent = (data) => {
  return axios.request({
    url: '/csmp/saveCsmpAgent',
    data,
    desc: '新增服务商信息',
    method: 'post',
    waitfor: true
  })
}

export const deleteCsmpAgent = ({ idList }) => {
  return axios.request({
    url: '/csmp/deleteCsmpAgent',
    data: { idList },
    desc: '删除服务商',
    method: 'post',
    waitfor: true
  })
}
