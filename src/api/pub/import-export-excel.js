import axios from '@/api/api.request'
// 获取初始化对应关系表头
export const getTemTable = () => {
  return [
    {
      title: '字段名',
      field: 'NAME',
      fieldType: '',
      readOnly: false
    },
    {
      title: '数据类型',
      field: 'TYPE',
      fieldType: '',
      readOnly: false
    },
    {
      title: '对应列',
      field: 'EXCEL_NAME',
      fieldType: '',
      readOnly: false
    }
  ]
}
// 导出模板
export const outPutModule = (data) => {
  return axios.request({
    url: '/pub/excel/outPutModule',
    data,
    desc: '导出模板',
    method: 'post',
    responseType: 'blob'
  })
}
// 获取数据
export const getDataTableInfo = (data) => {
  return axios.request({
    url: '/pub/excel/getDataTableInfo',
    data,
    desc: '获取表格数据',
    method: 'post'
  })
}
// 导出
export const outPut = (data) => {
  let url = '/pub/excel/outPut'
  if (data.modCode === 'OER') {
    url = '/oer/common/output'
  } else if (data.modCode === 'GSP') {
    url = '/gsp/common/output'
  }
  return axios.request({
    url,
    data,
    desc: '导出数据',
    method: 'post',
    responseType: 'blob'
  })
}

// 公共模板导入接口
export const getFileUpLoad = (data) => {
  return axios.request({
    url: data.get('url'),
    data,
    desc: '模板导入',
    method: 'post',
    waitfor: true,
    getres: true
  })
}
