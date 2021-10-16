import clonedeep from 'clonedeep'
export default {
  methods: {
    showEQ (billTreedata, itemData, _callback) {
      this.$createEqEditor(
        {
          $props: { billTreedata, itemData },
          $on: {
            'on-ok': (eq) => {
              if (_callback) {
                _callback(eq)
              }
            }
          }
        }, false
      ).show()
    },
    transKey (dt, from, to) {
      const fromKeys = from.split(',')
      const toKeys = to.split(',')
      for (let i = 0, len = fromKeys.length; i < len; i++) {
        const key1 = fromKeys[i]
        const key2 = toKeys[i]
        if (dt[key1]) dt[key2] = dt[key1]
      }
    },
    formatStrutData (billTreedata) {
      // 前后端key值不一致调整
      let formData = clonedeep(billTreedata)
      if (formData.formula) {
        formData.options = formData.formula
      } else {
        formData.options = {}
      }
      formData.options.eqlist = formData.options.eqlist || []

      /*
      * dataTypeFrom:
      * 14:弹框双表格，采购中选择预算指标
      * 51:图片上传，资产管理模块使用
      * 52:小数，资产管理模块使用
      * 53:多部门、资金来源选择 及 百分比，资产管理模块使用
      */

      const transKeyFrom = 'formula,YSMC,BNXID,YSFIELD,YSDM,SJLX,cardtype,DEFVALUE'
      const transKeyTo = 'options,title,bnxid,key,foreignKey,dataType,busLink,defaultValue'
      const dataTypeFrom = '0,1,2,3,4,5,6,7,11,12,13,51,52,53'
      const dataTypeTo = 'input,integer,number,number,date,select,checkbox,textarea,tree-select,table-select,cryption,uploadpic,float,multi-percent-table'
      if (formData.tempmc) {
        formData.title = formData.tempmc
      }
      // 循环表单层(共有几个表单)
      for (let i = 0, len = formData.children.length; i < len; i++) {
        // item表单项
        let item = formData.children[i]
        item.ISUSED = item.ISUSED === undefined ? 1 : item.ISUSED
        item.options = item.FORMULA || {}
        this.transKey(item, transKeyFrom, transKeyTo)
        // 表内项表外项
        item.isMain = item.FIELDTYPE === -1
        if (!item.options.isTable && item.busLink !== '999') {
          item.options.isTable = '1'
        } else {
          item.options.isTable = item.isMain ? '0' : item.options.isTable
        }

        item.busLink = item.CARDTYPE || '0'
        for (let j = 0, len = item.children.length; j < len; j++) {
          let field = item.children[j]
          field.required = field.ALLOWNULL === '1'
          field.break = field.ISNEWLINE === '1'
          field.ownerrow = field.SINGLELINE === '1'
          field.readonly = field.ISREADONLY === '1'
          field.standardOver = field.STANDARDOVER === '1'
          this.transKey(field, transKeyFrom, transKeyTo)
          this.transData(field, 'dataType', dataTypeFrom, dataTypeTo)
          field.dataType = field.dataType || 'input'
          // if (field.FORMULA) {
          field.options = field.FORMULA || {}
          // }
        }
      }
      return formData
    },
    transData (dt, key, from, to) {
      if (!dt[key]) return
      const fromDT = from.split(',')
      const toDT = to.split(',')
      let pos = fromDT.indexOf(dt[key])
      pos = pos >= 0 ? pos : 0
      dt[key] = toDT[pos]
    },
    // 结构转换回去
    /*
    * dataTypeFrom:
    * 51:图片上传，资产管理模块使用
    * 52:小数，资产管理模块使用
    * 53:多部门、资金来源选择 及 百分比，资产管理模块使用
    */
    formatStrutDataBack (billTreedata) {
      const transKeyTo = 'FORMULA,YSMC,BNXID,YSFIELD,YSDM,SJLX,DEFVALUE'
      const transKeyFrom = 'options,title,bnxid,key,foreignKey,dataType,defaultValue'
      const dataTypeTo = '0,1,2,3,4,5,6,7,11,12,13,51,52,53'
      const dataTypeFrom = 'input,integer,number,number,date,select,checkbox,textarea,tree-select,table-select,cryption,uploadpic,float,multi-percent-table'
      // 前后端key值不一致调整
      let formData = clonedeep(billTreedata)
      formData.tempmc = formData.title
      formData.formula = formData.options
      for (let i = 0, len = formData.children.length; i < len; i++) {
        let item = formData.children[i]
        this.transKey(item, transKeyFrom, transKeyTo)
        delete item.SJLX
        // 表内项表外项
        if (item.isMain) {
          item.bnxid = 0
          item.FIELDTYPE = -1
          item.CARDTYPE = -1
        } else {
          item.FIELDTYPE = 1
          item.CARDTYPE = item.busLink
        }
        for (let j = 0, len = item.children.length; j < len; j++) {
          let field = item.children[j]
          field.ALLOWNULL = field.required ? 1 : 0
          field.ISNEWLINE = field.break ? 1 : 0
          field.SINGLELINE = field.ownerrow ? 1 : 0
          field.ISREADONLY = field.readonly ? 1 : 0
          field.DEFVALUE = field.defaultValue
          field.STANDARDOVER = field.standardOver ? 1 : 0
          this.transKey(field, transKeyFrom, transKeyTo)
          this.transData(field, 'SJLX', dataTypeFrom, dataTypeTo)
        }
      }
      return formData
    },
    // 将发送给后台的字段中，包含|的拆分成两个字段
    // {a|b:'c d'} --> {a:'c',b:'d'}
    splitKeyByFlag (billData = {}) {
      var dataList = []
      // 将所有data字段存入数组中。
      for (let i in billData) {
        // 主信息data为对象,直接push
        if (billData[i].FIELDTYPE === -1) {
          dataList.push(billData[i].data)
        } else {
          // 非主信息,解构即可
          if (billData[i].data && !Array.isArray(billData[i].data)) {
            let dtArear = billData[i].data
            let dataArray = Object.values(dtArear)
            dataArray.map((item) => {
              dataList.push(...item)
            })
          } else {
            if (billData[i].data) dataList = [...dataList, ...billData[i].data]
          }
        }
      }
      // 找到key中含有|的字段, 对key进行拆分
      dataList.map((data) => {
        Object.keys(data).map((key) => {
          if (key.indexOf('|') !== -1) {
            let value = ['', '']
            if (data[key] && data[key].indexOf(' ') !== -1) {
              value = data[key].split(' ')
            } else if (data[key] && data[key].indexOf('[') !== -1) {
              value = data[key].split('[')
            } else {
              value = ['', data[key]]
            }
            let keyArray = key.split('|')
            keyArray.map((item, index) => {
              data[item] = value[index]
            })
            delete data[key]
          }
        })
      })
      return billData
    },
    getMainPnlData (data, type = '-1') {
      let mainData = Object.values(data).find(item => {
        return item.CARDTYPE === type
      }) || {}
      return mainData.data
    },
    getDetailPnlData (value, key = 'FIELDTYPE', type = 1) {
      let data = []
      Object.values(value).map(item => {
        if (item[key] === type) {
          data = [...data, ...item.data]
        }
      })
      return data
    },
    // 删除空行数据
    clearBlankSpaceData (struct = [], data = [], mainKey = 'key') {
      if (!Array.isArray(data)) {
        return data
      }
      let dataList = [...data]
      dataList.map((element) => {
        if (this.isVoidData(element, struct, mainKey) && data.length > 1) {
          let index = data.findIndex(e => e === element)
          data.splice(index, 1)
        }
      })
      return data
    },
    // 判断数据是不是空数据(主要判断明细信息是不是空的。)
    isVoidData (value = {}, struct = [], mainKey = 'key') {
      let result = true
      for (let index = 0; index < struct.length; index++) {
        const element = struct[index]
        let key = element.key
        let retainValue = ['$_INDEX']
        if (value[key] && value[key] !== element.DEFVALUE && !retainValue.includes(element.DEFVALUE)) {
          result = false
          break
        }
      }
      return result
    },
    transformKey (mainData) {
      let struParent = mainData
      let struKeyToforeignKey = {}
      let struforeignKeyToKey = {}
      struParent.map(item => {
        struKeyToforeignKey[item.key] = item.foreignKey || item.key // {key: foreignKey}
        struforeignKeyToKey[item.foreignKey || item.key] = item.key // {foreignKey: key}
      })
      return {
        struKeyToforeignKey,
        struforeignKeyToKey
      }
    },
    setRelatedKey (key) {
      let keyMap = {
        'BM': 'BMDM',
        'XM': 'XMDM'
      }
      return keyMap[key] || ''
    },
    // 关联外键带值(parent: 提供值, child: 接收值)
    realtionForeignKey ({ titlePrev = '', parentValue = [], parentStruct = [], childStruct = [], listLength, removeKey = ['JE'] }) {
      let childValue = new Array(listLength || parentValue.length).fill({})
      childValue = childValue.map((i, index) => {
        let newValue = { ...parentValue[index] }
        childStruct.map(item => {
          newValue[item.key] = newValue[item.key] || item['DEFVALUE']
        })
        return newValue
      })
      let childKeyGroup = this.transformKey(childStruct)
      parentStruct.map(element => {
        let title = `${titlePrev}${element.title}` // 获取 title
        let pkey = element.field || element.key // 获取key
        let sameChild = childStruct.find(c => c.title === title || c.title === element.title)
        // 先根据title进行匹配
        if (sameChild) {
          parentValue.map((el, index) => {
            if (index < listLength) {
              childValue[index][sameChild.key] = childValue[index][sameChild.key] || el[pkey] || ''
            }
          })
        }
        let relatedKey = this.setRelatedKey(pkey) || pkey
        const mainKey = childKeyGroup.struforeignKeyToKey[relatedKey]
        if (mainKey && !removeKey.includes(mainKey)) {
          parentValue.map((element, index) => {
            if (index < listLength) {
              childValue[index][mainKey] = childValue[index][mainKey] || element[pkey] || ''
            }
          })
        }
      })
      return childValue
    }
  }
}
