import axios from '@/api/api.request'
export const getAllGlCzy = ({ czycode, name, roleid, pageNum, pageSize }) => {
  return axios.request({
    url: '/csmp/getAllGlCzy',
    data: { czycode, name, roleid, pageNum, pageSize },
    desc: '获取表格数据',
    method: 'post',
    waitfor: true
  })
}
export const getGlCzyById = ({ id }) => {
  return axios.request({
    url: '/csmp/getGlCzyById',
    data: { id },
    desc: '获取单条数据',
    method: 'post',
    waitfor: true
  })
}
export const saveGlCzy = (data) => {
  let urlMap = {
    'add': '/csmp/saveGlCzy',
    'update': '/csmp/updateGlCzy'
  }
  return axios.request({
    url: urlMap[data.flag],
    data,
    desc: '保存',
    method: 'post',
    waitfor: true
  })
}
export const deleteGlCzy = (data) => {
  return axios.request({
    url: '/csmp/deleteGlCzy',
    data,
    desc: '删除',
    method: 'post',
    waitfor: true
  })
}