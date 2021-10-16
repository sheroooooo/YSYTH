<template>
  <div>
    <Modal v-model="modal"
           :title="isTreeTitle"
           :mask-closable="false"
           :z-index="9999"
           class-name="vertical-center-modal"
           @on-ok="handleSavaClick"
           @on-cancel="handleCancel">
      <div class="modal-center">
        <vuc-tree ref="xtree"
                  :id-field="id"
                  text-field="text"
                  :show-checkbox=false
                  :height=height
                  @on-select="handleSelect"
                  @on-checked="handleChecked"
                  @on-dblclick="hadledblClick"></vuc-tree>
        <div class="clear"></div>
      </div>
    </Modal>
  </div>
</template>
<script>

export default {
  name: 'modalTreeSelect',
  props: {
    id: {
      type: String,
      default: ''
    },
    isTreeModal: {
      type: Boolean,
      default: false
    },
    isTreeTitle: {
      type: String,
      default: ''
    },
    isTreeData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      // modal: false,
      radiodGroup: '',
      userList: [],
      select: {},
      height: 450
    }
  },
  computed: {
    /* props不允许双向绑定,需要自定义传递 */
    modal: {
      get: function () {
        return this.isTreeModal
      },
      set: function (val) {

      }
    }
  },
  watch: {},
  inject: ['wrapHeight'],
  methods: {
    loadTreeData (tree) {
      console.log(tree)
      this.$refs.xtree.loadData(tree)
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      console.log(row)
      this.select = row
    },
    handleChecked (row) {
      console.log(row)
      this.$emit('on-modal-tree', row)
    },
    hadledblClick ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      console.log(row)
    },
    handleSavaClick () {
      this.$emit('on-modal-tree', this.select)
      this.$emit('close-modal-tree')
    },
    handleCancel () {
      this.$emit('on-modal-tree', false)
      this.$emit('close-modal-tree')
    }
  }
}
</script>
<style scoped>
  .modal-center {
    border: 1px solid #ddd;
  }
</style>
