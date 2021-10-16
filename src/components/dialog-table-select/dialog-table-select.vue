<!-- 弹框表格组件
  /**
     * @param {Boolean} [modal]   - 弹框显示隐藏 [非必须] [默认:false 隐藏]
     * @param {Number} [width]    - 弹框宽度 [非必须] [默认:'800']
     * @param {String} [title]    - 弹框标题 [非必须]

     * @param {Event} [@handleOkClick] - 弹窗点击确认事件 [必须]  调用父组件的Ok事件，返回选中的树节点数据
     * @param {Event} [@handleCancel]  - 弹窗点击取消事件

  */
 -->

<template>
  <div class="table-select">
    <Modal scrollable
           class-name="vertical-center-modal"
           v-model="modalFlag"
           :title="title"
           :width="width"
           @on-ok='handleOkClick()'
           @on-cancel='handleCancelClick()'>>
      <!-- 搜索框 -->
      <div class="search-box u8-box">
        <div class="u8-bf1"
             v-if="itemList.length!==0">
          <form-group class="form-group-query"
                      :item-list="itemList"
                      :initValueList="initValueList"
                      :label-width=labelWidth
                      :showMore="true"
                      @on-change="formChange">
          </form-group>
        </div>
        <div class="search-right"
             v-if="itemList.length!==0">
          <Button type="primary"
                  @click="handleClickSearch">查询</Button>
        </div>
        <Input class="search-input"
               search
               enter-button
               placeholder="请输入搜索内容"
               style="width :350px"
               v-model="searchData"
               @on-change="searchTable"
               v-if="itemList.length===0" />
        <div class="clear-fix"></div>
      </div>
      <!--表格-->
      <data-table :columns="columns"
                  :data="filterTableData"
                  :select="select"
                  :isFixedPage=false
                  :current="pageNum"
                  @on-page-change="handlePageChange"
                  @selectiondblclick='selectiondblclick'
                  @selectionChange="getSelectData">
        <!-- <slot></slot> -->
      </data-table>
    </Modal>
  </div>

</template>

<script>
import DataTable from '_c/table/data-table'
import clonedeep from 'clonedeep'
import FormGroup from '_c/form/form-group'
export default {
  name: 'DialogTableSelect',
  components: {
    FormGroup, DataTable
  },
  data () {
    return {
      searchData: '', // 模糊搜索
      newValueList: {}, // 表单的数据
      selectTableData: [], // 表格选中数据
      pageNum: 1
    }
  },

  props: {
    modal: {
      type: Boolean, // 弹框显示隐藏
      default: false
    },
    select: {
      type: Boolean, // 是否多选
      default: false
    },
    title: { // 模态框标题
      type: String,
      default: '经费申请'
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
    itemList: { // 表单初始化结构
      type: Array,
      default: () => []
    },
    initValueList: { // 表单数据,用于监控变淡数据变化
      type: Object,
      default: () => { }
    },
    columns: { // 表格头部数据
      type: Array,
      default: () => []
    },
    tableData: { // 表格内容数据
      type: Array,
      default: () => []
    },
    filterTableData: { // 表格过滤数据
      type: Array,
      default: () => []
    },
    delData: { // 表格删除数据
      type: Array,
      default: () => []
    }
  },
  computed: {
    modalFlag: {
      get: function () {
        return this.modal
      },
      set: function (val) {
        this.$emit('modalChange', val)
      }
    },
    filterData: {
      get: function () {
        return this.tableData
      },
      set: function (val) {
        this.$emit('on-search-table', val)
      }
    }
  },
  watch: {
    itemList () {
      this.InitItemList = clonedeep(this.itemList)
    },
    modalFlag (val) {
      if (val === false) {
        this.searchData = ''
      }
    }
  },
  mounted () {
    this.setInitPage()
  },
  methods: {
    /* 页面初始化 */
    setInitPage () {
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
    /* 弹框点击确定 */
    handleOkClick () {
      this.$emit('on-ok-click', this.selectTableData)
    },
    handleCancelClick () {
      this.$emit('on-cancel-click')
    },
    /* 表单数据改变 */
    formChange (valueList) {
      this.newValueList = clonedeep(valueList)
      this.$emit('formChange', valueList)
    },
    /* 分页组件当前页签变化通知 */
    handlePageChange (val) {
      this.pageNum = val
    },
    /* 点击搜索 */
    handleClickSearch () {
      this.$emit('on-click-search', this.newValueList)
    },
    // 双击带出数据 关闭弹窗
    selectiondblclick (val) {
      let list = []
      list.push(val)
      this.selectTableData = list
      if (!this.select) {
        this.$emit('on-ok-click', this.selectTableData)
      }
      this.modalFlag = false
    },
    /* 选中数据 */
    getSelectData (val) {
      this.selectTableData = val
    }
  }
}
</script>
