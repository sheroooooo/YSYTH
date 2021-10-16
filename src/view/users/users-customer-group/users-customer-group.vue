<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="users-customer-group"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   class="toolbar"
                   @click="handleVucBtnClick">
      </vuc-toolbar>
    </template>
    <div class="users-customer-group-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="UsersCustomerGroup"
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
import TablePage from '_c/table-page'
import CustomerGroupSet from './customer-group-set'
import { getCsmpGroups, deleteCsmpGroup } from '@/api/users/users-customer-group'
export default {
  name: 'UsersCustomerGroup',
  components: { TablePage },
  data () {
    return {
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        { code: 'add', text: '新增', type: 'primary' }
      ],
      tableHeight: 0,
      column: [
        { type: 'index', title: '序号', headerAlign: 'center', width: '80', fixed: 'left' },
        { title: '单位组代码', field: 'groupId', headerAlign: 'center', 'min-width': 120 },
        { title: '单位组名称', field: 'name', headerAlign: 'center', 'min-width': 120 },
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
      tableData: []
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
      this.tableHeight = height - 50
    },
    handleVucBtnClick (item) {
      this[item.code]()
    },
    add () {
      let actionFlag = 'S'
      const _this = this
      this.$modal({
        title: '新增单位组',
        resize: false,
        showFooter: false,
        width: 1000,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(CustomerGroupSet, {
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
      const _this = this
      this.$modal({
        title: '修改单位组',
        resize: false,
        showFooter: false,
        width: 1000,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(CustomerGroupSet, {
                props: {
                  actionFlag,
                  row
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
      const _this = this
      this.$modal.confirm({
        title: '删除单位组',
        message: `确定要删除当前单位组吗？`,
        zIndex: 99999,
        events: {
          confirm () {
            deleteCsmpGroup({ groupId: row.groupId }).then(res => {
              if (res && res.status === 200) {
                _this.$fn.success({ desc: '删除单位组成功' })
                _this.getTableData()
              }
            })
          }
        }
      })
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
      let params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      getCsmpGroups(params).then(res => {
        if (res && res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
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
@import './users-customer-group.less';
</style>
