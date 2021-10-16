<template>
  <div class="modal-select">
    <div ref="formPanel"
         class="u8-box"
         v-if="itemList.length>0">
      <div class="u8-bf1">
        <form-group class="form-group-query"
                    :item-list="itemList"
                    :initValueList="initValueList"
                    :showMore="true"
                    @on-change="formChange">
        </form-group>
      </div>
      <div class="search-right">
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
      </div>
    </div>
    <vuc-datatable ref="xTable"
                   class="table"
                   :row-key="rowKey"
                   height="320"
                   :show-pager="false"
                   @on-select="handleSelect"
                   @on-dblclick="hadledblClick">
    </vuc-datatable>
    <table-page :total="total"
                @on-change="handlePageChange"
                @on-page-size-change="handlePageSizeChange"></table-page>
    <modal-footer @handle-ok="handleOk"
                  @handle-cancel="handleCancel"></modal-footer>
  </div>
</template>

<script>
import { getTableData } from '@/api/pub/modal-table-select'
import TablePage from '_c/table-page'
import ModalFooter from '_c/modal-footer'
export default {
  name: 'Modal',
  // 循环调用组件时，组件比vue实例后创建，组件必须先于实例化引入。
  components: { TablePage, ModalFooter, FormGroup: () => import('_c/form/form-group') },
  props: {
    keys: {
      type: String,
      default: ''
    },
    rowKey: {
      type: String,
      default: ''
    },
    columns: {
      type: Array,
      default: () => []
    },
    params: {
      type: Object,
      default: () => { }
    },
    dataSource: {
      type: String,
      default: ''
    },
    pageSize: {
      type: Number,
      default: 50
    },
    itemList: {
      type: Array,
      default: () => []
    },
    initValueList: {
      type: Object,
      default: () => { }
    },
  },
  data () {
    return {
      tableData: [],
      selectData: {},
      total: 0,
      pageNum: 1
    }
  },
  mounted () {
    this.$refs.xTable.loadColumn(this.columns)
    this.getTableData()
  },
  methods: {
    formChange (val) {
      this.initValueList = val
    },
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      if (Object.keys(this.selectData).length === 0) {
        this.$fn.error({ desc: '请选择一条数据' })
      } else {
        this.$emit('complete', this.selectData)
      }
    },
    handleClickSearch () {
      this.getTableData()
    },
    getTableData () {
      let params = {
        key: this.keys,
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        ...this.params,
        ...this.initValueList
      }
      this.$fn.ajax(getTableData, params, res => {
        if (res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.$refs.xTable.loadData(this.tableData)
        }
      })
    },
    handlePageChange (page) {
      this.pageNum = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
    handleSelect ({ row }) {
      this.selectData = row
    },
    hadledblClick ({ row }) {
      this.selectData = row
      this.handleOk()
    }
  }
}
</script>

<style>

</style>
