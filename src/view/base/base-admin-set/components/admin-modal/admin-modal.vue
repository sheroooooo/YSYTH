<template>
  <div class='admin-modal'>
    <div class="admin-modal-content">
      <card-slot title="管理员设置">
        <Form ref="formInfo"
              :label-width="110"
              :model="initValueList"
              :rules="rules">
          <Row>
            <Col v-for="(item, index) in itemList"
                 :span="item.span ? item.span : '8'"
                 :key="`${_uid}_${index}`"
                 style="height:50px">
            <FormItem :prop="item.key"
                      :label="item.title">
              <Select v-if="item.sjlx==='select'"
                      v-model="initValueList[item.key]"
                      :disabled="!editable"
                      @on-change="handleSelectChange">
                <Option v-for="item in selectData[item.key]"
                        :value="item.value"
                        :key="item.title"
                        :disabled="!editable">{{ item.title }}</Option>
              </Select>
              <template v-else-if="item.sjlx==='text'">
                <Input v-model="initValueList[item.key]"
                       :disabled="getDisabled(item.key)"
                       @on-change="handleTextChange(initValueList[item.key],item.key)" />
                <input type="text"
                       style="position:fixed;z-index:-10000;width:0;border:none" />
              </template>
              <template v-else-if="item.sjlx==='table'">
                <modal-table-select :value="initValueList[item.key]"
                                    :item="item"
                                    :item-list="itemSearchList"
                                    :initValueList="searchValueList"
                                    @on-change="handleChange"></modal-table-select>
              </template>
              <template v-else-if="item.sjlx==='password'">
                <input type="password"
                       style="position:fixed;z-index:-10000;width:0;border:none" />
                <Input v-model="initValueList[item.key]"
                       :disabled="getDisabled(item.key)"
                       :type="inputTypes[item.key]">
                <div slot="suffix">
                  <Icon @click.native="handleEyeClick(item.key)"
                        class="icon-show"></Icon>
                </div>
                </Input>
              </template>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </card-slot>
    </div>
    <modal-footer v-if="editable"
                  @handle-ok="handleBtnClick('save')"
                  @handle-cancel="handleBtnClick('cancel')"
                  ok-text="保存"></modal-footer>
  </div>
</template>

