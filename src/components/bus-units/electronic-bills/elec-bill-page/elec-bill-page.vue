/**
 * @name: 电子票据夹
 * @description:
 * @author: lisr
 * @date: 2020-04-01
 * @last modified by: lisr
 * @last modified time: 2020-07-17
 */
<template>
  <div :class="[`${elecClass}`]">
    <div :class="[`${elecClass}-header`]"
         v-if="isRelation&&editable">
      <div :class="[`${elecClass}-header-toolbar`]">
        <vuc-toolbar :data="btns"
                     type="default"
                     :powers="powerBtns"
                     :border="false"
                     @click="handelHeaderBtnCilck">
        </vuc-toolbar>
      </div>

    </div>
    <div :class="{'browse-style':!editable}">
      <vuc-datatable ref="xTable"
                     :tabs="tabsData"
                     :height="tableHeight"
                     :active-tab="activeTab"
                     :toolbar="toolbar"
                     showToolbar
                     row-key="FPDM"
                     :show-pager="showPager"
                     @on-tab-click='getActiveTab'
                     @on-toolbar-click="handleToolbarClick">
      </vuc-datatable>
    </div>
    <voucher-condition-modal ref="VoucherModal"
                             v-show="false"
                             :billData="GLUsedFp"
                             :ENV="env"
                             :modCode="'IEV'"
                             :onlyOneVoucher="false"
                             :modeMark="'DZPJJ'"
                             :params="voucherInfo"
                             @complete="getVoucherData">

    </voucher-condition-modal>
  </div>
