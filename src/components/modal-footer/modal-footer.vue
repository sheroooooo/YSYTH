<template>
  <div class="c-modal-footer">
    <vxe-button type="primary"
                @click="handleOk"
                class="footer-btn"
                size="small">{{okLabel}}</vxe-button>
    <vxe-button type="default"
                @click="handleCancel"
                class="footer-btn"
                size="small">取消</vxe-button>
  </div>
</template>

<script>
export default {
  name: 'ModalFooter',
  props: {
    okText: {
      type: String,
      default: '确认'
    }
  },
  computed: {
    okLabel () {
      return this.okText
    }
  },
  methods: {
    handleOk () {
      this.$emit('handle-ok')
    },
    handleCancel () {
      this.$emit('handle-cancel')
    }
  }
}
</script>

<style lang="less">
.c-modal-footer {
  border-top: 1px solid #d9d9d9;
  position: absolute;
  bottom: 12px;
  left: 0;
  right: 0px;
  .footer-btn {
      float: right;
      margin-right: 16px;
      margin-top: 8px;
  }
}
</style>
