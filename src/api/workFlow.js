import axios from '@/api/api.request'

/* 单笔审核 */
export const checkgspformregister = (data) => {
  let { url, ...other } = data
  let urlMap = {
    'gsp': '/gsp/checkgsp/checkgspformregister',
    'oer': '/oer/checkOer/checkOerFormRegister',
    'faqc': '/faqc/applyForm/checkCard',
    'pms': '/pms/review/reviewActions',
    'pao': '/pao/review/reviewAction'
  }
  return axios.request({
    url: urlMap[url],
    data: other,
    method: 'post',
    waitfor: true
  })
}

/* 作废单据 */
export const cancelDJ = (data) => {
  let { url = 'gsp', ...other } = data
  let urlMap = {
    'gsp': '/gsp/applyForm/cancelDJ',
    'oer': '/oer/oerRegister/cancelForm',
    'faqc': '/faqc/applyForm/cancelDJ'
  }
  return axios.request({
    url: urlMap[url],
    data: other,
    method: 'post',
    waitfor: true
  })
}

/* 还原单据 */
export const restoreDJ = (data) => {
  let { url = 'gsp', ...other } = data
  let urlMap = {
    'gsp': '/gsp/applyForm/restoreDJ',
    'oer': '/oer/oerRegister/restoreForm'
  }
  return axios.request({
    url: urlMap[url],
    data: other,
    method: 'post',
    waitfor: true
  })
}

/* 批量审核 */
export const batchCheckGSPForMregister = (data) => {
  return axios.request({
    url: '/gsp/checkgsp/batchcheckgspformregister',
    data,
    method: 'post',
    waitfor: true
  })
}

/* 批量删除 */
export const batchDeleteForm = (data) => {
  return axios.request({
    url: '/gsp/applyForm/batchDeleteForm',
    data,
    method: 'post',
    waitfor: true
  })
}
/* 审核日志表头 */
export const approverLog = () => {
  return [
    {
      title: '序号',
      type: 'index',
      width: 60,
      align: 'left'
    },
    {
      title: '审批人',
      key: 'auditor',
      width: 100,
      tooltip: true
    },
    {
      title: '处理时间',
      key: 'adateTime',
      tooltip: true
    },
    {
      title: '是否审批',
      key: 'aType',
      width: 100,
      tooltip: true
    },
    {
      title: '审批意见',
      key: 'remark',
      tooltip: true
    },
    {
      title: '下一审批节点',
      width: 150,
      key: 'nodeName',
      tooltip: true
    }
  ]
}
/* 审核流日志-修改之后的接口 */
/* 用款计划界面查看审核日志接口加判断 */
export const getworkFlowlog = (data) => {
  if (data.url === 'gcp') {
    if (data.params.jhid) {
      return axios.request({
        url: '/gcp/ykjhcheck/getWorkFlowLog',
        data: data.params,
        method: 'post',
        desc: '审核日志'
      })
    } else if (data.params.tzdid) {
      return axios.request({
        url: '/gcp/tzdcheck/getWorkFlowLog',
        data: data.params,
        method: 'post',
        desc: '审核日志'
      })
    }
  } else if (data.url === 'rm') {
    return axios.request({
      url: '/rm/receivemoney/getFlowLog',
      data: data.params,
      method: 'post',
      desc: '审核日志'
    })
  } else {
    return axios.request({
      url: '/' + data.url + '/' + data.url + 'WorkFlowLog/getWorkFlowLog',
      data: data.params,
      method: 'post',
      desc: '审核日志'
    })
  }
}
