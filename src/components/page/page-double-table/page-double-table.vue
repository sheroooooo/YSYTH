/*
 * @description: '账务-备查簿页面组件-双表格'
 * @Author: zhaoyy
 * @Date: 2019-12-017
 * @Last Modified by:
 * @Last Modified time:
 * @Parmas 入参：
 *           单位账套：headerConfig:['dw','zt'],
 *           头部按钮：btnData:[]
 */
 <template>
  <plg-doc-wrapper class="page-double-table"
                   ref="plgDoc"
                   :header-config="headerConfig"
                   @on-resize="handlePlgDocResize"
                   @on-change="handleDWZTChange"
                   @on-select="handleZTSelect">
    <vuc-toolbar slot="sufHeader"
                 type="default"
                 :data="btnData"
                 :powers="powerBtns"
                 @click="handleBtnClick">
    </vuc-toolbar>
    <slot slot="drawer"></slot>
    <div slot="filterGroup"
         :style={height:formGroupsHeigth}
         class="filter-group">
      <div class="form-groups"
           ref='formGroups'>
        <form-group ref='formGroup'
                    :item-list="itemList"
                    :initValueList="initValueLists"
                    :label-width="labelWidth"
                    :showMore="true"
                    @on-change="formChange"
                    @on-expand='onExpand'>
        </form-group>
      </div>
      <div class="search-right">
        <Button type="primary"
                @click="handleClickSearch">查询</Button>
      </div>
    </div>
    <div>
      <vuc-datatable ref="topTable"
                     row-key='PJHS'
                     :height="topHeights"
                     @on-select="handleSelect">
      </vuc-datatable>
      <vuc-datatable ref="bottomTable"
                     v-if='tableShow'
                     class='bottomTable'
                     row-key='PJHS'
                     :showToolbar='showToolbar'
                     :tabs="tabs"
                     active-tab="0"
                     :toolbar="[]"
                     :height='bottomHeight'
                     @on-select="handleBottomSelect"
                     @on-tab-click="handleTabClick">
      </vuc-datatable>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import tools from '@/libs/toolutil'
