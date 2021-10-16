<template>
  <div class="users-set-modal">
    <div class="users-set-modal-body">
      <Form ref="formInfo"
            :label-width="130"
            class="form-wrap"
            :model="formItem"
            :rules="rules">
        <FormItem v-for="(item, idx) in formItemArr"
                  :key="`form-item-${item.key}`"
                  class="form-item"
                  :class="{ 'form-item-own': item.isOwn }"
                  :prop="item.key"
                  :label="item.label">
          <Input v-model="formItem[item.key]"
                 :disabled="item.disabled"
                 v-if="item.type === 'input'"
                 style='width:200px' />
          <Checkbox v-model="formItem[item.key]"
                    :disabled="item.disabled"
                    v-else-if="item.type === 'checkbox'"></Checkbox>
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
          <template v-else-if="item.type==='password'">
            <Input v-model="formItem[item.key]"
                    :disabled="item.disabled"
                    :type="item.iptType"
                    style='width:200px' >
            <div slot="suffix">
              <Icon @click.native="handleEyeClick(idx)"
                    class="icon-show"></Icon>
            </div>
            </Input>
          </template>
          <template v-else-if="item.type==='modal-table'">
            <modal-table-select :value="formItem[item.key]"
                                :item="item.key === 'groupName' ? groupItem : customerNameItem"
                                @on-change="handleGroupChange"></modal-table-select>
          </template>
        </FormItem>
      </Form>
    </div>
    <modal-footer @handle-ok="handleOk" @handle-cancel="handleCancel" ok-text="保存"></modal-footer>
  </div>
</template>

