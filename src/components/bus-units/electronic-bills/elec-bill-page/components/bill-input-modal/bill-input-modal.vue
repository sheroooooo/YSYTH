/**
 * @description: 增值税发票弹框
 * @author: yangtao
 * @date: 2020-04-01
 * @last modified by: yangtao
 * @last modified time: 2020-04-01
 */
<template>
  <div class="bill-input">
    <div class="bill-input-content">
      <vuc-tab-card :type="type">
        <div label="基本信息"
             class="bill-input-form">
          <Form ref="basicFormInfo"
                v-if="itemList.length>0&&Object.keys(initValueList).length>0"
                :label-width="120"
                :model="initValueList"
                :rules="rules">
            <Row>
              <Col v-for="(item, index) in itemList"
                   :span="item.span ? item.span : '8'"
                   :key="`${_uid}_${index}`"
                   style="height:50px">
              <FormItem :prop="item.FIELD"
                        :label="item.TITLE">
                <Select v-if="item.SJLX==='select'"
                        v-model="initValueList[item.FIELD]"
                        :disabled="!editable||billParams.operate==='update'||billParams.operate==='parse'"
                        @on-change="selectChange">
                  <Option v-for="item in pjlxList"
                          :value="item.PID"
                          :key="item.PID">{{ item.PNAME }}</Option>
                </Select>
                <Input v-else-if="item.SJLX==='text'"
                       v-model="initValueList[item.FIELD]"
                       :maxlength="item.FIELD==='JYM'?6:50"
                       :disabled="!editable" />
                <InputNumber v-else-if="item.SJLX==='number'"
                             v-model="initValueList[item.FIELD]"
                             class="input-number-style"
                             :precision="2"
                             :disabled="!editable"></InputNumber>
                <InputNumber v-else-if="item.SJLX==='money'"
                             v-model="initValueList[item.FIELD]"
                             :formatter="value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                             :parser="value => value.replace(/\￥\s?|(,*)/g, '')"
                             :disabled="!editable"></InputNumber>
                <DatePicker v-else-if="item.SJLX==='date'"
                            v-model="initValueList[item.FIELD]"
                            type="date"
                            :disabled="!editable"></DatePicker>
                <TimePicker v-else-if="item.SJLX==='time'"
                            format="HH:mm"
                            v-model="initValueList[item.FIELD]"
                            placement="bottom-end"></TimePicker>
                <Checkbox v-else-if="item.SJLX==='check'"
                          v-model="checkValue"
                          :disabled="!editable"
                          @on-change="checkedChange"></Checkbox>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
        <div label="票据明细"
             slot="pjmx"
             v-if="isHaveMx"
             class="bill-input-table">
          <vuc-datatable ref="xTable"
                         row-key="HWMC"
                         height="130"
                         :editable="editable">
          </vuc-datatable>
          <div v-if="editable && columns.length"
               class="btn-add tc"
               @click="handleAddClick('', '', '', 'insert')">
            <Icon type="md-add"
                  size="18" />
          </div>
        </div>
        <div label="附件"
             slot="fj">
          <div v-if="fileTableData.length>0">
            <vuc-datatable ref="xFileTable"
                           row-key=""
                           height="130"
                           :editable="editable">
            </vuc-datatable>
          </div>
          <div class="upload-file"
               v-if="state!=='readOnly'">
            <Upload ref="upload"
                    :action="uploadUrl"
                    :data="getParams()"
                    style="display: inline-block"
                    :show-upload-list="false"
                    :before-upload="beforeUpload">
              <Button type="text">
                <Icon type="ios-cloud-upload-outline"
                      style="color:#409eff"
                      size="22" />
                <span style="color:#409eff"> {{fileTableData.length>0?'重新上传':'上传'}}</span>
              </Button>
            </Upload>
          </div>

        </div>
      </vuc-tab-card>
    </div>
    <div class="bill-input-footer-btn"
         v-if="state!=='readOnly'">
      <Button @click="handleFooterBtnClick('cancel')"
              class="item-btn">取消</Button>
      <Button type="primary"
              @click="handleFooterBtnClick('save')"
              class="item-btn">保存</Button>
    </div>
  </div>
