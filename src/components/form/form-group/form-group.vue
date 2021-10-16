/***
 *item{
 *label:标签名,
 *type:组件名,
 *props:组件属性,
 *required:必录项,
 *readOnly:只读
 *}
 */
<template>
  <Form :key="`${_uid}`"
        ref="formGroup"
        :class="{'form-group':true,'clear-fix':true,'padding-right-80':showMore}"
        v-if="itemList.length"
        :label-width="labelWidth"
        :model="valueList">
    <Col v-for="(item, index) in localItemList"
         :key="`${_uid}_col_${index}`"
         :span="colSpan(item)"
         :class="{'none':showOrHide(index)}">
    <FormItem :class="{'form-required-item':item.required, 'type-money-range-wrapper': item.type === 'type-money-range'  }"
              :label="item.type==='checkbox'?'':item.label"
              label-position="left"
              :prop="item.name"
              :rules="rules[item.name]"
              :error="error(item.name)"
              :key="`${_uid}_${index}`"
              @click.native="handleFocus(item.name)">
      <template v-if="item.type==='DatePicker'">
        <component :is="item.type"
                   transfer
                   :format='item.props && item.props.format ? item.props.format : "yyyy-MM-dd"'
                   v-bind="item.props"
                   @on-change="(date) =>{ changeDate(date, item.name)}"
                   :value="valueList[item.name]"
                   :style="cmpStyle(item.type)">
        </component>
      </template>
      <template v-else-if="item.type==='date-range'">
        <DatePicker type='daterange'
                    :format='item.props && item.props.format ? item.props.format : "yyyy-MM-dd"'
                    :clearable="(item.props && item.props.hasOwnProperty('clearable') ? item.props.clearable : true)"
                    :options="(item.props && item.props.hasOwnProperty('options') ? item.props.options : dateOpts)"
                    @on-change="(date) =>{ changeDate(date, item.name)}"
                    :value="valueList[item.name]"
                    :style="cmpStyle(item.type)">
        </DatePicker>
      </template>
      <template v-else-if="item.type==='date-time'">
        <DatePicker type='datetime'
                    :options="dateOpts"
                    @on-change="(date) =>{ changeDate(date, item.name)}"
                    :value="valueList[item.name]"
                    :style="cmpStyle(item.type)">
        </DatePicker>
      </template>
      <template v-else-if="item.type==='month-time'">
        <DatePicker type='month'
                    @on-change="(date) =>{ changeDate(date, item.name)}"
                    :clearable="(item.props && item.props.hasOwnProperty('clearable') ? item.props.clearable : true)"
                    :value="valueList[item.name]"
                    :style="cmpStyle(item.type)">
        </DatePicker>
      </template>
      <template v-else-if="item.type==='money-range'">
        <money-range @on-change="(val)=>{handleBtnEditChange(val,item.name)}"
                     v-bind="item.props"
                     :value="valueList[item.name]"></money-range>
      </template>
      <template v-else-if="item.type==='num-range'">
        <num-range @on-change="(val)=>{handleBtnEditChange(val,item.name)}"
                   v-bind="item.props"
                   :precision="item.precision"
                   :min="item.min"
                   :max="item.max"
                   :value="valueList[item.name]"></num-range>
      </template>
      <template v-else-if="item.type==='type-money-range'">
        <type-money-range @on-change="(val)=>{handleBtnEditChange(val,item.name)}"
                          v-bind="item.props"
                          class='type-money-range'
                          :children='item.children'
                          :value="valueList[item.name]"></type-money-range>
      </template>
      <template v-else-if="item.type==='select-range'">
        <select-range @on-change="(val)=>{handleBtnEditChange(val,item.name)}"
                      v-bind="item.props"
                      :value="valueList[item.name]"></select-range>
      </template>
      <template v-else-if="item.type==='Integer'">
        <InputNumber style="width:100%"
                     :disabled="item.readOnly"
                     :precision='0'
                     @on-blur="isSetFormatter(item.name)"
                     :parser="value => value.replace(/￥s?|(,*-)/g, '')"
                     v-model="valueList[item.name]"
                     v-bind="item.props"></InputNumber>
      </template>
      <template v-else-if="item.type==='InputNumber'">
        <InputNumber style="width:100%;text-align:right;"
                     v-model="valueList[item.name]"
                     :precision='item.props ? item.props.precision : 2'
                     :formatter="item.props ? item.props.formatter : value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                     :parser="item.props ? item.props.parser : value => value.replace(/￥s?|(,*)/g, '')"
                     :disabled="item.readOnly"
                     v-bind="item.props"></InputNumber>
      </template>
      <template v-else-if="item.type==='tree-select'">
        <dialog-tree-select :value="valueList[item.name]"
                            :title="`请选择`+item.label"
                            :parent-data="valueList"
                            :disabled="item.readOnly"
                            :readonly='item.disabled'
                            :leafRequired='leafRequired'
                            :dataSource="item.props.dataSources"
                            :show-checkbox='item.showCheckbox'
                            v-bind="item.props"
                            @on-change="(val,node)=>{handleBtnEditChange(val,item.name,node)}"
                            @on-select="handleSelect">
        </dialog-tree-select>
      </template>
      <template v-else-if="item.type==='multi-tree-select'">
        <multi-tree-select :value="valueList[item.name]"
                           :title="`请选择`+item.label"
                           :parent-data="valueList"
                           :disabled="item.readOnly"
                           :readonly='item.disabled'
                           :placeholder="item.placeholder"
                           :leafRequired='leafRequired'
                           :dataSource="item.props.dataSources"
                           v-bind="item.props"
                           @on-change="(val,node)=>{handleBtnEditChange(val,item.name,node)}">
        </multi-tree-select>
      </template>
      <template v-else-if="item.type==='table-select'">
        <table-select :value="valueList[item.name]"
                      :title="`请选择`+item.label"
                      :parent-data="valueList"
                      :inputshow="item.inputshow"
                      :readonly='item.readonly'
                      :disabled='item.readonly'
                      :name="item.name"
                      :toolbar="toolbar"
                      :showPager="showPager"
                      :dataSource="item.props.dataSources"
                      v-bind="item.props"
                      @on-change="(val,node)=>{handleBtnEditChange(val,item.name,node)}"
                      @on-select="handleSelect">
        </table-select>
      </template>
      <template v-else-if="item.type==='button-edit'">
        <button-edit :value="valueList[item.name]"
                     :title="`请选择`+item.label"
                     :parent-data="valueList"
                     v-bind="item.props"
                     @on-change="(val)=>{handleBtnEditChange(val,item.name)}">
          <slot :name="item.name"></slot>
        </button-edit>
      </template>
      <template v-else-if="item.type==='select-multiple'">
        <SelectMultiple v-model="valueList[item.name]"
                        :name="item.name"
                        v-bind="item.props"
                        :children='item.children'
                        @on-change="(val)=>{handleBtnEditChange(val, item.name)}"
                        :value="valueList[item.name]">
        </SelectMultiple>
      </template>
      <template v-else-if="item.type==='textarea'">
        <Input :key="`${_uid}`"
               v-bind="item.props"
               v-model="valueList[item.name]"
               type="textarea"
               :style="cmpStyle(item.type)"></Input>
      </template>
      <template v-else-if="item.type==='NumberAndEnglish'||item.type==='NumberAndCharacter'">
        <Input :key="`${_uid}`"
               v-bind="item.props"
               v-model="valueList[item.name]"
               @on-keyup="handleKeyup(item.name,item.type)"></Input>
      </template>
      <template v-else-if="item.type==='i-select' && !item.children">
        <combox-select v-model="valueList[item.name]"
                       :value="valueList[item.name]"
                       :name="item.name"
                       :dataSource="item.props.dataSources"
                       v-bind="item.props"
                       :clearable="item.props.clearable"
                       @on-select="handleSelect"></combox-select>
      </template>
      <template v-else-if="item.type==='checkbox'">
        <Checkbox v-model="valueList[item.name]"
                  v-bind='item.props'
                  true-value='1'
                  false-value='0'
                  :disabled="item.readOnly">{{item.label}}</Checkbox>
      </template>
      <template v-else-if='item.type==="monthRange"'>
        <month-range v-model="valueList[item.name]"
                     :type='item.showType'
                     :dateExtent='item.dateExtent'
                     :clearable="(item.props && item.props.hasOwnProperty('clearable') ? item.props.clearable : true)"
                     :format='item.format || "yyyy-MM"'
                     v-bind="item.props"
                     @on-change="(val)=>{handleBtnEditChange(val,item.name)}">
        </month-range>
      </template>
      <template v-else-if='item.type==="i-input"'>
        <Input v-model="valueList[item.name]"
               v-bind="item.props"
               :disabled='item.readOnly'
               :readonly="item.readonly"
               :clearable="item.clearable"
               :maxlength="item.props?item.props.maxlength:item.maxlength?item.maxlength:maxlength">
        </Input>
      </template>
      <template v-else-if='item.type==="Cascader"'>
        <Cascader :data="item.props.data"
                  trigger="hover"
                  v-model="valueList[item.name]"></Cascader>
      </template>
      <template v-else-if='item.type==="tablePage"'>
        <modal-table-select :value="valueList[item.name]"
                            :item="item"
                            @on-change="handleSelect"></modal-table-select>
      </template>
      <template v-else>
        <component :is="item.type"
                   :key="`${_uid}`"
                   v-bind="item.props"
                   v-model="valueList[item.name]"
                   :disabled="item.readOnly"
                   :placeholder="item.placeholder"
                   :style="cmpStyle(item.type)">
          <template v-if="item.children">
            <component v-for="(child, i) in item.children.list"
                       :is="item.children.type"
                       :key="`${_uid}_${index}_${i}`"
                       :label="child.label"
                       :value="child.value">{{ child.title }}</component>
          </template>
          <slot :name="item.name"
                @on-select="handleSelect"></slot>
        </component>
      </template>

    </FormItem>
    </Col>
    <Button type="text"
            @click.native="openOrCloseForm"
            :class="{'button-more':true,'open':open}"
            v-if="showMore && itemList.length>localCol">
      <Icon type="ios-arrow-down"
            size="14" />
      <span v-if="open">收起</span>
      <span v-else>展开</span>
    </Button>
  </Form>
