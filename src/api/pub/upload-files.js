import axios from '@/api/api.request'
// 预约地点下拉option接口
export const getUploadFileList = (data) => {
  return axios.request({
    url: '/getUploadFileList',
    data,
    method: 'post'
  })
}

/*
* 获取附件类型
*/
export const getFileTypeList = (data) => {
  return axios.request({
    url: '/' + data.url + '/fileOpertion/getFJLX',
    data: data.parmas,
    method: 'post'
  })
}

/* 附件列表展示 */
export const getFileList = (data) => {
  return axios.request({
    url: '/' + data.url + '/fileOpertion/getFileList',
    data: data.parmas,
    method: 'post'
  })
}

/* 附件删除 */
export const deleteFile = (data) => {
  return axios.request({
    url: '/' + data.url + '/fileOpertion/delete',
    data: data.parmas,
    method: 'post'
  })
}

/* 附件下载 */
export const downloadFile = (params) => {
  return axios.request({
    url: '/' + params.url + '/fileOpertion/download',
    params: params.data,
    method: 'get',
    responseType: 'blob'
  })
}

/* 附件名称修改 */
export const editFJName = (data) => {
  return axios.request({
    url: '/pub/fileOpertion/modifyOtherName',
    data,
    method: 'post'
  })
}
// 单据样式导出
export const djTemplateExport = ({ gsdm, kjnd, tempid, modcode, djlxid }) => {
  return axios.request({
    url: '/pub/djTemplateImportExport/djTemplateExport',
    data: { gsdm, kjnd, tempid, modcode, djlxid },
    desc: '模板样式导出',
    responseType: 'blob',
    method: 'post'
  })
}
