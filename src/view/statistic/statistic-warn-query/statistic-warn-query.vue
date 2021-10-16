<template>
  <plg-doc-wrapper ref="plgDoc"
                   :header-config="[]"
                   class="statistic-warn-query"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   class="toolbar"
                   @click="handleBtnClick">
      </vuc-toolbar>
    </template>
    <div class="statistic-warn-query-content">
      <page-form-table ref="xWarn"
                       :itemList="itemList"
                       :initValueList="valueList"
                       :label-width="120"
                       :cols="3"
                       :table-row-key="tableRowKey"
                       :search-field="[]"
                       :table-height='clientHeight - 100'
                       :toolbar="['search', 'refresh', 'print']"
                       :show-pager="false"
                       @formChange="formChange"
                       @handleClickSearch="handleClickSearch"
                       @on-toolbar-click="handleToolbarClick">
      </page-form-table>
      <table-page :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"></table-page>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import PageFormTable from '_c/page/page-form-table'
import TablePage from '_c/table-page'
import { getAllCsmpServer } from '@/api/auth/auth-authorize-fws'
export default {
  name: 'StatisticWarnQuery',
  components: {
    PageFormTable,
    TablePage
  },
  data () {
    return {
      btns: [
        { name: 'export', text: '导出', type: 'primary' }
      ],
      clientHeight: 0,
      itemList: [
        {
          name: 'fwnr',
          type: 'i-select',
          value: '',
          label: '机构类型',
          children: {
            type: 'i-option',
            list: []
          },
          props: {
            clearable: true
          }
        },
        {
          type: 'i-input',
          label: '单位名称',
          name: 'name',
          value: '',
          clearable: true
        },
      ],
      valueList: {},
      tableRowKey: '',
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      tableData: [],
      columns: [
        { title: '', type: 'selection', fixed: 'left', width: 36 },
        { title: '序号', type: 'index', fixed: 'left', headerAlign: 'center', width: 50 },
        { title: '单位名称', field: 'czycode', headerAlign: 'center', minWidth: 200 },
        { title: '服务商', field: 'czycode', headerAlign: 'center', minWidth: 200 },
        { title: '服务内容名称', field: 'czycode', headerAlign: 'center', minWidth: 200 },
        { title: '服务有效期间', field: 'czycode', headerAlign: 'center', minWidth: 120 },
        { title: '授权方式', field: 'czycode', headerAlign: 'center', minWidth: 120 },
        { title: '有效授权数', field: 'czycode', headerAlign: 'center', minWidth: 120 },
        { title: '已用授权数', field: 'czycode', headerAlign: 'center', minWidth: 120 },
        { title: '剩余授权数', field: 'czycode', headerAlign: 'center', minWidth: 120 },
        { title: '预警标准', field: 'czycode', headerAlign: 'center', minWidth: 120 },
        { title: '当前预警值', field: 'czycode', headerAlign: 'center', minWidth: 120 }
      ]
    }
  },
  methods: {
    handleBtnClick (item) {
      let checkedData = this.$refs.xWarn.$refs.xTable.getCheckedData()
      if (item.name === 'export') {

      }
    },
    handlePlgDocResize ({ height }) {
      this.clientHeight = height
    },
    formChange (value) {
      this.valueList = this.$utils.clone(values, true)
    },
    handleClickSearch () {
      this.getTableData()
    },
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getTableData()
      }
    },
    getTableData () {
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      this.$fn.ajax(getAllGlCzy, params, res => {
        if (res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.$refs.xWarn.loadData(this.tableData)
        }
      })
    },
    // 获取服务内容
    getAllCsmpServer () {

    },
    handlePageChange (page) {
      this.pageNum = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
  },
  created () {
    this.getAllCsmpServer()
  },
  mounted () {
    this.$refs.xWarn.loadColumn(this.columns)
  }
}
</script>

<style>

</style>
