<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="base-service-set"
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
          服务商编码：
          <Input v-model="filter.agentCode"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          服务商名称：
          <Input v-model="filter.agentName"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          所属运营商：
          <modal-table-select :value="filter.providerName"
                              :item="yysItem"
                              @on-change="handleYysChange"></modal-table-select>
        </div>
        <div class="filter-btn">
          <Button type="primary"
                  class="search-btn"
                  @click="handleSearchClick">查询</Button>
        </div>
      </div>
    </template>
    <div class="base-service-set-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="BaseServiceSet"
                     :show-toolbar="true"
                     :toolbar="['search', 'refresh', 'print']"
                     :show-pager="false"
                     :height="tableHeight"
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
import ModalTableSelect from '_c/table/modal-table-select'
import ServiceSetModal from './service-set-modal'
import { getAllAgentsList, deleteCsmpAgent } from '@/api/base/base-service-set'
export default {
  name: 'BaseServiceSet',
  components: { TablePage, ModalTableSelect },
  data () {
    return {
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        { code: 'add', text: '新增', type: 'primary' },
        { code: 'imp', text: '导入' },
        { code: 'del', text: '删除' }
        // { code: 'print', text: '打印' }
      ],
      yysItem: {
        key: 'providerName',
        title: '运营商名称',
        formWidth: 200,
        rowKey: 'providerCode',
        columns: [
          { type: 'index', title: '序号', width: '40', fixed: 'left' },
          { title: '运营商编码', field: 'providerCode', headerAlign: 'center', width: 240 },
          { title: '运营商名称', field: 'providerName', headerAlign: 'center', width: 240 },
          { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
        ],
        params: {}
      },
      filter: {},
      tableHeight: 0,
      column: [
        { type: 'selection', title: ' ', width: '40', fixed: 'left' },
        { title: '服务商编码', field: 'agentCode', headerAlign: 'center', width: 120 },
        { title: '服务商名称', field: 'agentName', headerAlign: 'center', width: 240 },
        { title: '负责人', field: 'leader', headerAlign: 'center', width: 120 },
        { title: '电话', field: 'telnumber', headerAlign: 'center', width: 120 },
        { title: '地址', field: 'address', headerAlign: 'center', width: 200 },
        { title: '所属运营商', field: 'providerName', headerAlign: 'center', width: 240 },
        { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 },
        {
          title: '操作',
          type: 'tools',
          headerAlign: 'center',
          width: 80,
          fixed: 'right',
          slots: {
            default: ({ row }, h) => {
              let toolBtn = [
                <span class='tools-icon-default icon-edit' v-tip={'修改'} type="text" onClick={() => { this.edit(row) }}></span>,
                <span class='tools-icon-default icon-delete' v-tip={'删除'} type="text" onClick={() => { this.del(row) }}></span>
              ]
              return toolBtn
            }
          }
        }
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
    handleYysChange (data) {
      this.filter = { ...this.filter, providerName: data.providerName, providerIndeid: data.providerIndeid }
    },
    add () {
      let actionFlag = 'S'
      const _this = this
      this.$modal({
        title: '新增服务商',
        resize: false,
        showFooter: false,
        width: 1000,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(ServiceSetModal, {
                props: {
                  actionFlag
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete () {
                    _this.getTableData()
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    edit (row) {
      let actionFlag = 'M'
      const _this = this
      this.$modal({
        title: '修改服务商',
        resize: false,
        showFooter: false,
        width: 1000,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(ServiceSetModal, {
                props: {
                  actionFlag,
                  row
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete () {
                    _this.getTableData()
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    imp () {

    },
    del (row) {
      if (!row && this.checkData.length === 0) {
        this.$fn.warning({ desc: '请选择要删除的数据' })
        return
      }
      let idList = []
      if (row) {
        idList.push(row.agentIndeid)
      } else {
        this.checkData.map(v => {
          idList.push(v.agentIndeid)
        })
      }
      let info = row ? '当前服务商' : '当前选中的服务商'
      const _this = this
      this.$modal.confirm({
        title: '删除服务商',
        message: `删除服务商会将该单位下的操作员全部删除，请慎重操作\n是否要删除${info}？`,
        zIndex: 99999,
        events: {
          confirm () {
            deleteCsmpAgent({ idList }).then(() => {
              _this.$fn.success({ desc: '删除服务商成功' })
              _this.getTableData()
            })
          }
        }
      })
    },
    print () {

    },
    dealTable () {
      this.$refs.xTable.loadColumn(this.column)
      this.$refs.xTable.loadData(this.tableData)
    },
    getTableData () {
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        ...this.filter
      }
      getAllAgentsList(params).then(res => {
        this.tableData = res.data.list
        this.total = res.data.total
        this.dealTable()
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
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './base-service-set.less';
</style>
