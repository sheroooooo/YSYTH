<!--
  该组件是旧版 选择指标和选择经费申请组件;但是现在只使用其中经费申请相关功能
-->
<template>
  <div class="zbys-form">
    <vuc-datatable ref="xTable"
                   v-show="itemlist.length>0"
                   editable="editable"
                   class="ywzj-table"
                   :height="tableHeight"
                   :row-key="'JE'"
                   :cell-class-name="cellClassName"
                   @on-edit-closed='editClosedEvent'>
    </vuc-datatable>
    <Button type="primary"
            @click="showTargetModal()"
            v-if="!!(editable && (canUsed ||/^998[0-9]+/.test(targetHeader.CARDTYPE) ))">选择{{targetHeader ? targetHeader.title : ' '}}
    </Button>
  </div>
</template>
<script>
import { getTargetItem } from '@/api/gsp/gsp_bill'
import { getDJMainInfo } from '@/api/pub/jfsq-modal-select'
import FormGroup from '_c/form/form-group'
import DataTable from '_c/table/data-table'
import JFSQModalSelect from '_c/bus-units/jfsq-modal-select/jfsq-modal-select'
import CGYSModalSelect from '_c/bus-units/gpmc-modal-select/gpmc-modal-select'
import HTModalSelect from '_c/bus-units/cntc-modal-select/cntc-modal-select'
import tools from '@/libs/toolutil'
import clonedeep from 'clonedeep'
import mixin from '@/libs/app-mixin'
import FzxSelectModal from './components/fzx-select-modal'
import { mapGetters } from 'vuex'
const INIT_VALUE_TARGET = {
  'zblydb': '',
  'bmdm': '',
  'zbid': '',
  'zy': '',
  'zcsx': '',
  'jhid': '',
  'xmdm': '',
  'kyje': [1]
}
const INIT_VALUE_REQUEST = {
  'djrq': ['', ''],
  'jefw': [0, 99999999],
  'djbh': '',
  'bmdm': '',
  'xmdm': ''
}
const select = {
  type: 'selection',
  width: 55,
  title: '勾选',
  fixed: 'left',
  align: 'center'
}
const number = {
  'key': 'number',
  'title': '序号',
  'width': 60,
  'align': 'left',
  'fixed': 'left'
}
const tablexh = {
  type: 'index',
  title: '序号',
  width: 60,
  align: 'center',
  fixed: 'left'
}
export default {
  name: 'TableSelectBudget',
  props: {
    targetHeader: {
      type: Object,
      default: () => { }
    },
    values: {
      type: Object,
      default: () => { }
    },
    targetList: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: true
    },
    defaultValues: {
      type: Object,
      default: () => { }
    },
    canUsed: {
      type: [Number, Boolean],
      default: true
    },
    billId: {
      type: [String, Number],
      default: '0'
    }
  },
  inject: ['turnToPage'],
  components: {
    FormGroup,
    DataTable
  },
  data () {
    return {
      // 公共入参
      gsdm: this.$store.getters.env.gsdm,
      kjnd: this.$store.getters.env.kjnd,
      initValueList: { // 表单初始化结构
        'ysfadm': '',
        'zblydb': '',
        'bmdm': '',
        'xmdm': '',
        'zbid': '',
        'zy': '',
        'zcsx': '',
        'jhid': '',
        'kyje': [1]
      },
      cols: 2, // 列数
      labelWidth: 100, // 表单项宽度
      tableData: [],
      modal: false, // 弹出窗口控制参数
      external: [], // 表格数据
      itemlist: [],
      cloneList: [], // 选中数据
      abroadColumns: [], // 模态窗外表头数据
      withinColumns: [], // 模态窗内表头数据
      withinTable: [], // 模态窗表格数据
      moneyField: {}, // 金额
      setTableHeight: {
        isSetTableHeight: true,
        tableHeight: 300
      },
      pageNum: 1,
      pageSize: 10,
      totalNumber: 0,
      YSKJKM: '',
      modalTableColumns: [],
      editCGJE: false,
      operateColumn: {
        type: 'tools',
        title: '操作',
        width: '100',
        headerAlign: 'center',
        align: 'center',
        fixed: 'right',
        slots: {
          default: ({ row, rowIndex, column }, h) => {
            let toolBtn = [
              {
                key: 'delete',
                class: 'icon-delete',
                tip: '删除'
              }
            ]
            let toolsColumn = []
            toolBtn.forEach((el, index) => {
              let styleClass = `tools-icon-default ${el.class}`
              toolsColumn.push(<span class={styleClass} v-tip={el.tip} type="text"
                onClick={() => this.remove(rowIndex)}></span>)
            })
            return toolsColumn
          }
        }
      }
    }
  },
  computed: {
    tableHeight () {
      if (this.itemlist.length > 0) {
        return 55 + 37.33 * this.itemlist.length
      }
    },
    ...mapGetters([
      'env'
    ])

  },
  watch: {
    editable (val) {
      let columns = this.setColumnsData(this.$utils.clone(this.abroadColumns, true))
      this.abroadColumns = columns
      if (this.editable === false || (!this.canUsed && /^998[0-9]+/.test(this.targetHeader.CARDTYPE))) {
        this.abroadColumns.forEach((item, index) => {
          if (item.title === '操作') {
            this.abroadColumns.splice(index, 1)
          }
        })
      } else {
        if (!this.abroadColumns.find(i => i.title === '操作')) {
          this.abroadColumns.push(this.operateColumn)
        }
        if (this.withinColumns[0].type !== 'selection') {
          this.withinColumns.unshift(select)
        }
      }
      this.$refs.xTable.loadColumn(this.abroadColumns)
    },
    targetList: {
      immediate: true,
      handler (val) {
        let templist = clonedeep(val)
        this.itemlist = this.setTableData(templist) ? this.$utils.clone(this.setTableData(templist), true) : []
        if (this.itemlist.length > 0 && this.$refs.xTable) {
          this.setData(this.itemlist, 'change')
        }
      },
      deep: true
    }
  },
  methods: {
    vueEnter (cache) {
      if (!cache) {
        this.itemlist = []
        this.cloneList = []
        this.withinTable = []
        this.withinColumns = []
        this.abroadColumns = []
        let localKey = `${tools.getLocal('userName')}/${this.$route.params.webPath}/${this.$route.params.menuCode}`
        this.initValueList = this.targetHeader.CARDTYPE === '3' ? { ...INIT_VALUE_REQUEST } : { ...INIT_VALUE_TARGET }
        if (tools.getLocal(localKey)) {
          this.initValueList = JSON.parse(tools.getLocal(localKey))
        }
        this.itemlist = clonedeep(this.setTableData(this.targetList)) || []
        this.cloneList = this.itemlist
        let withinColumns = this.targetHeader ? this.targetHeader.children : []
        this.withinColumns = clonedeep(this.setColumnsData(withinColumns))
        this.abroadColumns = clonedeep(this.withinColumns)
        // 插入序号列
        if (this.withinColumns[0] && this.withinColumns[0].key !== 'XH') {
          this.withinColumns.unshift(number)
        }
        this.abroadColumns.unshift(tablexh)
        // 插入checkbox列
        if (this.withinColumns[0] && this.withinColumns[0].type !== 'selection') {
          this.withinColumns.unshift(select)
        }
        if (this.editable === false) {
          this.abroadColumns.forEach((item, index) => {
            if (item.slot && item.slot === 'action') {
              this.abroadColumns.splice(index, 1)
            }
          })
        } else {
          if (!this.abroadColumns.find(i => i.title === 'title')) {
            this.abroadColumns.push(this.operateColumn)
          }
        }
        this.$nextTick(() => {
          this.$refs.xTable.loadColumn(this.abroadColumns)
          this.$refs.xTable.loadData(this.itemlist)
        })
      }
    },
    // 设置数据
    setData (data, flag) {
      let newData = null
      newData = data
      if (!this.$refs.xTable) return false
      let { fullData } = this.$refs.xTable.getTableData()
      // 判断长度进行更新, 防止多增加或者删除了数据。
      // 如果长度相同不需要loadData,规避突然间不可编辑的问题
      if (this.itemlist.length === fullData.length) {
        this.itemlist.map((element, index) => {
          fullData[index] && Object.assign(fullData[index], element)
        })
      } else {
        this.$refs.xTable.loadData(newData)
      }
    },
    cellClassName ({ row, rowIndex, column, columnIndex }) {
      if ((column.property === 'JE' && !/^998[0-9]+/.test(this.targetHeader.CARDTYPE)) || column.property === 'BXJE' || column.property === 'YSJGDJ') {
        return 'col-editable'
      }
    },
    // 冲销借款带入经费申请和指标
    setAbroadTableData (row) {
      this.cloneList = row
      this.onok()
    },
    // 严格模式指标校验
    validate (_callback) {
      let valid = true
      let modCode = this.$route.params.modCode || this.$route.matched[0].name.toUpperCase()
      let billGroupParams = this.env[modCode]
      if (billGroupParams && (billGroupParams.DJZBFZXKZ === '1' || billGroupParams.JFSQFZXKZ === '1')) {
        let info = this.targetHeader.CARDTYPE === '2' ? '预算指标' : '经费申请'
        let vals = []
        Object.values(this.values).map((item) => {
          if (Array.isArray(item.data)) {
            vals = [...vals, ...item.data]
          } else {
            vals = [...vals, item.data]
          }
        })
        let verifyList = ['BMDM|BMMC', 'XMDM|XMMC', 'ZYDM|ZYMC', 'YSDWDM|YSDWMC', 'JJKM|JJMC', 'FZADM|FZAMC']
        for (let i = 6; i <= 30; i++) {
          let str = 'FZ' + i + 'DM|FZ' + i + 'MC'
          verifyList.push(str)
        }
        let titleList = []
        for (let i = 2, len = this.withinColumns.length; i < len; i++) {
          titleList.push(this.withinColumns[i].YSFIELD)
        }
        let filterVerifyList = verifyList.filter(item => {
          return titleList.indexOf(item) !== -1
          // return titleList.indexOf(item.split('|')[0]) !== -1
        })
        if (this.itemlist.length > 1) {
          for (let i = 0; i < this.itemlist.length - 1; i++) {
            for (let j = 0; j < filterVerifyList.length; j++) {
              if (this.itemlist[i][filterVerifyList[j]] !== this.itemlist[i + 1][filterVerifyList[j]]) {
                this.$fn.error({
                  title: '错误提示',
                  desc: `${info}之间有辅助项内容不同`
                })
                valid = false
              }
            }
          }
          if (valid) {
            for (let i = 0; i < vals.length - 1; i++) {
              let keys = Object.keys(vals[i])
              for (let j = 0; j < keys.length; j++) {
                if (filterVerifyList.indexOf(keys[j]) !== -1 && this.itemlist[0]) {
                  if (vals[i][keys[j]] !== this.itemlist[0][keys[j]]) {
                    this.$fn.error({
                      title: '错误提示',
                      desc: `${info}中辅助项与单据中的辅助项内容不同`
                    })
                    valid = false
                    break
                  }
                }
              }
            }
          }
        } else {
          for (let i = 0; i <= vals.length - 1; i++) {
            let keys = Object.keys(vals[i])
            for (let j = 0; j < keys.length; j++) {
              if (filterVerifyList.indexOf(keys[j]) !== -1 && this.itemlist[0]) {
                // 暂时只校验项目
                if (keys[j] === 'XMDM|XMMC') {
                  if (vals[i][keys[j]] !== this.itemlist[0][keys[j]]) {
                    this.$fn.error({
                      title: '错误提示',
                      desc: `${info}中辅助项与单据中的辅助项内容不同`
                    })
                    valid = false
                    break
                  }
                }
              }
            }
          }
        }
        _callback(valid)
      } else {
        _callback(valid)
      }
    },
    showTargetModal () {
      let mainData = Object.values(this.values).find(item => item.FIELDTYPE === -1) || { data: {} }
      let cardType = this.targetHeader.CARDTYPE
      this.initValueList = {
        ...mainData.data,
        BM: (mainData.data['BMDM|BMMC'] === ' ' ? '' : mainData.data['BMDM|BMMC']) || '',
        XM: mainData.data['XMDM|XMMC'] || ''
      }
      if (mainData.data.hasOwnProperty('ZY')) { // 主信息的摘要，对应指标选择界面的ABSTRACT
        delete this.initValueList.ZY
      }
      const _this = this
      let props = {
        baseParams: {
          GSDM: this.env.gsdm,
          KJND: this.env.kjnd,
          ZTH: this.env.zth,
          MODULE: this.$route.matched[0].name.toUpperCase()
        }
      }
      let modalTitle = '选择指标'
      if (cardType === '2') { // 选择选择指标
        props = {
          baseParams: { ...props.baseParams, YWRQ: this.env.loginDate.replace(/-/g, '') },
          ZBLB: 'MXZB',
          rowCheckBox: this.itemlist,
          initValue: this.initValueList,
          modCode: this.$route.params.modCode
        }
      } else if (cardType === '3') { // 选择经费申请
        conponents = JFSQModalSelect
        modalTitle = '选择经费申请'
        props = {
          ...props,
          initValue: this.initValueList,
          dataList: this.itemlist,
          listMainKey: 'DJGUID',
          CARDTYPE: '3',
          modCode: this.$route.matched[0].name.toUpperCase(),
          BXDLXID: Number(this.$route.params.gnflDm)
        }
      } else if (cardType === '9981' || cardType === '9982') {
        conponents = JFSQModalSelect
        modalTitle = '选择关联数据'
        props.baseParams.MLID = `${this.billId || 0}`
        props = {
          ...props,
          initValue: this.initValueList,
          dataList: this.itemlist,
          CARDTYPE: this.targetHeader.CARDTYPE,
          listMainKey: 'DJGUID',
          modCode: this.$route.matched[0].name.toUpperCase(),
          BXDLXID: Number(this.$route.params.gnflDm)
        }
      } else if (cardType === '20' || cardType === '9983') { // 网报关联采购或采购申请
        conponents = CGYSModalSelect
        modalTitle = cardType === '20' ? '选择采购验收' : '选择采购申请'
        props = {
          ...props,
          initValue: this.initValueList,
          dataList: this.itemlist,
          CARDTYPE: cardType,
          modCode: this.$route.matched[0].name.toUpperCase(),
          gpmcType: cardType === '20' ? 'CGYS' : 'CGSQ'
        }
      } else if (cardType === '31') { // 网报关联合同
        conponents = HTModalSelect
        modalTitle = '选择合同'
        props = {
          ...props,
          initValue: this.initValueList,
          dataList: this.itemlist,
          CARDTYPE: '31',
          modCode: this.$route.matched[0].name.toUpperCase()
        }
      }
      this.$modal({
        title: modalTitle,
        resize: false,
        showFooter: false,
        width: 950,
        height: 610,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(conponents, {
                props,
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (val, tableColumns) {
                    let list = clonedeep(val)
                    _this.cloneList = list
                    _this.modalTableColumns = tableColumns
                    if (_this.cloneList.length > 0) {
                      _this.onok()
                    }
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    // 点击确定按钮
    onok () {
      // 清空表单
      let cardType = this.targetHeader.CARDTYPE
      if (cardType === '20') {
        this.editCGJE = Number(this.cloneList[0]['YSJGJE']) === 0
      }
      this.elastic()
      for (let i = 0; i < this.cloneList.length; i++) {
        this.cloneList[i]['XH'] = i + 1
        this.cloneList[i]['BNXID'] = this.targetHeader.BNXID
        if (cardType === '2') {
          // 暂时先这样写
          this.cloneList[i].JE = 0
          this.dealZBKey(this.cloneList[i], false)
        } else if (cardType === '3') {
          // 经费申请数据 后台返回可用金额字段。在生成指标的时候，重写该字段。赋值为ZBJEYE。
          // 保证指标金额数据正确
          // this.cloneList[i]['KYJE'] = this.cloneList[i]['ZBJEYE']
          // 金额只和主信息金额有关系（默认是0）
          this.cloneList[i]['JE'] = 0
          this.cloneList[i]['DJID'] = this.cloneList[i]['MLID']
          this.cloneList[i]['HJJE'] = this.cloneList[i]['SQJE']
          this.cloneList[i]['DJDATE'] = this.cloneList[i]['DJDate'] || this.cloneList[i]['DJDATE'] || ''
          this.cloneList[i]['XMDM|XMMC'] = this.cloneList[i]['XMDM'] || ''
          this.cloneList[i]['JJKMDM|JJKMMC'] = this.cloneList[i]['JJKMDM'] || ''
        } else if (cardType === '20') {
          this.CGDealZBKey(this.cloneList[i])
        } else if (cardType === '31') {
          this.HTDealZBKey(this.cloneList[i])
        } else if (cardType === '9981') {
          this.cloneList[i]['JBRDM|JBRMC'] = this.cloneList[i]['GRDM|GRMC'] || ''
        } else if (cardType === '9983') {
          this.cloneList[i]['BMDM'] = this.cloneList[i]['BMDM|BMMC'] || ''
          this.cloneList[i]['XMDM'] = this.cloneList[i]['XMDM|XMMC'] || ''
        }
      }
      let list = clonedeep(this.cloneList)
      // 如果新选择的数据中包含旧数据，则保留相同的旧数据
      let newlist = list.map(element => {
        let oldItem = this.itemlist.find(item => {
          if (item.DJGUID) { //  经费申请唯一ID
            return item.DJGUID === element.DJGUID && item.ZBID === element.ZBID
          } else if (item.MXJHGUID) { // 采购明细唯一ID
            return item.MXJHGUID === element.MXJHGUID
          } else if (item.PLAN_ID) { // 合同唯一ID
            return item.PLAN_ID === element.PLAN_ID
          } else {
            return item.ZBID === element.ZBID
          }
        }) || {}
        oldItem = { ...oldItem, isOld: oldItem.DJGUID || '' }
        return { ...element, ...oldItem } // 区分是不是之前就存在的
      })
      // 留下结算方式带出的数据
      this.itemlist = this.itemlist.filter(item => item.hasOwnProperty('jsfs'))
      this.itemlist.push(...newlist)
      this.moneyProcessingAng()
      this.$emit('on-btn-click', {
        btn: 'add',
        rows: this.targetList,
        modalTableColumns: this.modalTableColumns,
        newRow: {},
        curIndex: this.targetList.length
      })
    },
    // 删除当前行
    remove (index) {
      if (this.withinTable.length > 0) {
        this.withinTable[index]['JE'] = '0.00'
      }
      if (this.itemlist.length === 0) {
        // 指标全部删除后清空弹框内表格数据
        this.withinTable = []
      } else {
        if (this.targetHeader.zblb === 'YKJH') {
          let ZBID = this.itemlist[index].ZBID
          let JHID = this.itemlist[index].JHID
          for (let idx in this.withinTable) {
            if (this.withinTable[idx].ZBID === ZBID && this.withinTable[idx].JHID === JHID) {
              break
            }
          }
        } else if (this.targetHeader.zblb === 'zb') {
          let ZBID = this.itemlist[index].ZBID
          for (let idx in this.withinTable) {
            if (this.withinTable[idx].ZBID === ZBID) {
              break
            }
          }
        }
        if (index === 0) {
          let mainData = Object.values(this.defaultValues).find(item => item.FIELDTYPE === -1) || { data: {} }
          mainData.data['BMDM|BMMC'] = mainData.data['BMDM|BMMC'] || ''
          mainData.data['XMDM|XMMC'] = mainData.data['XMDM|XMMC'] || ''
        }
        this.itemlist.splice(index, 1)
        this.cloneList.splice(index, 1)
      }
      let list = clonedeep(this.cloneList)
      this.$emit('on-update', list)
      this.$emit('on-delete', index)
      this.moneyProcessingAng()
    },
    // 点击取消按钮
    onCancel () {
      this.elastic()
    },
    tableDataInfo () {
      // 如果是单据设置预览界面,不响应相关操作
      if (this.$route.name === 'billDesign') return false
      let searchRefData = this.initValueList
      let params = {
        'gsdm': this.gsdm,
        'kjnd': this.kjnd,
        'zblb': this.targetHeader.zblb,
        'mod': this.$route.params.modCode,
        'djlxid': this.$route.params.gnflDm,
        'pageSize': this.pageSize.toString(),
        'zth': this.env.zth
      }
      let obj
      if (this.targetHeader.CARDTYPE === '3') {
        obj = {
          xmdm: searchRefData.xmdm.split(' ')[0],
          bmdm: searchRefData.bmdm.split(' ')[0],
          startDate: searchRefData.djrq[0].replace(/-/g, ''),
          endDate: searchRefData.djrq[0].replace(/-/g, ''),
          startAmount: searchRefData.jefw[0].toString(),
          endAmount: searchRefData.jefw[1].toString(),
          djbh: searchRefData.djbh
        }
        params.url = '/oer/applyForm/getGspItem'
      } else {
        obj = {
          kyje: searchRefData.kyje[0] || 0,
          ysfadm: searchRefData.ysfadm === undefined ? '' : searchRefData.ysfadm.split(' ')[0],
          zblydb: searchRefData.zblydb === undefined ? '' : searchRefData.zblydb.split(' ')[0],
          bmdm: searchRefData.bmdm.split(' ')[0],
          zbid: searchRefData.zbid,
          fz6dm: searchRefData.fz6dm === undefined ? '' : tools.eof(searchRefData.fz6dm, ' '),
          jhid: searchRefData.jhid,
          xmdm: searchRefData.xmdm.split(' ')[0], // 项目,
          zy: searchRefData.zbzy
        }
      }
      if (this.targetHeader.SBBMYSBM && this.targetHeader.SBBMYSBM === '0') {
        delete obj.bmdm
      }
      params = { ...params, ...obj }
      // 获取表格列表数据
      getTargetItem(params).then(
        res => {
          let localKey = `${tools.getLocal('userName')}/${this.$route.params.webPath}/${this.$route.params.menuCode}`
          if (res && res.data.total === 0) {
            this.withinTable = []
          } else {
            this.withinTable = this.setTableData(res.data)
          }
          let selectlist = []
          for (let i = 0, len = this.itemlist.length; i < len; i++) {
            selectlist.push(this.itemlist[i].ZBID)
          }
          // 处理回显。
          this.withinTable = this.withinTable.map((item) => {
            if (this.targetHeader.CARDTYPE === '2' && selectlist.indexOf(item.ZBID) !== -1 && selectlist.length) {
              item._checked = true
            }
            // 经费申请
            if (this.targetHeader.CARDTYPE === '3' && selectlist.indexOf(item.DJBH) !== -1 && selectlist.length) {
              item._checked = true
            }
            return item
          })
          tools.setLocal(localKey, JSON.stringify(this.initValueList))
          this.totalNumber = res.data.total // 后台返回的数据总数
        }
      )
    },
    /* 递归循环登记簿数据 表头 */
    setColumnsData (columns, widthAuto) {
      let data = JSON.parse(JSON.stringify(columns).replace(/key/g, 'field'))
      for (let i in data) {
        if (data[i].field === 'KYJE' || data[i].field === 'ZBYE' || data[i].field === 'SPLAN_JE' || data[i].field === 'YE' || data[i].field === 'HJJE' || data[i].field === 'YSJGJE' || (data[i].field === 'JE' && (/^998[0-9]+/.test(this.targetHeader.CARDTYPE)))) {
          data[i].align = 'right'
          data[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return this.$utils.commafy(row[column.property], { fixed: 2 })
          }
        } else if (data[i].field === 'JE' || data[i].field === 'BXJE' || data[i].field === 'YSJGDJ') {
          if (this.editable) {
            data[i].editRender = {
              name: 'InputNumber',
              props: {
                precision: 2,
                autoFocus: true,
                defaultValue: 0
              },
              events: {
                'on-change': ({ row, rowIndex }) => {
                }
              }
            }
          } else {
            delete data[i].editRender
          }
          data[i].align = 'right'
          data[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return this.$utils.commafy(row[column.property], { fixed: 2 })
          }
        } else if (data[i].field === 'DJBH') {
          data[i].sortable = true
          data[i].slots = {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickColumns(row)} domPropsInnerHTML={row.DJBH}></span>]
            }
          }
        } else if (data[i].field === 'KMDM|KMMC' || data[i].field === 'YSKJKMDM|YSKJKMMC' || data[i].field === 'CZYSZBID') {
          let _this = this
          if (_this.editable) {
            let key = data[i].field
            let params = {}
            let ZBParams = {}
            let fzxParams = {}
            let isZBModal = key === 'CZYSZBID'
            let title = isZBModal ? '选择财政预算指标' : '选择辅助项'
            let publicParams = {
              GSDM: _this.env.gsdm,
              KJND: _this.env.kjnd,
              ZTH: _this.env.zth,
              MODULE: _this.$route.matched[0].name.toUpperCase()
            }
            if (isZBModal) {
              let mainData = Object.values(_this.values).find(item => item.FIELDTYPE === -1) || { data: {} }
              _this.initValueList = Object.assign(_this.initValueList, mainData.data)
              if (mainData.data.hasOwnProperty('ZY')) { // 主信息的摘要，对应指标选择界面的ABSTRACT
                delete _this.initValueList.ZY
              }
              ZBParams = {
                baseParams: { ...publicParams, YWRQ: _this.env.loginDate.replace(/-/g, '') },
                ZBLB: 'MXZB',
                SFCZZB: '1',
                rowCheckBox: _this.itemlist,
                initValue: _this.initValueList,
                modCode: _this.$route.params.modCode
              }
            } else {
              fzxParams = {
                dataSource: key === 'KMDM|KMMC' ? '56' : key === 'YSKJKMDM|YSKJKMMC' ? '50' : '',
                ISCHANGE: '1',
                params: publicParams
              }
            }
            params = isZBModal ? ZBParams : fzxParams
            data[i].editRender = {
              name: 'buttonedit',
              props: {
                options: {
                  title,
                  width: isZBModal ? 950 : 500,
                  height: isZBModal ? 610 : 510,
                  resize: false,
                  showFooter: false,
                  escClosable: true,
                  customComponent: FzxSelectModal,
                  customProps: {
                    ...params
                  },
                  customEvents: {
                    complete (val, tableColumns, row, index) {
                      if (val && !isZBModal && val !== '') {
                        if (key === 'KMDM|KMMC') {
                          _this.itemlist[index]['KMDM|KMMC'] = _this.$utils.clone(val, true)
                          _this.$emit('on-change', _this.itemlist[index], index, 'KMDM|KMMC', _this.itemlist)
                        } else if (key === 'YSKJKMDM|YSKJKMMC') {
                          _this.itemlist[index]['YSKJKMDM|YSKJKMMC'] = val
                          _this.$emit('on-change', _this.itemlist[index], index, 'YSKJKMDM|YSKJKMMC', _this.itemlist)
                        }
                      } else {
                        let czyszbRow = _this.$utils.clone(val[0], true)
                        czyszbRow['CZYSZBID'] = czyszbRow.ZBID
                        delete czyszbRow.ZBID
                        czyszbRow = _this.dealZBKey(czyszbRow, true)
                        let CZYSZBID = _this.$utils.clone(czyszbRow.CZYSZBID, true)
                        _this.$set(_this.itemlist[index], 'CZYSZBID', CZYSZBID)
                        _this.mergeValues(_this.itemlist[index], czyszbRow, _this)
                        _this.$emit('on-change', _this.itemlist[index], index, 'CZYSZBID', _this.itemlist)
                      }
                    }
                  }
                }
              }
            }
          } else {
            delete data[i].editRender
          }
        } else if (data[i].field === 'ISOVER') {
          data[i].slots = {
            default: (params, h) => {
              let _this = this
              return [
                h('Checkbox', {
                  props: {
                    value: params.row[params.column.property],
                    disabled: !_this.editable,
                    'true-value': '1',
                    'false-value': '0'
                  },
                  on: {
                    'input': function (event) {
                      const index = params.rowIndex
                      _this.itemlist[index]['ISOVER'] = event ? '1' : '0'
                      params.row['ISOVER'] = event ? '1' : '0'
                      _this.$emit('on-change', params.row, index, 'ISOVER', _this.itemlist)
                    }
                  }
                })
              ]
            }
          }
          data[i].align = 'center'
        }
        data[i].headerAlign = 'center'
        data[i].minWidth = 135
      }
      return data
    },
    editClosedEvent ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      let key = column.property
      if (key === 'JE') {
        this.handleSave(row, rowIndex, key)
      } else if (key === 'YSJGDJ') {
        this.$emit('on-change', row, rowIndex, 'YSJGDJ', this.itemlist)
        row['YSJGJE'] = row.YSJGDJ * row.YSJGSL
        this.$emit('on-change', row, rowIndex, 'YSJGJE', this.itemlist)
      }
    },
    async clickColumns (row) {
      if (this.$route.matched[0].name.toUpperCase() === 'OER' && this.targetHeader.CARDTYPE === '9982' && row.DJLXBM === this.$route.params.gnflDm) {
        this.$fn.error({
          title: '错误提示',
          desc: '同种类型的单据不允许跳转'
        })
      } else {
        let cardType = this.targetHeader.CARDTYPE
        await this.beforeTurn(row, cardType).then(res => {
          let turnParams = {}
          if (cardType === '9981' || cardType === '9982' || cardType === '3') {
            turnParams = {
              name: cardType === '9981' || cardType === '3' ? 'gsp_bill' : 'oer_bill',
              id: '85ZZ' + (row.DJLXBM || row.DJLXID),
              mlid: res.MLID,
              gnflDm: '' + (row.DJLXBM || row.DJLXID),
              rowversion: res.ROWVERSION,
              title: res.DJLXMC,
              djguid: row.DJGUID
            }
          } else {
            turnParams = {
              name: cardType === '9983' ? 'gpmc-bill' : '',
              id: 'C2ZZ' + res.DJLXID,
              mlid: res.DJBH,
              fldm: res.GNFLDM,
              gnflDm: res.DJLXID,
              gnflMc: res.DJLXMC,
              title: res.DJLXMC,
              userid: res.LRR_ID,
              DJZT: res.DJZT,
              djguid: res.DJGUID,
              wokflowFlag: true
            }
          }
          this.turnToPage(turnParams)
        })
      }
    },
    // 获取跳转所需的参数
    beforeTurn (row, cardType) {
      return new Promise((resolve, reject) => {
        let params = {
          GSDM: this.$route.params.gsdm || this.env.gsdm,
          KJND: this.$route.params.kjnd || this.env.kjnd,
          ZTH: this.$route.params.zth || this.env.zth,
          CARDTYPE: cardType,
          DJBH: row.DJBH,
          DJGUID: row.DJGUID,
          DJLXBM: row.DJLXBM
        }
        this.$fn.ajax(getDJMainInfo, params, res => {
          if (res && res.status === 200) {
            resolve(res.data)
          }
        }, 0)
      })
    },
    /* 弹框确认和取消时清空查询条件 */
    elastic () {
      for (let key in this.formBudget) {
        this.formBudget[key] = ''
      }
    },
    /* 处理表格金额数据类型 */
    setTableData (tableData) {
      let data = tableData.map((value, i) => {
        let tableDataItem = { ...value }
        tableDataItem.number = parseInt(i) + parseInt(1)
        if (this.targetHeader.CARDTYPE === '2' || this.targetHeader.CARDTYPE === '3' || /^998[0-9]+/.test(this.targetHeader.CARDTYPE)) {
          tableDataItem.JE = tableDataItem.JE || 0
        } else if (this.targetHeader.CARDTYPE === '20') {
          tableDataItem.YSJGJE = tableDataItem.YSJGJE || 0
        } else if (this.targetHeader.CARDTYPE === '31') {
          tableDataItem.BXJE = tableDataItem.BXJE || 0
        }
        for (let item in tableDataItem) {
          if (item.endsWith('JE') || item === 'MONEY' || item === 'ZBYE' || item === 'YE') {
            if (tableDataItem[item] === '' || typeof tableDataItem[item] !== 'string') {
              tableDataItem[item] = tools.formatMoney(tableDataItem[item], 2, '')
            }
          }
        }
        return tableDataItem
      })
      return data
    },
    moneyProcessingAng () {
      let len = this.targetList.length
      // 通过引用类型,直接改变数据。
      let list = clonedeep(this.itemlist)
      list.map((value) => {
        for (let item in value) {
          // 暂时先这么处理。应该是用结构里的字段去对应。
          if (item.endsWith('JE') || item === 'MONEY' || item === 'ZBYE' || item === 'YE') {
            if (typeof value[item] === 'string') {
              value[item] = value[item] === '0.00' ? 0 : tools.deletComma(value[item])
            }
          }
        }
      })
      this.targetList.splice(0, len, ...list)
    },
    // 金额列失去焦点保存值
    handleSave (row, index, key) {
      this.itemlist[index][key] = tools.formatMoney(row[key])
      if (this.withinTable.length !== 0) {
        this.withinTable[index][key] = tools.formatMoney(row[key])
      }
      if (tools.deletComma(this.itemlist[index][key]) < 0) {
        this.$Message.error('金额不能输入负数，请重新输入')
        this.msg = '金额不能输入负数，请重新输入'
        this.proving = false
        this.moneyProcessingAng()
      } else {
        this.$emit('on-change', row, index, key, this.itemlist)
        this.proving = true
        this.moneyProcessingAng()
      }
    },
    mergeValues (targetData, sourceData, _this) {
      Object.keys(sourceData).forEach(key => {
        if (!targetData[key] || targetData[key] === '' || targetData[key] === 0) {
          targetData[key] = _this.$utils.clone(sourceData[key], true)
        }
      })
    },
    CGDealZBKey (item) {
      item['KYJE'] = item['ZB_YE']
      item['YSJGJE'] = Number(item.YSJGDJ) * Number(item.YSJGSL)
      item['JE'] = this.$utils.clone(item['YSJGJE'], true) // 初次带出采购信息时，验收金额=指标占用金额
      item['ZY'] = item['ZBZY']
    },
    HTDealZBKey (item) {
      item['KYJE'] = item['ZB_YE']
      item['JE'] = this.$utils.clone(item['BXJE'], true) // 初次带出合同信息时，报销金额=指标占用金额
    },
    dealZBKey (item, isCZYSZB = false) {
      item['KYJE'] = item['JE_YE']
      item['ZBLYDM|ZBLYMC'] = item['ZBLY'] ? item['ZBLY'] : ''
      item['ZJXZDM|ZJXZMC'] = item['ZJXZ'] ? item['ZJXZ'] : ''
      item['WHDM|WHMC'] = item['WH'] ? item['WH'] : ''
      item['ZBZY'] = item['ABSTRACT'] ? item['ABSTRACT'] : ''
      item['ZY'] = item['ABSTRACT'] ? item['ABSTRACT'] : ''
      if (isCZYSZB) {
        item['ZY'] = item['ABSTRACT'] ? item['ABSTRACT'] : ''
        return item
      }
    }
  },
  mounted () {
    if (!this.$route.params.tabCache) {
      this.vueEnter(false)
    }
  },
  mixins: [mixin]
}
</script>
<style lang="less" scoped>
  @import './table-select-budget.less';
</style>
