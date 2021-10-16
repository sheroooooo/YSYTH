import axios from '@/api/api.request'

export const login = ({ userName, password, userId, loginDate }) => {
  const data = {
    user: userName,
    password,
    userId,
    ywrq: loginDate,
    type: 'yfwpt_web'
  }
  return axios.request({
    url: '/pub/user/login',
    data,
    method: 'post'
  })
}
export const logout = (token) => {
  return axios.request({
    url: '/pub/user/loginOutForType',
    data: { type: 'yfwpt_web' },
    method: 'post'
  })
}
export const asyncData = (data) => {
  return axios.request({
    data,
    url: '/sync/upgradeData/upgradeData',
    method: 'post',
    waitfor: true
  })
}

export const getContext = () => {
  return axios.request({
    url: '/pub/user/getContext',
    method: 'post'
  })
}
// 修改密码
export const updatePassword = (data) => {
  return axios.request({
    url: '/pub/user/updatePassword',
    data,
    method: 'post'
  })
}
// 修改密码
export const csmpUpdatePassword = ({ oldPassword, password, passwordConfirm }) => {
  return axios.request({
    url: '/csmp/updatePassword',
    data: { oldPassword, password, passwordConfirm },
    method: 'post'
  })
}
export const refreshToken = (token) => {
  return axios.request({
    url: '/pub/user/refreshToken',
    method: 'post',
    data: { 'Authorization': token, type: 'yfwpt_web' }
  })
}
// 重置密码
export const resetPassword = (data) => {
  return axios.request({
    url: '/pub/user/resetPassword',
    data,
    method: 'post'
  })
}
// 修改个人信息
export const getPersonMessages = ({ gsdm, kjnd, czycode }) => {
  return axios.request({
    url: '/pub/user/getPersonMessages',
    data: { gsdm, kjnd, czycode },
    method: 'post'
  })
}
export const updatePerson = ({ gsdm, zydm, ...userinfo }) => {
  return axios.request({
    url: '/pub/user/updatePerson',
    data: { gsdm, zydm, ...userinfo },
    method: 'post'
  })
}
// 获取个人信息
export const getYHInfo = () => {
  return {
    'data': [{
      label: '开户银行',
      name: 'khyh',
      value: '',
      type: 'tree-select',
      props: { 'dataSources': '135' }
    },
    {
      label: '公务卡开户行',
      name: 'gwkyh',
      value: '',
      type: 'tree-select',
      props: { 'dataSources': '135' }
    }
    ]
  }
}
export const getZJInfo = () => {
  return {
    'data': [{
      label: '职级',
      name: 'zhiji',
      value: '',
      type: 'tree-select',
      props: { 'dataSources': '133' }
    }]
  }
}
// 生态第三方系统接口用（BSO）
export const getCruxCookie = () => {
  return axios.request({
    url: '/pub/user/getCruxCookie',
    method: 'post'
  })
}

export const getOtherInfo = (data) => {
  return axios.request({
    url: '/pub/user/getOtherInfo',
    data: data,
    method: 'post'
  })
}

export const getOtherWebpath = ({ modCode }) => {
  return axios.request({
    url: '/pub/customMenu/getOtherWebpath',
    data: { modCode },
    method: 'post'
  })
}

/*  获取工作方案可选列表  */
export const getWorkPlanLists = () => {
  return axios.request({
    url: '/pub/workPlatform/getFinallyScheme ',
    method: 'post'
  })
}

/*  获取工作方案可选列表  */
export const getSatusTable = data => {
  return axios.request({
    url: '/pub/workPlatform/getAvailableSchemeByUser',
    data,
    method: 'post'
  })
}

/*  获取当前使用的方案 */
export const getUseSatusPlan = data => {
  return axios.request({
    url: '/pub/workPlatform/getFinallyScheme',
    data,
    method: 'post'
  })
}

/* 保存当前使用的方案 */
export const saveUseSatusPlan = data => {
  return axios.request({
    url: '/pub/workPlatform/saveFinallyScheme',
    data,
    method: 'post'
  })
}
// 获取应用设置显示权限
export const getDBVersion = data => {
  return axios.request({
    url: '/pubgy/dbversion/getDBVersion',
    data,
    desc: '获取应用设置显示权限',
    method: 'post'
  })
}
// 获取关于数据
export const getAboutData = data => {
  return axios.request({
    url: '/pub/common/about',
    data,
    desc: '获取关于数据',
    method: 'post'
  })
}
