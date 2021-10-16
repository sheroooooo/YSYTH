<!--
    公用组件 ：日期范围快捷键  支持：本周、本月、本季度、本年
    /**
     * @param {Boolean} [@getDate]   - 日期范围改变 调取父组件方法 获取当前日期范围
        返回数据格式：["2019-01-01","2019-03-31"]
  */
-->
<template>
  <DatePicker type="daterange"
    :options="options"
    placement="bottom-start"
    placeholder="请选择日期范围"
    @on-change='onDateChange'>
  </DatePicker>
</template>

<script>
export default {
  name: 'DateRange',
  data () {
    const _this = this
    return {
      options: {
        shortcuts: [
          {
            text: '本周',
            value () {
              return _this.thisWeek()
            }
          },
          {
            text: '本月',
            value () {
              return _this.thisMounth()
            }
          },
          {
            text: '本季度',
            value () {
              return _this.thisQuarter()
            }
          },
          {
            text: '本年',
            value () {
              return _this.thisYear()
            }
          }
        ]
      }
    }
  },
  computed: {
    nowTime: {
      get: function () {
        return new Date().getTime()
      }
    },
    nowDay: {
      get: function () {
        return new Date().getDay()
      }
    },
    nowMonth: {
      get: function () {
        return new Date().getMonth()
      }
    },
    nowYear: {
      get: function () {
        return new Date().getFullYear()
      }
    }
  },
  methods: {
    /* 日期改变 调取父组件 getDate 方法 */
    onDateChange (date) {
      this.$emit('on-change', date)
      this.$emit('on-date-change', date)
    },
    /* 本周 */
    thisWeek () {
      let startTime = this.nowTime - (this.nowDay) * 24 * 60 * 60 * 1000 // 周日
      let endTime = this.nowTime - (this.nowDay - 6) * 24 * 60 * 60 * 1000 // 周六
      let start = new Date(startTime)
      let end = new Date(endTime)
      return [start, end]
    },

    /* 本月 */
    thisMounth () {
      let start = new Date(this.nowYear, this.nowMonth, 1) // 本月第一天
      let monthEndDate = new Date(this.nowYear, this.nowMonth + 1, 1) // 下月第一天
      let days = (monthEndDate - start) / (1000 * 60 * 60 * 24) // 向差除以一天
      let end = new Date(this.nowYear, this.nowMonth, days) // 本月最后一天
      return [start, end]
    },

    /* 获取季度月份 */
    getQuarterStartMonth (nowMonth) {
      let quarterStartMonth = 0
      if (nowMonth < 3) {
        quarterStartMonth = 0
      }
      if (nowMonth > 2 && nowMonth < 6) {
        quarterStartMonth = 3
      }
      if (nowMonth > 5 && nowMonth < 9) {
        quarterStartMonth = 6
      }
      if (nowMonth > 8) {
        quarterStartMonth = 9
      }
      return quarterStartMonth
    },

    /* 本季度 */
    thisQuarter () {
      let quarterStartMonth = this.getQuarterStartMonth(this.nowMonth) // 本季度开始月份
      let quarterEndMonth = quarterStartMonth + 2 // 本季度结束月份
      // 最后一月的天数
      let days = (new Date(this.nowYear, quarterEndMonth + 1, 1) - new Date(this.nowYear, quarterEndMonth, 1)) / (1000 * 60 * 60 * 24)
      let start = new Date(this.nowYear, quarterStartMonth, 1)
      let end = new Date(this.nowYear, quarterEndMonth, days)
      return [start, end]
    },

    /* 本年 */
    thisYear () {
      let start = new Date(this.nowYear, 0, 1)
      let end = new Date(this.nowYear, 11, 31)
      return [start, end]
    }
  }
}
</script>
