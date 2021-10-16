<template>
  <div class="button-edit">
    <Input v-model="inputValue"
      suffix="ios-more"
      @click.native="btnClick($event)" />
    <Modal v-model="showModal"
      @on-change="setValue"
      :title="title"
      @on-ok="handleModalOkClick"
      @on-cancel="handleModalCancelClick">
      <slot></slot>
    </Modal>
  </div>
</template>
<script>
export default {
  name: 'ButtonEdit',
  data () {
    return {
      inputValue: '',
      tempValue: '',
      showModal: false
    }
  },
  props: {
    value: {
      type: String,
      default: '' },
    title: {
      type: String,
      default: '' },
    parentData: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    value () {
      this.setInitValue()
    }
  },
  methods: {
    setInitValue () {
      this.inputValue = this.value
    },
    setValue (val) {
      this.tempValue = val
    },
    btnClick (event) {
      this.showModal = true
    },
    handleModalOkClick () {
      this.inputValue = this.tempValue
      this.$emit('on-change', this.inputValue)
    },
    handleModalCancelClick () {

    }
  },
  mounted () {
    this.setInitValue()
  }
}
</script>
<style scoped>
@import './button-edit.less';
</style>
