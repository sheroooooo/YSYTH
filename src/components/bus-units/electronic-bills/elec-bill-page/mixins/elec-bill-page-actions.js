import BillInputModal from '../components/bill-input-modal'
import UploadModal from '../components/upload-modal'
import { updateFpzt, deleteBill, getOneBill, fpyz, checkOcrLicence, getPJTemplate, dealPhoneUploadData } from '@/api/pub/elec-bill-page'
export default {
  methods: {
    /**
     * @description 页面按钮事件处理
     * @param {String} noteEntry 票据录入
     */
    handelHeaderBtnCilck ({ name }) {
      this.selectTableData = this.$refs.xTable.getCheckedData()
      if (name !== 'noteEntry' && name !== 'billUpload' && this.selectTableData.length === 0) {
        this.$fn.warning({ desc: '请选择数据' })
        return
      } else if (name === 'update' && this.selectTableData.length > 1) {
        this.$fn.warning({ desc: '请选择一条数据进行修改' })
        return
      }
      let actionMap = {
        'noteEntry': () => { this.openModal('add', 'edit') }, // 手工录入
        'backuse': () => { this.updateFpzt() },
        'delete': () => { this.deleteBill() },
        'update': () => { // 票据修改
          this.updateFp(this.selectTableData[0], 'edit')
        },
        'billUpload': () => { // 票据上传
          this.billUpload()
        },
        'invoiceVerification': () => {
          this.verifyTruth() // 发票验真
        },
        'use': () => {
          this.usedFp(this.selectTableData)
        },
        'unUse': () => {
          this.cancelUsedFp(this.selectTableData)
        }
      }
      actionMap[name]()
    },

    openModal (operate, state, selectedData) {
      const _this = this
      let title = (operate === 'add' || operate === 'parse') ? '票据录入' : operate === 'update' ? '票据修改' : ''
      let billParams = {}
      if (operate === 'update') {
        billParams['PID'] = selectedData.PID
        billParams['FPID '] = selectedData.FPID
        billParams['operate'] = 'update'
      } else if (operate === 'add') {
        billParams['operate'] = 'add'
      } else if (operate === 'parse') {
        billParams['operate'] = 'parse'
      }
      if (operate === 'parse') {
        title = `票据录入,当前识别第${_this.curFileIndex + 1}-${_this.sameFileIndex + 1}张`
      }
      if (_this.sameFileIndex === _this.fpList.length - 1) {
        _this.sameFileInfo.isLast = true
      } else {
        _this.sameFileInfo.isLast = false
      }
      _this.$modal({
        title: title,
        resize: false,
        showFooter: false,
        width: 1000,
        height: 600,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(BillInputModal, {
                props: {
                  baseParams: _this.baseParams,
                  billValues: operate === 'update' ? _this.modalBillData : operate === 'parse' ? _this.parseValues.billData : {},
                  billParams: billParams,
                  state,
                  parseValues: operate === 'parse' ? _this.parseValues : {},
                  curFileIndex: _this.curFileIndex,
                  deleteFj: _this.sameFileInfo

                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (val) {
                    $modal.close()
                    _this.sameFileInfo.isSaved = true
                    _this.getTableData()
                  },
                  nextFp () {
                    _this.sameFileIndex++
                    if (_this.sameFileIndex <= _this.fpList.length - 1) {
                      _this.parseValues = _this.$utils.clone(_this.fpList[_this.sameFileIndex], true)
                      _this.openModal('parse', 'edit')
                    } else if (_this.parseValues.billData.hasOwnProperty('phoneUpload')) { // 手机上传，进行下一张图片识别
                      _this.curFileIndex++
                      if (_this.curFileIndex <= _this.phoneFileList.length - 1) {
                        _this.dealPhoneUploadData()
                      }
                    }
                  }
                }
              })
            ]
          }
        }
      })
    },
    // 修改发票
    updateFp (selectedData, state) {
      this.$fn.ajax(getOneBill, {
        FPID: selectedData.FPID
      }, res => {
        if (res.status === 200) {
          this.modalBillData = res.data
          this.openModal('update', state, selectedData)
        }
      })
    },

    /**
     * @description 使用和撤销使用按钮 更新状态
     * @param {String} ZT 状态 1使用 0撤销
     * @param {Array} FPLIST
     */
    updateFpzt () {
      let FPLIST = this.selectTableData.map(item => item.FPID)
      this.$fn.ajax(updateFpzt, {
        ZT: this.frmoper === '0' ? '1' : '0',
        FPLIST
      }, res => {
        if (res.status === 200) {
          this.$fn.success({ desc: res.msg })
          this.getTableData()
        }
      })
    },

    /**
     * @description 删除增值税发票
     * @param {Array} DELLIST
     */
    deleteBill () {
      const _this = this
      _this.$modal.confirm({
        title: '删除',
        message: '是否要删除？',
        events: {
          confirm () {
            let params = {
              GSDM: _this.baseParams.gsdm,
              KJND: _this.baseParams.kjnd
            }
            let FPIDLIST = _this.selectTableData.map(item => item.FPID)
            params['FPIDLIST'] = FPIDLIST
            _this.$fn.ajax(deleteBill, params, res => {
              if (res.status === 200) {
                _this.$fn.success({ desc: '删除成功' })
                _this.getTableData()
              }
            })
          },
          cancel () {
          }
        }
      })
    },
    billUpload () {
      // 状态复位
      this.sameFileInfo = {
        isLast: false,
        isSaved: false
      }
      // 索引复位
      this.sameFileIndex = -1
      this.curFileIndex = -1 //
      this.openUploadModal()
    },
    openUploadModal () {
      const _this = this
      _this.$modal({
        title: '票据上传',
        resize: false,
        showFooter: false,
        width: 800,
        height: 550,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(UploadModal, {
                props: {
                  baseParams: _this.baseParams
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (val, fpList) {
                    $modal.close()
                    _this.parseValues = _this.$utils.clone(val, true)
                    _this.fpList = fpList
                    _this.sameFileIndex = 0
                    _this.curFileIndex = 0
                    _this.openModal('parse', 'edit')
                  },
                  fileParse (val) {
                    _this.phoneFileList = val
                    if (_this.phoneFileList && _this.phoneFileList.length > 0) {
                      $modal.close()
                      _this.curFileIndex = 0
                      _this.dealPhoneUploadData()
                    }
                  }
                }
              })
            ]
          }
        }
      })
    },
    // 发票验真
    verifyTruth () {
      let FPIDLIST = this.selectTableData.map(item => item.FPID)
      let params = {
        FPIDLIST,
        KJND: this.baseParams.kjnd
      }
      this.$fn.ajax(fpyz, params, res => {
        if (res.status === 200) {
          this.$fn.success({ desc: res.msg })
          this.getTableData()
        }
      })
    },
    // 发票使用,不调用后台接口，前端做缓存处理
    usedFp (data) {
      this.$fn.success({ desc: '使用成功' })
      this.usedFpList = [...this.usedFpList, ...data]
      this.getTableData()
      if (this.baseParams.modCode === 'OER') {
        this.getPJTemplate(data) // 获取模板 给单据带值
      }
      let FPIDList = this.usedFpList.map(item => item.FPID)
      this.$emit('operate-success', FPIDList)
      if (this.baseParams.modCode === 'GL') { // 账务使用发票需要将发票信息带到凭证
        this.GLUsedFp = this.$utils.clone(data, true)
        let userData = this.$store.state.user
        this.envParams = { ...this.env, ...userData }
        let idList = this.GLUsedFp.map(item => {
          return {
            FPID: item.FPID
          }
        })
        this.voucherInfo['HBGZ'] = 'djdd'
        this.voucherInfo['PZLX'] = this.baseParams.DJLX
        this.voucherInfo['SCFS'] = 'cwhys'
        this.$nextTick(() => {
          this.$refs.VoucherModal.setVoucherProduct(idList)
        })
      }
    },
    checkBeforeUsed () {
      this.$fn.ajax(checkOcrLicence, {
        KJND: this.baseParams.kjnd
      }, res => {
        if (res.status === 200) {
          return true
        } else if (res.status === 300) {
          this.$fn.error({ desc: res.msg })
          return false
        } else {
          return false
        }
      })
    },
    cancelUsedFp (data) {
      this.$fn.success({ desc: '取消使用成功' })
      let fpList = data.map(item => item.FPID)
      this.usedFpList = this.usedFpList.filter((item) => {
        return fpList.indexOf(item.FPID) === -1
      })
      this.curCancelList = this.handleFpList(this.curCancelList, data)
      this.getTableData('cancelFp')
      let FPIDList = this.usedFpList.map(item => item.FPID)
      this.$emit('operate-success', FPIDList)
    },
    // 获取票据模板信息
    getPJTemplate (ievData) {
      this.$fn.ajax(getPJTemplate, {
        DJLXID: this.baseParams.DJLX,
        MOUDLE: this.baseParams.modCode,
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd
      }, res => {
        if (res.status === 200 && res.data) {
          this.$emit('getPJTemplateSuccess', res.data, ievData)
        }
      })
    },
    // 获取手机上传识别附件的信息
    dealPhoneUploadData () {
      this.$fn.ajax(dealPhoneUploadData, {
        GXGUID: this.phoneFileList[this.curFileIndex],
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        ZTH: this.baseParams.zth
      }, res => {
        if (res.status === 200) {
          this.fpList = res.data.fpInfoList
          if (this.fpList && this.fpList.length > 0) {
            this.fpList.forEach(item => {
              if (Object.keys(item).length > 0) {
                item.billData.MAIN['PID'] = item.PID
                item.billData.MAIN['FJID'] = item.FJID
                item.billData['phoneUpload'] = true
              }
            })
          }
          this.sameFileIndex = 0
          this.sameFileInfo.isSaved = false
          this.parseValues = this.$utils.clone(this.fpList[0], true)
          this.openModal('parse', 'edit')
        } else {
          this.curFileIndex++
          if (this.curFileIndex <= this.phoneFileList.length - 1) {
            this.dealPhoneUploadData()
          }
        }
      })
    },
    getGuid () {
      this.identifier = this.setGuid() + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + this.setGuid() + this.setGuid()
    },
    setGuid () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
  }
}
