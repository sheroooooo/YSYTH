<template>
  <div class="zbys-form">
    <Table ref="myTable"
           :columns="abroadColumns"
           border
           highlight-row
           size="small"
           :data="itemlist"
           v-if="itemlist.length > 0 || !editable"
           style="margin-bottom: 15px;"
           @on-row-click="handleEdit">
      <template slot-scope="{ row, index }"
                :slot="'JE'">
        <InputNumber type="number"
                     v-model="moneyField"
                     v-if="editIndex === index"
                     @on-blur="handleSave(row, index)"
                     @on-focus="inputFocus(row, index)"
                     v-focus
                     style="width: 100%"
                     class="direction" />
        <span style="text-align: right;display: block;"
              v-else>{{ row.JE }}</span>
      </template>
      <template slot-scope="{ row, index }"
                slot="action">
        <Icon type="ios-trash-outline"
              v-on:click.stop="remove(index)"
              size="20" />
      </template>
    </Table>
    <Button type="primary"
            @click="zbBtn()"
            v-if="editable">选择{{targetHeader ? targetHeader.title : ''}}</Button>
    <Modal :title="targetHeader ? targetHeader.title : ''"
           v-model="modal"
           :styles="{top: '20px'}"
           :draggable="true"
           :scrollable="true"
           width="800"
           @on-ok='onok()'
           @on-cancel='onCancel()'>
      <!-- 搜索框 -->
      <div class="search-box u8-box">
        <div class="u8-bf1">
          <form-group class="form-group-query"
                      :item-list="oerList"
                      :initValueList="initValueList"
                      :label-width='labelWidth'
                      :showMore="true"
                      @on-change="formChange">
          </form-group>
        </div>
        <div class="search-right">
          <Button type="primary"
                  @click="handleClickSearch">查询</Button>
        </div>
        <div class="clear-fix"></div>
      </div>
      <!--表格-->
      <data-table ref="dataTable"
                  :columns="withinColumns"
                  :data="withinTable"
                  :totalNumber="totalNumber"
                  :isWebPage=true
                  :isFixedPage=false
                  :height="350"
                  :setTableHeight="setTableHeight"
                  :current="pageNum"
                  @on-page-change="handlePageChange"
                  @on-table-select="handleTableSelect"
                  @on-table-select-all='handleTableSelect'
                  @on-table-select-all-cancle='handleTableAllSelectCancel'
                  @on-table-select-cancel='handleTableSelectCancel'
                  @on-pagesize-change="handlePagesizeChange">
      </data-table>
    </Modal>
  </div>
</template>

<script>
import { getTargetItem, gspQueriesTow } from '@/api/gsp/gsp_bill'
import FormGroup from '_c/form/form-group'
import DataTable from '_c/table/data-table'
import tools from '@/libs/toolutil'
import clonedeep from 'clonedeep'
import mixin from '@/libs/app-mixin'
import {
  mapGetters
} from 'vuex'
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
const operation = {
  title: '操作',
  slot: 'action',
  width: 100,
  align: 'center',
  fixed: 'right'
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
  align: 'left',
  fixed: 'left'
}

