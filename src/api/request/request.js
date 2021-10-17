import axios from '@/api/api.request'

export const getPlatform = (data) => {
  return axios.request({
    url: '/dep/platform/getPlatform',
    data: data,
    method: 'post'
  })
}
export const editPlatform = (data) => {
  return axios.request({
    url: '/dep/platform/editPlatform',
    data: data,
    method: 'post'
  })
}
export const deletePlatform = (data) => {
  return axios.request({
    url: '/dep/platform/deletePlatform',
    data: data,
    method: 'post'
  })
}
// 功能列表
export const getFunctions = (data) => {
  return axios.request({
    url: '/dep/Functions/getFunctions',
    data: data,
    method: 'post'
  })
}
export const editFunctions = (data) => {
  return axios.request({
    url: '/dep/Functions/editFunctions',
    data: data,
    method: 'post'
  })
}
export const deleteFunctions = (data) => {
  return axios.request({
    url: '/dep/Functions/deleteFunctions',
    data: data,
    method: 'post'
  })
}