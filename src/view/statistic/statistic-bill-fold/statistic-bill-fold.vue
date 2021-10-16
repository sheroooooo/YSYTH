<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="statistic-bill-fold"
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
          票据类型：
          <Select v-model="filter.pid"
                  clearable
                  style="width: 200px">
            <Option v-for="item in pjlxArr"
                    :key="`opt-pjlx-${item.pid}`"
                    :value="item.pid"
                    :label="item.pname"></Option>
          </Select>
        </div>
        <div class="filter-item">
          开票时间：
          <DatePicker v-model="filter.date"
                      class="width200"
                      type="daterange"></DatePicker>
        </div>
        <!-- <div class="filter-item">
          单位名称:
          <modal-table-select :value="filter.customerName"
                              :item="customerItem"
                              @on-change="handleCustomerChange"></modal-table-select>
        </div> -->
        <div class="filter-item">
          票据代码：
          <Input v-model="filter.fpdm"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          所属单位：
          <Select v-model="filter.customerIndeid"
                  clearable
                  style="width: 200px"
                  @on-change="handleSelectChange">
            <Option v-for="item in customArr"
                    :key="item.customerIndeid"
                    :value="item.customerIndeid"
                    :label="item.customerName"></Option>
          </Select>
        </div>
        <div class="filter-item">
          <Button type="primary"
                  class="search-btn"
                  @click="handleSearchClick">查询</Button>
        </div>
      </div>
    </template>
    <div class="statistic-bill-fold-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="StatisticBillFold"
                     :show-toolbar="true"
                     :tabs="tabsData"
                     :active-tab="activeTab"
                     :toolbar="['search', 'refresh', 'print']"
                     :show-pager="false"
                     :height="tableHeight"
                     :row-class-name="rowClassName"
                     @on-tab-click='getActiveTab'
                     @on-checked="handleChecked"
                     @on-toolbar-click="handleToolbarClick">
      </vuc-datatable>
      <table-page :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"></table-page>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import TablePage from '_c/table-page'
