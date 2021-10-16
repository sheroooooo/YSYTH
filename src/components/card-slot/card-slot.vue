<template>
  <div class="card-slot">
    <div class="card-slot-title">{{title}}</div>
    <div class="card-slot-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardSlot',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
}

</script>

<style lang="less">
@import './card-slot.less';
</style>
