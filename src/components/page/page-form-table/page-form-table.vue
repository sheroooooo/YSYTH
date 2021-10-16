<!-- 登记簿 页面组件：包含头部按钮组件、搜索表单组件、选项卡、内容表格、
     补充：点击行出审核日志等在父组件写
  /**
     * @param {Array} [btnData]                  - 头部按钮组数据
     * @param {Event} [@handelHeaderBtnCilck]    - 点击头部按钮,返回当前点击按钮name
     * @param {Array} [itemList]                 - 搜索表单初始化数据
     * @param {Array} [initValueList]            - 搜索表单默认数据
     * @param {Number} [labelWidth]              - 搜索表单文字宽度
     * @param {Number} [cols]                    - 搜索表单列数
     * @param {Event} [@formChange]              - 搜索表单数据变化回调
     * @param {Event} [@handleClickSearch]       - 搜索表单点击搜索按钮回调
     * @param {Array} [tabsData]                 - 选显卡页签初始化 [非必须]
     * @param {String} [activeTab]               - 选显卡页签初始化选中页签 [非必须]
     * @param {Array} [columns]                  - 表格头部 [必须]
     * @param {Array} [tableData]                - 表格数据 [必须]
     * @param {String} [sum-field]               - 表格左下角合计金额字段 [非必须]
     * @param {Array} [search-field]             - 表格全局搜索字段 [非必须]
     * @param {Number} [table-height]            - 表格高度，包含页签和分页 [非必须]
     * @param {Event} [on-toolbar-click]         - 表格左上角功能、刷新、导入、导出 [必须]
     * @param {Boolean} [editable]               - 表格是否可编辑
     * @param {Boolean} [auditlog]               - 审核日志相关参数
  */
 -->

<template>
  <div class='page-form-table'>
    <!-- 头部按钮组 -->
    <page-header v-if="btnData.length>0"
                 :data="btnData"
                 :prams='auditlog'
                 @on-header-toolbar-click="handelBtnCilck"></page-header>

    <!-- 搜索框 -->
    <div v-if="itemList.length === 0 && btnData.length>0"
         style=" border-top: 1px solid #d9d9d9;"></div>
    <div ref="formPanel"
         class="plg-doc-filter search-box u8-box"
         v-else-if="itemList.length>0">
      <div class="u8-bf1">
        <form-group class="form-group-query"
                    :item-list="itemList"
                    :initValueList="initValueList"
                    :label-width='labelWidth'
                    :showMore="true"
                    :leafRequired='leafRequired'
                    @on-change="formChange"
                    @on-expand="handleOpenOrCloseForm">
        </form-group>
      </div>
      <div class="search-right">
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
      </div>
    </div>
    <slot></slot>
    <vuc-datatable ref="xTable"
                   :tabs="tabsData"
                   :row-class-name="rowClassName"
                   :height="middleHeight -30"
                   :search-props="searchField"
                   :sum-field="sumField"
                   :row-key="tableRowKey"
                   :editable='editable'
                   :active-tab="activeTab"
                   :printHeader='printHeader'
                   :footer-method="footerMethod"
                   :toolbar="toolbar"
                   showToolbar
                   :show-pager="showPager"
                   :body-context-menus="bodyContextMenus"
                   :show-info="showInfo"
                   :table-id="tableId"
                   :printTitle='printTitle'
                   :store-header="storeHeader"
                   :span-method="rowspanMethod"
                   :size="size"
                   @context-menu-click="handleContextMenuClickEvent"
                   @on-select="handleSelect"
                   @on-checked="handleChecked"
                   @on-tab-click='handleClickTab'
                   @on-edit-actived='handleEditActive'
                   @on-edit-closed='handleEditClosed'
                   @on-toolbar-click="handleToolbarClick"
                   @on-dblclick="hadledblClick">
      <slot name="header"></slot>
    </vuc-datatable>

  </div>
</template>

<script>
import PageHeader from '_c/page/page-header'
import FormGroup from '_c/form/form-group'
import clonedeep from 'clonedeep'

