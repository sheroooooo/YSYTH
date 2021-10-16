<template>
  <div class="multi-tree-select-modal">
    <vuc-tree ref="xtree"
              :expand="0"
              :id-field="idField"
              :text-field="textField"
              :height="modalHeight - 110"
              :show-checkbox="showCheckbox"
              :show-toolbar="true"
              @on-select="handleSelect"
              @on-dblclick="hadledblClick"></vuc-tree>
    <div class="footer">
      <vxe-button type="primary"
                  @click="handleOk"
                  class="footer-btn">确认</vxe-button>
      <vxe-button type="default"
                  @click="handleCancel"
                  class="footer-btn">取消</vxe-button>
    </div>
  </div>
</template>

<script>
import cm from '@/libs/toolutil'
import { getFZXSelect } from '@/api/base/public'
export default {
  name: 'MultiTreeSelectModal',
  props: {
    params: {},
    value: {},
    dataSource: {},
    title: {},
    itemKey: {},
    parentData: {},
    modalHeight: {},
    showCheckbox: {
      type: Boolean,
      default: true
    },
    // 当dataSource = -1时,取外界传进来的数据
    dataList: {
      type: Array,
      default: () => []
    },
    idField: {
      type: String,
      default: 'title'
    },
    textField: {
      type: String,
      default: 'title'
    }
  },
  data () {
    return {
      treeData: [],
      selectTreeNode: null
    }
  },
  watch: {
    dataList: {
      deep: true,
      handler (val) {
        let treeDom = this.$refs.xtree
        this.treeData = val
        treeDom && treeDom.loadData(this.treeData)
      }
    }
  },
  methods: {
    getData () {
      if (this.dataSource === -1) {
        let treeDom = this.$refs.xtree
        this.treeData = this.dataList
        setTimeout(() => treeDom.loadData(this.treeData), 20)
        if (this.value) {
          let tmpArr = this.value.split(';')
          setTimeout(() => {
            tmpArr.map(v => treeDom.setRowsChecked(item => item.title === v, true))
          }, 20)
        }
        return true
      }
      let { gsdm, kjnd } = this.params
      let params = { gsdm, kjnd, sjly: this.dataSource }
      getFZXSelect(params).then(res => {
        this.treeData = cm.formatDataToTree(res.data, {
          pId: 'parent',
          id: 'code',
          text: 'title'
        })
        this.$refs.xtree.loadData(this.treeData)
        if (this.value) {
          let tmpArr = this.value.split(';')
          setTimeout(() => {
            tmpArr.map(v => {
              this.$refs.xtree.setRowsChecked((item) => {
                return item.title === v
              }, true)
            })
          }, 30)
        }
      })
    },
    handleCancel () {
      this.$emit('close')
    },
    handleSelect ({ row }) {
      this.selectTreeNode = row
    },
    hadledblClick () {
      (!this.showCheckbox) && this.handleOk()
    },
    handleOk () {
      let data = this.showCheckbox ? this.$refs.xtree.getCheckedData() : [this.selectTreeNode]
      data = data.filter(v => !v.children)
      let dmmc = ''
      if (data.length === 1) {
        dmmc = data[0][this.idField]
      } else {
        data.map(v => {
          dmmc = dmmc + v[this.idField] + ';'
        })
      }
      this.$emit('input', dmmc)
      this.$emit('onChange', dmmc, data)
      this.$emit('close')
    }
  },
  mounted () {
    this.getData()
  }
}
</script>

<style lang="less">
// @import './tmp.less';
</style>
