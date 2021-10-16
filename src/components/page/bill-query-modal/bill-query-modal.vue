<!-- 登记簿 页面组件：包含头部按钮组件、搜索表单组件、选项卡、内容表格、
     补充：点击行出审核日志等在父组件写

  /**
     * @param {Array} [btnData]                 - 头部按钮组数据
     * @param {Event} [@handelHeaderBtnCilck]   - 点击头部按钮,返回当前点击按钮name

     * @param {Array} [itemList]                 - 搜索表单初始化数据
     * @param {Array} [initValueList]            - 搜索表单默认数据
     * @param {Number} [labelWidth]              - 搜索表单文字宽度
     * @param {Number} [cols]                    - 搜索表单列数
     * @param {Event} [@formChange]              - 搜索表单数据变化回调
     * @param {Event} [@handleClickSearch]       - 搜索表单点击搜索按钮回调

     * @param {Array} [tabsData]                 - 选显卡页签初始化 [非必须]
     * @param {String} [activeTab]               - 选显卡页签初始化选中页签 [非必须]
     * @param {Event} [@getActiveTab]            - 选项卡切换回调
     * @param {Event} [@filterDataToParent]      - 选项卡模糊搜索回调

     * @param {Array} [columns]                  - 表格头部 [必须]
     * @param {Array} [tableData]                - 表格数据 [必须]
     * @param {Event} [@getSelectData]           - 勾选表格数据回调

  */

 -->

<template>
  <div>
    <!-- 头部按钮组 -->
    <page-header v-if="btnData.length>0"
                 :data="btnData"
                 @on-header-toolbar-click="handelBtnCilck"></page-header>

    <!-- 搜索框 -->
    <div class="search-box u8-box"
         v-if="itemList.length > 0"
         :style="{marginBottom: tabsData.length>0?'0px':'10px'}">
      <div class="u8-bf1">
        <form-group class="form-group-query"
                    :item-list="itemList"
                    :initValueList="initValueList"
                    :label-width=labelWidth
                    :showMore="true"
                    @on-change="formChange"
                    @on-expand="expandChange">
        </form-group>
      </div>
      <div class="search-right">
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
      </div>
    </div>

    <!-- 表格选项卡 -->
    <Tabs v-if="tabsData.length>0"
          :animated="false"
          v-model="activeSon">
      <TabPane v-for="item in tabsData"
               :label="item.label"
               :name="item.name"
               :key="item.name">
      </TabPane>

      <Input v-model="searchData"
             search
             enter-button
             slot="extra"
             placeholder="请输入搜索内容"
             @on-search="searchTable" />
    </Tabs>
    <div v-else
         class="src-right">
      <Input v-model="searchData"
             search
             enter-button
             slot="extra"
             style="width: 220px; float: right;"
             placeholder="请输入搜索内容"
             @on-search="searchTable" />
    </div>

    <!--表格-->
    <data-table :columns="columns"
                :data="filterData"
                :height="height"
                :current="pageNum"
                @selectionChange="selectionChange"
                @on-page-change="handlePageChange"
                @on-table-select-cancel="handleSelectCancel"
                @on-table-select="handleSelect"
                @on-table-select-all="handleSelectAll"
                @on-table-select-all-cancle="handleSelectAllCancle"
                @editorTable="editorTable">
      <slot></slot>
    </data-table>

  </div>
</template>

