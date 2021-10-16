<template>
  <!-- 旧工作流的审核流程弹窗 -->
  <div class='check-workflow'>
    <vuc-datatable ref="xTable"
                   :editable='true'
                   :row-key="rowKey"
                   :height="height">
    </vuc-datatable>
    <div class="footer-btn-group">
      <Button class="submit-btn footer-btn"
              v-if='buttonGroup.includes("cancel")'
              @click="$emit('close')">取消</Button>
      <Button type="primary"
              @click='handleSubmit'
              v-if='buttonGroup.includes("confirm")'
              class="submit-btn footer-btn">确定</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'checkFlow',
  props: {
    tableColumns: {
      type: Array,
      default: () => {}
    },
    buttonGroup: {
      type: Array,
      default: () => ['confirm', 'cancel']
    },
    tableData: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'ID'
    },
    height: {
      type: Number,
      default: 300
    }
  },
  data () {
    return {}
  },
  methods: {
    handleSubmit () {
      this.$emit('complete')
    }
  },
  mounted () {
    if (this.$refs.xTable) {
      this.$refs.xTable.loadData(this.tableData)
      this.$refs.xTable.loadColumn(this.tableColumns)
    }
  }
}
</script>
<style lang="less" scoped>
@import './checkWorkFlow.less';
</style>
