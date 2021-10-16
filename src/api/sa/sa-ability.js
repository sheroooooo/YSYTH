import axios from '@/api/api.request'
// 获取角色树
export const getRoleTree = data => {
  return axios.request({
    url: '/sa/permission/getRoleTree',
    data,
    desc: '获取角色树',
    method: 'post',
    waitfor: true
  })
}

// 获取角色负责人
export const getAuthorizer = data => {
  return axios.request({
    url: '/sa/permission/getAuthorizer',
    data,
    desc: '获取角色负责人',
    method: 'post',
    waitfor: true
  })
}

// 获取下级角色编码
export const getCzyCode = data => {
  return axios.request({
    url: '/sa/permission/getCzyCode',
    data,
    desc: '获取下级角色编码',
    method: 'post',
    waitfor: true
  })
}

// 修改角色
export const uptRoleById = data => {
  return axios.request({
    url: '/sa/permission/uptRoleById',
    data,
    desc: '修改角色',
    method: 'post',
    waitfor: true
  })
}

// 新增角色
export const insRole = data => {
  return axios.request({
    url: '/sa/permission/insRole',
    data,
    desc: '新增角色',
    method: 'post',
    waitfor: true
  })
}

// 删除角色
export const delRoleById = data => {
  return axios.request({
    url: '/sa/permission/delRoleById',
    data,
    desc: '删除角色',
    method: 'post',
    waitfor: true
  })
}

// 查询功能分类大类
export const getMainGnfl = data => {
  return axios.request({
    url: '/sa/permission/getMainGnfl',
    data,
    desc: '查询功能分类大类',
    method: 'post',
    waitfor: true
  })
}

// 查询功能分类大类(批量)
export const selMainGnqx = data => {
  return axios.request({
    url: '/sa/permission/selMainGnqx',
    data,
    desc: '查询功能分类大类(批量)',
    method: 'post',
    waitfor: true
  })
}

// 查询功能权限明细
export const getDetailGnfl = data => {
  return axios.request({
    url: '/sa/permission/getDetailGnfl',
    data,
    desc: '查询功能权限明细',
    method: 'post',
    waitfor: true
  })
}

// 查询功能权限明细(模块)
export const selDetailGnqx = data => {
  return axios.request({
    url: '/sa/permission/selDetailGnqx',
    data,
    desc: '查询功能权限明细(模块)',
    method: 'post',
    waitfor: true
  })
}

// 查询功能权限明细
export const getCzyTableDataByRoleId = data => {
  return axios.request({
    url: '/sa/czy/getCzyTableDataByRoleId',
    data,
    desc: '查询功能权限明细',
    method: 'post',
    waitfor: true
  })
}

// 授权
export const updateDetailPermission = data => {
  return axios.request({
    url: '/sa/permission/updateDetailPermission',
    data,
    desc: '授权',
    method: 'post',
    waitfor: true
  })
}

// 批量授权
export const updateMainPermission = data => {
  return axios.request({
    url: '/sa/permission/updateMainPermission',
    data,
    desc: '批量授权',
    method: 'post',
    waitfor: true
  })
}

// 权限移交
export const transferPermission = data => {
  return axios.request({
    url: '/sa/permission/transferPermission',
    data,
    desc: '权限移交',
    method: 'post',
    waitfor: true
  })
}

// 获取权限用户
export const transferOwner = data => {
  return axios.request({
    url: '/sa/permission/transferOwner',
    data,
    desc: '获取权限用户',
    method: 'post',
    waitfor: true
  })
}

// 单据授权查询
export const getFormPermission = data => {
  return axios.request({
    url: '/pub/customMenu/getCustomForm',
    data,
    desc: '单据授权查询',
    method: 'post',
    waitfor: true
  })
}

// 保存授权
export const updateFormPermission = data => {
  return axios.request({
    url: '/sa/permission/updateFormPermission',
    data,
    desc: '保存授权',
    method: 'post',
    waitfor: true
  })
}

/* 表格表头 */
export const tableHead = () => {
  return [
    {
      key: 'ID',
      title: '用户ID'

    },
    {
      key: 'CZYCODE',
      title: '用户代码'
    },
    {
      key: 'NAME',
      title: '用户名称'

    },
    {
      key: 'GSMC',
      title: '所属单位'

    }
  ]
}
