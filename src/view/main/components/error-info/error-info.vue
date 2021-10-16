<template>
  <div v-show="errorList.length>0"
       class="error-info">

    <Alert type="error"
           :class="alertClass">
      <div class="error-info-header">
        错误信息
        <Icon type="md-close"
              size="18"
              class="error-info-header-close"
              @click="handleClose" />
      </div>
      <span slot="desc">
        <template v-if="errorList.length>0 && errorList[errorIndex].desc && errorList[errorIndex].desc!==''">{{errorList[errorIndex].desc}}:</template>{{errorList.length>0?errorList[errorIndex].error:''}}
        <div v-if="errorList.length>1"
             class="error-info-footer">{{errorIndex+1}}/{{errorList.length}}
          <div style="float:right;margin-top:-1px;">
            <Button :disabled="errorIndex===0"
                    size="small"
                    type="text"
                    @click="handlePrev">上一条</Button>
            <Button :disabled="errorIndex===errorList.length-1"
                    size="small"
                    type="text"
                    @click="handleNext">下一条</Button>
          </div>
        </div>
      </span>

    </Alert>
  </div>
</template>
<script>
export default {
  name: 'ErrorInfo',
  props: {
    timeout: {
      type: Number,
      default: 5000
    }
  },
  data () {
    return {
      errorIndex: 0,
      timeId: null,
      showError: false
    }
  },
  computed: {
    alertClass () {
      return ['animated', this.errorList.length === 0 ? 'fadeOut' : 'fadeIn']
    },
    errorList () {
      let reverseList = this.$store.state.app.errorList
      return reverseList.reverse()
    },
    hasError () {
      return this.$store.state.app.errorList.length > 0
    }
  },
  watch: {
    hasError () {
      if (this.timeId) {
        clearTimeout(this.timeId)
      }
      this.timeId = setTimeout(() => {
        this.handleClose()
      }, this.timeout)
    }
  },
  methods: {
    handleClose () {
      this.errorIndex = 0
      if (this.timeId) {
        clearTimeout(this.timeId)
      }
      this.$store.state.app.errorList = []
    },
    handlePrev () {
      if (this.timeId) {
        clearTimeout(this.timeId)
      }
      this.errorIndex = this.errorIndex - 1
    },
    handleNext () {
      if (this.timeId) {
        clearTimeout(this.timeId)
      }
      this.errorIndex = this.errorIndex + 1
    }
  }
}
</script>
<style lang="less" scoped>
.error-info{
  position: fixed;
  width: 400px;
  top:60px;
  left:calc(~"50% - 200px");
  z-index: 2000;
  &-header{
    font-weight: 700;
    margin-top:-5px;
    margin-bottom:8px;
    &-close{
      float:right;
    }
  }
  &-footer{
    margin-top:10px;
    margin-bottom:-10px;
.ivu-btn-text.disabled, .ivu-btn-text.disabled.active, .ivu-btn-text.disabled:active, .ivu-btn-text.disabled:focus, .ivu-btn-text.disabled:hover, .ivu-btn-text[disabled], .ivu-btn-text[disabled].active, .ivu-btn-text[disabled]:active, .ivu-btn-text[disabled]:focus, .ivu-btn-text[disabled]:hover, fieldset[disabled] .ivu-btn-text, fieldset[disabled] .ivu-btn-text.active, fieldset[disabled] .ivu-btn-text:active, fieldset[disabled] .ivu-btn-text:focus, fieldset[disabled] .ivu-btn-text:hover {
    background-color:transparent;
}
  }
}
</style>
