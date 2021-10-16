<!-- 导入Excel
  /**
     * @param {Boolean} [showModel]           - 是否显示导入模态框
     * @param {String} [templetCode]            - excel模板templetCode
     * @param {String} [modeCode]               - 模块标识
     * @param {Event} [@importData]             - 导入Excel数据
     * @param {String} [fileName]               - 导出模板名字
  */
 -->
<template>
  <!-- 导入 -->
  <div :class="[`${prefixCls}`]">
    <Modal title='导入'
           width="800px"
           v-model='isModal'
           :mask-closable="false"
           @on-visible-change='changeModal'>
      <div slot="header"
           style="color:#f60">
        <Steps :current="current">
          <Step title="选择上传文件"></Step>
          <Step title="对应列"></Step>
          <Step title="完成"></Step>
        </Steps>
      </div>
      <div style="text-align:center">
        <vuc-datatable ref='temTable'
                       v-if="current === 1"
                       :height='300'
                       row-key="rowKey"
                       :showToolbar="false"
                       :show-pager="false"
                       :editable='billEditable'>
        </vuc-datatable>
        <template v-if="current === 0">
          <Divider orientation="left"
                   v-if="this.modeCode === 'PAO' && templetCode === '0003'">选择Excel文件</Divider>
          <Upload type="drag"
                  :before-upload='beforeUpload'
                  :on-success="handleSuccess"
                  :headers="headers"
                  :action="`${luyou}/pub/excel/getExcelColumn`">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload"
                    size="52"
                    style="color: #3399ff"></Icon>
              <p>上传文件</p>
            </div>
          </Upload>
          <div v-if="uploadFileName !== ''">
            <!-- <Progress :status='uploadStatus'
                      :percent="uploadPercent"
                      :stroke-width='strokeWidth' /> -->
            {{uploadFileName}}
          </div>
          <Divider orientation="left"
                   v-if="this.modeCode === 'PAO' &&templetCode === '0003'">选项</Divider>
          <div v-if="this.modeCode === 'PAO' &&templetCode === '0003'"
               style="text-align:left; padding-left: 16px">
            <Checkbox v-model="HBJE">其他收入申报导入时合并金额（合并原则：同一职员、相同项目）</Checkbox>
          </div>
        </template>
        <div v-if="current === 2">
          <div style="height: 80px; margin: 50px auto;">
            <Col span="24"
                 :class="[`${prefixCls}-complete`]">
            <Icon size="40"
                  color="#00A854"
                  type="ios-checkmark-circle" />导入完成！
            </Col>
          </div>
        </div>
      </div>
      <div slot="footer"
           :class="[`${prefixCls}-footer`]">
        <Button type="default"
                style="position: absolute; left: 0;"
                v-if="current === 0"
                @click="downLoadTemplate">下载模板</Button>
        <Button type="primary"
                v-if="current ===1"
                @click="back">上一步</Button>
        <Button type="primary"
                v-if="current !== 2"
                @click="next">{{current === 1 ? '上传' : '下一步'}}</Button>
        <Button type="primary"
                v-if="current === 2"
                @click="ok">完成</Button>
      </div>
    </Modal>
    <Modal v-model="infoModal"
           title="提示"
           class='import-info-modal'>
      <pre>{{infoContent}}</pre>
    </Modal>
  </div>