import FormGroup from './form-group'
import clonedeep from 'clonedeep'
export default {
  components: { FormGroup },
  name: 'PageDoubleTable',
  props: {
    bsList: {
      type: String,
      default: ''
    },
    headerConfig: {
      type: Array, // 是否显示单位、账套  默认显示，传空不显示
      default: () => ['dw', 'zt']
    },
    btnData: {
      type: Array, // 头部按钮组
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
    labelWidth: {
      type: Number, // label宽度
      default: 100
    },
    topHeight: {
      type: Number, // 上表格高度
      default: 200
    },
    topColumns: {
      type: Array, // 上表格表头
      default: () => []
    },
    topTableData: {
      type: Array, // 上表格数据
      default: () => []
    },
    tableShow: {
      type: Boolean, // 下表格是否显示
      default: false
    },
    tabs: {
      type: Array, // 下表格滑动切换数组
      default: () => []
    },
    bottomHeight: {
      type: Number,
      default: 200
    },
    bottomColumns: {
      type: Array,
      default: () => []
    },
    showToolbar: {
      type: Boolean,
      default: true
    },
    modalCode: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      valueList: {},
      height: '',
      itemLists: [],
      initValueLists: {}, // 顶部表单的最新数据
      bottomTableData: [], // 下表单数据
      STATUS: '0', // 下表格滑动默认被选中的按钮
      index: 0, // 下表格
      formGroupsHeigth: 20,
      topHeights: 0,
      powerBtns: []
    }
  },
  methods: {
    /*
    * 切换单位账套
    */
    handleDWZTChange ({ GSDM, ZTH, GSItem, TYPE, ZTItem, Powers }) {
      if (Powers) this.powerBtns = Powers
      this.$emit('handle-dwzt-change', { GSDM, ZTH, TYPE, Powers: this.powerBtns })
    },
    handleZTSelect ({ TYPE, item }) {
      const { GSDM, ZTH } = item.itemData
      this.$emit('handle-zt-select', { GSDM, ZTH, TYPE })
    },
    handlePlgDocResize ({ height, width }) {
      this.$nextTick(() => {
        this.$refs.topTable.loadColumn(this.topColumns)
        if (this.bottomColumns.length > 0) {
          this.$refs.bottomTable.loadColumn(this.bottomColumns)
        }
      })
      this.$emit('handle-plg-doc-resize', { height, width })
    },
    // 头部按钮点击事件
    handleBtnClick (val, rowItem) {
      let parmas = {
        val: val,
        rowItem: rowItem
      }
      this.$emit('handle-btn-click', parmas)
    },
    // 上表格行点击事件
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.bottomTableAssignment(rowIndex)
    },
    // 底部表格行点击事件
    handleBottomSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.$emit('handle-bottom-select', row)
    },
    // 底部表格赋值
    bottomTableAssignment (index) {
      this.index = index
      setTimeout(() => {
        this.bottomTableData = []
        if (this.topTableData.length > 0 && this.topTableData[index] && this.topTableData[index][this.bsList].length > 0) {
          this.bottomTableData = this.topTableData[index][this.bsList]
        } else if (this.topTableData[index - 1]) {
          this.bottomTableData = this.topTableData[index - 1][this.bsList]
        } else {
          this.bottomTableData = []
        }
        this.$refs.bottomTable.loadData(this.bottomTableData)
        this.handleTabClick(this.STATUS)
      }, 0)
    },
    // 底部表头切换事件
    handleTabClick (status) {
      const field = this.bottomColumns[this.bottomColumns.length - 1].field
      let filterBottomTableData = []
      if (this.btnData[0].name === 'certificateMaking' || this.btnData[0].name === 'cancellationOfCertification') {
        this.btnData.shift()
      }
      if (status === '1') {
        filterBottomTableData = this.bottomTableData.filter(item => {
          return item.ZZBZXS === '未制证'
        })
        if (this.btnData[0].name !== 'certificateMaking') {
          this.btnData.unshift({
            name: 'certificateMaking',
            text: '制证',
            code: 'zz',
            status: [0]
          })
        }
        if (field !== 'ZT') {
          this.bottomColumns.push({
            field: 'ZT',
            title: '操作',
            width: '80',
            fixed: 'right',
            headerAlign: 'center',
            slots: {
              default: ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, h) => {
                let toolBtn = [
                  {
                    key: 'delete',
                    name: 'SC',
                    class: 'icon-delete',
                    tip: '删除'
                  },
                  {
                    key: 'modify',
                    name: 'XG',
                    class: 'icon-edit',
                    tip: '编辑'
                  }
                ]
                let toolsColumn = []
                toolBtn.forEach((el, index) => {
                  const isAvailable = tools.isAvailable(this.powerBtns, el.key)
                  let styleClass = isAvailable ? 'tools-icon-default ' + el.class : 'tools-icon-default ' + el.class + ' tools-icon-ban'
                  if ((this.modalCode === 'dtfybcb' && row.YWLXXS === '登记') || ((this.modalCode === 'yspjbcb' || this.modalCode === 'yfpjbcp') && this.bottomTableData.length - 1 === rowIndex)) {
                    toolsColumn.push(<span class={styleClass} v-tip={el.tip} type="text"
                      onClick={() => { this.bottomClickEvent(row, el.name, el.key) }}></span>)
                  } else {
                    if (el.key === 'delete') {
                      toolsColumn.push(<span class={styleClass} v-tip={el.tip} type="text"
                        onClick={() => { this.bottomClickEvent(row, el.name, el.key) }}></span>)
                    }
                  }
                })
                return toolsColumn
              }
            }
          })
        }
      } else if (status === '2') {
        filterBottomTableData = this.bottomTableData.filter(item => {
          return item.ZZBZXS === '已制证'
        })
        if (this.btnData[0].name !== 'cancellationOfCertification') {
          this.btnData.unshift({
            name: 'cancellationOfCertification',
            text: '取消制证',
            code: 'qxzz',
            status: [0]
          })
        }
        if (field === 'ZT') {
          this.bottomColumns.pop()
        }
      } else if (status === '0') {
        if (field === 'ZT') {
          this.bottomColumns.pop()
        }
        filterBottomTableData = this.bottomTableData
      }
      this.STATUS = status
      this.$refs.bottomTable.loadColumn(this.bottomColumns)
      this.$refs.bottomTable.loadData(filterBottomTableData)
      this.$emit('handle-tab-click', this.STATUS, this.index)
    },
    // 底部表格点击事件
    bottomClickEvent (row, name, key) {
      const isAvailable = tools.isAvailable(this.powerBtns, key)
      if (isAvailable) { this.$emit('bottom-click-event', row, name) }
    },
    /*
    *  表单数据改变 返回值为新的表单数据
    */
    formChange (valueList) {
      if (valueList.WLLX && valueList.WLLX !== this.initValueLists.WLLX) {
        this.initValueLists = clonedeep(valueList)
        this.$set(this.initValueLists, 'WL', '')
      } else {
        this.initValueLists = clonedeep(valueList)
      }
      this.$emit('form-change', this.initValueLists)
    },

    /*
    *  表单是否展开
    */
    onExpand (open) {
      this.$nextTick(() => {
        const rect = this.$refs.formGroups.getBoundingClientRect()
        this.topHeights = this.topHeight - rect.height + 38
      })
    },

    /*
    * 点击查询
    */
    handleClickSearch () {
      this.$emit('handle-click-search', this.initValueLists)
    }
  },
  watch: {
    topTableData: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.$refs.topTable.loadData(this.topTableData)
            this.bottomTableAssignment(this.index)
          })
        }
      },
      deep: true
    },
    initValueList: {
      handler (val) {
        if (val) {
          this.initValueLists = clonedeep(val)
        }
      },
      immediate: true,
      deep: true
    },
    topHeight: {
      handler (val) {
        if (val) {
          this.topHeights = val
        }
      },
      immediate: true,
      deep: true
    }
  }
}
</script>
<style lang="less">
 @import './page-double-table.less';
</style>
