import axios from '@/api/api.request'

export const updateDzfpSetting = ({ gsdm, dzfpjk, list }) => {
  return axios.request({
    url: '/csmp/updateDzfpSetting',
    data: { gsdm, dzfpjk, list },
    desc: '修改合合接口设置',
    method: 'post',
    waitfor: true
  })
}

export const getDzfpSetting = ({ gsdm, dzfpjk }) => {
  return axios.request({
    url: '/csmp/getDzfpSetting',
    params: { gsdm, dzfpjk },
    desc: '查询合合接口设置',
    method: 'get',
    waitfor: true
  })
}

export const getAllCsmpServer = () => {
  return axios.request({
    url: '/csmp/getAllCsmpServer',
    params: {},
    desc: '查询服务名称',
    method: 'get',
    waitfor: true
  })
}

export const getCsmpStocks = ({}) => {
  return axios.request({
    url: '/csmp/getCsmpStocks',
    params: {},
    desc: '查询授权库存',
    method: 'get',
    waitfor: true
  })
}

export const saveCsmpStock = (data) => {
  return axios.request({
    url: '/csmp/saveCsmpStock',
    data,
    desc: '保存授权库存',
    method: 'post',
    waitfor: true
  })
}

export const updateCsmpStock = (data) => {
  return axios.request({
    url: '/csmp/updateCsmpStock',
    data,
    desc: '修改授权库存',
    method: 'post',
    waitfor: true
  })
}

export const deleteByStoreId = ({ storeId }) => {
  return axios.request({
    url: '/csmp/deleteByStoreId',
    data: { storeId },
    desc: '删除授权库存',
    method: 'post',
    waitfor: true
  })
}