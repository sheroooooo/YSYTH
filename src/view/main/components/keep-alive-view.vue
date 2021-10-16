<template>
  <keep-alive>
    <router-view :key="viewKey()" />
  </keep-alive>
</template>
<script>
export default {
  name: 'KeepAliveView',
  data () {
    return {
      vnode: null
    }
  },
  watch: {
    '$route' (newRoute) {
      let _this = this
      setTimeout(() => {
        _this.setVnode(newRoute)
      }, 24)
    }
  },
  methods: {
    viewKey () {
      return `${this.$route.name}-${this.$route.params.id}`
    },
    setVnode (route) {
      const nodeTag = `${route.name}-${route.params.id}`

      const pos = this.$vnode.componentInstance._vnode.componentInstance.keys.indexOf(nodeTag)
      if (pos >= 0) {
        this.vnode = this.$vnode.componentInstance.$vnode.componentInstance.$children[pos]
      }
      this.handleScroll(this.$store.state.app.scrollPosList[nodeTag])
    },
    handleScroll (top) {
      if (this.vnode && this.vnode.handleScroll) {
        this.vnode.handleScroll(top)
      }
    },
    closeKeepView (route) {
      const nodeTag = `${route.name}-${route.params.id}`
      let vdom = this.$vnode.componentInstance._vnode.componentInstance
      vdom.cache[nodeTag].componentInstance.$destroy()
      delete vdom.keys[nodeTag]
      delete vdom.cache[nodeTag]
      // const pos = this.$vnode.componentInstance._vnode.componentInstance.keys.indexOf(nodeTag)
      // if (pos >= 0) {
      //   this.$vnode.componentInstance.$vnode.componentInstance.$children[pos].$destroy()
      //   this.$vnode.componentInstance._vnode.componentInstance.keys.splice(pos, 1)
      // }
    }
  }
}
</script>
