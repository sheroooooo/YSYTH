<!--业务组件：单据表内项业务组件
     /**
     * @desc
     * @author wangxin
     * @date 2019-03-09
     * @param {Array} [itemList]        - 表单类型 [必须]
     * @param {Array} [columns]         - 表单域与表头数据 [必须]
     * @param {Array} [initValueList]   - 表单内容 [必须]
     * @param {Boolean} [editable]      - 是否可编辑 [必须] [默认:可编辑]
     * @param {Number} [labelWidth]     - 表单域宽度 [非必须] [默认:100]
     * @param {cols} [Number]           - 表单展示列数 [非必须] [默认:3]
     * @param {Object} [InitErrorStore] - 表单错误校验信息 [非必须] [默认:非空校验]
     * @param {String} [viewType]       - 组件两者展示类型 'tile':表单模式 'table':表格模式 [非必须] [默认:table]
     * @event [on-change]               - 表单内容变化触发事件
     * @example 调用示例
     * <table-expand-form ref="bnxFormGroup"
        v-if="item.dataSource==='bnx'"
        :key="`${_uid}_${index}`"
        :item-list="formatItemList(item.list)"
        :columns="formatColumns(item.list)"
        :init-value-list="partList.length===0?[]:partList[index-1].list"
        :label-width=labelWidth
        :cols=cols
        :viewType="viewType(index-1)"
        :editable="editable"
        :init-error-store="errorStore"
        @on-change="(list)=>formBNXChange(index-1,list)">
      </table-expand-form>
     */
-->
<template>
  <div class="table-expand-form">
    <form-label-group ref="newFormGroup"
                      v-if="firstEditPanel && editable"
                      :item-list="itemList"
                      :init-value-list="valueList.length===0?{YZFF:''}:valueList[0]"
                      :label-width="labelWidth"
                      :init-error-store="errorStore"
                      :editable="editable"
                      :form-filter-field="formFilterField"
                      @hkcl-on-change="hkclOnChange"
                      @on-change="handleOneFormChange">
      <template v-for="(formitem) in itemList">
        <slot :name="formitem.name"
              :slot="formitem.name"></slot>
      </template>
      <div class="tr"
           v-if="editable">
        <Button type="primary"
                @click="onNewFormOk">确认</Button>
      </div>
    </form-label-group>
    <Table v-else-if="view!=='tile'"
           border
           stripe
           size="small"
           :columns="columnList"
           :data="valueList"
           :init-error-store="errorStore">
      <template v-if="editable"
                slot-scope="{ row, index }"
                slot="action">
        <Tooltip content="修改"
                 placement="top"
                 transfer>
          <Icon class="tools-icon-default icon-edit"
                @click="handleEditRow(index)" />
        </Tooltip>
        <Tooltip content="删除"
                 placement="top"
                 transfer>
          <Icon class="tools-icon-default icon-delete"
                @click="delRow(index)" />
        </Tooltip>
        <Tooltip content="插入"
                 placement="top"
                 transfer>
          <Icon class="tools-icon-default icon-insert"
                @click="handleInsertRow(index)" />
        </Tooltip>
        <Tooltip content="复制"
                 placement="top"
                 transfer>
          <Icon class="tools-icon-default icon-copy"
                @click="handleCopyRow(index)" />
        </Tooltip>
      </template>
    </Table>
    <template v-else
              v-for="(item , index) in valueList">
      <div :key="`${_uid}_${index}`"
           class="table-expand-form-panel">
        <span class="rec-no">{{index+1}}</span>
        <form-label-group :item-list="itemList"
                          :init-value-list="item"
                          :label-width='labelWidth'
                          :withToolbar="true"
                          :cols='cols'
                          :editable="formEditable(index)"
                          :init-error-store="errorStore"
                          @hkcl-on-change="hkclOnChange"
                          :form-filter-field="formFilterField"
                          @on-change="(val)=>{handleRowChange(index,val)}"
                          @ok="(val)=>{handleUpdateRow(index,val)}"
                          @no="handleCancelRow(index)"></form-label-group>
        <span class="actions"
              v-if="editable">
          <Tooltip content="修改"
                   placement="right"
                   transfer>
            <Icon type="ios-create-outline"
                  @click="handleEditRow(index)"
                  size="18" />
          </Tooltip>
          <Tooltip content="删除"
                   placement="right"
                   transfer>
            <Icon type="ios-trash-outline"
                  @click="delRow(index)"
                  size="18" />
          </Tooltip>
          <Tooltip content="插入"
                   placement="right"
                   transfer>
            <Icon type="ios-log-in"
                  @click="handleInsertRow(index)"
                  size="18" />
          </Tooltip>
          <Tooltip content="复制"
                   placement="right"
                   transfer>
            <Icon type="ios-copy-outline"
                  @click="handleCopyRow(index)"
                  size="18" />
          </Tooltip>
        </span>
      </div>
    </template>
    <div v-if="!firstEditPanel && editable"
         class="tc"
         @click="handleAddRow($event)"
         style="padding-top:10px;cursor:pointer">
      <Icon type="md-add"
            size="18" />
    </div>
  </div>
