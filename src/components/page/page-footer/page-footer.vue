<!--公用组件：页面底部操作条样式组件
     /**
     * @desc 页面底部操作条样式按钮显示
     * @author liutz
     * @date 2019-02-26
     * @param {Event} [@on-footer-toolbar-click] - 工具栏按钮点击事件 [非必须]
     * @param {Array} [data] -按钮数据
     * @example 调用示例
     *
     *  data数据需要请求接口getButtonState获取
     *
     *  <page-footer
     *   :data="data"
     *   @on-footer-toolbar-click="handelBtnCilck" />
     *
     *  // 监听头部按钮点击事件
     *  handelBtnCilck (name) {
     *   if (name === 'save') {}         - save: 自定义保存按钮事件
     *   else if (name === 'cancel'){}   - cancel: 自定义取消按钮事件
     *   else if (name === 'submit'){}   - submit: 自定义送审按钮事件
     *   else if (name === 'annex'){}    - annex: 自定义附件按钮事件
     *  }
     */
-->
<template>
  <div class="page-footer clear-fix">
    <span>
      <toolbar class="tr"
        @on-toolbar-click='handleToolbarCilck'
        :data="data"
      ></toolbar>
    </span>
  </div>
</template>

<script>
import toolbar from '_c/page/toolbar'
export default {
  name: 'PageFooter',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  components: {
    toolbar
  },
  methods: {
    /* 工具栏按钮事件传递 */
    handleToolbarCilck (name) {
      this.$emit('on-footer-toolbar-click', name)
    }
  }
}
</script>

<style lang="less">
  @import './page-footer.less';
</style>
