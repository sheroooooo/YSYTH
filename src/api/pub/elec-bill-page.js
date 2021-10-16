import axios from '@/api/api.request'
/**
 * @description 查询发票表格数据
 * @param {String} ZT 状态 -1所有 0未使用 1已使用 2已报销
 */
export const getFpList = ({ ZT }) => {
  return axios.request({
    url: '/bas/electronicBillHolder/electronicBillHolderList',
    data: { ZT },
    method: 'post',
    desc: '查询表格数据',
    waitfor: true
  })
}

/**
 * @description 保存增值税发票
 * @param {String} OPERATION S保存
 * @param {Object} VALUEADDEDTAXINVOICE 基本信息
 * @param {Array} VALUEADDEDTAXINVOICEMX 明细信息
 */
export const saveBillInput = ({ OPERATION, VALUEADDEDTAXINVOICE, VALUEADDEDTAXINVOICEMX }) => {
  return axios.request({
    url: '/bas/electronicBillHolder/addValueAddedTaxInvoice',
    data: { OPERATION, VALUEADDEDTAXINVOICE, VALUEADDEDTAXINVOICEMX },
    method: 'post',
    desc: '保存增值税发票',
    waitfor: true
  })
}

/**
 * @description 使用和撤销使用按钮 更新状态
 * @param {String} ZT 状态 0未使用 1已使用 2已报销
 * @param {Array} FPLIST
 */
export const updateFpzt = ({ ZT, FPLIST }) => {
  return axios.request({
    url: '/bas/electronicBillHolder/updateFpZt',
    data: { ZT, FPLIST },
    method: 'post',
    waitfor: true
  })
}

/**
 * @description 删除增值税发票
 * @param {Array} DELLIST
 */
export const deleteBill = (data) => {
  return axios.request({
    url: '/iev/dzfpj/deleteBill',
    data,
    method: 'post',
    desc: '删除增值税发票',
    waitfor: true
  })
}

export const getButtonState = (data) => {
  return axios.request({
    url: '/iev/dzfpj/getButtonState',
    data,
    method: 'post',
    desc: '获取按钮',
    waitfor: true
  })
}

// 获取票据模板信息
export const getPJTemplate = (data) => {
  return axios.request({
    url: '/iev/dzfpj/getPJTemplate',
    data,
    method: 'post',
    desc: '获取票据模板信息',
    waitfor: true
  })
}

// 获取主页面页签
export const getTabsData = () => {
  return [
    {
      label: '所有',
      name: 'all'
    },
    {
      label: '未使用',
      name: '未使用'
    },
    {
      label: '已使用',
      name: '已使用'
    },
    {
      label: '已报销',
      name: '已报销'
    }
  ]
}

// 增值税发票弹框表单
export const getBillInputItemList = () => {
  return [
    {
      name: 'PJLX',
      type: 'i-select',
      label: '票据类型',
      value: '',
      required: true,
      children: {
        type: 'i-option',
        list: [
          {
            title: '增值税发票',
            value: '增值税发票'
          }
        ]
      }
    },
    {
      name: 'FPDM',
      type: 'i-input',
      label: '发票代码',
      value: '',
      required: true
    },
    {
      name: 'FPHM',
      type: 'i-input',
      label: '发票号码',
      value: '',
      required: true
    },
    {
      name: 'KPRQ',
      type: 'DatePicker',
      label: '开票日期',
      value: '',
      required: true
    },
    {
      name: 'JSHJ',
      type: 'InputNumber',
      label: '价税合计',
      value: ''
      // props: { disabled: true }
    },
    {
      name: 'HJJE',
      type: 'InputNumber',
      label: '合计金额',
      value: 0
      // props: { disabled: true }
    },
    {
      name: 'SEHJ',
      type: 'InputNumber',
      label: '税额合计',
      value: 0
      // props: { disabled: true }
    },
    {
      name: 'GFSBH',
      type: 'i-input',
      label: '购方识别号',
      value: ''
    },
    {
      name: 'GFMC',
      type: 'i-input',
      label: '购方名称',
      value: ''
    },
    {
      name: 'GFKHYH',
      type: 'i-input',
      label: '购方开户银行',
      value: ''
    },
    {
      name: 'GFDDDH',
      type: 'i-input',
      label: '购方地址电话',
      value: '',
      span: '16'
    },
    {
      name: 'XFSBH',
      type: 'i-input',
      label: '销方识别号',
      value: ''
    },
    {
      name: 'XFMC',
      type: 'i-input',
      label: '销方名称',
      value: ''
    },
    {
      name: 'XFKHYH',
      type: 'i-input',
      label: '销方开户银行',
      value: ''
    },
    {
      name: 'XFDDDH',
      type: 'i-input',
      label: '销方地址电话',
      value: '',
      span: '16'
    },
    {
      name: 'DXJE',
      type: 'i-input',
      label: '金额（大写）',
      value: ''
    },
    {
      name: 'JYM',
      type: 'i-input',
      label: '校验码后6位',
      value: ''
    }
  ]
}