</template>
<script>
import './table-expand-form.less'
import FormLabelGroup from '_c/form/form-label-group'
import clonedeep from 'clonedeep'
import tools from '@/libs/toolutil'
import * as XEUtils from 'xe-utils'

export default {
  name: 'TableExpandForm',
  components: { FormLabelGroup },
  data () {
    return {
      // 内容 list
      valueList: [],
      // 表单域/表头 list
      columnList: [],
      rmList: [], // 存放删除来款认领明细数据
      /** ********************************* */
      // 修改行 index
      editIndex: -1,
      // 表单校验错误信息
      errorStore: {},
      // 是否首次修改面板  true:只显示表单和确定按钮
      firstEditPanel: false,
      view: 'table'
    }
  },
  props: {
    itemList: {
      type: Array,
      default: () => []
    },
    selectTableData: {
      type: Array,
      default: () => []
    },
    labelWidth: {
      type: Number,
      default: 100
    },
    cols: {
      type: Number,
      default: 3
    },

    initValueList: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: true
    },
    viewType: {
      type: String,
      default: 'table'
    },
    InitErrorStore: {
      type: Object,
      default: () => {
      }
    },
    formFilterField: {
      type: String,
      default: ''
    },
    rmStatus: { // 来款明细模块引用组件标识
      type: String,
      default: ''
    },
    rlzydmmc: { // 认领人代码名称
      type: String,
      default: ''
    },
    rlbmdmmc: { // 认领部门代码名称
      type: String,
      default: ''
    },
    defaultValue: { // （添加一行或插入一行数据时）给表单赋默认值
      type: Object,
      default: () => { }
    }
  },
  computed: {
    formEditable (index) {
      return (index) => (this.editIndex === index) && this.editable
    }
  },
  watch: {
    columns () {
      this.setTableColumns()
    },

    editable (value) {
      this.editIndex = -1
      this.setTableColumns()
      if (value) {
        setTimeout(() => this.showRow(0), 20)
      }
    },

    initValueList: {
      handler (newList, oldList) {
        this.setTableData()
        if (!this.editable) {
          this.firstEditPanel = this.initValueList.length === 0
        }
      },
      deep: true

    },
    valueList: {
      handler (newList, oldList) {
        if (JSON.stringify(this.valueList) !== JSON.stringify(this.initValueList)) {
          if (!tools.isNull(this.valueList)) {
            this.$emit('on-change', clonedeep(this.valueList))
          }
        }
      },
      deep: true
    }
  },
  methods: {
    vueEnter (cache) {
      if (!cache) {
        this.setTableColumns()
        this.setTableData()
        this.firstEditPanel = this.editable
        this.view = this.viewType
      }
    },
    canOpenNewForm () {
      if (this.firstEditPanel && this.editable) {
        this.editIndex = 1
      }
      if (this.view === 'table') {
        const expandData = this.valueList.filter((row) => row._expanded)
        this.editIndex = expandData.length - 1
      }
      if (this.editIndex !== -1) {
        /* this.$Message.warning({
            content: '您有信息未确认，请确认！',
            duration: 5
          }) */
        this.$fn.warning({
          title: '警告提示',
          desc: '您有信息未确认，请确认。'
        })
      }
      return this.editIndex === -1
    },
    validate (_callback) {
      let valid = this.canOpenNewForm()
      _callback(valid)
    },
    setTableColumns () {
      this.columnList = $.extend(true, [], this.columns)
      if (this.columnList[this.columnList.length - 1]) {
        this.columnList[this.columnList.length - 1].className = 'bdr0'
      }
      for (let i = 0, len = this.columnList.length; i < len; i++) {
        const item = this.columnList[i]
        item.align = 'center'
        item.render = (h, { row, column, index }) => {
          let key = column.key
          let isJE = key !== 'DXJE' && key.includes('JE')
          let val = isJE
            ? XEUtils.commafy(row[key], { fixed: 2 })
            : row[key]
          let textAlign = isJE ? 'right' : 'left'
          return h('div', {
            style: {
              'text-align': textAlign
            }
          }, val)
        }
        item.minWidth = item.minWidth || 20
        item.ellipsis = true
        item.tooltip = true
      }
      this.columnList.splice(0, 0, {
        title: '序号',
        type: 'index',
        Width: '50',
        fixed: 'left'
      })
      if (this.editable) {
        this.columnList.push({
          title: '操作',
          key: 'action',
          slot: 'action',
          fixed: 'right',
          className: 'table-toolbar-cell',
          width: '150',
          align: 'center'
        })
      }
      this.columnList.push({
        type: 'expand',
        width: 1,
        className: '',
        slot: 'expand',
        render: (h, params) => {
          return h(FormLabelGroup, {
            props: {
              itemList: this.itemList,
              labelWidth: this.labelWidth,
              initValueList: params.row,
              editable: this.editable,
              withToolbar: true,
              formFilterField: this.formFilterField
            },
            style: {
              marginRight: '100px'
            },
            on: {
              'on-change': (valueList) => {
                this.handleRowChange(params.index, valueList)
              },
              'ok': (valueList) => {
                this.handleUpdateRow(params.index, valueList)
              },
              'no': (valueList) => {
                this.handleCancelRow(params.index, valueList)
              },
              'hkcl-on-change': (key, node) => { // 网上报销 - 还款处理，选择借款单号以后带出所有数据
                this.$emit('hkcl-on-change', key, node)
              }
            }
          })
        }
      })
      if (this.rmStatus !== '') {
        this.columnList = this.setColumnsData(this.columnList)
      }
    },
    // 处理来款认领明细，审批日志查看
    /* 递归循环表格数据 表头 */
    setColumnsData (data) {
      for (let j = 0, len = data.length; j < len; j++) {
        if (data[j].key === 'see') {
          data[j].className = 'click-td'
          data[j].render = (h, params) => {
            return h('span', {
              on: {
                click: () => {
                  this.$emit('getLog', params)
                }
              }
            }, params.row.see)
          }
        }
      }
      return data
    },
    setTableData () {
      this.errorStore = this.InitErrorStore
      if (JSON.stringify(this.valueList) !== JSON.stringify(this.initValueList)) {
        this.valueList = clonedeep(this.initValueList)
        if (this.valueList.length === 1 && this.editable) {
          this.valueList[0]._expanded = true
          // this.valueList[0].editing = true
          this.valueList[0].editing = false
        }
      }
    },
    /** ********************************************* */
    handleOneFormChange (valueList) {
      this.handleRowChange(0, clonedeep(valueList))
    },
    hkclOnChange (key, node) {
      this.$emit('hkcl-on-change', key, node)
    },
    onNewFormOk () {
      console.log(this.valueList)
      this.$refs.newFormGroup.validate((valid) => {
        if (valid) {
          this.hideRow(0)
          this.firstEditPanel = false
          // }
        } else {
          this.$fn.warning({
            title: '警告提示',
            desc: '必填项不可为空，请填写'
          })
        }
      })
    },
    /* 来款认领，增加行，从表一带数据 */
    handleAddRow (event) {
      if (!this.canOpenNewForm()) return false
      if (this.rmStatus !== '') {
        if (this.selectTableData.length === 0) {
          this.$fn.warning({
            title: '警告提示',
            desc: '请先选择一行来款明细。'
          })
        } else {
          let obj = {
            isFlag: true,
            LKBH: '',
            LKRQ: '',
            FKDWMC: '', // 付款单位名称,
            FKYHMC: '', // 付款银行名称
            LKJE: '0', // 来款金额
            RLJE: '0', // 认领金额
            XMJE: '0', // 项目金额
            XMDMMC: '', // 项目名称
            ZJLYDMMC: '', // 资金来源
            RLZYDMMC: this.rlzydmmc, // 认领人
            RLBMDMMC: this.rlbmdmmc, // 认领部门
            ZY: '', // 领用说明
            ATHXX: '', // 审核信息
            see: '查看', // 审核状态
            _expanded: true,
            editing: true
          }
          obj = Object.assign(obj, this.selectTableData[0])
          obj.LKJE = Number(this.selectTableData[0].JE.toString().replace(/,/g, ''))
          this.valueList.push(obj)
        }
      } else {
        this.valueList.push(Object.assign({}, this.defaultValue, { _expanded: true, editing: true }))
      }

      this.editIndex = this.valueList.length - 1
    },
    handleEditRow (index) {
      if (!this.canOpenNewForm()) return false
      if (this.view === 'tile') {
        this.editIndex = index
      }
      this.showRow(index)
    },
    /* 来款认领，插入行操作，从表一带数据 */
    handleInsertRow (index) {
      if (!this.canOpenNewForm()) return false
      if (this.rmStatus !== '') {
        if (this.selectTableData.length === 0) {
          this.$fn.warning({
            title: '警告提示',
            desc: '请先选择一行来款明细。'
          })
          return
        } else {
          let obj = {
            isFlag: true,
            LKBH: '',
            LKRQ: '',
            FKDWMC: '', // 付款单位名称,
            FKYHMC: '', // 付款银行名称
            LKJE: '0', // 来款金额
            RLJE: '0', // 认领金额
            XMJE: '0', // 项目金额
            XMDMMC: '', // 项目名称
            ZJLYDMMC: '', // 资金来源
            RLZYDMMC: this.rlzydmmc, // 认领人
            RLBMDMMC: this.rlbmdmmc, // 认领部门
            ZY: '', // 领用说明
            ATHXX: '', // 审核信息
            see: '查看', // 审核状态
            _expanded: true,
            editing: true
          }
          obj = Object.assign(obj, this.selectTableData[0])
          obj.LKJE = Number(this.selectTableData[0].JE.toString().replace(/,/g, ''))
          this.valueList.splice(++index, 0, obj)
        }
      } else {
        let obj = Object.assign({}, this.defaultValue, { _expanded: true, editing: true })
        this.valueList.splice(++index, 0, obj)
      }

      this.showRow(index)
    },
    handleCopyRow (index) {
      if (!this.canOpenNewForm()) return false
      let row = Object.assign({}, this.valueList[index])
      row._expanded = true
      row.editing = true
      /* 来款认领需求：通过LYBH(领用编号)，判断数据是否已经保存到库里 */
      if (this.rmStatus !== '') {
        if (row.LYBH) {
          delete row.LYBH // 领用编号
        }
      }
      this.valueList.push(row)
      this.$forceUpdate()
      // this.showRow(this.valueList.length - 1)
    },
    handleRowChange (index, valueList) {
      let oldRow = clonedeep(this.valueList[index])
      if (tools.isNull(oldRow)) {
        this.valueList[index] = valueList
        this.showRow(index)
      } else {
        let tmpRow = clonedeep(valueList)
        delete oldRow._rowKey
        delete tmpRow._rowKey
        if (JSON.stringify(tmpRow) !== JSON.stringify(oldRow)) {
          this.valueList[index] = tmpRow
          this.$emit('on-change', clonedeep(this.valueList))
          // this.showRow(index) /* 表格有多行时，1 ~ n 行 input 输入框获得一次按键输入后会失去焦点（注释该行问题解决） */
        }
      }
    },
    handleUpdateRow (index, valueList) {
      delete valueList.editing
      this.valueList[index] = valueList
      this.hideRow(index)
      this.$emit('on-ok', clonedeep(this.valueList), index)
    },
    handleCancelRow (index, valueList) {
      if (!this.valueList[index].editing) {
        this.valueList[index] = valueList || this.initValueList[index]
        this.hideRow(index)
      } else {
        this.delRow(index)
      }
    },
    /// /////////////////////////
    showRow (index) {
      this.valueList.splice()
      if (this.valueList.length > 0) {
        this.valueList[index]._expanded = true
      }
      this.editIndex = index
    },
    hideRow (index) {
      this.valueList.splice()
      this.valueList[index]._expanded = false
      this.editIndex = -1
    },
    delRow (index) {
      let tmpList = []
      if (this.valueList.length === 1) {
        // this.valueList = []
        this.initValueList = []
      } else {
        this.valueList.splice(index, 1)
        tmpList = clonedeep(this.valueList)
      }
      this.firstEditPanel = this.valueList.length === 0
      this.editIndex = -1
      this.$emit('on-del-row', this.valueList[index], tmpList)
    },
    focusUpdated ({ viewType }) {
      let _this = this
      let timeId = setTimeout(() => {
        clearTimeout(timeId)
        _this.firstEditPanel = _this.valueList.length === 0

        _this.view = viewType
      }, 5)
    },
    delAll (index) {
      for (let i = 0; i < index; i++) {
        this.valueList.splice(i)
      }
    }
  },
  /// /////////////////////////////
  mounted () {
    this.vueEnter(false)
  },
  activated () {
    this.vueEnter(!!this.$route.params.tabCache)
  }
}
</script>
