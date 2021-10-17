import axios from 'axios'
import Router from '@/router/index'
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (Object.keys(this.queue).length === 0) {

    }
  }

  interceptors (instance, opts) {
    let url = this.baseUrl + opts.url
    // 请求拦截
    let _this = this
    instance.interceptors.request.use(config => {
      if (opts.waitfor === true) {
        this.queue[url] = true
      }
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      let dt = res.data
      return dt
    }, error => {
      this.destroy(url)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(options), options)
    this.interceptors(instance, options)
    return instance(options)
  }
}
export default HttpRequest
