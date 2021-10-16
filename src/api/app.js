import axios from '@/api/api.request'

export const getModal = ({ gsdm, zth, kjnd, productType, loginDate }) => {
  return axios.request({
    url: '/pub/menu/getMainMenu',
    method: 'post',
    data: { gsdm, zth, kjnd, productType, 'ywrq': loginDate }
  })
}
export const getModalMenu = ({ gsdm, zth, kjnd, modCode, productType, loginDate }) => {
  return axios.request({
    url: '/pub/menu/getDetailMenu',
    method: 'post',
    data: { gsdm, zth, kjnd, modCode, productType, 'ywrq': loginDate }
  })
}
export const setEnvironment = (dwdm, ztbh, loginDate) => {
  return axios.request({
    url: '/pub/homePage/setSelfEnvironment',
    method: 'post',
    data: { dwdm, ztbh, 'ywrq': loginDate }
  })
}
// 通过外接入门户取登录信息
export const getExternalEnv = () => {
  return axios.request({
    url: '/pub/user/loginInit',
    method: 'post',
    data: {}
  })
}
export const getDWZT = ({ kjnd }) => {
  return axios.request({
    url: '/pub/homePage/getEnvironment',
    data: { 'code': '', 'date': kjnd },
    method: 'post'
  })
}
export const getBillGroupEnv = (data) => {
  let { url, ...params } = data
  return axios.request({
    url,
    method: 'post',
    data: params
  })
}
// 取单位菜单权限
export const getMenuRight = ({ GSDM, KJND, ZTH, WEBPATH, YWRQ, MODE }) => {
  return axios.request({
    url: '/pub/common/checkPagePermission',
    data: { GSDM, KJND, ZTH, WEBPATH, YWRQ, MODE },
    method: 'post'
  })
}
// 取产品信息
export const getProductInfo = () => {
  return axios.request({
    url: '/pub/common/getProductInfo',
    method: 'post',
    data: {}
  })
}
