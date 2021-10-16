<template>
  <plg-doc-wrapper ref="plgDoc"
                   :header-config="[]"
                   :class="[`${curClass}`]"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   :powers="powerBtns"
                   :status='status'
                   class="toolbar"
                   @click="handleBtnClick">
      </vuc-toolbar>
    </template>
    <div :class="[`${curClass}-content`]">
      <page-form-table ref="xCompany"
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
import tools from '@/libs/toolutil'
import CompanyModal from './components/company-modal'
import TablePage from '_c/table-page'
import { getAllCustomersList, deleteCsmpCustomer, getProviderAndAgentByID } from '@/api/base/base-company-set'
export default {
  name: 'BaseCompanySet',
  components: {
    PageFormTable,
    CompanyModal,
    TablePage
  },
  data () {
    return {
      btns: [
        { name: 'add', text: '新增', type: 'primary' },
        { name: 'delete', text: '删除' }
      ],
      powerBtns: [],
      status: 0,
      tableHeight: 0,
      sel: '',
      toolbar: ['search', 'refresh', 'print'],
      tableRowKey: '',
      curClass: 'base-company-set',
      valueList: {
        agentIndeid: '',
        customerName: '',
        customerCode: ''
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
          title: '单位序列号',
          field: 'customerCode',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '单位名称',
          field: 'customerName',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '服务商',
          field: 'agentName',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '单位负责人',
          field: 'leader',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '冻结状态',
          field: 'statusCode',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '备注',
          field: 'remark',
          align: 'left',
          headerAlign: 'center',
        }
      ],
      tableData: [],
      total: 400,
      curPage: 1,
      pageSize: this.$store.state.app.pageSize,
      fwsArr: [],
    }
  },
  computed: {
    itemList () {
      let arr = [{
        name: 'agentIndeid',
        type: 'i-select',
        value: '',
        label: '服务商',
        children: {
          type: 'i-option',
          list: this.fwsArr
        },
        props: {
          clearable: true
        }
      },
      {
        name: 'customerName',
        type: 'i-input',
        value: '',
        label: '单位名称'
      },
      {
        name: 'customerCode',
        type: 'i-input',
        value: '',
        label: '单位编码'
      }]
      return arr
    }
  },
  methods: {
    handlePlgDocResize ({ height }) {
      this.clientHeight = height
    },
    handleBtnClick (item) {
      let checkedData = this.$refs.xCompany.$refs.xTable.getCheckedData()
      if (item.name === 'add') {
        this.openModal('add')
      } else if (item.name === 'delete') {
        if (checkedData.length > 0) {
          this.deleteData(checkedData)
        } else {
          this.$fn.error({
            title: '错误提示',
            desc: '请勾选操作数据'
          })
        }
      }
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
    openModal (status, row = {}) {
      const _this = this
      _this.$modal({
        title: status === 'add' ? '新增单位' : status === 'update' ? '修改单位' : '单位信息',
        resize: false,
        showFooter: false,
        width: 1000,
        height: 430,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(CompanyModal, {
                props: {
                  status,
                  formData: row
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
        customerCode: this.valueList.customerCode,
        customerName: this.valueList.customerName,
        agentIndeid: this.valueList.agentIndeid,
        pageNum: this.curPage,
        pageSize: this.pageSize
      }
      this.$fn.ajax(getAllCustomersList, params, res => {
        if (res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
          this.$refs.xCompany.loadData(this.tableData)
        }
      })
    },
    getColumns () {
      this.columns.map(item => {
        if (item.field === 'customerCode') {
          item.slots = {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickDJBH(row)} domPropsInnerHTML={row.customerCode}></span>]
            }
          }
        } else if (item.field === 'statusCode') {
          item.formatter = this.formatterDJZT()
        }
        if (!item.fixed && item.type !== 'tools') {
          item['minWidth'] = '120'
        }
      })
      let operateColumn = {
        type: 'tools',
        title: '操作',
        width: '140',
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
      this.$refs.xCompany.loadColumn(this.columns)
    },
    formatterDJZT () {
      return ({ row, rowIndex, column, columnIndex }) => {
        if (row[column.property] === '2') {
          return '未冻结'
        } else if (row[column.property] === '3') {
          return '冻结'
        }
      }
    },
    handleRowToolbarClick (key, row) {
      if (key === 'update') {
        this.openModal('update', row)
      } else if (key === 'delete') {
        this.deleteData(row)
      }
    },
    deleteData (values) {
      this.$Modal.confirm({
        title: '提示',
        content: '确认要删除吗？',
        onOk: () => {
          let data = Array.isArray(values) ? values : [values]
          let params = {
            idList: data.map(item => item.customerIndeid)
          }
          this.$fn.ajax(deleteCsmpCustomer, params, res => {
            if (res.status === 200) {
              this.getTableData()
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
    getProviderAndAgentByID () {
      this.$fn.ajax(getProviderAndAgentByID, {}, res => {
        if (res.status === 200) {
          this.fwsArr = res.data.map(v => {
            return {
              value: v.agentIndeid.toString(),
              title: v.agentName
            }
          })
        }
      })
    }
  },
  mounted () {
    this.getColumns()
    this.getProviderAndAgentByID()
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './base-company-set.less';
</style>
