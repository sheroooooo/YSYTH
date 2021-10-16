<!--公用组件：页面标题栏组件
     /**
     * @desc 页面标题样式，内容已经按钮的展现
     * @author liutz
     * @date 2019-02-22
     * @param {Event} [@on-header-toolbar-click] - 工具栏按钮点击事件 [非必须]
     * @param {Array} [data] - 按钮数据 [必须]
     * @param {String} [text] - 页面title信息 [必须]
     * @param {Boolean} [editable] - 是否显示工具栏 [非必须]
     * @example 调用示例
     *  <page-header
     *   :text="pageTitle"
     *   :data="data"
     *   @on-header-toolbar-click="handelBtnCilck" />
     *
     *  data数据需要请求接口getButtonState获取
     *
     *  // 监听头部按钮点击事件
     *  handelBtnCilck (name) {
     *   if (name === 'save') {}         - save: 自定义保存按钮事件
     *   else if (name === 'cancel'){}   - cancel: 自定义取消按钮事件
     *   else if (name === 'update'){}   - update: 自定义修改按钮事件
     *   else if (name === 'print'){}    - print: 自定义打印按钮事件
     *   else if (name === 'copy'){}     - copy: 自定义复制按钮事件
     *   else if (name === 'submit'){}   - submit: 自定义送审按钮事件
     *   else if (name === 'check'){}    - check: 自定义审核按钮事件
     *   else if (name === 'uncheck'){}  - uncheck: 自定销审改按钮事件
     *   else if (name === 'annex'){}    - annex: 自定义附件按钮事件
     *   else if (name === 'auditlog'){} - auditlog: 自定义日志按钮事件
     *  }
     */
-->
<template>
  <div class="page-header plg-doc-wrapper-header">
    <toolbar v-if="editable && headData && headData.length>0"
             :prams="prams"
             :data="headData"
             :workflowType='workflowType'
             style="float: right"
             @on-toolbar-click='handleToolbarCilck'></toolbar>
    <slot></slot>
  </div>
</template>

<script>
import Toolbar from '_c/page/toolbar'
export default {
  name: 'PageHeader',
  components: {
    Toolbar
  },
  props: {
    prams: {
      type: Object,
      default: () => { }
    },
    data: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: true
    },
    workflowType: { // 使用工作流类型，false：U8自己工作流  true:平台工作流
      type: Boolean,
      default: false
    }
  },
  computed: {
    headData () {
      for (let item of this.data) {
        item.className = 'head'
      }
      return this.data
    }
  },
  methods: {
    /* 工具栏按钮事件传递 */
    handleToolbarCilck (name) {
      this.$emit('on-header-toolbar-click', name)
    }
  }
}
</script>

<style lang="less" scoped>
  @import './page-header.less';
</style>