</template>
<script>
import { getDataTableInfo, getFileUpLoad, getTemTable, outPutModule } from '@/api/pub/import-export-excel'
import mixin from '@/libs/app-mixin'
import { getToken } from '@/libs/util'
import config from '@/config'
export default {
  name: 'ImportExportExcel',
  props: {
    showModel: {
      type: Boolean,
      default: false
    },
    templetCode: {
      type: String,
      default: ''
    },
    modeCode: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: '导出表格.xlsx'
    },
    gsdm: {
      type: String,
      default: ''
    },
    kjnd: {
      type: String,
      default: ''
    },
    zth: {
      type: String,
      default: ''
    },
    fileParameter: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      prefixCls: 'import-export-excel',
      luyou: config.baseUrl.pro, // 是否添加u8-bs
      current: 0,
      excelNameList: [], // 导入的模板字段
      upLoadParams: '', // 导入明细入参
      templateTableData: [], // 导入对应列
      templateCopyData: [],
      headers: { 'Authorization': getToken() },
      billEditable: true,
      isModal: false,
      isUpload: false,
      uploadFile: { name: '' },
      HBJE: false, // 其他收入  申报是是否合并金额
      uploadStatus: 'normal', // 上传状态
      uploadPercent: 0, // 上传进度百分比
      strokeWidth: 4, // 进度条宽度
      uploadFileName: '',
      infoModal: false,
      infoContent: '',
      infoResult: ''
    }
  },
  computed: {
    fresh () {
      return this.current === 1 ? '1' : '0'
    }
  },
  watch: {
    fresh (val) {
      if (val === '1') {
        this.getTemColumn()
        this.getTemplateTableData()
      }
    },
    showModel (val) {
      if (val) {
        this.isModal = val
        this.uploadFileName = ''
      }
    }
  },
  activated () {
    this.uploadFileName = ''
  },
  methods: {
    // 导入时，下载模板
    downLoadTemplate () {
      let params = {
        GSDM: '99999999999999999999',
        KJND: '9999',
        ZTH: '99999999999999999999',
        MODCODE: this.modeCode,
        TEMPLETCODE: this.templetCode
      }
      outPutModule(params).then(
        res => {
          const content = res
          const blob = new Blob([content])
          // const fileName = item.fileName
          const fileName = this.fileName
          if ('download' in document.createElement('a')) { // 非IE下载
            const elink = document.createElement('a')
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            // window.open(elink.href)
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
          } else { // IE10+下载
            navigator.msSaveBlob(blob, fileName)
          }
        }
      )
    },
    // 上传文件之前的钩子
    beforeUpload (file) {
      this.uploadFileName = file.name
      return true
    },
    // 上传模板成功
    handleSuccess (res, file) {
      this.isUpload = true
      let list = JSON.parse(JSON.stringify(res.data).replace(/EXCEL_NAME/g, 'label'))
      list.map(item => {
        item.value = item.label
      })
      this.excelNameList = list
      this.$fn.success({ title: '正确提示', desc: '上传成功' })
      this.uploadFile = file.file
    },
    // 导入时，设置对应列可编辑
    setTemplateColumn (columnList) {
      columnList.map(item => {
        if (item.fieldType === 'readonly') {
          return false
        }
        if (item.field === 'EXCEL_NAME') {
          item.editRender = {
            name: 'Select', options: this.excelNameList
          }
        }
      })
      return columnList
    },
    // 导入时，获取对应关系表表头
    getTemColumn () {
      let columnList = this.setTemplateColumn(getTemTable())
      this.temColumn = columnList
      this.$nextTick(() => {
        this.$refs.temTable.loadColumn(this.temColumn)
      })
      return true
    },
    // 导入时，获取excel需要导入的表结构
    getTemplateTableData () {
      let params = {
        GSDM: this.gsdm,
        KJND: this.kjnd,
        ZTH: this.zth,
        MODCODE: this.modeCode,
        TEMPLETCODE: this.templetCode
      }
      getDataTableInfo(params).then(
        res => {
          let templateArr = []
          for (let i = 0, len = res.data.length; i < len; i++) {
            for (let j = 0, len = this.excelNameList.length; j < len; j++) {
              if (res.data[i].ISABLE === '1' && (res.data[i].NAME === this.excelNameList[j].label)) {
                res.data[i].EXCEL_NAME = this.excelNameList[j].value
                templateArr.push(res.data[i])
              } else if (res.data[i].ISABLE === '0' && res.data[i].TYPE === 'COPY') {
                this.templateCopyData.push(res.data[i])
              }
            }
          }
          this.templateCopyData = [...new Set(this.templateCopyData)]
          this.$nextTick(() => {
            this.$refs.temTable.loadData(templateArr)
          })
        }
      )
    },
    // 导入时，上传模板的入参
    getUploadParmas () {
      return {
        GSDM: this.gsdm,
        KJND: this.kjnd,
        ZTH: this.zth,
        MODCODE: this.modeCode,
        TEMPLETCODE: this.templetCode,
        RELATIONLIST: this.upLoadParams,
        JL_RQ: this.$store.state.app.env.loginDate.replace(/-/g, ''),
        JLR_ID: this.$store.state.user.userId
      }
    },
    // 导入文件成功
    upLoadExcelSuccess (res, file) {
      if (res && res.status === 200) {
        this.$fn.success({ title: '正确提示', desc: '上传成功' })
        let data = res.data
        data.map(item => {
          item.SRID = ''
          item.rowKey = (new Date()).Format('yyyyMMddhhmmssS')
          item.oldDjid = item.rowKey
        })
        this.$emit('importData', data)
        /* this.$nextTick(() => {
          this.$refs.xTable.loadData(data)
        }) */
      } else {
        this.$fn.error({ title: '错误提示', desc: '上传失败！' })
      }
    },
    // 导入时，上一步
    back () {
      this.current -= 1
    },
    // 导入时，下一步
    next () {
      let isNext = true
      if (this.current === 0) {
        if (!this.isUpload) {
          isNext = false
          this.$fn.error({ title: '错误提示', desc: '请上传文件！' })
        }
      }
      if (this.current === 1) {
        let data = this.$refs.temTable.getTableData().visibleData
        let excelData = this.excelNameList
        data.map(item => {
          excelData.map(value => {
            if (item.EXCEL_NAME === value.label) {
              item.EXCEL_CODE = value.EXCEL_CODE
            }
          })
        })
        let param = ''
        for (let idx = 0; idx < data.length; idx++) {
          if (data[idx].EXCEL_NAME === undefined) {
            this.$fn.error({ title: '错误提示', desc: '对应列必填！' })
            isNext = false
            break
          }
          param = `${param}${data[idx].CODE}|${data[idx].TYPE}|${data[idx].EXCEL_CODE},`
          // param = param + data[idx].CODE + '|' + data[idx].TYPE + '|' + data[idx].EXCEL_CODE + ','
        }
        for (let i = 0, len = this.templateCopyData.length; i < len; i++) {
          param = `${param}${this.templateCopyData[i].CODE}|${this.templateCopyData[i].TYPE}|${this.templateCopyData[i].CODE},`
        }
        this.upLoadParams = param
      }
      if (isNext) {
        if (this.current === 1) {
          this.handleUpload()
        } else {
          this.current += 1
        }
      }
    },
    ok () {
      this.isModal = false
      // this.$emit('isModal', this.isModal)
      this.$emit('closeModal', 'close')
      this.current = 0
    },
    changeModal () {
      this.current = 0
      this.isUpload = false
      this.$emit('isModal', false)
      this.$emit('closeModal')
    },
    utilTransformData (data) {
      let formData = new FormData()
      Object.keys(data).map(key => {
        formData.append(key, data[key])
      })
      return formData
    },
    handleUpload () {
      let data = {
        GSDM: this.gsdm,
        ZTH: this.zth,
        KJND: this.kjnd,
        KMND: this.kjnd,
        MODCODE: this.modeCode,
        TEMPLETCODE: this.templetCode,
        RELATIONLIST: this.upLoadParams,
        JL_RQ: this.$store.state.app.env.loginDate.replace(/-/g, ''),
        JLR_ID: this.$store.state.user.userId,
        file: this.uploadFile,
        ...this.fileParameter
      }
      if (this.modeCode === 'GL') { // 账务
        switch (this.templetCode) {
          case 'VoucherFormTemplate': // 编制凭证导入
            data.url = '/gl/voucherForm/uploadVoucherForm'
            break
          case 'InitialBalanceLoadTemplate': // 期初余额导入
            data.url = '/gl/initialBalanceLoad/uploadInitialBalanceLoad'
            break
          case 'AccountingSubjectsTemplate': // 会计科目导入
            data.url = '/bas/accountingSubjects/uploadAccountingSubjects'
            break
        }
      } else if (this.modeCode === 'PAO') { // 其他薪资
        data.url = '/pao/excel/upLoad'
        // QTSRLX  其他收入类型 [0其他收入，1劳务费，2津补贴，3奖助学金]
        this.HBJE ? data.HBJE = '1' : data.HBJE = '0' // 其他收入申报的时候才有,勾了传1  其他传0
        switch (this.templetCode) {
          case '0003':// 其他收入模板
            data.QTSRLX = '0'
            break
          case '0004':// 劳务费模板
            data.QTSRLX = '1'
            break
          case '0006':// 学生奖助学金申报模板
            data.QTSRLX = '3'
            break
        }
      } else if (this.modeCode === 'BAS') { // 基础资料
        switch (this.templetCode) {
          case '0001': // 部门模板
            data.url = '/bas/DpAndSf/bmxxImport'
            break
          case '0002': // 职员模板
            data.url = '/bas/DpAndSf/zyxxImport'
            break
          case '0003': // 货币模板
            data.url = '/bas/Currency/currentcyImport'
            break
          case '0004': // 项目分类模板
            data.url = '/bas/projectCategory/projectCategoryImport'
            break
          case '0005': // 项目资料模板
            data.url = '/bas/project/projectImport'
            break
          case '0006': // 往来单位模板
          case 'BudgetUnitTemplate': // 预算单位模板
            data.url = '/bas/company/uploadBudgetUnit'
            break
          case 'AuxiliaryAccountingItemsTemplate': // 辅助核算项模板
            data.url = '/bas/auxiliaryAccountingItems/uploadAuxiliaryAccountingItems'
            break
        }
      } else if (this.modeCode === 'FAQC') {
        // 资产存放地点设置模板
        data.url = '/fa/base-info/importStorageLocationCode'
      } else if (this.modeCode === 'INV') { // 物资
        switch (this.templetCode) {
          case '0001': // 物资类型模板
            data.url = '/inv/wzzl/importWZLXInfo'
            break
          case '0002': // 物资信息模板
            data.url = '/inv/wzzl/importWZXXInfo'
            break
        }
      } else {
        data.url = '/pub/excel/upLoad'
      }
      data.desc = this.$route.params.gnflMc + '导入'
      let params = this.utilTransformData(data)
      getFileUpLoad(params).then(res => {
        if (res && res.status === 200) {
          this.$fn.success({ title: '正确提示', desc: '上传成功' })
          this.current += 1
          this.$emit('importData', res.data)
        } else if (res.status === 300) {
          // 不采用函数式 是因为不能修改样式。后台返回的东西有时会很多。要设置高度和宽度
          this.infoModal = true
          this.infoContent = res.msg
          this.infoResult = res.data
        } else if (res && res.status === 500) {
          this.$fn.error({ title: '错误提示', desc: res.msg + '！' + res.data + '！' })
        }
      })
    },
    handleInfoModalOk () {
      this.infoModal = false
      this.current += 1
      this.$emit('importData', this.infoResult)
    }
  },
  mixins: [mixin]
}
</script>
<style lang="less">
  @import './import-export-excel';
</style>
