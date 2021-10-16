<template>
  <div class='voucher-condition-modal'>
    <Form ref='voucherForm'
          :model='formValue'
          :rules="formRules">
      <FormItem label=''
                prop='isRequireDate'
                style="display: inline-block; margin-left: 32px">
        <Checkbox v-model="formValue.isRequireDate"
                  true-value='1'
                  false-value='0'
                  @on-change='handleVoucherDateChange'>指定凭证日期</Checkbox>
      </FormItem>
      <FormItem label=''
                prop='PZRQ'
                style="display: inline-block">
        <DatePicker transfer
                    :disabled='formValue.isRequireDate !== "1"'
                    v-model="formValue.PZRQ"
                    type="date"
                    placeholder="选择凭证日期"></DatePicker>
      </FormItem>
      <FormItem label='生成方式'
                prop='SCFS'
                style='display: block; width: 350px'
                :label-width='100'
                placeholder="请选择">
        <Select v-model="formValue.SCFS"
                transfer>
          <Option value='cwhys'>财务和预算</Option>
          <Option value='cwkj'>仅生成财务会计</Option>
          <Option value='yskj'>仅生成预算会计</Option>
        </Select>
      </FormItem>
      <FormItem label='凭证类型'
                prop='PZLX'
                style='display: block; width: 350px'
                :label-width='100'>
        <Select v-model="formValue.PZLX"
                placeholder="请选择">
          <Option v-for='financeTypeItem in financeTypeList'
                  :value="financeTypeItem.value"
                  :key='financeTypeItem.value'>{{financeTypeItem.label}}</Option>
        </Select>
      </FormItem>
      <FormItem label='合并规则'
                prop='HBGZ'
                style='display: block; width: 350px'
                :label-width='100'
                placeholder="请选择">
        <Select v-model="formValue.HBGZ"
                transfer>
          <Option value='djyd'>多借一贷</Option>
          <Option value='ddyj'>多贷一借</Option>
          <Option value='djdd'>多借多贷</Option>
          <Option value='jdhb'>借贷合并</Option>
        </Select>
      </FormItem>
    </Form>
    <div class="footer-btn-group">
      <Button class="submit-btn footer-btn"
              @click="$emit('close')">取消</Button>
      <Button type="primary"
              @click='handleSubmit'
              class="submit-btn footer-btn">确定</Button>
    </div>
  </div>
