<template>
  <div class='company-modal'>
    <div class="company-modal-content">
      <card-slot title="单位信息">
        <Form ref="formInfo"
              :label-width="110"
              :model="initValueList"
              :rules="rules">
          <Row>
            <Col v-for="(item, index) in itemList"
                 :span="item.span ? item.span : '8'"
                 :key="`${_uid}_${index}`">
            <FormItem style="height:34px"
                      :prop="item.key"
                      :label="item.title"
                      v-if="item.isShow === true">
              <Select v-if="item.sjlx==='select' && item.isShow === true"
                      v-model="initValueList[item.key]"
                      :disabled="item.disabled"
                      @on-change="handleSelectChange(initValueList[item.key])">
                <Option v-for="item in selectData"
                        :value="item.id"
                        :key="item.id"
                        :disabled="item.disabled">{{ item.name }}</Option>
              </Select>
              <Input v-else-if="item.sjlx==='text' && item.isShow === true"
                     v-model="initValueList[item.key]"
                     :type="item.type?item.type:'text'"
                     :disabled="item.disabled"
                     :placeholder="item.placeholder"
                     @on-change="handleTextChange(initValueList[item.key],item.key)" />
              <Input v-else-if="item.sjlx==='password' && item.isShow === true"
                     v-model="initValueList[item.key]"
                     type="password"
                     password/>
              <Checkbox v-else-if="item.sjlx==='checkbox' && item.isShow === true"
                        v-model="initValueList[item.key]"
                        :true-value="item.trueValue"
                        :false-value="item.falseValue"
                        :disabled="item.disabled"
                        @on-change='handleCheckBoxChange(initValueList[item.key],item.key)'>{{item.name}}</Checkbox>
              <template v-else-if="item.sjlx==='table'">
                <modal-table-select :value="initValueList[item.key]"
                                    :item="item"
                                    @on-change="handleChange"></modal-table-select>
              </template>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </card-slot>
    </div>
    <div class="company-modal-btn"
         v-if="status!=='readOnly'">
      <Button @click="handleBtnClick('cancel')"
              class="item-btn">取消</Button>
      <Button type="primary"
              @click="handleBtnClick('save')"
              class="item-btn">保存</Button>
      <Button type="primary"
              @click="handleBtnClick('check')"
              class="item-btn"
              v-if="this.initValueList.useMailInspection === '1'">测试连接</Button>
    </div>
  </div>
</template>

