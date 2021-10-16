<!--
  该组件是新版 选择采购 组件;
-->
<template>
  <div class='target-table-wrapper'>
    <div class='target-top-wrapper'
         style='height: calc(100% - 39px); overflow: auto'>
      <Row v-if="gpmcType === 'CGYS'">
        <Col span='21'>
        <form-group class="form-group-query"
                    :item-list="formStruct"
                    :initValueList="formValue"
                    :label-width='80'
                    ref='formDom'
                    @on-change="formChange"
                    :showMore="true">
        </form-group>
        </Col>
        <Col span='3'>
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
        <!--        <Button class="clear-btn"-->
        <!--                @click="handleClickClearBtn">清除条件</Button>-->
        </Col>
      </Row>
      <vuc-datatable ref="targetTable"
                     style='position: relative;'
                     :row-key='rowKey'
                     :show-checkbox="showCheckbox"
                     :height="450"
                     @on-select="handleSelect"
                     :table-id="tableId"
                     @on-dblclick="hadledblClick">
      </vuc-datatable>
    </div>
    <div class="footer-btn-group"
         style='padding: 0px 0px 0px 0px; text-align: right'>
      <Button class="footer-btn"
              style='margin-left: 10px'
              @click="$emit('close')">取消</Button>
      <Button type="primary"
              style='margin-left: 10px'
              @click='handleSubmit'
              class="footer-btn">确定</Button>
    </div>
  </div>
