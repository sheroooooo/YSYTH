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
  <div class="sider-tree-table-query"
       style="height:100%">
    <!-- 头部按钮组 -->
    <page-header v-if="btnData.length>0"
                 :data="btnData"
                 @on-header-toolbar-click="handelBtnCilck"></page-header>
    <Split v-model="split"
           :style="{height:`${clientHeight - 8}px`}">
      <div slot="left"
           class="split-panle">
        <slot name="leftTree"></slot>
      </div>
      <div slot="right"
           class="split-panle-right">
        <!-- 搜索框 -->
        <div class="search-box u8-box"
             :style="{marginBottom: tabsData.length>0?'0px':'10px'}"
             v-if="itemList.length!==0">
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
        <!--表格-->
<!--        <data-table :columns="columns"-->
<!--                    :data="filterData">-->
<!--          <slot></slot>-->
<!--        </data-table>-->
        <vuc-datatable ref="xTable"
                       :tabs="tabsData"
                       :height="height"
                       row-key="_XID"
                       :editable='editable'
                       :active-tab="activeTab"
                       :toolbar="[]"
                       showToolbar
                       :show-pager="true"
                       :table-id="tableId"
                       @on-tab-click='handleClickTab'
                       @on-select="handleSelect"
                       @on-checked="handleChecked">
          <slot name="header"></slot>
        </vuc-datatable>
      </div>
    </Split>
  </div>
</template>

<script>
import tools from '@/libs/toolutil'
import PageHeader from '_c/page/page-header'
import FormGroup from '_c/form/form-group'
import DataTable from '_c/table/data-table'
import clonedeep from 'clonedeep'

export default {
  name: 'SiderTreeTableQuery',
  components: {
    PageHeader, FormGroup, DataTable
  },
  data () {
    return {
      newValueList: {}, // 表单的数据
      searchData: '', // 选项卡模糊搜索内容
      height: 0, // 表格高度
      valueList: {},
      tableData: [],
      clientHeight: 0,
      split: 0.25
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
    tableId () {
      return 'SiderTreeTableQuery' + tools.getLocal('userCode')
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
    labelWidth: { // label宽度
      type: Number,
      default: 100
    },
    cols: { // 表单展示列
      type: Number,
      default: 3
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    /* 选显卡切换回调父组件getActiveTab方法，返回值为当前选中的那么值 */
    activeSon () {
      this.$emit('getActiveTab', this.activeSon)
    }
  },
  /* mounted () {
    // this.initValueList = $.extend(true, {}, this.initValueList)
  }, */
  created () {
    this.$nextTick(() => {
      let _this = this
      setTimeout(function () {
        _this.setTableHeight()
      }, 300)
    })
    this.clientHeight = window.innerHeight - 40 - 40 - 46
  },
  methods: {
    loadColumn (columns) {
      this.$refs.xTable.loadColumn(columns)
    },
    loadData (data) {
      this.tableData = data
      this.$refs.xTable.loadData(data)
    },
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
    },

    /* 搜索框点击搜索按钮 */
    handleClickSearch () {
      this.searchData = ''
      this.$emit('handleClickSearch', this.initValueList)
    },

    /* 设置表格高度 */
    setTableHeight () {
      this.height = this.clientHeight
    },

    /* 模糊搜索内部方法 */
    searchInner (data, search) {
      return Object.values(data).some(key => {
        return key.toString().indexOf(search) > -1
      })
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
    }
  }
}
</script>

<style lang="less">
    @import 'sider-tree-table-query.less';
</style>
