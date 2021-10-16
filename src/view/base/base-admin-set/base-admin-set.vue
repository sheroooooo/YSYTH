<template>
  <plg-doc-wrapper ref="plgDoc"
                   :header-config="[]"
                   :class="[`${curClass}`]"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   :status='status'
                   class="toolbar"
                   @click="handleBtnClick">
      </vuc-toolbar>
    </template>
    <div :class="[`${curClass}-content`]">
      <page-form-table ref="xAdmin"
                       :itemList="itemList"
                       :initValueList="valueList"
                       :label-width="labelWidth"
                       :cols="cols"
                       :table-row-key="tableRowKey"
                       :search-field="searchField"
                       :table-height='clientHeight - 100'
                       :toolbar="toolbar"
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
import AdminModal from './components/admin-modal'
import TablePage from '_c/table-page'
import tools from '@/libs/toolutil'
import { getAllGlCzy, deleteGlCzy } from '@/api/base/base-admin-set'
export default {
  name: 'BaseAdminSet',
  components: {
    PageFormTable,
    AdminModal,
    TablePage
  },
  data () {
    return {
      btns: [
        { name: 'add', text: '新增', type: 'primary' }
        // { name: 'delete', text: '删除' } 管理员不允许批量删除
      ],
      status: 0,
      tableHeight: 0,
      sel: '',
      toolbar: ['search', 'refresh', 'print'],
      tableRowKey: '',
      curClass: 'base-admin-set',
      itemList: [
        {
          type: 'i-input',
          label: '管理员代码',
          name: 'czycode',
          value: '',
          clearable: true
        },
        {
          type: 'i-input',
          label: '管理员姓名',
          name: 'name',
          value: '',
          clearable: true
        },
        {
          name: 'roleid',
          type: 'i-select',
          value: '',
          label: '机构类型',
          children: {
            type: 'i-option',
            list: [{
              value: '2',
              title: '运营商'
            },
            {
              value: '3',
              title: '服务商'
            }]
          },
          props: {
            clearable: true
          }
        }
      ],
      valueList: {
        czycode: '',
        name: '',
        roleid: ''
      },
      labelWidth: 120,
      cols: 3,
      searchField: [],
      clientHeight: 100,
      columns: [
        {
          title: '',
          fixed: 'left',
          width: 36,
          type: 'selection'
        },
        {
          title: '序号',
          fixed: 'left',
          align: 'left',
          headerAlign: 'center',
          width: 50,
          type: 'index'
        },
        {
          title: '管理员代码',
          field: 'czycode',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '管理员姓名',
          field: 'name',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '机构类型',
          field: 'rolename',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '所属机构',
          field: 'indename',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '手机号码',
          field: 'phonenumber',
          align: 'left',
          headerAlign: 'center',
        }
      ],
      tableData: [],
      total: 400,
      curPage: 1,
      pageSize: this.$store.state.app.pageSize
    }
  },
  methods: {
    handlePlgDocResize ({ height }) {
      this.clientHeight = height
    },
    handleBtnClick () {
      this.openModal('add')
    },
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getTableData()
      }
    },
    handleClickSearch () {
      this.getTableData()
    },
    formChange (values) {
      this.valueList = this.$utils.clone(values, true)
    },
    openModal (status, row) {
      const _this = this
      _this.$modal({
        title: status === 'add' ? '新增管理员' : '修改管理员',
        resize: false,
        showFooter: false,
        width: 1000,
        height: 330,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(AdminModal, {
                props: {
                  status,
                  params: status === 'add' ? {} : { id: row.id }
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (val) {
                    $modal.close()
                    _this.getTableData()
                  },
                }
              })
            ]
          }
        }
      })
    },
    getTableData () {
      let params = {
        czycode: this.valueList.czycode,
        name: this.valueList.name,
        roleid: Number(this.valueList.roleid),
        pageNum: this.curPage,
        pageSize: this.pageSize
      }
      this.$fn.ajax(getAllGlCzy, params, res => {
        if (res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.$refs.xAdmin.loadData(this.tableData)
        }
      })
    },
    getColumns () {
      this.columns.map(item => {
        if (item.field === 'czycode') {
          item.slots = {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickDJBH(row)} domPropsInnerHTML={row.czycode}></span>]
            }
          }
        }
        if (!item.fixed && item.type !== 'tools') {
          item['minWidth'] = '120'
        }
      })
      let operateColumn = {
        type: 'tools',
        title: '操作',
        width: 80,
        headerAlign: 'center',
        align: 'center',
        fixed: 'right',
        slots: {
          default: ({ row, rowIndex, column }, h) => {
            let toolBtn = [
              {
                key: 'update',
                class: 'icon-edit',
                tip: '编辑'
              },
              {
                key: 'delete',
                class: 'icon-delete',
                tip: '删除'
              },

            ]
            let toolsColumn = []
            toolBtn.forEach((el, index) => {
              let key = el.key
              let styleClass = `tools-icon-default ${el.class}`
              toolsColumn.push(<span class={styleClass} v-tip={el.tip} type="text"
                onClick={() => this.handleRowToolbarClick(el.key, row)}></span>)
            })
            return toolsColumn
          }
        }
      }
      this.columns.push(operateColumn)
      this.$refs.xAdmin.loadColumn(this.columns)
    },
    handleRowToolbarClick (key, row) {
      if (key === 'update') {
        this.openModal('update', row)
      } else if (key === 'delete') {
        row.roleid === 2 ? this.$fn.warning({ title: '警告', desc: '当前为运营商，不允许删除' }) : this.deleteData(row)
      }
    },
    deleteData (values) {
      this.$Modal.confirm({
        title: '提示',
        content: '确认要删除吗？',
        onOk: () => {
          let params = {}
          params.id = values['id']
          this.$fn.ajax(deleteGlCzy, params, res => {
            if (res && res.status === 200) {
              this.$fn.success({ desc: '删除成功' })
              this.getTableData()
            } else {
              this.$fn.error({ desc: res.msg })
            }
          })
        }
      })
    },
    clickDJBH (row) {
      this.openModal('readOnly', row)
    },
    handlePageChange (page) {
      this.curPage = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
  },
  created () {
  },
  mounted () {
    this.getColumns()
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './base-admin-set.less';
</style>
