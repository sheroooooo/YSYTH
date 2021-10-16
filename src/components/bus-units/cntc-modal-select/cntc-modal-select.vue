<!--
  该组件是新版 选择合同/合同付款计划 组件;
-->
<template>
  <div class='target-table-wrapper'>
    <div class='target-top-wrapper'
         style='height: calc(100% - 39px); overflow: auto'>
      <Row>
        <Col span='22'>
        <form-group class="form-group-query"
                    :item-list="formStruct"
                    :initValueList="formValue"
                    :label-width='80'
                    ref='formDom'
                    @on-change="formChange"
                    :showMore="true">
        </form-group>
        </Col>
        <Col span='2'>
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
        <!--        <Button class="clear-btn"-->
        <!--                @click="handleClickClearBtn">清除条件</Button>-->
        </Col>
      </Row>
      <vuc-datatable ref="targetTable"
                     style='position: relative;'
                     row-key='_XID'
                     :show-checkbox="showCheckbox"
                     :height="370"
                     :autoResize="true"
                     @on-select="handleSelect"
                     :table-id="tableId"
                     @on-dblclick="hadledblClick">
      </vuc-datatable>
      <Tabs value="name1"
            style="width:100%;background:#fff;">
        <TabPane label="合同付款计划"
                 name="name1"></TabPane>
      </Tabs>
      <vuc-datatable ref="dataTable"
                     height="330"
                     highlight-current-row
                     row-key="ZBID"
                     :show-checkbox=true
                     :editable='true'>
      </vuc-datatable>
    </div>
    <div class="cntc-footer-btn-group"
         style='padding: 0px 0px 0px 0px; text-align: right'>
      <Button class="footer-btn"
              style='margin-left: 10px'
              @click="$emit('close')">取消</Button>
      <Button type="primary"
              class="footer-btn"
              style='margin-left: 10px'
              @click='handleSubmit'>确定</Button>

    </div>
  </div>
</template>
<script>
import tools from '@/libs/toolutil'
import FormGroup from '_c/form/form-group/form-group'
import { getModalTableData, getHTQueryList, ELEMENT_COLUMNS } from '@/api/cntc/public.js'
export default {
  name: 'CntcModalSelect',
  props: {
    baseParams: {
      type: Object,
      default: () => { }
    },
    rowCheckBox: {
      type: Array,
      default: () => []
    },
    initValue: {
      type: Object,
      default: () => { }
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    dataList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      formValue: {},
      formStruct: [],
      rowData: {},
      tableColumns: [],
      modalName: 'HT'
    }
  },
  components: { FormGroup },
  computed: {
    tableId () {
      return 'GpmcModalSelect' + tools.getLocal('userCode')
    }
  },
  methods: {
    handleSubmit (row) {
      let checkData = this.$refs.dataTable.getCheckedData()
      checkData.forEach(item => { // 拼接合同数据
        item = Object.assign(item, this.rowData)
      })
      this.$emit('on-change', checkData)
      this.$emit('complete', checkData, this.tableColumns.HTSKJH)
      this.$emit('close')
      return false
    },
    getTargetData (row = {}, modalName) {
      return new Promise((resolve, reject) => {
        console.log(this.baseParams)
        let params = { ...this.baseParams, ...this.formValue, name: modalName }
        if (row) params.CODE = row.CODE
        this.$fn.ajax(getModalTableData, params, res => {
          if (res && res.status === 200) {
            if (modalName === 'HT') {
              this.$refs.targetTable.loadData(res.data)
            } else {
              resolve(res)
            }
          }
        }, 0)
      })
    },
    handleClickSearch () {
      this.getTargetData({}, 'HT')
    },
    formChange (valueList, key, node) {
      this.formValue = { ...this.formValue, ...valueList }
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.rowData = row
      this.getTargetData(row, 'HTSKJH').then(res => {
        this.$refs.dataTable.loadData(res.data)
        if (this.dataList.length > 0) {
          this.$refs.dataTable.setRowsChecked((item) => {
            let validate = false
            this.dataList.forEach(idx => {
              if (item.PLAN_ID === idx.PLAN_ID) {
                validate = true
              }
            })
            return validate
          }, true)
        }
      })
    },
    hadledblClick ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      if (!this.showCheckbox) this.handleSubmit(row)
    }
  },
  mounted () {
    this.tableColumns = ELEMENT_COLUMNS()
    for (let item in this.tableColumns) {
      this.tableColumns[item].map(item => {
        if (item.field === 'CODE') item.width = '160'
        if (item.type === 'InputMoney') {
          item.align = 'right'
          item.formatter = ({ row, rowIndex, column, columnIndex }) => {
            return this.$utils.commafy(row[column.property], { fixed: 2 })
          }
        }
      })
    }
    this.formValue = { CODE: '', PROJECT_NAME: '' }
    this.$refs.targetTable.loadColumn(this.tableColumns.HT)
    this.$refs.dataTable.loadColumn(this.tableColumns.HTSKJH)
    this.handleClickSearch()
    this.formStruct = getHTQueryList()
  },
  beforeCreate () {
    this.$options.components.FormGroup = require('_c/form/form-group/form-group.vue').default
  }
}
</script>
<style scoped lang="less">
  @import 'cntc-modal-select.less';
</style>
