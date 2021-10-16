<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="auth-distribute"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   :status='curTab ? curTab : "0"'
                   class="toolbar"
                   @click="handleVucBtnClick">
      </vuc-toolbar>
    </template>
    <template slot="filterGroup">
      <div class="filter-wrap">
        <div class="filter-item">
          出库单时间：
          <DatePicker v-model="filter.date"
                      class="width200"
                      type="daterange"></DatePicker>
        </div>
        <div class="filter-item">
          服务内容：
          <Select v-model="filter.serviceid"
                  clearable
                  style="width: 200px">
            <Option v-for="item in fwnrArr"
                    :key="`option-fwnr-${item.serviceid}`"
                    :value="item.serviceid"
                    :label="item.servicename"></Option>
          </Select>
        </div>
        <div class="filter-item">
          出库单号：
          <Input v-model="filter.odoId"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          <Button type="primary"
                  class="search-btn"
                  @click="handleSearchClick">查询</Button>
        </div>
      </div>
    </template>
    <div class="auth-distribute-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="AuthStribute"
                     :tabs="tabs"
                     active-tab="0"
                     :show-toolbar="true"
                     :toolbar="['search', 'refresh', 'print']"
                     :show-pager="false"
                     :height="tableHeight"
                     @on-tab-click="handleTabClick"
                     @on-checked="handleChecked"
                     @on-toolbar-click="handleToolbarClick">
      </vuc-datatable>
      <table-page :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"></table-page>
    </div>
    <Modal v-model="showModal"
           title="授权分发"
           :footer-hide="true"
           fullscreen>
      <distribute-modal :modal-data="modalData"
                        :cur-tab="curTab"
                        v-if="showModal"
                        @close="showModal = false"></distribute-modal>
    </Modal>
  </plg-doc-wrapper>
</template>

<script>
import TablePage from '_c/table-page'
import { getAllCsmpServer, getCsmpAgentOrders, authorizeBatch } from '@/api/auth/auth-distribute'
import DistributeModal from './distribute-modal';
export default {
  name: 'AuthDistribute',
  components: { DistributeModal, TablePage },
  data () {
    return {
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        { code: 'distribute', text: '授权分发', type: 'primary', status: [1] },
        // { code: 'batch', text: '批量授权', status: [1] } //暂时隐藏
      ],
      fwnrArr: [],
      filter: {
        date: [],
        serviceid: 'all',
        odoId: ''
      },
      showModal: false,
      tabs: [
        { label: '所有', name: '0' },
        { label: '可授权', name: '1' },
        { label: '已授权', name: '2' }
      ],
      curTab: 0,
      tableHeight: 0,
      checkData: [],
      tableData: [],
      modalData: {}
    }
  },
  computed: {
    searchParams () {
      return {
        startDate: this.$utils.toDateString(this.filter.date[0], 'yyyyMMdd'),
        endDate: this.$utils.toDateString(this.filter.date[1], 'yyyyMMdd'),
        serviceid: this.filter.serviceid === 'all' ? '' : this.filter.serviceid,
        odoId: this.filter.odoId,
        mode: this.curTab
      }
    },
    column () {
      let tmpArr = [
        { type: 'selection', title: ' ', width: '40', fixed: 'left' },
        {
          title: '出库单号',
          field: 'odoId',
          headerAlign: 'center',
          width: 120,
          slots: {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickDJBH(row)} domPropsInnerHTML={row.odoId}></span>]
            }
          }
        },
        { title: '服务商', field: 'agentShortname', headerAlign: 'center', width: 160 },
        { title: '授权服务', field: 'servicename', headerAlign: 'center', width: 120 },
        { title: '单位名称', field: 'customerName', headerAlign: 'center', width: 240 },
        { title: '授权次数', field: 'orderpages', align: 'right', headerAlign: 'center', width: 100 },
        { title: '剩余授权次数', field: 'remainingpages', align: 'right', headerAlign: 'center', width: 100 },
        { title: '激活日期', field: 'vildatebegindate', headerAlign: 'center', width: 120 },
        { title: '失效日期', field: 'vildateenddate', headerAlign: 'center', width: 120 },
        { title: '制单日期', field: 'createtime', headerAlign: 'center', width: 120 },
        { title: '订购套数', field: 'ordernumber', headerAlign: 'center', width: 120 },
        { title: '已分发数量', field: 'alloordernumber', headerAlign: 'center', width: 120 },
        { title: '待分发数量', field: 'remainintnumber', headerAlign: 'center', width: 120 },
        { title: '备注', field: 'remark', headerAlign: 'center' }
        // { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
      ]
      if (this.curTab === 1 || this.curTab === 2) {
        let tip = this.curTab === 1 ? '修改' : '查看'
        let icon = this.curTab === 1 ? 'tools-icon-default icon-edit' : 'tools-icon-default icon-show'
        tmpArr.push({
          title: '操作',
          type: 'tools',
          headerAlign: 'center',
          width: 40,
          fixed: 'right',
          slots: {
            default: ({ row, rowIndex, column }, h) => {
              let toolBtn = [
                <span class={icon} v-tip={tip} type="text" onClick={() => { this.handleChangeClick({ row, rowIndex, column }) }}></span>
              ]
              return toolBtn
            }
          }
        })
      }
      return tmpArr
    }
  },
  watch: {
    showModal (val) {
      if (!val) {
        this.getTableData()
      }
    }
  },
  methods: {
    handlePlgDocResize ({ height }) {
      this.tableHeight = height - 50 - 40
    },
    handlePageChange (page) {
      this.pageNum = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
    clickDJBH (row) {
      this.modalData = { ...row, onlyView: true }
      this.showModal = true
    },
    // 头部按钮组
    handleVucBtnClick (item) {
      this[item.code]()
    },
    dealTable () {
      this.$refs.xTable.loadColumn(this.column)
      this.$refs.xTable.loadData(this.tableData)
    },
    // 表格查询
    getTableData () {
      let params = this.$utils.clone(this.searchParams, true)
      params.pageNum = this.pageNum
      params.pageSize = this.pageSize
      getCsmpAgentOrders(params).then(res => {
        this.tableData = res.data.list
        this.total = res.data.total
        this.checkData = []
        this.dealTable()
      })
    },
    // 页签切换
    handleTabClick (status) {
      this.curTab = status - 0
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
    // 表格行内编辑
    handleChangeClick ({ row, rowIndex, column }) {
      this.modalData = { ...row }
      this.showModal = true
    },
    // 条件查询
    handleSearchClick () {
      this.getTableData()
    },
    // 授权分发
    distribute () {
      if (this.checkData.length === 0) {
        this.$fn.warning({ desc: '请先选择需要授权的单据' })
        return
      }
      this.modalData = { ...this.checkData[0] }
      this.showModal = true
    },
    // 批量授权
    batch () {
      if (this.checkData.length === 0) {
        this.$fn.warning({ desc: '请先选择需要授权的单据' })
        return
      }
      let data = this.checkData.filter(v => v.ordernumber === 1)
      if (data.length === 0) {
        this.$fn.warning({ desc: '选中的数据不符合批量授权规范' })
        return
      }
      let orderIds = []
      this.checkData.map(v => {
        orderIds.push(v.orderId)
      })
      authorizeBatch({ orderIds }).then(res => {
        if (res.status === 200) {
          this.$fn.success({ desc: '批量授权成功' })
          this.getTableData()
        }
      })
    }
  },
  async mounted () {
    await getAllCsmpServer().then(res => {
      this.fwnrArr = res.data
      this.fwnrArr.unshift({ serviceid: 'all', servicename: '所有' })
    })
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './auth-distribute.less';
</style>
