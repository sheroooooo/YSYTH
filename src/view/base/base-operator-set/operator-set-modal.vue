<template>
  <div class="operator-set-modal">
    <div class="operator-set-modal-body">
      <Form ref="formInfo"
            :label-width="130"
            class="form-wrap"
            :model="formItem"
            :rules="rules">
        <FormItem v-for="item in formItemArr"
                  :key="`form-item-${item.key}`"
                  class="form-item"
                  :class="{ 'form-item-own': item.isOwn }"
                  :prop="item.key"
                  :label="item.label">
          <Input v-model="formItem[item.key]"
                 :disabled="item.disabled"
                 v-if="item.type === 'input'" />
          <Input v-model="formItem[item.key]"
                 type="textarea"
                 v-else-if="item.type === 'textarea'" />
          <Select v-model="formItem[item.key]"
                  v-else-if="item.type === 'select'">
            <Option v-for="opt in item.data"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"></Option>
          </Select>
        </FormItem>
      </Form>
    </div>
    <modal-footer @handle-ok="handleOk" @handle-cancel="handleCancel" ok-text="保存"></modal-footer>
  </div>
</template>

<script>
import ModalFooter from '_c/modal-footer'
import { getCsmpProvider, saveCsmpProvider, updateCsmpProvider } from '@/api/base/base-operator-set'
export default {
  name: 'OperatorSetModal',
  components: { ModalFooter },
  props: {
    actionFlag: {
      type: String,
      default: 'S'
    },
    providerIndeid: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      formItem: {},
      rules: {
        providerCode: [{ required: true, message: '运营商编码不能为空', trigger: 'blur' }],
        providerName: [{ required: true, message: '运营商名称不能为空', trigger: 'blur' }],
        providertype: [{ required: true, message: '机构属性不能为空', trigger: 'blur' }]
      },
      formItemArr: [
        { label: '运营商编码', key: 'providerCode', type: 'input', disabled: this.actionFlag === 'M' },
        { label: '运营商名称', key: 'providerName', type: 'input' },
        { label: '机构属性', key: 'providertype', type: 'select', data: [{value: '本部', label: '本部'}, {value: '第三方', label: '第三方'}] },
        { label: '负责人', key: 'leader', type: 'input' },
        // { label: '上级机构', key: 'sjjg', type: 'input' },
        { label: '统一社会信用代码', key: 'creditcode', type: 'input' },
        { label: '电话', key: 'telnumber', type: 'input' },
        { label: '邮箱', key: 'email', type: 'input' },
        { label: '机构地址', key: 'address', type: 'input', isOwn: true },
        { label: '备注', key: 'remark', type: 'textarea', isOwn: true }
      ]
    }
  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      this.$refs.formInfo.validate(valid => {
        if (valid) {
          let params = {...this.formItem}
          if (this.actionFlag === 'S') {
            saveCsmpProvider(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '新增运营商成功' })
                this.$emit('complete')
              }
            })
          } else if (this.actionFlag === 'M') {
            params.providerIndeid = this.providerIndeid
            updateCsmpProvider(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '修改运营商成功' })
                this.$emit('complete')
              }
            })
          }
        }
      })
    }
  },
  mounted () {
    if (this.actionFlag === 'M') {
      getCsmpProvider({ providerIndeid: this.providerIndeid}).then(res => {
        if (res && res.status === 200) {
          this.formItem = res.data
        }
      })
    }
  }
}
</script>

<style lang="less">
@import './base-operator-set.less';
</style>
