import myEchart from './echarts/index.js'
const install = function (Vue) {
  Object.defineProperties(Vue.prototype, {
    $charts: {
      get () {
        return myEchart
      }
    }
  })
}

export default {
  install
}
