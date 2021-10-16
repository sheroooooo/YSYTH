<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="users-management"
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
          所属单位：
          <Input v-model="filter.indename"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          用户名：
          <Input v-model="filter.name"
                 clearable
                 style="width: 200px">
          </Input>
        </div>
        <div class="filter-item">
          手机号：
          <Input v-model="filter.phonenumber"
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
    <div class="users-management-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="UsersManagement"
                     :show-toolbar="true"
                     :toolbar="['search', 'refresh', 'print']"
                     :show-pager="false"
                     :height="tableHeight"
                     :cell-class-name="cellClassName"
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
import UsersSetModal from './users-set-modal'
import { getUsers } from '@/api/users/users-management'
export default {
  name: 'UsersManagement',
  components: { TablePage },
  data () {
    return {
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize,
      btns: [
        { code: 'add', text: '新增', type: 'primary' },
        // { code: 'auth', text: '查看服务授权', type: 'primary' },
        // { code: 'del', text: '删除' }
      ],
      filter: {},
      tableHeight: 0,
      column: [
        { type: 'selection', title: ' ', width: '40', fixed: 'left' },
        { title: '用户代码', field: 'czycode', headerAlign: 'center', 'min-width': 120 },
        { title: '用户名', field: 'name', headerAlign: 'center', 'min-width': 120 },
        { title: '手机号', field: 'phonenumber', headerAlign: 'center', 'min-width': 120 },
        {
          title: '是否票据管理员',
          field: 'manager',
          headerAlign: 'center',
          width: 70,
          slots: {
            default: ({ row, column }, h) => {
              if (row.manager === '1') {
                return [<span><Tag color="warning" domPropsInnerHTML={'是'}></Tag></span>]
              } else {
                return [<span><Tag color="default" domPropsInnerHTML={'否'}></Tag></span>]
              }

            }
          }
        },
        {
          title: '管理单位组',
          field: 'groupName',
          headerAlign: 'center',
          'min-width': 120,
          slots: {
            default: ({ row, column }, h) => {
              let name = row.groupName
              return name ? [<span><Tag color="cyan" domPropsInnerHTML={name}></Tag></span>] : ''
            }
          }
        },
        { title: '所属单位', field: 'indename', headerAlign: 'center', 'min-width': 180 },
        { title: '备注', field: 'bz', headerAlign: 'center', 'min-width': 120 },
        {
          title: '操作',
          type: 'tools',
          headerAlign: 'center',
          width: 40,
          fixed: 'right',
          slots: {
            default: ({ row }, h) => {
              let toolBtn = [
                <span class='tools-icon-default icon-edit' v-tip={'修改'} type="text" onClick={() => { this.edit(row) }}></span>
                // <span class='tools-icon-default icon-delete' v-tip={'删除'} type="text" onClick={() => { this.del(row) }}></span>
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
        title: '新增用户',
        resize: false,
        showFooter: false,
        width: 1100,
        height: 350,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(UsersSetModal, {
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
    auth () {

    },
    edit (row) {
      let actionFlag = 'M'
      const _this = this
      this.$modal({
        title: '修改用户',
        resize: false,
        showFooter: false,
        width: 1100,
        height: 380,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(UsersSetModal, {
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
      if (!row && this.checkData.length === 0) {
        this.$fn.warning({ desc: '请选择要删除的数据' })
        return
      }
      const _this = this
      this.$modal.confirm({
        title: '删除用户',
        message: `确定要删除当前用户吗？`,
        zIndex: 99999,
        events: {
          confirm () {

          }
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
      getUsers(params).then(res => {
        if (res && res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.dealTable()
        }
      })
    },
    cellClassName ({ row, rowIndex, column, columnIndex }) {
      if (column.property === 'manager' || column.property === 'groupName') {
        return 'col-alert'
      }
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './users-management.less';
</style>
