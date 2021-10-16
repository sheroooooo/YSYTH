import axios from '@/api/api.request'
/* dataSources:1 部门  dataSources:2 项目 */
export const getFZXSelect = (data) => {
  let modal = data.modal ? data.modal : ''
  let dataType = data.params.sjly
  let url = ''
  // else if (dataType === '3' && modal === 'gsp') {
  //   url = '/gsp/applyForm/getJbrData'
  //   delete data.params.children
  // }
  console.log(dataType)
  modal = modal.toLowerCase()
  if (dataType === 'htlb') { // 获取合同类别
    delete data.params.children
    url = '/' + modal + '/condition/getContractType'
  } else if (dataType === 'cfdd') { // 获取存放地点
    delete data.params.children
    url = '/' + modal + '/condition/getAddress'
  } else if (dataType === 'zczy') { // 获取资产资源列表
    delete data.params.children
    url = '/' + modal + '/condition/getAssetResource'
  } else if ((dataType === '56' || dataType === '50') && modal === 'oer') { // 获取科目
    url = '/oer/oerjsfs/getGLKMList'
    delete data.params.children
  } else if (dataType === '166') { // 获取操作员按部门归类
    url = '/pub/FZX/getXmCzyList'
    delete data.params.children
  } else if (dataType === '140') { // 采购品目
    url = '/gpmc/procurementcatalog/selectCatalogFilteredByType'
  } else if (data.params.isNewUrl) {
    delete data.params.children
    url = '/bas/auxiliaryAccountingItems/getAuxiliaryAccountingItems'
  } else if (dataType.toString().substring(0, 1) === '3' && dataType.toString().length === 3) {
    url = '/inv/public/getFZXSelect'
  } else if (dataType !== '' && dataType !== undefined) {
    url = '/pub/FZX/getFZXSelect'
  }
  if (url !== '') {
    return axios.request({
      url: url,
      data: data.params,
      method: 'post',
      waitfor: true,
      desc: '获取基础资料'
    })
  }
}