export default {
  name: 'TableSelectFund',
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
    }
  },
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
      oerList: [], // 查询条件初始化
      modal: false, // 弹出窗口控制参数
      external: [], // 表格数据
      itemlist: [],
      cloneList: [], // 选中数据
      abroadColumns: [], // 模态窗外表头数据
      withinColumns: [], // 模态窗内表头数据
      withinTable: [], // 模态窗表格数据
      moneyField: 0, // 金额
      editIndex: -1, // 当前聚焦的输入框的行数
      cloneData: [], // 克隆数据，弹窗取消还原数据
      setTableHeight: {
        isSetTableHeight: true,
        tableHeight: 300
      },
      pageNum: 1,
      pageSize: 10,
      totalNumber: 0,
      editAreaKey: ''
    }
  },
  computed: {
    ...mapGetters([
      'env'
    ])
  },
  watch: {
    editable (val) {
      if (this.editable === false) {
        this.abroadColumns.splice(-1, 1)
      } else {
        this.abroadColumns.push(operation)
        if (this.withinColumns[0].type !== 'selection') {
          this.withinColumns.unshift(select)
        }
        // this.moneyProcessingAng()
      }
    },
    targetList: {
      immediate: true,
      handler (val) {
        let templist = clonedeep(val)
        this.itemlist = this.setTableData(templist) || []
        if (val.length === 0) {
          this.itemlist = []
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
        this.oerList = gspQueriesTow(this.targetHeader.CARDTYPE)
        let withinColumns = this.targetHeader ? this.targetHeader.children : []
        this.withinColumns = clonedeep(this.setColumnsData(withinColumns))
        this.abroadColumns = clonedeep(this.withinColumns)
        let tableTitleIndex = this.abroadColumns.findIndex(item => item.YSFIELD === 'JE')
        if (tableTitleIndex !== -1) {
          let { __id, ...normalAttr } = this.abroadColumns[tableTitleIndex]
          this.abroadColumns.splice(tableTitleIndex, 1, {
            title: '本次占用金额',
            slot: 'JE',
            width: '120',
            align: 'right',
            ...normalAttr
          })
        }
        let activeItem = this.targetHeader.children.find(item => item.YSFIELD === 'JE')
        if (activeItem && activeItem !== -1) {
          this.editAreaKey = activeItem.YSDM
        }
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
          this.abroadColumns.splice(-1, 1)
        } else {
          this.abroadColumns.push(operation)
        }
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
      let modCode = this.$route.params.modCode
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
          titleList.push(this.withinColumns[i].key)
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
          for (let i = 0; i < vals.length - 1; i++) {
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
    // 点击选择预算指标
    zbBtn () {
      this.modal = true
      this.pageNum = 1
      let mainData = Object.values(this.values).find(item => item.FIELDTYPE === -1) || { data: {} }
      let initValue = this.targetHeader.CARDTYPE === '3' ? INIT_VALUE_REQUEST : INIT_VALUE_TARGET
      this.initValueList = {
        ...initValue,
        bmdm: mainData.data['BMDM|BMMC'] || '',
        xmdm: mainData.data['XMDM|XMMC'] || ''
      }
      this.handleClickSearch()
      // this.cloneData = clonedeep(this.$refs.dataTable.$refs.outgoodsTable.objData)
    },
    // 点击确定按钮
    onok () {
      // 清空表单
      this.elastic()
      for (let i = 0; i < this.cloneList.length; i++) {
        this.cloneList[i]['XH'] = i + 1
      }
      let list = clonedeep(this.cloneList)
      // 选完指标后 用户更改金额 再次选择指标后原有的金额不清空
      if (this.itemlist.length > 0) {
        for (let i = 0; i < list.length; i++) {
          let index = this.itemlist.findIndex(item => item.ZBID === list[i].ZBID)
          if (index !== -1) {
            list[i].JE = this.itemlist[index].JE
          }
        }
      }
      // this.itemlist = list
      // 希望经费申请可以添加多条数据（不会覆盖冲销借款带出的数据）
      for (let i = 0; i < this.itemlist.length; i++) {
        if (!this.itemlist[i].jsfs) { // 经费申请带出的数据
          this.itemlist.splice(i, 1)
        }
      }
      for (let item of list) {
        this.itemlist.push(item)
      }
      //
      this.moneyProcessingAng()
      this.$emit('on-btn-click', { btn: 'add', rows: this.targetList, newRow: {}, curIndex: this.targetList.length })
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
        // 取消表格内勾选
        // let _index = 0
        if (this.targetHeader.zblb === 'YKJH') {
          let ZBID = this.itemlist[index].ZBID
          let JHID = this.itemlist[index].JHID
          for (let idx in this.withinTable) {
            if (this.withinTable[idx].ZBID === ZBID && this.withinTable[idx].JHID === JHID) {
              // _index = parseInt(idx)
              break
            }
          }
        } else if (this.targetHeader.zblb === 'zb') {
          let ZBID = this.itemlist[index].ZBID
          for (let idx in this.withinTable) {
            if (this.withinTable[idx].ZBID === ZBID) {
              // _index = parseInt(idx)
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
      this.moneyProcessingAng()
    },
    // 点击取消按钮
    onCancel () {
      this.elastic()
      // this.$refs.dataTable.$refs.outgoodsTable.objData = this.cloneData
    },
    // 选中事件
    handleTableSelect (val) {
      var group = Array.isArray(val) ? [...val] : [val]
      group.map((item) => {
        this.withinTable[item.number - 1]._checked = true
      })
      this.cloneList = [...this.withinTable.filter(item => item._checked)]
    },
    handleTableSelectCancel (val) {
      val._checked = false
      let index = this.cloneList.findIndex(item => item.number === val.number)
      if (index !== -1) {
        this.cloneList.splice(index, 1)
      }
    },
    // 全选取消选中
    handleTableAllSelectCancel (val) {
      var group = Array.isArray(val) ? [...val] : [val]
      this.withinTable.map(item => {
        let index = group.find(i => i.number === item.number)
        if (index === undefined || index === -1) {
          item._checked = false
        }
      })
      this.cloneList = this.withinTable.filter(item => item._checked)
    },
    /* 点击搜索框 返回表单搜索数据 */
    handleClickSearch (valueLise) {
      this.tableDataInfo()
    },
    /* 表单数据变化 */
    formChange (val) {
      this.initValueList = { ...val }
    },
    /* 分页组件当前页签变化通知 */
    handlePageChange (val) {
      this.pageNum = val
    },
    /* 分页获取每页显示多少条 */
    handlePagesizeChange (val) {
      this.pageSize = val
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
    setColumnsData (data, widthAuto) {
      for (let i in data) {
        data[i].tooltip = true
        if (data[i].children) {
          data[i].align = 'center'
          this.setColumnsData(data[i].children)
        } else {
          data[i].minWidth = 200
          data[i].align = 'center' // 修改表头居中，金额右对齐
          if (data[i].key.endsWith('JE')) {
            data[i].render = (h, params) => {
              let key = params.column.key || params.column.name
              let val = params.row[key]
              return h('div', {
                style: {
                  'text-align': 'right'
                }
              }, val)
            }
          } else if (data[i].key === 'JHID' || data[i].key === 'ZBID') {
            data[i].width = '80'
          }
          // if (data[i].key === 'JHJE' || data[i].key === 'SHJE' || data[i].key === 'HJJE' || data[i].key === 'JHTZJE' || data[i].key === 'ZBJE' || data[i].key === 'JE' || data[i].key === 'KYJE' || data[i].key === 'JHJSRQ' || data[i].key === 'JHKSRQ') {
          //   data[i].className = 'ivu-table-column-right'
          // }
        }
      }
      return data
    },
    /* 弹框确认和取消时清空查询条件 */
    elastic () {
      for (let key in this.formBudget) {
        this.formBudget[key] = ''
      }
    },
    /* 处理表格金额数据类型 */
    setTableData (tableData) {
      tableData.forEach((value, i) => {
        value.number = parseInt(i) + parseInt(1)
        if (this.targetHeader.CARDTYPE === '2' || this.targetHeader.CARDTYPE === '3') {
          // value.MONEY = value.hasOwnProperty('MONEY') ? value.MONEY : ''
          value.JE = value.JE || ''
        }
        for (let item in value) {
          if (item === 'JHJE' || item === 'JHTZJE' || item === 'SHJE' || item === 'HJJE' || item === 'JE' || item === 'KYJE' || item === 'MONEY' || item === 'ZBJE') {
            if (value[item] === '' || typeof value[item] !== 'string') {
              value[item] = tools.formatMoney(value[item], 2, '')
            }
          }
        }
      })
      return tableData
    },
    // 对金额列进行处理
    moneyProcessing () {
      this.external = []
      let data = {
        external: this.external,
        proving: this.proving,
        msg: this.msg
      }
      for (let i in this.itemlist) {
        let obj = Object.assign({}, this.itemlist[i])
        this.external.push(obj)
      }
      for (let i in this.external) {
        this.external[i].ZBJE = tools.deletComma(this.external[i].ZBJE + '')
        this.external[i].KYJE = tools.deletComma(this.external[i].KYJE + '')
        this.external[i].QCJE = tools.deletComma(this.external[i].QCJE + '')
        this.external[i].SYJE = tools.deletComma(this.external[i].SYJE + '')
        this.external[i].YSJE = tools.deletComma(this.external[i].YSJE + '')
        this.external[i].SHJE = tools.deletComma(this.external[i].SHJE + '')
        this.external[i].HJJE = tools.deletComma(this.external[i].HJJE + '')
      }
      return data
    },
    moneyProcessingAng () {
      let len = this.targetList.length
      // 通过引用类型,直接改变数据。
      let list = clonedeep(this.itemlist)
      list.map((value) => {
        for (let item in value) {
          // 暂时先这么处理。应该是用结构里的字段去对应。
          if (item === 'JHJE' || item === 'JHTZJE' || item === 'JE' || item === 'HJJE' || item === 'SHJE' || item === 'KYJE' || item === 'MONEY' || item === 'ZBJE') {
            if (typeof value[item] === 'string') {
              value[item] = value[item] === '0.00' ? 0 : tools.deletComma(value[item])
            }
          }
        }
      })
      this.targetList.splice(0, len, ...list)
    },
    // 点击金额列可编辑
    handleEdit (data, index) {
      if (!this.editable) {
        this.editIndex = -1
      } else {
        this.editIndex = index
        this.inputFocus(data, index)
      }
    },
    inputFocus (data, index) {
      if (!data['JE'] || data['JE'] === '0.00') {
        this.moneyField = 0
      } else {
        this.moneyField = Number(data['JE'].replace(/,/g, ''))
      }
    },
    // 金额列失去焦点保存值
    handleSave (row, index) {
      this.editIndex = -1
      this.itemlist[index]['JE'] = tools.formatMoney(this.moneyField)
      if (this.withinTable.length !== 0) {
        this.withinTable[index]['JE'] = tools.formatMoney(this.moneyField)
      }
      if (tools.deletComma(this.itemlist[index]['JE']) < 0) {
        this.$Message.error('金额不能输入负数，请重新输入')
        this.msg = '金额不能输入负数，请重新输入'
        this.proving = false
        this.moneyProcessingAng()
      } else {
        this.$emit('on-change', this.values, index, this.moneyField, this.itemlist)
        this.proving = true
        this.moneyProcessingAng()
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
  @import './table-select-fund';
</style>
