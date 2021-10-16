<template>
  <div class="label-item">
    <span class="label-item-label"
          :style="cmpStyle">{{label}}</span>
    <span class="label-item-text "
          v-if="!showTooltip">
      <div class="label-item-text-inner">
        {{value}}
      </div>
    </span>
    <Tooltip max-width="230"
             :content=value
             placement="top"
             v-if="showTooltip">
      <span class="label-item-text ">
        <div class="label-item-text-inner">
          {{value}}
        </div>
        <i>...</i>
      </span>
    </Tooltip>
  </div>
</template>
<script>
import tools from '@/libs/toolutil'
export default {
  name: 'LabelItem',
  props: {
    label: { type: [String, Number, Boolean], default: '' },
    labelWidth: { type: [String, Number], default: 100 },
    text: { type: [String, Number, Date, Boolean], default: '' },
    type: { type: [String], default: '' }
  },
  computed: {
    cmpStyle () {
      return { width: this.labelWidth + 'px' }
    },
    value () {
      let value = ''
      if (this.type === 'InputNumber') {
        let strVal = this.text + ''
        value = tools.formatMoney(strVal.replace(/,/g, ''), 2)
      } else if (this.type === 'checkbox') { // 复选框显示为'是'和'否'
        value = this.text ? '是' : '否'
      } else {
        value = this.text
      }
      return value
    },
    showTooltip () {
      return this.text.length > 22
    }
  }
}
</script>
<style lang="less">
  @import './label-item.less';
</style>
