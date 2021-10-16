<template>
  <div class="modal-table">
    <template v-if="readonly && !row">
      <template v-if="disabled">
        <Input v-model="inputValue"
               :disabled="disabled"
               readonly
               :placeholder='placeholder'
               @mouseout.native="handleInputBlur(inputValue)"
               v-if="inputshow">
        <Icon type="ios-more"
              slot="suffix"
              v-if="!showClearIcon" />
        <Icon type="ios-close-circle"
              slot="suffix"
              v-else
              @click.stop="handleBtnClear" />
        </Input>
      </template>
      <template v-else>
        <template>
          <Input v-model="inputValue"
                 :disabled="disabled"
                 readonly
                 :placeholder='placeholder'
                 @click.native="handleBtnClick($event)"
                 @mouseover.native="handleInputFocus"
                 @mouseout.native="handleInputBlur(inputValue)"
                 v-if="inputshow">
          <Icon type="ios-more"
                slot="suffix"
                v-if="!showClearIcon" />
          <Icon type="ios-close-circle"
                slot="suffix"
                v-else
                @click.stop="handleBtnClear" />
          </Input>
        </template>
      </template>
    </template>
    <template v-else-if='!readonly && !row'>
      <Input v-model="inputValue"
             @mouseout.native="handleInputBlur(inputValue)"
             :placeholder='placeholder'
             @on-change="handleInputChange"
             v-if="inputshow">
      <Icon @click.native="handleBtnClick()"
            type="ios-more"
            slot="suffix" />
      </Input>
    </template>
    <Modal scrollable
           class-name="vertical-center-modal"
           v-model="modal"
           v-if='!row'
           :title="title"
           :width="width"
           :z-index='500'
           @on-ok='handleOkClick()'>
      <div>
        <!-- 搜索框 -->
        <div v-if="itemList.length!==0">
          <div class="plg-doc-filter search-box"
               style="margin:8px 0">
            <form-group-clone class="form-group-query"
                              :item-list="itemList"
                              :initValueList="initValueList"
                              :label-width='labelWidth'
                              :cols="name === 'czy'? 3 : dataSource === '166' ? 1 : 2"
                              :showMore="true"
                              :default-open="itemKey==='KHYH'?true:false"
                              @on-change="formChange"
                              @on-expand="handleOpenOrCloseForm">
            </form-group-clone>
            <template>
              <div class="search-right"
                   v-if="itemList.length !==0 ">
                <Button type="primary"
                        style="margin: 0 0 10px 0"
                        @click="handleClickSearch">查询</Button>
              </div>
            </template>
          </div>
          <div class="clearfloat"></div>
        </div>
        <vuc-datatable ref="xTable"
                       :editable='true'
                       :row-key="idFiled||itemKey||'_XID'"
                       :select="select"
                       :height="height"
                       :search-props="searchField"
                       :toolbar="toolbar"
                       :showToolbar="toolbar.length !== 0"
                       highlight-current-row
                       @on-dblclick="handleOkClick"
                       @on-select="getSelectData"
                       @on-checked="handleChecked">
        </vuc-datatable>
      </div>
    </Modal>
    <div v-if='row'
         class='single-table'>
      <div class='table-wrapper'>
        <div v-if="itemList.length!==0">
          <div class="plg-doc-filter search-box"
               style="margin:8px 0">
            <form-group-clone class="form-group-query"
                              :item-list="itemList"
                              :initValueList="initValueList"
                              :label-width='labelWidth'
                              :cols="name === 'czy'? 3 : dataSource === '166' ? 1 : 2"
                              :showMore="true"
                              :default-open="itemKey==='KHYH'?true:false"
                              @on-change="formChange"
                              @on-expand="handleOpenOrCloseForm">
            </form-group-clone>
            <template>
              <div class="search-right"
                   v-if="itemList.length !==0 ">
                <Button type="primary"
                        style="margin: 0 0 10px 0"
                        @click="handleClickSearch">查询</Button>
              </div>
            </template>
          </div>
          <div class="clearfloat"></div>
        </div>
        <vuc-datatable ref="xTable"
                       :editable='true'
                       :row-key="idFiled||itemKey||'_XID'"
                       :select="select"
                       :height="height"
                       :search-props="searchField"
                       :toolbar="toolbar"
                       :showToolbar="toolbar.length !== 0"
                       highlight-current-row
                       @on-dblclick="handleOkClick"
                       @on-select="getSelectData"
                       @on-checked="handleChecked">
        </vuc-datatable>
      </div>
      <div class="footer-btn-group"
           style='padding: 0px 0px 0px 0px; text-align: right'>
        <Button type="primary"
                style='margin-left: 10px'
                @click='handleOkClick'
                class="footer-btn">确定</Button>
        <Button class="footer-btn"
                style='margin-left: 10px'
                @click="$emit('close')">取消</Button>
      </div>
    </div>
  </div>
