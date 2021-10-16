<template>
  <div class="header-bar">
    <div class="custom-content-con">
      <span class="bus-env">
        <span class="login-date">业务日期：{{$store.getters.env.loginDate}}</span>
      </span>
      <slot></slot>
    </div>
  </div>
</template>
<script>

// import AppEnv from '../app-env'
import './header-bar.less'
export default {
  name: 'HeaderBar',

  props: {
    collapsed: Boolean
  },
  computed: {

  },
  methods: {
    handleCollpasedChange (state) {
      this.$emit('on-coll-change', state)
    }
  }
}
</script>
