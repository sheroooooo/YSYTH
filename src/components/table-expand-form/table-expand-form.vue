<template>
  <div class="table-expand-form">
    <!-- <div class="table-expand-form-active">
      table形式按钮
      <span :class="{'btn':true, 'actived': showType === 'table' }"
            v-if='formStyle !== "form"'
            @click.stop="handleViewChange('table')">
        <Icon type="ios-paper-outline"
              size="18" />
      </span>-->
    <!-- form形式按钮
      <span :class="{'btn':true, 'actived': showType === 'form' }"
            v-if='formStyle !== "table"'
            @click.stop="handleViewChange('form')">
        <Icon type="ios-apps-outline" size="18" />
      </span>
    </div>-->
    <template v-if='showType === "tableAndForm" && columns.length'>
      <vuc-datatable ref="xTable"
                     row-key='_XID'
                     :height='tableHeight'
                     :autoResize='true'
                     v-bind="$attrs"
                     v-on='$listeners'></vuc-datatable>
      <form-group v-show='currentRowIndex !== -1'
                  :items="columns"
                  ref='formGroup'
                  :values="currentRowData || {}"
                  :toolbar="true"
                  :editable="editable"
                  :show-qr-code="showQrCode"
                  @on-treeTabelSelect='treeTabelSelect'
                  @on-change="formChange"
                  @on-qr-code-click="OnQrCodeClick"
                  @ok="handleUpdateRow(true)"
                  @no="handleHiddenForm">
      </form-group>
    </template>
    <template v-if='showType === "form" && columns.length'>
      <div v-for="(item , index) in tableData"
           :key="index"
           :class="{'table-expand-form-panel': true ,'active': editable}">
        <span class="rec-no">{{ index + 1 }}</span>
        <div class="actions"
             v-if='editable'>
          <Tooltip content="修改"
                   v-if='buttonList.includes("edit")'
                   placement="right"
                   transfer>
            <Icon type="ios-create-outline"
                  @click="clickTableEvent(index, tableData[index], '', 'editor')"
                  size="18" />
          </Tooltip>
          <Tooltip content="删除"
                   v-if='buttonList.includes("delete")'
                   placement="right"
                   transfer>
            <Icon type="ios-trash-outline"
                  @click="clickTableEvent(index, tableData[index], '', 'delete')"
                  size="18" />
          </Tooltip>
          <Tooltip content="插入"
                   v-if='buttonList.includes("insert")'
                   placement="right"
                   transfer>
            <Icon type="ios-log-in"
                  @click="clickTableEvent(index, tableData[index], '', 'insert')"
                  size="18" />
          </Tooltip>
          <Tooltip content="复制"
                   v-if='buttonList.includes("copy")'
                   placement="right"
                   transfer>
            <Icon type="ios-copy-outline"
                  @click="clickTableEvent(index, tableData[index], '', 'copy')"
                  size="18" />
          </Tooltip>
        </div>
        <form-group :items="columns"
                    :values="tableData[index]"
                    :toolbar="true"
                    :editable="editable && index === currentRowIndex"
                    @on-treeTabelSelect='treeTabelSelect'
                    @on-change="formChange"
                    @ok="handleUpdateRow"
                    @no="handleHiddenForm">
        </form-group>
      </div>
    </template>
    <template v-if='showType === "table" && columns.length'>
      <vuc-datatable ref="xTable"
                     :editable="editable"
                     :height='tableHeight'
                     :activeMethod='activeMethodActiveMethod'
                     @on-edit-closed="handleEditClosed"
                     @on-edit-actived="handleEditActived"
                     :autoResize='true'
                     v-bind="$attrs"
                     v-on='$listeners'></vuc-datatable>
    </template>
    <div v-if='!columns.length'
         style='text-align:center'>暂未配置单据要素</div>
    <div v-if="editable && columns.length && buttonList.includes('bottomAdd') && currentRowIndex === -1"
         class="btn-add tc"
         @click="clickTableEvent(tableData.length - 1, '', '', 'insert')">
      <Icon type="md-add"
            size="18" />
    </div>
  </div>