</template>
<script>
import ButtonEdit from '../button-edit'
import DateRange from '../date-range'
import SelectRange from '../select-range'
import MonthRange from '../month-range/month-range'
import DialogTreeSelect from '../../dialog-tree-select'
import MultiTreeSelect from '../multi-tree-select'
import TableSelect from '../../table-select'
import MoneyRange from '_c/form/money-range'
import NumRange from '_c/form/num-range'
import ComboxSelect from '../../combox-select'
import SelectMultiple from '../select-multiple/select-multiple'
import TypeMoneyRange from '../type-money-range/type-money-range'
import ModalTableSelect from '_c/table/modal-table-select'
import { thisMounth, thisQuarter, thisWeek, thisYear } from './daterange'
import clonedeep from 'clonedeep'

const dateOpts = {
  shortcuts: [
    {
      text: '本周',
      value () {
        return thisWeek()
      }
    },
    {
      text: '本月',
      value () {
        return thisMounth()
      }
    },
    {
      text: '本季度',
      value () {
        return thisQuarter()
      }
    },
    {
      text: '本年',
      value () {
        return thisYear()
      }
    }
  ]
}
export default {
  name: 'FormGroup',
  components: { ButtonEdit, TypeMoneyRange, SelectMultiple, DateRange, DialogTreeSelect, MultiTreeSelect, TableSelect, ComboxSelect, MoneyRange, NumRange, MonthRange, SelectRange, ModalTableSelect },
  data () {
    return {
      localCol: 3,
      valueList: {},
      rules: {},
      nullFieldVale: {},
      errorStore: {},
      dateOpts: dateOpts,
      open: false,
      noValidate: false,
      localItemList: [],
      maxlength: 100
    }
  },
  props: {
    itemList: {
      type: Array,
      default: () => []
    },
    labelWidth: {
      type: Number,
      default: 120
    },
    leafRequired: {
      type: Boolean,
      default: false
    },
    initValueList: {
      type: Object,
      default: () => { }
    },
    initErrorStore: {
      type: Object,
      default: () => { }
    },
    showMore: {
      type: Boolean,
      default: false
    },
    cols: {
      type: Number,
      default: 2
    },
    formFilterField: {
      type: String,
      default: ''
    },
    showPager: {
      type: Boolean,
      default: true
    },
    toolbar: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    initValueList: {
      handler () {
        this.setValueList()
      },
      deep: true
    },
    valueList: {
      handler (newVal, oldVal) {
        this.$emit('on-change', clonedeep(this.valueList))
        this.updateLocalItemList()
      },
      deep: true
    },
    itemList: {
      handler (newVal, oldVal) {
        this.localItemList = clonedeep(this.itemList)
        this.updateLocalItemList()
        this.setInitItem()
      },
      deep: true
    }
  },
  computed: {
    colSpan (item) {
      return (item) => {
        if (item.colSpan) {
          return item.colSpan
        }
        return item.type === 'textarea' ? 24 : Math.floor(24 / this.localCol)
      }
    },
    cmpStyle (type) {
      return (type) => {
        if (type !== 'i-switch') {
          return {
            width: '100%'
          }
        } else {
          return ''
        }
      }
    },
    error (name) {
      return (name) => this.errorStore[name] || ''
    },
    // rule (name) {
    //   return (name) => {
    //     let tmpRule
    //     if (!tools.isNull(itemRule)) {
    //       tmpRule = clonedeep(itemRule)
    //       tmpRule.required = !this.noValidate
    //     }
    //     return tmpRule
    //   }
    // },
    showOrHide (index) {
      return (index) => {
        return index >= this.localCol && this.showMore && !this.open
      }
    }
  },
  methods: {
    isSetFormatter (key) {
      this.valueList[key] = parseInt(this.valueList[key])
    },
    vueEnter (cache) {
      this.noValidate = false
      if (!cache) {
        // if (this.$refs.formGroup) this.$refs.formGroup.resetFields()
        // setTimeout(() => {  }, 20)
        this.setInitItem()
        this.setValueList()
      }
      //
      this.localItemList = clonedeep(this.itemList)
      /// ///
      let _this = this
      let timeId1 = setTimeout(() => {
        clearTimeout(timeId1)
        // _this.noValidate = false
        if (_this.$refs.formGroup && $(_this.$refs.formGroup.$el).width() > 0) {
          _this.localCol = Math.floor($(_this.$refs.formGroup.$el).width() / 320)
        }
      }, 300)
      let timeId2 = setTimeout(() => {
        clearTimeout(timeId2)
        _this.noValidate = false
      }, 1000)
      this.setLocalCol()
    },
    setLocalCol () {
      this.localCol = this.cols
      if (this.$refs.formGroup && $(this.$refs.formGroup.$el).width() > 0) {
        this.localCol = Math.floor($(this.$refs.formGroup.$el).width() / 320)
      }
    },
    setInitItem () {
      this.itemList.forEach(item => {
        this.nullFieldVale[item.name] = ''
        if (item.required) {
          this.rules[item.name] = { required: true, message: item.label + '不能为空' }
        }
      })
    },
    updateLocalItemList () {
      if (this.formFilterField !== '' && this.valueList[this.formFilterField]) {
        let localItemList = this.itemList.filter((item) => {
          if (!item.fieldGroupID) return false
          let splits = item.fieldGroupID.split(',')
          // return splits.indexOf('1') >= 0
          return splits.indexOf(this.valueList[this.formFilterField]) >= 0
        })
        if (localItemList.length > 0 && JSON.stringify(localItemList) !== JSON.stringify(this.itemList)) {
          this.localItemList = localItemList.length === 0 ? this.itemList : localItemList
        }
      }
    },
    setValueList () {
      // if (this.$refs.formGroup) this.$refs.formGroup.resetFields()
      if (!this.initValueList) {
        this.valueList = this.nullFieldVale
      } else if (JSON.stringify(this.valueList) !== JSON.stringify(this.initValueList)) {
        this.valueList = clonedeep(this.initValueList) || this.nullFieldVale
      }

      this.errorStore = clonedeep(this.initErrorStore || {})
    },
    changeDate (date, name) {
      this.valueList[name] = date
      this.$emit('on-change', this.valueList)
    },
    resetFields () {
      if (this.$refs.formGroup) {
        this.$refs.formGroup.resetFields()
      }
    },
    handleKeyup (key, type) {
      this.valueList[key] = type === 'NumberAndEnglish' ? this.valueList[key].replace(/[\W]/g, '') : this.valueList[key].replace(/([\u4E00-\u9FA5]|[A-Za-z])+/g, '')
    },
    handleReset () {
      this.setValueList()
    },
    handleFocus (name) {
      this.errorStore[name] = ''
    },
    // button-edit

    handleBtnEditChange (val, key, node) {
      this.valueList[key] = val
      this.$emit('on-change', this.valueList, key, node) // node 为弹出树或弹出表格选择的一整条数据
      // this.$refs.formGroup.resetFields()
    },
    handleSelect (json) {
      this.valueList = Object.assign(this.valueList, json)
      this.$emit('on-change', this.valueList) // 下拉表单变化出发onchange事件
      this.$emit('on-select', this.valueList)
    },
    // 合同收付款录入点击事件
    handelClickMore (name) {
      console.log(name)
      console.log(11111)
    },
    numFormat (num) {
      var c = (num.toString().indexOf('.') !== -1) ? num.toLocaleString() : num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
      return c
    },
    validate (_callback) {
      this.$refs.formGroup.validate((valid) => {
        _callback(valid)
      })
    },
    openOrCloseForm () {
      this.open = !this.open
      let _this = this
      const timeId = setTimeout(() => {
        clearTimeout(timeId)
        _this.$emit('on-expand', _this.open)
      }, 30)
    },
    setOptions (item) {
      let _this = this
      let key = item.keys || item.key || item.name
      return {
        title: item.title || item.label,
        width: 900,
        height: 470,
        resize: false,
        showFooter: false,
        escClosable: true,
        customComponent: ModalTableSelect,
        customProps: {
          keys: item.keys || item.key || item.name,
          columns: item.columns,
          dataSource: item.dataSource
        },
        customEvents: {
          complete (value) {
            _this.$emit('on-change', _this.initValueList, key, value)
          }
        }
      }
    }

  },
  mounted () {
    this.vueEnter(false)
  },
  // /*从其他组件返回激活当前组件时*/
  activated () {
    this.vueEnter(!!this.$route.params.tabCache)
  },
  // 兼容table-select中包含的inject
  // table-select中包含业务组件。带值。所以提供inject
  provide () {
    return {
      billValueStore: () => { },
      activeIndex: () => { }
    }
  }
}
</script>
<style lang="less" scoped>
  @import './form-group.less';
</style>
<style lang="less">
//ivu-form-item-content的样式写在了行内,不能覆盖。
.form-group {
  .type-money-range-wrapper{
    .ivu-form-item-content{
      margin-left: 0px !important;
    }
  }
}
</style>
