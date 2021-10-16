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
    <FormItem :class="{'form-required-item':item.required}"
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
                   format='yyyy-MM-dd'
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
                    :options="dateOpts"
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
                    :value="valueList[item.name]"
                    :style="cmpStyle(item.type)">
        </DatePicker>
      </template>
      <template v-else-if="item.type==='money-range'">
        <money-range @on-change="(val)=>{handleBtnEditChange(val,item.name)}"
                     v-bind="item.props"
                     :value="valueList[item.name]"></money-range>
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
                     :parser="value => value.replace(/￥s?|(,*-)/g, '')"
                     v-model="valueList[item.name]"></InputNumber>
      </template>
      <template v-else-if="item.type==='InputNumber'">
        <InputNumber style="width:100%;text-align:right;"
                     :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                     :parser="value => value.replace(/￥s?|(,*)/g, '')"
                     :precision='2'
                     v-model="valueList[item.name]"
                     :disabled="item.readOnly"></InputNumber>
      </template>
      <template v-else-if="item.type==='tree-select'">
        <dialog-tree-select :value="valueList[item.name]"
                            :title="`请选择`+item.label"
                            :parent-data="valueList"
                            :disabled="item.readOnly"
                            :readonly='item.disabled'
                            :dataSource="item.props.dataSources"
                            v-bind="item.props"
                            @on-change="(val,node)=>{handleBtnEditChange(val,item.name,node)}"
                            @on-select="handleSelect">
        </dialog-tree-select>
      </template>
      <template v-else-if="item.type==='table-select'">
        <!-- <table-select :value="valueList[item.name]"
                      :title="`请选择`+item.label"
                      :parent-data="valueList"
                      :inputshow="item.inputshow"
                      :readonly='item.readonly'
                      :disabled='item.readonly'
                      :name="item.name"
                      :showPager="showPager"
                      :dataSource="item.props.dataSources"
                      @on-change="(val,node)=>{handleBtnEditChange(val,item.name,node)}"
                      @on-select="handleSelect">
        </table-select> -->
        <table-select :title="`请选择`+item.label"
                      :parent-data="valueList"
                      :name='item.name'
                      :table-data="item.props.data"
                      :value="valueList[item.name]"
                      @on-change="(val,node)=>{handleBtnEditChange(val,item.name,node)}"></table-select>
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
      <template v-else-if="item.type==='textarea'">
        <Input :key="`${_uid}`"
               v-bind="item.props"
               v-model="valueList[item.name]"
               type="textarea"
               :style="cmpStyle(item.type)"></Input>
      </template>
      <template v-else-if="item.type==='i-select' && !item.children">
        <combox-select v-model="valueList[item.name]"
                       :value="valueList[item.name]"
                       :name="item.name"
                       :dataSource="item.props.dataSources"
                       v-bind="item.props"
                       @on-select="handleSelect"></combox-select>
      </template>
      <template v-else-if="item.type==='checkbox'">
        <Checkbox v-model="valueList[item.name]"
                  :disabled="item.readOnly">{{item.label}}</Checkbox>
      </template>
      <template v-else-if='item.type==="monthRange"'>
        <month-range v-model="valueList[item.name]"
                     :type='item.showType'
                     :format='item.format || "yyyy-MM"'
                     @on-change="(val)=>{handleBtnEditChange(val,item.name)}">
        </month-range>
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
import ButtonEdit from '_c/form/button-edit'
import DateRange from '_c/form/date-range'
import SelectRange from '_c/form/select-range'
import MonthRange from '_c/form/month-range/month-range'
import DialogTreeSelect from '_c/dialog-tree-select'
import TableSelect from '../table-select'
import MoneyRange from '_c/form/money-range'
import ComboxSelect from '_c/combox-select'
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
  components: { ButtonEdit, DateRange, DialogTreeSelect, TableSelect, ComboxSelect, MoneyRange, MonthRange, SelectRange },
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
      localItemList: []
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
    }
  },
  watch: {
    initValueList () {
      this.setValueList()
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
    vueEnter (cache) {
      this.noValidate = true
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
      this.$emit('on-select', this.valueList)
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
    }

  },
  mounted () {
    this.vueEnter(false)
  },
  // /*从其他组件返回激活当前组件时*/
  activated () {
    this.vueEnter(!!this.$route.params.tabCache)
  }/* ,
  updated () {
    this.updateLocalItemList()
  } */
}
</script>
<style lang="less" scoped>
  @import './form-group.less';
</style>
