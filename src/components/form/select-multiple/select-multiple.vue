<template>
  <Row :class="[`${prefixCls}`]">
    <Select @on-change="handleValueChange"
            :class="[`${prefixCls}-select`]"
            v-model="minValue">
      <Option v-for="(minItem, index) in minList"
              :disabled="strict ? (minItem.id >= maxValue) : (minItem.id > maxValue)"
              :key="`max-${index}`"
              :label="minItem.label"
              :value="minItem.value"></Option>
    </Select>
    <div :class="[`${prefixCls}-text`]">-</div>
    <Select @on-change="handleValueChange"
            :class="[`${prefixCls}-select`]"
            v-model="maxValue">
      <Option v-for="(maxItem, index) in maxList"
              :key="`max-${index}`"
              style="padding-right: 0;"
              :disabled="strict ? (maxItem.id <= minValue) : (maxItem.id < minValue)"
              :label="maxItem.label"
              :value="maxItem.value"></Option>
    </Select>
  </Row>
</template>
<script>
export default {
  name: 'SelectMultiple',
  props: {
    // [开始期间, 结束期间, 年度, 期间数]
    value: {
      type: [Array],
      default: () => ['', '']
    },
    children: {
      type: [Object, Array],
      default: () => {
        return {
          minList: [],
          maxList: []
        }
      }
    },
    strict: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      prefixCls: 'select-multiple',
      minList: [],
      maxList: [],
      minValue: '',
      maxValue: ''
    }
  },
  watch: {
    value: {
      handler (val) {
        this.minValue = val[0]
        this.maxValue = val[1]
      },
      immediate: true
    }
  },
  methods: {
    handleValueChange () {
      this.$emit('on-change', [this.minValue, this.maxValue])
    },
    utilFormatData (data = []) {
      let list = []
      list = data.map(item => {
        if (item.id === undefined) {
          item.id = item.value
        }
        return item
      })
      return list || []
    }
  },
  created () {
    if (Array.isArray(this.children)) {
      let data = this.utilFormatData(this.children)
      this.maxList = [...data]
      this.minList = [...data]
    } else {
      this.minList = this.utilFormatData(this.children.minList)
      this.maxList = this.utilFormatData(this.children.maxList)
    }
  }
}
</script>

<style lang="less">
  @import './select-multiple.less';
</style>
