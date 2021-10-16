<template>
  <div class="fj-view-modal">
    <iframe :src="src"
            ref="browserFile"
            :class="lastName === 'pdf'?'pdf-print-browser':'view-img'"></iframe>
  </div>
</template>

<script>
export default {
  name: 'FjViewModal',
  props: ['lastName', 'res'],
  data () {
    return {
      src: '',
    }
  },
  methods: {
    blobToUrl (blob, callback) {
      let reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onload = function (e) {
        callback(reader.result)
        // reader.close()
        reader = null
      }
    },
    openBlobFile () {
      const data = this.res
      const _this = this
      let url = this.lastName === 'pdf' ? '/pdf-viewer/web/viewer.html?time=' + (new Date()).Format('yyyyMMddhhmmssS') : '/img-viewer/viewer.html?time=' + (new Date()).Format('yyyyMMddhhmmssS')
      this.src = url
      if (this.lastName === 'pdf') {
        this.blobToUrl(data, blobUrl => {
          _this.$refs.browserFile.onload = function () {
            _this.$refs.browserFile.contentWindow.postMessage({ cmd: 'load', blobUrl }, '*')
          }
        })
      } else {
        this.$refs.browserFile.onload = function () {
          _this.$refs.browserFile.contentWindow.postMessage({ cmd: 'load', data }, '*')
        }
      }
    }
  },
  mounted () {
    this.openBlobFile()
  }
}
</script>

<style lang="less">
.fj-view-modal {
  display: flex;
  justify-content: center;
  .view-img {
    height: 600px;
    width: 800px;
  }
  .pdf-print-browser {
    height: 600px;
    width: 1100px;
  }
}
</style>
