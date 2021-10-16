import axios from '@/api/api.request'

export const getAllCustomers = () => {
  return axios.request({
    url: '/csmp/getAllCustomers',
    params: {},
    desc: '查询服务商下属单位',
    method: 'get',
    waitfor: true
  })
}

export const getCsmpGroups = ({ pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getCsmpGroups',
    params: { pageNum, pageSize },
    desc: '查询单位组列表',
    method: 'get',
    waitfor: true
  })
}

export const getCsmpGroupByGroupId = ({ groupId }) => {
  return axios.request({
    url: '/csmp/getCsmpGroupByGroupId',
    params: { groupId },
    desc: '查询单位组',
    method: 'get',
    waitfor: true
  })
}

export const saveCsmpGroup = ({ name, remark, customerIndeids }) => {
  return axios.request({
    url: '/csmp/saveCsmpGroup',
    data: { name, remark, customerIndeids },
    desc: '保存单位组',
    method: 'post',
    waitfor: true
  })
}

export const updateCsmpGroup = ({ groupId, name, remark, customerIndeids }) => {
  return axios.request({
    url: '/csmp/updateCsmpGroup',
    data: { groupId, name, remark, customerIndeids },
    desc: '修改单位组',
    method: 'post',
    waitfor: true
  })
}

export const deleteCsmpGroup = ({ groupId }) => {
  return axios.request({
    url: '/csmp/deleteCsmpGroup',
    data: { groupId },
    desc: '删除单位组',
    method: 'post',
    waitfor: true
  })
}