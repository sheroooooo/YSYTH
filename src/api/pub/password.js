import axios from '@/api/api.request'

// 获取userId
export const getUserId = ({ userName }) => {
  return axios.request({
    url: '/pub/user/getUserId',
    data: { userName },
    method: 'post'
  })
}

// 验证密保是否正确
export const getIsAnswer = ({ gsdm, problem, answer, userId }) => {
  return axios.request({
    url: '/pub/user/getIsAnswer',
    data: { gsdm, problem, answer, userId },
    method: 'post'
  })
}

// 保存/修改密保问题
export const updateAnswer = ({ gsdm, password, problem, answer, userId }) => {
  return axios.request({
    url: '/pub/user/updateAnswer',
    data: { gsdm, password, problem, answer, userId },
    method: 'post'
  })
}

// 忘记密码：修改密码
export const forgetUpdatePassword = ({ gsdm, password1, password2, userId }) => {
  return axios.request({
    url: '/pub/user/forgetUpdatePassword',
    data: { gsdm, password1, password2, userId },
    method: 'post'
  })
}

// 获取当前用户密保问题
export const getUserAnswer = ({ gsdm, userId }) => {
  return axios.request({
    url: '/pub/user/getUserAnswer',
    data: { gsdm, userId },
    method: 'post'
  })
}