</template>
<script>
import './table-expand-form.less'
import FormGroup from '../form-group'
import DialogTreeSelect from '_c/dialog-tree-select'
import TableSelect from '_c/table-select'
import selectMixin from '_c/combox-select/selectMixin'

export default {
  name: 'TableExpandForm',
  components: { FormGroup },
  props: {
    // 表单域表头 所有要素集合
    columns: {
      type: Array,
      default: () => []
    },
    // 数据集合
    values: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 默认值
    defaultValue: {
      type: Object,
      default: () => { }
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true
    },
    // 提供表内项的展示形式:
    // form表单,tableAndForm表格和表单, table纯表格
    // 或者数字格式 0. 1. 2
    formStyle: {
      type: [String, Number],
      default: 'tableAndForm'
    },
    // 是否是新单
    billId: {
      type: [String, Number],
      default: 0
    },
    // 折叠面板的文字
    title: {
      type: String,
      default: ''
    },
    // 表格状态下, 单元格编辑控制
    activeMethod: {
      type: [String, Function],
      default: ''
    },
    buttonList: {
      type: Array,
      default: () => {
        return ['add', 'bottomAdd', 'copy', 'insert', 'insertUp', 'edit', 'delete']
      }
    },
    modcode: {
      type: String,
      default: ''
    },
    showDataLength: {
      type: Number
    },
    showRowIndex: {
      type: Number,
      default: 0
    },
    showIndexColumn: {
      default: true,
      type: Boolean
    },
    showQrCode: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tableData: [],
      tableColumns: [],
      currentRowData: null,
      currentRowIndex: -1,
      showType: 'tableAndForm',
      indexKeyGroup: []
    }
  },
  computed: {
    tableHeight () {
      let { height: attrHeight } = this.$attrs
      let dataLenght = this.tableData.length
      if (this.showDataLength) {
        dataLenght = this.showDataLength < dataLenght ? this.showDataLength : dataLenght
      }
      let height = dataLenght * 37.33 + 55
      attrHeight = attrHeight ? Number(attrHeight) : ''
      if (attrHeight) {
        return height < attrHeight ? height : attrHeight
      }
      return height
    },
    cryptionFlag () {
      if (this.columns[0]) {
        return this.columns[0].cryptionFlag
      }
    }
  },
  inject: {
    billValueStore: {
      from: 'billValueStore',
      default: () => {
        return () => { }
      }
    }
  },
  watch: {
    values: {
      handler (val) {
        let groupKey = Object.entries(this.defaultValue)
          .filter(item => item[1] === '$_INDEX')
          .map(i => i[0])
        this.setData(val.map((item, i) => {
          if (groupKey.length) {
            groupKey.map(k => {
              item[k] = i + 1
            })
          }
          return { ...item }
        }), 'change')
        if (this.currentRowIndex !== -1) {
          // 发票带入特殊处理
          if (val[val.length - 1].hasOwnProperty('FPDR')) {
            this.currentRowIndex = val.length - 1
            delete val[val.length - 1].FPDR
          }
          this.currentRowData = { ...val[this.currentRowIndex] }
        }
      },
      deep: true,
      immediate: true
    },
    editable () {
      this.setElementList()
    },
    cryptionFlag (val) {
      this.setElementList()
    },
    columns: {
      handler (val) {
        this.setElementList()
      },
      immediate: true,
      deep: true
    },
    buttonList () {
      this.setElementList()
    },
    showRowIndex (val) {
      if (val >= 0 && val < this.values.length) {
        this.handleEditorRow(val, this.values[val])
      }
    }
  },
  methods: {
    // 操作列事件处理
    clickTableEvent (rowIndex, row, column, buttonName) {
      if (this.showType !== 'table' && this.currentRowIndex !== -1) { // 如果当前还在操作数据, 不允许新增等操作
        return this.$fn.warning({ title: '警告提示', desc: '您有信息未确认，请确认。' })
      }
      let eventMap = {
        insert: () => this.handleInsertRow(rowIndex),
        insertUp: () => this.handleInsertRow(rowIndex - 1),
        delete: () => this.handleDeleteRow(rowIndex),
        copy: () => this.handleCopyRow(this.values[rowIndex]),
        editor: () => this.handleEditorRow(rowIndex, this.values[rowIndex]),
        qrCode: () => this.handleCreatQrCode(rowIndex, row)
      }
      return eventMap[buttonName] && eventMap[buttonName]()
    },
    // 插入数据(向下插入)
    handleInsertRow (i) {
      i = i + 1
      let defaultValue = { ...this.defaultValue }
      Object.entries(defaultValue).filter(kg => kg[1] === '$_INDEX').map(g => {
        defaultValue[g[0]] = i + 1
      })
      this.handleAddData({ ...defaultValue }, i)
      this.currentRowIndex = i
      if (this.showType === 'tableAndForm') {
        let formGroup = this.$refs.formGroup
        formGroup.setCacheValue({ ...defaultValue })
        formGroup.$refs.formGroup.resetFields()
      }
    },
    handleAddData (insertData, i) {
      let value = insertData || { ...this.defaultValue }
      let index = typeof i === 'number' ? i : this.tableData.length
      this.tableData.splice(index, 0, { ...value })
      this.$emit('on-add', value, index)
      Object.keys(value).map(k => this.$emit('on-change', value, index, k))
    },
    // 删除数据
    handleDeleteRow (index) {
      const _this = this
      return new Promise((resolve, reject) => {
        this.$modal.confirm({
          title: '删除',
          message: '是否要删除？',
          zIndex: 99999,
          events: {
            confirm () {
              _this.tableData.splice(index, 1)
              _this.$emit('on-delete', index)
              // 最后一条删除 暂时无法触发公式等相关计算
              // 因为涉及到on-change内的赋值操作。后续优化吧。可能直接调用calcEQ方法可以
              let currentIndex = index - 1 >= 0 ? index - 1 : 0
              _this.$nextTick(() => {
                let values = _this.values[currentIndex]
                if (!(index - 1 < 0 && _this.tableData.length === 0)) { // 操作非仅剩的最后一条数据时
                  Object.keys(values).map(k => _this.$emit('on-change', values, currentIndex, k))
                }
                _this.$fn.success({ title: '成功提示', desc: '删除成功' })
                resolve(true)
              })
            },
            cancel () {
              resolve(false)
            }
          }
        })
      })
    },
    // 复制数据
    handleCopyRow (row) {
      let { _XID, ...data } = row
      if (this.showType === 'tableAndForm') {
        this.$refs.formGroup.setCacheValue(data)
      }
      this.handleAddData({ ...data })
    },
    // 编辑数据
    handleEditorRow (index, data = {}) {
      this.currentRowIndex = index
      if (this.showType === 'tableAndForm') {
        this.$refs.formGroup.setCacheValue(data)
      }
      this.currentRowData = { ...data } // 将点击的表格行数据 传递给表单。
      this.$emit('on-edit', data, index)
    },
    // 点击取消按钮
    handleHiddenForm () {
      this.handleUpdateRow(false)
    },
    // 点击确定按钮，更新表格数据
    handleUpdateRow (flag) {
      this.$emit('on-form-ok', this.currentRowIndex, flag)
      this.currentRowIndex = -1
      // 底下这个会导致 底层formGroup的值变为undefined
      // if (this.showType === 'table') {
      //   this.$refs.formGroup.$refs.formGroup.resetFields()
      // }
    },
    handleCreatQrCode (rowIndex, row) {
      this.$emit('handle-create-qr-code', { row, rowIndex })
      this.currentRowIndex = -1
    },
    OnQrCodeClick () {
      this.handleCreatQrCode(this.currentRowIndex, this.currentRowData)
    },
    // 设置元素列表
    setElementList () {
      const _this = this
      let _root = {
        $state: this.$store.state,
        $route: {
          path: this.$route.path,
          params: this.$route.params,
          name: this.$route.name
        },
        billValueStore: this.billValueStore
      }
      let columns = [...this.columns].filter(item => !(item.options && item.options.hidden))
      let buttonMap = ['qrCode', 'edit', 'insert', 'insertUp', 'copy', 'delete']
      let buttList = buttonMap.map(buttonName => {
        if (this.buttonList.includes(buttonName)) {
          return this.showType === 'table' && buttonName === 'edit' ? '' : buttonName
        }
      }).filter(i => i)
      if (this.editable && buttList.length) {
        columns.push({
          type: 'tools',
          field: '',
          title: '操作',
          align: 'center',
          width: buttList.length * 40,
          resizable: true,
          fixed: 'right',
          slots: {
            default: ({ row, column, rowIndex }, h) => {
              let buttonMap = {
                'qrCode': [<span class='tools-icon-default icon-print' title='生成二维码' type="text" onClick={() => _this.clickTableEvent(rowIndex, row, column, 'qrCode')}></span>],
                'edit': [<span class='tools-icon-default icon-edit' title='编辑' type="text" onClick={() => _this.clickTableEvent(rowIndex, row, column, 'editor')}></span>],
                'insertUp': [<span class='tools-icon-default icon-up-insert' title='向上插入' type="text" onClick={() => _this.clickTableEvent(rowIndex, row, column, 'insertUp')}></span>],
                'insert': [<span class='tools-icon-default icon-insert' title='向下插入' type="text" onClick={() => _this.clickTableEvent(rowIndex, row, column, 'insert')}></span>],
                'copy': [<span class='tools-icon-default icon-copy' title='复制' type="text" onClick={() => _this.clickTableEvent(rowIndex, row, column, 'copy')}></span>],
                'delete': [<span class='tools-icon-default icon-delete' title='删除' type="text" onClick={() => _this.clickTableEvent(rowIndex, row, column, 'delete')}></span>]
              }
              let btnArr = buttList.map(i => {
                if (row.statusCode * 1 === 1) {
                  if (i !== 'delete' && i !== 'edit') {
                    return buttonMap[i][0]
                  }
                } else {
                  return buttonMap[i][0]
                }
              }).filter(v => v)
              return btnArr
            }
          }
        })
      }
      this.tableColumns = columns.map((item, index) => {
        let title = item.required ? `${item.title} *` : item.title
        let minWidth = Math.ceil(title.length / 7) * 100
        let data = { ...item, title, minWidth, headerAlign: 'center', align: 'left', field: item.key || '' }
        if (item.width) {
          data.width = item.width
        }
        if (data.dataType === 'input' || data.dataType === 'textarea') {
          data.editRender = {
            name: 'Input',
            props: {
              disabled: item.readonly,
              placeholder: item.options.placeholder
            }
          }
        }
        if (data.dataType === 'number' || data.dataType === 'float') {
          data.align = data.dataType === 'number' ? 'right' : 'left'
          data.formatter = ({ row, rowIndex, column, columnIndex }) => {
            if (!row[column.property]) return '0.00'
            return this.$utils.commafy(row[column.property], { fixed: 2 })
          }
          data.editRender = {
            name: 'InputNumber',
            props: {
              precision: 2,
              disabled: item.readonly,
              formatter: (value) => data.dataType === 'float' ? value : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
              parser: value => value.replace(/￥s?|(,*)/g, ''),
              placeholder: item.options.placeholder,
              max: item.options ? 9999999999999 : (item.options.maxValue || 9999999999999),
              min: item.options ? 0 : (item.opitons.maxValue || 0)
            }
          }
        }
        if (data.dataType === 'integer') {
          data.formatter = ({ row, rowIndex, column, columnIndex }) => {
            return row[column.property] || '0'
          }
          data.editRender = {
            name: 'InputNumber',
            props: {
              precision: 0,
              placeholder: item.options.placeholder,
              disabled: item.readonly,
              max: item.options ? 9999999999999 : (item.options.maxValue || 9999999999999),
              min: item.options ? 0 : (item.opitons.maxValue || 0)
            }
          }
        }
        if (data.dataType === 'checkbox') {
          data.formatter = ({ row, rowIndex, column, columnIndex }) => {
            if (!row[column.property]) return ''
            if (row[column.property] === '1') {
              return '是'
            } else {
              return '否'
            }
          }
          data.editRender = {
            name: 'Checkbox',
            props: {
              'true-value': '1',
              'false-value': '0',
              disabled: item.readonly
            }
          }
        }
        if (data.dataType === 'cryption') {
          data.formatter = ({ row, rowIndex, column, columnIndex }) => {
            if (!row[column.property]) return ''
            if (this.editable && this.currentRowIndex === rowIndex) {
              return window.atob(row[column.property]) // 解码
            } else {
              if (data.cryptionFlag === '1') {
                return window.atob(row[column.property]) // 解码
              } else {
                let trueString = window.atob(row[column.property]) // 解码
                let number = Math.min(parseInt((trueString.length - 1) / 2), 4)
                let startString = trueString.substr(0, number)
                let endString = trueString.substr(0 - number)
                return `${startString}******${endString}`
              }
            }
          }
        }
        if (data.dataType === 'tree-select') {
          data.editRender = {
            name: 'buttonedit',
            props: {
              clearable: true,
              editable: data.options.editable || false,
              options: {
                title: item.title,
                width: 530,
                height: 465,
                resize: true,
                showFooter: false,
                escClosable: true,
                customComponent: DialogTreeSelect,
                customProps: {
                  dataSource: item.options.dataSource,
                  data: item.options.data,
                  placeholder: item.options.placeholder,
                  disabled: item.readonly,
                  _root,
                  'item-key': item.key,
                  readonly: !item.options.editable
                },
                customEvents: {
                  complete (val, row, list) {
                    if (row) {
                      row[data.key] = val
                      let index = _this.tableData.findIndex(i => i === row)
                      _this.currentRowIndex = index !== -1 ? index : _this.currentRowIndex
                      _this.currentRowData = row
                      _this.formChange(row, data.key, list)
                    }
                  }
                }
              }
              // 'on-change': ({ row }) => _this.formChange(row, data.key, [])
            }
          }
        }
        if (data.dataType === 'table-select') {
          data.editRender = {
            name: 'buttonedit',
            props: {
              clearable: false,
              editable: data.options.editable,
              options: {
                title: item.title,
                width: 900,
                height: 580,
                resize: true,
                showFooter: false,
                escClosable: true,
                customComponent: TableSelect,
                customProps: {
                  dataSource: item.options.dataSource,
                  placeholder: item.options.placeholder,
                  toolbar: (item.MODCODE === 'OER' || item.MODCODE === 'GSP') ? ['search'] : [],
                  tableDataProps: item.options.tableData,
                  tableColumnsProps: item.options.tableColumns,
                  _root,
                  disabled: item.readonly,
                  'item-key': item.key,
                  name: item.key,
                  readonly: !item.options.editable
                },
                customEvents: {
                  complete (val, row, rowIndex, column) {
                    if (row) {
                      row[data.key] = val
                      let index = _this.tableData.findIndex(i => i === row)
                      _this.currentRowIndex = index !== -1 ? index : _this.currentRowIndex
                      _this.currentRowData = row
                      _this.formChange(row, data.key, list)
                    }
                  }
                }
              }
              // 'on-change': ({ row }) => _this.formChange(row, data.key, [])
            }
          }
        }
        if (data.dataType === 'select') {
          let list = []
          data.editRender = {
            name: 'treecombox',
            props: {
              idField: 'code',
              textField: 'name',
              isArrow: false,
              data: async () => {
                list = await this.getComboxSelectData(item.options.dataSource, item.options.data, this.currentRowData)
                let data = list.map(ele => {
                  return { ...ele, name: this.transValue(ele, item.options.dataSource) }
                })
                return data
              },
              panelHeight: 300,
              panelWidth: 400,
              onChange: (row) => this.selectChange(row, item)
            }
          }
          data.formatter = ({ row, rowIndex, column, columnIndex }) => {
            let key = column.property
            if (row.hasOwnProperty(key)) {
              let reg = /^[\w|\d]+\s{1}.+$/
              if (reg.test(row[key])) return row[key]
              if (/^\d+$/.test(row[key])) {
                let optionItem = list.find(item => Number(item.code) === Number(row[key]))
                if (!optionItem) return ''
                return this.transValue(optionItem, data.options.dataSource)
              } else {
                return row[key]
              }
            } else {
              return ''
            }
          }
        }
        if (data.dataType === 'date') {
          data.align = 'right'
          data.formatter = ({ row, rowIndex, column, columnIndex }) => {
            let date = row[column.property]
            if (date.indexOf('-') !== -1) {
              row[column.property] = new Date(date).Format('yyyyMMdd')
              return date
            } else if (new RegExp('^[0-9]').test(date) && date !== '') {
              return `${date.substr(0, 4)}-${date.substr(4, 2)}-${date.substr(6, 2)}`
            } else if (date !== '') {
              row[column.property] = new Date(date).Format('yyyyMMdd')
              return new Date(date).Format('yyyy-MM-dd')
            }
          }
          data.editRender = {
            name: 'DatePicker',
            props: {
              type: item.options.type || 'date',
              transfer: true,
              editable: false,
              disabled: item.readonly,
              placeholder: item.placeholder,
              format: 'yyyyMMdd'
            }
          }
        }
        if (data.dataType === 'custom') {
          data.editRender = {
            name: 'buttonedit',
            props: {
              clearable: false,
              editable: false,
              options: {
                title: item.title,
                width: item.options.width,
                height: item.options.height,
                resize: true,
                showFooter: false,
                escClosable: true,
                customComponent: item.options.customComponent,
                customProps: {
                  options: item.options,
                  disabled: item.readonly,
                  _root,
                  'item-key': item.key
                },
                customEvents: {
                  complete (val, row, list) {
                    if (row) {
                      row[data.key] = val
                      let index = _this.tableData.findIndex(i => i === row)
                      _this.currentRowIndex = index !== -1 ? index : _this.currentRowIndex
                      _this.currentRowData = row
                      _this.formChange(row, data.key, list)
                    }
                  }
                }
              }
              // 'on-change': ({ row }) => _this.formChange(row, data.key, [])
            }
          }
        }
        return data
      })
      if (this.showType === 'table' && this.showIndexColumn) {
        this.tableColumns.unshift({ type: 'index', title: '序号', width: '60', fixed: 'left', headerAlign: 'center' })
      }
      if (this.showType === 'tableAndForm') {
        this.tableColumns.unshift({ type: 'index', title: '序号', width: '60', fixed: 'left', headerAlign: 'center' })
      }
      if (!this.$refs.xTable) return false
      this.$refs.xTable.loadColumn(this.tableColumns)
    },
    selectChange ({ row, rowIndex, column, itemData }, item) {
      let result = this.transValue(itemData, item.options.dataSource).split(' ')
      let showString = ''
      if (result.length > 2) {
        showString = `${result[1]} ${result[2]}`
      } else {
        showString = result[1] ? `${result[0]} ${result[1]}` : `${result[0]}`
      }
      setTimeout(() => {
        row[column.property] = showString
        this.formChange(row, column.property, [itemData])
      }, 20)
    },
    // 设置数据
    setData (data, flag) {
      let newData = null
      newData = this.tableData = data || this.tableData.map((item, i) => {
        return { ...item }
      })
      if (!this.$refs.xTable) return false
      let { fullData } = this.$refs.xTable.getTableData()
      // 判断是不是纯表格,而且,不是因为watch引起改动
      if (this.showType !== 'table' && flag !== 'change') {
        this.$refs.xTable.loadData(newData)
      } else {
        // 判断长度进行更新, 防止多增加或者删除了数据。
        // 如果长度相同不需要loadData,规避突然间不可编辑的问题
        // if (this.tableData.length === fullData.length) {
        //   this.tableData.map((element, index) => {
        //     fullData[index] && Object.assign(fullData[index], element)
        //   })
        // } else {
        //   setTimeout(() => this.$refs.xTable.loadData(newData), 20)
        // }
        this.$refs.xTable.loadData(newData)
      }
    },
    // 校验
    validate (_callback) {
      let valid = true
      if (this.showType !== 'table' && this.billId === 0 && this.currentRowIndex !== -1) {
        this.$fn.warning({ title: '警告提示', desc: `${this.title}存在信息未确认, 请确认` })
        valid = false
      }
      if (valid) valid = this.checkReqiredData() // 必填校验(表格形式 进行校验)
      _callback(valid)
    },
    // 必填项目校验
    checkReqiredData () {
      let valid = true
      let error = ''
      let title = ''
      /* eslint no-labels: "off" */
      lable: for (let index = 0; index < this.values.length; index++) {
        const val = this.values[index]
        for (let j = 0, collen = this.columns.length; j < collen; j++) {
          const col = this.columns[j]
          if (col.required && !val[col.key]) {
            valid = false
            title = col.parentTitle
            error = `第${index + 1}行${col.title}必须输入！`
            break lable
          }
        }
      }
      if (!valid) this.$fn.error({ title: title + '校验失败', desc: error })
      return valid
    },
    tableNumberChange (params) {
      let key = params.column.property
      setTimeout(() => this.formChange(params.row, key, []))
    },
    formChange (values, key, list) {
      if (this.showType === 'table') {
        let numberType = ['number', 'integer', 'float']
        this.columns.map(i => {
          if (numberType.includes(i.dataType)) {
            values[i.key] = Number(values[i.key]) || 0
          }
        })
      }
      this.$emit('on-change', values, this.currentRowIndex, key, list)
    },
    treeTabelSelect () {
      this.$emit('on-treeTabelSelect', row, key)
    },
    // 只有纯表格状态下,才执行该函数
    activeMethodActiveMethod (params) {
      // console.log(params.rowIndex)
      let attr = params.column.own
      if (this.activeMethod) {
        return this.activeMethod(params)
      } else if (attr.hasOwnProperty('readonly')) {
        // 兼容单据设置
        return !attr.readonly
      } else {
        return true
      }
    },
    handleEditActived (data) {
      setTimeout(() => {
        this.currentRowIndex = data.rowIndex
        this.currentRowData = data.row
      }, 20)
    },
    // 在纯表格状态下, 弹出树等弹出选择类型要素 带出数据, formChange会触发两次。
    handleEditClosed (data) {
      this.currentRowIndex = data.rowIndex
      let type = data.column.own.dataType
      let key = data.column.property
      let numberType = ['number', 'float', 'integer']
      let maxLenght = data.column.own.FIELDWIDTH || 200
      if (numberType.includes(type)) {
        this.tableNumberChange(data)
      } else if (type !== 'select') {
        if (this.currentRowData[key] && this.currentRowData[key].length > maxLenght) {
          this.$fn.warning({ title: '警告提示', desc: '字段超长,已经自动截取' })
          this.currentRowData[key] = this.currentRowData[key].substring(0, maxLenght)
        }
        this.formChange(this.currentRowData, key, [])
      }
    }
  },
  mounted () {
    this.setData()
    this.setElementList() // 设置表头
  },
  created () {
    // 找到默认值设置为 $_INDEX 的数据。动态更新索引
    this.indexKeyGroup = Object.entries(this.defaultValue).filter(i => i[1] === '$_INDEX').map(k => k[0])
    if (this.indexKeyGroup.length) {
      this.$emit('on-refreshDataIndex', this.values, this.defaultValue)
    } else {
      this.tableData = this.values.map((item, i) => {
        return { ...item }
      })
    }
    // 设置表格数据
    let showTypeMap = { 0: 'form', 1: 'tableAndForm', 2: 'table' }
    this.showType = typeof this.formStyle === 'string' ? this.formStyle : showTypeMap[this.formStyle] // 默认tableAndForm
    if (!this.billId && this.modcode !== 'FAQC') { // 如果是新增单据，那么直接显示表单让用户填写。旧单不直接展示表单
      this.currentRowIndex = this.showRowIndex
      if (this.showRowIndex >= 0) {
        this.currentRowData = { ...this.values[this.currentRowIndex] } // 设置表单数据
      }
    }
  },
  mixins: [selectMixin]
}
</script>
<style lang="less">
  @import './table-expand-form.less';
</style>
