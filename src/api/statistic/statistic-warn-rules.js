import axios from '@/api/api.request'

export const getWarnRules = ({ }) => {
  return axios.request({
    url: '/csmp/getWarnRules',
    params: {},
    desc: '查询预警规则',
    method: 'get',
    waitfor: true
  })
}
export const saveWarnRule = ({ code, name, enable, mode, buyerName, buyerNumber, amount, billnames, vouchernames }) => {
  return axios.request({
    url: '/csmp/saveWarnRule',
    data: { code, name, enable, mode, buyerName, buyerNumber, amount, billnames, vouchernames },
    desc: '保存预警规则',
    method: 'post',
    waitfor: true
  })
}
export const updateWarnRule = ({ code, name, enable, mode, buyerName, buyerNumber, amount, billnames, vouchernames, id }) => {
  return axios.request({
    url: '/csmp/updateWarnRule',
    data: { code, name, enable, mode, buyerName, buyerNumber, amount, billnames, vouchernames, id },
    desc: '修改预警规则',
    method: 'post',
    waitfor: true
  })
}
export const deleteWarnRule = ({ id }) => {
  return axios.request({
    url: '/csmp/deleteWarnRule',
    data: { id },
    desc: '删除预警规则',
    method: 'post',
    waitfor: true
  })
}
export const getBillTypes = ({ }) => {
  return axios.request({
    url: '/csmp/getBillTypes',
    params: {},
    desc: '查询所有费用性质',
    method: 'get',
    waitfor: true
  })
}
export const getVoucherNames = ({ }) => {
  return axios.request({
    url: '/csmp/getVoucherNames',
    params: {},
    desc: '查询所有费用明细',
    method: 'get',
    waitfor: true
  })
}