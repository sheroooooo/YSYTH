import crypto from 'crypto'
let proto = {
  // 测试显示内容
  info (options) {
    if (typeof options === 'string') {
      options = {
        desc: options
      }
    }
    options.type = options.type || 'info'
    options.duration = 10
    /*
    this.vue.$Notice[options.type]({
      title: options.title || '系统消息',
      desc: options.desc || '',
      onClose: options.onClose
    }) */
    this.vue.$Message[options.type]({
      content: options.desc || '',
      onClose: options.onClose
    })
  },
  success (options) {
    if (typeof options === 'string') {
      options = {
        desc: options
      }
    }
    options.type = 'success'
    options.duration = 10
    this.info(options)
  },
  warning (options) {
    if (typeof options === 'string') {
      options = {
        desc: options
      }
    }
    options.type = 'warning'
    options.duration = 10
    this.info(options)
  },
  error (options) {
    if (typeof options === 'string') {
      options = {
        desc: options
      }
    }
    options.type = 'error'
    options.duration = 10
    this.info(options)
  },
  setCache (key, value) {
    // console.log(key, value)
    const dt = { id: key, data: value }
    if ($idb.indexedDB) {
      $idb.put('cacheData', dt)
    } else {
      console.log('浏览器不支持indexedDB')
      localStorage.setItem(key, JSON.stringify(dt))
    }
  },
  async getCache (key) {
    if ($idb.indexedDB) {
      const dt = await $idb.get('cacheData', key)
      if (dt) return dt.data
    } else {
      const dt = localStorage.getItem(key)
      if (dt) return dt.data
    }
  },
  delCache (key) {
    if ($idb.indexedDB) {
      $idb.deleteData('cacheData', key)
    } else {
      localStorage.removeItem(key)
    }
  },
  md5 (str) {
    const md5 = crypto.createHash('md5')
    md5.update(str)
    const cacheId = md5.digest('hex')
    return cacheId
  },
  /// ///ajax三次封装,cached:0:不缓存，1:缓存并更新，2:缓存时不更新
  async ajax (api, params, callback, cached = 0) {
    let cacheData
    let cacheId = ''
    if (cached !== 0) {
      cacheId = this.md5(api.name + (params === '' ? '' : JSON.stringify(params)))
      cacheData = await this.getCache(cacheId)
      if (cacheData && callback) {
        callback(cacheData)
      }
    }
    if (cached !== 2 || !cacheData) {
      api(params).then(res => {
        if (callback) {
          callback(res)
        }
        if (cached !== 0) {
          this.setCache(cacheId, res)
        }
      })
    }
  }
}
const fn = Object.create(null)
fn.install = function (Vue, options) {
  proto.vue = Vue.prototype
  Vue.prototype.$fn = proto
}

export default fn