</template>
<script>
import AptInputAuxiliary from './apt-input-auxiliary/apt-input-auxiliary'
import { getVoucType } from '@/api/gl/public'
import { setVoucherProductParams, generateDocument, getVoucherProductParams } from '@/api/pub/voucher-condition-modal'
const VOUCHER_CONDITION_MODAL = 'VOUCHER_CONDITION_MODAL'
export default {
  name: 'voucherConditionModal',
  props: {
    // 过账数据的单据类型ID
    billData: {
      type: Array,
      default: () => [],
      required: true
    },
    // 环境相关变量(表明的变量需要必传) 可直接将vuex中的 env 与 user 混入之后 传递进来
    // 以下命名参考了vuex内的命名 主要为了方便传值。
    ENV: {
      type: Object,
      required: true,
      default: () => {
        return {
          gsdm: '', // 公司代码
          kjnd: '', // 会计年度
          zth: '', // 账套号
          loginDate: '', // 业务日期
          id: '', // 操作员Id
          name: '' // 操作员Name
        }
      }
    },
    // 多选，是否生成一张凭证
    onlyOneVoucher: {
      type: Boolean,
      default: false
    },
    // 模块标识(尽量全部大写，接口处也会做统一转换)
    modCode: {
      type: String,
      default: '',
      require: true
    },
    // 单据类型ID(如果不传，默认取第一条数据的DJLXID字段)
    billTypeId: {
      type: [String, Number],
      default: ''
    },
    // 生成凭证要补的入参
    params: {
      type: Object,
      default: () => {
      }
    },
    // 区分功能模块标识
    modeMark: {
      type: String,
      default: ''
    },
    // 真实接口路径
    apiUrl: {
      type: String,
      default: ''
    }
  },
  data () {
    const validateDate = (rule, value, callback) => {
      if (this.formValue.isRequireDate === '1' && value === '') {
        callback(new Error('请指定凭证日期'))
      } else {
        callback()
      }
    }
    return {
      formValue: {
        isRequireDate: '1',
        PZRQ: new Date(), // 凭证日期
        SCFS: 'cwhys', // 生成方式
        PZLX: '', // 凭证类型
        HBGZ: 'djdd' // 合并规则
      },
      financeTypeList: [],
      formRules: {
        voucherDate: [{ validator: validateDate, trigger: 'blur' }],
        SCFS: [{ required: true, message: '请选择生成方式', trigger: 'blur' }],
        PZLX: [{ required: true, message: '请选择凭证类型', trigger: 'blur' }],
        HBGZ: [{ required: true, message: '请选择合并规则', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 按钮 展示辅助核算项弹窗
    showModalAuxiliary (list, data) {
      let ENV = { GSDM: this.ENV.gsdm, ZTH: this.ENV.zth, KJND: this.ENV.kjnd }
      return new Promise((resolve, reject) => {
        this.$modal({
          title: '辅助核算项录入',
          resize: false,
          showFooter: false,
          width: 600,
          height: 494,
          slots: {
            default: ({ $modal }, h) => {
              return [
                h(AptInputAuxiliary, {
                  props: { ENV, dataStruct: data },
                  on: {
                    close () {
                      $modal.close()
                    },
                    complete (val) {
                      data.DATA = { ...data.DATA, ...val }
                      resolve(data)
                      $modal.close()
                    }
                  }
                })
              ]
            }
          }
        })
      })
    },
    // 提交按钮
    handleSubmit () {
      this.$refs.voucherForm.validate(res => {
        if (!res) return false
        if (!this.billData.length) {
          return this.$fn.error({ title: '失败提示', desc: '请选择要过账的数据' })
        }
        let idList = []
        idList = this.billData.map(item => {
          return {
            DJBH: item.DJBH,
            MLID: item.MLID
          }
        })

        this.setVoucherProduct(idList)
      })
    },
    handleVoucherDateChange () {
      if (this.formValue.isRequireDate === '0') {
        this.formValue.PZRQ = ''
      }
    },
    // 用户勾选以后相关操作
    saveUserSelectData () {
      let { SCFS, HBGZ } = this.formValue
      let params = {
        GSDM: this.ENV.gsdm,
        ZTH: this.ENV.zth,
        TYPE: VOUCHER_CONDITION_MODAL,
        PARAMETER: { SCFS, HBGZ }
      }
      this.$fn.ajax(setVoucherProductParams, params, res => { }, 0)
    },
    setVoucherProduct (idList, data = []) {
      let { isRequireDate, ...formData } = this.formValue
      let { loginDate, id, name, gsdm, zth, kjnd } = this.ENV
      let STRICTCHECKDATA = []
      if (data[0]) { // 严格校验 补齐辅助项
        STRICTCHECKDATA = data.map(item => item.DATA)
      }
      formData.PZRQ = new Date(formData.PZRQ).Format('yyyyMMdd')
      let url = this.onlyOneVoucher ? 'generateDocumentHB' : 'generateDocument'
      let GWKIDList = []
      if (this.modeMark === 'GWKHKDJB') { // 公务卡还款需要特殊处理选中数据的值
        GWKIDList = this.$utils.clone(this.billData, true)
        GWKIDList.forEach((item, index) => {
          item['DJBH'] = index.toString()
          item['MLID'] = index.toString()
        })
      }
      let params = {
        GSDM: gsdm, // 公司代码
        ZTH: zth, // 账套号
        KJND: kjnd, // 会计年度
        ONLYONEVOUCHER: this.onlyOneVoucher,
        MODCODE: this.modCode.toUpperCase(), // 模块标识
        DJLXID: this.billTypeId || this.billData[0]['DJLXID'], // 单据类型ID
        CZYID: id, // 操作员ID
        CZYNAME: name, // 操作员名字
        PCH: data[0] ? data[0].PCH : '', // 生成凭证批次号，批次号相同为一组数据生成凭证，严格校验用
        YWRQ: new Date(loginDate).Format('yyyyMMdd'), // 业务日期
        IDLIST: this.modeMark === 'GWKHKDJB' ? GWKIDList : idList, // 严格校验第二次请求 请空该字段
        STRICTCHECKDATA,
        VOUCHERDATE: isRequireDate === '1',
        url,
        SOURCEPAGE: this.modeMark, // 功能模块标识
        ...formData, // 包括 合并规则, 凭证类型，生成方式
        ...this.params,
        apiUrl: this.apiUrl
      }
      this.$fn.ajax(generateDocument, params, res => {
        if (res && res.status === 200) {
          let successMsg = res.msg.split('&&')[0]
          let warningMsg = res.msg.split('&&')[1]
          if (successMsg) {
            this.$fn.success({ desc: successMsg })
          }
          if (warningMsg && warningMsg !== 'null') {
            this.$fn.warning({ desc: warningMsg })
          }
          this.$emit('complete', res.data)
        } else if (res && res.status === 300) {
          if (res.data.usedFp !== '1') { // usedFp='1'是账务联用发票异常返回标识
            return new Promise(async (resolve, reject) => {
              for (let i = 0; i < res.data.length; i++) {
                await this.showModalAuxiliary(idList, res.data[i])
                if (i === res.data.length - 1) {
                  resolve()
                }
              }
            }).then(() => this.setVoucherProduct(idList, res.data))
          }
        }
      }, 0)
    },
    getVoucType () {
      let params = { GSDM: this.ENV.gsdm, ZTH: this.ENV.zth, KJTXDM: null }
      return new Promise((resolve, reject) => {
        this.$fn.ajax(getVoucType, params, res => { // 获取凭证类型
          if (res && res.status === 200) {
            res.data.map(item => {
              item.label = item.PZLXMC
              item.value = item.PZLXDM
            })
            this.financeTypeList = res.data
            resolve(res.data)
          }
        }, 0)
      })
    },
    getUserSelectData () {
      let params = { GSDM: this.ENV.gsdm, ZTH: this.ENV.zth, TYPE: VOUCHER_CONDITION_MODAL }
      return new Promise((resolve, reject) => {
        this.$fn.ajax(getVoucherProductParams, params, res => {
          if (res && res.status === 200) {
            let data = res.data.PARAMETER || {}
            resolve(data)
          }
        }, 0)
      })
    }
  },
  created () {
    this.getVoucType().then(res => {
      if (res[0]) this.formValue.PZLX = res[0].value
    })
    this.getUserSelectData().then((res) => {
      this.formValue = { ...this.formValue, ...res }
    })
    this.formValue.PZRQ = this.ENV.loginDate
  }
}
</script>
<style lang="less">
 @import './voucher-condition-modal.less';
</style>
