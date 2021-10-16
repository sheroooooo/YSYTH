import toolutil from '@/libs/toolutil'
// import { EXPRESSIOON_LIST } from '@/api/pub/keyboard'

export default {
  data () {
    return {
      EQ_VALUE_STORE: {},
      ACTIVE_INDEX: 0
    }
  },
  methods: {
    // formula：公式map basicObj: 全局valueMap, this.activeIndex 当前计算的第几个
    analysis (formula, basicObj, activeIndex) {
      this.EQ_VALUE_STORE = basicObj
      this.ACTIVE_INDEX = activeIndex
      // console.log(formula.val)
      let expressionList = this.formatExpress(formula.val)
      let equationMap = {
        sum: (s, i) => this.EQ_SUM(s, i),
        tsfCN: (s, i) => this.EQ_TSFCN(s, i),
        reCptD: (s, i) => this.EQ_RECPTD(s, i),
        cptD: (s, i) => this.EQ_CPTD(s, i)
      }
      // console.log(expressionList)
      let resultArray = expressionList.map(item => {
        let reg = new RegExp('sum|cptD|tsfCN|reCptD', 'g')
        item.replace(reg, (a) => {
          item = equationMap[a](item, this.ACTIVE_INDEX)
        })
        return item
      })
      // console.log(resultArray)
      // eslint-disable-next-line
      function sum () {
        let a = [ ...arguments ]
        return a.reduce((result, item) => result + item)
      }
      try {
        let result = resultArray.map(item => {
          item = item.replace(/\[(.)+?\]/g, (key) => {
            return this.getValue(key, this.ACTIVE_INDEX)
          })
          return item
        })
        // console.log(result)
        /* eslint no-eval: "off" */
        // console.log(eval(result.join('')))
        // console.log(result.join(''))
        return eval(result.join('')) || 0
      } catch (e) {
        // console.log(e)
        return 0
      }
    },
    // 将公式字符串解析成map结构
    formatExpress (formula) {
      let operatorMap = ['+', '-', '*', '/']
      let equl = 0
      let array = []
      let index = 0
      let stringArray = formula.split('')
      let stringLen = stringArray.length
      for (let i = 0; i < stringArray.length; i++) {
        const element = stringArray[i]
        if (equl === 0 && operatorMap.indexOf(element) !== -1) {
          array.push(formula.slice(index, i), formula.slice(i, i + 1))
          index = i + 1
          i = index + 1
        }
        if (element !== '(' && element !== ')') continue
        if (element === '(') equl += 1
        if (element === ')') equl -= 1
        if (equl === 0) {
          array.push(formula.slice(index, i + 1))
          if (i !== stringArray.length - 1) {
            array.push(formula.slice(i + 1, i + 2))
            index = i + 2
            i = i + 2
          }
        }
      }
      if (array.join().length !== stringLen) {
        array.push(formula.slice(array.join('').length))
      }
      return array
    },
    // 取值函数
    getValue (expression, index = 0) {
      let ol = expression.replace(/\[|\]/g, '').split('.', 2)
      let keyData = ''
      let areaTitle = ol[0]
      let key = ol[1]
      if (Array.isArray(this.EQ_VALUE_STORE[areaTitle].data)) {
        keyData = this.EQ_VALUE_STORE[areaTitle].data[index][key]
      } else {
        keyData = this.EQ_VALUE_STORE[areaTitle].data[key]
      }
      if (!keyData) {
        return 0
      } else {
        return isNaN(Number(keyData)) ? `"${keyData}"` : Number(keyData)
      }
    },
    // 解析全局公式公式返回true or fase
    validateEQ (eqlist, values) {
      let vd = true
      let eq = ''
      if (!eqlist) {
        return false
      } else {
        let tableOutItemLength = []
        for (let i = 0, len = eqlist.length; i < len; i++) {
          eq = eqlist[i]
          let mqArray = eq.val.split(/\[|]/)
          for (let k = 0, len = mqArray.length; k < len; k++) {
            let mqItem = mqArray[k]
            if (mqItem === '' || k % 2 === 0) continue
            let ol = mqItem.split('.', 2)
            if (Array.isArray(values[ol[0]].data)) {
              tableOutItemLength = values[ol[0]].data.length > tableOutItemLength.length ? values[ol[0]].data : tableOutItemLength
            } else {
              tableOutItemLength = tableOutItemLength.length ? tableOutItemLength : [values[ol[0]].data]
            }
          }
          for (let i = 0; i < tableOutItemLength.length; i++) {
            vd = this.analysis(eq, values, i)
            // console.log(vd)
            if (!vd) {
              this.$fn.error({ title: '校验失败', desc: eq.message ? `${eq.message}` : `"${eq.text}",校验失败！` })
              vd = false
              break
            }
          }
          if (vd === false) return vd
        }
      }
      return vd
    },
    // 求和
    EQ_SUM (expression) {
      // console.log(expression);
      let expressList = []
      expression.replace(/\[(.)+?\]/g, (key) => {
        let ol = key.replace(/\[|\]/g, '') // key: [基础信息.JE] => ol: 基础信息.JE
        let olArray = ol.split('.')
        let structTitle = olArray[0]
        let valueKey = olArray[1] || 0
        let eqData = this.EQ_VALUE_STORE[structTitle].data
        if (Array.isArray(eqData)) {
          expressList = expressList.length < eqData.length ? new Array(eqData.length).fill(expression) : expressList
          eqData.map((item, index) => {
            expressList[index] = expressList[index].replace(new RegExp(ol, 'g'), item[valueKey] || 0).replace(/\[|\]/g, '')
          })
        } else {
          // console.log(eqData)
          // console.log(expression)
          expressList = new Array(1).fill(expression)
          expressList[0] = expressList[0].replace(new RegExp(ol, 'g'), eqData[valueKey])
        }
        expression = expressList.join('+')
      })
      return expression
    },
    // 数字大小写转换
    EQ_TSFCN (expression, index = 0) {
      let keyData = expression.replace(/\[(.)+?\]/g, (key) => {
        return this.getValue(key, index)
      })
      let number = keyData.match(/\d+[.+\d]*/g) || 0 // tsfcn(12+33) => 取出其中的12+33
      let format = Number(eval(number)).toFixed(2) // 计算22 + 33
      let result = number ? toolutil.formatMoneyCN(format) : '零元整'
      return `'${result}'`
    },
    // 计算相对天数 例如：12号到13号 1天
    EQ_CPTD (expression, index = 0, flag) {
      let newExp = expression.replace(/\[(.)+?\]/g, (key) => {
        return `'${this.getValue(key, index)}'`
      })
      let startTime = newExp.match(/\d+/g)[0] || 0
      let endTime = newExp.match(/\d+/g)[1] || 0
      if (startTime === '0' || endTime === '0') {
        if (flag) {
          return { result: 0, canAdd: false }
        }
        return 0
      }
      let result = computedTime(startTime, endTime)
      return !flag ? result : { result, canAdd: true }
    },
    // 计算绝对天数 例如：12号到13号 2天
    EQ_RECPTD (expression, index = 0) {
      let result = this.EQ_CPTD(expression, index, 'eq')
      // console.log(result)
      if (!result.canAdd) {
        return '0'
      }
      return String(Number(result.result) + 1)
    }
  }
}
// 计算时间差
function computedTime (startTime, endTime, diffType = 'data', basicObj, activeIndex) {
  if (!startTime || !endTime) return '0'
  startTime = formatTime(startTime)
  endTime = formatTime(endTime)
  // 将计算间隔类性字符转换为小写
  diffType = diffType.toLowerCase()
  var sTime = new Date(startTime) // 开始时间
  var eTime = new Date(endTime) // 结束时间
  // 作为除数的数字
  var timeType = 1000 * 3600 * 24
  switch (diffType) {
    case 'second':
      timeType = 1000
      break
    case 'minute':
      timeType = 1000 * 60
      break
    case 'hour':
      timeType = 1000 * 3600
      break
    case 'day':
      timeType = 1000 * 3600 * 24
      break
    default:
      break
  }
  let result = Math.abs(parseInt((eTime.getTime() - sTime.getTime()) / parseInt(timeType)))
  if (isNaN(result)) {
    return 0
  }
  return Math.abs(parseInt((eTime.getTime() - sTime.getTime()) / parseInt(timeType))).toString()
}
function formatTime (value) {
  let year = value.slice(0, 4)
  let month = value.slice(4, 6)
  let data = value.slice(6, 8)
  return `${year}/${month}/${data}`
}
