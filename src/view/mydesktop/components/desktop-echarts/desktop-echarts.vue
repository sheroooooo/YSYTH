<!--
 * @name:
 * @Description:
 * @Autor: ''
 * @Date: 2020-08-19 15:26:59
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-10-19 10:34:09
-->
<template>
  <div :class="[`${prefixCls}`]"
       :id="id"
       :style="echartStyle">
  </div>
</template>

<script>
// import $echarts from '@/libs/echarts/index.js'
export default {
  name: 'DesktopEcharts',
  props: {
    echartType: {
      type: String,
      default: 'pie'
    },
    height: {
      type: Number,
      default: 200
    },
    width: {
      type: Number,
      default: 200
    },
    chartData: {
      type: Array,
      default: () => []
    },
    chartTitle: {
      type: String,
      default: ''
    },
    valueField: {
      type: String,
      default: 'value'
    },
    textField: {
      type: String,
      default: 'name'
    },
    itemColor: {
      type: Object
    },
    pieRadius: {
      type: Array,
      default: () => ['50%', '70%']
    },
    isIda: {
      type: Boolean,
      default: false
    },
    barDirection: {
      type: String,
      default: 'x'
    }
  },
  data () {
    const guid = this.$utils.guid()
    return {
      prefixCls: 'f-c-echarts',
      id: `chart${guid}`,
      chartHeight: 200,
      chartWidth: 200
    }
  },
  computed: {
    echartStyle () {
      return `height:${this.chartHeight}px;width:${this.chartWidth}px;`
    }
  },
  watch: {
    height () {
      this.chartHeight = this.height - 16
    },
    width () {
      this.chartWidth = this.width - 16
    },
    chartData (newVal, oldVal) {
      this.showEchart(newVal)
    }
  },
  methods: {
    showEchart (source) {
      setTimeout(() => {
        const { id, textField, valueField, chartTitle, itemColor } = this
        let chartData = (source || this.chartData).filter(item => item[valueField] !== 0)
        if (chartData.length === 0) {
          chartData = (source || this.chartData)
        }
        $echarts[this.echartType](Object.assign({ id, source: chartData, title: chartTitle, textField, valueField, itemColor, barDirection: this.barDirection, pieRadius: this.pieRadius, isIda: this.isIda }, this.$attrs))
      }, 300)
    }
  },
  mounted () {
    this.chartHeight = this.height - 16
    this.chartWidth = this.width - 16
    this.showEchart()
  }
}
</script>
