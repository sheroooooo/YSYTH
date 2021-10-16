import axios from '@/api/api.request'
// 计算标准
export const getComboxData = (url, data) => {
  let { gsdm, kjnd, standardCode, ...other } = data
  let index = ''
  Object.keys(other).map((key, position) => {
    if (other[key] !== '') {
      index = position
    }
    other[key] = (other[key] && other[key].toString()) || ''
  })
  if (index !== -1) {
    return axios.request({
      url: url,
      data: { ...data, ...other },
      method: 'post',
      desc: '标准计算'
    })
  }
  // 如果都是空,前端手动返回空值.
  // 可以取消新建单子第一次请求后台.减少请求次数
  return new Promise((resolve, reject) => {
    resolve({ data: '' })
  })
}
// 单据校验接口
export const billVerify = (data, url) => {
  return axios.request({
    url: url,
    data,
    desc: '单据校验',
    method: 'post'
  })
}
export const getYszbAndJfsqByJkd = (data) => {
  return axios.request({
    url: '/oer/applyForm/getYszbAndJfsqByJkd',
    data,
    desc: '获取详情',
    method: 'post'
  })
}
