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
      <page-form-table ref="xAuthorize"
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
    <div :class="[`${curClass}-import`]">
      <Upload ref="upload"
              :headers="headers"
              :format="format"
              :accept='".xls,.xlsx"'
              action=''
              :on-format-error="handleFormatError"
              :on-success="handleUpLoadSuccess"
              :before-upload="beforeUpload"
              v-show='false'>
      </Upload>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import PageFormTable from '_c/page/page-form-table'
import AuthorizeModal from './components/authorize-modal'
import TablePage from '_c/table-page'
import tools from '@/libs/toolutil'
import { getToken } from '@/libs/util'
import { getAllCsmpOrders, getAllAgents, getAllCsmpServer, deleteCsmpOrders, checkCanUpdate, importFile } from '@/api/auth/auth-authorize-fws'
export default {
  name: 'AuthAuthorizeFws',
  components: {
    PageFormTable,
    AuthorizeModal,
    TablePage
  },
  data () {
    return {
      btns: [
        { name: 'import', text: '导入出库明细', type: 'primary' },
        { name: 'authorize', text: '授权' },
        { name: 'delete', text: '删除' }
      ],
      powerBtns: [],
      status: 0,
      tableHeight: 0,
      sel: '',
      toolbar: ['search', 'refresh', 'print'],
      tableRowKey: '',
      curClass: 'auth-authorize-fws',
      format: ['xlsx', 'xls'],
      itemList: [{
        name: 'date',
        type: 'date-range',
        value: '',
        label: '订单日期',
        props: { type: 'daterange', clearable: true }
      },
      {
        name: 'agentName',
        type: 'tablePage',
        label: '服务商',
        rowKey: 'agentIndeid',
        columns: [
          {
            title: '服务商id',
            field: 'agentIndeid',
            align: 'left',
            headerAlign: 'center',
          },
          {
            title: '服务商名称',
            field: 'agentName',
            align: 'left',
            headerAlign: 'center',
          },
        ],
        clearable: true
      },
      {
        name: 'serviceid',
        type: 'i-select',
        value: '',
        label: '服务内容',
        children: {
          type: 'i-option',
          list: []
        },
        props: {
          clearable: true
        }
      }],
      valueList: {
        date: [],
        agentName: '',
        serviceid: -1
      },
      labelWidth: 80,
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
          title: '出库单号',
          field: 'odoId',
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
          title: '授权服务',
          field: 'servicename',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '订单日期',
          field: 'odotime',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '用户名称',
          field: 'customerShortname',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '序列号',
          field: 'serialNumber',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '订单属性',
          field: 'ordertype',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '订购套数',
          field: 'ordernumber',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '订购授权数',
          field: 'authoriznumber',
          align: 'left',
          headerAlign: 'center',
        },
        {
          title: '授权次数',
          field: 'orderpages',
          align: 'right',
          headerAlign: 'center',
        },
        {
          title: '剩余授权次数',
          field: 'remainingpages',
          align: 'right',
          headerAlign: 'center',
        }
      ],
      tableData: [],
      fwnrList: [],
      total: 0,
      pageNum: 1,
      pageSize: this.$store.state.app.pageSize
    }
  },
  computed: {
    headers () {
      return { 'Authorization': getToken() }
    }
  },
  methods: {
    handlePlgDocResize ({ height }) {
      this.clientHeight = height
    },
    handleBtnClick (item) {
      let checkedData = this.$refs.xAuthorize.$refs.xTable.getCheckedData()
      if (item.name === 'authorize') {
        this.openModal('add', this.fwnrList)
      } else if (item.name === 'delete') {
        if (checkedData.length > 0) {
          this.deleteData(checkedData)
        } else {
          this.$fn.error({
            title: '错误提示',
            desc: '请勾选操作数据'
          })
        }
      } else if (item.name === 'import') {
        this.$refs.upload.handleClick()
      }
    },
    beforeUpload (file) {
      let params = {
        file: file
      }
      let newParams = this.utilTransformData(params)
      importFile(newParams).then(res => {
        const _this = this
        let result = {}
        let reader = new FileReader();
        reader.readAsText(res, 'utf-8');
        reader.onload = function () {
          if (reader.result.includes('{"status":500,"msg":')) {
            result = JSON.parse(reader.result)
          }
          if (result.status !== 500) {
            if (res.size > 0) {
              _this.$fn.warning({ desc: '部分数据导入失败或存在提示信息，详情查看导入结果' })
              _this.downloadFile(res)
            } else if (res.size === 0) {
              _this.$fn.success({ desc: '导入成功' })
            }
            _this.getTableData()
          } else {
            _this.$fn.error({ desc: result.msg })
          }
        }
      })
      return false
    },
    downloadFile (content) {
      let blob = new Blob([content])
      const fileName = `导入结果.xlsx`
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
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getTableData()
      }
    },
    handleClickSearch () {
      this.getTableData()
    },
    formChange (values, key, list) {
      this.valueList = this.$utils.clone(values, true)
      if (!this.valueList.agentName) {
        delete this.valueList.agentIndeid
      }
    },
    checkBeforeDel (checkedData) {
      let validate = true
      let targetArray = []
      checkedData.forEach(item => {
        if (item.isimport === '1') {
          targetArray.push(item.odoId)
        }
      })
      if (targetArray.length > 0) {
        validate = false
        this.$fn.error({ title: '警告', desc: `导入的文件不允许删除，出库单号如下${targetArray.join(',')}` })
      }
      return validate
    },
    openModal (status, fwnrList, orderId) {
      const _this = this
      _this.$modal({
        title: '授权给服务商',
        resize: false,
        showFooter: false,
        width: 1000,
        height: 470,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(AuthorizeModal, {
                props: {
                  status,
                  fwnrList,
                  orderId
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
        startDate: this.valueList.date[0] ? this.valueList.date[0].replace(/-/g, '') : '',
        endDate: this.valueList.date[1] ? this.valueList.date[1].replace(/-/g, '') : '',
        agentIndeid: this.valueList.agentIndeid ? this.valueList.agentIndeid : null, // 服务商id
        serviceid: this.valueList.serviceid, // 服务内容代码
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }
      this.$fn.ajax(getAllCsmpOrders, params, res => {
        if (res && res.status === 200) {
          this.tableData = res.data.list
          this.total = res.data.total
        }
        this.$refs.xAuthorize.loadData(this.tableData)
      })
    },
    getColumns () {
      this.columns.map(item => {
        if (item.field === 'odoId') {
          item.slots = {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickDJBH(row)} domPropsInnerHTML={row.odoId}></span>]
            }
          }
        } else if (item.field === 'odotime') {
          item.formatter = ({ row, rowIndex, column, columnIndex }) => {
            if (row.hasOwnProperty(column.property) && row[column.property]) {
              if (row[column.property].indexOf('-') !== -1) {
                return row[column.property]
              } else {
                return tools.dealDate(row[column.property], 'yyyy-MM-dd')
              }
            }
          }
        }
        if (!item.fixed && item.type !== 'tools') {
          item['minWidth'] = '135'
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
      this.$refs.xAuthorize.loadColumn(this.columns)
    },
    async handleRowToolbarClick (key, row) {
      if (key === 'update') {
        if (row.isimport === '1') {
          this.$fn.error({ title: '警告', desc: '导入的订单不允许修改' })
        } else {
          let flag = await this.checkBeforeOperate(row)
          if (flag) {
            this.openModal('update', this.fwnrList, row.orderId)
          }
        }
      } else if (key === 'delete') {
        this.deleteData(row)
      }
    },
    // 获取服务商
    getAllAgents () {
      return new Promise((resolve, reject) => {
        this.$fn.ajax(getAllAgents, {}, res => {
          if (res.status === 200) {
            this.itemList[1].children.list = res.data.list.map(item => {
              return {
                value: item.agentIndeid,
                title: item.agentName
              }
            })
            this.itemList[1].children.list.unshift({ value: -1, title: '所有' })
            resolve(true)
          } else {
            this.$fn.error({ title: '失败提示', desc: res.msg })
          }
        })
      })
    },
    // 获取服务内容
    getAllCsmpServer () {
      return new Promise((resolve, reject) => {
        this.$fn.ajax(getAllCsmpServer, {}, res => {
          if (res.status === 200) {
            this.itemList[2].children.list = res.data.map(function (item) {
              return {
                value: item.serviceid,
                title: item.servicename
              }
            })
            this.fwnrList = this.$utils.clone(this.itemList[2].children.list, true)
            this.itemList[2].children.list.unshift({ value: -1, title: '所有' })
            resolve(true)
          } else {
            this.$fn.error({ title: '失败提示', desc: res.msg })
          }
        })
      })
    },
    deleteData (values) {
      this.$Modal.confirm({
        title: '提示',
        content: '确认要删除吗？',
        onOk: () => {
          let data = Array.isArray(values) ? values : [values]
          let params = {
            orderIds: data.map(item => item.orderId)
          }
          this.$fn.ajax(deleteCsmpOrders, params, res => {
            if (res.status === 200) {
              this.$fn.success({ title: '成功提示', desc: '删除成功' })
              this.getTableData()
            }
          })
        }
      })
    },
    handleFormatError () {
      return this.$fn.error({ title: '失败提示', desc: '请上传正确的文件类型' })
    },
    handleUpLoadSuccess (res) {
      if (res && res.status === 200) {
        this.$fn.success({ title: '成功提示', desc: res.msg })
        this.getTableData()
      }
    },
    clickDJBH (row) {
      this.openModal('readOnly', this.fwnrList, row.orderId)
    },
    checkBeforeOperate (values) {
      let params = {
        orderId: values.orderId
      }
      return checkCanUpdate(params).then(res => {
        if (res && res.status === 200) {
          if (!res.data.canUpdate) {
            this.$fn.error({ title: '失败提示', desc: '出库单已被使用，不允许修改' })
            return false
          }
          return true
        }
      })
    },
    handlePageChange (page) {
      this.pageNum = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
    utilTransformData (data) {
      let formData = new FormData()
      Object.keys(data).map(key => {
        formData.append(key, data[key])
      })
      return formData
    }
  },
  created () {
    // this.getAllAgents()
    this.getAllCsmpServer()
  },
  mounted () {
    this.getColumns()
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './auth-authorize-fws.less';
</style>
