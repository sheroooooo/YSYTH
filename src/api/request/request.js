import axios from '@/api/api.request'

export const getPlatform = (data) => {
  return axios.request({
    url: '/dep/platform/getPlatform',
    data: data,
    desc: '查询服务商授权数据',
    method: 'post',
    waitfor: true
  })
}
/dep/platform/deletePlatform