</template>
<script>
import { getModalTableData, getListInfo, zbQueries, getCMSKRColumns, getWirteOffMoney, WZSLTableHead, zbidTableHead, CRKTableHead, jhidTableHead, bankInfoTableHead, mxxTableHead, qtsrTableHead, getSaCzy, getZyxxTree, getBankInfo, getSKRColumns } from '@/api/pub/table-select'
import { getFZXSelect } from '@/api/pub/dialog-tree-select'
import tools from '@/libs/toolutil'
import * as XEUtils from 'xe-utils'
import clonedeep from 'clonedeep'
import FormGroupClone from '_c/form/form-group/form-group-clone.vue'

export default {
  name: 'TableSelect',
  components: {
    FormGroupClone
  },
  data () {
    return {
      gsdm: '',
      kjnd: '',
      zth: '',
      djlxid: '',
      modal: false,
      modalFlag: false,
      inputValue: '',
      itemList: [], // 表单初始化结构
      initValueList: {},
      columns: [], // 表头
      tableData: [], // 表格全部数据
      filterTableData: [], // 过滤的表格数据
      showClearIcon: false,
      searchField: [],
      // 模态参数
      searchData: '', // 模糊搜索
      newValueList: {}, // 表单的数据
      selectTableData: [], // 表格选中数据
      pageNum: 1,
      password: 'identity', // 右侧密码
      passwordVal: '', // 输入的密码
      selected: [], // 勾选的数据selected
      height: 400, // 表格高度
      ZYXXData: [],
      ZBCXTJ: {} // 指标界面查询条件
    }
  },
  props: {
    dataType: { // 类型
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    dataSource: {
      type: String,
      default: ''
    },
    title: {
      type: String, // 弹出框标头
      default: ''
    },
    select: {
      type: Boolean, // 是否多选
      default: false
    },
    width: { // 模态框宽度
      type: Number,
      default: 800
    },
    labelWidth: { // label宽度
      type: Number,
      default: 100
    },
    cols: { // 表单展示列
      type: Number,
      default: 3
    },
    delData: { // 表格删除数据
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
    inputshow: { // 是否显示输入框
      type: Boolean,
      default: true
    },
    modalshow: { // 是否显示模态
      type: Boolean,
      default: false
    },
    name: { // key 区分获取表格数据接口
      type: String,
      default: ''
    },
    itemKey: {
      type: String,
      default: ''
    },
    parentData: { // 组件表单数据
      type: Object,
      default: function () {
        return {}
      }
    },
    value: {
      type: String,
      default: ''
    },
    withParentData: {
      type: Boolean,
      default: true
    },
    code: {
      type: String,
      default: ''
    },
    ID: { // 角色管理ID
      type: String,
      default: ''
    },
    czyGsdm: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    toolbar: {
      type: Array,
      default: () => []
    },
    idFiled: {
      type: String,
      default: ''
    },
    // 此两项应该是 当数据源为-1时,从外界传入
    tableDataProps: {
      type: Array,
      default: () => {
        return []
      }
    },
    tableColumnsProps: {
      type: Array,
      default: () => {
        return []
      }
    },
    ZBLB: {
      type: String,
      default: 'MXZB'
    },
    row: {
      default: '',
      type: [String, Object]
    },
    _root: {
      default: '',
      type: [String, Object]
    }
  },
  watch: {
    value () {
      if (this.inputValue !== this.value) {
        this.inputValue = this.value
      }
    },
    modal (val) {
      this.pageNum = 1
      this.passwordVal = ''
      this.password = 'identity'
      this.modalChange(val)
      if (val === false) {
        this.searchData = ''
      }
      this.$emit('modal-change', val)
    },
    modalshow (val) {
      this.modal = val
      if (val) {
        this.pageNum = 1
        this.handleBtnClick()
      }
    },
    // 系统管理引入职员监控引入类型刷新
    newValueList: {
      deep: true,
      handler (value, oldValue) {
        if (value.FLAG && value.FLAG !== oldValue.FLAG) {
          this.getTableData()
        }
      }
    },
    tableDataProps () {
      this.getTableData()
    },
    tableColumnsProps () {
      this.getTableData()
    }
  },
  computed: {
    filterData: {
      get: function () {
        return this.tableData
      },
      set: function (val) {
        this.filterTableData = val
      }
    }
  },
  inject: {
    wrapHeight: {
      from: 'wrapHeight',
      default: () => {
        return () => 600
      }
    },
    billValueStore: {
      from: 'billValueStore',
      default: () => {
        return () => { }
      }
    },
    activeIndex: {
      from: 'activeIndex',
      default: () => {
        return () => 0
      }
    }
  },
  methods: {
    handleBtnClick () {
      if (this.name === 'PZH') this.$emit('on-click-more')
      if (this.parentData && this.parentData.LEN !== 1 && this.name === 'SQMX') {
        this.$Message.error('请选择一条经费报销')
      } else if (this.name === 'YSSQDBM' || this.name === 'CGSQBM') {
        this.modal = true
        this.selectTableData = []
        this.getTableData()
        this.$emit('on-change', this.inputValue)
      } else {
        if (this.name === 'YSZB') {
          this.modalFlag = true
        } else {
          this.modal = true
        }
        this.selectTableData = []
        this.getTableData()
      }
    },
    handleInputFocus () {
      this.showClearIcon = this.inputValue !== ''
    },
    handleInputBlur (val) {
      // 可以手动输入操作员编码
      this.$emit('on-blur-change', val)
      this.showClearIcon = false
    },
    handleInputChange () {
      if (this.modal) return false
      this.$emit('on-change', this.inputValue, null)
    },
    getCgZb (val) {
      this.$emit('on-change', val)
    },
    /* 弹框点击确定 */
    handleOkClick () {
      let rows = []
      if (this.name === 'czy') {
        rows = this.$refs.xTable.getCheckedData()
      } else {
        rows = this.selectTableData
      }
      if (rows.length === 1) {
        if (this.name === 'xzczy') {
          this.inputValue = rows[0].ZYDM
        } else if (this.dataSource === '59') {
          this.inputValue = rows[0].SKR
        } else if (this.name === 'CGSQBM') {
          this.inputValue = rows[0].CGSQBM
        } else if (this.name === 'ZTBBM') {
          this.inputValue = rows[0].ZTBBM
        } else if (this.dataSource === '300') {
          this.inputValue = rows[0].JKDJBH
        } else if (this.name === 'zbid') {
          this.inputValue = rows[0].ZBID
        } else if (this.name === 'jhid') {
          this.inputValue = rows[0].JHID
        } else if (this.dataSource && typeof this.dataSource === 'string' && this.dataSource.indexOf('[ZD]') !== -1) {
          let row = this.transInputValue(rows[0])
          let strValue = row[this.name].split(' ')
          this.inputValue = strValue[1] ? strValue[1].toString() : ''
        } else if (this.name === 'khsf') {
          this.inputValue = `${rows[0].PROVID} ${rows[0].PROVINCE}`
        } else if (this.name === 'khcs') {
          this.inputValue = `${rows[0].AREACODE} ${rows[0].AREA_NAME}`
        } else if (this.name === 'yhhh') {
          this.inputValue = `${rows[0].BANK_CODE} ${rows[0].BANK_NAME}`
        } else if (this.name === 'yhjg') {
          this.inputValue = `${rows[0].DEPID} ${rows[0].DEP_NAME}`
        } else if (this.name === 'mxxData') {
          this.inputValue = `${rows[0].QTXZXMDM} ${rows[0].GZXMC}`
        } else if (this.name === 'czy') {
          this.inputValue = `${rows[0].ZYDM} ${rows[0].ZYXM}`
        } else if (this.name === 'CZYSZBID') {
          rows[0]['CZYSZBID'] = rows[0].ZBID
          delete rows[0].ZBID
        } else {
          let row = this.transInputValue(rows[0])
          this.inputValue = row[this.name].toString() // 控制台报错 类型应为字符串
        }
        this.$emit('on-change', this.inputValue, rows[0])
      } else {
        this.$emit('on-change', this.inputValue, rows.selection)
      }
      // 用户管理引入职员
      let selectdata = rows
      if (this.name === 'czy' || this.name === 'role') {
        if (rows.length === 0) {
          this.$fn.error({ desc: ' 请勾选操作数据 ' })
          return false
        }
        let data = {
          tableValue: selectdata,
          password: this.newValueList.passType,
          passwordVal: this.newValueList.password
        }
        this.$emit('on-select', data)
      } else if (this.name === 'qtsr') {
        this.$emit('on-select', selectdata[0])
      }
      this.modal = false
    },
    handleBtnClear () {
      this.inputValue = ''
      this.$emit('on-change', this.inputValue, [])
    },
    transInputValue (row) {
      let obj = this.parentData || {}
      if (this.name === 'SQMX') {
        // 报销明细 数据特殊处理
        Object.keys(row).forEach(key => {
          // 报销明细选择数据特殊处理
          if (key.substr(0, 2) !== 'SQ') {
            if (key !== 'JFGC' && key !== 'ZY' && key !== 'SYJE') {
              row[`SQ${key}`] = row[key]
              if (key === 'DJ' || key === 'SL' || key === 'JE') {
                delete row[key]
              }
            }
          }
        })
        if (row.hasOwnProperty('SQJE') && row.hasOwnProperty('SYJE')) {
          row['YE'] = row['SQJE'] - row['SYJE']
        }
      }
      // 数据赋值 避免直接合并产生大量垃圾数据
      Object.keys(obj).forEach(key => {
        if (row.hasOwnProperty(key)) {
          if (!(this.name === 'ZBID' && key === 'ZY')) { // 选预算指标不给摘要带值
            obj[key] = row[key]
          }
        }
      })
      return obj
    },
    modalChange (val) {
      this.$emit('no-modal-change', val)// 返回模态窗状态
    },
    getDataByDataSource (data) {
      let relationType = this.parentData._expanded ? 'bnx' : 'bwx'
      let children = []
      if (this.withParentData) { // 是否需要关联关系
        for (let key in this.parentData) {
          let obj = {}
          obj.sjly = tools.getdataSources(key)
          if (obj.sjly) {
            obj.value = this.parentData[key]
            children.push(obj)
          }
        }
      }
      return new Promise((resolve, reject) => {
        let params = {
          sjly: this.dataSource,
          zth: this.$store.state.app.env.zth,
          relationType: relationType,
          children: children,
          ...data
        }
        getFZXSelect({ params }).then(res => {
          if (res && res.data) resolve(res.data)
        })
      })
    },
    /* 请求后台，获取表格数据 */
    getTableData () {
      console.log(this.name, 222)
      // 支持数据源为-1的情况。尽量减少该组件代码结合业务
      if (this.dataSource === '-1') {
        this.tableData = this.tableDataProps || []
        this.filterTableData = this.tableData
        this.columns = this.tableColumnsProps || []
        // let tableData = null
        // let tableColumns = null
        // // 单据设置 支持不同行的明细，弹出表格的表头和数据不同
        // let result = Object.values(this.tableDataProps).find(i => {
        //   return Array.isArray(i)
        // })
        // if (!result) {
        //   tableData = this.tableDataProps || []
        //   tableColumns = tableColumnsProps || []
        // } else {
        //   let index = this.activeIndex()
        //   tableData = this.tableDataProps[index] || []
        //   tableColumns = tableColumnsProps[index] || []
        // }
        // this.filterTableData = this.tableData = tableData
        // this.columns = tableColumns
        this.columns.map(item => {
          item.headerAlign = 'center'
        })
        this.$nextTick(() => {
          this.$refs.xTable.loadColumn(this.columns)
          this.$refs.xTable.loadData(this.filterTableData)
          this.$refs.xTable.updatePagerInfo()
        })
        return true
      }
      let data = {
        gsdm: this.gsdm,
        kjnd: this.kjnd,
        name: this.name,
        djlxid: this.djlxid
      }
      if (this.dataSource === '300') {
        // 如果dataSource是300,那么就是冲销借款弹出表格,请求特定表头
        getWOMTableTitle(data).then(res => {
          if (res && res.data) {
            this.columns = this.setColumnsData(res.data)
            this.columns.map(item => {
              item.headerAlign = 'center'
            })
            this.$nextTick(() => {
              this.$refs.xTable.loadColumn(this.columns)
            })
          }
        })
        let { whje, date, zy, bmdm, grdm } = this.newValueList
        data = {
          ...data,
          zy,
          bmdm: bmdm.split(' ')[0],
          grdm: grdm.split(' ')[0],
          beginDjdate: date[0] ? date[0].replace(/-/g, '') : '',
          endDjdate: date[1] ? date[1].replace(/-/g, '') : '',
          beginWhje: (whje[0] || whje[0] === 0) ? whje[0].toFixed(2) : '',
          endWhje: (whje[1] || whje[1] === 0) ? whje[1].toFixed(2) : '',
          name: 'wob',
          czyId: tools.getLocal('userCode')
        }
      } else if (this.dataSource === '59' && this.itemKey !== 'SKR') {
        data.jsfs = this.parentData['JSFSDM|JSFSMC'] ? this.parentData['JSFSDM|JSFSMC'].split(' ')[0] : ''
        data.skr = '' // 搜索使用的参数，暂时未添加搜索功能。
        data.sjly = this.dataSource
        data.djlxid = this.initRoute.params.gnflDm
        data.name = 'receiverList'
      } else if (this.dataSource === '165') {
        data.CODE = this.initValueList.CODE
        data.PROJECT_NAME = this.initValueList.PROJECT_NAME
      } else if (this.dataSource === '166') {
        data.CODE = this.initValueList.CODE
        data.PLAN_NAME = this.initValueList.PLAN_NAME
      } else if (this.dataSource === 'fzr') {
        if (this.parentData.BMDM === '') {
          this.$fn.error({ title: '错误提示', desc: '请选择部门！' })
          this.modal = false
          return false
        }
        let params = {
          gsdm: this.gsdm,
          kjnd: this.kjnd,
          departmentCode: this.parentData.BMDM
        }
        getChargingPersonByDepartmentCode(params).then(
          res => {
            if (res && res.status === 200) {
              let columns = getXMFZRColumns()
              let data = res.data
              this.columns.map(item => {
                item.headerAlign = 'center'
              })
              this.$nextTick(() => {
                this.$refs.xTable.loadColumn(columns)
                this.$refs.xTable.loadData(data)
                this.$refs.xTable.updatePagerInfo()
              })
            }
          })
        return true
      } else if (this.name === 'SKR' || this.name === 'NAME') {
        let JSFS = this.parentData['JSFSDM|JSFSMC'] ? this.parentData['JSFSDM|JSFSMC'].split(' ') : []
        data.jsfs = JSFS.length > 1 ? JSFS[1] : ''
        data.jsfsdm = JSFS[0]
        data.modCode = this.itemKey
      } else if (this.name === 'SQMX') {
        data.djlxid = this.parentData.DJLXID + ''
        data.djguid = this.parentData.DJGUID + ''
      } else if (this.name === 'DYDJBH_CK' || this.name === 'DYDJBH_RK' || this.name === 'DYDJBH_SLD') {
        let lx = {
          'DYDJBH_CK': 'CKD',
          'DYDJBH_RK': 'RKD',
          'DYDJBH_SLD': 'WZSLD'
        }
        data.DJLXID = lx[this.name]
        data.GSDM = data.gsdm
        data.KJND = data.kjnd
        data.url = '/inv/ckd/selectMlList'
      } else if (this.name === 'CODE') {
        data.HTSFLX = this.newValueList.fs
      } else if (this.name === 'PLAN_ID') {
        data.code = this.parentData.CODE
      } else if (this.name === 'YGDZCMC') {
        let BM = 'BMDM|BMMC'
        data.zth = this.zth
        data.ysdw = this.newValueList.YSDW === '' ? this.gsdm : this.newValueList.YSDW.split(' ')[0]
        data.sybmdm = this.newValueList[BM] === '' ? '' : this.newValueList[BM].split(' ')[0]
      } else if (this.name === 'czy' || this.name === 'xzczy') {
        delete (data['gsdm'])
        delete (data['kjnd'])
        data.GSDM = this.czyGsdm
        data.KJND = this.kjnd
        data.FLAG = this.newValueList.FLAG === '_' ? '' : this.newValueList.FLAG
      } else if (this.name === 'role') {
        data.ID = this.ID
        data.KJND = this.kjnd
      } else if (this.name === 'zb' || this.name === 'ZBID') {
        data.gsdm = this.gsdm
        data.kjnd = this.kjnd
        data.zth = this.zth
        data.zblb = 'MXZB'
        data.mod = this.initRoute.params.modCode
        data.djlxid = this.initRoute.params.gnflDm
        data.pageSize = '10'
      } else if (this.name === 'zbid') {
        data.djlxid = '-1'
        data.gsdm = this.gsdm
        data.kjnd = this.kjnd
        data.zth = this.zth
        data.czycode = this.$store.state.app.user.czyCode
        data.date = tools.initDate()[1]
      } else if (this.name === 'jhid') {
        data.djlxid = '-1'
        data.gsdm = this.gsdm
        data.kjnd = this.kjnd
        data.zth = this.zth
        data.czycode = this.$store.state.app.user.czyCode
        data.date = tools.initDate()[1]
      } else if (this.name === 'CGSQBM') {
        if (this.djlxid === '6') {
          let mainData = Object.values(this.billValueStore()).find(i => i.CARDTYPE === '-1')['data']
          data.ZTBBDGUID = mainData['ZTBBDGUID']
        }
        if (this.djlxid === '7') data.url = '/gpmc/procurementAcceptanceResultRegister/getPurchasingRequisition'
        if (this.djlxid === '8') data.url = '/gpmc/procurementAcceptanceApplicationEntry/selectProcurementApplicationInfo'
      } else if (this.name === 'YSSQDBM') {
        data.url = '/gpmc/procurementAcceptanceApplicationEntry/selectProcurementApplicationInfo'
      } else if (this.name === 'khsf' || this.name === 'khcs' || this.name === 'yhhh' || this.name === 'yhjg') {
        data.PROVID = this.parentData.khsf === '' ? '' : this.parentData.khsf.split(' ')[0]
        data.AREACODE = this.parentData.khcs === '' ? '' : this.parentData.khcs.split(' ')[0]
        data.DEPID = this.parentData.yhjg === '' ? '' : this.parentData.yhjg.split(' ')[0]
        let param = {
          'yhhh': '1',
          'khsf': '2',
          'khcs': '3',
          'yhjg': '4'
        }
        delete data.gsdm
        delete data.kjnd
        data.GSDM = this.gsdm
        data.KJND = this.kjnd
        data.FLAG = param[this.name]
        data.name = 'bank'
      } else if (this.name === 'qtsr') {
        data.djlxid = this.initRoute.params.gnflDm + ''
      } else if (this.itemKey === 'KHYH') {
        data.PROVINCE = this.newValueList.PROVINCE === '' ? '' : this.newValueList.PROVINCE.split(' ')[0]
        data.CITY = this.newValueList.CITY === '' ? '' : this.newValueList.CITY.split(' ')[0]
        data.BANK = this.newValueList.BANK === '' ? '' : this.newValueList.BANK.split(' ')[0]
        data.FILTER = this.newValueList.FILTER === '' ? '' : this.newValueList.FILTER
      } else if (this.name === 'mxxData') { // 其他薪资明细项
        // qtsrlx 其他收入类型 [0其他收入，1劳务费，2津补贴，3奖助学金]
        // 劳务费：901，其他收入：902，津补贴：904
        let qtsrlx = {
          '901': '1',
          '902': '0',
          '903': '3',
          '904': '2'
        }
        data.gsdm = this.gsdm
        data.kjnd = this.kjnd
        data.lxdm = ['1']
        data.lbdm = ['01']
        data.qtsrlx = qtsrlx[this.initRoute.params.gnflDm]
      }
      getModalTableData(data).then(async (res) => {
        if (!res || !res.data) return false
        if (this.dataSource === '300') {
          this.tableData = res.data.map((item) => {
            let str = JSON.stringify(item).replace(/]/g, '').replace(/\[/g, ' ')
            return JSON.parse(str)
          })
          this.filterTableData = this.tableData
        } else if (this.dataSource === '59' && this.itemKey !== 'SKR') {
          let data = res.data
          data.map(item => {
            Object.keys(item).map(key => {
              if (key !== key.toUpperCase()) {
                item[key.toUpperCase()] = item[key]
                delete item[key]
              }
            })
          })
          this.filterTableData = data
          this.columns = getTableTitle(this.parentData['JSFSDM|JSFSMC'])
        } else if (this.name === 'CODE') {
          this.columns = this.setColumnsData(getTitleList(this.name))
          this.columns.unshift({ type: 'index', title: '序号', width: '60', fixed: 'left' })
          this.filterTableData = res.data
        } else if (this.name === 'PLAN_ID') {
          this.columns = getTitleList(this.name)
          this.columns = this.setColumnsData(this.columns)
          this.tableData = res.data.map((item) => {
            item.PLAN_TIME = (new Date(item.PLAN_TIME)).Format('yyyy-MM-dd hh:mm:ss')
            return item
          })
          this.filterTableData = this.tableData
        } else if (this.itemKey === 'KHYH') { // 网报-结算方式-开户银行
          let columns = res.data.titleList
          this.columns = this.setColumnsData(columns)
          this.tableData = res.data.infoList
          this.filterTableData = this.tableData
        } else if (this.itemKey === 'SKR') { // 网报-结算方式-收款人
          let skrColumns = getSKRColumns()
          let currentJSFS = this.parentData['JSFSDM|JSFSMC'] ? this.parentData['JSFSDM|JSFSMC'].split(' ') : []
          if (currentJSFS.length > 1 && currentJSFS[1].indexOf('公务卡') !== -1) {
            skrColumns.forEach(item => {
              if (item.key === 'YHZH') {
                item.title = '公务卡号'
                item.key = 'GWKH'
              }
            })
          }
          this.columns = this.setColumnsData(skrColumns)
          this.tableData = res.data
          this.filterTableData = this.tableData
        } else if ((this.name === 'SKR' || this.name === 'SKRYH' || this.name === 'SKZH') && this.itemKey === 'CM') { // 出纳收款人
          let skrColumns = getCMSKRColumns()
          this.columns = this.setColumnsData(skrColumns)
          this.tableData = res.data.map(item => {
            let obj = {
              SKR: item.SKR,
              SKRYH: item.KHYH,
              SKZH: item.YHZH
            }
            return obj
          })
          this.filterTableData = this.tableData
        } else if (this.name === 'czy') {
          await this.getZyxxTree()
          this.columns = [
            { type: 'selection', title: ' ', width: '40', fixed: 'left' },
            { type: 'index', title: '序号', width: '60', fixed: 'left' },
            { title: '职员代码', field: 'ZYDM' },
            { title: '职员姓名', field: 'ZYXM' },
            { title: '部门', field: 'ZYBM' },
            {
              field: 'CZY',
              title: '操作员',
              width: '160',
              editRender: {
                name: 'dialog',
                props: {
                  options: {
                    type: 'tree',
                    title: '请选择操作员',
                    idField: 'id',
                    textField: 'title',
                    showCheckbox: false,
                    showToolbar: false,
                    leafRequired: true,
                    width: 800,
                    data: this.ZYXXData,
                    formatter: (row) => { // 单选时有效
                      if (row.BMMC) {
                        this.$fn.error({ title: '错误提示', desc: '不能选择树结构父级部门信息' })
                      } else {
                        return row.title
                      }
                    },
                    onChange ({ $table, row, rowIndex, column, columnIndex, value, itemData }) { }
                  }
                }
              }
            }
          ]
          this.tableData = this.setTableData(res.data)
          this.filterTableData = res.data
        } else if (this.name === 'role') {
          this.columns = roleHeader()
          this.columns = this.setColumnsData(this.columns)
          this.columns.unshift(
            { type: 'selection', title: ' ', width: '40', fixed: 'left' },
            { type: 'index', title: '序号', width: '60', fixed: 'left' }
          )
          this.tableData = this.setTableData(res.data.DATA)
          this.selected = res.data.SELECTED
          this.filterTableData = this.tableData.map((item) => {
            if (this.selected.indexOf(item.ID) !== -1) {
              item._checked = true
              this.selectTableData.push(item)
            }
            return item
          })
        } else if (this.name === 'xzczy') {
          this.columns = [
            { title: '职员代码', field: 'ZYDM', headerAlign: 'center' },
            { title: '职员姓名', field: 'ZYXM', headerAlign: 'center' },
            { title: '部门', field: 'BM', headerAlign: 'center' },
            { title: '操作员', field: 'CZY', headerAlign: 'center' }
          ]
          this.tableData = res.data
          this.filterTableData = this.tableData
        } else if (this.name === 'CGSQBM') {
          let columnsAddClick = this.djlxid === '7' ? getYscgsqColumns() : getCgsqColumns()
          this.columns = tools.dealColumns(columnsAddClick, '130')
          this.columns.unshift(
            { type: 'index', title: '序号', minWidth: '50', fixed: 'left' }
          )
          this.tableData = res.data.data
          this.filterTableData = this.tableData
        } else if (this.name === 'YSSQDBM' && this.djlxid === '8') { // 采购 验收结果登记 选择验收申请编号后暂不做处理
        } else if (this.name === 'ZTBBM') {
          this.columns = getZbColumns()
          let columnsAddClick = this.setColumnsData(this.columns)
          this.columns = tools.dealColumns(columnsAddClick, '130')
          this.columns.unshift(
            { type: 'index', title: '序号', minWidth: '50', fixed: 'left' }
          )
          this.tableData = res.data.data
          this.filterTableData = this.tableData
        } else if (this.name === 'zbid' || this.name === 'ZBID') {
          this.columns = this.setColumnsData(zbidTableHead())
          this.filterTableData = res.data
        } else if (this.name === 'jhid') {
          this.columns = jhidTableHead()
          this.filterTableData = res.data
        } else if (this.name === 'khsf' || this.name === 'khcs' || this.name === 'yhhh' || this.name === 'yhjg') {
          let columns = bankInfoTableHead()
          this.columns = columns[this.name]
          this.columns.unshift({ type: 'index', title: '序号', width: '50', fixed: 'left' })
          this.filterTableData = res.data
        } else if (this.name === 'mxxData') {
          this.columns = this.setColumnsData(mxxTableHead())
          this.filterTableData = res.data.filter(item => item.ISYS)
        } else if (this.name === 'DYDJBH_CK' || this.name === 'DYDJBH_RK') {
          this.columns = this.setColumnsData(CRKTableHead())
          this.filterTableData = res.data
        } else if (this.name === 'DYDJBH_SLD') {
          this.columns = this.setColumnsData(WZSLTableHead())
          this.filterTableData = res.data
        } else if (this.name === 'qtsr') {
          this.columns = this.setColumnsData(qtsrTableHead())
          this.filterTableData = res.data
        } else {
          this.columns = this.setColumnsData(res.data.titleList)
          this.tableData = res.data.infoList.map((item) => {
            let str = JSON.stringify(item).replace(/]/g, '').replace(/\[/g, ' ')
            return JSON.parse(str)
          })
          this.filterTableData = this.tableData
        }
        this.columns.map(item => {
          if (item.type !== 'selection') {
            item.headerAlign = 'center'
          }
        })
        this.$nextTick(() => {
          this.$refs.xTable.loadColumn(this.columns)
          this.$refs.xTable.loadData(this.filterTableData)
          this.$refs.xTable.updatePagerInfo()
        })
      })
    },
    setColumnsData (column) {
      // 冲销借款表头 中的字段是 field和key。需要全部替换
      let columnList = JSON.parse(JSON.stringify(column).replace(/field/g, 'title').replace(/key/g, 'field'))
      for (let i = 0, len = columnList.length; i < len; i++) {
        columnList[i].headerAlign = 'center'
        columnList[i].minWidth = '135'
        if (columnList[i].field === 'END_TIME') {
          columnList[i].align = 'right'
          columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            if (row.hasOwnProperty(column.property)) {
              return (new Date(row[column.property])).Format('yyyy-MM-dd hh:mm:ss')
            }
          }
        } else if (columnList[i].field === 'HT_TYPE') {
          columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            if (row['HTSFLX'] === 'F') {
              row[column.property] = '付款合同'
            } else {
              row[column.property] = '收款合同'
            }
            return XEUtils.toString(row[column.property])
          }
        } else if (columnList[i].field === 'JKJE' || columnList[i].field === 'JKZBJE' || columnList[i].field === 'JKZBYHJE' || columnList[i].field === 'JKYHJE' || columnList[i].field === 'DJJE' || columnList[i].field === 'JE' || columnList[i].field === 'BIAODI' || columnList[i].field === 'PLAN_JE' || columnList[i].field === 'SYJE' || columnList[i].field === 'BXJE' || columnList[i].field === 'YE') {
          columnList[i].align = 'right'
          columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return XEUtils.commafy(row[column.property], { fixed: 2 })
          }
        } else if (columnList[i].field === 'ISYS') { // 指标是否启用
          columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return row[column.property] === '1' ? '是' : '否'
          }
        } else if (columnList[i].field === 'LWFJSBL') { // 计税比例
          columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return `${XEUtils.commafy(row[column.property], { fixed: 2 })} %`
          }
        }
        if (columnList[i].children) {
          for (let j = 0, childLen = columnList[i].children.length; j < childLen; j++) {
            if (columnList[i].children[j].width) {
              delete columnList[i].children[j].width
            }
            columnList[i].children[j].headerAlign = 'center'
            columnList[i].children[j].minWidth = '135'
          }
        }
      }
      return columnList
    },
    // 获取表格高度
    setTableHeight () {
      let _this = this
      _this.height = _this.$refs.xTable.$el.offsetHeight - 35
      setTimeout(function () {
        let height = _this.$refs.xTable.$el.offsetHeight - 35
        if (height > 410) {

        } else {
          _this.height = height
        }
      }, 300)
    },
    handleOpenOrCloseForm (flag) {
      this.height = this.wrapHeight() - this.$refs.xTable.$el.offsetTop
      if (this.height > 400) {
        this.height = 400
      }
    },
    // 页面初始化
    setInitPage () {
      if (this.name === 'YGDZCMC') {
        this.itemList = getListInfo()
        this.initValueList = {
          'YSDW': '',
          'BMDM|BMMC': ''
        }
      } else if (this.name === 'zb' || this.name === 'ZBID') {
        this.itemList = zbQueries()
        this.initValueList = {
          'ysfadm': '', // 预算方案
          'zblydb': '', // 指标来源
          'bmdm': '', // 部门
          'zblx': '', // 指标类型
          'zy': '', // 摘要
          'jhid': '', // 计划ID
          'xmdm': '', // 项目
          'kyje': [1]// 不显示余额为0
        }
      } else if (this.dataSource === '300') {
        this.itemList = getWirteOffMoney()
        this.initValueList = {
          'date': '',
          'zy': '',
          'bmdm': '',
          'grdm': '',
          'whje': ''
        }
      } else if (this.name === 'czy') {
        this.itemList = getSaCzy()
        this.initValueList = {
          'FLAG': '_',
          'passType': 'initial',
          'password': ''
        }
      } else if (this.itemKey === 'KHYH') {
        this.itemList = getBankInfo()
        this.initValueList = {
          'PROVINCE': '',
          'CITY': '',
          'BANK': '',
          'FILTER': ''
        }
      }
      this.newValueList = clonedeep(this.initValueList)
    },
    /* 模糊搜索 */
    searchTable (val) {
      this.filterData = this.tableData.filter((item) => {
        if (JSON.stringify(item).indexOf(this.searchData) !== -1) {
          return item
        }
      })
    },
    /* 表单数据改变 */
    formChange (valueList) {
      this.newValueList = clonedeep(valueList)
      // 引入职员切换引入类型调用表格接口
      if (this.name === 'czy' && this.newValueList.passType === 'identity') {
        this.initValueList = { ...this.newValueList, password: '' }
        this.itemList[2].readOnly = true
      } else {
        this.itemList[2].readOnly = false
      }
      this.$emit('form-change', valueList)
    },
    /* 点击搜索 */
    handleClickSearch () {
      this.getTableData()
    },
    // 单击带出数据 点确定关闭弹窗
    getSelectData (val) {
      for (let i in val.row) {
        if (typeof val.row[i] === 'string' && val.row[i].indexOf('span') !== -1) {
          val.row[i] = this.$utils.text(val.row[i])
        }
      }
      let arr = []
      arr.push(val.row)
      this.selectTableData = arr
    },
    // 多选
    handleChecked (val) {
      this.selectTableData = val
    },
    // 表格内容修改
    setTableData (tableData) {
      tableData.forEach((value, i) => {
        value.number = parseInt(i) + parseInt(1)
      })
      return tableData
    },
    async getZyxxTree () {
      let parmas = {
        GSDM: this.gsdm,
        KJND: this.kjnd
      }
      await getZyxxTree(parmas).then(res => {
        this.ZYXXData = tools.formatDataToTree(res.data, { pId: 'pId', id: 'id', text: 'title' })
      }
      )
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.inputValue = this.value
      this.setInitPage()
      this.row && this.handleBtnClick()
    })
  },
  created () {
    if (this.row && this._root) {
      this.$store = { state: this._root.$state }
      this.initRoute = this._root.$route
      Object.assign(this.parentData, this.row)
    } else {
      this.initRoute = this.$route
    }
    let ENV = this.initRoute.params.ENV || this.$store.state.app.env // 单据设置增加切换单位账套的部分。
    this.gsdm = ENV.gsdm
    this.kjnd = ENV.kjnd
    this.zth = ENV.zth
    this.djlxid = `${this.initRoute.params.gnflDm}`
  }
}

</script>

<style lang="less">
  @import 'table-select.less';
</style>
