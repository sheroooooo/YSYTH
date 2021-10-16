<template>
  <div class="act-form">
    <iframe style="width:100%;height: 100%;border:0px;"
            frameborder="0"
            :src="src"
            ref="iframe"></iframe>
  </div>
</template>
<script>
export default {
  name: 'IFrame',
  props: {
    src: {
      type: String,
      default: '/ue/iframe.html'
    },
    handler: Function
  },

  methods: {
    postMessage (options) {
      let iframeWin = this.$refs.iframe.contentWindow
      // 外部vue向iframe内部传数据
      //  object为需要传送的数据对象*号为接收数据的项目url地址
      // options:{cmd:'',params:{}}
      iframeWin.postMessage(options, '*')
    },
    acceptMessage (event) {
      const data = event.data
      // console.log({ data, event }, '接收消息')
      this.$emit('on-accept-message', { data, event })
    }
  },
  created () {
    if (!window.listenMessage) {
      window.listenMessage = true
      window.removeEventListener('message', this.acceptMessage, true)
      window.addEventListener('message', this.acceptMessage, false)
    }
  }
}
</script>
