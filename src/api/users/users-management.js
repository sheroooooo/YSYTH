import axios from '@/api/api.request'

export const getUsers = ({ indename, name, phonenumber, pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getUsers',
    params: { indename, name, phonenumber, pageNum, pageSize },
    desc: '查询用户列表',
    method: 'get',
    waitfor: true
  })
}

export const getUserById = ({ id }) => {
  return axios.request({
    url: '/csmp/getUserById',
    params: { id },
    desc: '查询用户',
    method: 'get',
    waitfor: true
  })
}

// serviceManager（服务管理员：1、是，0、否）
// syzt（使用状态：1、使用，2、冻结）
export const updateUser = (data) => {
  return axios.request({
    url: '/csmp/updateUser',
    data,
    desc: '修改用户',
    method: 'post',
    waitfor: true
  })
}
export const saveUser = (data) => {
  return axios.request({
    url: '/csmp/saveUser',
    data,
    desc: '新增用户',
    method: 'post',
    waitfor: true
  })
}