export default {
  name: 'PageFormTable',
  components: {
    PageHeader, FormGroup
  },
  computed: {
    activeSon: {
      get: function () {
        return this.activeTab
      },
      set: function (val) {
        this.$emit('on-tab-click', val)
        // this.$emit('getActiveTab', val)
      }
    }
  },
  props: {
    btnData: {
      type: Array, // 头部按钮数据
      default: () => []
    },
    leafRequired: {
      type: Boolean,
      default: false
    },
    itemList: {
      type: Array, // 表单初始化数据
      default: () => []
    },
    editable: {
      type: Boolean,
      default: false
    },
    initValueList: {
      type: Object, // 表单数据,用于监控变淡数据变化
      default: () => { }
    },
    tabsData: { // 选显卡页签初始化
      type: Array,
      default: () => []
    },
    activeTab: {
      type: String,
      default: () => ''
    },
    auditlog: {
      type: Object,
      default: function () {
        return {}
      }
    },
    labelWidth: { // label宽度
      type: Number,
      default: 100
    },
    sumField: { // 分页合计key
      type: String,
      default: ''
    },
    tableHeight: { // 表格高度
      type: Number,
      default: 100
    },
    searchField: { // 组件全局搜索的字段数组
      type: Array,
      default: () => []
    },
    tableRowKey: {
      type: String,
      default: 'DJBH'
    },
    footerMethod: {
      type: Function
    },
    rowClassName: {
      type: Function
    },
    toolbar: { // ['search', 'refresh', 'exp', 'imp'] 搜索，刷新，导入，导出
      type: Array, // 表格右上角按钮
      default: () => []
    },
    showPager: { // 是否显示分页 lipeng 2019-11-25 16:09:49
      type: Boolean,
      default: true
    },
    reduceHeight: {
      type: Number,
      default: 0
    },
    bodyContextMenus: { // 表格右键菜单
      type: Array,
      default: () => []
    },
    showInfo: {
      type: Boolean,
      default: true
    },
    printHeader: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 进入页面时 表单是否展开
    isOpenForm: {
      type: Boolean,
      default: false
    },
    tableId: {
      type: String,
      default: ''
    },
    storeHeader: {
      type: Boolean,
      default: true
    },
    // 相同行合并函数
    rowspanMethod: {
      type: Function
    },
    size: {
      // 表格行高 mini large
      type: String,
      default: 'mini'
    }
  },
  data () {
    return {
      newValueList: {}, // 表单的数据
      height: 0, // 表格高度
      valueList: {},
      middleHeight: this.tableHeight + 30,
      tableData: [],
      columns: [],
      printTitle: this.$route.params.title // 前段打印 打印表头默认为当前功能点的名称
    }
  },
  watch: {
    /* 选显卡切换回调父组件getActiveTab方法，返回值为当前选中的那么值 */
    activeSon () {
      this.$emit('on-tab-click', this.activeSon)
    },
    tableHeight (value) {
      this.middleHeight = value + 30
    }
  },
  inject: ['wrapHeight'],
  methods: {
    loadColumn (columns) {
      this.$refs.xTable.loadColumn(columns)
    },
    loadData (data) {
      this.tableData = data
      this.$refs.xTable.loadData(data)
    },
    // 编辑时单元格失去焦点事件
    handleEditClosed (arg) {
      this.$emit('on-edit-closed', arg)
    },
    // 编辑时单元格失去焦点事件
    handleEditActive (arg) {
      this.$emit('on-edit-actived', arg)
    },
    handleClickSearch () {
      this.$emit('handleClickSearch', this.initValueList)
    },
    /*
    * 头部按钮点击事件集合 name为当前点击头部按钮
    */
    handelBtnCilck (name) {
      this.$emit('handelHeaderBtnCilck', name)
    },

    /*
    *  表单数据改变 返回值为新的表单数据
    */
    formChange (valueList, key, node) {
      this.valueList = clonedeep(valueList)
      this.$emit('formChange', this.valueList, key, node)
    },

    /*
    *  更换大数据表格之后，添加的方法；切换选项卡页签
    */
    handleClickTab (name) {
      this.$emit('on-tab-click', name)
    },
    /*
       *  单击表格行，row为点击的行数据
       */
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.$emit('on-row-click', row)
    },

    /*
       *  多选
       */
    handleChecked (row) {
      this.$emit('on-checkd-click', row.selection, row.checked, row.row)
    },
    /*
       * 表格刷新、导入、导出
       */
    handleToolbarClick (name) {
      this.$emit('on-toolbar-click', name)
    },

    /*
       *  表格双击事件
       */
    hadledblClick ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      // console.log(row)
      this.$emit('on-double-click', row, rowIndex)
    },

    /*
       * 表格初始化合计
       */
    getUpdataPagerInfo () {
      this.$nextTick(() => {
        this.$refs.xTable.updatePagerInfo()
      })
    },
    /*
       * 表格底部合计行实时刷新
       */
    getUpdateFooter () {
      this.$nextTick(() => {
        this.$refs.xTable.updateFooter()
      })
    },
    /*
       * 高亮时，单选
       */
    getTableFullData () {
      return this.$refs.xTable.getTableData().fullData
    },

    // 表格右键事件 menu：选择的菜单项；row：当前行数据；column：当前列表头属性
    handleContextMenuClickEvent ({ menu, row, column }) {
      this.$emit('on-menu-click', menu, row, column)
    },

    /*
       * 查询展开关闭
       * flag：true 展开
       * flag: false 关闭
       */
    handleOpenOrCloseForm (flag) {
      this.$emit('on-expand', flag)
      if (flag) {
        this.middleHeight = this.wrapHeight() - this.$refs.xTable.$el.offsetTop + 10 - this.reduceHeight
      } else {
        this.middleHeight = this.wrapHeight() - this.$refs.xTable.$el.offsetTop + 10 - this.reduceHeight
      }
    }
  }
}
</script>

<style lang="less">
  @import 'page-form-table.less';
</style>
