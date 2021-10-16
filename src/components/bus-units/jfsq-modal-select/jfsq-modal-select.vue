<template>
  <div class='jfsq-table-wrapper'>
    <div class='jfsq-top-wrapper'>
      <Row v-if='formStruct.length'>
        <Col span='22'>
        <form-group class="form-group-query"
                    :item-list="formStruct"
                    :initValueList="formValue"
                    :label-width='100'
                    ref='formDom'
                    @on-change="formChange"
                    :showMore="true">
        </form-group>
        </Col>
        <Col span='2'>
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
        </Col>
      </Row>
      <vuc-datatable ref="targetTable"
                     style='position: relative;'
                     :show-checkbox="showCheckbox"
                     row-key='ZBID'
                     :height="415"
                     :editable='true'
                     @on-select="handleSelect"
                     @on-dblclick="hadledblClick">
      </vuc-datatable>
    </div>
    <div class="footer-btn-group"
         style='padding: 10px 0px 0px 10px; text-align: right'>
      <Button class="footer-btn"
              style='margin-left: 10px'
              @click="$emit('close')">取消</Button>
      <Button type="primary"
              style='margin-left: 10px'
              @click='handleSubmit'
              class="footer-btn">确定</Button>
    </div>
  </div>
</template>
<script>
import FormGroup from '_c/form/form-group/form-group'
import { getCondictionList, getGridColumns, getGspBillData } from '@/api/pub/jfsq-modal-select'
import { getBasicInfoData } from '@/api/gbi/public.js'
import { getTypeFormRegister } from '@/api/basePort'
let DEFAULT_VALUE = {}
export default {
  name: 'jfsqModalSelect',
  props: {
    // 编制凭证，是否获取row，默认为false,从编制凭证过来为true
    getRow: {
      type: Boolean,
      default: false
    },
    row: {
      type: Object,
      default: () => { }
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    // 基础参数中账务模块需要额外传递：BMDM, XMDM, ZYDM, WLDM, GNKMDM, JJKMDM FX6DM, FX7DM, FX8DM, FX9DM, FXADM
    baseParams: { // 基础参数
      type: Object,
      default: () => {
        return {
          GSDM: '',
          ZTH: '',
          KJND: ''
        }
      }
    },
    initValue: { // 搜索的初始值
      type: Object,
      default: () => { }
    },
    modCode: { // 模块名字 大小写不限制，最后接口处统一转换成大写
      type: String,
      default: ''
    },
    // 报销单类型ID, 最好是Number, 接口处统一转化为Number
    BXDLXID: {
      type: [String, Number],
      default: ''
    },
    dataList: {
      type: Array,
      defalut: () => {
        return []
      }
    },
    listMainKey: {
      type: String,
      defalut: 'DJGUID'
    },
    CARDTYPE: {
      type: String,
      defalut: '3'
    }
  },
  data () {
    return {
      formValue: {},
      formStruct: [],
      rowData: {},
      tableColumns: []
    }
  },
  components: { FormGroup },
  methods: {
    handleSubmit () {
      let checkData = this.$refs.targetTable.getCheckedData()
      let rowData = this.rowData || row
      if (rowData && checkData.length === 0) {
        this.$emit('on-change', { value: 'rowData.ZBID', itemData: rowData })
        this.$emit('close')
        return false
      }
      if (!checkData.length) {
        this.$fn.error({ title: '失败提示', desc: '请选择数据' })
        return false
      }
      this.$emit('complete', checkData, this.tableColumns)
    },
    getTargetColunms () {
      return new Promise((resolve, reject) => {
        let params = { ...this.baseParams, MODCODE: this.modCode.toLowerCase(), BXDJLXID: Number(this.BXDLXID), CARDTYPE: this.CARDTYPE }
        this.$fn.ajax(getGridColumns, params, res => {
          if (res && res.status === 200) {
            this.tableColumns = this.$utils.clone(res.data, true)
            this.$emit('columns', this.tableColumns)
            let reg = /(JE)$/
            let len = res.data.length
            for (let i = 0; i < len; i++) {
              res.data[i].width = '120'
              res.data[i].headerAlign = 'center'
              if (res.data[i].field === 'DJBH') res.data[i].width = '150'
              if (reg.test(res.data[i].field)) {
                res.data[i].align = 'right'
                res.data[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
                  return this.$utils.commafy(row[column.property], { fixed: 2 })
                }
              } else if (res.data[i].type === 'Select') {
                res.data[i].editRender = {
                  name: 'Select',
                  props: { 'transfer': true },
                  options: [{ value: '1', label: '是' }, { value: '0', label: '否' }]
                }
                res.data[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
                  let data = row[column.property]
                  if (!data || data === '0') {
                    return '否'
                  } else {
                    return '是'
                  }
                }
              }
            }
            if (this.showCheckbox) {
              res.data.unshift({ type: 'selection', title: ' ', width: '40', fixed: 'left' })
            }
            this.$refs.targetTable.loadColumn(res.data)
          }
        }, 0)
      })
    },
    // 准备替换处理表头函数
    setTableColunms (column) {
      let len = column.length
      for (let i = 0; i < len; i++) {
        column[i].width = '120'
        column[i].headerAlign = 'center'
        if (column[i].field === 'DJBH') column[i].width = '170'
        if (column[i].type === 'Money') {
          res.data[i].align = 'right'
          res.data[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return this.$utils.commafy(row[column.property], { fixed: 2 })
          }
        } else if (column[i].type === 'Date') {
          column[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
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
        } else if (column[i].type === 'Select') {
          column[i].editRender = {
            name: 'Select',
            props: { 'transfer': true },
            options: [{ value: '1', label: '是' }, { value: '0', label: '否' }]
          }
          column[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            let data = row[column.property]
            if (!data || data === '0') {
              return '否'
            } else {
              return '是'
            }
          }
        }
      }
      if (this.showCheckbox) {
        column.unshift({ type: 'selection', title: ' ', width: '40', fixed: 'left' })
      }
      return column
    },
    getFormStruct () {
      return new Promise((resolve, reject) => {
        let params = { ...this.baseParams, MODCODE: this.modCode.toUpperCase(), CARDTYPE: this.CARDTYPE }
        this.$fn.ajax(getCondictionList, params, res => {
          if (res && res.status === 200) {
            if (/^998[0-9]+/.test(this.CARDTYPE)) {
              let keyGroup = ['DJLX', 'XMDM|XMMC', 'GRDM|GRMC', 'DjDate', 'JE']
              res.data = res.data.filter(i => keyGroup.includes(i.name))
            }
            DEFAULT_VALUE = {}
            res.data.map(item => {
              DEFAULT_VALUE = { ...DEFAULT_VALUE, [item.name]: item.defalut || '' }
              item.readOnly = item.readOnly === 'true'
              if (item.type === 'table-select') {
                item.type = 'Input'
              }
              if (item.type === 'tree-select') {
                item.props = { dataSources: -1, data: [], idField: 'DMMC' }
                getBasicInfoData({ ...this.baseParams, LBDM: item.name, ISCHANGE: '1' }).then(result => {
                  let typeData = JSON.parse(JSON.stringify(result.data).replace(/DMMC/g, 'title'))
                  item.props.data = typeData
                })
              }
              if (item.type === 'checkbox') {
                item.props = { 'true-value': '1', 'false-value': '0' }
                DEFAULT_VALUE[item.name] = '0'
              }
              if (item.type === 'i-select') {
                item.props = { dataSources: -1, data: [] }
                item.children = {
                  type: 'i-option',
                  list: []
                }
                let { GSDM: gsdm, KJND: kjnd } = this.baseParams
                if (item.name === 'DJLX') {
                  getTypeFormRegister({ gsdm, kjnd, cardType: this.CARDTYPE }).then(result => {
                    let typeData = [{ 'DJLXMC': '所有', 'DJLXID': '-1' }, ...result.data]
                    typeData = typeData.map(element => {
                      return {
                        value: element.DJLXID.toString(),
                        title: element.DJLXMC
                      }
                    })
                    item.children.list = typeData
                  })
                }
              }
            })
            this.formStruct = res.data
            resolve(this.formStruct)
          }
        })
      })
    },
    getTargetData () {
      return new Promise((resolve, reject) => {
        let CXTJ = this.formatFormValue(this.formValue)
        if (/^998[0-9]+/.test(this.CARDTYPE) && CXTJ.DJLX === '-1') {
          delete CXTJ.DJLX
        } else {
          CXTJ['DJLXID'] = CXTJ.DJLX
        }
        let params = {
          ...this.baseParams,
          BXDJLXID: Number(this.BXDLXID),
          MODCODE: this.modCode.toUpperCase(),
          CXTJ: { ...CXTJ, MLID: this.baseParams.MLID },
          CARDTYPE: this.CARDTYPE
        }
        this.$fn.ajax(getGspBillData, params, res => {
          if (res && res.status === 200) {
            this.$refs.targetTable.loadData(res.data)
            if (this.dataList && this.dataList.length > 0) {
              let list = res.data.filter(items => {
                return this.dataList.find(i => i[this.listMainKey] === items[this.listMainKey])
              })
              this.$refs.targetTable.setRowsChecked(list, true)
            }
          }
        }, 0)
      })
    },
    handleClickSearch () {
      this.getTargetData()
    },
    formChange (valueList, key, node) {
      this.formValue = { ...this.formValue, ...valueList }
      this.$emit('on-change', this.formChange)
    },
    formatFormValue (formValue) {
      // 后台需要这种格式的入参
      let newValue = {}
      for (let item in formValue) {
        if (item === 'DjDate') {
          newValue['DATEBEGIN'] = formValue[item][0].replace(/-/g, '')
          newValue['DATEEND'] = formValue[item][1].replace(/-/g, '')
        } else if (item === 'JE') {
          newValue['JEMIN'] = formValue[item][0]
          newValue['JEMAX'] = formValue[item][1]
        } else if (item.indexOf('|') !== -1) {
          let key = item.split('|')[0]
          newValue[key] = formValue[item] ? formValue[item].split(' ')[0] : ''
        } else {
          newValue[item] = formValue[item]
        }
      }
      return newValue
    },
    // 编制凭证拼接经费申请筛选查询条件
    getSearchConditions () {
      let GL = {
        JEMIN: 0,
        JEMAX: 999999999
      }
      // 如果为true，则是编制凭证跳转过来的
      if (this.getRow) {
        // 基础参数中账务模块需要额外传递：BMDM, XMDM, ZYDM, WLDM, GNKMDM, JJKMDM FX6DM, FX7DM, FX8DM, FX9DM, FXADM
        let fixedFX = ['BMDM', 'XMDM', 'ZYDM', 'WLDM']
        // T 模式
        if (this.row.cw_fzhs) {
          // 分解辅助核算
          const auxList = this.row.cw_fzhs.split(',')
          auxList.forEach(el => {
            if (el !== '') {
              let field = fixedFX[el]
              let key = fixedFX[el]
              let MC = field ? field.replace('DM', 'MC') : ''
              if (!field) {
                field = el === 10 ? FXADM : `FZ${el}DM`
                key = `FZDM${el}`
                MC = el === '10' ? FXAMC : `FZ${el}MC`
              }
              // let key = field.replace('DM', 'MC')
              GL[key + '|' + MC] = this.row[field.replace('DM', 'MC')] ? this.row[field.replace('DM', 'MC')] : ''
            }
          })
        } else { // H/V 模式
          for (let field in this.row) {
            if (fixedFX.includes(field)) {
              let key = field.replace('DM', 'MC') // BMMC
              GL[field + '|' + key] = this.row[key]
            } else if (field.indexOf('FZDM') !== -1) {
              let num = field.split('FZDM')[1]
              let key = num === '10' ? FXADM : `FZ${num}DM`
              let MC = num === '10' ? FXAMC : `FZ${num}MC`
              GL[key + '|' + MC] = this.row[field.replace('DM', 'MC')] ? this.row[field.replace('DM', 'MC')] : ''
            }
          }
        }
        this.initValue = this.$utils.clone(GL, true)
      }
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.rowData = row
    },
    hadledblClick ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      if (!this.showCheckbox) this.handleSubmit(row)
    }
  },
  mounted () {
    this.getSearchConditions()
    this.getFormStruct().then(res => {
      let formatInitValue = { ...this.initValue, DJLX: '-1' }

      if (/^998[0-9]+/.test(this.CARDTYPE)) {
        formatInitValue = {
          DJLX: '-1',
          'GRDM|GRMC': this.initValue['GRDM|GRMC'] || ''
        }
      }
      for (let item in this.initValue) {
        if (item === 'BM' && !(/^998[0-9]+/.test(this.CARDTYPE))) {
          formatInitValue['BMDM|BMMC'] = this.initValue[item]
        } else if (item === 'XM') {
          formatInitValue['XMDM|XMMC'] = this.initValue[item]
        }
      }
      if (Array.isArray(DEFAULT_VALUE.JE)) {
        delete formatInitValue.JE
      }
      this.formValue = { ...DEFAULT_VALUE, ...formatInitValue }
      this.handleClickSearch()
    })
    this.getTargetColunms()
  }
}
</script>
<style scoped lang="less">
@import 'jfsq-modal-select.less';
</style>
