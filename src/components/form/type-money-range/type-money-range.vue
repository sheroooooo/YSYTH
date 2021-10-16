<template>
  <Row :class="[`${prefixCls}`]">
    <Col span='7'>
    <Select @on-change="handleValueChange"
            :class="[`${prefixCls}-select`]"
            v-model="selectValue">
      <Option v-for="(optionItem, index) in selectList"
              :key="`select-${index}`"
              :label="optionItem.label"
              :value="optionItem.value"></Option>
    </Select>
    </Col>
    <Col span='16'
         style='margin-left: 8px'>
    <money-range :value='moneyRange'
                 @on-change="(val)=>{handleValueChange(val, 'money')}"
                 :isMoney='isMoney'>
    </money-range>
    </Col>
  </Row>
</template>
<script>
import MoneyRange from '../money-range'
export default {
  name: 'TypeMoneyRange',
  components: { MoneyRange },
  props: {
    children: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => ['', 0, 99999999]
    },
    isMoney: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    value: {
      handler (val) {
        this.selectValue = val[0]
        this.moneyRange = [val[1], val[2]]
      },
      immediate: true
    }
  },
  data () {
    return {
      prefixCls: 'type-money-range',
      selectList: [],
      selectValue: '',
      moneyRange: [0, 99999999]
    }
  },
  methods: {
    handleValueChange (val, type) {
      if (type === 'money') {
        this.moneyRange = val
      } else {
        this.selectValue = val
      }
      this.$emit('on-change', [this.selectValue, ...this.moneyRange])
    }
  },
  created () {
    this.selectList = [...this.children]
  }
}
</script>
<style lang="less" scoped>
@import './type-money-range.less';
</style>
<style lang="less">
  .type-money-range{
    .ivu-select-single .ivu-select-selection{
      height: 33px;
    }
  }
</style>
