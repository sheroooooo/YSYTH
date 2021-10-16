<!--
    公用组件 ：数字范围
    /**
     * @author yangzl
     * @date 2019-04-15
     * @param {Event} [@onChange]  - 范围改变回调   numStart：开始数  numEnd：结束数
       返回数据格式：[44, 44 ]
  */
-->

<template>
  <div class="num-range">
    <InputNumber class="numStart"
                 style="text-align:left;"
                 :precision='precision'
                 :active-change="false"
                 :min="min"
                 :max="max"
                 v-model="numStart">
    </InputNumber>
    -
    <InputNumber class="numEnd"
                 :precision='precision'
                 :active-change="false"
                 :min="min"
                 :max="max"
                 v-model="numEnd">
    </InputNumber>
  </div>
</template>

<script>
export default {
  name: 'NumRange',
  data () {
    return {
      numStart: 1,
      numEnd: 99999999
    }
  },
  props: {
    value: {
      type: [Array, String],
      default: () => [1, 99999999]
    },
    precision: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 99999999
    }
  },
  watch: {
    numStart () {
      this.checkNumRange(true)
    },
    numEnd () {
      this.checkNumRange(false)
    },
    value: {
      handler (val) {
        this.numStart = val[0]
        this.numEnd = val[1]
      }
    }
  },
  methods: {
    /* 比较范围，后值不可高于前值 */
    checkNumRange (flag) {
      if (this.numEnd < this.numStart && flag) {
        this.numEnd = this.numStart
      } else if (this.numEnd < this.numStart && !flag) {
        this.numStart = this.numEnd
      }
      let numRange = [this.numStart, this.numEnd]
      this.$emit('on-change', numRange)
    }
  },
  mounted () {
    if (this.value) {
      this.numStart = this.value[0]
      this.numEnd = this.value[1]
    }
  }
}
</script>

<style lang="less" scoped>
  @import './num-range.less';
</style>
