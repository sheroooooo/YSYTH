<template>
  <div class="multi-tree-select">
    <vuc-buttonedit :clearable="clearable"
                    :disabled="disabled"
                    :placeholder="placeholder"
                    v-model="initValue"
                    @on-change="handleChange"
                    :options="options"></vuc-buttonedit>
  </div>
</template>

<script>
import MultiTreeSelectModal from './multi-tree-select-modal'
export default {
  name: 'MultiTreeSelect',
  props: {
    value: {
      type: String,
      default: ''
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
    // 组件所在的表单数据
    parentData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    withParentData: {
      type: Boolean,
      default: true
    },
    // -1是使用外部数据，通过data属性传树数据
    dataSource: {
      type: [String, Number],
      default: '0'
    },
    placeholder: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    itemKey: {
      type: String,
      default: ''
    },
    clearable: {
      default: true,
      type: Boolean
    },
    dataList: {
      type: Array,
      default: () => []
    },
    showCheckbox: {
      type: Boolean,
      default: true
    }
  },

  data () {
    let ENV = null
    if (this.$route || this.$store) {
      ENV = this.$route.params.ENV || this.$store.getters.env
    } else {
      ENV = {}
    }
    return {
      gsdm: ENV.gsdm,
      kjnd: ENV.kjnd,
      zth: ENV.zth,
      initValue: this.value
    }
  },
  watch: {
    value (val) {
      this.initValue = val
    }
  },
  computed: {
    options () {
      return {
        title: this.title,
        width: this.modalWidth,
        height: this.modalHeight,
        resize: false,
        showFooter: false,
        escClosable: true,
        customComponent: MultiTreeSelectModal,
        customProps: {
          params: {
            gsdm: this.gsdm,
            kjnd: this.kjnd,
            zth: this.zth
          },
          modalHeight: this.modalHeight,
          value: this.value,
          dataSource: this.dataSource,
          dataList: this.data,
          title: this.title,
          itemKey: this.itemKey,
          showCheckbox: this.showCheckbox,
          parentData: this.parentData,
          ...this.$attrs
        },
        customEvents: {
          onChange: (val, list) => {
            this.$emit('on-change', val, list)
          }
        }
      }
    }
  },
  methods: {
    handleChange () {
      this.$emit('on-change', '', [])
    }
  }
}
</script>

<style lang="less">
@import './multi-tree-select.less';
</style>
