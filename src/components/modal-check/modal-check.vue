<template>
  <Modal class-name="modal-check"
         v-model="modalFlag"
         :title="modalTitle"
         :transfer="true"
         @on-ok="ok">
    <Form :model="formItem">
      <Row>
        <Col span="24"
             style="margin-bottom: 8px">
        <span>办理意见：</span>
        </Col>
        <Col span="24">
        <FormItem>
          <Input v-model="formItem.remark"
                 type="textarea"
                 :autosize="{minRows: 5,maxRows: 10}"
                 :maxlength="250"></Input>
        </FormItem>
        </Col>
        <Col span="24">
        <FormItem>
          <RadioGroup v-model="formRadio">
            <Radio label="SH"
                   v-if="operateFlag!=='XS'">通过</Radio>
            <Radio label="TH">退回上一步</Radio>
            <Radio label="FH">退回到编制人</Radio>
          </RadioGroup>
        </FormItem>
        </Col>
      </Row>
    </Form>
  </Modal>
</template>

<script>
export default {
  name: 'ModalCheck',
  data () {
    return {
      // 弹窗title
      modalTitle: '单据办理意见',
      // 表单数据
      formItem: {
        remark: '通过',
        gender: 'SH'
      },
      formRadio: 'SH'
    }
  },
  props: {
    // 控制弹出框打开关闭
    modalCheckBtn: {
      type: Boolean,
      required: false
    },
    operateFlag: {
      type: String,
      default: ''
    }
  },
  watch: {
    /* modalFlag () {
      if (this.operateFlag !== 'XS') {
        this.formItem = {
          remark: '通过',
          gender: 'SH'
        }
        this.formRadio = 'SH'
      } else {
        this.formItem = {
          remark: '退回',
          gender: 'TH'
        }
        this.formRadio = 'TH'
      }
    }, */
    formRadio (val) {
      this.formItem.gender = val
      switch (val) {
        case 'FH':
          this.formItem.remark = '退回'
          break
        case 'TH':
          this.formItem.remark = '退回'
          break
        case 'SH':
          this.formItem.remark = '通过'
          break
      }
    },
    operateFlag: {
      immediate: true,
      handler (val) {
        if (val === 'XS') {
          this.formRadio = 'TH'
          this.formItem.remark = '退回'
        } else if (val === 'FH') {
          this.formRadio = 'FH'
        } else if (val === 'SH') {
          this.formRadio = 'SH'
        }
      }
    }
  },
  computed: {
    /* props不允许双向绑定,需要自定义传递 */
    modalFlag: {
      get () {
        return this.modalCheckBtn
      },
      set (val) {
        this.$emit('checkModalOperate', val)
      }
    }
  },
  methods: {
    ok () {
      this.formItem['operateFlag'] = this.operateFlag
      this.$emit('check', this.formItem)
    }
  }
}
</script>

<style lang="less">
  @import './modal-check.less';
</style>
