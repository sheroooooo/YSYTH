import axios from '@/api/api.request'

// 参数设置保存
export const saveParameter = (data) => {
  return axios.request({
    url: '/sa/parameterSettings/saveParameter',
    data,
    desc: '参数设置保存',
    method: 'post',
    waitfor: true
  })
}

// 外币列表
export const getWBList = (data) => {
  return axios.request({
    url: '/sa/parameterSettings/getWBList',
    data,
    desc: '外币列表',
    method: 'post',
    waitfor: true
  })
}
// 外币列表
export const getParameter = (data) => {
  return axios.request({
    url: '/sa/parameterSettings/getParameter',
    data,
    desc: '获取系统参数',
    method: 'post',
    waitfor: true
  })
}