<script>
import CardSlot from '_c/card-slot'
import ModalTableSelect from '_c/table/modal-table-select'
import { getProviderAndAgentByID, saveForm, testMailConnection } from '@/api/base/base-company-set'
export default {
  name: 'CompanyModal',
  components: {
    CardSlot,
    ModalTableSelect
  },
  props: {
    status: {
      type: String,
      default: ''
    },
    formData: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      initValueList: {
        isautosave: '0',
        statusCode: '2',
        // useMailInspection: '0', //是否启用邮箱验真
        // mailProtocol: 'POP3', //服务器
        // mailPort: '110', //端口号
      },
      rules: {},//表单校验规则
      selectData: [{
        'id': 'POP3',
        'name': 'POP3'
      }, {
        'id': 'IMAP',
        'name': 'IMAP'
      }
        // , {
        //   'id': 'Exchange',
        //   'name': 'Exchange'
        // }
      ]
    }
  },
  computed: {
    editable () {
      return this.status !== 'readOnly'
    },
    itemList () {
      let disabled = !this.editable
      let arr = [{
        key: 'customerCode',
        title: '单位编码',
        sjlx: 'text',
        required: true,
        isShow: true,
        placeholder: '服务商编码+5位字符',
        disabled: !this.editable || this.status === 'update'
      },
      {
        key: 'customerName',
        title: '单位名称',
        sjlx: 'text',
        required: true,
        isShow: true,
        disabled
      },
      {
        key: 'customerShortname',
        title: '单位简称',
        sjlx: 'text',
        disabled,
        isShow: true
      },
      {
        key: 'email',
        title: '单位邮箱',
        sjlx: 'text',
        disabled,
        validate: true,
        isShow: true
      },
      {
        key: 'leader',
        title: '单位负责人',
        sjlx: 'text',
        disabled,
        isShow: true
      },
      {
        key: 'telnumber',
        title: '单位电话',
        sjlx: 'text',
        disabled,
        validate: true,
        isShow: true
      },
      {
        key: 'relationman',
        title: '单位联系人',
        sjlx: 'text',
        disabled,
        isShow: true
      },
      {
        key: 'duty',
        title: '联系人职务',
        sjlx: 'text',
        disabled,
        isShow: true
      },
      {
        key: 'relationnumber',
        title: '联系人电话',
        sjlx: 'text',
        disabled,
        validate: true,
        isShow: true
      },
      {
        key: 'agentName',
        title: '服务机构',
        sjlx: 'text',
        required: true,
        disabled: true,
        isShow: true
      },
      {
        key: 'statusCode',
        name: '冻结',
        sjlx: 'checkbox',
        trueValue: '3',
        falseValue: '2',
        disabled,
        isShow: true
      },
      {
        key: 'isautosave',
        sjlx: 'checkbox',
        name: '验真即保存发票',
        trueValue: '1',
        falseValue: '0',
        disabled,
        isShow: true
      },
      // {
      //   key: 'useMailInspection',
      //   sjlx: 'checkbox',
      //   name: '使用邮箱验真',
      //   trueValue: '1',
      //   falseValue: '0',
      //   disabled,
      //   isShow: true
      // },
      // {
      //   key: 'mailProtocol',
      //   sjlx: 'select',
      //   title: '服务器类型',
      //   disabled,
      //   required: true,
      //   isShow: this.status === 'update' && this.initValueList.useMailInspection === '1'
      // },
      // {
      //   key: 'mailPort',
      //   sjlx: 'text',
      //   title: '端口号',
      //   disabled,
      //   required: true,
      //   isShow: this.status === 'update' && this.initValueList.useMailInspection === '1'
      // },
      // {
      //   key: 'mailHost',
      //   sjlx: 'text',
      //   title: '服务器地址',
      //   placeholder: 'mail.yonyou.com',
      //   disabled,
      //   required: true,
      //   isShow: this.status === 'update' && this.initValueList.useMailInspection === '1'
      // },
      // {
      //   key: 'mailUser',
      //   sjlx: 'text',
      //   title: '邮箱用户名',
      //   disabled,
      //   required: true,
      //   isShow: this.status === 'update' && this.initValueList.useMailInspection === '1'
      // },
      // {
      //   key: 'mailPassword',
      //   sjlx: 'password',
      //   title: '邮箱密码',
      //   disabled,
      //   required: true,
      //   isShow: this.status === 'update' && this.initValueList.useMailInspection === '1'
      // },
      {
        key: 'remark',
        title: '备注',
        sjlx: 'text',
        type: 'textarea',
        span: 24,
        disabled,
        isShow: true
      }]
      return arr
    }
  },
  methods: {
    handleBtnClick (operate) {
      if (operate === 'cancel') {
        this.$emit('close')
      } else if (operate === 'check') {
        this.checkConnect()
      } else {
        this.save()
      }
    },
    // 测试邮箱连接
    checkConnect () {
      this.$refs.formInfo.validate(valid => {
        if (valid) {
          if (this.checkBeforeSave()) {
            let values = this.$utils.clone(this.initValueList, true)
            let params = {
              'mailProtocol': values.mailProtocol.toLowerCase(),
              'mailHost': values.mailHost,
              'mailPort': values.mailPort,
              'mailUser': values.mailUser,
              'mailPassword': values.mailPassword,
            }
            this.$fn.ajax(testMailConnection, params, res => {
              if (res.status === 200) {
                this.$fn.success({ desc: res.msg })
              }
            })
          }
        }
      })
    },
    save () {
      this.$refs.formInfo.validate(valid => {
        if (valid) {
          if (this.checkBeforeSave()) {
            let values = this.$utils.clone(this.initValueList, true)
            values.flag = this.status
            // values.mailProtocol = values.mailProtocol.toLowerCase()
            this.$fn.ajax(saveForm, values, res => {
              if (res.status === 200) {
                this.$fn.success({ desc: '保存成功' })
                this.$emit('complete')
              }
            })
          }
        }
      })
    },
    checkBeforeSave () {
      let emailReg = /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/
      let mobilePhoneReg = /^1[3456789]\d{9}$/
      let phoneReg = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/
      let validateArr = this.itemList.filter(item => item.validate)
      let values = this.initValueList
      let validate = true
      let key = ''
      let title = ''
      for (let i = 0, len = validateArr.length; i < len; i++) {
        key = validateArr[i].key
        title = validateArr[i].title
        if (key === 'email' && values[key]) {
          if (!emailReg.test(values[key])) {
            this.$fn.error({ desc: '请输入正确的邮箱格式' })
            validate = false
            break
          }
        } else if ((key === 'telnumber' || key === 'relationnumber') && values[key]) {
          if (!phoneReg.test(values[key]) && !mobilePhoneReg.test(values[key])) {
            this.$fn.error({ desc: `请输入正确的${title}格式` })
            validate = false
            break
          }
        }
      }
      return validate
    },
    handleChange (value, list, key) {

    },
    // 切换服务器类型
    handleSelectChange (value) {
      if (value === 'IMAP') {
        this.initValueList.mailPort = '143'
      } else {
        this.initValueList.mailPort = '110'
      }
    },
    handleCheckBoxChange (value, key) {
      if (key === 'useMailInspection') {
        this.itemList.map((item) => {
          if (item.key === 'mailPassword' || item.key === 'mailUser' || item.key === 'mailPort' || item.key === 'mailHost' || item.key === 'mailProtocol') {
            item.isShow = value === '1' ? true : false
          }
        })
      }
    },
    handleTextChange (value, key) {
      if (key === 'dwphone' || key === 'lxrdh' || key === 'phone') {
        value = value.replace(/[^\d-]/g, '')
        this.$nextTick(() => {
          this.initValueList[key] = value
        })
      }
    },
    // 获取服务机构
    getProviderAndAgentByID () {
      this.$fn.ajax(getProviderAndAgentByID, {}, res => {
        if (res.status === 200) {
          let keys = ['agentName', 'agentIndeid', 'providerIndeid']
          keys.forEach(item => {
            this.$set(this.initValueList, item, res.data[0][item])
          })
        }
      })
    }
  },
  mounted () {
    if (this.status === 'update' || this.status === 'readOnly') {
      this.initValueList = this.$utils.clone(this.formData, true)
      // this.initValueList.mailProtocol = this.initValueList.mailProtocol.toUpperCase()
    } else {
      this.getProviderAndAgentByID()
    }
  },
  created () {
    this.itemList.forEach(item => {
      if (item.required) {
        if (item.sjlx === 'date') {
          this.rules[item.key] = [{ required: true, message: item.title + '不能为空', trigger: 'blur', type: 'date' }]
        } else if (item.sjlx === 'select') {
          this.rules[item.key] = [{ trigger: 'change', required: 'true', message: item.title }]
        } else {
          this.rules[item.key] = [{ required: true, message: item.title + '不能为空', trigger: 'blur' }]
        }
      }
    })
  }
}
</script>

<style lang="less">
@import './company-modal.less';
</style>
