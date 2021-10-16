import axios from '@/api/api.request'
// 查询指标
export const zbQuery = (data) => {
  return axios.request({
    url: '/api/gbi/zbQuery',
    data,
    method: 'post'
  })
}
// 指标统计
export const zbStatistics = (data) => {
  return axios.request({
    url: '/api/gbi/zbStatistics',
    data,
    method: 'post'
  })
}
