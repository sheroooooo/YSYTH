<!--
    公用组件 ：期间范围
    /**
     * @author lipeng
     * @date 2019-12-13
     * @param {Event} [@onChange]  - 金额范围改变回调   monthStart：开始期间  monthEnd：结束期间
       返回数据格式：[开始期间, 结束期间, 年度]
  */
-->

<template>
  <Row :class="[`${prefixCls}`]">
    <div :class="[`${prefixCls}-year`]">
      <InputNumber type="number"
                   :readonly="true"
                   @on-change="handleMonthChange"
                   v-model="year" />
    </div>
    <Select @on-change="handleMonthChange"
            :class="[`${prefixCls}-select`]"
            v-model="monthStart">
      <Option v-for="i in qjs"
              :disabled="monthEnd < i"
              :key="`monthStart-${i}`"
              :value="i">{{i+'期'}}</Option>
    </Select>
    <div :class="[`${prefixCls}-text`]">-</div>
    <Select @on-change="handleMonthChange"
            :class="[`${prefixCls}-select`]"
            v-model="monthEnd">
      <Option v-for="i in qjs"
              :key="`monthEnd-${i}`"
              style="padding-right: 0;"
              :disabled="monthStart > i"
              :value="i">{{i+'期'}}</Option>
    </Select>
  </Row>
</template>
<script>
export default {
  name: 'SelectRange',
  props: {
    // [开始期间, 结束期间, 年度, 期间数]
    value: {
      type: [Array],
      default: () => [1, 12]
    },
    kjnd: {
      type: String,
      default: ''
    },
    qjs: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      prefixCls: 'select-range',
      monthStart: 1,
      monthEnd: 12,
      year: 2019
    }
  },
  watch: {
    value: {
      handler (val) {
        this.monthStart = val[0]
        this.monthEnd = val[1]
        this.year = this.kjnd
      },
      immediate: true
    }
  },
  methods: {
    handleMonthChange () {
      this.$emit('on-change', [this.monthStart, this.monthEnd, this.year])
    }
  },
  mounted () {
    if (this.value) {
      this.monthStart = this.value[0]
      this.monthEnd = this.value[1]
      this.year = this.kjnd
    }
  }
}
</script>

<style lang="less">
  @import './select-range';
</style>
