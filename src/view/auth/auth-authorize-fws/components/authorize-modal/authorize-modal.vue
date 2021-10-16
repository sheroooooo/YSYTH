<template>
  <div class='authorize-modal'>
    <div class="authorize-modal-content">
      <card-slot title="授权给服务商">
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
                      :disabled="item.disabled"
                      @on-change="handleSelectChange(item.key)">
                <Option v-for="item in selectData[item.key]"
                        :value="item.value"
                        :key="item.value"
                        :disabled="item.disabled">{{ item.title }}</Option>
              </Select>
              <Input v-else-if="item.sjlx==='text'"
                     v-model="initValueList[item.key]"
                     :disabled="item.disabled" />
              <InputNumber v-else-if="item.sjlx==='number'"
                           v-model="initValueList[item.key]"
                           class="input-number-style"
                           :disabled="item.disabled"></InputNumber>
              <DatePicker v-else-if="item.sjlx==='date'"
                          v-model="initValueList[item.key]"
                          type="date"
                          :disabled="item.disabled"></DatePicker>
              <Checkbox v-else-if="item.sjlx==='checkbox'"
                        v-model="initValueList[item.key]"
                        :true-value="'2'"
                        :false-value="'0'"
                        :disabled="item.disabled"></Checkbox>
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
    <div class="authorize-modal-btn"
         v-if="editable">
      <Button @click="handleBtnClick('cancel')"
              class="item-btn">取消</Button>
      <Button type="primary"
              @click="handleBtnClick('save')"
              class="item-btn">保存</Button>
    </div>
  </div>
</template>

