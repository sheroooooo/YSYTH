<template>
  <div class="form-label-group clear-fix">
    <form-group ref="formGroup"
                v-show="editable"
                :item-list="itemList"
                :label-width="labelWidth"
                :cols="cols"
                :init-value-list="valueList"
                :init-error-store="errorStore"
                :form-filter-field="formFilterField"
                @on-change="handleChange"
                @on-select="handelSelect">
      <template v-for="(formitem) in itemList">
        <slot :name="formitem.name"
              :slot="formitem.name"></slot>
      </template>
    </form-group>
    <template v-if="withToolbar && editable">
      <div class="tr">
        <Button type="primary"
                @click="onOkClick">确定</Button>
        <Button style="margin-left: 8px"
                @click="onCancelClick">取消</Button>
      </div>
    </template>
    <slot></slot>
    <label-group v-show="!editable"
                 :item-list="itemList"
                 :label-width="labelWidth"
                 :cols="cols"
                 :init-value-list="valueList"
                 :form-filter-field="formFilterField">
    </label-group>
  </div>
</template>
<script>
import FormGroup from '../form-group'
import LabelGroup from '../label-group'
import clonedeep from 'clonedeep'
export default {
  name: 'FormLabelGroup',
  components: {
    FormGroup,
    LabelGroup
  },
  data () {
    return {
      valueList: {},
      rules: {},
      errorStore: {},
      cacheValue: {}
    }
  },
  props: {
    itemList: {
      type: Array,
      default: () => []
    },
    labelWidth: {
      type: Number,
      default: 120
    },
    cols: {
      type: Number,
      default: 3
    },
    initValueList: {
      type: Object,
      default: () => { }
    },
    InitErrorStore: {
      type: Object,
      default: () => { }
    },
    editable: {
      type: Boolean,
      default: true
    },
    withToolbar: {
      type: Boolean,
      default: false
    },
    formFilterField: {
      type: String,
      default: ''
    }
  },
  watch: {
    initValueList () {
      this.setValueList()
    },
    valueList: {
      handler (newVal, oldVal) {
        if (JSON.stringify(this.valueList) !== JSON.stringify(this.initValueList)) {
          this.$emit('on-change', this.valueList)
        }
      },
      deep: true
    }
  },
  methods: {
    setValueList () {
      if (JSON.stringify(this.valueList) !== JSON.stringify(this.initValueList)) {
        this.valueList = clonedeep(this.initValueList)
      }
      this.errorStore = this.InitErrorStore
    },
    validate (_callback) {
      this.$refs.formGroup.validate((valid) => {
        _callback(valid)
      })
    },
    handleChange (valueList, key, node) {
      // 网上报销还款处理借款单编号带所有数据
      this.valueList = clonedeep(valueList)
      if (node) { // 抛出弹出树、表格的选择数据
        this.$emit('hkcl-on-change', key, node)
      }
    },
    handelSelect (valueList) {
      this.valueList = clonedeep(valueList)
      this.$emit('on-select', this.valueList)
    },
    onOkClick () {
      this.$refs.formGroup.validate((valid) => {
        if (valid) {
          this.cacheValue = clonedeep(this.valueList)
          this.$emit('ok', this.valueList)
        }
      })
    },
    onCancelClick () {
      this.valueList = clonedeep(this.cacheValue)
      this.$emit('no', this.cacheValue)
    }
  },
  mounted () {
    this.setValueList()
    this.cacheValue = clonedeep(this.initValueList)
  }
}
</script>
