<!-- 公用组件：表格分页
  /**
      * @param {Array} [columns]     - 表头 [必须]
      * @param {Array} [data]        - 表格数据 [必须]
      * @param {Number} [height]     - 表格高度 [必须]
      * @param {Event} [@selectionChange]  - 选中行回调
               selectionChange(val)父组件接受入参
               返回数据格式：[{},{},{}]    已经选中的行数据
  */
-->
<template>
  <div class="data-table"
       :style="{height:`${height+30}px`}">
    <Table :columns='columns'
           :data='pageData'
           :height="height"
           size="small"
           stripe
           highlight-row
           border
           @on-row-click="selectionclick"
           @on-row-dblclick="selectiondblclick"
           @on-selection-change="selectionChange"
           @on-select="handleSelect"
           @on-select-cancel='handleSelectCancel'
           @on-select-all="handleSelectAll"
           @on-select-all-cancel="handleSelectAllCancle"
           ref="outgoodsTable">
      <template slot-scope="{ row, index }"
                slot="action">
        <Icon type="ios-create"
              style="cursor: pointer;"
              v-on:click.stop="editorTableData(row)"
              size="20" />
      </template>
    </Table>
    <Page v-if="showPage"
          :class="{fixedPage: isFixedPage}"
          :style="{width: computedWidth()}"
          :total="dataTotal"
          :isWebPage="isWebPage"
          :current="current"
          show-elevator
          show-sizer
          show-total
          size="small"
          @on-change="getCurrent"
          @on-page-size-change="changeSizer">
      <slot></slot>
    </Page>
  </div>
</template>

<script>
import clonedeep from 'clonedeep'
export default {
  name: 'TablePage',
  data () {
    return {
      dataTotal: 0,
      pageSize: 10,
      pageData: [],
      selectData: []
    }
  },
  props: {
    columns: { // 表头
      type: Array,
      default: () => []
    },
    data: { // 表格数据
      type: Array,
      default: () => []
    },
    /* height: { // 表格外部整体高度
      type: Number,
      default: 400
    }, */
    showPage: {
      type: Boolean,
      default: true
    },
    current: { // 当前页数
      type: Number,
      default: 1
    },
    isFixedPage: { // 是否固定分页为底部
      type: Boolean,
      default: true
    },
    height: {
      type: Number | String,
      default: '-'
    },
    totalNumber: { // 后台分页的数据总和
      type: Number | String,
      default: '0'
    },
    isWebPage: { // 是否前台分页
      type: Boolean,
      default: true
    }
  },

  watch: {
    data () {
      this.setInitData()
    },
    current (val) {
      this.changePage(val)
    }
  },
  created () {
    this.setInitData()
  },
  methods: {
    hasCheckbox () {
      let checkColumns = this.columns.filter(item => item.type === 'selection')
      return checkColumns.length > 0
    },
    computedWidth () {
      if (this.$refs.outgoodsTable) {
        return this.$refs.outgoodsTable.$el.clientWidth ? `${this.$refs.outgoodsTable.$el.clientWidth}px` : '100%'
      }
      return window.innerWidth
    },

    /* 初始化表格data长度 */
    setInitData () {
      if (this.isWebPage) {
        this.dataTotal = this.data.length
        // 初始化显示，小于每页显示条数，全显，大于每页显示条数，取前每页条数显示
        if (this.data.length < this.pageSize || !this.showPage) {
          this.pageData = this.data
        } else {
          this.pageData = this.data.slice(0, this.pageSize)
        }
      } else { // 后台分页
        this.pageData = this.data
        this.dataTotal = this.totalNumber
      }
    },

    /* 改变页码,重新绑定table显示数据 */
    changePage (index) {
      var _start = (this.current - 1) * this.pageSize
      var _end = this.current * this.pageSize
      this.pageData = this.data.slice(_start, _end)
      this.$emit('selectionChange', [])
    },

    getCurrent (val) {
      this.$emit('on-page-change', val)
    },

    /* 切换每页条数时的回调 */
    changeSizer (index) {
      this.pageSize = index
      this.changePage(this.pageNum)
      this.$emit('on-pagesize-change', this.pageSize)
    },

    /* 选中项改变回调 */
    selectionChange (selection) {
      this.selectData = clonedeep(selection)
      this.$emit('selectionChange', this.selectData)
    },
    selectionclick (selection) {
      if (!this.hasCheckbox()) { // 单选
        let list = []
        list.push(selection)
        this.selectData = list
        this.$emit('selectionChange', this.selectData)
      } else {
        return false
      }
    },
    selectiondblclick (selection) {
      this.$emit('selectiondblclick', selection)
    },
    handleSelectCancel (selection, row) {
      this.$emit('on-table-select-cancel', row)
    },
    handleSelect (selection, row) {
      this.$emit('on-table-select', row)
    },
    handleSelectAll (selection) {
      this.$emit('on-table-select-all', selection)
    },
    handleSelectAllCancle (selection, row) {
      this.$emit('on-table-select-all-cancle', selection)
    },
    editorTableData (row) {
      this.$emit('editorTable', row, 'amend')
    }
  }
}
</script>
<style scoped>
  @import './data-table.less';
</style>
