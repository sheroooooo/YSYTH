function setFocus (el, value) {
  // 聚焦元素
  let timeId = setTimeout(function () {
    clearTimeout(timeId)
    if (value) {
      $(el).find('input').focus()
    }
  }, 30)
}
export default {
  inserted: function (el, binding) {
    // console.log('v-focus', binding)
    setFocus(el, binding.value)
  },
  update: (el, binding) => {
    if (!$(el).attr('class').includes('hasfocus')) {
      $(el).addClass('hasfocus')
      setFocus(el, binding.value)
    }
  }
}
