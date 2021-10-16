<template>

  <DatePicker :open="open"
    type="date"
    size="large"
    format="yyyy-MM-dd"
    @on-change="handleChange"
    v-click-outside:pointerdown="handleOutsideClick">
    <a class="label"
      href="javascript:void(0)"
      @click="handleClick">
      <Icon size="18"
        type="ios-calendar-outline"></Icon>
      <span v-if="value === ''">请选择日期</span>
      <span class="label"
        v-else>{{ value }}</span>
    </a>
  </DatePicker>

</template>
<script>
import { mapMutations } from 'vuex'
export default {
  data () {
    return {
      open: false,
      value: ''
    }
  },
  watch: {
    value () {
      // 这里应该人个提醒是否切换，切换时要关闭页签
      // this.$store.dispatch('setLoginDate', this.value)
      this.$store.commit('setLoginDate', this.value)
      this.$emit('on-change', this.value)
    }
  },
  methods: {
    ...mapMutations([
      'setLoginDate'
    ]),

    handleClick () {
      this.open = !this.open
    },
    handleChange (date) {
      this.open = false
      this.value = date
    },
    handleOutsideClick (event) {
      this.open = false
    }
  },
  mounted () {
    const loginDate = this.$store.getters.env.loginDate
    this.value = loginDate
  }
}
</script>
