<!--
  /**
   * @description: 选择打印模板弹框
   * @author: yangtao
   * @date: 2020-03-04
   * @last modifed by: yangtao
   * @last modifed time: 2020-03-09
   */
-->
<template>
  <div class="print-modal">
    <vuc-datatable ref="xTable"
                   row-key="TEMPLATENAME"
                   :height="tableHeight"
                   :show-checkbox="true"
                   @on-select="handleSelect"
                   @on-dblclick="hadledblClick">
    </vuc-datatable>
    <div class="print-modal-footer-btn-group">
      <Row>
        <Col span="20">
        <Button type="primary"
                @click="setDefault"
                class="btn-item">设为默认</Button>
        </Col>
        <Col span="2">
        <Button type="primary"
                @click="onOk"
                class="btn-item">确定</Button>
        </Col>
        <Col span="2">
        <Button @click="onCancel"
                class="btn-item">取消</Button>
        </Col>
      </Row>
    </div>
  </div>
</template>
<script>
import { setDefaultTemplate, getPrintTemplate } from '@/api/pub/print-modal.js'
const columns = [
  {
    title: '序号',
    type: 'index',
    width: '60',
    fixed: 'left',
    headerAlign: 'center'
  },
  {
    title: '模板名称',
    field: 'TEMPLATENAME',
    minWidth: '200',
    headerAlign: 'center'
  },
  {
    title: '模板格式',
    field: 'TEMPLATEFORMAT',
    headerAlign: 'center'
  },
  {
    title: '套打模板',
    field: 'ISTD',
    headerAlign: 'center'
  },
  {
    title: '默认模板',
    field: 'ISDEFAULT',
    headerAlign: 'center'
  }
]
const templateFormat = { // 模板格式
  '["B"]': '三栏式',
  '["B","S"]': '数量金额式',
  '["B","W"]': '复币式',
  '["B","W","S"]': '数量外币式'
}
export default {
  name: 'PrintModal',
  props: {
    // 公共入参 包含 gsdm zth
    baseParams: {
      type: Object,
      default: () => { }
    },
    // 模块编码
    MODCODE: {
      type: String,
      default: ''
    },
    // 功能编码
    FUNCCODE: {
      type: String,
      default: ''
    },
    // 模板格式 三栏式[数量金额式、复币式、数量外币式] 通过格式过滤模板
    TEMPLATEFORMAT: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      filterText: '',
      filterData: [],
      tableHeight: 0,
      // 表头
      columns,
      // 表格数据
      tableData: [],
      // 表格选中数据
      selectTableData: {}
    }
  },
  methods: {
    /**
     * @description 设置默认模板
     * @param {String} TEMPLATEID 模板ID
     * @param {String} ISDEFAULT 是否默认
     * @param {String} MODCODE 模块编码
     * @param {String} FUNCCODE 功能编码
     * @param {String} GSDM 公司代码
     * @param {String} ZTH 账套号
     */
    setDefault () {
      if (Object.keys(this.selectTableData).length === 0) {
        this.$fn.warning({ desc: '请选择模板' })
        return
      }
      let { TEMPLATEID } = this.selectTableData
      this.$fn.ajax(setDefaultTemplate, {
        TEMPLATEID,
        'ISDEFAULT': '1',
        MODCODE: this.MODCODE,
        FUNCCODE: this.FUNCCODE,
        GSDM: this.baseParams.gsdm,
        ZTH: this.baseParams.zth
      }, res => {
        if (res.status === 200) {
          this.$fn.success({ desc: res.msg })
          this.getPrintTemplate() // 设置默认模板成功后重新获取模板
        }
      })
    },

    /**
     * @description: 获取打印模板
     * @param {String} MODCODE // 模块编码
     * @param {String} FUNCCODE // 功能编码
     * @param {String} GSDM // 公司代码
     * @param {String} ZTH // 账套号
     * */
    getPrintTemplate () {
      this.$fn.ajax(getPrintTemplate, {
        MODCODE: this.MODCODE,
        DWFUNCCODE: this.baseParams.gsdm + this.baseParams.kjnd + this.FUNCCODE,
        FUNCCODE: this.FUNCCODE,
        GSDM: this.baseParams.gsdm,
        ZTH: this.baseParams.zth
      }, res => {
        if (res.status === 200 && res.data) {
          if (this.TEMPLATEFORMAT !== '' && this.TEMPLATEFORMAT !== '["B"]') {
            this.tableData = res.data.filter(item => item.TEMPLATEFORMAT === templateFormat[this.TEMPLATEFORMAT])
          } else {
            this.tableData = res.data
          }
          let defaultTemplateRowIndex = 0
          let hasDefaultTemplate = false
          this.tableData.forEach((item, index) => {
            if (item.ISDEFAULT === '1') {
              defaultTemplateRowIndex = index
              hasDefaultTemplate = true
            }
            item.ISENABLE = item.ISENABLE === '1' ? '是' : '否'
            item.ISTD = item.ISTD === '1' ? '是' : '否'
            item.ISDEFAULT = item.ISDEFAULT === '1' ? '是' : '否'
          })
          this.$nextTick(() => {
            this.$refs.xTable.loadData(this.tableData)
            if (hasDefaultTemplate) { // 有默认模板选中默认模板行
              this.$refs.xTable.setCurrentRow(this.tableData[defaultTemplateRowIndex])
              this.selectTableData = { ...this.tableData[defaultTemplateRowIndex] }
            }
          })
        }
      })
    },

    // 单选
    handleSelect ({ row }) {
      this.selectTableData = row
    },

    // 双击选择
    hadledblClick ({ row }) {
      this.selectTableData = row
      this.$emit('complete', this.selectTableData)
    },

    // 确定按钮
    onOk () {
      if (Object.keys(this.selectTableData).length === 0) {
        this.$fn.warning({ desc: '请选择模板' })
        return
      }
      this.$emit('complete', this.selectTableData)
    },

    onCancel () {
      this.$emit('close')
    }
  },
  mounted () {
    // 获取表格数据
    this.getPrintTemplate()
    this.$refs.xTable.loadColumn(this.columns)
  },
  created () {
    this.tableHeight = 500 - 40 - 43 - 38
  }
}
</script>
<style lang="less" scoped>
 @import './print-modal.less';
</style>
