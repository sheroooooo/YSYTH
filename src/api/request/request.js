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
// 访问路由
export const getUrl = (data) => {
  return axios.request({
    url: '/dep/Url/getUrl',
    data: data,
    method: 'post'
  })
}
export const editUrl = (data) => {
  return axios.request({
    url: '/dep/Url/editUrl',
    data: data,
    method: 'post'
  })
}
export const deleteUrl = (data) => {
  return axios.request({
    url: '/dep/Url/deleteUrl',
    data: data,
    method: 'post'
  })
}
// 功能与临时表对应关系
export const getFuncTableRelation = (data) => {
  return axios.request({
    url: '/dep/FuncTableRelation/getFuncTableRelation',
    data: data,
    method: 'post'
  })
}
export const editFuncTableRelation = (data) => {
  return axios.request({
    url: '/dep/FuncTableRelation/editFuncTableRelation',
    data: data,
    method: 'post'
  })
}
export const deleteFuncTableRelation = (data) => {
  return axios.request({
    url: '/dep/FuncTableRelation/deleteFuncTableRelation',
    data: data,
    method: 'post'
  })
}
// 参数设置
export const getParams = (data) => {
  return axios.request({
    url: '/dep/Params/getParams',
    data: data,
    method: 'post'
  })
}
export const editParams = (data) => {
  return axios.request({
    url: '/dep/Params/editParams',
    data: data,
    method: 'post'
  })
}
export const deleteParams = (data) => {
  return axios.request({
    url: '/dep/Params/deleteParams',
    data: data,
    method: 'post'
  })
}
// 数据映射默认值
export const getDefault = (data) => {
  return axios.request({
    url: '/dep/Default/getDefault',
    data: data,
    method: 'post'
  })
}
export const editDefault = (data) => {
  return axios.request({
    url: '/dep/Default/editDefault',
    data: data,
    method: 'post'
  })
}
export const deleteDefault = (data) => {
  return axios.request({
    url: '/dep/Default/deleteDefault',
    data: data,
    method: 'post'
  })
}
// 加密方式
export const getPwdType = (data) => {
  return axios.request({
    url: '/dep/PwdType/getPwdType',
    data: data,
    method: 'post'
  })
}
export const editPwdType = (data) => {
  return axios.request({
    url: '/dep/PwdType/editPwdType',
    data: data,
    method: 'post'
  })
}
export const deletePwdType = (data) => {
  return axios.request({
    url: '/dep/PwdType/deletePwdType',
    data: data,
    method: 'post'
  })
}