</template>
<script>
import * as XEUtils from 'xe-utils'
import tools from '@/libs/toolutil'
import { getPjlxSet, getPjlxList, saveBill, deleteUploadBill, addUploadFp, editAnnex, getAnnex, cancelUpload } from '@/api/pub/elec-bill-page'
export default {
  name: 'BillInputModal',
  props: {
    // 公共入参
    baseParams: {
      type: Object,
      default: () => { }
    },
    billValues: {
      type: Object,
      default: () => { }
    },
    billParams: {
      type: Object,
      default: () => { }
    },
    state: {
      type: String,
      default: ''
    },
    parseValues: {
      type: Object,
      default: () => { }
    },
    deleteFj: {
      type: Object,
      default: () => {
        return {
          isLast: true,
          isSaved: false
        }
      }
    }
  },
  data () {
    const valiMoney = (rule, value, callback) => {
      if (value === '' || value === null) {
        if (rule.field === 'JSHJ') {
          this.initValueList.DXJE = ''
        }
        callback(new Error(rule.message))
      } else {
        let val = Number(value).toFixed(2)
        let key = rule.field
        this.initValueList[key] = val.toString()
        if (key === 'JSHJ') {
          this.initValueList.DXJE = tools.formatMoneyCN(this.initValueList[key])
        }
        callback()
      }
    }
    return {
      type: 'card',
      itemList: [],
      initValueList: {},
      billStruts: {
      },
      labelWidth: 150,
      cols: 2,
      columns: [],
      tableData: [],
      pjlxList: [],
      pjlxId: '', // 当前的票据类型ID
      editable: true,
      selectedLxObj: {},
      isHaveMx: false,
      isUploadSave: false,
      identifier: '',
      fileColumns: [
        {
          title: '序号',
          type: 'index',
          minWidth: 50,
          align: 'center'
        },
        {
          title: '文件名',
          field: 'FJMC',
          headerAlign: 'center',
          align: 'left'
        },
        {
          title: '文件大小',
          field: 'FJDX',
          headerAlign: 'center',
          align: 'left'
        }
      ],
      fileTableData: [],
      uploadUrl: '',
      isUpload: false, // 手工录入界面是否新上传附件
      rules: {
        JSHJ: [
          { validator: valiMoney, trigger: 'blur', required: 'true', message: '价税合计不能为空' }
        ],
        HJJE: [
          { validator: valiMoney, trigger: 'blur', required: 'true', message: '合计金额不能为空' }
        ],
        SEHJ: [
          { validator: valiMoney, trigger: 'blur', required: 'true', message: '税额合计不能为空' }
        ]
      },
      checkValue: false
    }
  },
  watch: {

  },
  methods: {
    // 表格行内按钮操作 插入和删除行
    handleRowToolbarClick (name, row) {
      if (name === 'insert') {
        let addLine = this.initTableData(this.columns)
        this.tableData.push(addLine)
      } else if (name === 'delete') {
        this.tableData.forEach((item, index) => {
          if (item._XID === row._XID) {
            this.tableData.splice(index, 1)
          }
        })
      }
    },
    // 底部按钮
    handleFooterBtnClick (name) {
      if (name === 'save') {
        this.save()
      } else if (name === 'cancel') {
        this.$emit('close')
      }
    },

    /**
     * @description 保存增值税发票
     * @param {String} ACTIONFLAG S保存
     * @param {Object} MAIN 基本信息
     * @param {Array} DETAIL 明细信息
     */
    save () {
      this.$refs.basicFormInfo.validate(valid => {
        if (valid) {
          let validate = this.checkBeforeSave()
          if (validate) {
            let mainValues = this.$utils.clone(this.initValueList, true)

            this.itemList.map(item => {
              if (item.SJLX === 'date') {
                let key = item.FIELD
                let date = new Date(mainValues[key])
                mainValues[key] = date.Format('yyyy-MM-dd')
              }
            })
            let params = {
              GSDM: this.baseParams.gsdm,
              KJND: this.baseParams.kjnd,
              ACTIONFLAG: this.billParams.operate === 'add' || this.billParams.operate === 'parse' ? 'S' : 'M',
              PID: this.pjlxId,
              MAIN: mainValues,
              DETAIL: this.tableData
            }
            params.MAIN['FJID'] = this.identifier
            if (this.billParams.operate === 'add') {
              params.MAIN['FPLY'] = 'SG'
            } else if (this.billParams.operate === 'parse') {
              params.MAIN['FPLY'] = 'SC'
            }
            this.$fn.ajax(saveBill, params, res => {
              if (res.status === 200) {
                this.isUploadSave = true // 保存成功标识
                this.$fn.success({ desc: '保存成功' })
                this.$emit('complete', res.data)
              } else if (res.status === 300) {
                this.$fn.error({ desc: res.msg })
              }
            })
          }
        }
      })
    },

    // 初始化页面
    setInitPage () {
      let moreWidthList = ['GMFDZDH', 'XSFDZDH', 'GMFKHHZH', 'XSFKHHZH']
      let tmpItemList = []
      this.itemList = []
      this.itemList = this.$utils.clone(this.billStruts.MAIN, true)
      this.itemList.forEach((item, index) => {
        if (moreWidthList.includes(item.FIELD)) {
          item.span = '24'
          tmpItemList.push(item)
        }
        if (item.REQUIRED === 'true') {
          if (item.SJLX === 'date') {
            this.rules[item.FIELD] = [{ required: true, message: item.TITLE + '不能为空', trigger: 'blur', type: 'date' }]
          } else {
            if (item.FIELD === 'JSHJ' || item.FIELD === 'HJJE' || item.FIELD === 'SEHJ') {
              this.rules[item.FIELD][1] = { required: true, message: item.TITLE + '不能为空', trigger: 'blur' }
            } else if (item.FIELD !== 'ISPUBLIC') {
              this.rules[item.FIELD] = [{ required: true, message: item.TITLE + '不能为空', trigger: 'blur' }]
            }
          }
        } else {
          if (item.FIELD === 'JSHJ' || item.FIELD === 'HJJE' || item.FIELD === 'SEHJ') {
            this.rules[item.FIELD][0].required = false
          }
        }
      })
      this.itemList = this.itemList.filter(item => !moreWidthList.includes(item.FIELD))
      this.itemList.push(...tmpItemList)
      // this.rules = this.$utils.clone(rules, true)
      if (this.isHaveMx) {
        let columns = this.billStruts.DETAIL
        columns.unshift(
          { type: 'index', title: '序号', minWidth: '50', fixed: 'left' }
        )
        this.columns = this.setColumnsData(columns)
        this.$refs.xTable.loadColumn(this.columns)
      }
      this.tableData = []
      if (this.billParams.operate === 'add') {
        this.getInitValue()
        if (this.isHaveMx) {
          let defauleData = this.initTableData(this.columns) // 手工录入时给表格一条默认值
          this.tableData.push(defauleData)
        }
      } else if (this.billParams.operate === 'update' || this.billParams.operate === 'parse') {
        this.initValueList = this.$utils.clone(this.billValues.MAIN, true)
        this.initValueList['JSHJ'] = this.initValueList['JSHJ'].toString()
        this.checkValue = this.initValueList.ISPUBLIC === '1'
        if (this.isHaveMx) {
          this.tableData = this.$utils.clone(this.billValues.DETAIL, true)
        }
      }
      if (this.isHaveMx) {
        this.$refs.xTable.loadData(this.tableData)
      }
    },
    // 处理表头
    setColumnsData (column) {
      let titleList = JSON.parse(JSON.stringify(column).replace(/FIELD/g, 'field').replace(/TITLE/g, 'title'))
      titleList.forEach(item => {
        item.headerAlign = 'center'
        item.align = 'right'
        if (item.SJLX === 'number') {
          item.editRender = {
            name: 'InputNumber',
            autoFocus: true,
            defaultValue: 0,
            events: {
              'on-change': (val) => {
                this.change(val)
              }
            }
          }
          item.formatter = ({ row, rowIndex, column, columnIndex }) => {
            return XEUtils.commafy(row[column.property], { fixed: 2 })
          }
        } else if (item.SJLX === 'text') {
          item.editRender = {
            name: 'input'
          }
        } else if (item.SJLX === 'money') {
          item.editRender = { name: 'InputNumber', props: { precision: 2 }, autoFocus: true, defaultValue: 0 }
          item.align = 'right'
          item.formatter = ({ row, rowIndex, column, columnIndex }) => {
            return XEUtils.commafy(row[column.property], { fixed: 2 })
          }
        }
        if (item.field === 'SLV') {
          item.title = item.title + '%'
        }
      })
      if (this.editable) {
        titleList.push({
          type: 'tools',
          headerAlign: 'center',
          title: '操作',
          width: '80',
          fixed: 'right',
          slots: {
            default: ({ row, column }, h) => {
              return [
                <span class='tools-icon-default icon-insert' v-tip='插入' type="text" onClick={() => this.handleRowToolbarClick('insert', row)}></span>,
                <span class='tools-icon-default icon-delete' v-tip='删除' type="text" onClick={() => this.handleRowToolbarClick('delete', row)}></span>
              ]
            }
          }
        })
      }
      return titleList
    },
    initTableData (columns) {
      let defaultData = {}
      columns.forEach(item => {
        if (item.type !== 'index' || item.type !== 'tools') {
          let itemObj = {}
          let key = item.field
          let value = item.SJLX === 'input' ? '' : null
          itemObj[key] = value
          defaultData = Object.assign(defaultData, itemObj)
        }
      })
      return defaultData
    },
    getInitValue () {
      this.initValueList = {}
      this.itemList.map(item => {
        if (item.FIELD === 'PID') {
          this.$set(this.initValueList, item.FIELD, this.pjlxId)
          // this.initValueList[item.FIELD] = this.pjlxId
        } else {
          // this.initValueList[item.FIELD] = item.SJLX === 'number' || item.SJLX === 'money' ? 0 : ''
          this.$set(this.initValueList, item.FIELD, '')
        }
      })
    },
    // 表单变化时做计算
    change ({ row }) {

      // if (row.hasOwnProperty('DJ') && row.hasOwnProperty('SL')) {
      //   this.tableData.forEach((item, index) => {
      //     if (item._XID === row._XID) {
      //       this.tableData[index].JE = row.DJ * row.SL
      //       this.tableData[index].SE = this.tableData[index].JE * parseInt(row.SLV) / 100
      //     }
      //   })
      //   let totalJE = 0 // 合计金额
      //   let totalSE = 0 // 合计税额
      //   this.tableData.forEach(item => {
      //     totalJE += Number(item.JE)
      //     totalSE += Number(item.SE)
      //   })
      //   this.initValueList.HJJE = totalJE
      //   this.initValueList.SEHJ = totalSE
      // }
    },
    // 获取票据结构
    getBillStruts () {
      this.$fn.ajax(getPjlxSet, {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        PID: this.pjlxId,
        rowversion: new Date().getTime()
      }, res => {
        if (res.status === 200) {
          this.billStruts = res.data
          this.setInitPage()
        }
      })
    },
    // 获取票据类型
    getPjlxList () {
      this.$fn.ajax(getPjlxList, {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        rowversion: new Date().getTime()
      }, res => {
        if (res.status === 200) {
          this.pjlxList = res.data
          if (this.parseValues.hasOwnProperty('isUpload')) { // 上传-识别票据成功
            if (this.parseValues.isUpload === '1') {
              this.pjlxId = this.parseValues.PID
              this.isHaveMx = this.parseValues.isHaveMx === '1'
            }
          } else {
            this.pjlxId = this.billParams.operate === 'add' ? (this.pjlxList.length > 0 ? this.pjlxList[0].PID : '') : this.billParams.PID
            let filterData = this.pjlxList.filter(item => {
              return item.PID === this.pjlxId
            })
            this.selectedLxObj = filterData[0]
            this.isHaveMx = this.selectedLxObj.ISHAVEMX === '1'
          }
          this.getBillStruts()
        }
      })
    },
    selectChange (val) {
      this.pjlxId = val
      let filterData = this.pjlxList.filter(item => {
        return item.PID === val
      })
      this.selectedLxObj = filterData[0]
      this.isHaveMx = this.selectedLxObj.ISHAVEMX === '1'
      this.itemList = []
      this.getBillStruts()
    },
    handleAddClick () {
      let defauleData = this.initTableData(this.columns) // 新增时给表格一条默认值
      this.tableData.push(defauleData)
    },
    deleteUploadBill () {
      this.$fn.ajax(deleteUploadBill, {
        gxGuid: this.identifier
      }, res => {
        if (res.status === 200) {

        }
      })
    },
    getParams () {
      this.uploadParams = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        ZTH: this.baseParams.zth
      }
      return this.uploadParams
    },
    beforeUpload (file) {
      this.getGuid()
      if (this.billParams.operate === 'parse' || this.billParams.operate === 'add') {
        this.addUploadFp(file)
      } else if (this.billParams.operate === 'update') {
        this.updateUploadFp(file)
      }
      return false
    },
    utilTransformData (data) {
      let formData = new FormData()
      Object.keys(data).map(key => {
        formData.append(key, data[key])
      })
      return formData
    },
    addUploadFp (file) {
      let params = {
        gsdm: this.baseParams.gsdm,
        kjnd: this.baseParams.kjnd,
        zth: this.baseParams.zth,
        totalSize: file.size,
        modCode: '',
        djlx: '',
        djid: '',
        fjlxguid: '',
        identifier: this.identifier,
        file: file
      }
      let newParams = this.utilTransformData(params)
      this.$fn.ajax(addUploadFp, newParams, res => {
        if (res.status === 200) {
          this.getFileList('set')
          this.isUpload = true
        }
      })
    },
    updateUploadFp (file) {
      let params = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        ZTH: this.baseParams.zth,
        FJDX: file.size,
        MODCODE: '',
        DJLX: '',
        DJID: '',
        FJLXGUID: '',
        IDENTIFIER: this.identifier,
        FILE: file
      }
      params['FPID'] = this.billValues.MAIN.FPID
      let newParams = this.utilTransformData(params)
      this.$fn.ajax(editAnnex, newParams, res => {
        if (res.status === 200) {
          this.getFileList('set')
          this.isUpload = true
        }
      })
    },
    getGuid () {
      this.identifier = this.setGuid() + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + this.setGuid() + this.setGuid()
    },
    setGuid () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    getFileList (operate) {
      let params = {
        GXGUID: operate === 'get' ? this.billValues.MAIN.FJID : this.identifier,
        rowversion: new Date().getTime()
      }
      this.$fn.ajax(getAnnex, params, res => {
        if (res.status === 200 && res.data) {
          this.fileTableData = []
          this.fileTableData.push(res.data)
          this.getFileData()
        }
      })
    },
    getFileData () {
      this.$nextTick(() => {
        this.$refs.xFileTable.loadColumn(this.fileColumns)

        this.$refs.xFileTable.loadData(this.fileTableData)
      })
    },
    checkBeforeSave () {
      if (this.fileTableData.length === 0) {
        this.$fn.error({ desc: '请上传附件' })
        return false
      } else {
        return true
      }
    },
    checkedChange () {
      this.initValueList['ISPUBLIC'] = this.checkValue ? '1' : '0'
    },
    // 用友配置下，发票识别未保存时需要删除用友平台的发票记录
    cancelUpload () {
      let params = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        FPDM: this.billValues.MAIN.FPDM,
        FPHM: this.billValues.MAIN.FPHM
      }
      this.$fn.ajax(cancelUpload, params, res => {
        if (res.status === 200) {
          // 内部删除，不予提示
        }
      })
    }
  },
  mounted () {
    this.getPjlxList()
    this.editable = this.state === 'edit'
    if (this.billParams.operate === 'parse') {
      this.identifier = this.billValues.identifier
      if (this.billValues.hasOwnProperty('phoneUpload')) {
        this.identifier = this.billValues.MAIN.FJID
      }
      this.getFileList('set')
    } else if (this.billParams.operate === 'update') {
      this.getFileList('get')
      this.identifier = this.billValues.MAIN.FJID
    }
  },
  // 上传文件识别成功后，若未保存，则需要删除上传的文件。
  // isUploadSave参数在发票保存成功后置为true
  destroyed () {
    if ((this.billParams.operate === 'parse' || (this.isUpload && this.billParams.operate !== 'update')) && !this.isUploadSave) {
      if (this.deleteFj.isLast && !this.deleteFj.isSaved) {
        this.deleteUploadBill()
      }
    }
    // 用友配置下，发票识别未保存时需要删除用友平台的发票记录
    if (this.billParams.operate === 'parse' && this.billValues.MAIN.DZFPJK === 'YONYOU' && !this.isUploadSave) {
      this.cancelUpload()
    }
    // 支持同一张图片上有多张发票的情况
    if (this.billParams.operate === 'parse') {
      this.$emit('nextFp')
    }
  }
}
</script>
<style lang="less">
  @import './bill-input-modal.less';
</style>
