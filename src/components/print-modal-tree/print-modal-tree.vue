<template>
  <div >
    <Modal v-model="modal"
           :title="title"
           :width="modalWidth"
           @on-ok="handleOkClick"
           :z-index="2000"
           class-name="vertical-center-modal">

      <div class="modal-center"
           :style="{height:`${modalHeight - 100}px`}">
        <Input class="search-input"
               search
               enter-button
               placeholder="请输入代码和名称"
               v-model="searchData"
               @on-change="searchChange" />
        <!--<Scroll :on-reach-bottom="handleReachBottom">-->
          <Tree ref="tree"
                :data="filterData"
                empty-text=""
                @on-select-change='doubleClick(...arguments)'>
          </Tree>
        <!--</Scroll>-->

      </div>
    </Modal>
  </div>
</template>

<script>
import clonedeep from 'clonedeep'
export default {
  name: 'ModalTree',
  data () {
    return {
      searchData: '',
      showrData: [], // 展示数据
      compareData: [], // 双击比较的code
      filterData: []
    }
  },
  props: {
    modalFlag: {
      type: Boolean,
      default: false
    },
    modalWidth: { // 模态框宽度
      type: Number,
      default: 530
    },
    modalHeight: { // 模态框高度
      type: Number,
      default: 450
    },
    title: {
      type: String,
      default: ''
    },
    treeData: {
      type: Array,
      default: () => [ ]
    }
  },
  computed: {
    modal: {
      get: function () {
        return this.modalFlag
      },
      set: function (val) {
        this.$emit('modalChange', val)
      }
    }
  },
  watch: {
    treeData: {
      handler (newData, oldData) {
        this.filterData = [{
          title: '全部',
          expand: true,
          children: clonedeep(newData)
        }]
      },
      deep: true
    },
    modal () {
      if (!this.modal) {
        this.compareData = ''
        this.searchData = ''
      }
    }
  },
  methods: {
    /* 点击确认 回调父组件Ok方法 */
    handleOkClick () {
      this.$emit('handleOkClick', this.compareData)
      this.modal = false
    },
    /* 模糊筛选树 */
    searchChange () {
      const totalData = clonedeep(this.treeData)
      // 所有包含搜索字段节点
      let containsnNodes = totalData.filter(item => item.title.indexOf(this.searchData) !== -1)
      this.filterData = [{
        title: '全部',
        expand: true,
        children: clonedeep(containsnNodes)
      }]
    },

    /* 双击关闭弹框 */
    doubleClick (val) {
      let selectData = this.$refs.tree.getSelectedNodes()
      if (selectData.length === 0) {
        this.handleOkClick()
      } else {
        this.compareData = val
      }
    }
  }
}
</script>