<script>
import PageHeader from '_c/page/page-header'
import FormGroup from '_c/form/form-group'
import DataTable from '_c/table/data-table'
import clonedeep from 'clonedeep'
export default {
  name: 'BillQueryModal',
  components: {
    PageHeader, FormGroup, DataTable
  },
  data () {
    return {
      newValueList: {}, // 表单的数据
      searchData: '', // 选项卡模糊搜索内容
      height: 0, // 表格高度
      valueList: {},
      filterData: []
    }
  },
  computed: {
    activeSon: {
      get: function () {
        return this.activeTab
      },
      set: function (val) {
        this.$emit('getActiveTab', val)
      }
    },
    pageNum: {
      get () {
        return this.current
      },
      set (val) {
        this.$emit('on-page-change', val)
      }
    }
  },
  props: {
    btnData: {
      type: Array, // 头部按钮数据
      default: () => []
    },
    itemList: {
      type: Array, // 表单初始化数据
      default: () => []
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
    columns: { // 表格头部数据
      type: Array,
      default: () => []
    },
    tableData: { // 表格内容数据
      type: Array,
      default: () => []
    },
    labelWidth: { // label宽度
      type: Number,
      default: 100
    },
    cols: { // 表单展示列
      type: Number,
      default: 3
    },
    current: { // 当前页数
      type: Number,
      default: 1
    }
  },
  watch: {
    /* 选显卡切换回调父组件getActiveTab方法，返回值为当前选中的那么值 */
    activeSon () {
      this.$emit('getActiveTab', this.activeSon)
    },
    /* 初始化赋值表格 */
    tableData: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.filterData = newVal
      }
    },
    /* 模糊筛选表格 */
    searchData () {
      // this.searchTable()
    },
    /* 模糊筛选表格数据之后，把数据传回父组件 */
    filterData: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.$emit('filterDataToParent', newVal)
      }
    }
  },
  methods: {
    /* 头部按钮点击事件集合 name为当前点击头部按钮 */
    handelBtnCilck (name) {
      this.$emit('handelHeaderBtnCilck', name)
    },
    /* 表单数据改变 返回值为新的表单数据 */
    formChange (valueList) {
      // this.newValueList = valueList
      this.valueList = clonedeep(valueList)
      this.$emit('formChange', this.valueList)
    },

    /* 搜索条件展开合并回调 */
    expandChange () {
      this.setTableHeight()
      /* let _this = this
      setTimeout(function () {
        _this.setTableHeight()
      }, 300) */
    },

    /* 搜索框点击搜索按钮 */
    handleClickSearch () {
      this.searchData = ''
      this.$emit('handleClickSearch', this.initValueList)
    },

    /* 选中数据 */
    selectionChange (selection) {
      this.$emit('getSelectData', selection)
    },

    /* 设置表格高度 */
    setTableHeight () {
      let pageHeader = 0
      if ($('.page-header').length > 0) {
        pageHeader = $('.page-header').outerHeight(true)
      }
      // this.height = parseInt(window.innerHeight) - $('.data-table').offset().top - $('.ivu-page').outerHeight(true)
      this.height = parseInt(window.innerHeight) - $('.search-box').outerHeight(true) - pageHeader -
        $('.tag-nav-wrapper').outerHeight(true) -
        $('#mainHeader').outerHeight(true) -
        $('.ivu-page').outerHeight(true) - 55
    },

    /* 模糊搜索 */
    searchTable (val) {
      const search = val || this.searchData
      let filterData = []
      if (search) {
        this.tableData.filter(data => {
          let searchFlag = this.searchInner(data, search)
          if (searchFlag) {
            filterData.push(data)
          }
        })
        this.filterData = filterData
        console.log(this.filterData)
      } else {
        this.filterData = this.tableData
        console.log(this.filterData)
      }
    },

    /* 模糊搜索内部方法 */
    searchInner (data, search) {
      return Object.values(data).some(key => {
        if (key) {
          return key.toString().indexOf(search) > -1
        }
      })
    },

    /* 分页组件当前页签变化通知 */
    handlePageChange (val) {
      this.pageNum = val
    },

    handleSelectCancel (row) {
      this.$emit('on-table-select-cancel', row)
    },
    handleSelect (row) {
      this.$emit('on-table-select', row)
    },
    handleSelectAll (selection) {
      this.$emit('on-table-select-all', selection)
    },
    handleSelectAllCancle () {
      this.$emit('on-table-select-all-cancle')
    },
    editorTable (row, name) {
      this.$emit('getSelectData', row, name)
    }
  },
  created () {
    this.$nextTick(() => {
      let _this = this
      setTimeout(function () {
        _this.setTableHeight()
      }, 300)
      this.searchTable()
    })
  }
}
</script>

<style lang="less">
    @import 'bill-query-modal.less';
</style>
