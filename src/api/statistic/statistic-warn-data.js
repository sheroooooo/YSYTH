import axios from '@/api/api.request'

export const getWarnInvoices = ({ pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getWarnInvoices',
    params: { pageNum, pageSize },
    desc: '查询预警数据',
    method: 'get',
    waitfor: true
  })
}