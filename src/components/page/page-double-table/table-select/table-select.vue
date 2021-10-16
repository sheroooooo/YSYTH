<template>
  <div class="modal-table">
    <Input v-model="inputValue"
           @on-blur="handleInputBlur(inputValue)"
           :maxlength="name==='PJHS'?100:40">
      <Icon @click.native="handleBtnClick()"
            type="ios-more"
            slot="suffix" />
    </Input>
    <Modal scrollable
           :title="title"
           class-name="vertical-center-modal"
           v-model="modal"
           @on-ok='handleOkClick()'>
      <div>
        <vuc-datatable ref="xTable"
                       :height=400
                       :toolbar="toolbar"
                       show-toolbar
                       :row-key='name==="PJHS"?name:"YSPZ"'
                       @on-select="handleSelect"
                       @on-dblclick="hadledblClick">
        </vuc-datatable>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
  name: 'TableSelect',
  data () {
    return {
      toolbar: ['search'],
      modal: false,
      pjhsColumns: [
        { field: 'PJHS', title: '票据号数', headerAlign: 'center', width: 187 },
        { field: 'PJLX', title: '票据类型', headerAlign: 'center', width: 188 },
        { field: 'PMJE', title: '票面金额', align: 'right', headerAlign: 'center', formatter: this.formatMoney(), width: 188 }
      ],
      yspzhColumns: [
        { field: 'YSPZ', title: '原始单据号', headerAlign: 'center', width: 120 },
        { field: 'ZY', title: '摘要', headerAlign: 'center', width: 150 },
        { field: 'JD', title: '借贷', headerAlign: 'center', width: 80 },
        { field: 'JE', title: '金额', headerAlign: 'center', formatter: this.formatMoney(), width: 130, align: 'right' },
        { field: 'XMDM', title: '项目', headerAlign: 'center', width: 150 },
        { field: 'WLDRQ', title: '往来单据日期', headerAlign: 'center', formatter: this.formatDate(), width: 120, align: 'right' }
      ],
      inputValue: '',
      input: '',
      data: []
    }
  },
  props: {
    title: {
      type: String, // 弹出框标头
      default: ''
    },
    width: { // 模态框宽度
      type: Number,
      default: 600
    },
    name: { // key 区分获取表格数据接口
      type: String,
      default: 'PJHS'
    },
    tableData: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: ''
    },
    parentData: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    formatMoney () {
      return ({ row, rowIndex, column, columnIndex }) => {
        return this.$utils.commafy(row[column.property], { fixed: 2 })
      }
    },
    formatDate () {
      return ({ row, rowIndex, column, columnIndex }) => {
        let tmpDate = row[column.property]
        let tmpStr = ''
        if (tmpDate) {
          tmpStr = tmpDate.substr(0, 4) + '-' + tmpDate.substr(4, 2) + '-' + tmpDate.substr(6, 2)
        }
        return tmpStr
      }
    },
    handleInputBlur (val) {
      this.$emit('on-change', val, this.name)
    },
    handleOkClick () {
      this.inputValue = this.input
      this.$emit('on-change', this.inputValue, this.name)
      this.modal = false
    },
    handleBtnClick () {
      this.modal = true
    },
    handleSelect ({ row }) {
      this.input = this.name === 'YSPZH' ? this.$utils.text(row['YSPZ']) : this.$utils.text(row[this.name])
    },
    hadledblClick ({ row }) {
      this.inputValue = this.name === 'YSPZH' ? this.$utils.text(row['YSPZ']) : this.$utils.text(row[this.name])
      this.$emit('on-change', this.inputValue, this.name)
      this.modal = false
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.name === 'PJHS') {
        this.$refs.xTable.loadColumn(this.pjhsColumns)
      } else if (this.name === 'YSPZH') { // 账务模块 预收账款备查簿 原始凭证号
        this.$refs.xTable.loadColumn(this.yspzhColumns)
      }
    })
  },
  watch: {
    tableData: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            if (this.name === 'PJHS' || this.name === 'YSPZH') { // 账务模块 预收账款备查簿 原始凭证号
              this.data = this.tableData
              this.$refs.xTable.loadData(this.data)
            }
          })
        }
      },
      deep: true
    },
    value () {
      if (this.inputValue !== this.value) {
        this.inputValue = this.value
      }
    }
  }
}

</script>

<style lang="less">
  @import 'table-select.less';
</style>
