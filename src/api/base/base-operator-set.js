import axios from '@/api/api.request'

export const getAllCsmpProviders = ({ providerCode, providerName, pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getAllCsmpProviders',
    params: { providerCode, providerName, pageNum, pageSize },
    desc: '查询运营商列表',
    method: 'get',
    waitfor: true
  })
}

export const getCsmpProvider = ({ providerIndeid }) => {
  return axios.request({
    url: '/csmp/getCsmpProvider',
    params: { providerIndeid },
    desc: '查询运营商详情信息',
    method: 'get',
    waitfor: true
  })
}

export const saveCsmpProvider = (data) => {
  return axios.request({
    url: '/csmp/saveCsmpProvider',
    data,
    desc: '保存运营商详情信息',
    method: 'post',
    waitfor: true
  })
}

export const updateCsmpProvider = (data) => {
  return axios.request({
    url: '/csmp/updateCsmpProvider',
    data,
    desc: '修改运营商详情信息',
    method: 'post',
    waitfor: true
  })
}

export const deleteCsmpProviders = ({ providerIndeids }) => {
  return axios.request({
    url: '/csmp/deleteCsmpProviders',
    data: { providerIndeids },
    desc: '删除运营商信息',
    method: 'post',
    waitfor: true
  })
}
