<template>
  <vuc-panel v-bind="$attrs"
             :class="[`${prefixCls}`]">
    <div :class="[`${prefixCls}-content`]">

      <desktop-echarts style="display:inline-block;"
                       :height="chartHeight"
                       :width="chartWidth"
                       :chart-data="ecData"
                       :columns="columns"
                       bar-drection="x"
                       echart-type="bar"></desktop-echarts>

    </div>

  </vuc-panel>
</template>

<script>
import { getCapitalAccountSituation } from '@/api/mydesktop/mydesktop.js'
import DesktopEcharts from '../desktop-echarts'
export default {
  name: 'CapitalAccountCondition',
  components: { DesktopEcharts },
  data () {
    return {
      prefixCls: 'financial-condition',
      KJQJ: '',
      ecData: [],
      columns: [{ key: 'KMMC', name: '科目', axis: 0 }, { key: 'ZJJY', name: '余额' }, { key: 'ZJSR', name: '收入', stack: '收支' }, { key: 'ZJZC', name: '支出', axis: -1, stack: '收支' }]
    }
  },
  computed: {
    height () {
      return this.$attrs.height - 45
    },
    chartHeight () {
      return this.$attrs.height - 45
    },
    chartWidth () {
      return this.$attrs.width
    },
    tableStyle () {
      return `display:inline-block;width:${this.fcData.YS && this.fcData.YS.length > 0 ? '50%' : '100%'}`
    }
  },
  methods: {
    $mounted () {
      this.KJQJ = this.$store.state.app.env.loginDate.substr(0, 7)
      this.getData(this.KJQJ)
    },
    getData (KJQJ) {
      const { gsdm, zth } = this.$store.state.app.env
      if (!gsdm || !zth) {
        return false
      }
      getCapitalAccountSituation({ GSDM: gsdm, ZTH: zth, KJQJ: KJQJ.replace('-', '') }).then(res => {
        if (res.status === 200) {
          this.ecData = res.data
        }
      })
    }

  },
  mounted () {
    this.$mounted()
  }
}
</script>
