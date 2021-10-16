/**
 * @name: 监控预警
 * @description:
 * @author: zhaozhz
 * @date: 2021-09-30
 * @last modified by: zhaozhz
 * @last modified time: 2021-09-30
 */
<template>
  <plg-doc-wrapper ref="plgDoc"
                   :header-config="['dw']"
                   class="elec-bill"
                   @on-resize="handlePlgDocResize">
    <div class="statistic-bill-fold-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="StatisticBillFold"
                     :show-toolbar="true"
                     :toolbar="['search', 'refresh']"
                     :show-pager="false"
                     :height="tableHeight"
                     @on-toolbar-click="handleToolbarClick">
      </vuc-datatable>
      <table-page :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"></table-page>
    </div>
  </plg-doc-wrapper>
</template>
<script>
import mixin from '@/libs/app-mixin'
import TablePage from '_c/table-page'
import { getWarnInvoices } from '@/api/statistic/statistic-warn-data'
export default {
  name: 'WarnData',
  components: { TablePage },
  data () {
    return {
      baseParams: {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        zth: this.$store.getters.env.zth,
        gnfldm: this.$route.params.gnflDm
      },
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      tableHeight: 100,
      tableData: [],
      tableColumns: [
        { type: 'index', title: '序号', width: '50', fixed: 'left', isSlots: true, headerAlign: 'center', align: 'center' },
        { title: '票据类型', field: 'fplx', headerAlign: 'center', width: 160 },
        { title: '票据代码', field: 'fpdm', headerAlign: 'center', width: 120,
          slots: {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.handleClickPJDM(row)} domPropsInnerHTML={row[column.property]}></span>]
            }
          }
        },
        { title: '票据号码', field: 'fphm', headerAlign: 'center', width: 120 },
        { title: '开票时间', field: 'kprq', headerAlign: 'center', width: 120, formatter: this.formatDate },
        { title: '价税合计', field: 'jshj', headerAlign: 'center', width: 120, align: 'right', formatter: this.formatMoney },
        { title: '费用性质', field: 'billname', headerAlign: 'center', width: 120 },
        { title: '费用明细', field: 'billdetail', headerAlign: 'center', 'min-width': 120 },
        { title: '提交人', field: 'czyname', headerAlign: 'center', width: 120 },
        { title: '所属单位', field: 'customerName', headerAlign: 'center', width: 180 },
        { title: '验真时间', field: 'checktime', headerAlign: 'center', width: 180 },
        { title: '事由', field: 'billbagname', headerAlign: 'center', width: 120 },
        { title: '验真状态', field: 'yzzt', headerAlign: 'center', width: 120 },
        { title: '票据来源', field: 'fply', headerAlign: 'center', width: 120 },
        { title: '导出次数', field: 'fileexportcount', headerAlign: 'center', width: 120 }
      ]
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
    },
    /**
     * @description: 获取表格数据
     * */
    getWarnInvoices () {
      let params = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd
      }
      this.$fn.ajax(getWarnInvoices, params, res => {
        if (res.status === 200 && res.data) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.dealTable()
        }
      })
    },
    dealTable () {
      this.$refs.xTable.loadColumn(this.tableColumns)
      this.$refs.xTable.loadData(this.tableData)
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
    /* 页面大小调整,内部计算高度 */
    handlePlgDocResize ({ height }) {
      this.tableHeight = height - 40
    },
    // 表格右侧功能,name为返回的功能值  refresh:刷新 imp：导出 exp：导入
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getWarnInvoices()
      }
    }
  },
  async mounted () {
    this.getWarnInvoices()
  },
  mixins: [mixin]
}
</script>