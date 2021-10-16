<!--
    公用组件 ：金额范围
    /**
     * @author zhaoyy
     * @date 2019-04-15
     * @param {Event} [@onChange]  - 金额范围改变回调   moneyStart：开始金额  moneyEnd：结束金额
       返回数据格式：[44, 44 ]
  */
-->

<template>
  <div class="money-range">
    <InputNumber class="moneyStart"
                 style="text-align:left;"
                 :formatter="value => numFormat(value)"
                 :parser="value => value.replace(/￥s?|(,*)/g, '')"
                 :precision='precision'
                 :active-change=false
                 :max="maxlength"
                 v-model="moneyStart">
    </InputNumber>
    -
    <InputNumber class="moneyEnd"
                 :formatter="value => numFormat(value)"
                 :parser="value => value.replace(/￥s?|(,*)/g, '')"
                 :precision='precision'
                 :active-change=false
                 :max="maxlength"
                 v-model="moneyEnd">
    </InputNumber>
  </div>
</template>

<script>
export default {
  name: 'MoneyRange',
  data () {
    return {
      moneyStart: 0,
      moneyEnd: 99999999
    }
  },
  props: {
    value: {
      type: [Array, String],
      default: () => [0, 99999999]
    },
    isMoney: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    cacheMoney (name) {
      return this.moneyRange
    },
    precision () {
      return this.isMoney ? 2 : 0
    },
    maxlength () {
      return this.isMoney ? 99999999999999 : 99999
    }
  },
  watch: {
    moneyStart () {
      this.checkMoneyRange(true)
    },
    moneyEnd () {
      this.checkMoneyRange(false)
    },
    value: {
      handler (val) {
        this.moneyStart = val[0]
        this.moneyEnd = val[1]
      }
    }
  },
  methods: {
    /* 指定输入框展示值的格式 */
    numFormat (num) {
      let c
      if (this.isMoney) {
        c = (num.toString().indexOf('.') !== -1) ? num.toLocaleString() : num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
        c = c === '' ? 0 : c // 金额输入 0 时不显示问题修改
      } else {
        c = num
      }
      return c
    },

    /* 比较金额范围，后值不可高于前值 */
    checkMoneyRange (flag) {
      if (this.moneyEnd < this.moneyStart && flag) {
        this.moneyEnd = this.moneyStart
      } else if (this.moneyEnd < this.moneyStart && !flag) {
        this.moneyStart = this.moneyEnd
      }
      let moneyRange = [this.moneyStart, this.moneyEnd]
      this.$emit('on-change', moneyRange)
    }
  },
  mounted () {
    if (this.value) {
      this.moneyStart = this.value[0]
      this.moneyEnd = this.value[1]
    }
  }
}
</script>

<style lang="less" scoped>
  @import './money-range.less';
</style>
