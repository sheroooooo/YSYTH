<template>
  <div v-if="showFullScreenBtn"
       class="full-screen-btn-con">
    <Tooltip :content="value ? '退出全屏' : '全屏'"
             placement="bottom">
      <Icon @click.native="handleChange"
            :type="value ? 'md-contract' : 'md-expand'"
            :size="23"></Icon>
    </Tooltip>
    <span class="btn-closed"
          v-if="value"
          @click="handleClose">
      <Icon type="md-close" />
    </span>
  </div>
</template>

<script>
export default {
  name: 'Fullscreen',
  computed: {
    showFullScreenBtn () {
      return window.navigator.userAgent.indexOf('MSIE') < 0
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isLogin: false
    }
  },
  methods: {
    handleFullscreen () {
      let main = document.body
      if (this.value) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      } else {
        if (main.requestFullscreen) {
          main.requestFullscreen()
        } else if (main.mozRequestFullScreen) {
          main.mozRequestFullScreen()
        } else if (main.webkitRequestFullScreen) {
          main.webkitRequestFullScreen()
        } else if (main.msRequestFullscreen) {
          main.msRequestFullscreen()
        }
      }
      this.$fn.setCache('fullscreen', this.value ? 0 : 1)
    },
    async handleChange () {
      if (this.isLogin) {
        this.isLogin = false
        let fullscreen = await this.$fn.getCache('fullscreen')
        if (fullscreen === 1) {
          // this.value = false
          this.handleFullscreen()
          return false
        }
      }
      this.handleFullscreen()
    },
    handleClose () {
      window.opener = null
      // window.open('about:blank', '_self')
      window.opener = window.open('about:blank', '_self')
      window.opener = null
      window.close()
    }
  },
  mounted () {
    let isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen
    isFullscreen = !!isFullscreen
    document.addEventListener('fullscreenchange', () => {
      this.$emit('input', !this.value)
      this.$emit('on-change', !this.value)
    })
    document.addEventListener('mozfullscreenchange', () => {
      this.$emit('input', !this.value)
      this.$emit('on-change', !this.value)
    })
    document.addEventListener('webkitfullscreenchange', () => {
      this.$emit('input', !this.value)
      this.$emit('on-change', !this.value)
    })
    document.addEventListener('msfullscreenchange', () => {
      this.$emit('input', !this.value)
      this.$emit('on-change', !this.value)
    })
    this.$emit('input', isFullscreen)
    this.isLogin = true
    setTimeout(() => {
      // this.handleChange(true)
    })
  }
}
</script>
<style lang="less" scoped>
@import "./fullscreen.less";
</style>
