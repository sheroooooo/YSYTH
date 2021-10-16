<template>
  <div class="group-button">
    <slot name="left"></slot>
    <Button :class="{'button':true}"
            v-for="(item,index) in btnData"
            :key="index"
             :type="item.type"
            :disabled='item.disabled === undefined? false :item.disabled'
            @click="handleClick(item)">
      {{item.title}}
    </Button>
    <slot name="right"></slot>
  </div>
</template>

<script>
export default {
  name: 'GroupButton',
  data () {
    return {

    }
  },
  props: {
    btnData: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleClick (item) {
      this.$emit('on-click', item)
    }
  }
}
</script>

<style lang="less" >
  @import './group-button.less';
</style>
