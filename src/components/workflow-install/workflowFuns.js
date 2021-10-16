import config from '@/config'
// import Vue from 'vue'
// import workflow from '_c/workflow/es/index.js'
// import {
//   startWorkflow
// } from '_c/workflow/es/workflow-func'
import {
  updataWorkflowStatus,
  invalidUpdataStatus,
  reductionUpdataStatus,
  deleteBill,
  getFlowEndList
} from '@/api/workFlow-pt/workFlow-pt'
import tools from '@/libs/toolutil' // 工作流相关

/*
 * 工作流  By zhaoyy
 */
export default {
  data () {
    return {
      variablesArry: [], // 工作流网关条件
      workflowVisible: false, // 工作流审核弹框
      horizontal: 'horizontal',
      Drawer: false, // 流程跟踪抽屉
      ISworkflowFull: false, // 流程跟踪显示
      workflowIsReject: false, // 是否显示驳回
      transferTitle: '转办', // 转办标题
      delegateTitle: '委托', // 委托，代办标题
      cancelTitle: '撤销', // 撤销标题
      extra: {}, // 工作流节点信息
      /** **** 公共入参 ********/
      gsdm: this.$store.getters.env.gsdm,
      kjnd: this.$store.getters.env.kjnd,
      batchVariablesArry: [] // 批量工作流网关条件
    }
  },
  computed: {
    workflowcheckOptions () {
      return {
        'businessKey': this.worflowDJBH,
        'isMessagePrefix': true,
        'variables': this.variablesArry
      }
    }
  },
  methods: {
    /*
     * 最终生成网关条件  worflowData 是生成网关条件的基础
     * 循环工作流数据，只取key='data'的对象数据（即为：表外项、表内项）
     * 生成的网关条件元素项： string、integer、boolean
     * obj = {
     *   type: valueType,
     *   name: filder,
     *   value: valueTemp[filder]
     * }
     * 目前表外向循环放入 Variables
     * 表内向多条数据，循环数据相同字段，行程数组合起来
     * 隐患：未考虑表内项和表外项key一样的情况
     */
    workflowcreateVariables (worflowData, options) {
      let Variables = [] // 存放主信息数组
      let BNXTemp = []
      let variablesArry = []
      for (let key in worflowData) {
        // 非单据设置的单据审核流
        if (options.notBillConfig) {
          // 如果是 对象
          if (typeof worflowData[key] === 'object' && !Array.isArray(worflowData[key])) {
            Variables = this.workflowGetVariables(worflowData[key])
          } else if (Array.isArray(worflowData[key])) {
            // 如果是数组
            let elementBNX = worflowData[key]
            BNXTemp = this.workflowGetVariables(elementBNX[0])
            for (let h = 1, len = elementBNX.length; h < len; h++) {
              for (let key in elementBNX[h]) {
                for (let k = 1, len = BNXTemp.length; k < len; k++) {
                  if (BNXTemp[k].name === key) {
                    if (elementBNX[key]) {
                      BNXTemp[k].value = BNXTemp[k].value + elementBNX[key]
                    }
                  }
                }
              }
            }
          } else { // 基础类型
            BNXTemp = this.workflowGetVariables({ key: worflowData[key] })
          }
        } else {
          // 单据设置的单据审核流
          if (worflowData[key] !== undefined && worflowData[key].data !== undefined) {
            let valueTemp = worflowData[key]['data']
            if (worflowData[key].FIELDTYPE === -1) { // 表外项
              Variables = this.workflowGetVariables(valueTemp)
            } else if (worflowData[key].CARDTYPE === '2') { // 表内项
              let elementBNX = worflowData[key]['data']
              BNXTemp = this.workflowGetVariables(elementBNX[0], 'ZB.')
            }
          }
        }
        variablesArry = Variables.concat(BNXTemp)
      }
      variablesArry.push({
        type: 'string',
        name: 'unitId',
        value: options.data && options.data.length ? options.data[0].GSDM || this.$store.state.app.env.gsdm : this.$store.state.app.env.gsdm
      })
      return variablesArry
    },
    // 网关条件循环
    workflowGetVariables (valueList, prevString) {
      let valuesTemp = []
      for (let key in valueList) {
        if (key.indexOf('|') !== -1 && valueList[key]) {
          let eof = tools.eof(key, '|')
          let etype = tools.eof(valueList[key], ' ')
          let bof = tools.bof(key, '|')
          let btype = tools.bof(valueList[key], ' ')
          let obj = {
            type: 'string',
            name: prevString ? `${prevString}${eof}` : eof,
            value: etype
          }
          let bobj = {
            type: 'string',
            name: prevString ? `${prevString}${bof}` : bof,
            value: btype
          }
          // 后台key的问题.存在 |JBR  HT_STATE| 这样的key 所以这样处理
          obj.name && valuesTemp.push(obj)
          bobj.name && valuesTemp.push(bobj)
        } else {
          let type = typeof (valueList[key])
          let valueType = false
          switch (type) {
            case 'string':
              valueType = 'string'
              break
            case 'number':
              valueType = 'integer'
              break
            case 'boolean':
              valueType = 'boolean'
              break
            default:
              valueType = false
          }
          if (valueType) {
            let obj = {
              type: valueType,
              name: prevString ? `${prevString}${key}` : key,
              value: valueList[key]
            }
            valuesTemp.push(obj)
          }
        }
      }
      return valuesTemp
    },
    // 判断单据是否有taskId options = {}
    workflowIsTaskId (options) {
      let selectTableData = options.data
      let flag = options.flag
      let error = []
      for (let i = 0, len = selectTableData.length; i < len; i++) {
        if (!selectTableData[i].hasOwnProperty('taskId')) {
          let businessKeyDJBH = selectTableData[i][options.djbhField]
          error.push(businessKeyDJBH)
        }
      }
      if (error.length > 0) {
        let errorParmas = { noTask: true, data: error }
        return Promise.resolve(errorParmas)
      } else {
        switch (flag) {
          case 'batch-rev': // 批量送审
          case 'batch-approve': // 批量审核
            return this.workflowBathApproPremise(options)
          case 'batch-back': // 批量驳回
            return this.workflowBathBack(options)
          case 'batch-cancel': // 批量销审
            return this.workflowActivation(options).then((res) => {
              options.data = options.data.filter(item => { // 将不需要激活的数据进行销审
                return res.businessKey.indexOf(item[options.businessField]) === -1
              })
              if (options.data.length) {
                return this.workflowBathCancel(options, res.result)
              }
              return res.result
            })
          case 'batch-recover': // 批量收回
            return this.workflowBathCancel(options)
        }
      }
    },
    /*
      * 更新单据状态 单笔、批量
      * @parmas{
        'bizTypeCode': 单据类型,
        'businessKey': 操作的单据编号数组集合
          reData：{  批量收回、撤销成功条数、失败条数
            successLength: 0,
            errorLength: 0
          }
        }
      }
    */
    workflowUpdataStatusBath (options, reData) {
      let _this = this
      let parmas = {
        'appCode': _this.appCode || window.location.href.split('/')[3],
        'userCode': tools.getLocal('userCode') || '',
        // 'gsdm': _this.$store.state.app.env.gsdm,
        // 'kjnd': _this.$store.state.app.env.kjnd,
        'THLX': options.THLX || undefined,
        'THXX': options.THXX || undefined,
        'IDList': []
      }
      options.businessKey_djlxid.map((item, index) => {
        parmas.IDList.push({
          bizTypeCode: item.djlxid,
          businessKey: item.businessKey,
          sourceNodeId: options.sourceNodeIdList ? options.sourceNodeIdList[index] || undefined : undefined,
          targetNodeId: options.targetNodeIdList ? options.targetNodeIdList[index] || undefined : undefined,
          procDefId: options.procDefIdList ? options.procDefIdList[index] || undefined : undefined,
          appCode: item.appCode || window.location.href.split('/')[3],
          gsdm: item.GSDM || _this.$store.state.app.env.gsdm,
          kjnd: item.KJND || _this.$store.state.app.env.kjnd
        })
      })
      return updataWorkflowStatus(parmas).then(res => {
        let values = reData || res
        values['variables'] = this.variablesArry
        values['variablesBatch'] = this.batchVariablesArry
        return values
      })
    },
    // 获取单据节点信息  单据页面操作单笔数据前获取单据节点信息
    workflowGetInfo (options = {}) {
      this.variablesArry = this.workflowcreateVariables(this.worflowData, options)
      let _this = this
      let flag = options.flag
      return new Promise((resolve, reject) => {
        this.$workflow.getWorkflowInfo({
          bizTypeCode: _this.worflowDJLX || options.djlxid,
          businessKey: _this.worflowDJBH || options.DJBH,
          rgCode: '100001',
          unitCode: options.data && options.data.length ? options.data[0].GSDM || _this.$store.getters.env.gsdm : _this.$store.getters.env.gsdm,
          userCode: tools.getLocal('userCode') || '',
          variables: _this.variablesArry,
          onComplete: (ret) => {
            if (ret.hasOwnProperty('taskId')) {
              _this.extra.taskId = _this.TASKID || options.taskId
              _this.extra.procDefId = ret.procDefId
              _this.extra.nodeId = ret.nodeId
              _this.extra.procInstId = ret.procInstId
              //  驳回 送审、审核
              if (flag === 'back') {
                resolve(_this.workflowBack(options))
              } else {
                resolve(_this.workflowApprove(options))
              }
            } else {
              let errorParmas = { noTask: true }
              return errorParmas
            }
          }
        })
      })
    },
    /*
     * 送审、审核：rev  批量送审、批量审核 ：batch-rev
     * @parmas:  { flag:'rev', data:[], }
    */
    workflowAction (options) {
      let flag = options.flag
      switch (flag) {
        case 'start': // 启动工作流
          return this.workflowReview(options)
        case 'rev': // 单笔送审、审核
          return this.workflowGetInfo(options)
        case 'batch-rev': // 批量送审
          return this.workflowIsTaskId(options)
        case 'batch-approve': // 批量审核
          // 单笔审核与批量审核都会有弹框
          // 登记簿中批量审核  如果只选择了一条数据，则走单笔审核，否则走批量审核
          if (options.data && options.data.length === 1) {
            let singleOptions = {
              flag: 'rev',
              djlxid: options.data[0].DJLXID,
              taskId: options.data[0].taskId,
              DJBH: options.data[0][options.businessField],
              tip: '审核成功',
              data: [{
                'djid': options.data[0][options.businessField],
                'djbm': options.data[0][options.businessField],
                'GSDM': options.data[0].GSDM || this.$store.state.app.env.gsdm,
                'KJND': options.data[0].KJND || this.$store.state.app.env.kjnd
              }]
            }
            return this.workflowGetInfo(singleOptions)
          } else {
            return this.workflowIsTaskId(options)
          }
        case 'back': // 驳回
          return this.workflowGetInfo(options)
        case 'batch-back': // 批量驳回
          return this.workflowIsTaskId(options)
        case 'cancel': // 销审
          return this.workflowActivation(options, true).then((res) => {
            if (res && !res.hasActive) { // 如果不存在需要激活的数据
              return this.workflowCancel(options).then((parmas) => {
                parmas.THLX = 'cancel_review'
                parmas.THXX = '销审'
                parmas.businessKey_djlxid = [{
                  businessKey: parmas.businessKey[0],
                  djlxid: parmas.djlxid,
                  appCode: this.appCode || window.location.href.split('/')[3],
                  GSDM: parmas.GSDM || this.$store.state.app.env.gsdm,
                  KJND: parmas.KJND || this.$store.state.app.env.kjnd
                }]
                return this.workflowUpdataStatusBath(parmas)
              })
            } else if (!res) { // 如果单笔激活失败
              return false
            } else {
              res.THLX = 'cancel_review'
              res.THXX = '销审'
              res.businessKey_djlxid = [{
                djlxid: res.djlxid,
                businessKey: res.businessKey[0],
                appCode: this.appCode || window.location.href.split('/')[3],
                GSDM: res.GSDM || this.$store.state.app.env.gsdm,
                KJND: res.KJND || this.$store.state.app.env.kjnd
              }]
              return this.workflowUpdataStatusBath(res).then((res) => {
                if (res && res.status === 200) {
                  this.$fn.success({ title: '成功提示', desc: '销审成功' })
                  this.getButton && this.getButton()
                }
                return res
              })
            }
          })
        case 'batch-cancel': // 批量销审
          return this.workflowIsTaskId(options)
        case 'batch-recover': // 收回
          return this.workflowIsTaskId(options)
        case 'invalid': // 单笔作废
          return this.worlflowInvalidSingle(options)
        case 'batch-invalid': // 批量作废
          return this.worlflowInvalidBath(options)
        case 'reduction': // 单笔还原
          return this.worlflowReductionSingle(options)
        case 'batch-reduction': // 批量还原
          return this.worlflowReductionBath(options)
        case 'log': // 审核日志
          return this.workflowLog(options)
      }
    },
    // 工作流启动 单据保存时候，就启动工作流，肯定是单条
    workflowReview (options = {}) {
      this.variablesArry = this.workflowcreateVariables(this.worflowData, options)
      let _this = this
      return new Promise((resolve, reject) => {
        this.$workflow.start({
          // 单据模块类型code eg:GSP
          appCode: window.location.href.split('/')[3],
          // 单据类型 eg: 1 (会议申请单类型)
          bizTypeCode: _this.worflowDJLX,
          // 区划code
          rgCode: '100001',
          // 单位code
          unitCode: _this.$store.getters.env.gsdm,
          // 单据id
          businessKey: _this.worflowDJBH,
          // 用户id
          userCode: localStorage.getItem('userId').toString(),
          // 是否默认审核第一节点
          approveFirstNode: false, // 默认为true
          // 网关分支扩展变量
          // 数组, 可以放多个变量
          // object结构
          //  {
          //       type: 类型 string,integer,long,short,double,boolean,date,json
          //       name: 变量名,
          //       value: 值，根据type不同，值不同
          //  }
          variables: _this.variablesArry,
          onComplete: (ret) => {
            this.extra = ret.extra
            this.TASKID = ret.extra.taskId
            if (ret.error) {
              _this.$fn.error({ title: '错误', desc: ret.message })
              _this.deleteBill()
              reject(new Error(ret.message))
            } else {
              _this.$fn.success({ title: '正确标题', desc: '启动工作流成功' })
              _this.ISworkflowFull = true
              if (!options.notBillConfig) {
                _this.getButton()
              }
              resolve(ret)
            }
          }
        })
      })
    },
    // 删除单据 启动工作流失败，删除单据
    deleteBill () {
      let _this = this
      let parmas = {
        'gsdm': _this.$store.state.app.env.gsdm,
        'kjnd': _this.$store.state.app.env.kjnd,
        'djlxid': _this.worflowDJLX,
        'MLID': _this.worflowDJBH
      }
      let data = {
        params: parmas,
        url: (window.location.href.split('/')[3]).toLowerCase()
      }
      deleteBill(data)
    },
    async deleteBillWorkFlow (data) {
      let djguid = data || this.worflowDJBH
      return this.$workflow.extra.deleteWorkflow(djguid).then(res => {
        this.$fn.error({ title: '错误', desc: res.message })
        return res
      }).catch(e => {
        if (!e) return ''
      })
    },
    /*
* 单笔送审、审核;批量送审、审核
* 送审核批量送审不弹框
 * options={
 *    'flag':'rev',
 *    'djlxid':'',
 *    'data':[
 *       {
 *          'djid': options.djid,
            'djbm': options.djbm
 *       }
 *    ]
 * }
 */
    workflowApprove (options) {
      let _this = this
      return new Promise((resolve, reject) => {
        let businessKey = _this.worflowDJBH || options.DJBH
        let djlxid = _this.worflowDJLX || options.djlxid
        let appCode = this.appCode || window.location.href.split('/')[3]
        let gsdm = options.data && options.data.length ? options.data[0].GSDM || _this.$store.getters.env.gsdm : _this.$store.getters.env.gsdm
        let kjnd = options.data && options.data.length ? options.data[0].KJND || _this.$store.getters.env.kjnd : _this.$store.getters.env.kjnd
        let params = this.$route.params
        if (!this.extra.nodeId || !this.extra.taskId) {
          this.$fn.error({ title: '错误', desc: '该单据状态已经改变,请关闭单据重试。' })
          return Promise.resolve(false)
        }
        this.$workflow.approve({
          taskId: _this.extra.taskId,
          procDefId: _this.extra.procDefId,
          nodeId: _this.extra.nodeId,
          businessKey,
          variables: _this.variablesArry,
          bizExtra: {
            bizTitle: `${params.gnflMc || params.title}-${this.billIdentify}${this.billId ? '-' + this.billId : ''}`
          },
          onComplete: (ret) => {
            if (ret.error) {
              this.$fn.error({ title: '错误', desc: ret.message })
              reject(new Error(ret.message))
            } else {
              this.$fn.success({ title: '成功', desc: options.tip })
              let parmas = {
                businessKey_djlxid: [{ djlxid, businessKey, appCode, gsdm, kjnd }]
              }
              resolve(this.workflowUpdataStatusBath(parmas).then(res => {
                if (!options.notBillConfig) {
                  _this.getButton()
                }
                return res
              }))
            }
          },
          onCancel: reject
        })
      })
    },
    /*
 * 登记簿批量送审获取网关
 * options =  {
 *  'flag': 'batch-aud',
 *  'data':selectData
 *  'businessField':''
 */
    workflowBathApproPremise (options) {
      let sendArray = []
      let objArray = []
      let selectTableData = options.data
      for (let i = 0, len = selectTableData.length; i < len; i++) {
        objArray.push({
          'taskId': selectTableData[i].taskId,
          'businessKey': selectTableData[i][options.businessField],
          'djbh': selectTableData[i][options.djbhField],
          'variables': '',
          'djlx': selectTableData[i].DJLXID || options.djlxid,
          'appCode': selectTableData[i].appCode || window.location.href.split('/')[3],
          'GSDM': selectTableData[i].GSDM || this.$store.state.app.env.gsdm,
          'KJND': selectTableData[i].KJND || this.$store.state.app.env.kjnd
        })
        sendArray.push(this.getBillData(selectTableData[i]))
      }
      return Promise.all(sendArray).then(resGroup => {
        for (let j = 0, len = resGroup.length; j < len; j++) {
          objArray[j].variables = this.workflowcreateVariables(resGroup[j].data, options)
        }
        this.batchVariablesArry = objArray
        let parmas = {
          'flag': options.flag,
          'businessField': options.businessField,
          'list': objArray,
          'tip': options.tip
        }
        return this.workflowBookBathApprove(parmas)
      })
    },
    // 登记簿批量送审、审核
    workflowBookBathApprove (options) {
      return new Promise((resolve, reject) => {
        this.$workflow.batchApprove({
          isTextMessage: options.flag === 'batch-approve',
          list: options.list,
          onComplete: (ret) => {
            let checkPassList = []
            if (ret.error) {
              if (ret.detail) {
                /* 错误信息先自己处理，工作流修改格式之后再另处理 */
                let dealedInfo = this.extractErrorDJBH(ret.detail, options) // 处理工作流的返回信息
                let checkFailList = dealedInfo.errorDJBH // 错误单据的guid数组，过滤失败数据用
                let errorReason = dealedInfo.DJBHMap // 错误单据的原因与guid组成的Map，展示错误信息用
                options.list.map(listItem => {
                  if (!checkFailList.includes(listItem.businessKey)) {
                    checkPassList.push(listItem)
                  }
                })
                let errorInfo = [] // 要展示的错误信息
                errorReason.map(item => {
                  errorInfo.push('以下单据' + item.reason + '</br>' + item.DJBHArr + '</br>')
                })
                this.$fn.warning({ desc: `审核成功${checkPassList.length}条  审核失败${checkFailList.length}条</br>错误原因：</br>${errorInfo}` })
              } else {
                this.$fn.error({ title: '错误', desc: ret.message })
              }
              reject(new Error(ret.error))
            } else {
              if (options.tip) {
                this.$fn.success({ title: '成功', desc: options.tip })
              }
              checkPassList = options.list
            }
            if (checkPassList.length) {
              let statusOptions = {
                // 'djlxid': this.worflowDJLX,
                'businessField': options.businessField,
                'businessKey_djlxid': []
              }
              for (let i = 0, len = checkPassList.length; i < len; i++) {
                statusOptions.businessKey_djlxid.push({
                  businessKey: checkPassList[i].businessKey,
                  djlxid: checkPassList[i].djlx,
                  appCode: checkPassList[i].appCode || window.location.href.split('/')[3],
                  GSDM: checkPassList[i].GSDM || this.$store.state.app.env.gsdm,
                  KJND: checkPassList[i].KJND || this.$store.state.app.env.kjnd
                })
              }
              resolve(this.workflowUpdataStatusBath(statusOptions))
            }
          }
        })
      })
    },
    // 获取字符串中某段字符的所有的位置
    searchSubStr (str, subStr) {
      let positions = []
      let pos = str.indexOf(subStr)
      while (pos > -1) {
        positions.push(pos)
        pos = str.indexOf(subStr, pos + 1)
      }
      return positions
    },
    // 提取出失败的单据编号
    extractErrorDJBH (detailInfo, options) {
      let errorDJBH = []
      let DJBHMap = []
      let differentReasonDJList = detailInfo.split('需要单独审批')
      differentReasonDJList.map(DJListItem => {
        let reason = DJListItem.split('等单据')[1]
        let DJBHArr = []
        let positionList = this.searchSubStr(DJListItem.split('等单据')[0], '单据号:')
        let businessKey = ''
        positionList.map(item => {
          errorDJBH.push(DJListItem.split('等单据')[0].substr(item + 4, 32))
          businessKey = DJListItem.split('等单据')[0].substr(item + 4, 32)
          for (let listItem of options.list) {
            if (listItem.businessKey === businessKey) {
              DJBHArr.push(listItem.djbh)
            }
          }
        })
        if (reason) {
          DJBHMap.push({
            reason: reason,
            DJBHArr: DJBHArr.join('，')
          })
        }
      })

      return {
        errorDJBH: errorDJBH,
        DJBHMap: DJBHMap
      }
    },
    // 工作流单笔驳回
    workflowBack (options = {}) {
      let _this = this
      return new Promise((resolve, reject) => {
        if (!this.extra.nodeId || !this.extra.taskId) {
          this.$fn.error({ title: '错误', desc: '该单据状态已经改变,请关闭单据重试。' })
          return Promise.resolve(false)
        }
        this.$workflow.back({
          taskId: _this.extra.taskId,
          procDefId: _this.extra.procDefId,
          nodeId: _this.extra.nodeId,
          procInstId: _this.extra.procInstId,
          isTextMessage: true,
          onComplete: (ret) => {
            if (ret.error) {
              this.$fn.error({ title: '错误', desc: ret.message })
            } else {
              this.$fn.success({ title: '成功', desc: '驳回成功' })
              let parmas = {
                businessKey_djlxid: [{
                  'djlxid': _this.worflowDJLX,
                  'businessKey': _this.worflowDJBH,
                  'appCode': this.appCode || window.location.href.split('/')[3],
                  'GSDM': options.data && options.data.length ? options.data[0].GSDM || _this.$store.getters.env.gsdm : _this.$store.getters.env.gsdm,
                  'KJND': options.data && options.data.length ? options.data[0].KJND || _this.$store.getters.env.kjnd : _this.$store.getters.env.kjnd
                }],
                'THLX': ret.extra.backType,
                'THXX': ret.extra.message,
                'sourceNodeIdList': [ret.extra.sourceNodeId],
                'targetNodeIdList': [ret.extra.targetNodeId],
                'procDefIdList': [_this.extra.procDefId]
              }
              resolve(this.workflowUpdataStatusBath(parmas).then((res) => {
                if (!options.notBillConfig) {
                  _this.getButton()
                }
                return res
              }))
            }
          },
          onCancel: reject
        })
      })
    },
    /*
* 批量驳回
* *options =  {
 *  'flag': 'batch-back',
 *  'data':selectData
 *  'businessField':''
 }
*/
    async workflowBathBack (options) {
      let selectTableData = options.data
      let res = { successLength: 0, errorLength: 0 }
      let businessKeyArray = []
      for (let i = 0, len = selectTableData.length; i < len; i++) {
        let businessKeyE = selectTableData[i][options.businessField]
        let result = await new Promise((resolve, reject) => {
          this.$workflow.cancel({
            businessKey: businessKeyE,
            onComplete: (ret) => {
              if (!ret.error) businessKeyArray.push(businessKeyE)
              resolve(ret.error)
            }
          })
        })
        if (result === 0) { // 成功时，接口返回0
          res.successLength += 1
        } else {
          res.errorLength += 1
        }
      }
      let parmas = {
        'businessField': options.businessField,
        'businessKey_djlxid': []
      }
      options.data.map(dataItem => {
        for (let businessKeyItem of businessKeyArray) {
          if (dataItem[options.businessField] === businessKeyItem) {
            parmas.businessKey_djlxid.push({
              businessKey: dataItem[options.businessField],
              djlxid: dataItem.DJLXID || options.djlxid,
              appCode: dataItem.appCode || window.location.href.split('/')[3],
              GSDM: dataItem.GSDM || this.$store.getters.env.gsdm,
              KJND: dataItem.KJND || this.$store.getters.env.kjnd
            })
            break
          }
        }
      })
      return this.workflowUpdataStatusBath(parmas, res)
    },
    // 单据单笔撤销
    async workflowCancel (options) {
      let _this = this
      let canCancel = await this.$workflow.validator.canTaskCancel({
        taskId: _this.TASKID,
        businessKey: _this.worflowDJBH
      })
      if (!canCancel) {
        _this.$fn.error({ title: '错误', desc: '收回校验失败,无法收回' })
        Promise.resolve(false)
        return false
      }
      return new Promise((resolve, reject) => {
        this.$workflow.cancel({
          businessKey: _this.worflowDJBH,
          title: _this.cancelTitle,
          onComplete: (ret) => {
            if (ret.error) {
              reject(new Error(ret.message))
              return _this.$fn.error({ title: '错误', desc: ret.message })
            }
            _this.$fn.success({ title: '正确', desc: options.tip })
            if (!options.notBillConfig) _this.getButton()
            resolve({
              'djlxid': _this.worflowDJLX,
              'businessKey': [_this.worflowDJBH],
              'GSDM': options.data && options.data.length ? options.data[0].GSDM || this.$store.getters.env.gsdm : this.$store.getters.env.gsdm,
              'KJND': options.data && options.data.length ? options.data[0].KJND || this.$store.getters.env.kjnd : this.$store.getters.env.kjnd
            })
          }
        })
      })
    },
    // 批量销审、收回
    async workflowBathCancel (options, params) {
      let selectTableData = options.data
      let res = { successLength: 0, errorLength: 0, ...params }
      // let sendArray = []
      let businessKeyArray = [] // 正确的单据编号
      for (let i = 0, len = selectTableData.length; i < len; i++) {
        let businessKeyE = selectTableData[i][options.businessField]
        let result = await new Promise((resolve, reject) => {
          this.$workflow.cancel({
            businessKey: businessKeyE,
            procDefId: selectTableData[i].procDefId || '',
            procInstId: selectTableData[i].procInstId || '',
            nodeId: selectTableData[i].nodeId || '',
            onComplete: (ret) => {
              if (!ret.error) businessKeyArray.push(businessKeyE)
              resolve(ret.error)
            }
          })
        })
        if (result === 0) { // 成功时，接口返回0
          res.successLength += 1
        } else {
          res.errorLength += 1
        }
      }
      let parmas = {
        // 'djlxid': this.worflowDJLX || options.djlxid,
        'businessField': options.businessField,
        // 'businessKey': businessKeyArray
        'businessKey_djlxid': []
      }
      options.data.map(dataItem => {
        for (let businessKeyItem of businessKeyArray) {
          if (dataItem[options.businessField] === businessKeyItem) {
            parmas.businessKey_djlxid.push({
              businessKey: dataItem[options.businessField],
              djlxid: dataItem.DJLXID || options.djlxid,
              appCode: dataItem.appCode || window.location.href.split('/')[3],
              GSDM: dataItem.GSDM || this.$store.getters.env.gsdm,
              KJND: dataItem.KJND || this.$store.getters.env.kjnd
            })
            break
          }
        }
      })
      return this.workflowUpdataStatusBath(parmas, res)
    },
    // 判断单据是不是进入终审状态(返回已经进入终审的数据)
    getBillStatus (data) { // 传入待销审数据
      return getFlowEndList({ checkList: data }).then(res => {
        if (res && res.status === 200) {
          return res.data
        } else {
          return []
        }
      })
    },
    // 工作流 激活(适用于 已经销审的单子再次进入销审)
    async workflowActivation (options, isSingle = false) {
      let sendData = null
      let businessFieldGroup = null
      if (!isSingle) { // 批量
        sendData = options.data
        businessFieldGroup = sendData.map(item => item[options.businessField])
      } else { // 单笔
        sendData = [options.data]
        businessFieldGroup = [this.worflowDJBH]
      }
      let endBill = await this.getBillStatus(businessFieldGroup)
      let businessKeyArray = [] // 正确的单据编号
      if (!endBill.length) {
        // 如果没有已经销审的数据,直接返回tue
        return Promise.resolve({ businessKey: [], result: { successLength: 0, errorLength: 0 } })
      }
      let failList = []
      let promiseGroup = endBill.map(item => {
        return new Promise((resolve) => {
          this.$workflow.activate({
            businessKey: item,
            onComplete: (ret) => {
              if (!ret.error) {
                businessKeyArray.push(item)
                return resolve(true)
              } else {
                failList.push({ businessKey: item, msg: ret.detail })
                return resolve(false)
              }
            }
          })
        })
      })
      return Promise.all(promiseGroup).then((resGroup) => {
        let res = { successLength: 0, errorLength: 0 }
        if (isSingle) {
          if (!resGroup[0]) {
            return this.$fn.warning({ desc: failList[0].msg })
          } else {
            return {
              djlxid: options.djlxid,
              businessKey: endBill,
              hasActive: true,
              GSDM: options.data && options.data.length ? options.data[0].GSDM || this.$store.getters.env.gsdm : this.$store.getters.env.gsdm,
              KJND: options.data && options.data.length ? options.data[0].KJND || this.$store.getters.env.kjnd : this.$store.getters.env.kjnd
            }
          }
        } else { // 如果是批量，继续进行,
          resGroup.map(item => {
            if (item) {
              res.successLength += 1
            } else {
              res.errorLength += 1
            }
          })
          let parmas = {
            // 'djlxid': options.data[0].DJLXID || options.djlxid,
            'businessField': options.businessField,
            // 'businessKey': endBill
            'businessKey_djlxid': []
          }
          endBill.map(bill => {
            for (let itemData of options.data) {
              if (itemData[options.businessField] === bill) {
                parmas.businessKey_djlxid.push({
                  businessKey: bill,
                  djlxid: itemData.DJLXID,
                  appCode: itemData.appCode || window.location.href.split('/')[3],
                  GSDM: itemData.GSDM || this.$store.getters.env.gsdm,
                  KJND: itemData.KJND || this.$store.getters.env.kjnd
                })
                break
              }
            }
          })
          this.workflowUpdataStatusBath(parmas, res)
          return { businessKey: endBill, result: res }
        }
      })
    },
    // 查看审核日志
    workflowLog (options = {}) {
      this.ISworkflowFull = true
      this.variablesArry = this.workflowcreateVariables(this.worflowData, options)
      this.Drawer = true
      this.workflowFull = true
      if (!options.notBillConfig) {
        // 增加延时。内部可能使用了v-if进行操作的审核日志显示隐藏
        setTimeout(() => this.$refs.workflowFull.reload(), 20)
      }
    },
    //  批量作废，直接调用后台接口,批量
    worlflowInvalidBath (options) {
      let _this = this
      let selectTableData = options.data
      // let businessKeyArray = [] // 正确的单据编号
      // for (let i = 0, len = selectTableData.length; i < len; i++) {
      //   let businessKeyE = selectTableData[i][options.businessField]
      //   businessKeyArray.push(businessKeyE)
      // }
      let parmas = {
        'appCode': window.location.href.split('/')[3],
        'userCode': tools.getLocal('userCode') || '',
        'gsdm': _this.$store.state.app.env.gsdm,
        'kjnd': _this.$store.state.app.env.kjnd,
        // 'bizTypeCode': options.data[0].DJLXID,
        // 'businessKey': businessKeyArray
        'IDList': []
      }
      for (let i = 0, len = selectTableData.length; i < len; i++) {
        parmas.IDList.push({
          bizTypeCode: selectTableData[i].DJLXID,
          businessKey: selectTableData[i][options.businessField]
        })
      }
      return invalidUpdataStatus(parmas).then(res => {
        if (res.status === 200) {
          let errorLen = res.data ? res.data.length : 0
          return {
            successLength: options.data.length - errorLen,
            errorLength: errorLen,
            ...res
          }
        }
        return res
      })
    },
    // 作废，单笔
    worlflowInvalidSingle (options = {}) {
      let _this = this
      let businessKeyArray = []
      businessKeyArray.push(this.worflowDJBH)
      let parmas = {
        'appCode': window.location.href.split('/')[3],
        'userCode': tools.getLocal('userCode') || '',
        'gsdm': _this.$store.state.app.env.gsdm,
        'kjnd': _this.$store.state.app.env.kjnd,
        'IDList': [{
          bizTypeCode: _this.worflowDJLX,
          businessKey: businessKeyArray[0]
        }]
        // 'bizTypeCode': _this.worflowDJLX,
        // 'businessKey': businessKeyArray
      }
      return invalidUpdataStatus(parmas).then(
        res => {
          if (res.status === 200) {
            this.$fn.success({
              title: '正确',
              desc: '作废成功'
            })
            if (!options.notBillConfig) {
              _this.getButton()
            }
            return res
          } else {
            this.$fn.error({
              title: '',
              desc: res.msg
            })
          }
        }
      )
    },
    //  批量还原，直接调用后台接口
    worlflowReductionBath (options) {
      let _this = this
      let selectTableData = options.data
      // let businessKeyArray = [] // 正确的单据编号
      // for (let i = 0, len = selectTableData.length; i < len; i++) {
      //   let businessKeyE = selectTableData[i][options.businessField]
      //   businessKeyArray.push(businessKeyE)
      // }
      let parmas = {
        'appCode': window.location.href.split('/')[3],
        'userCode': tools.getLocal('userCode') || '',
        'gsdm': _this.$store.state.app.env.gsdm,
        'kjnd': _this.$store.state.app.env.kjnd,
        // 'bizTypeCode': options.data[0].DJLXID,
        // 'businessKey': businessKeyArray
        'IDList': []
      }
      for (let i = 0, len = selectTableData.length; i < len; i++) {
        parmas.IDList.push({
          bizTypeCode: selectTableData[i].DJLXID,
          businessKey: selectTableData[i][options.businessField]
        })
      }
      return reductionUpdataStatus(parmas).then(res => {
        return res
      })
    },
    // 单笔，还原
    worlflowReductionSingle (options = {}) {
      let _this = this
      let businessKeyArray = []
      businessKeyArray.push(this.worflowDJBH)
      let parmas = {
        'appCode': window.location.href.split('/')[3],
        'userCode': tools.getLocal('userCode') || '',
        'gsdm': _this.$store.state.app.env.gsdm,
        'kjnd': _this.$store.state.app.env.kjnd,
        'IDList': [{
          bizTypeCode: _this.worflowDJLX,
          businessKey: businessKeyArray[0]
        }]
        // 'bizTypeCode': _this.worflowDJLX,
        // 'businessKey': businessKeyArray
      }
      return reductionUpdataStatus(parmas).then(res => {
        if (res.status === 200) {
          this.$fn.success({
            title: '正确',
            desc: '还原成功'
          })
          if (!options.notBillConfig) {
            _this.getButton()
          }
          return res
        } else {
          this.$fn.error({ title: '', desc: res.msg })
        }
      }
      )
    },
    // 工作流全流程跟踪图
    workflowGetWorkFlowFull () {
      this.Drawer = true
      this.workflowFull = true
      this.$refs.workflowFull.reload()
    },
    // 工作流转办，直接转给其他人，该单据进入自己的已办，转入他人的待办；跟自己没关系
    workflowTransfer () {
      let _this = this
      this.$workflow.transfer({
        // 单据id
        businessKey: _this.worflowDJBH,
        // 单位code
        unitCode: _this.$store.getters.env.gsdm,
        title: _this.transferTitle,
        isTextMessage: true,
        onComplete: (ret) => {
          if (ret.error) {
            _this.$fn.error({
              title: '错误',
              desc: ret.message
            })
          } else {
            _this.$fn.success({
              title: '正确',
              desc: ret.message
            })
          }
        }
      })
    },
    // 委托，代办，该单据同时处在他人和自己的待办状态；跟自己有关系，
    workflowDelegate () {
      let _this = this
      this.$workflow.delegate({
        // 单据id
        businessKey: _this.worflowDJBH,
        // 单位code
        unitCode: _this.$store.getters.env.gsdm,
        title: _this.delegateTitle,
        isTextMessage: true,
        onComplete: (ret) => {
          if (ret.error) {
            _this.$fn.error({
              title: '错误',
              desc: ret.message
            })
          } else {
            _this.$fn.success({
              title: '正确',
              desc: ret.message
            })
          }
        }
      })
    }
  },
  created () {
    this.$workflow.config({
      debug: false, // 不显示工作流的提示信息
      rgCode: '100001',
      appCode: window.location.href.split('/')[3],
      userCode: localStorage.getItem('userId').toString(),
      flowModelerBaseUrl: config.workflowUrl.flowModelerBaseUrl,
      flowProcessBaseUrl: config.workflowUrl.flowProcessBaseUrl
    })
  }
}
