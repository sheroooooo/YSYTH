<template>
  <vuc-panel v-bind="$attrs"
             :class="[`${prefixCls}`]">
    <div slot="header"
         :class="[`${prefixCls}-header`]">会计期间：
      <DatePicker type="month"
                  transfer
                  :clearable="false"
                  :editable="false"
                  :value="KJQJ"
                  size="small"
                  format="yyyy年MM月"
                  placeholder="请选择期间"
                  style="width: 120px"
                  @on-change="handleMonthChange"></DatePicker>
    </div>
    <div :class="[`${prefixCls}-content`]">
      <f-c-table :style="tableStyle"
                 :data="fcData.CW"
                 l-b-m-c="财务会计"></f-c-table>
      <f-c-table :style="tableStyle"
                 :data="fcData.YS"
                 l-b-m-c="预算会计"></f-c-table>
      <div>
        <desktop-echarts ref="chart"
                         style="display:inline-block;"
                         :height="chartHeight"
                         :width="chartWidth"
                         :chart-data="fcData.CWFY"
                         :item-color="itemColor"
                         value-field="QMYE"
                         text-field="KMMC"
                         chart-title="财务费用类"></desktop-echarts>
        <desktop-echarts ref="chart"
                         style="display:inline-block;"
                         :height="chartHeight"
                         :width="chartWidth"
                         :chart-data="fcData.CWSR"
                         :item-color="itemColor"
                         value-field="QMYE"
                         text-field="KMMC"
                         chart-title="财务收入类"></desktop-echarts>
        <desktop-echarts ref="chart"
                         v-if="fcData.YSZC && fcData.YSZC.length>0"
                         style="display:inline-block;"
                         :height="chartHeight"
                         :width="chartWidth"
                         :chart-data="fcData.YSZC"
                         :item-color="itemColor"
                         value-field="QMYE"
                         text-field="KMMC"
                         chart-title="预算支出类"></desktop-echarts>
        <desktop-echarts ref="chart"
                         v-if="fcData.YSSR && fcData.YSSR.length>0"
                         style="display:inline-block;"
                         :height="chartHeight"
                         :width="chartWidth"
                         :chart-data="fcData.YSSR"
                         :item-color="itemColor"
                         value-field="QMYE"
                         text-field="KMMC"
                         chart-title="预算收入类"></desktop-echarts>
      </div>
    </div>
  </vuc-panel>
</template>

<script>
import { getFinancialSituation } from '@/api/mydesktop/mydesktop.js'
import FCTable from './f-c-table.vue'
import DesktopEcharts from '../desktop-echarts'
export default {
  name: 'FinancialCondition',
  components: { FCTable, DesktopEcharts },
  data () {
    return {
      prefixCls: 'financial-condition',
      itemColor: { '资产类': '#0066FF', '负债类': '#FF9933', '净资产类': '#339900', '收入类': '#0099FF', '费用类': '#33CC99', '预算结余类': '#FF6633', '预算收入类': '#CC3300', '预算支出类': '#FF9900' },
      KJQJ: '',
      fcData: {
        CW: [
          { LXMC: '资产类', QCYE: 725122027.46, BQFS: 217402867.68, QMYE: 942524895.14 },
          { LXMC: '负债类', QCYE: 89149723.42, BQFS: 8819206.39, QMYE: 97968929.81 },
          { LXMC: '净资产类', QCYE: 635972304.04, BQFS: 125482.10, QMYE: 636127786.14 },
          { LXMC: '收入类', BQFS: 14988810.47, QMYE: 14988810.47 },
          { LXMC: '费用类', BQFS: 223416989.66, QMYE: 223416989.66 }
        ],
        YS: [{ LXMC: '预算结余类', BQFS: 203478260.00, QMYE: 203478260.00 },
          { LXMC: '预算收入类', BQFS: 223416990.04, QMYE: 223416990.04 },
          { LXMC: '预算支出类', BQFS: 19938730.04, QMYE: 19938730.04 }]
      }
    }
  },
  computed: {
    height () {
      return this.$attrs.height - 45
    },
    chartHeight () {
      return this.$attrs.height - 52 - 6 * 36
    },
    chartWidth () {
      const width = this.$attrs.width
      return this.fcData.YS.length > 0 ? width / 4 : width / 2
    },
    tableStyle () {
      return `display:inline-block;width:${this.fcData.YS && this.fcData.YS.length > 0 ? '50%' : '100%'}`
    }
  },
  methods: {
    $mounted (props) {
      if (props) {
        const { width, height } = props
        this.$attrs.width = width
        this.$attrs.height = height
      }
      this.KJQJ = this.$store.state.app.env.loginDate.substr(0, 7)
      this.getData(this.KJQJ)
    },
    getData (KJQJ) {
      const { gsdm, zth } = this.$store.state.app.env
      if (!gsdm || !zth) {
        return false
      }
      getFinancialSituation({ GSDM: gsdm, ZTH: zth, KJQJ: KJQJ.replace('-', '') }).then(res => {
        if (res.status === 200) {
          this.fcData = res.data
        }
      })
    },
    handleMonthChange (val) {
      this.KJQJ = val.replace('年', '-').replace('月', '')
      this.getData(this.KJQJ)
    }

  },
  mounted () {
    this.$mounted()
  }
}
</script>

<style lang="less">
@import './financial-condition.less';
</style>
