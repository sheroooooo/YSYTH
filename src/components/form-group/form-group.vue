<template>
  <div ref="formGroupBox"
       class="clear-fix">
    <Form ref="formGroup"
          label-position="right"
          :label-width="120"
          :model="valueStore">
      <Row>
        <template v-for="item in items">
          <template v-if="item.options && item.options.hidden">
            <input type="hidden"
                   v-model="valueStore[item.key]"
                   :key="item.key" />
          </template>
          <template v-else-if='showFormItem(item)'>
            <Col v-if="item.break"
                 :key="`${item.key}_label`"
                 span="24">
            <div class="split-line"
                 v-if="item.options && item.options.label"
                 :key='item.key'>
              <span>{{item.options.label}}</span>
            </div>
            </Col>
            <Col class="widget-view"
                  :class="{'drag-item-pic': item.dataType === 'uploadpic'}"
                 :key="item.key"
                 :span='item.ownerrow ? 24 : colSpan()'>
            <form-group-item :key="`${item.key}`"
                             :item="item"
                             :values="valueStore"
                             :editable="editable"
                             :placeholder='item.options.placeholder || ""'
                             @on-validateField='handleValidateField'
                             :rules="item.options.rules"
                             @on-change="formItemChange"
                             :name='item.title'
                             @on-click-more="handleClickMore">
            </form-group-item>
            </Col>
          </template>
        </template>
        <Col v-if="toolbar && editable"
             :span="colSpan()"
             class="form-group-toolbar">
        <Button type="primary"
                v-if="showQrCode"
                style="margin-right: 8px"
                @click="onQrCodeClick">生成二维码</Button>
        <Button type="primary"
                @click="onOkClick">确定</Button>
        <Button style="margin-left: 8px"
                @click="onCancelClick">取消</Button>
        </Col>
      </Row>
    </Form>
  </div>
</template>
<script>
import FormGroupItem from './form-group-item.vue'
import tools from '@/libs/toolutil'
export default {
  name: 'FormGroup',
  components: { FormGroupItem },
  data () {
    return {
      valueStore: {},
      cacheValues: {},
      errorStore: {},
      cols: 3,
      ruleValidate: {},
      hiddenFlag: '',
      FlagKey: ''
    }
  },
  props: {
    items: {
      type: Array,
      default: () => []
    },
    values: {
      type: Object,
      default: () => { }
    },
    errors: {
      type: Object,
      default: () => { }
    },
    editable: {
      type: Boolean,
      default: true
    },
    toolbar: {
      type: Boolean,
      default: false
    },
    showQrCode: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    showFormItem (item) {
      return (item) => {
        if (!item.options.FormItemCtrl || item.options.FormItemCtrl.length === 0 || this.hiddenFlag === '' || item.options.forTable) {
          return true
        }
        return item.options.FormItemCtrl.indexOf(this.hiddenFlag || this.valueStore[this.FlagKey]) >= 0
      }
    }
  },
  watch: {
    values: {
      handler (value) {
        this.valueStore = value
      },
      deep: true
    }
  },
  methods: {
    vueEnter (cache) {
      if (!cache) {
        this.valueStore = this.values
      }
      this.setCacheValue(this.values)
    },
    formItemChange (key, val, list, formItem) {
      // 当存在互相带入值的时候(预算指标带入主信息),先进行带入,并未改变cacheValues,
      // 会造成带入以后再清空时,清空操作并不会触发下面的on-change, 因为val和cacheValues[key]相同
      this.$set(this.valueStore, key, val)
      this.$emit('on-change', this.valueStore, key, list, formItem)
      // 根据关联关系设置其它元素
      this.anylaRelations(list, formItem)
      // 根据内容控制显示项
      if (formItem.options.FormItemCtrlFlag) {
        this.hiddenFlag = tools.bof(val, ' ')
      }
    },
    anylaRelations (extraData, formItem) {
      if (extraData.length > 0 && formItem.options && formItem.options.relations && formItem.options.relations.length > 0) {
        const ed = extraData[0]
        for (let i = 0, len = formItem.options.relations.length; i < len; i++) {
          let { key, foreignKey } = formItem.options.relations[i]
          const keys = foreignKey.split('|')

          if (keys.length > 1) {
            let dmmc = ''
            if (ed.hasOwnProperty(keys[0])) {
              this.valueStore[keys[0]] = ed[keys[0]]
              dmmc = ed[keys[0]]
            }
            if (ed.hasOwnProperty(keys[1])) {
              this.valueStore[keys[1]] = ed[keys[1]]
              dmmc = dmmc === '' ? ed[keys[1]] : (dmmc + ' ' + ed[keys[1]])
            }
            if (ed.hasOwnProperty(keys[1])) {
              this.valueStore[key] = dmmc
            }
          } else {
            if (ed.hasOwnProperty(foreignKey)) {
              this.valueStore[key] = ed[foreignKey]
            }
          }
        }
      }
    },
    colSpan () {
      let span = Math.floor(24 / this.cols)
      return span
    },
    validate (_callback) {
      this.$refs.formGroup.validate((valid) => {
        _callback(valid)
      })
    },
    onOkClick () {
      this.$refs.formGroup.validate((valid) => {
        if (valid) {
          this.values._edit = false
          this.cacheValues = { ...this.values }
          this.$emit('ok', this.valueStore)
        }
      })
    },
    onQrCodeClick () {
      this.$refs.formGroup.validate((valid) => {
        if (valid) {
          this.values._edit = false
          this.cacheValues = { ...this.values }
          this.$emit('on-qr-code-click', this.valueStore)
        }
      })
    },
    setCacheValue (value) {
      this.cacheValues = { ...value }
    },
    onCancelClick () {
      Object.keys(this.cacheValues).map((key) => {
        let oldValue = this.cacheValues[key]
        let newValue = this.valueStore[key]
        if (oldValue !== newValue) {
          this.$emit('on-change', this.cacheValues, key)
        }
      })
      this.$emit('no')
    },
    handleValidateField (key) {
      this.$refs.formGroup.validateField(key)
    },
    // 合同收付款点击凭证号
    handleClickMore () {
      this.$emit('on-click-more')
    }
  },
  mounted () {
    this.vueEnter(false)
    this.$nextTick(() => {
      if (!this.$refs.formGroupBox || !this.$refs.formGroupBox.$el) {
        return false
      }
      const cxtWidth = this.$refs.formGroupBox.$el.clientWidth
      const cols = Math.floor(cxtWidth / 300)
      this.cols = cols > 6 ? 6 : cols
    })
  },
  activated () {
    this.vueEnter(!!this.$route.params.tabCache)
  }
}
</script>
<style lang="less" scoped>
.form-group-toolbar{
  float:right;
  text-align: right;
  margin-top:2px;
}
</style>
