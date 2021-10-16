<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="base-operator-set"
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
          运营商编码：
          <Input v-model="filter.providerCode"
                  clearable
                  style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          运营商名称：
          <Input v-model="filter.providerName"
                  clearable
                  style="width: 200px">
          </Input>
        </div>
        <div class="filter-btn">
          <Button type="primary"
                  class="search-btn"
                  @click="handleSearchClick">查询</Button>
        </div>
      </div>
    </template>
    <div class="base-operator-set-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="BaseOperatorSet"
                     :show-toolbar="true"
                     :show-pager="false"
                     :toolbar="['search', 'refresh', 'print']"
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
import OperatorSetModal from './operator-set-modal'
import { getAllCsmpProviders, deleteCsmpProviders } from '@/api/base/base-operator-set'
export default {
  name: 'BaseOperatorSet',
  components: { TablePage },
  data () {
    return {
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        { code: 'add', text: '新增', type: 'primary' },
        // { code: 'edit', text: '修改' },
        { code: 'del', text: '删除' }
        // { code: 'print', text: '打印' }
      ],
      filter: {},
      tableHeight: 0,
      column: [
        { type: 'selection', title: ' ', width: '40', fixed: 'left' },
        { title: '运营商编码', field: 'providerCode', headerAlign: 'center', width: 240 },
        { title: '运营商名称', field: 'providerName', headerAlign: 'center', width: 240 },
        // { title: '归属地', field: 'zdrq', headerAlign: 'center', width: 240 },
        // { title: '上级运营商', field: 'dgts', headerAlign: 'center', width: 240 },
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
    add () {
      let actionFlag = 'S'
      const _this = this
      this.$modal({
        title: '新增运营商',
        resize: false,
        showFooter: false,
        width: 1000,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(OperatorSetModal, {
                props: {
                  actionFlag
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete () {
                    $modal.close()
                    _this.getTableData()
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
      let providerIndeid = row.providerIndeid
      const _this = this
      this.$modal({
        title: '修改运营商',
        resize: false,
        showFooter: false,
        width: 1000,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(OperatorSetModal, {
                props: {
                  actionFlag,
                  providerIndeid
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete () {
                    $modal.close()
                    _this.getTableData()
                  }
                }
              })
            ]
          }
        }
      })
    },
    del (row) {
      if (!row && this.checkData.length === 0) {
        this.$fn.warning({ desc: '请选择要删除的数据' })
        return
      }
      const _this = this
      let info = row ? '当前运营商' : '当前选中的运营商'
      this.$modal.confirm({
        title: '删除运营商',
        message: `删除运营商会将该单位下的操作员全部删除，请慎重操作\n是否要删除${info}？`,
        zIndex: 99999,
        events: {
          confirm () {
            _this.doDel(row)
          }
        }
      })
    },
    doDel (row) {
      let providerIndeids = []
      if (row) {
        providerIndeids.push(row.providerIndeid)
      } else {
        this.checkData.map(v => {
          providerIndeids.push(v.providerIndeid)
        })
      }
      deleteCsmpProviders({ providerIndeids }).then(res => {
        if (res && res.status === 200) {
          this.getTableData()
          this.$fn.success({ desc: '删除运营商成功' })
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
        providerCode: this.filter.providerCode,
        providerName: this.filter.providerName,
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      getAllCsmpProviders(params).then(res => {
        if (res && res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.dealTable()
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
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './base-operator-set.less';
</style>
