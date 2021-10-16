<template>
  <div>
    <div style="border-bottom:1px #ddd solid;background:#f5f5f5;height:80px;">
      <Button type="primary">主按钮样式</Button>
      <Button style="margin-left:15px;">按钮样式</Button>
    </div>
    <vuc-datatable v-show="false"
                   ref="xTable"
                   :tabs="tabs"
                   table-id="datatableDemo"
                   :search-props="['name','age']"
                   :height="300"
                   sum-field="amt"
                   show-toolbar
                   show-pager
                   @on-tab-click="handleTabClick"
                   @on-toolbar-click="handleToolbarClick"
                   @on-select="handleSelect"
                   @on-checked="handleChecked"
                   @on-dblclick="hadledblClick">
    </vuc-datatable>
  </div>
</template>
<script>
import * as XEUtils from 'xe-utils'
var list = []
var size = 100
for (var i = 0; i < size; i++) {
  var dt = XEUtils.toDateString(new Date((new Date()).getTime() + i * 24 * 60 * 60 * 1000))
  list.push({ name: '第' + i + '行', age: i, sex: i % 2 === 0 ? '男' : '女', amt: i, address: '北清路海淀区68号', date: dt })
}
const tabs = [{ label: '所有', name: '-1' }, { label: '未审核', name: '0' }, { label: '已审核', name: '1' }]
//
export default {
  name: 'DataTableDemo',
  data () {
    return {
      tableData: list,
      filterName: '',
      tabs: tabs,
      columns: [
        { type: 'index', title: ' ', width: '40', fixed: 'left' },
        { type: 'selection', title: ' ', width: '36', fixed: 'left' },
        {
          field: 'name',
          title: '姓名',
          sortable: true, // 是否排序
          width: '200',
          fixed: 'left',
          /* slots: {
            default: ({ row, rowIndex, column, columnIndex }, h) => {
              let hText = `<span style="color:red;">${row[column.property]}</span>`
              return [
                < span onClick={() => this.clickEvent(row, column)} domPropsInnerHTML={hText}> {row.name} {row.age}</span >
              ]
            }
          }, */
          formatter: ({ row, rowIndex, column, columnIndex }) => {
            return row.name + ' ' + row.age
          }

        },
        { field: 'age',
          title: '年龄',
          width: '100',
          sortable: true,
          filters: [{ label: '年龄10', value: 10 }, { label: '年龄40', value: 40 }],
          slots: {
            default: ({ row, rowIndex, column, columnIndex }, h) => {
              return [
                h('span', {
                  domProps: {
                    innerHTML: row[column.property]
                  },
                  on: {
                    click: () => this.addressClickEvent(row)
                  }
                })
              ]
            }
          }

        },
        {
          field: 'sex',
          title: '性别',
          width: 60,
          filterType: 'input'
        },
        { field: 'amt',
          title: '金额',
          width: '200',
          headerAlign: 'left',
          align: 'right',
          filterType: 'numberrange',
          formatter: ({ row, rowIndex, column, columnIndex }) => {
            return XEUtils.commafy(row[column.property], { fixed: 2 })
          }
        },
        { field: 'date',
          title: '日期',
          width: '200',
          filterType: 'daterange'
        },
        { title: '测试多表头',
          children: [
            { title: '列1', field: 'test1', 'min-width': '100' },
            { title: '列2', field: 'test2', 'min-width': '100' }
          ]
        }
      ],
      columns1: [
        { type: 'index', title: ' ', width: '40', fixed: 'left' },
        { type: 'selection', title: ' ', width: '36', fixed: 'left' },
        {
          field: 'name',
          title: '姓名',
          sortable: true, // 是否排序
          width: '200',
          fixed: 'left',
          formatter: ({ row, rowIndex, column, columnIndex }) => {
            return row.name + ' ' + row.age
          }

        },
        { field: 'age',
          title: '年龄',
          width: '100',
          sortable: true,
          filters: [{ label: '年龄10', value: 10 }, { label: '年龄40', value: 40 }],
          slots: {
            default: ({ row, rowIndex, column, columnIndex }, h) => {
              return [
                h('span', {
                  domProps: {
                    innerHTML: row[column.property]
                  },
                  on: {
                    click: () => this.addressClickEvent(row)
                  }
                })
              ]
            }
          }

        },

        { field: 'amt',
          title: '金额',
          width: '200',
          headerAlign: 'left',
          align: 'right',
          filterType: 'numberrange',
          formatter: ({ row, rowIndex, column, columnIndex }) => {
            return XEUtils.commafy(row[column.property], { fixed: 2 })
          }
        },

        { title: '测试多表头',
          children: [
            { title: '列1', field: 'test1', 'min-width': '100' },
            { title: '列2', field: 'test2', 'min-width': '100' },
            { title: '列3', field: 'test3', 'min-width': '100' }
          ]
        },
        { title: '操作',
          width: '100',
          fixed: 'right',
          slots: {
            default: ({ row, column }, h) => {
              return [
                <vxe-button type="text" onClick={() => this.clickEvent(row, column)}>增加</vxe-button>,
                <vxe-button type="text" onClick={() => this.clickEvent(row, column)}>删除</vxe-button>
              ]
            }
          }

        }
      ]
    }
  },
  methods: {
    clickEvent (row, column) {
      this.$XMsg.alert(`${column.title}点击事件`)
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      console.log(row)
    },
    handleChecked (row) {
      console.log(row)
    },
    hadledblClick ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      console.log(row)
    },
    /// //////////////////////////////////////
    handleTabClick (name) {
      console.log(name)
    },
    handleToolbarClick (name) {
      console.log(name)
    },
    /// /////////////
    getTableData () {
      console.log(this.$refs.xTable.getTableData())
    },
    getCheckedData () {
      console.log(this.$refs.xTable.getCheckedData())
    },
    checkedAll () {
      this.$refs.xTable.setAllChecked(true)
    },
    uncheckedAll () {
      this.$refs.xTable.setAllChecked(false)
    },
    setRowsChecked (rows, checked) {
      this.$refs.xTable.setRowsChecked(rows, checked)
    },
    methodsChecked (checked) {
      this.$refs.xTable.setRowsChecked((item) => {
        return item.age === 18
      }, checked)
    },
    loadColumn () {
      this.$refs.xTable.loadColumn(this.columns1)
    }
  },
  created () {
    this.tableData = list
  },
  mounted () {
    this.$nextTick(() => {
      this.$refs.xTable.loadColumn(this.columns)
      this.$refs.xTable.loadData(this.tableData)
    })
  }
}
</script>