// 增值税发票弹框表格表头
export const getBillInputColumns = () => {
  return [
    {
      title: '序号',
      type: 'index',
      width: '60',
      fixed: 'left'
    },
    {
      title: '货物名称',
      field: 'HWMC'
    },
    {
      title: '规格型号',
      field: 'GGXH'
    },
    {
      title: '单价',
      field: 'DJ'
    },
    {
      title: '单位',
      field: 'DW'
    },
    {
      title: '数量',
      field: 'SL'
    },
    {
      title: '税率（%）',
      field: 'SLV'
    },
    {
      title: '金额',
      field: 'JE'
    },
    {
      title: '税额',
      field: 'SE'
    }
  ]
}
// 电子票据夹表头
export const getGridColumns = (data) => {
  return axios.request({
    url: '/iev/dzfpj/getGridColumns',
    data,
    method: 'post',
    desc: '获取电子票据夹表头',
    waitfor: true
  })
}
// 电子票据夹表格数据
export const getGridData = (data) => {
  return axios.request({
    url: '/iev/dzfpj/getGridData',
    data,
    method: 'post',
    desc: '获取电子票据夹表格数据内容',
    waitfor: true
  })
}
// 获取电子票据类型
export const getPjlxList = ({ GSDM, KJND, rowversion }) => {
  return axios.request({
    url: '/iev/pjlx/getPjlxList',
    data: { GSDM, KJND, rowversion },
    method: 'post',
    desc: '获取电子票据类型',
    waitfor: true
  })
}

// 获取电子票据录入界面结构
export const getPjlxSet = ({ GSDM, KJND, PID, rowversion }) => {
  return axios.request({
    url: '/iev/pjlx/getPjlxSet',
    data: { GSDM, KJND, PID, rowversion },
    method: 'post',
    desc: '获取电子票据录入界面结构',
    waitfor: true
  })
}

// 获取单张票据数据信息
export const getOneBill = ({ FPID }) => {
  return axios.request({
    url: '/iev/dzfpj/getOneBill',
    data: { FPID },
    method: 'post',
    desc: '获取单张票据数据信息',
    waitfor: true
  })
}

// 保存单据
export const saveBill = (data) => {
  return axios.request({
    url: '/iev/dzfpj/saveBill',
    data,
    method: 'post',
    desc: '保存票据信息'
    // waitfor: true
  })
}
// 上传
export const upload = (data) => {
  return axios.request({
    url: '/iev/dzfpj/upload',
    data,
    method: 'post',
    desc: '上传',
    waitfor: true
  })
}
// 如果识别的文件未保存，则删掉U8附件库中的附件
export const deleteUploadBill = ({ gxGuid }) => {
  return axios.request({
    url: '/pub/fileOpertion/delete',
    data: { gxGuid },
    method: 'post',
    desc: '删除附件'
    // waitfor: true
  })
}

