import axios from '@/api/api.request'
// 获取经费申请查询条件接口
export const getCondictionList = ({ GSDM, KJND, MODCODE, CARDTYPE }) => {
  let url = '/gsp/selectGspBill/getCondictionList'
  let urlMap = {
    '9982': '/oer/selectGldj/getCondictionList' // 关联网报
  }
  return axios.request({
    url: urlMap[CARDTYPE] ? urlMap[CARDTYPE] : url,
    data: { GSDM, KJND, MODCODE },
    desc: '查询条件',
    method: 'post',
    waitfor: true

  })
}
// 获取经费申请表格标题列
// otherParams 为模块特有参数
export const getGridColumns = ({ GSDM, KJND, MODCODE, BXDJLXID, CARDTYPE = '3', ...otherParams }) => {
  let urlMap = {
    '3': '/gsp/selectGspBill/getGridColumns',
    '9981': '/gsp/selectGspBill/getGldjGridColumns', // 关联经费申请
    '9982': '/oer/selectGldj/getGridColumns' // 关联网报
  }
  let dataMap = {
    '3': { GSDM, KJND, MODCODE, BXDJLXID, ...otherParams },
    '9981': {},
    '9982': {}
  }
  return axios.request({
    url: urlMap[CARDTYPE],
    data: dataMap[CARDTYPE],
    desc: '获取表头',
    method: 'post',
    waitfor: true
  })
}
// 获取经费申请表格数据
// otherParams 为模块特有参数
export const getGspBillData = ({ GSDM, ZTH, MLID, KJND, MODCODE, BXDJLXID, CARDTYPE = '3', ...otherParams }) => {
  let urlMap = {
    '3': '/gsp/selectGspBill/getGspBillData',
    '9981': '/gsp/selectGspBill/getGldjGspBillData', // 关联申请
    '9982': '/oer/selectGldj/getGridData ' // 关联网报
  }
  return axios.request({
    url: urlMap[CARDTYPE],
    data: { GSDM, KJND, ZTH, MLID, MODCODE, BXDJLXID, ...otherParams },
    desc: '获取数据',
    method: 'post',
    waitfor: true
  })
}
// 点击单据编号跳转前获取单据信息
export const getDJMainInfo = (data) => {
  return axios.request({
    url: '/pubgy/oerCommon/getDJMainInfo',
    data,
    desc: '点击单据编号跳转前获取单据信息',
    method: 'post',
    waitfor: true
  })
}
