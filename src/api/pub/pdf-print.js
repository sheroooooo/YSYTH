import axios from '@/api/api.request'
/**
 * @description 查询打印模板
 * @param {String} MODCODE 模板ID
 * @param {String} FUNCCODE 是否默认
 * @param {String} GSDM 公司代码
 * @param {String} ZTH 账套号
 */
export const getPrintTemplate = ({ MODCODE, FUNCCODE, GSDM, ZTH, DWFUNCCODE }) => {
  return axios.request({
    url: '/SA/ireportPrint/getPrintFuncTemplate',
    data: { MODCODE, FUNCCODE, GSDM, ZTH, DWFUNCCODE },
    method: 'post',
    waitfor: true,
    desc: '获取打印模板'
  })
}

/**
 * @description 设置默认模板 单位设置默认
 * @param {String} TEMPLATEID 模板ID
 * @param {String} ISDEFAULT 是否默认
 * @param {String} MODCODE 模块编码
 * @param {String} FUNCCODE 功能编码
 * @param {String} GSDM 公司代码
 * @param {String} ZTH 账套号
 */
export const setDefaultTemplate = ({ TEMPLATEID, ISDEFAULT, MODCODE, FUNCCODE, GSDM, ZTH }) => {
  return axios.request({
    url: '/SA/ireportPrint/updateTemplateDwztIsDefault',
    data: { TEMPLATEID, ISDEFAULT, GSDM, ZTH, MODCODE, FUNCCODE },
    method: 'post',
    waitfor: true,
    desc: '设置默认模板'
  })
}

// 打印凭证
export const printFile = (data) => {
  return axios.request({
    url: '/gl/voucherBase/printFile',
    data,
    method: 'post',
    responseType: 'blob',
    waitfor: true,
    desc: '凭证打印'
  })
}
// 余额表
export const printBalanceSheet = (data) => {
  return axios.request({
    url: '/gl/balanceSheet/printBalanceSheet',
    data: data,
    method: 'post',
    responseType: 'blob',
    desc: '打印接口'
  })
}
