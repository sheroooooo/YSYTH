import { saveBgjfData, removeFormDirectory } from '@/api/gsp/gsp_bill'
import { printFile, SJYPrint, cancelPrint } from '@/api/basePort'
import { checkgspformregister, cancelDJ, restoreDJ } from '@/api/workFlow'
import { saveAndCheckReimbursementForm } from '@/api/oer/oer_bill'
import PdfPrint from '_c/bus-units/pdf-print'
import checkWorkFlow from '_c/workflow-install/checkWorkFlow/checkWorkFlow'
import { getOldWorkFlowData, getOldWorkFlowCloumns } from '@/api/flow/flow-config'
import clonedeep from 'clonedeep'
export default {
  methods: {
    // 获取按钮数据
    getButton () {
      this.$parent.getButton()
      this.scroll() // 做样式的兼容。如果不加, 保存过后，主信息会被按钮遮住
    },
    handelBtnCilck (action) {
      // 增加 送审审核前校验
      if (action === 'save' || action === 'footSubmit' || action === 'check' || action === 'submit') {
        return this.validate(this[action], action)
      } else {
        // return this.$parent.handelBtnCilck ? this.$parent.handelBtnCilck(action, this[action], this.values) : this[action]()
        if (this.$parent.handelBtnCilck) {
          return this.$parent.handelBtnCilck(action, this[action], this.values)
        } else {
          let clickFun = this.getParent(this.$parent)
          return clickFun ? clickFun(action, this[action], this.values) : this[action]()
        }
      }
    },
    validate (_callback, action) {
      this.$refs.generateForm.validate(valid => {
        let result = this.validateAnnex() // 检查附件
        if (valid && result && _callback) {
          // return this.$parent.handelBtnCilck ? this.$parent.handelBtnCilck(action, _callback, this.values) : _callback()
          if (this.$parent.handelBtnCilck) {
            return this.$parent.handelBtnCilck(action, _callback, this.values)
          } else {
            let clickFun = this.getParent(this.$parent)
            return clickFun ? clickFun(action, _callback, this.values) : _callback()
          }
        }
      })
    },
    // 外层组件包含plg-doc-wrapper或者row col组件时，直接$parent找不到handelBtnCilck，需要递归寻找对应父组件
    // 与其他handelBtnCilck方法做区分，方法名使用handelBillDocModalBtnCilck
    getParent (parent) {
      if (parent === undefined) {
        return false
      } else if (parent.handelBillDocModalBtnCilck) {
        return parent.handelBillDocModalBtnCilck
      } else {
        return this.getParent(parent.$parent)
      }
    },
    validateAnnex () {
      let result = true
      if (!this.annexStruct.length) {
        return result
      }
      // 拿到必填附件类型
      let requireAnnex = this.annexStruct[0].FORMULA.filesType.filter(i => i.isRequire)
      // 拿到附件数量
      let fileList = this.$refs.xUploader.fileList
      for (let index = 0; index < requireAnnex.length; index++) {
        const element = requireAnnex[index]
        result = fileList.find(i => i.FILE_CLASS === element.FJLXGUID) && result
        if (!result) {
          this.$fn.error({
            title: '错误提示',
            desc: `${element.FJLXMC}附件未上传,请上传后再提交`
          })
          break
        }
      }
      return result
    },
    /* 新增 */
    add () {
      this.billDjguid = (new Date()).Format('yyyyMMddhhmmssS')
      this.getStruts({ refresh: false, mlid: 0, guid: '0' }).then(() => {
        this.values['billDjguid'] = this.billDjguid
        this.$parent.btnData = []
        this.$parent.frmoper = 2
        this.$parent.djguid = '0'
        this.$parent.billId = 0
        this.$refs.xUploader.show()
        this.$route.params.wokflowFlag = true
        this.getButton()
        this.Drawer = false
        this.getInitInfo()
        this.$emit('new-guid', this.billDjguid)
        setTimeout(() => this.scroll(), 40)
      })
    },
    /* 作废 */
    invalid () {
      if (this.tiemMap['invalid']) {
        return false
      }
      this.tiemMap['invalid'] = 'invalid'
      if (this.workflowType) {
        this.options.flag = 'invalid'
        this.options.tip = '作废成功'
        this.workflowAction({ 'flag': 'invalid' }).then(res => {
          // 作废成功后，emit事件到业务组件
          if (res.status === 200) {
            this.getStruts({ refresh: true })
            this.options['OPERATEFLAG'] = 'invalid'
            this.$emit('operate-success', this.options)
          }
          delete this.tiemMap['invalid']
        }).catch(() => {
          delete this.tiemMap['invalid']
        })
      } else {
        let list = [{
          'djlxid': this.$route.params.gnflDm,
          'mlid': this.mlid.toString(),
          'rowversion': this.rowVersion,
          'djbh': this.getMainPnlData(this.$refs.generateForm.getFormData())['DJBH']
        }]
        // batch 1为批量，0为单个，默认是1
        let data = {
          'gsdm': this.$route.params.gsdm || this.$store.state.app.env.gsdm, // 登记簿中如果有切换单位的功能，切换后跳转gsdm需要取路由当中的
          'kjnd': this.$store.state.app.env.kjnd,
          'list': list,
          'batch': '0',
          'url': this.$route.matched[0].name.toLowerCase()
        }
        cancelDJ(data).then(res => {
          if (res && res.status === 200) {
            // 禁止随意变更，改动需求联系刘天卓
            this.rowVersion = res.data
            this.$fn.success({ title: '作废成功', desc: res.msg })
            this.getButton()
          }
          delete this.tiemMap['invalid']
        })
      }
    },
    /* 还原 */
    revert () {
      if (this.tiemMap['revert']) {
        return false
      }
      this.tiemMap['revert'] = 'revert'
      if (this.workflowType) {
        this.options.flag = 'revert'
        this.options.tip = '还原成功'
        this.workflowAction({ 'flag': 'reduction' }).then(res => {
          // 还原成功后，emit事件到业务组件
          if (res.status === 200) {
            this.getStruts({ refresh: true })
            this.options['OPERATEFLAG'] = 'revert'
            this.$emit('operate-success', this.options)
          }
          delete this.tiemMap['revert']
        }).catch(() => {
          delete this.tiemMap['revert']
        })
      } else {
        let list = [{
          'djlxid': this.$route.params.gnflDm,
          'mlid': this.mlid.toString(),
          'rowversion': this.rowVersion,
          'djbh': this.getMainPnlData(this.$refs.generateForm.getFormData())['DJBH']
        }]
        // batch 1为批量，0为单个，默认是1
        let data = {
          'gsdm': this.$route.params.gsdm || this.$store.state.app.env.gsdm, // 登记簿中如果有切换单位的功能，切换后跳转gsdm需要取路由当中的
          'kjnd': this.$store.state.app.env.kjnd,
          'list': list,
          'batch': '0',
          'url': this.$route.matched[0].name.toLowerCase()
        }
        restoreDJ(data).then(res => {
          delete this.tiemMap['revert']
          if (res && res.status === 200) {
            // 禁止随意变更，改动需求联系刘天卓
            this.rowVersion = res.data
            this.$fn.success({ title: '还原成功', desc: res.msg })
            this.getButton()
          } else {
            this.$fn.error({ title: '还原失败', desc: res.msg })
          }
        })
      }
    },
    /* 修改按钮 */
    update () {
      // 点击修改 单据显示编辑模式 请求修改按钮
      this.$parent.btnData = []
      this.$parent.editable = true
      this.$parent.frmoper = 3
      this.getButton()
      setTimeout(() => this.scroll(), 40)
      // 合同存在暂存功能。所以修改不能直接加wokflowFlag，否则会导致保存不调用工作流
      if (this.$route.params['wokflowFlag'] === 'temporaryStorage') {
        delete this.$route.params['wokflowFlag']
      } else {
        this.$route.params['wokflowFlag'] = false
      }
      this.elecOperateFlag = ''
    },
    /* 复制按钮 */
    async copy (params = { needBillId: true }, value) {
      let copyValue = clonedeep(value) || clonedeep(this.values)
      this.billDjguid = (new Date()).Format('yyyyMMddhhmmssS')
      copyValue.oldDjid = '' // 附件清空
      this.$parent.mlid = 0 // 父组件存在mlid监听
      this.mlid = 0
      await this.getStruts({ refresh: true })
      let copyData = this.clearData(this.formStruts, copyValue, ['BNXID', 'bnxid'])
      copyData.billDjguid = this.billDjguid
      // 新增功能增加复制单据日期
      let mainValue = this.getMainPnlData(copyData)
      mainValue.DJBH = this.getMainPnlData(this.values).DJBH
      let mainStruct = this.formStruts.children.find(item => item.FIELDTYPE === -1)
      if (mainStruct !== -1) {
        let dateKey = ['bzrq', 'djdate']
        let DJDateItem = mainStruct.children.find(item => dateKey.includes(item.key.toLowerCase()))
        if (DJDateItem) {
          mainValue[DJDateItem.key] = this.$store.state.app.env.loginDate.replace(/-/g, '')
        }
      }
      this.values = copyData
      this.setValues(this.values)
      this.isCopy = true
      this.$parent.btnData = []
      this.$parent.frmoper = 2
      this.$parent.editable = true
      this.$route.params.wokflowFlag = true
      if (params.needBillId) this.getInitInfo()
      this.getButton()
      this.$refs.xUploader.show()
      this.$emit('new-guid', this.billDjguid)
      setTimeout(() => this.scroll(), 40)
    },
    /* 删除按钮 */
    async delete () {
      let result = await this.utilDeleteModal()
      if (!result) {
        return false
      }
      let delData = {
        gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm,
        kjnd: this.$store.state.app.env.kjnd,
        ywlx: this.$route.params.ywlx || '',
        djlxid: this.djlxid
      }
      delData.MLID = this.mlid
      delData.rowVersion = this.rowVersion
      let params = {
        params: delData,
        url: this.webPath
      }
      if (this.webPath === 'pao') {
        params.params.DJBH = this.getMainPnlData(this.$refs.generateForm.getFormData())['DJBH']
      }
      let resData = await this.deleteBillWorkFlow(this.worflowDJBH)
      if (resData) return false
      removeFormDirectory(params).then(res => {
        if (res && res.status === 200) {
          this.$fn.success({ title: '删除成功', desc: res.msg })
          let deleteInfo = { flag: 'del', mlid: this.mlid.toString() }
          this.$emit('operate-success', deleteInfo)
          // 清除单据的回显信息,并且变为新单。所以相当于新增一张单据
          this.add()
        }
      })
    },
    /* 查看审核日志 */
    auditlog () {
      if (this.workflowType) { // 查看平台工作流日志
        this.workflowAction({ 'flag': 'log' })
      }
    },
    /* 取消按钮 (因为缓存功能不稳定) */
    cancel () {
      if (this.mlid === 0) {
        this.$Modal.confirm({
          title: '提示',
          content: '<p>您所填写的信息都将会清空</p><p>您确定您的操作吗?</p>',
          onOk: () => {
            this.isCancel = true
            if (this.baseParams && this.baseParams.modCode === 'OER') {
              this.isClickCancel = true
            } else {
              this.closeTag(this.$route)
              this.formStruts = ''
              this.values = {}
              this.$refs.generateForm.setFormStruts(this.formStruts)
            }
          },
          onCancel: () => { }
        })
      } else {
        if (this.webPath === 'faqc') {
          return this.getBillData()
        }
        // 返回浏览模式
        this.$parent.btnData = []
        this.$parent.frmoper = 1
        this.$parent.editable = false
        this.getBillData()
        // 获取未修改前单据的数据
        this.getButton()
        this.isCancel = true
        setTimeout(() => this.scroll(), 40)
      }
    },
    // 合同 暂存功能
    temporaryStorage (data) {
      if (this.tiemMap['temporaryStorage']) {
        return false
      }
      this.tiemMap['temporaryStorage'] = 'temporaryStorage'
      this.$route.params['wokflowFlag'] = 'temporaryStorage'
      return this.save(data).then(res => {
        delete this.tiemMap['temporaryStorage']
      }).catch(() => {
        delete this.tiemMap['temporaryStorage']
      })
    },
    /* 保存 */
    save (val, flag) {
      if (this.tiemMap['save']) {
        return false
      }
      this.tiemMap['save'] = 'save'
      let data = clonedeep(val) || clonedeep(this.values)
      data.actionFlag = data.mlid === 0 ? 'S' : 'M'
      // 以外层传入的为主
      if (val && val.actionFlag) {
        data.actionFlag = val.actionFlag
      }
      data = this.splitKeyByFlag(data)
      let params = { params: data, url: this.webPath }
      if (this.webPath === 'inv') {
        params.params.djlxid = this.djlxid
      }
      return saveBgjfData(params).then(res => {
        if (res && res.status === 200) {
          this.$fn.success({ title: '保存单据', desc: '单据保存成功' })
          if (this.webPath === 'faqc') {
            delete this.tiemMap['save']
            return res
          }
          // 保存返回ID
          this.mlid = res.data.MLID
          this.worflowDJBH = res.data.DJGUID
          /* 采购回显单据编号 暂时这样写 ，之后加到回调函数中 */
          if (res.data.jhbm) {
            this.mlid = res.data.jhbm
            let bwxData = this.getMainPnlData(this.values)
            if (res.data.mxbmList) {
              let bnxData = this.getDetailPnlData(this.values)
              for (let i = 0, len = bnxData.length; i < len; i++) {
                bnxData[i].MXJHBM = res.data.mxbmList[i]
              }
            }
            bwxData.JHBM = this.mlid
            this.worflowDJBH = res.data.jhguid
          } else if (res.data.cgsqbm) {
            this.mlid = res.data.cgsqbm
            this.getMainPnlData(this.values).CGSQBM = this.mlid
            this.worflowDJBH = res.data.cgsqguid
            if (res.data.mxbmList) {
              let bnxData = this.getDetailPnlData(this.values, 'CARDTYPE', '17')
              for (let i = 0, len = bnxData.length; i < len; i++) {
                bnxData[i].MXJHBM = res.data.mxbmList[i]
              }
            }
          } else if (res.data.ztbbm) {
            this.mlid = res.data.ztbbm
            this.getMainPnlData(this.values).ZTBBM = this.mlid
            this.worflowDJBH = res.data.ztbguid
          } else if (res.data.ztbbdbm) {
            this.mlid = res.data.ztbbdbm
            this.getMainPnlData(this.values).ZTBBDBM = this.mlid
            this.worflowDJBH = res.data.ztbbdguid
          } else if (res.data.yssqdbm) {
            this.mlid = res.data.yssqdbm
            this.getMainPnlData(this.values).YSSQDBM = this.mlid
            this.worflowDJBH = res.data.yssqdguid
          } else if (res.data.ysjgdbm) {
            this.mlid = res.data.ysjgdbm
            this.getMainPnlData(this.values).YSJGDBM = this.mlid
            this.worflowDJBH = res.data.ysjgdguid
          } else if (res.data.djguid) { // 合同保存
            this.worflowDJBH = res.data.djguid
            this.mlid = res.data.code
          } else if (res.data.DJGUID && this.$store.getters.env.GSP && this.$store.getters.env.GSP.QYXGZL === '1') {
            this.worflowDJBH = res.data.DJGUID
            this.mlid = res.data.MLID
          } else if (res.data.DJGUID && this.$store.getters.env.OER && this.$store.getters.env.OER.QYXGZL === '1') {
            this.worflowDJBH = res.data.DJGUID
            this.mlid = res.data.MLID
          }
          // 其他薪资回显处理
          if (params.url === 'pao') {
            this.getUploadParams.djid = res.data.detailsData[0].DJBH
          }
          let mianData = this.getMainPnlData(this.values)
          // 如果不存在DJBH,修改会删掉DJBH
          this.billNumber = mianData['DJBH'] = res.data.DJBH || mianData['DJBH'] || ''
          this.$parent.billIdentify = this.billNumber || this.mlid
          this.$parent.billId = this.$parent.mlid = this.mlid
          this.$parent.djguid = this.worflowDJBH
          this.$route.params.djguid = this.worflowDJBH
          this.rowVersion = res.data.ROWVERSION || ''
          this.$parent.editable = false
          this.$parent.frmoper = 1
          delete this.tiemMap['save']
          this.elecOperateFlag = 'save' // 成功保存后置为'save',电子票据用
          //  平台工作流：保存-先保存后送审 U8工作流：只保存
          // !this.$route.params.hasOwnProperty('wokflowFlag') 这句话是用来判断 初始保存还是修改保存
          if (this.workflowType && !this.$route.params.hasOwnProperty('wokflowFlag')) {
            this.workflowAction({ 'flag': 'start' }).then((res) => {
              this.$route.params['wokflowFlag'] = false
              if (res && flag === 'footSubmit') {
                this.handelBtnCilck('submit')
              }
            })
          } else if (this.workflowType && this.$route.params.wokflowFlag === true) {
            this.workflowAction({ 'flag': 'start' }).then((res) => {
              this.$route.params['wokflowFlag'] = false
              if (res && flag === 'footSubmit') {
                this.handelBtnCilck('submit')
              }
            })
          } else if (this.$route.matched[0].name.toLowerCase() === 'gsp' && flag === 'footSubmit') {
            this.handelBtnCilck('submit')
          } else {
            this.getButton()
          }
          return res.data
        }
        delete this.tiemMap['save']
        if (this.webPath === 'faqc') {
          return res
        } else {
          return false
        }
      }).catch(() => {
        delete this.tiemMap['save']
      })
    },
    /* 送审or退回单据 */
    footSubmit () {
      // 如果存在送审前附件必填
      if (this.tiemMap['footSubmit']) {
        return false
      }
      this.tiemMap['footSubmit'] = 'footSubmit'
      let pass = this.validateAnnexBeforeCheck()
      if (!pass) return false
      if (this.workflowType || this.$route.params.modCode === 'GSP') {
        return this.save(this.values, 'footSubmit')
      }
      let data = clonedeep(this.values)
      data.actionFlag = this.mlid === 0 ? 'S' : 'M'
      data.djlxid = data.djlxid.toString()
      data.mlid = data.mlid.toString()
      data = this.splitKeyByFlag(data)
      data.fpidList = this.fpidList // 使用的发票，网报模块用
      let params = { params: data, url: this.webPath }
      saveAndCheckReimbursementForm(params).then(res => {
        delete this.tiemMap['footSubmit']
        if (res && res.status === 200) {
          this.elecOperateFlag = 'save' // 成功保存后置为'save',电子票据用
          this.$fn.success({ title: '保存并送审单据', desc: '单据保存并送审成功' })
          this.mlid = res.data.mlid
          this.getStruts({ refresh: true })
        } else {
          this.$fn.error({ title: '保存并送审单据', desc: res.msg })
          return false
        }
        this.$parent.mlid = this.mlid
        this.rowVersion = res.data.rowversion
        this.$parent.editable = false
        this.$parent.frmoper = 1
        this.getButton()
      }).catch(() => {
        delete this.tiemMap['footSubmit']
      })
    },
    // 收回
    takeback () {
      if (this.tiemMap['takeback']) {
        return false
      }
      this.tiemMap['takeback'] = 'takeback'
      if (this.workflowType) {
        this.options.flag = 'cancel'
        this.options.tip = '收回成功'
        this.workflowAction(this.options).then(res => {
          // 收回成功后，emit事件到业务组件
          if (res.status === 200) {
            this.getStruts({ refresh: true })
            this.options['OPERATEFLAG'] = 'takeback'
            this.$emit('operate-success', this.options)
          }
          delete this.tiemMap['takeback']
        }).catch(() => {
          delete this.tiemMap['takeback']
        })
      } else {
        this.updateBillCheckState('XS').then(res => {
          delete this.tiemMap['takeback']
        })
      }
    },
    // 送审
    submit () {
      // 如果存在送审前附件必填
      let pass = this.validateAnnexBeforeCheck()
      if (!pass) return false
      if (this.tiemMap['submit']) {
        return false
      }
      this.tiemMap['submit'] = 'submit'
      if (this.workflowType) {
        this.options.flag = 'rev'
        this.options.tip = '送审成功'
        return this.workflowAction(this.options).then(res => {
          // 送审成功后，emit事件到业务组件
          if (res.status === 200) {
            this.getStruts({ refresh: true })
            this.options['OPERATEFLAG'] = 'submit'
            this.$emit('operate-success', this.options, res)
          }
          delete this.tiemMap['submit']
          delete this.tiemMap['footSubmit']
        }).catch(() => {
          delete this.tiemMap['submit']
          delete this.tiemMap['footSubmit']
        })
      } else {
        return this.updateBillCheckState('SH', '', 'SS').then(() => {
          delete this.tiemMap['submit']
          delete this.tiemMap['footSubmit']
        })
      }
    },
    validateAnnexBeforeCheck () {
      if (this.formStruts.sfbtannex === '1') {
        if (this.showUploadFile) { // 新附件
          let len = this.$refs.xUploader.fileList.length
          if (len === 0) {
            this.$fn.error({ title: '错误提示', desc: '该单据启用了送审前附件必填,请先上传附件' })
            return false
          }
        } else { // 原附件
          let annexItem = Object.values(this.values).find(item => item.CARDTYPE === '999')
          if (!annexItem) {
            this.$fn.error({ title: '错误提示', desc: '该单据启用了送审前附件必填,请先挂载附件' })
            return false
          }
          if (!annexItem.data.find(item => item.atguid)) {
            this.$fn.error({ title: '错误提示', desc: '该单据启用了送审前附件必填,请先上传附件' })
            return false
          }
        }
      }
      return true
    },
    // 销审
    uncheck (params = {}) {
      if (this.tiemMap['uncheck']) {
        return false
      }
      this.tiemMap['uncheck'] = 'uncheck'
      if (this.workflowType) {
        this.options.flag = 'cancel'
        this.options.tip = '销审成功'
        return this.workflowAction(this.options).then(res => {
          // 销审成功后，emit事件到业务组件
          if (res.status === 200) {
            this.getStruts({ refresh: true })
            this.options['DJBH'] = this.getMainPnlData(this.$refs.generateForm.getFormData())['DJBH']
            this.options['OPERATEFLAG'] = 'uncheck'
            this.$emit('operate-success', this.options)
          }
          delete this.tiemMap['uncheck']
        }).catch(() => {
          delete this.tiemMap['uncheck']
        })
      } else {
        let { gender: operate, operateFlag, remark } = params
        return this.updateBillCheckState(operate || 'XS', remark, operateFlag).then(res => {
          delete this.tiemMap['uncheck']
        })
      }
    },
    /* 审核 */
    check (val = {}) {
      if (this.tiemMap['check']) {
        return false
      }
      this.tiemMap['check'] = 'check'
      if (this.workflowType) {
        this.options.flag = 'rev'
        this.options.tip = '审核成功'
        return this.workflowAction(this.options).then(res => {
          // 审核成功后，emit事件到业务组件
          if (res.status === 200) {
            this.getStruts({ refresh: true })
            this.options['OPERATEFLAG'] = 'check'
            this.$emit('getCheckInfo', this.options, res)
            this.$emit('operate-success', this.options, res)
          }
          delete this.tiemMap['check']
        }).catch(() => {
          delete this.tiemMap['check']
        })
      } else {
        let operate = val.gender || 'SH'
        let remark = val.remark || ''
        let operateFlag = val.operateFlag
        return this.updateBillCheckState(operate, remark, operateFlag).then(res => {
          delete this.tiemMap['check']
        })
      }
    },
    /* 驳回 */
    reject () {
      if (this.tiemMap['reject']) {
        return false
      }
      this.tiemMap['reject'] = 'reject'
      this.options.flag = 'back'
      this.options.tip = '驳回成功'
      if (this.workflowType) {
        return this.workflowAction(this.options).then(res => {
          // 驳回成功后，emit事件到业务组件
          this.getStruts({ refresh: true })
          this.options['OPERATEFLAG'] = 'reject'
          this.$emit('operate-success', this.options, res)
          delete this.tiemMap['reject']
        }).catch(() => {
          delete this.tiemMap['reject']
        })
      } else {
        return this.updateBillCheckState('TH').then(res => {
          delete this.tiemMap['reject']
        })
      }
    },
    updateBillCheckState (operate, remark, operateFlag) {
      let data = {
        'gsdm': this.$route.params.gsdm || this.$store.state.app.env.gsdm,
        'kjnd': this.$store.state.app.env.kjnd,
        // djlxid为字符串 不允许改。强制统一
        'djlxid': this.$route.params.gnflDm.toString(),
        // mlid为字符串 不允许改。强制统一
        'mlid': this.mlid.toString(),
        'username': this.$store.state.user.userName,
        'operate': operate,
        'remark': remark || '',
        'rowversion': this.rowVersion,
        'url': this.webPath,
        operateFlag
      }
      return checkgspformregister(data).then(res => {
        if (res && res.status === 200) {
          this.$fn.success({ title: '正确提示', desc: res.msg })
          this.rowVersion = res.data.rowversion
          this.getButton()
          let operateInfo = {
            flag: operate,
            djbh: this.getMainPnlData(this.$refs.generateForm.getFormData())['DJBH']
          }
          this.$emit('operate-success', operateInfo)
        } else if (res === '') {
          return false
        }
      })
    },
    // 取消打印
    cancelPrint () {
      this.$fn.ajax(cancelPrint, {
        gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm,
        kjnd: this.$store.state.app.env.kjnd,
        mlid: this.mlid,
        url: this.webPath
      }, res => {
        if (res && res.status === 200) {
          this.getButton()
        }
      }, 0)
    },
    // @description 新打印
    print () {
      const props = {
        baseParams: {
          GSDM: this.$route.params.gsdm || this.$store.state.app.env.gsdm,
          KJND: this.$store.state.app.env.kjnd,
          ZTH: this.$store.state.app.env.zth
        },
        isPZ: false,
        MODCODE: this.webPath.toUpperCase(), // 模块编码
        FUNCCODE: this.djlxid,
        getPDF: this.handlePrintFile
      }
      /* if (this.webPath.toUpperCase() === 'GPMC') {
        if (['4', '5', '6', '7', '8'].includes(this.$route.params.gnflDm.toString())) {
          switch (this.$route.params.gnflDm.toString()) {
            case '4':
              props.FUNCCODE = 'GPMCZBSQ'
              break
            case '5':
              props.FUNCCODE = 'GPMCZBDJ'
              break
            case '6':
              props.FUNCCODE = 'GPMCCGJG'
              break
            case '7':
              props.FUNCCODE = 'GPMCYSSQ'
              break
            case '8':
              props.FUNCCODE = 'GPMCYSJG'
              break
          }
        } else {
          if (this.$parent.formStruts.ywlx === '0') {
            props.FUNCCODE = 'GPMCCGJH'
          } else if (this.$parent.formStruts.ywlx === '1') {
            props.FUNCCODE = 'GPMCCGSQ'
          }
        }
      } */
      this.$modal({
        title: '打印',
        resize: false,
        showFooter: false,
        fullscreen: true,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(PdfPrint, {
                props,
                on: {
                  close () {
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    async handlePrintFile (val) {
      let mlidList = []
      let printPort = val.ISSCRIPTS === '1' ? SJYPrint : printFile
      let params = {}
      mlidList.push(this.mlid.toString())
      if (val.ISSCRIPTS === '1') {
        params = {
          'GSDM': this.$route.params.gsdm || this.$store.state.app.env.gsdm,
          'KJND': this.$store.state.app.env.kjnd,
          'ZTH': this.$store.state.app.env.zth,
          'TEMPLATEID': val.TEMPLATEID,
          'MLID': mlidList,
          'MODCODE': this.webPath.toUpperCase() // 模块编码
        }
      } else {
        params = {
          'gsdm': this.$route.params.gsdm || this.$store.state.app.env.gsdm,
          'kjnd': this.$store.state.app.env.kjnd,
          'zth': this.$store.state.app.env.zth,
          'templateId': val.TEMPLATEID || '*',
          'djlxid': this.djlxid,
          'djbh': this.mlid,
          'crerdate': this.$store.state.app.env.loginDate.replace(/-/g, ''),
          'url': this.webPath,
          'mlidList': mlidList,
          'variables': this.workflowcreateVariables(this.values, {}) // 审核日志条件
        }
        if (this.webPath.toLowerCase() !== 'inv') delete params.djbh
      }
      let res = await printPort(params)
      this.getButton()
      return res
    },
    // 旧工作流 审核流程
    async auditprocess () {
      let { data: tableColumns } = await getOldWorkFlowCloumns()
      tableColumns.map(item => {
        item.headerAlign = 'center'
        if (item.field === 'FX' || item.field === 'XH') {
          item.align = 'center'
        } else {
          item.align = 'left'
        }
      })
      let { data: tableData } = await getOldWorkFlowData({
        djlxid: this.values.djlxid.toString(),
        gsdm: this.values.gsdm,
        kjnd: this.values.kjnd,
        mlid: this.mlid.toString(),
        modcode: this.$route.matched[0].name.toUpperCase()
      })
      this.$modal({
        title: '审核流程',
        resize: false,
        showFooter: false,
        width: 1000,
        height: 618,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(checkWorkFlow, {
                props: {
                  tableColumns,
                  tableData,
                  rowKey: 'name',
                  height: 500,
                  buttonGroup: ['confirm']
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete () {
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    clearData (initStruct, initValue, keepKeyGroup) {
      let struct = {}
      let backData = JSON.parse(JSON.stringify(initValue))
      initStruct.children.map(item => {
        let allKey = []
        item.children.map(item => {
          allKey = [...allKey, item.YSFIELD]
        })
        struct = {
          ...struct,
          [item.YSMC]: allKey
        }
      })
      Object.entries(struct).map(itemGroup => {
        let title = itemGroup[0]
        let keyValueGroup = itemGroup[1] // 该结构下应该包含的所有字段名字
        if (!backData[title]) return false
        let item = backData[title]
        let dealData = item.data || []
        let realKeyGroup = !Array.isArray(dealData) ? Object.keys(dealData) : dealData.length ? Object.keys(dealData[0]) : []
        // 不是数组 而且 不是主信息
        let cardTypeGroup = ['3', '2', '14', '1', '24', '25', '28', '29']
        if ((!Array.isArray(dealData) && item.FIELDTYPE !== -1) || this.$route.params.modCode === 'PAO') {
          // 如果是二级构成和三级明细  不进行处理 二级构成内包含一个不在页面展示，但是要和三级明细进行管理的字段
          return true
          // 经费申请和预算指标和结算方式不进行数据删除
        } else if (cardTypeGroup.includes(item.CARDTYPE)) {
          return true
        }
        realKeyGroup.map(key => deleteKey(key, keyValueGroup, dealData))
      })

      function deleteKey (key, keyValueGroup, data) {
        if (Array.isArray(data)) {
          data.map(i => keyValueGroup.indexOf(key) === -1 && keepKeyGroup.indexOf(key) === -1 && delete i[key])
        } else {
          if (keyValueGroup.indexOf(key) === -1) delete data[key]
        }
        return data
      }
      return backData
    },
    utilDeleteModal (title = '删除', message = '是否要删除？') {
      return new Promise((resolve) => {
        this.$modal.confirm({
          title,
          message,
          events: {
            confirm () {
              resolve(true)
            },
            close () {
              resolve(false)
            }
          }
        })
      })
    }
  }
}
