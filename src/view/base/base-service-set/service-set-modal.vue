<template>
  <div class="service-set-modal">
    <div class="service-set-modal-body">
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
                  :disabled="item.disabled"
                 type="textarea"
                 v-else-if="item.type === 'textarea'" />
          <Checkbox v-model="formItem[item.key]"
                    :disabled="item.disabled"
                    v-else-if="item.type === 'checkbox'"></Checkbox>
        </FormItem>
      </Form>
    </div>
    <modal-footer @handle-ok="handleOk" @handle-cancel="handleCancel" ok-text="保存"></modal-footer>
  </div>
</template>

<script>
import ModalFooter from '_c/modal-footer'
import { getProviderByID, saveCsmpAgent, updateCsmpAgent } from '@/api/base/base-service-set'
export default {
  name: 'ServiceSetModal',
  components: { ModalFooter },
  props: {
    actionFlag: {
      type: String,
      default: 'S'
    },
    row: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      formItem: {},
      rules: {
        agentCode: [{ required: true, message: '服务商代码不能为空', trigger: 'blur' }],
        agentName: [{ required: true, message: '服务商名称不能为空', trigger: 'blur' }],
        providerName: [{ required: true, message: '所属运营商不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    formItemArr () {
      let disabled = this.actionFlag === 'M'
      let tmpArr = [
        { label: '服务商代码', key: 'agentCode', type: 'input', disabled },
        { label: '服务商名称', key: 'agentName', type: 'input' },
        { label: '服务商简称', key: 'agentShortname', type: 'input' },
        { label: '所属运营商', key: 'providerName', type: 'input', disabled: true },
        { label: '统一社会信用代码', key: 'creditcode', type: 'input' },
        { label: '负责人', key: 'leader', type: 'input' },
        { label: '电话', key: 'telnumber', type: 'input' },
        { label: '邮箱', key: 'email', type: 'input' },
        { label: '省市', key: 'address', type: 'input' },
        { label: '冻结', key: 'statusCode', type: 'checkbox' },
        { label: '备注', key: 'remark', type: 'textarea', isOwn: true }
      ]
      return tmpArr
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
          params.statusCode = params.statusCode ? '3' : '2'
          if (this.actionFlag === 'S') {
            saveCsmpAgent(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '新增服务商成功' })
                this.$emit('complete')
              }
            })
          } else if (this.actionFlag === 'M') {
            updateCsmpAgent(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '修改服务商成功' })
                this.$emit('complete')
              }
            })
          }
        }
      })
    }
  },
  async mounted () {
    await getProviderByID({}).then(res => {
      if (res && res.status === 200) {
        this.formItem = { ...this.formItem, ...res.data}
      }
    })
    if (this.actionFlag === 'M') {
      this.formItem = { ...this.formItem, ...this.row}
      this.$set(this.formItem, 'statusCode', this.formItem.statusCode === '3')
    }
  }
}
</script>

<style lang="less">
@import './base-service-set.less';
</style>