<script>
import ModalFooter from '_c/modal-footer'
import ModalTableSelect from '_c/table/modal-table-select'
import { getUserById, updateUser, saveUser } from '@/api/users/users-management'
export default {
  name: 'UsersSetModal',
  components: { ModalFooter, ModalTableSelect },
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
    let disabled = this.actionFlag === 'M'
    const validatePass = (rule, value, callback) => {
      if (value === undefined) {
        callback(new Error('请输入密码'))
      } else {
        if (this.formItem.passwordConfirm !== '') {
          // 对第二个密码框单独验证
          this.$refs.formInfo.validateField('passwordConfirm')
        }
        callback()
      }
    }
    const validatePassCheck = (rule, value, callback) => {
      let v = this.formItem.passwordConfirm
      if (v === undefined) {
        callback(new Error('请再次输入密码'))
      } else if (v !== this.formItem.password) {
        callback(new Error('两个输入密码不匹配！'))
      } else {
        callback()
      }
    }
    const validatePhonenumber = (rule, value, callback) => {
      if (value === undefined) {
        callback(new Error('手机号不能为空'))
      } else if (this.formItem.phonenumber !== '') {
        const myreg = /^0?(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/
        if (!myreg.test(this.formItem.phonenumber)) {
          callback(new Error('手机号输入有误！'))
        } else {
          callback()
        }
      }
    }
    const validateEmail = (rule, value, callback) => {
      if (value !== undefined) {
        const myreg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
        if (!myreg.test(this.formItem.email)) {
          callback(new Error('邮箱格式有误，请重新输入！'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }
    return {
      customerNameItem: {
        key: 'customerName',
        title: '所属单位',
        formWidth: 200,
        rowKey: 'customerCode',
        disabled,
        columns: [
          { type: 'index', title: '序号', width: '40', fixed: 'left' },
          { title: '单位序列号', field: 'customerCode', headerAlign: 'center' },
          { title: '单位名称', field: 'customerName', headerAlign: 'center' }
        ],
        params: {}
      },
      groupItem: {
        key: 'groupName',
        title: '单位组名称',
        formWidth: 200,
        rowKey: 'groupId',
        columns: [
          { type: 'index', title: '序号', width: '40', fixed: 'left' },
          { title: '单位组代码', field: 'groupId', headerAlign: 'center', width: 240 },
          { title: '单位组名称', field: 'name', headerAlign: 'center', width: 240 },
          { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
        ],
        params: {}
      },
      formItem: {},
      rules: {},
      addRules: {
        // czycode: [{ required: true, message: '用户代码不能为空', trigger: 'blur' }],
        phonenumber: [{ validator: validatePhonenumber, required: true, trigger: 'blur' }],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        indename: [{ required: true, message: '所属单位不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        providertype: [{ required: true, message: '机构属性不能为空', trigger: 'blur' }],
        password: [{ validator: validatePass, trigger: 'blur', required: true }],
        passwordConfirm: [{ validator: validatePassCheck, trigger: 'blur', required: true }]
      },
      editRule: {
        email: [{ validator: validateEmail, trigger: 'blur' }],
        czycode: [{ required: true, message: '用户代码不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        providertype: [{ required: true, message: '机构属性不能为空', trigger: 'blur' }],
        password: [{ validator: validatePass, trigger: 'blur', required: true }],
        passwordConfirm: [{ validator: validatePassCheck, trigger: 'blur', required: true }]
      },
      formItemArr: [],
      addFormItemArr: [
        // { label: '用户代码', key: 'czycode', type: 'input', disabled },
        { label: '手机号', key: 'phonenumber', type: 'input', disabled },
        { label: '用户名', key: 'name', type: 'input', disabled },
        { label: '所属单位', key: 'indename', type: 'modal-table', disabled },
        // { label: '手机号', key: 'phonenumber', type: 'input', disabled },
        { label: '密码', key: 'password', type: 'password', iptType: 'password' },
        { label: '密码确认', key: 'passwordConfirm', type: 'password', iptType: 'password' },
        { label: '票据管理员', key: 'manager', type: 'checkbox' },
        { label: '管理单位组', key: 'groupName', type: 'modal-table' },
        { label: '邮箱', key: 'email', type: 'input' },
        { label: '冻结', key: 'syzt', type: 'checkbox' },
        { label: '备注', key: 'bz', type: 'textarea', isOwn: true }
      ],
      editFormItemArr: [
        { label: '用户代码', key: 'czycode', type: 'input', disabled },
        { label: '用户名', key: 'name', type: 'input', disabled },
        { label: '所属单位', key: 'indename', type: 'modal-table', disabled },
        { label: '手机号', key: 'phonenumber', type: 'input', disabled },
        { label: '密码', key: 'password', type: 'password', iptType: 'password' },
        { label: '密码确认', key: 'passwordConfirm', type: 'password', iptType: 'password' },
        { label: '票据管理员', key: 'manager', type: 'checkbox' },
        { label: '管理单位组', key: 'groupName', type: 'modal-table' },
        { label: '邮箱', key: 'email', type: 'input' },
        { label: '冻结', key: 'syzt', type: 'checkbox' },
        { label: '备注', key: 'bz', type: 'textarea', isOwn: true }
      ]
    }
  },
  methods: {
    handleEyeClick (idx) {
      if (this.formItemArr[idx].iptType === 'text') {
        this.$set(this.formItemArr[idx], 'iptType', 'password')
      } else {
        this.$set(this.formItemArr[idx], 'iptType', 'text')
      }
    },
    handleGroupChange (data) {
      if (data.groupId) {
        this.formItem = {...this.formItem, groupName: data.name, customerGroupId: data.groupId }
      } else if (data.customerIndeid) {
        this.formItem = {...this.formItem, indename: data.customerName, indeid: data.customerIndeid }
      } else if (data.groupName === '') {
        this.formItem = {...this.formItem, groupName: '', customerGroupId: '' }
      }
    },
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      this.$refs.formInfo.validate(valid => {
        if (valid) {
          let params = {...this.formItem}
          params.manager = params.manager ? '1' : '0'
          params.syzt = params.syzt ? '2' : '1'
          if (this.actionFlag === 'S') {
            saveUser(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '新增用户成功' })
                this.$emit('complete')
              }
            })
          } else if (this.actionFlag === 'M') {
            updateUser(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '修改用户成功' })
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
      this.rules = this.editRules
      this.formItemArr = this.editFormItemArr
      getUserById({ id: this.row.id }).then(res => {
        if (res && res.status === 200) {
          this.formItem = res.data
          this.$set(this.formItem, 'manager', this.formItem.manager === '1')
          this.$set(this.formItem, 'syzt', this.formItem.syzt !== '1')
          this.$set(this.formItem, 'passwordConfirm', res.data.password)
          // this.$set(this.formItem, 'groupName', res.data.groupName)
          // this.$set(this.formItem, 'customerGroupId', res.data.customerGroupId)
        }
      })
    } else {
      this.rules = this.addRules
      this.formItemArr = this.addFormItemArr
    }
  }
}
</script>

<style lang="less">
@import './users-management.less';
</style>
