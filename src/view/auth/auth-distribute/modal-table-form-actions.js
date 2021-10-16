import QrCodeModal from './qr-code-modal'
import {
  saveCsmpOrderallocation,
  updateCsmpOrderallocation,
  deleteCsmpOrderallocations,
  activateCsmpOrderallocation
} from '@/api/auth/auth-distribute'
export default {
  methods: {
    // 新增一条变动明细
    tableInnerListAdd (v, i) {
      this.values.splice(i, 0, v)
      if (v.statusCode * 1 === 1) {
        this.formReadonly = true
      } else {
        this.formReadonly = false
      }
    },
    // 删除一条变动明细
    tableInnerListDelete (i) {
      deleteCsmpOrderallocations({ allocationId: this.values[i].allocationId }).then(res => {
        if (res && res.status === 200) {
          this.values.splice(i, 1)
        }
      })
    },
    // 行编辑按钮触发
    handleEditorRow (values, index) {
      if (values.statusCode * 1 === 1) {
        this.formReadonly = true
      } else {
        this.formReadonly = false
      }
    },
    // 表单确认按钮
    handleFormOk (i, flag) {
      if (!flag && !this.values[i].allocationId) {
        //点击取消时,删除前端数据
        this.values.splice(i, 1)
        return
      }
      if (this.values[i].statusCode * 1 === 1) return
      this.saveData(i, true)
    },
    saveData (i, showInfo, doGet) {
      let { orderId, ordernumber, servicename, serviceid, serialNumber } = this.modalData
      // 总数减去其他行已经保存过的数据，等于剩余数
      let reMainNum = ordernumber
      this.values.map((v, idx) => {
        if (v.allocationId && i !== idx) {
          reMainNum -= v.ordernumber
        }
      })
      // 当前行输入数不得大于剩余数
      if (this.values[i].orderNumber > reMainNum) {
        this.$fn.warning({ desc: '授权套数超过带分发套数，请重新编辑' })
        return
      }
      let params = {
        orderId,
        serviceid,
        servicename,
        serialNumber,
        customerName: this.values[i].customerName,
        customerIndeid: this.values[i].customerIndeid,
        customerCode: this.values[i].customerCode,
        customerWbdm: this.values[i].customerWbdm,
        ordernumber: this.values[i].orderNumber,
        authoritytype: this.values[i].authoritytype,
        remark: this.values[i].remark
      }
      if (this.values[i].allocationId) {
        params.allocationId = this.values[i].allocationId
        return updateCsmpOrderallocation(params).then(res => {
          if (res && res.status === 200) {
            if (showInfo) {
              this.$fn.success({ desc: '保存成功' })
            }
            if (!doGet) {
              this.getTableData()
            }
          } else {
            this.$refs.disDetails.handleEditorRow(i, this.values[i])
          }
          return res
        })
      } else {
        return saveCsmpOrderallocation(params).then(res => {
          if (res && res.status === 200) {
            if (showInfo) {
              this.$fn.success({ desc: '保存成功' })
            }
            if (!doGet) {
              this.getTableData()
            }
          } else {
            this.$refs.disDetails.handleEditorRow(i, this.values[i])
          }
          return res
        })
      }
    },
    showQrModal (data) {
      this.$modal({
        title: '发票查验小程序授权码',
        resize: false,
        showFooter: false,
        width: 500,
        zIndex: 99999,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(QrCodeModal, {
                props: {
                  data
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
    // 生成二维码
    handleCreateQrCode ({ row, rowIndex }) {
      if (row.statusCode * 1 === 1) {
        activateCsmpOrderallocation({ allocationId: row.allocationId }).then(res => {
          if (res && res.status === 200) {
            this.showQrModal(res.data)
            this.getTableData()
          }
        })
      } else {
        this.saveData(rowIndex, false, true).then(id => {
          let allocationId = row.allocationId || id.data
          activateCsmpOrderallocation({ allocationId }).then(res => {
            if (res && res.status === 200) {
              this.showQrModal(res.data)
              this.getTableData()
            }
          })
        })
      }
    },
    // 表单数据变化回调
    formChange (values, index, key, list) {
      if (this.values[index]) {
        if (key === 'customerName' && typeof values.customerName === 'object') {
          let obj = values.customerName
          this.$set(this.values[index], 'customerName', obj.customerName)
          this.$set(this.values[index], 'customerCode', obj.customerCode)
          this.$set(this.values[index], 'customerIndeid', obj.customerIndeid)
          this.$set(this.values[index], 'customerWbdm', obj.wbdm)
        } else {
          this.$set(this.values[index], key, values[key])
        }
      }
    }
  }
}