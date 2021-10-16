import axios from '@/api/api.request'
// 取基础资料树表内容，LBDM:类别代码;ISCHANGE: '0' 非树状 '1' 树状; UNFROZEN: '0' 包含已冻结项 '1' 不包含已冻结项 FZDM? 查询单条:查询全部
export const getBaseData = ({ GSDM, KJND, ZTH, LBDM, DWXZDM, ISCHANGE, UNFROZEN, FZDM, DQDM, timeStamp, MODCODE }) => {
  return axios.request({
    url: '/bas/auxiliaryAccountingItems/getAuxiliaryAccountingItems',
    data: { GSDM, KJND, ZTH, LBDM, DWXZDM, ISCHANGE, UNFROZEN, FZDM, DQDM, timeStamp, MODCODE },
    desc: '取基础资料树表内容',
    method: 'post',
    waitfor: true
  })
}
export const getBaseDataTitle = ({ LBDM }) => {
  return axios.request({
    url: '/bas/auxiliaryAccountingItems/getAuxiliaryAccountingItemsTitle',
    data: { LBDM },
    desc: '取基础资料树表表头',
    method: 'post',
    waitfor: true
  })
}
export const getZJM = ({ NAME }) => {
  return axios.request({
    url: '/pub/common/getZjm',
    data: { NAME },
    desc: '生成助记码',
    method: 'post',
    waitfor: true
  })
}
export const getLevel = ({ GSDM, KJND, LBDM }) => {
  return axios.request({
    url: '/bas/common/getLevel',
    data: { GSDM, KJND, LBDM },
    desc: '取基础资料编码规则',
    method: 'post',
    waitfor: true
  })
}
export const createOrUpdateFunctionSubjects = (data) => {
  return axios.request({
    url: '/bas/auxiliaryAccountingItems/saveOrUpdateAuxiliaryAccountingItems',
    data: data,
    desc: '新增或修改树表数据',
    method: 'post',
    waitfor: true
  })
}
export const deleteFunctionSubjects = ({ GSDM, KJND, ZTH, LBDM, FZDMLIST }) => {
  return axios.request({
    url: '/bas/auxiliaryAccountingItems/deleteAuxiliaryAccountingItems',
    data: { GSDM, KJND, ZTH, LBDM, FZDMLIST },
    desc: '删除树表数据',
    method: 'post',
    waitfor: true
  })
}
// ISCHANGE 返回数据是否是树结构 0 非 1 是
export const allAdjustSubject = ({ GSDM, KJND, ZTH, LBDM, ISCHANGE }) => {
  return axios.request({
    url: '/bas/relation/allAdjustSubject',
    data: { GSDM, KJND, ZTH, LBDM, ISCHANGE },
    desc: '建立科目关联联系，获取科目信息(由科目选择辅助项)',
    method: 'post',
    waitfor: true
  })
}
export const getItems = ({ GSDM, KJND, ZTH, LBDM, FXDMLIST }) => {
  return axios.request({
    url: '/bas/relation/getItems',
    data: { GSDM, KJND, ZTH, LBDM, FXDMLIST },
    desc: '查询4-30科目',
    method: 'post',
    waitfor: true
  })
}
export const getItemsRever = ({ GSDM, KJND, ZTH, LBDM, KMDMLIST, MODCODE }) => {
  return axios.request({
    url: '/bas/relation/getItemsRever',
    data: { GSDM, KJND, ZTH, LBDM, KMDMLIST, MODCODE },
    desc: '查询4-30辅助项',
    method: 'post',
    waitfor: true
  })
}
export const updateItems = ({ GSDM, KJND, ZTH, LBDM, FXDMLIST, KMDMLIST, DIRECTION }) => {
  return axios.request({
    url: '/bas/relation/updateItems',
    data: { GSDM, KJND, ZTH, LBDM, FXDMLIST, KMDMLIST, DIRECTION },
    desc: '修改4-30辅助核算项关联科目',
    method: 'post',
    waitfor: true
  })
}
export const repairFZXX = ({ GSDM, KJND, LBDM, FLAG, MODCODE }) => {
  return axios.request({
    url: '/bas/auxiliaryAccountingItems/repairFZXX',
    data: { GSDM, KJND, LBDM, FLAG, MODCODE },
    desc: '修复辅助项信息（FLAG 1 助记码 2 明细属性 ）',
    method: 'post',
    waitfor: true
  })
}
export const getFZXSelect = ({ gsdm, kjnd, sjly }) => {
  return axios.request({
    url: '/pub/FZX/getFZXSelect',
    data: { gsdm, kjnd, sjly },
    desc: '根据数据源获取数据',
    method: 'post',
    waitfor: true
  })
}

export const getAllCurrentcy = ({ GSDM, KJND }) => {
  return axios.request({
    url: '/bas/Currency/getAllCurrentcy',
    data: { GSDM, KJND },
    desc: '查询所有货币信息',
    method: 'post',
    waitfor: true
  })
}

export const getZtcsInfo = ({ GSDM, KJND, ZTH }) => {
  return axios.request({
    url: '/bas/common/getZtcsInfo',
    data: { GSDM, KJND, ZTH },
    desc: '获取账套参数信息（目前只用到了其中的QYKJQJ，即启用期间）',
    method: 'post',
    waitfor: true
  })
}

export const getSfqy = ({ GSDM, KJND, ZTH, WEBPATH }) => {
  return axios.request({
    url: '/bas/common/getSfqy',
    data: { GSDM, KJND, ZTH, WEBPATH },
    desc: '用于校验基础资料的某些辅助项是否启用，未启用则不能打开页面',
    method: 'post',
    waitfor: true
  })
}
// 判断功能科目是否已被使用
export const getCheckBeforeMehtod = ({ GSDM, KJND, LBDM, FZDM }) => {
  return axios.request({
    url: '/bas/auxiliaryAccountingItems/getCheckBeforeMehtod',
    data: { GSDM, KJND, LBDM, FZDM },
    desc: '判断功能科目是否已被使用',
    method: 'post',
    waitfor: true
  })
}

// 打印功能
export const autoIreportPrint = (data) => {
  return axios.request({
    url: '/SA/ireportPrint/autoIreportPrint',
    data: data,
    desc: '打印功能',
    method: 'post',
    waitfor: true
  })
}

// 根据代码级次带出代码
export const getNextCode = ({ GSDM, KJND, LBDM, LEVEL, CODE }) => {
  return axios.request({
    url: '/bas/common/getNextCode',
    data: { GSDM, KJND, LBDM, LEVEL, CODE },
    desc: '根据代码级次带出代码',
    method: 'post',
    waitfor: true
  })
}
