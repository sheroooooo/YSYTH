<template>
  <keep-alive :include="cacheList"
    :exclude="notCacheName">
    <router-view ref="child" />
  </keep-alive>
</template>
<script>
export default {
  name: 'ParentView',
  computed: {
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    notCacheName () {
      return [(this.$route.meta && this.$route.meta.notCache) ? this.$route.name : '']
    },
    cacheList () {
      return ['ParentView', ...this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta.notCache)).map(item => item.name) : []]
    }
  }/* ,
  watch: {
    tagNavList: {
      handler (newVal, oldVal) {
        let _this = this
        let timeId = setTimeout(() => {
          let tags = _this.$store.state.app.tagNavList.filter(item => {
            if (item.name === 'home') return false
            return item.name === _this.$vnode.key || (item.name + item.params.id) === _this.$vnode.key
          })
          if (tags.length === 0) {
            _this.$destroy('ParentView')
          }
          clearTimeout(timeId)
        }, 2000)
      },
      deep: true
    }
  } */
}
</script>
