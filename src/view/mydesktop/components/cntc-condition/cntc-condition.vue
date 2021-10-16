<template>
  <vuc-panel v-bind="$attrs"
             :class="[`${prefixCls}`]">
    <div :class="[`${prefixCls}-content`]">
      <desktop-echarts ref="chart"
                       style="display:inline-block;"
                       :height="chartHeight"
                       :width="chartWidth"
                       :chart-data="fcData"
                       :item-color="itemColor"
                       value-field="COUNT"
                       text-field="NAME"
                       chart-title="合同情况"></desktop-echarts>
    </div>
  </vuc-panel>
</template>

<script>
import { getContractSituation } from '@/api/mydesktop/mydesktop.js'
import DesktopEcharts from '../desktop-echarts'
export default {
  name: 'CntcCondition',
  components: { DesktopEcharts },
  data () {
    return {
      prefixCls: 'cntc-condition',
      itemColor: {},
      KJQJ: '',
      fcData: [
        { COUNT: 0, NAME: '审核中' },
        { COUNT: 0, NAME: '未送审' },
        { COUNT: 0, NAME: '未执行' },
        { COUNT: 0, NAME: '已完结' },
        { COUNT: 0, NAME: '已中止' },
        { COUNT: 0, NAME: '执行中' }
      ]
    }
  },
  computed: {
    chartHeight () {
      return this.$attrs.height - 52
    },
    chartWidth () {
      return this.$attrs.width
    }
  },
  methods: {
    $mounted (props) {
      if (props) {
        const { width, height } = props
        this.$attrs.width = width
        this.$attrs.height = height
      }
      this.getData()
    },
    getData () {
      const { gsdm, zth, kjnd } = this.$store.state.app.env
      if (!gsdm || !zth || !kjnd) {
        return false
      }
      getContractSituation({ GSDM: gsdm, ZTH: zth, KJND: kjnd }).then(res => {
        if (res.status === 200) {
          this.fcData = res.data
        }
      })
    }
  },
  mounted () {
    this.$mounted()
  }
}
</script>

<style lang="less">
  @import './cntc-condition.less';
</style>
