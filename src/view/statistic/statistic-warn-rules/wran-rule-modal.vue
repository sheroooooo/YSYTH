<template>
  <div class="edit-modal">
    <div class="edit-modal-content">
      <Form :model="formInfo"
            :label-width="120"
            :rules="formInfo.code === 'mckz' ? mckzRules : jekzRules"
            ref="formInfo">
        <Row>
          <Col span="12">
          <FormItem label="名称"
                    prop="code">
            <Select v-model="formInfo.code"
                    @on-change="onChange">
              <Option v-for="item in warnNames"
                      :value="item.value"
                      :label="item.title"
                      :key="item.value">{{ item.title }}</Option>
            </Select>
          </FormItem>
          </Col>
          <Col span="12">
          <FormItem prop="enable">
            <Checkbox v-model="formInfo.enable"
                      :true-value='1'
                      :false-value='0'>启用</Checkbox>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
          <FormItem label="控制方式"
                    prop="mode">
            <Select v-model="formInfo.mode"
                    :disabled="formInfo.enable === 0">
              <Option v-for="item in warnModes"
                      :value="item.value"
                      :key="item.value">{{ item.title }}</Option>
            </Select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
          <FormItem label="上限金额"
                    prop="amount"
                    v-if="formInfo.code === 'jekz'">
            <InputNumber v-model="formInfo.amount"
                         type="number"
                         :disabled="formInfo.enable === 0"
                         :min='0'></InputNumber>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
          <FormItem label="纳税人识别号"
                    prop="buyerNumber"
                    v-if="formInfo.code === 'mckz'">
            <Input v-model="formInfo.buyerNumber"
                   type="text"
                   :disabled="formInfo.enable === 0"></Input>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
          <FormItem label="单位名称"
                    prop="buyerName"
                    v-if="formInfo.code === 'mckz'">
            <Input v-model="formInfo.buyerName"
                   type="text"
                   :disabled="formInfo.enable === 0"></Input>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24">
          <FormItem label="不受约束费用性质"
                    prop="billnames"
                    :label-width="140">
            <Select v-model="formInfo.billnames"
                    multiple
                    transfer
                    filterable
                    :disabled="formInfo.enable === 0">
              <Option v-for="item in billnamesList"
                      :value="item.billname"
                      :key="item.billname">{{ item.billname }}</Option>
            </Select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24">
          <FormItem label="不受约束费用明细"
                    prop="vouchernames"
                    :label-width="140">
            <Select v-model="formInfo.vouchernames"
                    multiple
                    transfer
                    filterable
                    :disabled="formInfo.enable === 0">
              <Option v-for="item in vouchernamesList"
                      :value="item.vouchername"
                      :key="item.vouchername">{{ item.vouchername }}</Option>
            </Select>
          </FormItem>
          </Col>
        </Row>
      </Form>
    </div>
    <div class="edit-modal-footerBtns">
      <Button class="item-btn"
              @click="$emit('close')">取消</Button>
      <Button type="primary"
              class="item-btn"
              @click="handleOkClick">确定</Button>
    </div>
  </div>
</template>
<script>
import { saveWarnRule, updateWarnRule, getBillTypes, getVoucherNames } from '@/api/statistic/statistic-warn-rules'
export default {
  name: 'WarnRuleModal',
  data () {
    const valiAmount = (rule, value, callback) => {
      let val = this.formInfo.amount
      if (val === 0) {
        callback(new Error('金额必须大于0'))
      } else {
        callback()
      }
    }
    return {
      // 校验方式
      warnNames: [
        { title: '发票购买方信息检验', value: 'mckz'},
        { title: '发票金额上限检验', value: 'jekz'}
      ],
      // 控制方式
      warnModes: [
        { title: '拒收', value: 0 },
        { title: '预警', value: 1 }
      ],
      formInfo: {
        code: 'mckz',
        mode: 0,
        enable: 1,
        buyerName: '',
        buyerNumber: '',
        amount: 0,
        billnames: '',
        vouchernames: ''
      },
      showCSZ: false,
      jekzRules: {
        amount: [{validator: valiAmount, trigger: 'blur', required: true }]
      },
      mckzRules: {
        buyerNumber: [{ trigger: 'blur', required: true, message: '纳税人识别号不能为空' }]
      },
      billnamesList: [],
      vouchernamesList: []
    }
  },
  props: {
    data: {
      type: Object,
      default: () => { }
    },
    action: {
      type: String,
      default: ''
    }
  },
  methods: {
    onChange (val) {
      if (val === 'mckz') {
        this.formInfo.amount = 0
      }
    },
    pageInit () {
      this.getVoucherNames()
      this.getBillTypes()
    },
    getBillTypes () {
      this.$fn.ajax(getBillTypes, {}, res => {
        if (res.status === 200) {
          this.billnamesList = res.data
        }
      })
    },
    getVoucherNames () {
      this.$fn.ajax(getVoucherNames, {}, res => {
        if (res.status === 200) {
          this.vouchernamesList = res.data
        }
      })
    },
    // 保存参数，设置‘单张发票金额上限检验’时，将选择的费用性质以外的BILLCODE存储
    handleOkClick () {
      this.$refs.formInfo.validate(valid => {
        if (!valid && this.formInfo.sfqy === '1') {
          this.$fn.warning({ desc: '有内容为空，请填写！' })
        } else {
          let info = this.$utils.clone(this.formInfo, true)
          if (info.billnames !== null) info.billnames = info.billnames.toString()
          if (info.vouchernames !== null) info.vouchernames = info.vouchernames.toString()
          if (info.code === 'mckz') info.name = '发票购买方信息检验'
          if (info.code === 'jekz') info.name = '发票金额上限检验'
          let params = {
            ...info
          }
          let url = this.action === 'edit' ? updateWarnRule : saveWarnRule
          this.$fn.ajax(url, params, res => {
            if (res.status === 200) {
              this.$fn.success({ desc: res.msg })
              this.$emit('close')
            }
          })
        }
      })
    }
  },
  mounted () {
    if (this.action === 'edit') {
      this.$nextTick(()=>{
        this.formInfo = this.$utils.clone(this.data, true)
        this.formInfo.billnames = this.data.billnames === null ? '' : this.formInfo.billnames.split(',')
        this.formInfo.vouchernames = this.data.vouchernames === null ? '' : this.formInfo.vouchernames.split(',')
      })
    }
    this.pageInit()
  }
}
</script>
<style lang="less" scoped>
.edit-modal {
    height: 100%;
    width: 100%;
    &-content {
        position: relative;
        height: calc(~'100% - 40px');
        overflow-y: auto;
    }
    &-footerBtns {
        width: 100%;
        .item-btn {
            float: right;
            margin: 8px 8px 0 0;
        }
    }
}
</style>
