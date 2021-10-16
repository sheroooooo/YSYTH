
export default {
  methods: {
    async setMenuCheck (subMenu, webpath) {
      // console.log(subMenu)
      switch (webpath) {
        case 'fa-yskpbz':

          break
        default:
          this.$emit('on-click', subMenu)
      }
    }
  }
}
