const dt = new Date()
const nowTime = dt.getTime()
const nowDay = dt.getDay()
const nowMonth = dt.getMonth()
const nowYear = dt.getFullYear()

/* 本周 */
export const thisWeek = () => {
  let startTime = nowTime - (nowDay) * 24 * 60 * 60 * 1000 // 周日
  let endTime = nowTime - (nowDay - 6) * 24 * 60 * 60 * 1000 // 周六
  let start = new Date(startTime)
  let end = new Date(endTime)
  return [start, end]
}

/* 本月 */
export const thisMounth = () => {
  let start = new Date(nowYear, nowMonth, 1) // 本月第一天
  let monthEndDate = new Date(nowYear, nowMonth + 1, 1) // 下月第一天
  let days = (monthEndDate - start) / (1000 * 60 * 60 * 24) // 向差除以一天
  let end = new Date(nowYear, nowMonth, days) // 本月最后一天
  return [start, end]
}

/* 获取季度月份 */
const getQuarterStartMonth = (nowMonth) => {
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
}

/* 本季度 */
export const thisQuarter = () => {
  let quarterStartMonth = getQuarterStartMonth(nowMonth) // 本季度开始月份
  let quarterEndMonth = quarterStartMonth + 2 // 本季度结束月份
  // 最后一月的天数
  let days = (new Date(nowYear, quarterEndMonth + 1, 1) - new Date(nowYear, quarterEndMonth, 1)) / (1000 * 60 * 60 * 24)
  let start = new Date(nowYear, quarterStartMonth, 1)
  let end = new Date(nowYear, quarterEndMonth, days)
  return [start, end]
}

/* 本年 */
export const thisYear = () => {
  let start = new Date(nowYear, 0, 1)
  let end = new Date(nowYear, 11, 31)
  return [start, end]
}
