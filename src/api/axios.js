import axios from 'axios'
import { getToken, setToken } from '@/libs/util.js'
import Router from '@/router/index'
import Vue from 'vue'
import store from '@/store'
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  /*
  * 请求添加token,所有经过axios 的都经过这儿添加token,如果是原R10的接口,不加token
  */
  getInsideConfig (options) {
    const config = {
      baseURL: localStorage.getItem('tcp') + localStorage.getItem('serverPath'),
      headers: {
        'Authorization': getToken(),
        'Content-Type': 'application/json;charset=UTF-8'
      }
    }
    if (options.url === '/U8AppProxy') {
      config.headers = {
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
      let dt = res
      if (opts.getres) {
        dt = res.data
      }
      // 如果请求失败
      if (dt.status === 500) {
        if (opts.getres) {
          store.commit('updateLoadingStatus', { isLoading: false })
          Vue.$vux.toast.text(dt.msg, 'top')
        }
        // 如果是刷新token报错，强制重新登录
        if (opts.url === '/pub/user/refreshToken') {
          setTimeout(function() {
            Router.replace({ name: 'Luncher' })
          }, 1000)
        }
      }
      return dt
    }, error => {
      this.destroy(url)
      let tokenFresh = ''
      let errorInfo = ''
      if (error.response) {
        errorInfo = error.response.data.message
        switch (errorInfo) {
          case 'token invalid':
            tokenFresh = '请求超时'
            break
          case 'Username or password error':
            tokenFresh = '用户名或密码错误'
            break
          case 'org.apache.shiro.authc.AuthenticationException: token invalid':
            tokenFresh = '请求超时'
            break
        }
        if (tokenFresh !== '') {
          if (errorInfo.indexOf('org.apache.shiro.authc.AuthenticationException') >= 0) {
            Vue.$vux.toast.text('请求超时', 'top')
          }
        }
        if (opts.url === '/U8AppProxy' && error.response.status === 500) { // 针对R10请求接口做500判断处理
          store.commit('updateLoadingStatus', { isLoading: false })
          Vue.$vux.toast.text('请求失败', 'top')
        }
      }
      let token = getToken()
      if (token !== '' && token !== 'null') {
        _this.request({
          url: '/pub/user/refreshToken',
          data: { 'Authorization': getToken(), 'type': 'u8_app' },
          method: 'post',
          getres: true
        }).then(
          res => {
            if (res && res.status === 200 && res.data !== '') {
              sessionStorage.removeItem('Authorization')
              setToken(res.data)
              _this.request({
                url: '/U8AppProxy',
                params: {
                  'gnid': 'token',
                  'id': 'setCloudToken',
                  'cloudToken': getToken()
                },
                method: 'get',
                getres: true
              }).then(
                res => {

                }
              )
            } else {
              Vue.$vux.toast.text(res.msg, 'top')
              setToken('')
            }
          }
        )
      }

      return Promise.reject(error)
    })
  }
  request (options) {
    // options.waitfor = true
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(options), options)
    this.interceptors(instance, options)
    return instance(options)
  }
}
export default HttpRequest
