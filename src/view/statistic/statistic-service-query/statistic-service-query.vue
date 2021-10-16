<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="statistic-service-query"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   class="toolbar"
                   @click="handleVucBtnClick">
      </vuc-toolbar>
    </template>
    <template slot="filterGroup">
      <div class="filter-wrap">
        <div class="filter-item">
          查验时间：
          <DatePicker v-model="filter.date"
                      style="width: 200px"
                      type="daterange"></DatePicker>
        </div>
        <div class="filter-item">
          单位名称：
          <modal-table-select :value="filter.customerName"
                              :item="dwItem"
                              @on-change="handleDwChange"></modal-table-select>
        </div>
        <div class="filter-item">
          查验结果：
          <Input v-model="filter.msg"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          查验人：
          <modal-table-select :value="filter.czyName"
                              :item="czyItem"
                              @on-change="handleCzyChange"></modal-table-select>
        </div>
        <div class="filter-item">
          <Button type="primary"
                  class="search-btn"
                  @click="handleSearchClick">查询</Button>
        </div>
      </div>
    </template>
    <div class="statistic-service-query-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="statisticServiceQuery"
                     :show-toolbar="true"
                     :toolbar="['search', 'refresh', 'print']"
                     :show-pager="false"
                     :height="tableHeight"
                     @on-checked="handleChecked"
                     @on-toolbar-click="handleToolbarClick">
        <div class="table-slot">
          授权总数：{{totalNum}} 剩余授权数：{{remainingNum}}
        </div>
      </vuc-datatable>
      <table-page :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"></table-page>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import TablePage from '_c/table-page'
import ModalTableSelect from '_c/table/modal-table-select'
import { getRemainingNum, getCsmpChecks } from '@/api/statistic/statistic-service-query'
export default {
  name: 'StatisticServiceQuery',
  components: { TablePage, ModalTableSelect },
  data () {
    return {
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        // { code: 'add', text: '新增', type: 'primary' },
        // { code: 'del', text: '删除' }
      ],
      dwItem: {
        key: 'customerNameRole',
        title: '单位名称',
        formWidth: 200,
        rowKey: 'customerCode',
        columns: [
          { type: 'index', title: '序号', width: '40', fixed: 'left' },
          { title: '单位编码', field: 'customerCode', headerAlign: 'center', width: 240 },
          { title: '单位名称', field: 'customerName', headerAlign: 'center', width: 240 },
          { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
        ],
        params: {}
      },
      czyItem: {
        key: 'czyId',
        title: '查验人',
        formWidth: 200,
        rowKey: 'czyId',
        columns: [
          { type: 'index', title: '序号', width: '40', fixed: 'left' },
          { title: '单位名称', field: 'indename', headerAlign: 'center', width: 240 },
          { title: 'ID', field: 'id', headerAlign: 'center', width: 240 },
          { title: '名称', field: 'name', headerAlign: 'center', 'min-width': 120 }
        ],
        params: {}    
      },
      filter: {},
      totalNum: 0, //授权总数
      // 剩余授权数
      remainingNum: 0,
      tableHeight: 0,
      column: [
        { type: 'index', title: '序号', width: '40', fixed: 'left' },
        { title: '查验时间', field: 'checktime', headerAlign: 'center', width: 180, formatter: this.formatDate },
        { title: '查验人', field: 'checkperson', headerAlign: 'center', width: 120 },
        { title: '发票代码', field: 'invoiceCode', headerAlign: 'center', 'min-width': 150 },
        { title: '发票号码', field: 'invoiceNo', headerAlign: 'center', 'min-width': 150 },
        { title: '单位名称', field: 'customerName', headerAlign: 'center', 'min-width': 150 },
        { title: '查验结果', field: 'msg', headerAlign: 'center', 'min-width': 150 },
        { title: '是否计费', field: 'jf', headerAlign: 'center', width: 80 }
      ],
      tableData: [],
      checkData: []
    }
  },
  methods: {
    handlePageChange (page) {
      this.pageNum = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
    handlePlgDocResize ({ height }) {
      this.tableHeight = height - 50 - 40
    },
    handleVucBtnClick (item) {
      this[item.code]()
    },
    handleDwChange (data) {
      this.filter = { ...this.filter, customerName: data.customerName, customerIndeid: data.customerIndeid }
    },
    handleCzyChange (data) {
      this.filter = { ...this.filter, czyName: data.name, czyId: data.id }
    },
    // 表头处理时间
    formatDate ({ row, rowIndex, column, columnIndex }) {
      let tmpDate = row[column.property]
      let tmpStr = ''
      if (tmpDate) {
        tmpStr = tmpDate.substr(0, 4) + '-' + tmpDate.substr(4, 2) + '-' + tmpDate.substr(6, 2)
      }
      return tmpStr
    },
    handleSearchClick () {
      this.getTableData()
    },
    // 表格选中事件
    handleChecked () {
      this.checkData = this.$refs.xTable.getCheckedData()
    },
    // 表格刷新打印按钮事件
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getTableData()
      }
    },
    dealTable () {
      this.$refs.xTable.loadColumn(this.column)
      this.$refs.xTable.loadData(this.tableData)
    },
    getTableData () {
      // { startDateTime, endDateTime, customerIndeid, msg }
      let params = { ...this.filter, pageNum: this.pageNum, pageSize: this.pageSize }
      params.startDateTime = params.date[0] ? this.$utils.toDateString(params.date[0], 'yyyyMMddHHmmss') : ''
      let date = params.date[1] ? new Date(new Date(new Date(params.date[1]).toLocaleDateString()).getTime()+24*60*60*1000-1) : ''
      params.endDateTime = this.$utils.toDateString(date, 'yyyyMMddHHmmss')
      getRemainingNum({}).then(res => {
        if (res && res.status === 200) {
          this.remainingNum = res.data.remaining
          this.totalNum = res.data.total
        }
      })
      getCsmpChecks(params).then(res => {
        if (res && res.status === 200) {
          this.total = res.data.total
          this.tableData = res.data.list
          this.dealTable()
        }
      })
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style lang="less">
.statistic-service-query {
  .filter-wrap {
    display: flex;
    justify-content: space-between;
  }
  .table-slot {
    margin-left: 8px;
    font-weight: 700;
  }
}
</style>