</template>
<script>
import tools from '@/libs/toolutil'
import FormGroup from '_c/form/form-group/form-group'
import {
  ELEMENT_COLUMNS,
  getPurchaseAcceptanceList,
  getPurchaseAcceptanceDetailsList,
  getPurchaseApplyTitleList,
  getPurchaseApplyList
} from '@/api/gpmc/public.js'
export default {
  name: 'GpmcModalSelect',
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
    modCode: {
      type: String,
      default: 'OER'
    },
    dataList: {
      type: Array,
      default: () => []
    },
    gpmcType: {
      type: String,
      default: 'CGYS'
    }
  },
  data () {
    return {
      formValue: {},
      formStruct: [],
      rowData: {},
      tableColumns: [],
      CGSQColumns: [] // 采购申请 表头
    }
  },
  components: { FormGroup },
  computed: {
    tableId () {
      return 'GpmcModalSelect' + tools.getLocal('userCode')
    },
    rowKey () {
      let tmpRowKey = '_XID'
      switch (this.gpmcType) {
        case 'CGYS':
          tmpRowKey = 'ZBID'
          break
        case 'CGSQ':
          tmpRowKey = 'DJBH'
          break
      }
      return tmpRowKey
    }
  },
  methods: {
    initPageInfo () {
      this.getColumns()
    },
    getColumns () {
      switch (this.gpmcType) {
        case 'CGYS':
          let columns = ELEMENT_COLUMNS
          for (let i = 0, len = columns.length; i < len; i++) {
            if (columns[i].type && columns[i].type === 'date') {
              columns[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
                return tools.dealDate(row[column.property], 'yyyy-MM-dd')
              }
            } else if (columns[i].type && columns[i].type === 'money') {
              columns[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
                return this.$utils.commafy(row[column.property], { fixed: 2 })
              }
            }
          }
          this.formValue = { BM: '' }
          this.$refs.targetTable.loadColumn(ELEMENT_COLUMNS)
          this.handleClickSearch()
          let params = { ...this.baseParams, LBDM: 'BM', ISCHANGE: '1', MODCODE: 'GPMC' }
          this.formStruct = [{ type: 'tree-select', label: '部门', name: 'BM', props: { dataSources: -2, params, idField: 'DM' } }]
          break
        case 'CGSQ':
          this.getPurchaseApplyTitleList()
          break
      }
    },
    // 采购申请 start
    getPurchaseApplyTitleList () {
      getPurchaseApplyTitleList({}).then(res => {
        if (res && res.status === 200) {
          this.CGSQColumns = res.data
          let dateField = ['DJRQ']
          let moneyField = ['JE']
          this.CGSQColumns.map(item => {
            item.headerAlign = 'center'
            item.field = item.key
            item.width = '150'
            if (dateField.includes(item.key)) {
              item.sortable = true
              item.formatter = ({ row, rowIndex, column, columnIndex }) => {
                if (row[column.property]) {
                  return tools.dealDate(row[column.property], 'yyyy-MM-dd')
                } else {
                  return row[column.property]
                }
              }
            } else if (moneyField.includes(item.key)) {
              item.align = 'right'
              item.formatter = ({ row, rowIndex, column, columnIndex }) => {
                if (row[column.property]) {
                  return this.$utils.commafy(row[column.property], { fixed: 2 })
                } else {
                  return 0.00
                }
              }
            }
          })
          this.CGSQColumns.unshift(
            { type: 'selection', title: ' ', width: '40', fixed: 'left' },
            { type: 'index', title: '序号', width: '50', fixed: 'left' }
          )
          this.$refs.targetTable.loadColumn(this.CGSQColumns)
          this.getPurchaseApplyList()
        }
      })
    },
    getPurchaseApplyList () {
      getPurchaseApplyList({
        ...this.baseParams, MODCODE: this.modCode
      }).then(res => {
        if (res && res.status === 200) {
          this.$refs.targetTable.loadData(res.data)
        }
      })
    },
    // 采购申请 end
    handleSubmit (row) {
      let checkData = this.$refs.targetTable.getCheckedData()
      switch (this.gpmcType) {
        case 'CGYS':
          if (checkData.length === 1) {
            this.getPurchaseAcceptanceDetailsList(checkData[0]).then(res => {
              res.forEach(item => {
                if (!item.hasOwnProperty('YSJGJE')) {
                  item['YSJGJE'] = 0
                }
              })
              this.$emit('on-change', res)
              this.$emit('complete', res, ELEMENT_COLUMNS)
              this.$emit('close')
              return false
            })
          }
          if (checkData.length > 1) {
            this.$fn.error({ title: '失败提示', desc: '采购验收单信息只能选择一条' })
            return false
          }
          break
        case 'CGSQ':
          this.$emit('on-change', checkData)
          this.$emit('complete', checkData, this.CGSQColumns)
          this.$emit('close')
          break
      }
    },
    // 获取采购验收明细信息
    getPurchaseAcceptanceDetailsList (row) {
      return new Promise((resolve, reject) => {
        let params = {
          ...this.baseParams,
          YSJGDGUID: row.YSJGDGUID
        }
        this.$fn.ajax(getPurchaseAcceptanceDetailsList, params, res => {
          if (res && res.status === 200) {
            resolve(res.data)
          }
        })
      })
    },
    getTargetData () {
      return new Promise((resolve, reject) => {
        let params = {
          ...this.baseParams,
          MODCODE: this.modCode,
          CONDITION: { BM: this.formValue.BM.split(' ')[0] }
        }
        this.$fn.ajax(getPurchaseAcceptanceList, params, res => {
          if (res && res.status === 200) {
            this.$refs.targetTable.loadData(res.data)
            if (this.dataList.length > 0) {
              this.$refs.targetTable.setRowsChecked((item) => {
                return item.YSJGDGUID === this.dataList[0].YSJGDGUID // 明细数据YSJGDGUID一样
              }, true)
            }
          }
        }, 0)
      })
    },
    handleClickSearch () {
      this.getTargetData()
    },
    // 清空查询条件
    handleClickClearBtn () {
      for (let key in this.formValue) {
        this.formValue[key] = ''
      }
    },
    formChange (valueList, key, node) {
      this.formValue = { ...this.formValue, ...valueList }
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.rowData = row
    },
    hadledblClick ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      if (!this.showCheckbox) this.handleSubmit(row)
    }
  },
  mounted () {
    this.initPageInfo()
  },
  beforeCreate () {
    this.$options.components.FormGroup = require('_c/form/form-group/form-group.vue').default
  }
}
</script>
<style scoped lang="less">
  @import 'gpmc-modal-select.less';
</style>
