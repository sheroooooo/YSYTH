import axios from '@/api/api.request'
export const getProviderAndAgentByID = ({ }) => {
  return axios.request({
    url: '/csmp/getProviderAndAgentByID',
    params: {},
    desc: '获取服务机构',
    method: 'get',
    waitfor: true
  })
}
export const getAllCustomersList = ({ customerCode, customerName, agentIndeid, pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getAllCustomersList',
    params: { customerCode, customerName, agentIndeid, pageNum, pageSize },
    desc: '获取单位列表',
    method: 'get',
    waitfor: true
  })
}
export const saveForm = (data) => {
  let urlMap = {
    'add': '/csmp/saveCsmpCustomer',
    'update': '/csmp/updateCsmpCustomer'
  }
  return axios.request({
    url: urlMap[data.flag],
    data,
    desc: '保存',
    method: 'post',
    waitfor: true
  })
}
export const deleteCsmpCustomer = (data) => {
  return axios.request({
    url: '/csmp/deleteCsmpCustomer',
    data,
    desc: '删除',
    method: 'post',
    waitfor: true
  })
}
export const testMailConnection = ({ mailProtocol, mailHost, mailPort, mailUser, mailPassword }) => {
  return axios.request({
    url: '/csmp/testMailConnection',
    data: { mailProtocol, mailHost, mailPort, mailUser, mailPassword },
    desc: '测试邮箱连接',
    method: 'post',
    waitfor: true
  })
}
