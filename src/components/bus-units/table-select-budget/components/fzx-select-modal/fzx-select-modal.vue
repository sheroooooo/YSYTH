<template>
  <div class="fzx-select-modal">
    <vuc-tree ref="xtree"
              id-field="code"
              text-field="title"
              show-toolbar
              :show-checkbox="false"
              :data="treeData"
              @on-select="handleTreeSelect"
              @on-dblclick="handleDblClick"
              :height=350></vuc-tree>
    <div class="footer">
      <vxe-button type="default"
                  @click="handleCancel"
                  class="footer-btn"
                  size="small">取消</vxe-button>
      <vxe-button type="primary"
                  @click="handleOk"
                  class="footer-btn"
                  size="small">确认</vxe-button>
    </div>
  </div>
</template>

<script>
import { getFZXSelect } from '@/api/oer/oer-begin-handle.js'
export default {
  name: 'FzxSelectModal',
  props: {
    params: {
      type: Object,
      default: () => { }
    },
    dataSource: {
      type: String,
      default: ''
    },
    ISCHANGE: {
      type: String,
      default: '1'
    },
    row: {
      type: Object,
      default: () => { }
    },
    rowIndex: {
      type: [String, Number]
    }
  },
  data () {
    return {
      treeData: [],
      selectedTreeData: {}
    }
  },
  mounted () {
    this.getFzxData()
  },
  methods: {
    // 获取项目数据
    getFzxData () {
      let params = {
        gsdm: this.params.GSDM,
        kjnd: this.params.KJND,
        zth: this.params.ZTH,
        modal: this.params.MODCODE
      }
      params['relationType'] = this.dataSource
      params['sjly'] = this.dataSource
      this.$fn.ajax(getFZXSelect, params, res => {
        this.treeData = res.data
        this.$refs.xtree.loadData(this.treeData)
      }, 1)
    },
    handleTreeSelect ({ row }) {
      this.selectedTreeData = row
    },
    handleDblClick () {
      this.handleOk()
    },
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      this.$emit('input', this.selectedTreeData.title)
      this.$emit('complete', this.selectedTreeData.title, [], this.row, this.rowIndex)
      this.$emit('close')
    }
  }
}
</script>

<style lang="less">
@import './fzx-select-modal.less';
</style>
