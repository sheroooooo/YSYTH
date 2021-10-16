// import Cookies from 'js-cookie'
import { outPut } from '@/api/pub/import-export-excel'
export default {
  /**
   * 本地永久存储
   * @param {*} key
   * @param {*} value
   */
  setLocal (key, value) {
    localStorage.setItem(key, value)
  },
  /**
   * 取本地永久存储数据
   * @param {*} key
   */
  getLocal (key) {
    return localStorage.getItem(key) || ''
  },
  /**
   * 本地缓存
   * @param {*} key
   * @param {*} value
   */
  setSession (key, value) {
    sessionStorage.setItem(key, value)
  },
  /**
   * 取本地缓存数据
   * @param {*} key
   */
  getSession (key) {
    return sessionStorage.getItem(key) || ''
  },
  getCookies (key) {
    return Cookies.get(key)
  },
  setCookies (key, val, expires) {
    Cookies.set(key, val, { expires: expires || 1 })
  },
  /**
   * 取分隔符前字段
   * @str {*} key
   * @split {*} 分隔符
   */
  bof (str, split) {
    if (str === '') return ''
    split = split || ','
    let sList = str.split(split)
    return sList[0]
  },
  /**
   * 取分隔符后字段
   * @str {*} key
   * @split {*} 分隔符
   */
  eof (str, split) {
    if (str === '') return ''
    split = split || ','
    let sList = str.split(split)

    return sList.length === 0 ? str : sList[1]
  },
  // 删除逗号并转化为Number
  deletComma (str) {
    let newStr = ''
    if (str.indexOf(',') !== -1) {
      newStr = str.replace(/,/g, '')
    } else {
      newStr = str
    }
    return Number(newStr)
  },
  /**
 * 判断一个对象是否存在key，如果传入第二个参数key，则是判断这个obj对象是否存在key这个属性
 * 如果没有传入key这个参数，则判断obj对象是否有键值对
 */
  hasKey (obj, key) {
    if (key) return key in obj
    else {
      let keysArr = Object.keys(obj)
      return keysArr.length
    }
  },
  isNull (target) {
    if (typeof (target) === 'undefined' || target === null || target === '' || target === 'null' || target === 'undefined') {
      return true
    } else {
      return false
    }
  },
  // 通用
  formatDataToTree (data, option) {
    let opt = option || {}
    let id = opt.id || 'id'
    let text = opt.text || 'text'
    let pId = opt.pId || 'pId'
    let rootName = option.rootName || ''
    let i = 0
    let l = ''
    let treeData = []
    let tmpMap = []
    for (i = 0, l = data.length; i < l; i++) {
      tmpMap[data[i][id]] = data[i]
    }
    for (i = 0, l = data.length; i < l; i++) {
      if (tmpMap[data[i][pId]] && data[i][id] !== data[i][pId]) {
        if (!tmpMap[data[i][pId]]['children']) { tmpMap[data[i][pId]]['children'] = [] }
        data[i]['text'] = data[i][text]
        data[i]['id'] = data[i][id]
        tmpMap[data[i][pId]]['children'].push(data[i])
      } else {
        data[i]['text'] = data[i][text]
        data[i]['id'] = data[i][id]
        treeData.push(data[i])
        data[i].level = 0
      }
    }
    if (rootName !== '') {
      let root = {}
      root[opt.id] = '0'
      root[opt.text] = rootName
      root.expand = true
      root.children = treeData
      return [root]
    }
    getArray(treeData, 0)
    function getArray (data, num) {
      num++
      for (let i = 0, len = data.length; i < len; i++) {
        if (data[i].children) {
          if (data[i][pId] === '' || data[i][pId] === '0') {
            num = 0
          } else if (data[i].level === 1) {
            num = 1
          }
          for (let j = 0, len = data[i].children.length; j < len; j++) {
            data[i].children[j].level = num + 1
          }
          getArray(data[i].children, num)
        } else if (data[i][pId] === '' || data[i][pId] === '0') {
          data[i].level = 0
        } else {
          data[i].level = num
        }
      }
    }
    return treeData
  },
  formatMoney (number, places, symbol, thousand, decimal) {
    number = number || 0
    places = !isNaN(places = Math.abs(places)) ? places : 2
    symbol = symbol !== undefined ? symbol : ''
    thousand = thousand || ','
    decimal = decimal || '.'
    let i = ''
    let j = ''
    var negative = number < 0 ? '-' : ''
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + ''
    j = (j = i.length) > 3 ? j % 3 : 0
    return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : '')
  },
  formatMoneyCN (money) {
    // 汉字的数字
    let cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    // 基本单位
    let cnIntRadice = ['', '拾', '佰', '仟']
    // 对应整数部分扩展单位
    let cnIntUnits = ['', '万', '亿', '兆']
    // 对应小数部分单位
    let cnDecUnits = ['角', '分', '毫', '厘']
    // 整数金额时后面跟的字符
    let cnInteger = '整'
    // 整型完以后的单位
    let cnIntLast = '元'
    // 最大处理的数字
    let maxNum = 999999999999999.9999
    // 金额整数部分
    let integerNum
    // 金额小数部分
    var decimalNum
    // 输出的中文金额字符串
    var chineseStr = ''
    // 分离金额后用的数组，预定义
    let plus = true
    if (money === '') { return '' }
    money = parseFloat(money)
    if (money >= maxNum) {
      // 超出最大处理数字
      return ''
    }
    if (money === 0) {
      return '零元整'
    }
    if (money < 0) {
      plus = false
      money = Math.abs(money)
    }
    // 转换为字符串
    money = money.toString()
    if (money.indexOf('.') === -1) {
      integerNum = money
      decimalNum = ''
    } else {
      let parts = money.split('.')
      integerNum = parts[0]
      decimalNum = parts[1].substr(0, 4)
    }
    // 获取整型部分转换
    if (parseInt(integerNum, 10) > 0) {
      var zeroCount = 0
      var IntLen = integerNum.length
      for (var i = 0; i < IntLen; i++) {
        var n = integerNum.substr(i, 1)
        var p = IntLen - i - 1
        var q = p / 4
        var m = p % 4
        if (n === '0') {
          zeroCount++
        } else {
          if (zeroCount > 0) {
            chineseStr += cnNums[0]
          }
          // 归零
          zeroCount = 0
          chineseStr += cnNums[parseInt(n)] + cnIntRadice[m]
        }
        if (m === 0 && zeroCount < 4) {
          chineseStr += cnIntUnits[q]
        }
      }
      chineseStr += cnIntLast
    }
    // 小数部分
    if (decimalNum !== '') {
      var decLen = decimalNum.length
      for (let i = 0; i < decLen; i++) {
        let n = decimalNum.substr(i, 1)
        chineseStr += cnNums[Number(n)] + (i === 0 && Number(n) === 0 ? '' : cnDecUnits[i])
      }
    }

    if (chineseStr === '') {
      chineseStr = '零元整'
    } else if (decimalNum === '') {
      chineseStr += cnInteger
    }
    if (!plus) {
      chineseStr = `负 ${chineseStr}`
    }
    return chineseStr
  },
  // 业务用
  /**
   * 格式化数据为动态表单
   * @param {} list
   */
  formatFormGroup (list) {
    /* 【0】 sjlx=0, sjly为 0,13,20,21 普通文本框，
    【1】 整数
    【2】 小数 因为不显示羊角符与金额通用
    【3】 金额
    【4】 日期
    【5】 sjly=12 下拉列表
    【6】 sjlx=5 流
     B/S 延伸：【8】两个日期选择框
    【11】sjly不是0,13,18,12,20,21弹出选择框
    【12】sjly 是18 弹出表格 */
    const dataType = ['0', '1', '2', '3', '4', '5', '7', '11', '12']
    const components = ['Input', 'Integer', 'InputNumber', 'InputNumber', 'DatePicker', 'i-select', 'textarea', 'tree-select', 'table-select']
    for (let idx = 0; idx < list.length; idx++) {
      let item = list[idx]
      const ipos = dataType.indexOf(item.dataType)
      if (!this.hasKey(item, 'type')) {
        item.type = ipos === -1 ? 'Input' : components[ipos]
      }
      item.label = item.label || item.title
      item.value = item.value || item.value
      item.required = item.isAllowNull === '0'
      item.readOnly = item.bsIsReadOnly === '1'
      if (item.type === 'DatePicker') {
        item.props = { type: 'date', format: 'yyyy-MM-dd' }
      } else if (item.type === 'tree-select' || item.type === 'table-select' || item.type === 'i-select') {
        item.props = { dataSources: item.dataSources }
      } else if (item.type === 'Input') {
        if (item.fieldWidth) {
          // 默认为汉字，长度除2
          item.props = { maxlength: Math.floor(item.fieldWidth / 2) }
        }
      }
    }
    return list
  },
  /**
   * 数值转表格字段
   * @param {*} list
   */
  formatTableColumns (list) {
    let cols = []
    let tableCols = []
    for (let idx = 0; idx < list.length; idx++) {
      let item = list[idx]
      let sTitle = item.title || item.label
      let col = { key: item.key || item.name, title: sTitle }

      if (item.type === 'Integer') {
        col = {
          key: item.key || item.name,
          title: sTitle,
          align: 'right'
        }
      } else if (item.type === 'InputNumber' || item.name === 'JE') {
        col = {
          key: item.key || item.name,
          title: sTitle,
          align: 'right',
          render: (h, params) => {
            let key = params.column.key || params.column.name
            let val = this.formatMoney(params.row[key], 2, '')
            return h('span', {}, val)
          }
        }
      }
      cols.push(col)
      if (cols.length > 12) { // 判断长度，再加宽度
        for (let j = 0, len = cols.length; j < len; j++) {
          if (!cols[j].width) {
            cols[j].width = 100
          }
        }
      }
      /* 避免影响效果注释 */
      /* if (item.fieldGroupID && item.fieldGroupID.indexOf('-1') >= 0) {
        tableCols.push(col)
      } */
    }
    return tableCols.length === 0 ? cols : tableCols
  },
  equalsObject (o1, o2) {
    let k1k2 = []
    let k1 = Object.keys(o1)
    let k2 = Object.keys(o2)
    if (k1.length !== k2.length) {
      return false
    }

    k1k2 = k1
    k1k2.push(...k2)
    // 去重
    k1k2 = Array.from(new Set(k1k2))

    if (k1.length !== k1k2.length || k2.length !== k1k2.length) {
      return false
    }
    var flag = true
    k1k2.forEach((v, i) => {
      var v1 = o1[v]
      var v2 = o2[v]
      if (typeof v1 !== typeof v2) {
        flag = false
      } else {
        if (this.hasKey(v1) && this.hasKey(v2)) { // recursion
          flag = this.equalsObject(v1, v2)
          if (!flag) {
            return false
          }
        } else if (Array.isArray(v1) && Array.isArray(v2)) {
          flag = this.equalsArray(v1, v2)
          if (!flag) {
            return false
          }
        } else {
          if (v1 !== v2) {
            flag = false
          }
        }
      }
    })
    return flag
  },
  // 传入key响应对应的数据来源
  getdataSources (key) {
    // 以下注释来源于 杨乐乐
    // --注释：GZHDDM:39，ZY:[ZD]20，DD:[ZD]10，JFGC:[ZD]16 来源于项目（北新泾）暂不变动，20200611其他项已经按照产品标准统一
    let dataSourcesList = ['1', '2', '9', '10', '13', '14', '39', '41', '40', '[ZD]20', '[ZD]20', '[ZD]16', '[ZD]10']
    let keys = ['BMDM|BMMC', 'XMDM|XMMC', 'FZX8DM|FZX8MC', 'FZX9DM|FZX9MC', 'FZX12DM|FZX12MC', 'FZX13DM|FZX13MC', 'GZHDDM|GZHDMC', 'KZZL1DM|KZZL1MC', 'XMLBDM|XMLBMC', 'ZY', 'HYLB', 'JFGC', 'DD']
    let index = keys.indexOf(key)
    if (index !== -1) {
      return dataSourcesList[index]
    }
  },
  // 传入数据来源响应对应的key
  getkey (dataSources) {
    // 以下注释来源于 杨乐乐
    // --注释：GZHDDM:39，ZY:[ZD]20，DD:[ZD]10，JFGC:[ZD]16 来源于项目（北新泾）暂不变动，20200611其他项已经按照产品标准统一
    let dataSourcesList = ['1', '2', '9', '10', '13', '14', '39', '41', '40', '[ZD]20', '[ZD]20', '[ZD]16', '[ZD]10']
    let keys = ['BMDM|BMMC', 'XMDM|XMMC', 'FZX8DM|FZX8MC', 'FZX9DM|FZX9MC', 'FZX12DM|FZX12MC', 'FZX13DM|FZX13MC', 'GZHDDM|GZHDMC', 'KZZL1DM|KZZL1MC', 'XMLBDM|XMLBMC', 'ZY', 'HYLB', 'JFGC', 'DD']
    let index = dataSourcesList.indexOf(dataSources)
    if (index !== -1) {
      return keys[index]
    }
  },
  equalsArray (a1, a2) {
    if (!(Array.isArray(a1) && Array.isArray(a2))) {
      return false
    }
    if (a1.length !== a2.length) {
      return false
    }
    a1.sort()
    a2.sort()
    for (var i = 0; i < a1.length; i++) {
      if (typeof a1[i] !== typeof a2[i]) {
        return false
      }

      if (this.hasKey(a1[i]) && this.hasKey(a2[i])) {
        var retVal = this.equalsObject(a1[i], a2[i])
        if (!retVal) {
          return false
        }
      } else if (Array.isArray(a1[i]) && Array.isArray(a2[i])) { // recursion
        if (!this.equalsArray(a1, a2)) {
          return false
        }
      } else if (a1[i] !== a2[i]) {
        return false
      }
    }
    return true
  },
  // 单据日期初始化月初日期和当前日期
  initDate () {
    let monthEndDate = new Date()
    let year = monthEndDate.getFullYear()
    // let month = monthEndDate.getMonth()
    let monthStartDate = new Date(year, 0, 1)
    return [monthStartDate.Format('yyyy-MM-dd'), monthEndDate.Format('yyyy-MM-dd')]
  },
  initMonthDate () {
    let monthEndDate = new Date()
    let year = monthEndDate.getFullYear()
    let month = monthEndDate.getMonth()
    let monthStartDate = new Date(year, month, 1)
    return [monthStartDate.Format('yyyy-MM-dd'), monthEndDate.Format('yyyy-MM-dd')]
  },
  initQuarter () {
    let date = new Date()
    let monthEndDate = new Date()
    var month = date.getMonth()
    if (month < 3) {
      date.setMonth(0)
    } else if (month > 2 && month < 6) {
      date.setMonth(3)
    } else if (month > 5 && month < 9) {
      date.setMonth(6)
    } else if (month > 8 && month < 11) {
      date.setMonth(9)
    }
    date.setDate(1)
    return [date.Format('yyyy-MM-dd'), monthEndDate.Format('yyyy-MM-dd')]
  },
  /**
   * 乘法运算
   *
   * @param arguments 乘数入参，个数不定
   * @returns 乘积
   */
  multiplys () {
    let result = 1
    let m = 0
    for (let item in arguments) {
      arguments[item] = this.isNull(arguments[item]) ? 0 : arguments[item]
      let multiplier = arguments[item].toString()
      try {
        m += multiplier.split('.')[1].length
      } catch (e) { }
      result = result * Number(multiplier.replace('.', ''))
    }
    result = (result / Math.pow(10, m)).toFixed(2).toString()
    return result
  },
  /**
   * 加法运算
   *
   * @param arguments 加数入参，个数不定
   * @returns 和
   */
  adds () {
    let result = 0
    let arrLength = []
    let r1, m
    for (let item in arguments) {
      arguments[item] = this.isNull(arguments[item]) ? 0 : arguments[item]
      try {
        r1 = arguments[item].toString().split('.')[1].length
      } catch (e) {
        r1 = 0
      }
      arrLength.push(r1)
      result += parseFloat(arguments[item].replace(/,/g, ''))
    }
    m = Math.pow(10, Math.max.apply(null, arrLength))
    result = ((result * m) / m).toFixed(2).toString()
    return result
  },
  /*
  * 处理表头，处理表头特殊key的宽度
  * parmas:columns(待处理表头)、width(设置宽度)
  * 需要设置的表格宽度的键值为：单据编号，单据类型、单据号，单据日期、开始日期、结束日期、单据日期
  * 其余列的最小宽度默认是100
  */
  dealColumns (columns, width) {
    let existKeys = ['DJBH', 'DJLX', 'DJH', 'DJDATE', 'HDKSRQ', 'HDJSRQ', 'DJRQ']
    for (let i = 0, len = columns.length; i < len; i++) {
      if (columns[i].hasOwnProperty('children')) {
        this.dealColumns(columns[i].children)
      } else {
        if (existKeys.indexOf(columns[i].field) === -1) {
          columns[i]['minWidth'] = columns[i]['min-width'] || 120
        } else {
          columns[i]['width'] = 120
        }
      }
    }
    return columns
  },

  /*
  * 单据日期按照模板添加-
  * template:设置返回的日期结果 eg:'yyyy-MM-dd'
  * dataValue:返回的日期结果
  */
  dealDate (data, template) {
    let templateArr = template.split('-')
    let startIndex = 0
    let tempArr = []
    for (let i = 0, len = templateArr.length; i < len; i++) {
      let tempLength = templateArr[i].length
      tempArr.push(data.substring(startIndex, startIndex + tempLength))
      startIndex += tempLength
    }

    let dataValue = ''
    for (let j = 0, len = tempArr.length; j < len; j++) {
      if (j === 0) {
        dataValue += tempArr[0]
      } else {
        dataValue += '-' + tempArr[j]
      }
    }
    return dataValue
  },

  // 导出表格数据到 excel
  exportExcel (columns, checkedData, exportName, modCode) {
    let index = -1
    let list1 = JSON.parse(JSON.stringify(columns).replace(/field/g, 'code').replace(/key/g, 'code').replace(/title/g, 'name')) // 处理表头
    for (let i = 0; i < list1.length; i++) {
      let childrenList = []
      if (list1[i].children) {
        index = i
        for (let j = 0, len = list1[i].children.length; j < len; j++) {
          list1[i].children[j].name = list1[i].name + list1[i].children[j].name
          childrenList.push(list1[i].children[j])
        }
        list1.splice(index, 1)
        for (let k = 0, childLen = childrenList.length; k < childLen; k++) {
          list1.splice(index, 0, childrenList[k])
          index++
        }
      }
    }
    let list0 = []
    list1.forEach(item => {
      if (item.type !== 'selection' && item.type !== 'index') {
        let obj = {
          code: item.code,
          name: item.name,
          type: item.type
        }
        list0.push(obj)
      }
    })
    list0.map((v, i) => {
      v.xh = i.toString()
    })
    let params = {
      titleMap: { 'listNum': '1', list0 },
      infoList: checkedData,
      title: exportName,
      externalList: [],
      modCode
    }
    return outPut(params).then(res => {
      const content = res
      const blob = new Blob([content])
      const fileName = exportName + '.xlsx'
      if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else { // IE10+下载
        navigator.msSaveBlob(blob, fileName)
      }
    })
  },

  /*
  * 确定当前按钮是否可用,如果没有返该按钮的map，也代表有权限
  * powerBtns= [
  *   {
  *      BUTTONCODE: 'delete',
  *      ISENABLED: '1'
  *   }
  * ]
  * key = 'delete'
  * type: '科目'、'辅项'  账表区分科目和辅项的功能权限 针对同一页面不同功能对应同一字段
  */
  isAvailable (powerBtns, key, type) {
    let flag = true
    if (!powerBtns || powerBtns.length === 0) {
      return true
    }
    powerBtns.forEach(el => {
      if (type) {
        // 账务账表权限
        if (el.BUTTONCODE === key && el.GNSCRIPT.substring(0, 2) === type) {
          if (el.ISENABLED === '1') {
            flag = true
          } else {
            flag = false
          }
        }
      } else {
        if (el.BUTTONCODE === key) {
          if (el.ISENABLED === '1') {
            flag = true
          } else {
            flag = false
          }
        }
      }
    })
    return flag
  }
}

// eslint-disable-next-line no-extend-native
Date.prototype.Format = function (fmt) { // author: meizz
  var o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'H+': this.getHours(),
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) { if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  return fmt
}