<script>
import ModalFooter from '_c/modal-footer'
import ModalTableSelect from '_c/table/modal-table-select'
import CardSlot from '_c/card-slot'
import { getGlCzyById, saveGlCzy } from '@/api/base/base-admin-set'
export default {
  name: 'AdminModal',
  components: {
    CardSlot,
    ModalTableSelect,
    ModalFooter
  },
  props: {
    status: {
      type: String,
      default: ''
    },
    params: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    const validateCzycode = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入管理员代码'))
      } else {
        if (this.initValueList.czycode !== '') {
          let myreg = /^[a-zA-Z][a-zA-Z0-9_]*$/;
          let flag = myreg.test(this.initValueList.czycode);
          if (!flag) {
            callback(new Error('管理员代码必须以字母开头'))
          }
        }
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.initValueList.passwordTwo !== '') {
          // 对第二个密码框单独验证
          this.$refs.formInfo.validateField('passwordTwo')
        }
        callback()
      }
    }
    const validatePassCheck = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.initValueList.password) {
        callback(new Error('两个输入密码不匹配！'))
      } else {
        callback()
      }
    }
    return {
      itemSearchList: [],
      searchValueList: {},
      initValueList: {},
      rules: {
        czycode: [{ validator: validateCzycode, required: true, trigger: 'blur' }],
        name: [{ required: true, message: '管理员姓名不能为空', trigger: 'blur' }],
        roleid: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
        inde: [{ required: true, message: '请选择所属机构', trigger: 'change' }],
        phonenumber: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
        password: [{ validator: validatePass, trigger: 'blur', required: true }],
        passwordTwo: [{ validator: validatePassCheck, trigger: 'blur', required: true }]
      },//表单校验规则
      selectData: {
        'roleid': [
          { value: '2', title: '运营商' },
          { value: '3', title: '服务商' }
        ]
      },
      inputTypes: {
        'password': 'password',
        'passwordTwo': 'password'
      }
    }
  },
  computed: {
    editable () {
      return this.status !== 'readOnly'
    },
    itemList () {
      let arr = [
        {
          key: 'czycode',
          title: '管理员代码',
          sjlx: 'text'
        },
        {
          key: 'name',
          title: '管理员姓名',
          sjlx: 'text'
        },
        {
          key: 'roleid',
          title: '机构类型',
          sjlx: 'select'
        },
        {
          key: 'inde',
          title: '所属机构',
          sjlx: 'table',
          disabled: !this.initValueList.roleid || !this.editable,
          params: { roleid: this.initValueList.roleid },
          columns: [{
            title: '机构编码',
            field: 'indecode',
            align: 'left',
            headerAlign: 'center',
          },
          {
            title: '机构名称',
            field: 'indename',
            align: 'left',
            headerAlign: 'center',
          }]
        },
        {
          key: 'phonenumber',
          title: '手机号',
          sjlx: 'text'
        },
        {
          key: 'email',
          title: '邮箱',
          sjlx: 'text',
        },
        {
          key: 'password',
          title: '密码',
          sjlx: 'password'
        },
        {
          key: 'passwordTwo',
          title: '密码确认',
          sjlx: 'password'
        }
      ]
      return arr
    }
  },
  methods: {
    handleBtnClick (operate) {
      if (operate === 'cancel') {
        this.$emit('close')
      } else {
        this.save()
      }
    },
    save () {
      this.$refs.formInfo.validate(valid => {
        if (valid) {
          let values = this.$utils.clone(this.initValueList, true)
          // 密码加密
          values['password'] = window.btoa(values['password'])
          values['passwordTwo'] = window.btoa(values['passwordTwo'])
          if (values.phonenumber) {
            let mobileReg = /^1[3456789]\d{9}$/
            if (!mobileReg.test(values.phonenumber)) {
              this.$fn.error({ desc: '请输入正确的手机格式' })
              return false
            }
          } else if (values.email) {
            let reg = /^([a-zA-Z\d])(\w|\-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/
            if (!reg.test(values.email)) {
              this.$fn.error({ desc: '请输入正确的邮箱格式' })
              return false
            }
          }
          values['rolename'] = this.selectData['roleid'].find(item => item.value === values.roleid).title
          values['roleid'] = Number(values['roleid'])
          values['flag'] = this.status
          if (values['roleid'] === 2) {
            values['providerIndeid'] = values['indeid']
            values['providerName'] = values['indename']
          } else if (values['roleid'] === 3) {
            values['agentIndeid'] = values['indeid']
            values['agentName'] = values['indename']
          }
          this.$fn.ajax(saveGlCzy, values, res => {
            if (res.status === 200) {
              this.$fn.success({ desc: '保存成功' })
              this.$emit('complete')
            }
          })
        }
      })
    },
    getFormData () {
      let params = {
        id: this.params.id
      }
      this.$fn.ajax(getGlCzyById, params, res => {
        if (res.status === 200) {
          this.initValueList = res.data
          this.$set(this.initValueList, 'inde', res.data.indecode + ' ' + res.data['indename'])
          this.$set(this.initValueList, 'roleid', res.data.roleid.toString())
          // 密码解密
          this.initValueList['password'] = res.data.password ? window.atob(this.initValueList['password']) : ''
          this.initValueList['passwordTwo'] = this.initValueList['password']

        }
      })
    },
    getDisabled (key) {
      let disabled = false
      if ((key === 'password' || key === 'passwordTwo') && this.status !== 'add') {
        disabled = true
      } else if (key === 'czycode' && this.status === 'update') {
        disabled = true
      }
      else if (!this.editable) {
        disabled = true
      }
      return disabled
    },
    // 选择所属机构
    handleChange (value, list, key) {
      if (key === 'inde') {
        if (!value.indecode) {
          this.$set(this.initValueList, 'inde', '')
        } else {
          this.initValueList = Object.assign(this.initValueList, value)
          let inde = value.indecode + ' ' + value.indename
          this.$set(this.initValueList, 'inde', inde)
        }
      }
    },
    handleEyeClick (key) {
      if (this.inputTypes[key] === 'text') {
        this.$set(this.inputTypes, key, 'password')
      } else {
        this.$set(this.inputTypes, key, 'text')
      }
    },
    // 选择机构类型
    handleSelectChange () {
      let list = [
        {
          name: 'agentName',
          type: 'i-input',
          value: '',
          label: '服务商名称'
        },
        {
          type: 'checkbox',
          label: '无管理员的服务商',
          name: 'relation',
          value: '0'
        }
      ]
      this.initValueList.roleid === '2' ? this.itemSearchList = [] : this.itemSearchList = list
      this.initValueList.roleid === '2' ? this.searchValueList = {} : this.searchValueList = { 'agentName': '', 'relation': '0' }
      // 机构类型变化，将所属机构清空
      if (this.initValueList.inde) {
        this.initValueList.inde = ''
      }
      let target = this.itemList.find(e => e.key === 'inde')
    },
    handleTextChange (value, key) {
      if (key === 'phonenumber') {
        value = value.replace(/[^\d]/g, '')
        this.$nextTick(() => {
          this.initValueList[key] = value
        })
      }
    }
  },
  mounted () {
    if (this.status === 'update' || this.status === 'readOnly') {
      this.getFormData()
    }
  }
}
</script>

<style lang="less">
@import './admin-modal.less';
</style>
