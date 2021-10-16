<template>
  <div class='apt-input-auxiliary'>
    <Row class='apt-main'>
      <Col span='8' class='bill-detail-wrapper'>
        <div class='bill-detail-item'>单据号：{{ dataStruct.DJBH }}</div>
        <div class='bill-detail-item'>摘要：{{ dataStruct.ZY }}</div>
        <div class='bill-detail-item'>科目：{{ dataStruct.KMDM }}</div>
        <div class='bill-detail-item'>方向：{{ dataStruct.JDBZ }}</div>
        <div class='bill-detail-item'>金额：{{ dataStruct.JE }}</div>
      </Col>
      <Col span='16' class='form-wrapper'>
        <Form ref='formDom' :model='formData' :label-width='110' :rules='formRules'>
          <FormItem v-for="(formItem, index) in formStruct"
                    :key='index'
                    :label='formItem.label'
                    :prop='formItem.key'>
            <Input v-model="formData[formItem.key]"
                   v-if='formItem.type === "Table" || formItem.type === "Tree"'
                   :maxlength='100'
                   readonly
                   @on-click="handleAuxiliaryClick(formItem)"
                   icon="ios-more"></Input>
            <Input v-model="formData[formItem.key]"
                   v-if='formItem.type === "Input"'></Input>
            <Select transfer filterable v-model='formData[formItem.key]' v-if='formItem.type === "Select"'>
              <Option v-for='option in formItem.list' :key='option.DM' :value='option.DM'>{{option.DMMC || option.FZDMMC}}</Option>
            </Select>
          </FormItem>
        </Form>
      </Col>
    </Row>
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
import AptCashFlow from '../apt-cash-flow/apt-cash-flow'
import { commonRequest } from '@/api/apt/apt-voucher-produce'
const MONEY_FLOW = [
  {
    field: 'XJDM',
    title: '代码'
  },
  {
    field: 'DMMC',
    title: '名称'
  },
  {
    field: 'ZJM',
    title: '助记码'
  }
]
export default {
  name: 'AptInputAuxiliary',
  props: {
    ENV: {
      type: Object
    },
    dataStruct: {
      type: Object,
      default: () => {
        return {
          DJBH: '',
          ZY: '',
          JE: '',
          KMDM: '',
          FZHSLIST: []
        }
      }
    }
  },
  data () {
    return {
      formStruct: [],
      formData: {},
      formRules: {}
    }
  },
  created () {
    this.initFormStruct(this.dataStruct.FZHSLIST)
  },
  methods: {
    handleAuxiliaryClick (formItem) {
      const _this = this
      this.$modal({
        title: formItem.label,
        resize: false,
        showFooter: false,
        width: 850,
        height: 650,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(AptCashFlow, {
                props: {
                  dataConfig: {
                    type: formItem.type,
                    data: formItem.list,
                    columns: formItem.columns || [],
                    props: {}
                  },
                  ENV: this.ENV
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (val) {
                    _this.formData[formItem.key] = val.DMMC
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    initFormStruct () {
      let formData = {}
      let formRules = {}
      let request = []
      let itemTempList = []
      this.formStruct = [...this.dataStruct.FZHSLIST]
      this.dataStruct.FZHSLIST.map(item => {
        formData[item.key] = item.value
        formRules[item.key] = [{
          required: true,
          message: `${item.label}不能为空`,
          trigger: 'change'
        }]
        if (item.url) {
          item.columns = item.param.LBDM === 'X' && item.type === 'Table' ? MONEY_FLOW : []
          item.list = []
          itemTempList.push(item)
          let params = { ...this.ENV, ...item.param, ISCHANGE: '0' }
          request.push(this.utilCommonRequest(item.url, params))
        }
      })
      this.formRules = { ...formRules }
      this.formData = { ...formData }
      Promise.all([...request]).then(resGroup => {
        resGroup.map((res, index) => {
          let formItem = this.formStruct.find(item => item.key === itemTempList[index].key)
          formItem.list = [ ...res ]
        })
        this.formStruct = [ ...this.formStruct ]
      })
    },
    utilCommonRequest (url, params) {
      return new Promise((resolve, reject) => {
        this.$fn.ajax(commonRequest, { url, params }, res => {
          if (res && res.status === 200) {
            resolve(res.data)
          }
        })
      })
    },
    handleSubmit () {
      this.$refs.formDom.validate((valid) => {
        if (valid) {
          let formDataCopy = { ...this.formData }
          Object.keys(formDataCopy).map(key => {
            formDataCopy[key] = formDataCopy[key].split(' ')[0].toString()
          })
          // 处理数据
          this.$emit('complete', formDataCopy)
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import './apt-input-auxiliary.less';
</style>
