<template>
    <div class="base-data-choose">
      <Row class='base-data-content'>
        <Col span='18'>
          <div v-if='MOCKDATA.type === "Tree"'>
            <vuc-tree ref="xTree"
                      class="tree"
                      id-field="DM"
                      text-field="DMMC"
                      show-toolbar
                      show-checkbox
                      :data="showData"
                      :height='350'></vuc-tree>
          </div>
          <div v-else>
            <Input v-model='searchInput' search :maxlength='30' @on-change='handleSearchInputChange'></Input>
            <Form v-if='extraFormStruct.length'
                  :model="formValue"
                  class="extra-form-area">
              <FormItem v-for='(extraFilterItem, index) in extraFormStruct'
                        :label='extraFilterItem.label'
                        :prop="extraFilterItem.name"
                        class='form-group-item'
                        :key='index'>
                <component :is='extraFilterItem.component' @on-change='handelFormFilterChange(extraFilterItem)'>
                  <template v-if='extraFilterItem.children'>
                    <component v-for='(extraFilterItemChild, i) in extraFilterItem.children'
                              :is='extraFilterItemChild.component'
                              v-bind='extraFilterItemChild.props || {}'
                              :key='i'></component>
                  </template>
                </component>
              </FormItem>
            </Form>
            <vuc-datatable ref="xTable"
                          :height='291'
                          row-key='DM'></vuc-datatable>
          </div>
        </Col>
        <Col span='6' style='height: 100%'>
          <div class="filter-area">
            <div class="title">筛选条件</div>
            <Form :model="formValue"
                  class="form-add">
              <FormItem v-for='(filterItem, index) in formStruct'
                        :prop="filterItem.name"
                        :key='index'
                        :label="filterItem.label">
                <component :is='filterItem.component'
                          v-model="formValue[filterItem.name]"
                          @on-change='handelFormFilterChange(filterItem)'
                          v-bind='filterItem.props || {}'>
                  <template v-if='filterItem.children'>
                    <component v-for='(filterItemChild, i) in filterItem.children'
                              :is='filterItemChild.component'
                              :key='i'
                              v-bind='filterItemChild.props'
                              :label='filterItemChild.component === "Radio" ? filterItemChild.props.value : filterItemChild.props.label'>
                      <span v-if='filterItemChild.component === "Radio"'>{{ filterItemChild.props.label }} </span>
                    </component>
                  </template>
                </component>
              </FormItem>
            </Form>
          </div>
        </Col>
      </Row>
      <div class="footer-btn-group">
        <Button type="primary"
                style='margin-left: 10px'
                @click='handleSubmit'
                class="footer-btn">确定</Button>
        <Button class="footer-btn"
                style='margin-left: 10px'
                @click="$emit('close')">取消</Button>
      </div>
    </div>
