import axios from '@/api/api.request'

export const getPlatform = (data) => {
  return axios.request({
    url: '/dep/platform/getPlatform',
    data: data,
    desc: '查询平台列表',
    method: 'post'
  })
}
export const editPlatform = (data) => {
  return axios.request({
    url: '/dep/platform/editPlatform',
    data: data,
    desc: '编辑平台列表',
    method: 'post'
  })
}
export const deletePlatform = (data) => {
  return axios.request({
    url: '/dep/platform/deletePlatform',
    data: data,
    desc: '删除平台列表',
    method: 'post'
  })
}