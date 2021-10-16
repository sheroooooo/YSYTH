<template>
  <div class="qrcode-modal">
    <div :id="qrCodeId"
         style="margin:15px 30px;"></div>
    <div class="qrcode-modal-btn">
      <Button type="primary"
              class="qrcode-modal-btn-style"
              @click="handleBtnClick">上传完成</Button>
    </div>
    <!-- 创建一个div，并设置id为qrcode -->
  </div>
</template>

<script>
import QRCode from 'qrcodejs2' // 引入qrcode
export default {
  name: 'VucQrcode',
  data () {
    return {
      qrCodeId: this.$utils.guid()
    }
  },
  methods: {
    getRootPath () {
      // v-if="window.document.location.protocol"
      return window.document.location.origin
    },
    qrcode (authorization, params) {
      let text = `${this.getRootPath()}/mobileupload/h5-upload-img.html?Authorization=${authorization}`
      let keys = Object.keys(params)
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i]
        const val = params[key]
        text = `${text}&&${key}=${val}`
      }
      console.log(text)
      // 和div的id相同 必须是id  class类名会报错
      // 第二参数是他的配置项
      let qrCode = new QRCode(this.qrCodeId, {
        width: 200,
        height: 200,
        text: text
        // colorDark: '#ccc',
        // colorLight: 'yellow'
      })
      console.log(qrCode)
    },
    handleBtnClick () {
      this.$emit('uploadSuccess')
    }

  }
}
</script>
<style lang="less">
  @import './phone-qrcode.less';
</style>