</template>
<script>
import MOCK from './Mock'
import { getAuxiliaryAccountingItems } from '@/api/base/base-bmzy'
let INIT_VALUE = {}
let INIT_EXTRA_VALUE = {} // 额外表单初始值
export default {
  name: 'BaseChoose',
  props: {
    baseParams: {
      type: Object,
      default: () => {
        return {
          GSDM: '716', // 公司代码
          KJND: '2020', // 会计年度
          ZTH: '716', // 账套号
          MODCODE: 'GL', // 模块名
          lOGINDATE: new Date().Format('yyyyMMdd') // 业务日期
        }
      }
    },
    LBDM: {
      type: String,
      default: '1'
    }
  },
  data () {
    return {
      formStruct: [], // 过滤表单结构
      formValue: {}, // 过滤表单value
      extraFormValue: {},
      extraFormStruct: [],
      constData: [], // 从后台请求回的原始数据
      filterData: [], // 过滤后的数据
      showData: [], // 最终要展示的数据
      searchInput: '', // 搜索值
      MOCKDATA: {}
    }
  },
  methods: {
    // 搜索框过滤
    handleSearchInputChange () {
      let group = {}
      let searchConfig = this.MOCKDATA.search || {
        filterType: 'filter',
        key: ['DM', 'DMMC']
      }
      searchConfig.key.map(key => {
        group[key] = this.searchInput
      })
      let filterContent = { ...this.formValue, ...this.extraFormValue, ...group }
      this.filterChange(searchConfig.filterType, filterContent, true) // 模糊搜索
    },
    // 表单过滤条件生成(将右侧搜索条件和额外搜索条件合并)
    handelFormFilterChange (changItem) {
      let filterContent = { ...this.formValue, ...this.extraFormValue }
      this.filterChange(changItem.filterType, filterContent)
    },
    // 处理过滤条件并渲染页面 filterModal 搜索模式 => true模糊搜索 false绝对相等搜索
    filterChange (filterType, filterContent, filterModal = false) {
      if (filterType !== 'post') { // 如果是前端过滤(暂不考虑后端过滤)
        // 如果是all 直接返回所有 searchValueGroup: [[leave, 1], [dmjc, 2]]
        let searchValueGroup = Object.entries(filterContent).filter(g => g[1] !== 'all' && g[1] !== '')
        let filterData = this.filterMethods(this.constData, searchValueGroup, filterModal)
        this.filterData = [ ...filterData ]
        this.renderData(this.filterData)
      }
    },
    // filterModal  搜索模式 => true模糊搜索 false绝对相等搜索
    filterMethods (data = [], searchKeyValue, filterModal, lastResult = []) { // searchKeyValue [[leave, 1], [dmjc, 2]]
      // 支持多个字段进行检索
      // if (searchValue === '') return data // 如果搜索字段为空, 直接返回所有数据
      let childrenGroup = []
      data.map(i => {
        let item = { ...i } // 解构 防止破坏原有数据
        if (item.children) {
          childrenGroup.push(item.children)
          delete item.children
        }
        // 判断该节点是否满足搜索条件
        lastResult.push(searchKeyValue.every(groups => {
          let key = groups[0]
          let value = groups[1].toString()
          if (filterModal) return i[key] !== undefined && i[key].toString().indexOf(value) !== -1
          return i[key] !== undefined && (i[key].toString() === value)
        }) ? i : '')
      })
      if (!childrenGroup.length) return lastResult.filter(i => i)
      return filterMethods(childrenGroup, searchKeyValue, lastResult) // 防止数据量过大栈溢出卡死
    },
    getData (extraParams = {}) {
      let params = {
        LBDM: this.LBDM,
        ISCHANGE: this.MOCKDATA.type === 'Tree' ? '1' : '0',
        ...this.formValue,
        ...this.baseParams,
        ...extraParams
      }
      return new Promise((resolve, reject) => {
        this.$fn.ajax(getAuxiliaryAccountingItems, params, res => {
          if (res && res.status === 200) {
            resolve(res.data)
          } else if (res.status !== 500) {
            reject(new Error(res.msg))
          }
        }, 0)
      })
    },
    // 渲染数据
    renderData (data) {
      this.showData = data
      this.$refs[`x${this.MOCKDATA.type}`].loadData(data)
    },
    // 如果是表格 渲染表头
    renderTableColumns (cloumns) {
      if (this.MOCKDATA.type === 'Table') {
        let cloumnsData = cloumns || this.MOCKDATA.tableColumns
        this.$refs.xTable.loadColumn(cloumnsData)
      }
    },
    handleSubmit () {}
  },
  created () {
    this.MOCKDATA = MOCK[this.LBDM]
    this.formStruct = this.MOCKDATA.filter
    this.extraFormStruct = this.MOCKDATA.extraFilter || []
    this.formStruct.map(item => {
      INIT_VALUE[item.name] = item.defaultValue
    })
    this.extraFormStruct.map(item => {
      INIT_EXTRA_VALUE[item.name] = item.defaultValue || ''
    })
    // 保存一份初始值,提供后续搜索置空。直接使用form置空，效果不理想
    this.formValue = { ...INIT_VALUE }
    this.extraFormValue = { ...INIT_EXTRA_VALUE }
  },
  mounted () {
    this.getData().then(res => {
      this.constData = this.filterData = res
      this.renderData(res)
    }).then(() => this.renderTableColumns())
  }
}
</script>
<style lang="less" scoped>
@import './test-modal.less';
</style>
