<!--
 * 工作台 采购情况
-->
<template>
  <vuc-panel v-bind="$attrs">
    <div class="gpmc-condition">
      <div class="gpmc-condition-table"
           :style="{height:`${tableHeight}px`,width:`${tableWidth}px`}">
        <table>
          <thead>
            <tr>
              <td>类型</td>
              <td>采购品目</td>
              <td>数量</td>
              <td>金额</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for='(valueItem, ivalue) in formatData["采购中"]'
                :key="`采购中${ivalue}`">
              <template v-if="ivalue===0">
                <td align="center"
                    valign="middle"
                    :rowspan='formatData["采购中"].length'>采购中</td>
              </template>
              <td>
                {{valueItem['CGMLDM|CGMLMC']}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['SL'])}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['JE'])}}
              </td>
            </tr>

            <tr v-for='(valueItem, ivalue) in formatData["已申请"]'
                :key="`已申请${ivalue}`">
              <template v-if="ivalue===0">
                <td align="center"
                    valign="middle"
                    :rowspan='formatData["已申请"].length'>已申请</td>
              </template>
              <td>
                {{valueItem['CGMLDM|CGMLMC']}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['SL'])}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['JE'])}}
              </td>
            </tr>

            <tr v-for='(valueItem, ivalue) in formatData["已完成"]'
                :key="`已完成${ivalue}`">
              <template v-if="ivalue===0">
                <td align="center"
                    valign="middle"
                    :rowspan='formatData["已完成"].length'>已完成</td>
              </template>
              <td>
                {{valueItem['CGMLDM|CGMLMC']}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['SL'])}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['JE'])}}
              </td>
            </tr>

            <tr v-for='(valueItem, ivalue) in formatData["已验收"]'
                :key="`已验收${ivalue}`">
              <template v-if="ivalue===0">
                <td align="center"
                    valign="middle"
                    :rowspan='formatData["已验收"].length'>已验收</td>
              </template>
              <td>
                {{valueItem['CGMLDM|CGMLMC']}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['SL'])}}
              </td>
              <td align="right"
                  class="money">
                {{formatMoney(valueItem['JE'])}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="gpmc-condition-echart">
        <desktop-echarts style="display:inline-block;"
                         :height="chartHeight"
                         :width="chartWidth"
                         :chart-data="ecData"
                         :columns="columns"
                         MaxAxisLen=4
                         echart-type="bar"
                         value-field="JE"
                         text-field="CGMLMC"
                         bar-drection="y"></desktop-echarts>
      </div>
    </div>
  </vuc-panel>
</template>
<script>
import DesktopEcharts from '../desktop-echarts'
import { getPurchasingBusinessInformation } from '@/api/mydesktop/mydesktop.js'
export default {
  name: 'GpmcCondition',
  components: { DesktopEcharts },
  data () {
    return {
      GSDM: this.$store.getters.env.gsdm,
      KJND: this.$store.getters.env.kjnd,
      columns: [{ key: 'ZTLX', name: '状态', axis: 0 }, { key: 'JEA', name: 'A 货物', stack: '采购' }, { key: 'JEB', name: 'B 货物', stack: '采购' }],
      ecData: [
        { ZTLX: '采购中', JEA: 0, JEB: 0 },
        { ZTLX: '已申请', JEA: 0 },
        { ZTLX: '已完成', JEA: 0 },
        { ZTLX: '已验收', JEA: 0 }
      ],
      formatData: {
        '采购中': [
          { 'CGMLMC': '货物', 'SL': 11, 'JE': 79, 'LX': '2', 'CGMLDM': 'A', 'CGMLDM|CGMLMC': 'A 货物' },
          { 'CGMLMC': '工程', 'SL': 1, 'JE': 12, 'LX': '2', 'CGMLDM': 'B', 'CGMLDM|CGMLMC': 'B 工程' }
        ],
        '已申请': [
          { 'CGMLMC': '货物', 'SL': 4, 'JE': 8, 'LX': '1', 'CGMLDM': 'A', 'CGMLDM|CGMLMC': 'A 货物' }
        ],
        '已完成': [
          { 'CGMLMC': '货物', 'SL': 1, 'JE': 34, 'LX': '3', 'CGMLDM': 'A', 'CGMLDM|CGMLMC': 'A 货物' },
          { 'CGMLMC': '工程', 'SL': 1, 'JE': 11, 'LX': '3', 'CGMLDM': 'B', 'CGMLDM|CGMLMC': 'B 工程' }
        ],
        '已验收': [
          { 'CGMLMC': '货物', 'LX': '4', 'CGMLDM': 'A', 'CGMLDM|CGMLMC': 'A 货物' },
          { 'CGMLMC': '工程', 'LX': '4', 'CGMLDM': 'B', 'CGMLDM|CGMLMC': 'B 工程' }
        ]
      }
    }
  },
  computed: {
    chartHeight () {
      return this.$attrs.height - 45 - 10
    },
    chartWidth () {
      // return this.$attrs.width / 2 - 20
      return this.$attrs.width - this.tableWidth - 20
      // return 400
    },
    tableHeight () {
      return this.$attrs.height - 45 - 10
    },
    tableWidth () {
      // return this.$attrs.width / 2 - 20
      return 500
    }
  },
  methods: {
    $mounted (props) {
      // console.log(this.$attrs)
      if (props) {
        console.log(props)
        const { width, height } = props
        this.$attrs.width = width
        this.$attrs.height = height
      }
      this.getPurchasingBusinessInformation()
    },
    formatMoney (val) {
      if (val === 0) {
        return ''
      }
      return this.$utils.commafy(val, { fixed: 2 })
    },
    getPurchasingBusinessInformation () {
      this.$fn.ajax(getPurchasingBusinessInformation, { GSDM: this.GSDM, KJND: this.KJND }, res => {
        if (res && res.status === 200) {
          this.formatData = res.data
          this.dealWithGpmcData(res.data)
        }
      })
    },
    dealWithGpmcData (dataMap) {
      this.columns = [
        { key: 'ZTLX', name: '状态', axis: 0 }
      ]
      // 因为类型数目不确定，因此取一个最长的来设置图表的columns
      let fullType = ''
      for (let key in dataMap) {
        if (fullType === '') {
          fullType = key
        } else {
          if (dataMap[key].length > dataMap[fullType].length) {
            fullType = key
          }
        }
        // 设置ecData
        dataMap[key].map(item => {
          for (let ecDataItem of this.ecData) {
            if (ecDataItem.ZTLX === key) {
              ecDataItem[`JE${item.CGMLDM}`] = item.JE || 0
              break
            }
          }
        })
      }
      // 设置columns
      dataMap[fullType].map(item => {
        this.columns.push({
          key: `JE${item.CGMLDM}`,
          name: item['CGMLDM|CGMLMC'],
          stack: '采购'
        })
      })
    }
  },
  mounted () {
    this.$mounted()
  }
}
</script>
<style lang="less" scoped>
@import './gpmc-condition.less';
</style>