export const fpyz = (data) => {
  return axios.request({
    url: '/iev/dzfpj/fpyz',
    data,
    method: 'post',
    desc: '发票验真',
    waitfor: true
  })
}
export const useInvoices = (data) => {
  return axios.request({
    url: '/iev/dzfpj/useInvoices',
    data,
    method: 'post',
    desc: '使用发票',
    waitfor: true
  })
}
// 更新发票使用状态
export const updateInvoicesAfterCheckDoc = (data) => {
  return axios.request({
    url: '/iev/dzfpj/updateInvoicesAfterCheckDoc',
    data,
    method: 'post',
    desc: '更新发票使用状态',
    waitfor: true
  })
}

// 删除单据后更新发票使用状态
export const updateInvoicesAfterDelDoc = (data) => {
  return axios.request({
    url: '/iev/dzfpj/updateInvoicesAfterDelDoc',
    data,
    method: 'post',
    desc: '删除单据后更新发票使用状态',
    waitfor: true
  })
}
// 手工录入上传发票
export const addUploadFp = (data) => {
  return axios.request({
    url: '/pub/fileOpertion/upload',
    data,
    method: 'post',
    desc: '手工录入上传发票',
    waitfor: true
  })
}

// 修改时上传发票
export const editAnnex = (data) => {
  return axios.request({
    url: '/iev/dzfpj/editAnnex',
    data,
    method: 'post',
    desc: '修改时上传发票',
    waitfor: true
  })
}

// 获取附件列表
export const getAnnex = (data) => {
  return axios.request({
    url: '/iev/dzfpj/getAnnex',
    data,
    method: 'post',
    desc: '获取附件列表',
    waitfor: true
  })
}
// 报销单据保存成功后更新发票使用状态
export const updateAnnexAfterSaveDoc = (data) => {
  return axios.request({
    url: '/iev/dzfpj/updateAnnexAfterSaveDoc',
    data,
    method: 'post',
    desc: '报销单据保存成功后更新发票使用状态',
    waitfor: true
  })
}

// 加密控制
export const checkOcrLicence = ({ KJND }) => {
  return axios.request({
    url: '/iev/dzfpj/checkOcrLicence',
    data: { KJND },
    method: 'post',
    desc: '加密控制',
    waitfor: true
  })
}

// 取消使用
export const cancelUseInvoices = (data) => {
  return axios.request({
    url: '/iev/dzfpj/cancelUseInvoices',
    data,
    method: 'post',
    desc: '取消使用',
    waitfor: true
  })
}

// 单据取消保存时更新发票使用状态
export const updateAnnexAfterCancelSaveDoc = (data) => {
  return axios.request({
    url: '/iev/dzfpj/updateAnnexAfterCancelSaveDoc',
    data,
    method: 'post',
    desc: '单据取消保存时更新发票使用状态',
    waitfor: true
  })
}
// 在终审节点下，销审后需要更新发票使用状态
export const updateInvoicesAfterUnCheckDoc = (data) => {
  return axios.request({
    url: '/iev/dzfpj/updateInvoicesAfterUnCheckDoc',
    data,
    method: 'post',
    desc: '在终审节点下，销审后需要更新发票使用状态',
    waitfor: true
  })
}
// 用友配置下，发票识别未保存时需要删除用友平台的发票记录
export const cancelUpload = ({ GSDM, KJND, FPDM, FPHM }) => {
  return axios.request({
    url: '/iev/dzfpj/cancelUpload',
    data: { GSDM, KJND, FPDM, FPHM },
    method: 'post',
    desc: '用友配置下，发票识别未保存时需要删除用友平台的发票记录'
    // waitfor: true
  })
}

// 关闭二维码弹框后获取本次手机上传的附件
export const getPhoneUploadFJ = ({ DJID }) => {
  return axios.request({
    url: '/iev/dzfpj/getPhoneUploadFJ',
    data: { DJID },
    method: 'post',
    desc: '关闭二维码弹框后获取本次手机上传的附件'
    // waitfor: true
  })
}

// 获取手机上传识别附件的信息
export const dealPhoneUploadData = ({ GXGUID, GSDM, KJND, ZTH }) => {
  return axios.request({
    url: '/iev/dzfpj/dealPhoneUploadData',
    data: { GXGUID, GSDM, KJND, ZTH },
    method: 'post',
    desc: '获取手机上传识别附件的信息',
    waitfor: true
  })
}
