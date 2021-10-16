import echarts from 'echarts'

const getSeries = function (options) {
  let seriesTemp = []
  for (let j = 0, len = options.series.length; j < len; j++) {
    let obj = {
      'name': options.legendData[j],
      'type': options.shapeType,
      'stack': 'sum',
      'barCategoryGap': '50%',
      'itemStyle': {
        'normal': {
          'color': options.seriesColor[j].bacColor,
          'barBorderColor': options.seriesColor[j].borColor,
          'barBorderWidth': 6,
          'barBorderRadius': 0,
          'label': {
            'show': true,
            'position': options.seriesColor[j].position,
            'textStyle': {
              'color': options.seriesColor[j].textColor
            }
          }
        }
      },
      'data': options.series[j].data
    }
    seriesTemp.push(obj)
  }
  return seriesTemp
}

const install = function (Vue) {
  Object.defineProperties(Vue.prototype, {
    $chart: {
      get () {
        return {
          // 柱形bar、折线line、
          line: function (options) {
            this.chart = echarts.init(document.getElementById(options.target))
            this.chart.clear()
            const optionData = {
              /*  title: {
                  text: '',
                  subtext: '',
                  sublink: ''
                }, */
              /* tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                  let formatterContent = params[0].name + '<br/>'
                  for (let j = 0, len = params.length; j < len; j++) {
                    formatterContent += params[j].seriesName + ' : ' + params[j].value + '<br/>'
                  }
                  return formatterContent
                }
              },
              legend: {
                // orient: 'vertical', // 'vertical'
                selectedMode: true,
                data: options.legendData
              },
              toolbox: {
                show: true,
                feature: {
                  // mark : {show: true},
                  // dataView : {show: true, readOnly: false},
                  // restore : {show: true},
                  // saveAsImage: { show: true }
                }
              },
              calculable: false, */
              xAxis: [
                {
                  type: 'category',
                  data: options.xAxis
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  boundaryGap: [0, 0.5]
                }
              ],
              series: getSeries(options)
            }
            this.chart.setOption(optionData)
          },
          // 饼状图pie、
          pie1: function (options) {
            this.chart = echarts.init(document.getElementById(options.target))
            this.chart.clear()
            const optionData = {
              title: {
                text: options.title,
                subtext: options.subtext,
                x: 'center'
              },
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
              },
              legend: {
                orient: 'vertical',
                x: 'left',
                data: options.legendData
              },
              toolbox: {
                show: true,
                feature: {

                }
              },
              calculable: true,
              series: [
                {
                  name: options.seriesName,
                  type: 'pie',
                  radius: '60%',
                  center: ['50%', '60%'],
                  data: options.series
                }
              ]
            }
            this.chart.setOption(optionData)
          },
          // 饼图 pie
          // data入参包括data(Object,图表数据)、name(String,图例名)--data:[data:'',name:'']
          // $div(String,容器div的id)
          // Object高级配置,根据官方API，按需增加，目前支持title、legend
          pie: function ($div, data, title = '') {
            this.chart = echarts.init(document.getElementById($div))
            this.chart.clear()
            let legendData = []
            let seriesData = []
            data.forEach(item => {
              legendData.push(item.name)
              seriesData.push({ value: item.data, name: item.name })
            })
            let optionData = {
              title: {
                text: title, // 配置项--标题
                x: 'center',
                textStyle: {
                  fontSize: 14,
                  color: '#7AC5CD',
                  fontWeight: 'normal',
                  lineHeight: 40
                }
              },
              tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
              },
              legend: { // 图例 对应name属性
                data: legendData,
                orient: 'vertical',
                left: 'left'
              },
              series: [ // 数据
                {
                  name: '访问来源',
                  type: 'pie',
                  radius: '55%',
                  center: ['50%', '60%'],
                  data: seriesData,
                  itemStyle: {
                    emphasis: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            }
            this.chart.setOption(optionData)
          },
          // bar 默认柱形图  barStack堆叠柱形图， barWaterFall瀑布图(瀑布图第四个入参为透明字段)
          // data入参包括data(Object,图表数据)、name(String,图例名)
          // data:[
          //   {data:[{key:value},{key:value}],name:''},
          //   {data:[{key:value},{key:value}],name:''}
          // ]
          // $div(String,容器div的id)
          // title(String,标题)
          bar: function ($div, data, title = '') {
            this.chart = echarts.init(document.getElementById($div))
            this.chart.clear()

            let xAxis = {
              type: 'category',
              data: []
            }
            let legendData = []
            let series = []
            for (let i = 0, len = data.length; i < len; i++) {
              xAxis.data.push(data[i].name)
              for (var key in data[i].data) {
                let value = data[i].data[key]
                if (i === 0) {
                  legendData.push(key)
                  series.push({
                    'name': key,
                    'type': 'bar',
                    'data': []
                  })
                }
                for (let j = 0, len = series.length; j < len; j++) {
                  if (series[j].name === key) {
                    series[j].data.push(value)
                  }
                }
              }
            }
            let optionData = {
              title: {
                text: title,
                x: 'center',
                textStyle: {
                  fontSize: 18,
                  color: '#7AC5CD',
                  fontWeight: 'normal',
                  lineHeight: 40
                }
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
              },
              legend: { // 合并图例配置
                data: legendData,
                left: 'left',
                orient: 'vertical'
              },
              xAxis,
              yAxis: [
                {
                  type: 'value'
                }
              ],
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
              },
              series
            }
            // console.log(optionData)
            this.chart.setOption(optionData)
          },
          // 堆叠柱形图
          barStack: function ($div, data, title = '') {
            this.chart = echarts.init(document.getElementById($div))
            this.chart.clear()

            let xAxis = {
              type: 'category',
              data: []
            }
            let legendData = []
            let series = []
            for (let i = 0, len = data.length; i < len; i++) {
              xAxis.data.push(data[i].name)
              for (var key in data[i].data) {
                let value = data[i].data[key]
                if (i === 0) {
                  legendData.push(key)
                  series.push({
                    'name': key,
                    'type': 'bar',
                    'stack': '总计',
                    'label': {
                      normal: {
                        show: true,
                        position: 'inside'
                      }
                    },
                    'data': []
                  })
                }
                for (let j = 0, len = series.length; j < len; j++) {
                  if (series[j].name === key) {
                    series[j].data.push(value)
                  }
                }
              }
            }
            let optionData = {
              title: {
                text: title,
                x: 'center',
                textStyle: {
                  fontSize: 18,
                  color: '#7AC5CD',
                  fontWeight: 'normal',
                  lineHeight: 40
                }
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
              },
              legend: {
                data: legendData,
                left: 'left',
                orient: 'vertical'
              },
              xAxis,
              yAxis: [
                {
                  type: 'value'
                }
              ],
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
              },
              series
            }
            // console.log(optionData)
            this.chart.setOption(optionData)
          },
          // 瀑布图，transparent：瀑布图中透明的数据字段
          barWaterFall: function ($div, data, title = '', transparent) {
            this.chart = echarts.init(document.getElementById($div))
            this.chart.clear()

            let xAxis = {
              type: 'category',
              data: []
            }
            let legendData = []
            let series = []
            for (let i = 0, len = data.length; i < len; i++) {
              xAxis.data.push(data[i].name)
              for (var key in data[i].data) {
                let value = data[i].data[key]
                if (i === 0) {
                  legendData.push(key)
                  series.push({
                    'name': key,
                    'type': 'bar',
                    'stack': '总计',
                    'data': []
                  })
                }
                for (let j = 0, len = series.length; j < len; j++) {
                  if (series[j].name === key) {
                    series[j].data.push(value)
                  }
                }
              }
            }
            series.map(item => {
              if (item.name === transparent) { // 将该项变为透明（瀑布图）
                item.itemStyle = {
                  normal: {
                    barBorderColor: 'rgba(0,0,0,0)',
                    color: 'rgba(0,0,0,0)'
                  },
                  emphasis: {
                    barBorderColor: 'rgba(0,0,0,0)',
                    color: 'rgba(0,0,0,0)'
                  }
                }
              }
            })
            if (transparent) { // 瀑布图不展示对应图例
              let indexDel = legendData.indexOf(transparent)
              legendData.splice(indexDel, 1)
            }
            let optionData = {
              title: {
                text: title,
                x: 'center',
                textStyle: {
                  fontSize: 18,
                  color: '#7AC5CD',
                  fontWeight: 'normal',
                  lineHeight: 40
                }
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
              },
              legend: {
                data: legendData,
                left: 'left',
                orient: 'vertical'
              },
              xAxis,
              yAxis: [
                {
                  type: 'value'
                }
              ],
              grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
              },
              series
            }
            // console.log(optionData)
            this.chart.setOption(optionData)
          }
        }
      }
    }
  })
}

export default {
  install
}
