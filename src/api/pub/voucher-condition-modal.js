import axios from '@/api/api.request'
export const setVoucherProductParams = ({ GSDM, ZTH, TYPE, PARAMETER }) => {
  return axios.request({
    url: '/gl/voucherBase/saveUserParameter',
    data: { GSDM, ZTH, TYPE, PARAMETER },
    desc: '设置用户常用参数',
    method: 'post',
    waitfor: true
  })
}
export const getVoucherProductParams = ({ GSDM, ZTH, TYPE }) => {
  return axios.request({
    url: '/gl/voucherBase/getUserParameter',
    data: { GSDM, ZTH, TYPE },
    desc: '获取用户生成凭证时checkBox的值',
    method: 'post',
    waitfor: true
  })
}
// GSDM: gsdm, // 公司代码
// ZTH: zth // 账套号
// KJND: kjnd, // 会计年度
// MODCODE: this.modCode.toUpperCase(), // 模块标识
// DJLXID: this.billTypeId || this.billData[0]['DJLXID'], // 单据类型ID
// CZYID: id, // 操作员ID
// CZYNAME: name, // 操作员名字
// IDPZNR: [], // id凭证内容
// YWRQ: new Date(loginDate).Format('yyyyMMdd'), // 业务日期
// IDLIST: data[0] ? data[0].IDLIST : idList,
// STRICTCHECKDATA: [],
// ...formData // 包括 合并规则, 凭证类型，生成方式
export const generateDocument = (data) => {
  let urlMap = {
    'CM': '/cm/register/generateCMDocuments',
    'CNTC': `/cntc/cntcReceiveAndPayForm/${data.url}`,
    'IEV': '/iev/dzfpj/generateDocument',
    'FAQC': `/fa/${data.apiUrl}`,
    'INV': '/inv/generateVoucher/generateDocuments'
  }
  let url
  if (urlMap[data.MODCODE]) {
    url = urlMap[data.MODCODE]
  } else {
    url = `/${data.MODCODE.toLowerCase()}/applyForm/${data.url}`
  }
  return axios.request({
    url: url,
    data,
    desc: '生成凭证',
    method: 'post',
    waitfor: true
  })
}
