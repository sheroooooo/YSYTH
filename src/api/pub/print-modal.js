import axios from '@/api/api.request'
import PrintModal from '_c/print-modal'

/**
 * @description 新打印 打印前选择打印模板
 * @return {String} TEMPLATEID 返回模板ID
 */
export const beforePrint = (_this, params) => {
  return new Promise((resolve, reject) => {
    _this.$modal({
      title: '选择打印模板',
      resize: false,
      showFooter: false,
      width: 800,
      height: 500,
      zIndex: 900,
      slots: {
        default: ({ $modal }, h) => {
          return [
            h(PrintModal, {
              props: {
                baseParams: params.baseParams,
                MODCODE: params.MODCODE,
                FUNCCODE: params.FUNCCODE,
                TEMPLATEFORMAT: params.templateFormat || ''
              },
              on: {
                close () {
                  $modal.close()
                },
                complete (val) {
                  let { TEMPLATEID } = val
                  let dataType = params.dataType
                  if (dataType && dataType.type === 'PZ') { // 凭证打印
                    getPrintFile(TEMPLATEID, dataType.selectData, _this)
                    $modal.close()
                    return false
                  }
                  resolve(val)
                  $modal.close()
                }
              }
            })
          ]
        }
      }
    })
  })
}

/**
 * @description 凭证打印
 * @param {String} TEMPLATEID 模板ID
 * @param {Object} selectData 选中的数据
 */
export const getPrintFile = (TEMPLATEID, selectData, _this) => {
  let params = {
    IDPZHLIST: []
  }
  selectData.map(item => {
    params.IDPZHLIST.push(item.IDPZH)
  })
  params.TEMPLATEID = TEMPLATEID
  _this.$fn.ajax(printFile, params, res => {
    let content = res
    let blob = new Blob([content])
    let fileName = _this.$route.params.title + '.pdf'
    if ('download' in document.createElement('a')) { // 非IE下载
      const elink = document.createElement('a')
      elink.download = fileName
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      document.body.removeChild(elink)
    } else { // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
  }, 0)
}

/**
 * @description 是否有默认模板 如果有默认模板直接打印（不需要弹框选则模板）
 * @return {String} 返回默认模板id 没有默认模板则返回 ''
 */
export const hasDefaultTemplate = (_this, params) => {
  return new Promise((resolve, reject) => {
    let { MODCODE, FUNCCODE } = params
    _this.$fn.ajax(getPrintTemplate, {
      MODCODE,
      FUNCCODE,
      DWFUNCCODE: params.baseParams.gsdm + params.baseParams.kjnd + FUNCCODE,
      'GSDM': params.baseParams.gsdm,
      'ZTH': params.baseParams.zth
    }, res => {
      if (res.status === 200 && res.data) {
        let TEMPLATEID = ''
        res.data.forEach(item => {
          if (item.ISDEFAULT === '1') {
            TEMPLATEID = item.TEMPLATEID
          }
        })
        resolve(TEMPLATEID)
      }
    })
  })
}

/**
 * @description 表格打印
 * @param {Object} params : {gsdm, kjnd, title, tableHead, selectTableData}
 */
export const print = (_this, params) => {
  if (params.selectTableData.length === 0) {
    _this.$fn.warning({ desc: '请选择数据' })
    return
  }
  let TITLELIST = []
  params.tableHead.forEach((item, i) => {
    // 去除特殊列（操作列、序号、复选框）
    if (item.hasOwnProperty('type') && (item.type === 'tools' || item.type === 'selection' || item.type === 'index')) {
      params.tableHead.splice(i, 1)
    } else {
      item.headerAlign = 'center'
      item.field = item.key || item.field
      delete item.key
      if (!item.hasOwnProperty('align') && item.field) { // 表头没有align时给表头添加align属性
        if (item.field.endsWith('JE') || item.field.endsWith('RQ') || item.field === 'Date' || item.field === 'DJDate') {
          item.align = 'right'
        } else {
          item.align = 'center'
        }
      }
      TITLELIST.push(item)
    }
  })
  params.selectTableData.forEach(item => {
    let itemKeys = Object.keys(item)
    itemKeys.forEach(key => {
      if (key.endsWith('JE')) {
        item[key] = _this.$utils.commafy(item[key], { fixed: 2 })
      }
    })
  })
  _this.$fn.ajax(printFiles, {
    'GSDM': params.gsdm,
    'KJND': params.kjnd,
    'TITLE': params.title,
    TITLELIST,
    INFOLIST: params.selectTableData
  }, res => {
    let content = res
    let blob = new Blob([content])
    let fileName = params.title + '.pdf'
    if ('download' in document.createElement('a')) { // 非IE下载
      const elink = document.createElement('a')
      elink.download = fileName
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      // elink.target = '_blank'
      document.body.appendChild(elink)
      elink.click()
      // window.open(elink.href)
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)
    } else { // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
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
    waitfor: true
  })
}

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
    waitfor: true
  })
}

// 打印凭证
export const printFile = (data) => {
  return axios.request({
    url: '/gl/voucherBase/printFile',
    data,
    method: 'post',
    responseType: 'blob',
    waitfor: true
  })
}

/**
 * @description 表格打印
 * @param {String} GSDM
 * @param {String} KJND
 * @param {String} TITLE // 模块名称
 * @param {Array} TITLELIST 表头
 * @param {Array} INFOLIST 表格数据
 */
export const printFiles = ({ GSDM, KJND, TITLE, TITLELIST, INFOLIST }) => {
  return axios.request({
    url: '/SA/ireportPrint/autoIreportPrint',
    data: { GSDM, KJND, TITLE, TITLELIST, INFOLIST },
    method: 'post',
    responseType: 'blob',
    waitfor: true
  })
}
