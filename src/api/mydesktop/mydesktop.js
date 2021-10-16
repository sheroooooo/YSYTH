import axios from '@/api/api.request'
export const getBusinessComponentPermission = ({ GSDM, KJQJ, ZTH }) => {
  return axios.request({
    url: '/pub/homePage/getBusinessComponentPermission',
    data: { GSDM, KJQJ, ZTH },
    desc: '工作台业务组件权限',
    method: 'post'
  })
}

export const getFinancialSituation = ({ GSDM, KJQJ, ZTH }) => {
  return axios.request({
    url: '/pub/businesscomponent/getFinancialSituation',
    data: { GSDM, KJQJ, ZTH },
    desc: '工作台账务情况查询',
    method: 'post'
  })
}
export const getCapitalAccountSituation = ({ GSDM, KJQJ, ZTH }) => {
  return axios.request({
    url: '/pub/businesscomponent/getCapitalAccountSituation',
    data: { GSDM, KJQJ, ZTH },
    desc: '资金类账户情况',
    method: 'post'
  })
}
export const getPurchasingBusinessInformation = ({ GSDM, KJND }) => {
  return axios.request({
    url: '/gpmc/interApi/getPurchasingBusinessInformation',
    data: { GSDM, KJND },
    desc: '采购情况',
    method: 'post'
  })
}

export const getContractSituation = ({ GSDM, KJND, ZTH }) => {
  return axios.request({
    url: 'pub/businesscomponent/getContractSituation',
    data: { GSDM, KJND, ZTH },
    desc: '工作台合同情况查询',
    method: 'post'
  })
}
export const myApprovalNum = ({ GSDM, KJND, ROLE }) => {
  return axios.request({
    url: '/pub/taskCenter/myApprovalNum',
    data: { GSDM, KJND, ROLE },
    desc: '任务中心待办数量查询',
    method: 'post'
  })
}
