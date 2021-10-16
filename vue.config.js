const webpack = require('webpack')
const path = require('path')
const resolve = dir => {
  return path.join(__dirname, dir)
}
const BASE_URL = process.env.VUE_APP_CURRENTMODE === 'pt' ? '/u8-bs/' : '/'
module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',

        jQuery: 'jquery',

        'windows.jQuery': 'jquery'
      })
    ],
    devtool: 'source-map'
  },
  publicPath: BASE_URL,
  lintOnSave: false,
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('_c', resolve('src/components'))
  },
  // 设为false打包时不生成.map文件
  productionSourceMap: false,
  // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 '' ，即空字符串
  devServer: {
    proxy: 'https://ufgovu8.yonyougov.com'
  }
}