<script>
import CardSlot from '_c/card-slot'
import ModalTableSelect from '_c/table/modal-table-select'
import { getProviderName, saveCsmpOrder, getCsmpOrder, getModules } from '@/api/auth/auth-authorize-fws'
export default {
  name: 'AuthorizeModal',
  components: {
    CardSlot,
    ModalTableSelect
  },
  props: {
    status: {
      type: String,
      default: ''
    },
    orderId: {
      type: String,
      default: ''
    },
    fwnrList: {
      type: Array,
      default: () => []
    },
  },
  data () {
    return {
      initValueList: {
        statusCode: '0',
        agentIndeid: 0
      },
      DDSXList: [], //订单属性下拉框数据
      checkValue: false,
      rules: {},//表单校验规则
      selectData: {
        'ordertype': [
          {
            value: '新购',
            title: '新购'
          },
          {
            value: '加购',
            title: '加购'
          }
        ],
        'ordercontext': []
      },

    }
  },
  computed: {
    editable () {
      return this.status !== 'readOnly'
    },
    itemList () {
      let disabled = !this.editable
      let arr = [
        {
          key: 'odoId',
          title: '出库单号',
          sjlx: 'text',
          disabled: this.status === 'update' || disabled,
          required: true
        },
        {
          key: 'odotime',
          title: '订单日期',
          sjlx: 'date',
          required: true,
          disabled
        },
        {
          key: 'ordertype',
          title: '订单属性',
          sjlx: 'select',
          required: true,
          disabled
        },
        {
          key: 'serviceid',
          title: '授权服务内容',
          sjlx: 'select',
          required: true,
          disabled
        },
        {
          key: 'ordercontext',
          title: '订购内容',
          sjlx: 'select',
          required: true,
          disabled: !this.initValueList.serviceid || disabled
        },
        {
          key: 'providerName',
          title: '所属运营商',
          sjlx: 'text',
          required: true,
          disabled: true
        },
        {
          key: 'agentName',
          title: '服务商名称',
          sjlx: 'table',
          required: true,
          disabled,
          rowKey: 'agentIndeid',
          columns: [{
            title: '服务商ID',
            field: 'agentIndeid',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          },
          {
            title: '服务商编码',
            field: 'agentCode',
            minWidth: '135',
            align: 'left',
            headerAlign: 'center',
          },
          {
            title: '服务商名称',
            field: 'agentName',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          },
          {
            title: '服务商简称',
            field: 'agentShortname',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          }, {
            title: '服务商代码',
            field: 'wbdm',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          }]
        },
        {
          key: 'agentCode',
          title: '服务商编码',
          sjlx: 'text',
          required: true,
          disabled: true
        },
        {
          key: 'agentWbdm',
          title: '服务商代码',
          sjlx: 'text',
          required: true,
          disabled: true
        },
        {
          key: 'customerName',
          title: '单位名称',
          sjlx: 'table',
          required: true,
          disabled: !this.initValueList.agentName || disabled,
          rowKey: 'customerCode',
          columns: [{
            title: '单位ID',
            field: 'customerIndeid',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          },
          {
            title: '单位编码',
            field: 'customerCode',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          },
          {
            title: '单位名称',
            field: 'customerName',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          },
          {
            title: '单位简称',
            field: 'customerShortname',
            align: 'left',
            minWidth: '135',
            headerAlign: 'center',
          }],
          params: { agentIndeid: this.initValueList.agentIndeid ? this.initValueList.agentIndeid : 0 }
        },
        {
          key: 'customerCode',
          title: '单位编码',
          sjlx: 'text',
          required: true,
          disabled: true
        },
        {
          key: 'serialNumber',
          title: '序列号',
          sjlx: 'text',
          required: true,
          disabled: this.status === 'update' || disabled,
        },
        {
          key: 'ordernumber',
          title: '订购套数',
          sjlx: 'number',
          required: true,
          disabled: true
        },
        {
          key: 'authoriznumber',
          title: '订购授权数',
          sjlx: 'number',
          required: true,
          disabled
        },
        {
          key: 'statusCode',
          title: '冻结',
          sjlx: 'checkbox',
          span: 8,
          disabled
        },
        {
          key: 'remark',
          title: '备注',
          sjlx: 'text',
          span: 24,
          disabled
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
          this.itemList.map(item => {
            if (item.sjlx === 'date') {
              let key = item.key
              let date = new Date(values[key])
              values[key] = date.Format('yyyyMMdd')
            }
          })
          values['servicename'] = this.selectData['serviceid'].find(item => item.value === values.serviceid).title
          values.serviceid = Number(values.serviceid)
          values.authoriznumber = Number(values.authoriznumber)
          values.ordernumber = Number(values.ordernumber)
          this.$fn.ajax(saveCsmpOrder, values, res => {
            if (res.status === 200) {
              this.$fn.success({ desc: '保存成功' })
              this.$emit('complete')
            }
          })
        }
      })
    },
    getFormData () {
      return new Promise((resolve, reject) => {
        let params = {
          orderId: this.orderId
        }
        this.$fn.ajax(getCsmpOrder, params, res => {
          if (res && res.status === 200) {
            this.$nextTick(() => {
              this.initValueList = res.data
              let strArr = ['authoriznumber', 'ordernumber', 'serviceid']
              strArr.forEach(item => {
                this.initValueList[item] = this.initValueList[item].toString()
              })
              resolve(true)
            })
          }
        })
      })
    },
    getDisabled (key) {
      let disabled = false
      if (key === 'customerWbdm' || key === 'agentCode' || key === 'agentWbdm' || key === 'customerCode' || key === 'providerName') {
        disabled = true
      } else if (key === 'customerName') {
        if (!this.initValueList.agentName || !this.editable) {
          disabled = true
        }
      } else if ((key === 'odoId') && this.status === 'update') {
        disabled = true
      } else if (!this.editable) {
        disabled = true
      } else if (key === 'ordercontext') {
        if (!this.initValueList.serviceid)
          disabled = true
      }
      return disabled
    },
    handleChange (value, list, key) {
      let updateKeys = []
      if (key === 'agentName') {
        let target = this.itemList.find(e => e.key === 'customerName')
        if (value[key]) {
          updateKeys = ['agentName', 'agentIndeid', 'agentCode', 'agentShortname', 'agentWbdm']
          updateKeys.map(item => {
            if (item === 'agentWbdm') {
              this.$set(this.initValueList, item, value.wbdm)
            } else {
              this.$set(this.initValueList, item, value[item])
            }
          })
        } else {
          this.$set(this.initValueList, key, value.key)
          this.$set(this.initValueList, 'agentIndeid', 0)
          let clearKeys = ['customerIndeid', 'customerCode', 'customerName', 'customerShortname', 'customerWbdm']
          clearKeys.map(item => {
            this.$set(this.initValueList, item, '')
          })
        }
      } else {
        if (value[key]) {
          updateKeys = ['customerIndeid', 'customerCode', 'customerName', 'customerShortname', 'customerWbdm']
          updateKeys.map(item => {
            if (item === 'customerWbdm') {
              this.$set(this.initValueList, item, value.wbdm)
            } else {
              this.$set(this.initValueList, item, value[item])
            }
          })
        } else {
          this.$set(this.initValueList, key, value.key)
        }
      }
    },
    // 获取所属运营商
    getProviderName () {
      this.$fn.ajax(getProviderName, {}, res => {
        if (res.status === 200) {
          this.$set(this.initValueList, 'providerName', res.data.providerName)
        }
      })
    },
    handleSelectChange (key) {
      if (key === 'serviceid') {
        this.initValueList.ordercontext = ''
        this.getModules()
      }
    },
    getModules () {
      return new Promise((resolve, reject) => {
        this.$fn.ajax(getModules, { serviceid: this.initValueList.serviceid }, res => {
          if (res.status === 200) {
            this.selectData['ordercontext'] = res.data.map(item => {
              return {
                value: item.modulename,
                title: item.modulename
              }
            })
            resolve(true)
          }
        })
      })
    }
  },
  created () {
    this.selectData['serviceid'] = this.fwnrList
    this.selectData['serviceid'].forEach(item => item.value = item.value.toString())
    this.itemList.forEach(item => {
      if (item.required) {
        if (item.sjlx === 'date') {
          this.rules[item.key] = [{ required: true, message: item.title + '不能为空', trigger: 'blur', type: 'date' }]
        } else if (item.sjlx === 'select' || item.sjlx === 'table') {
          this.rules[item.key] = [{ trigger: 'change', required: 'true', message: item.title + '不能为空' }]
        } else {
          this.rules[item.key] = [{ required: true, message: item.title + '不能为空', trigger: 'blur' }]
        }
      }
    })
  },
  mounted () {
    if (this.status === 'add') {
      this.$set(this.initValueList, 'ordernumber', '1')
      this.$set(this.initValueList, 'authoriznumber', '1')
      this.getProviderName() // 获取所属运营商
    }
    if (this.status === 'update' || this.status === 'readOnly') {
      this.getFormData().then(res => {
        this.getModules()
      })
    }
  },

}
</script>

<style lang="less">
@import './authorize-modal.less';
</style>