</template>
<script>
import mixin from '@/libs/app-mixin'
import ElecBillPageActions from './mixins/elec-bill-page-actions'
import * as XEUtils from 'xe-utils'
import { getButtonState, getTabsData, getGridColumns, getGridData, updateAnnexAfterSaveDoc } from '@/api/pub/elec-bill-page'
import VoucherConditionModal from '_c/bus-units/voucher-condition-modal'
import {
  mapGetters
} from 'vuex'
export default {
  name: 'BaseDzpjj',
  components: {
    VoucherConditionModal
  },
  props: {
    baseParams: {
      type: Object,
      default: () => { }
    },
    isRelation: { // 是否为网报或账务中联用电子发票
      type: Boolean,
      default: true
    },
    isShowDrawer: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    mlid: {
      type: [Number, String],
      default: 0
    },
    isCancel: {
      type: Boolean,
      default: false
    },
    operateFlag: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      /* ---------------公用入参--------------- */
      frmoper: '',
      btns: [],
      tabsData: [],
      activeTab: 'all',
      /* ---------------表格--------------- */
      tableHeight: 100,
      columns: [],
      tableData: [],
      selectTableData: [],
      powerBtns: [],
      idList: [],
      fpId: '', // 发票ID
      showPager: true,
      toolbar: ['search', 'refresh'],
      modalBillData: {},
      parseValues: {}, // 上传文件识别成功后返回的数据
      elecClass: 'elec-bill-page',
      usedFpList: [],
      oldUsedFp: [], // 用于存放刚进页面时已使用的票据
      getAllData: false,
      curCancelList: [],
      curFileIndex: -1, // 当前识别手机上传发票的附件索引
      phoneFileList: [], // 手机上传的附件列表
      identifier: '',
      GLUsedFp: [],
      voucherInfo: {}, // 账务使用发票时，生成凭证需传的入参
      envParams: {},
      oldDJID: '',
      initGlFlag: false,
      fpList: [], // 支持一张图片上有多张发票的情况
      sameFileIndex: -1, // 同一张图片返回多张发票信息的索引
      sameFileInfo: {
        isLast: false,
        isSaved: false
      }
    }
  },
  computed: {
    ...mapGetters([
      'env'
    ])
  },
  watch: {
    isShowDrawer (val) {
      if (val) {
        this.initPage()
      }
    },
    operateFlag (val) {
      if (val === 'save' || val === 'saveAdd') {
        if (JSON.stringify(this.oldUsedFp) !== JSON.stringify(this.usedFpList)) { // 保存成功后如果发票使用情况有变化，则调用更新发票状态方法
          this.updateFpUsed(this.usedFpList, val).then(res => {
          })
        }
        if (val === 'saveAdd') {
          this.curCancelList = []
          this.usedFpList = []
          this.oldUsedFp = []
        }
      } else if (val === 'check' || val === 'add') { // 审核成功后，发票状态变为已报销，将前台缓存的已使用数据清空，新增也清空
        this.curCancelList = []
        this.usedFpList = []
        this.oldUsedFp = []
        if (val === 'add') {
          this.oldDJID = this.$utils.clone(this.baseParams.DJID, true)
        }
      }
    },
    isCancel (val) {
      if (val) {
        this.cancelRelationFp()
      }
    },
    mlid (val) {
      if (val === 0) {
        this.curCancelList = []
        this.oldUsedFp = []
        this.usedFpList = []
      } else if (JSON.stringify(this.oldUsedFp) === JSON.stringify(this.usedFpList)) {
        this.initUsedData()
      }
    },
    'baseParams.DJID' (val) {
      if (val.indexOf('-') !== -1 && this.baseParams.modCode === 'GL' && !this.initGlFlag) {
        this.initUsedData()
        this.oldDJID = this.$utils.clone(this.baseParams.DJID, true)
        this.initGlFlag = true
      }
    }
  },
  methods: {
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getTableData()
      }
    },
    getActiveTab (activeTab) {
      const _this = this
      switch (activeTab) {
        case 'all':
          _this.frmoper = '所有'
          break
        case '未使用':
          _this.frmoper = '未使用'
          break
        case '已使用':
          _this.frmoper = '已使用'
          break
        case '已报销':
          _this.frmoper = '已报销'
          break
      }
      _this.activeTab = activeTab
      _this.getButton()
      _this.getTableData()
    },

    /**
     * @description 查询电子票据夹表格数据
     * @param {String} ZT 状态 null所有 0未使用 1已使用 2已报销
     */
    getTableData () {
      return new Promise((resolve, reject) => {
        let params = {
          GSDM: this.baseParams.gsdm,
          KJND: this.baseParams.kjnd,
          rowversion: new Date().getTime()
        }
        if (this.baseParams.modCode === 'OER' && !this.editable) {
          params['CURTABNAME'] = '已使用'
        } else {
          params['CURTABNAME'] = this.frmoper || '所有'
        }
        if (this.baseParams.modCode !== 'IEV' && this.baseParams.modCode !== '') {
          params['MODCODE'] = this.baseParams.modCode
          params['DJLX'] = this.baseParams.DJLX ? this.baseParams.DJLX.toString() : ''
          params['DJID'] = this.baseParams.DJID ? this.baseParams.DJID.toString() : '0'
          params['EDITMODE'] = this.editable ? '0' : '1'
        }
        this.$fn.ajax(getGridData, params, res => {
          if (res.status === 200 && res.data) {
            this.tableData = res.data
            if (this.baseParams.modCode !== 'IEV' && this.baseParams.modCode !== '') { // 从基础数据进票据夹不需要做数据缓存
              this.filterData(params['CURTABNAME']) // 过滤表格数据
            }
            this.$refs.xTable.loadData(this.tableData)
            resolve(true)
          }
        })
      })
    },
    initUsedData () {
      let params = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd
      }
      params['CURTABNAME'] = '已使用'
      if (this.baseParams.modCode !== 'IEV' && this.baseParams.modCode !== '') {
        params['MODCODE'] = this.baseParams.modCode
        params['DJLX'] = this.baseParams.DJLX ? this.baseParams.DJLX.toString() : ''
        params['DJID'] = this.baseParams.DJID ? this.baseParams.DJID.toString() : '0'
        params['EDITMODE'] = this.editable ? '0' : '1'
        params['flag'] = 'used'
      }
      this.$fn.ajax(getGridData, params, res => {
        if (res.status === 200 && res.data) {
          this.usedFpList = res.data
          this.oldUsedFp = this.$utils.clone(this.usedFpList, true)
          let FPIDList = this.usedFpList.map(item => item.FPID)
          this.$emit('get-usedFp', FPIDList)
        }
      })
    },
    filterData (curState) {
      if (this.baseParams.modCode === 'OER' || this.baseParams.modCode === 'GL') {
        let tableData = this.$utils.clone(this.tableData, true)
        if (curState === '未使用') {
          tableData = this.handleFpList(tableData, this.curCancelList) // 需要与取消使用的数据合并
          if (this.usedFpList.length > 0) { // 如果有使用的发票，则进行过滤
            let newTableData = []
            tableData.forEach(item => {
              let validate = true
              this.usedFpList.forEach(i => {
                if (i.FPID === item.FPID) {
                  validate = false
                }
              })
              if (validate) {
                newTableData.push(item)
              }
            })
            this.tableData = this.$utils.clone(newTableData, true)
          } else {
            this.tableData = this.$utils.clone(tableData, true)
          }
        } else if (curState === '已使用') {
          if (this.usedFpList.length > 0) {
            this.usedFpList.forEach((item, index) => {
              this.tableData.forEach(idx => {
                if (item.FPID === idx.FPID) {
                  this.usedFpList.splice(index, 1, idx)
                }
              })
            })
          }
          this.tableData = this.$utils.clone(this.usedFpList, true)
        }
      }
    },
    // 数据去重
    handleFpList (oldData, newData) {
      let dataList = []
      newData.forEach(item => {
        let validate = true
        oldData.forEach(i => {
          if (i.FPID === item.FPID) {
            validate = false
          }
        })
        if (validate) {
          dataList.push(item)
        }
      })
      return [...oldData, ...dataList]
    },
    getTableColumns () {
      this.$fn.ajax(getGridColumns, {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd
      }, res => {
        if (res.status === 200) {
          this.columns = this.setColumnsData(res.data)
          this.columns.unshift(
            { type: 'selection', title: ' ', width: '36', fixed: 'left', isSlots: true },
            { type: 'index', title: '序号', width: '50', fixed: 'left', isSlots: true, headerAlign: 'center', align: 'center' }
          )
          this.$refs.xTable.loadColumn(this.columns)
          this.getTableData()
        }
      })
    },
    /*
    * 循环处理表格表头
    */
    setColumnsData (column) {
      let columnList = JSON.parse(JSON.stringify(column).replace(/FIELD/g, 'field').replace(/TITLE/g, 'title'))
      for (let i = 0, len = columnList.length; i < len; i++) {
        columnList[i].headerAlign = 'center'
        if (columnList[i].field === 'JSHJ') {
          columnList[i].align = 'right'
          columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
            return XEUtils.commafy(row[column.property], { fixed: 2 })
          }
        } else if (columnList[i].field === 'FPDM') {
          columnList[i].slots = {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickFPDM(row)} domPropsInnerHTML={row.FPDM}></span>]
            }
          }
        }
        columnList[i].width = '135'
      }
      return columnList
    },
    clickFPDM (row) {
      this.updateFp(row, 'readOnly')
    },
    handleClickSearch () {
      this.getTableData()
    },

    // /* 切换单位账套 */
    // handleDWZTChange ({ GSDM, ZTH, Powers }) {
    //   this.baseParams.gsdm = GSDM
    //   this.baseParams.zth = ZTH
    //   this.powerBtns = Powers
    //   this.btns = this.getButton()
    //   this.tabsData = getTabsData()
    //   this.getTableColumns()
    // },

    /* 页面大小调整,内部计算高度 */
    handlePlgDocResize ({ height }) {

    },
    getButton () {
      let params = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        CURTABNAME: this.frmoper || '所有',
        ZTH: this.baseParams.zth,
        GNFLDM: this.baseParams.gnfldm
      }
      if (this.baseParams.modCode !== 'IEV' && this.baseParams.modCode !== '') {
        params['MODCODE'] = this.baseParams.modCode
        params['DJLX'] = this.baseParams.DJLX ? this.baseParams.DJLX.toString() : ''
        params['DJID'] = this.baseParams.DJID ? this.baseParams.DJID.toString() : '0'
        params['EDITMODE'] = this.editable ? '0' : '1'
      }
      this.$fn.ajax(getButtonState, params, res => {
        if (res.status === 200 && res.data.length > 0) {
          res.data[0].type = 'primary'
          this.btns = res.data
          this.$emit('btn-success', this.btns)
        }
      })
    },
    initPage () {
      if (this.baseParams.modCode === 'OER' && !this.editable) { // 如果是网报中使用发票，在浏览状态下只显示当前单据已使用的发票
        let tabsData = getTabsData()
        this.tabsData = tabsData.filter(item => item.name === '已使用')
        // this.frmoper = '已使用'
      } else {
        this.tabsData = getTabsData()
      }
      this.getButton()
      this.getTableColumns()
    },
    updateFpUsed (data, flag) {
      return new Promise((resolve, reject) => {
        let fpList = data.map(item => item.FPID)
        let params = {
          GSDM: this.baseParams.gsdm,
          KJND: this.baseParams.kjnd,
          MODCODE: this.baseParams.modCode,
          DJID: flag === 'saveAdd' ? this.oldDJID : (this.baseParams.DJID ? this.baseParams.DJID.toString() : ''),
          DJLX: this.baseParams.DJLX ? this.baseParams.DJLX.toString() : '',
          FPIDLIST: fpList
        }
        this.$fn.ajax(updateAnnexAfterSaveDoc, params, res => {
          if (res.status === 200) {
            this.oldUsedFp = this.$utils.clone(this.usedFpList, true) // 保存成功后更新原始使用发票的值
            if (flag === 'saveAdd') {
              this.oldDJID = this.$utils.clone(this.baseParams.DJID, true)
            }
            resolve(true)
          }
        })
      })
    },
    // 单据点击取消按钮时调用
    cancelRelationFp () {
      this.usedFpList = this.$utils.clone(this.oldUsedFp, true) // 取消时值为最初使用的发票
      this.curCancelList = [] // 将取消使用的发票记录清空
      this.$emit('cancel-success')
    },
    getVoucherData (data) {
      this.$emit('get-voucher', data)
    }
  },

  mounted () {
    console.log(this.$attrs)
    if (this.mlid !== 0 && this.baseParams.modCode !== 'GL') { // 旧单刚进页面时需要获取已使用的发票
      this.initUsedData()
    }
    // if (this.isRelation && this.baseParams.modCode === 'GL') {
    //   console.log(999)
    //   this.initPage()
    // }
  },
  created () {
    // 内容区域高度 -页签高度 - 顶部 - 按钮组高度 - 表单查询区域高度 - padding固定值
    this.tableHeight = $(window).height() - 39 - 52 - 25
    if (this.baseParams.modCode === 'OER') {
      this.tableHeight = this.tableHeight - 37
    }
  },

  mixins: [mixin, ElecBillPageActions]
}
</script>
<style lang="less">
  @import './elec-bill-page.less';
</style>
