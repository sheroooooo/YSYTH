export default {
  inject: ['closeTag', 'scroll', 'setTagTitle'],
  // mounted () {
  //   if (this.vueEnter && !this.$route.params.tabCache) {
  //     this.vueEnter(false)
  //   }
  // },
  // /*从其他组件返回激活当前组件时*/
  activated () {
    // console.log(this.$route.params)
    this.$evnt.activeGrpID = this.$route.params.id
    if (this.vueEnter) {
      setTimeout(() => {
        this.vueEnter(!!this.$route.params.tabCache)
      })
    }
    let _this = this
    let timeId = setTimeout(() => {
      clearTimeout(timeId)
      _this.scroll()
      // $('#wrapper').trigger('scroll')
    }, 300)
  }
}
