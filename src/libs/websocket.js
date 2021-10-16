export class U8WebSocket {
  socketUrl = null
  instance = null
  token = ''
  callback = {}
  constructor (url, token) {
    this.socketUrl = url + token
    this.token = token
    this.initWebSocket()
  }
  initWebSocket () {
    if ('WebSocket' in window) {
      this.socketUrl = this.socketUrl.replace('https', 'wss').replace('http', 'ws')
      this.instance = new WebSocket(this.socketUrl)
      this.instance.onmessage = this.websocketonmessage.bind(this)
      this.instance.onopen = this.websocketonopen.bind(this)
      this.instance.onerror = this.websocketonerror.bind(this)
      this.instance.onclose = this.websocketclose.bind(this)
    } else {
      console.log('您的浏览器不支持 WebSocket!')
    }
  }
  websocketonopen () { // 连接建立之后执行send方法发送数据
    // let actions = { STATE: -2, TYPE: 'upcoming', SENDID: 0, METHODTYPE: 'SELECT', TITLE: '待办通知' }
    let actions = { 'METHODTYPE': 'SELECT', 'SENDID': '0' }
    this.instance.send(JSON.stringify(actions))
  }
  websocketonerror () { // 连接建立失败重连
    this.initWebSocket()
  }
  websocketonmessage (e) { // 数据接收
    try {
      let data = JSON.parse(e.data)
      let type = data[0].FLAG || 'upcoming'
      this.callback[type].map(fn => fn.cb.call(fn.ctx, data))
      return true
    } catch (e) {
      return false
    }
  }
  addMessageCallBack (cb, type = 'upcoming', ctx) {
    this.callback[type] = this.callback[type] || []
    this.callback[type].push({ cb, ctx })
  }
  websocketsend (Data) { // 数据发送
    this.instance.send(Data)
  }
  websocketclose (e) { // 关闭
    this.instance = null
    console.log('断开连接', e)
  }
}
