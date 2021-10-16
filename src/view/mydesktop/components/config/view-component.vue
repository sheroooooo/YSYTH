<template>
  <div style="padding:16px;height:100%;width:100%;">
    <component :is="cmptName"></component>
  </div>
</template>

<script>
import cmpts from '../index.js'
export default {
  name: 'ViewComponent',
  props: {
    cmptName: {
      type: String,
      default: ''
    }
  },
  components: { ...cmpts }
}
</script>

<style>
</style>