import { getFplxs, getFps, exportFpData, getUserCustomers, checkInvoicesBatch } from '@/api/statistic/statistic-bill-fold'
export default {
  name: 'StatisticBillFold',
  components: { TablePage },
  data () {
    return {
      gsdm: this.$store.state.app.env.gsdm,
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        { code: 'exp', text: '导出', type: 'primary' },
        { code: 'checkSel', text: '批量查验' }
      ],
      tabsData: [
        { label: '所有', name: '2' },
        { label: '未导出', name: '0' },
        { label: '已导出', name: '1' }
      ],
      activeTab: '2',
      pjlxArr: [],
      customArr: [], //所属单位
      filter: {},
      tableHeight: 0,
      column: [
        { type: 'selection', title: ' ', width: '40', fixed: 'left' },
        { title: '票据类型', field: 'fplx', headerAlign: 'center', width: 160 },
        {          title: '票据代码', field: 'fpdm', headerAlign: 'center', width: 120,
          slots: {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.handleClickPJDM(row)} domPropsInnerHTML={row[column.property]}></span>]
            }
          }
        },
        { title: '票据号码', field: 'fphm', headerAlign: 'center', width: 120 },
        { title: '开票时间', field: 'kprq', headerAlign: 'center', width: 120, formatter: this.formatDate },
        { title: '价税合计', field: 'jshj', headerAlign: 'center', width: 120, align: 'right', formatter: this.formatMoney },
        // { title: '票据属性', field: 'dgts', headerAlign: 'center', width: 120 },
        { title: '费用性质', field: 'billname', headerAlign: 'center', width: 120 },
        { title: '费用明细', field: 'billdetail', headerAlign: 'center', 'min-width': 120 },
        { title: '提交人', field: 'czyname', headerAlign: 'center', width: 120 },
        { title: '所属单位', field: 'customerName', headerAlign: 'center', width: 180 },
        { title: '验真时间', field: 'checktime', headerAlign: 'center', width: 180 },
        { title: '事由', field: 'billbagname', headerAlign: 'center', width: 120 },
        { title: '验真状态', field: 'yzzt', headerAlign: 'center', width: 120 },
        { title: '票据来源', field: 'fply', headerAlign: 'center', width: 120 },
        { title: '导出次数', field: 'fileexportcount', headerAlign: 'center', width: 120 }
        // { title: '查验人', field: 'czyname', headerAlign: 'center', 'min-width': 120 }
      ],
      tableData: [],
      checkData: [],
      customerItem: {
        key: 'customerName',
        title: '单位名称',
        formWidth: 200,
        rowKey: 'groupId',
        columns: [
          { type: 'index', title: '序号', width: '40', fixed: 'left' },
          { title: '单位代码', field: 'customerCode', headerAlign: 'center', width: 240 },
          { title: '单位名称', field: 'customerName', headerAlign: 'center', width: 240 },
          { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
        ],
        params: {}
      }
    }
  },
  methods: {
    getActiveTab (activeTab) {
      this.activeTab = activeTab
      this.getTableData()
    },
    handleSelectChange () {
      this.getTableData()
    },
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
    handleCustomerChange () {
      this.filter = { ...this.filter, customerName: data.customerName, customerIndeid: data.customerIndeid }
    },
    handleVucBtnClick (item) {
      this[item.code]()
    },
    downloadFile (content) {
      let blob = new Blob([content])
      const fileName = `票据信息.ufgov`
      if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else { // IE10+下载
        navigator.msSaveBlob(blob, fileName)
      }
    },
    exp () {
      if (!this.filter.customerIndeid) {
        this.$fn.warning({ desc: '导出前请选择所属单位' })
        return
      }
      if (this.checkData.length === 0) {
        this.$fn.warning({ desc: '导出前请选择要导出的票据' })
        return
      }
      let fpids = []
      this.checkData.map(v => {
        fpids.push(v.fpid)
      })
      exportFpData({ fpids }).then(res => {
        const _this = this
        let result = {}
        let reader = new FileReader();
        reader.readAsText(res, 'utf-8');
        reader.onload = function () {
          if (reader.result.includes('{"status":500,"msg":')) {
            result = JSON.parse(reader.result)
          }
          if (result.status !== 500) {
            _this.downloadFile(res)
            _this.getTableData()
          } else {
            _this.$fn.error({ desc: result.msg })
          }
        }
      })
    },
    // 二次批量查验发票
    checkSel () {
      if (this.checkData.length === 0) {
        this.$fn.warning({ desc: '请选择要查验的票据！' })
        return
      }
      if (this.checkData.length > 9) {
        this.$fn.warning({ desc: '一次只能选择9张票据，请重新选择！' })
        return
      }
      let fps = []
      this.checkData.map(v => {
        let params = {}
        this.$set(params, 'gsdm', this.gsdm)
        this.$set(params, 'fpid', v.fpid)
        this.$set(params, 'invoiceNo', v.fphm)
        this.$set(params, 'invoiceCode', v.fpdm)
        this.$set(params, 'invoiceDate', v.kprq)
        this.$set(params, 'invoiceSum', v.hjje)
        this.$set(params, 'verifyCode', v.jym.substring(v.jym.length - 6))
        fps.push(params)
      })
      checkInvoicesBatch({ 'fps': fps }).then(res => {
        const _this = this
        if (res && res.status === 200) {
          if (Object.keys(res.data).length == 0) {
            _this.$fn.success({ desc: res.msg })
            _this.getTableData()
          } else {
            let message = ''
            let data = res.data
            for (var key in data) {
              let obj = _this.checkData.find(item => item.fpid === key)
              if (obj) {
                message += '发票号码为' + obj.fphm + '的发票：' + data[key] + '\n'
              }
            }
            _this.$modal.confirm({
              title: '错误提示',
              message: message,
              events: {
                confirm () {
                  _this.getTableData()
                },
                cancel () {
                }
              }
            })
          }
        } else {
          _this.$fn.error({ desc: res.msg })
          _this.getTableData()
        }
      })
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
    // 表头处理金额
    formatMoney ({ row, rowIndex, column, columnIndex }) {
      let tmpNum = this.$utils.commafy(row[column.property], { fixed: 2 })
      if (tmpNum === '0.00') {
        return ''
      } else {
        return tmpNum
      }
    },
    rowClassName ({ row }) {
      if (row.yzzt === '验真失败') {
        return 'col-alert'
      }
    },
    dealTable () {
      this.$refs.xTable.loadColumn(this.column)
      this.$refs.xTable.loadData(this.tableData)
    },
    getTableData () {
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        fileexport: Number(this.activeTab),
        ...this.filter
      }
      params.startDate = this.$utils.toDateString(this.filter.date[0], 'yyyyMMdd')
      params.endDate = this.$utils.toDateString(this.filter.date[1], 'yyyyMMdd')
      getFps(params).then(res => {
        if (res && res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.dealTable()
          this.checkData = []
        }
      })
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
    handleClickPJDM (row) {
      let { fpid, fpdm, fphm } = row
      this.$router.push({
        name: 'BillViewModal',
        params: {
          id: row.fpid,
          fpid,
          title: '票据详情信息'
        }
      })
    }
  },
  async mounted () {
    await getFplxs({}).then(res => {
      this.pjlxArr = res.data
    })
    await getUserCustomers({}).then(res => {
      this.customArr = res.data
    })
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './statistic-bill-fold.less';
</style>
