<template>
  <div class="distribute-modal">
    <div class="distribute-modal-body">
      <card-slot title="订货出库单信息"
                 class="form-wrap">
        <Form ref="formItem"
              :model="formItem"
              :label-width="100"
              inline>
          <Row>
            <Col span="6"
                 v-for="item in formItemArr"
                 :key="item.key">
            <FormItem :label="item.label">
              <Input v-model="formItem[item.key]"
                     disabled
                     class="width200"></Input>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </card-slot>
      <card-slot title="服务商授权分发"
                 class="table-wrap">
        <table-expand-form ref="disDetails"
                           class="table-wrap-body"
                           title="服务商授权分发"
                           :columns="column"
                           :values="values"
                           :default-value="defaultValues"
                           :editable="editable"
                           :buttonList="buttonList"
                           :formStyle="'tableAndForm'"
                           :billId="billId"
                           :show-qr-code="true"
                           @on-add='(v, i) => tableInnerListAdd(v, i)'
                           @on-delete='(i) => tableInnerListDelete(i)'
                           @on-edit="handleEditorRow"
                           @on-form-ok="handleFormOk"
                           @handle-create-qr-code="handleCreateQrCode"
                           @on-change='formChange'>
        </table-expand-form>
      </card-slot>
    </div>
    <modal-footer @handle-ok="handleOk"
                  @handle-cancel="handleCancel"></modal-footer>
  </div>
</template>

<script>
import CardSlot from '_c/card-slot'
import ModalFooter from '_c/modal-footer'
import TableExpandForm from '_c/table-expand-form'
import TableFormActions from './modal-table-form-actions'
import { getCsmpOrderallocations } from '@/api/auth/auth-distribute'
export default {
  name: 'DistributeModal',
  components: { CardSlot, ModalFooter, TableExpandForm },
  mixins: [TableFormActions],
  props: {
    modalData: { // 选择的出库单数据
      type: Object,
      default: () => { }
    },
    curTab: {
      type: Number,
      default: 1
    }
  },
  data () {
    let loginDate = new Date()
    return {
      formItemArr: [
        { label: '出库单号', key: 'odoId' },
        { label: '制单日期', key: 'createtime' },
        { label: '订单属性', key: 'ordertype' },
        { label: '订购内容', key: 'ordercontext' },
        // { label: '单位代码', key: 'customerWbdm' },//隐藏不显示
        { label: '单位名称', key: 'customerName' },
        { label: '序列号', key: 'serialNumber' },
        { label: '授权服务内容', key: 'servicename' },
        { label: '服务商编码', key: 'agentCode' },
        { label: '服务商名称', key: 'agentName' },
        { label: '服务商代码', key: 'agentWbdm' },
        { label: '服务商简称', key: 'agentShortname' },
        { label: '订购套数', key: 'ordernumber' },
        { label: '订购授权数', key: 'authoriznumber' }
      ],
      values: [],
      defaultValues: {
        authoritytype: '次数',
        createtime: loginDate,
        serialNumber: this.modalData.serialNumber,
        customerName: '',
        customerIndeid: '',
        customerWbdm: this.modalData.customerWbdm,
        customerCode: this.modalData.customerCode,
        orderNumber: 1,
        remark: '',
        statusText: '未激活'
      },
      billId: 1,
      editable: !this.modalData.onlyView,
      formReadonly: false
    }
  },
  computed: {
    buttonList () {
      if (this.curTab === 1 && this.values.length === 0) {
        return ['bottomAdd', 'qrCode', 'edit', 'delete']
      } else {
        return ['qrCode', 'edit', 'delete']
      }
    },
    formItem () {
      return this.modalData
    },
    column () {
      let readonly = this.formReadonly
      return [
        {
          key: 'authoritytype',
          title: '授权方式',
          type: 'item',
          dataType: 'input',
          required: true,
          readonly: true,
          options: {
            rules: [{ required: true, message: '授权方式不能为空' }, {}],
            dataSource: '-1',
            data: [
              // { code: '0', name: '次数' }
              // { code: '1', name: '单位数' },
              // { code: '2', name: '终端数' },
              // { code: '3', name: '用户数' }
            ]
          }
        },
        {
          key: 'createtime',
          title: '授权时间',
          type: 'item',
          dataType: 'date',
          readonly: true,
          options: {}
        },
        {
          key: 'customerName',
          title: '用户名称',
          type: 'item',
          dataType: 'table-page-select',
          params: {
            agentIndeid: this.modalData.agentIndeid
          },
          columns: [
            { type: 'index', title: '序号', width: '40', fixed: 'left' },
            { title: '单位编码', field: 'customerCode', headerAlign: 'center', width: 240 },
            { title: '单位名称', field: 'customerName', headerAlign: 'center', width: 240 },
            { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
          ],
          required: true,
          readonly,
          options: {
            rules: [{ required: true, message: '用户名称不能为空' }, {}]
          }
        },
        {
          key: 'serialNumber',
          title: '序列号',
          type: 'item',
          dataType: 'input',
          required: true,
          readonly: true,
          options: {}
        },
        {
          key: 'orderNumber',
          title: '授权套数',
          type: 'item',
          dataType: 'integer',
          required: true,
          readonly: true,
          options: {
            rules: [{ required: true, message: '授权套数不能为空' }, {}],
            dataSource: '-1',
            data: []
          }
        },
        { key: 'remark', title: '备注', type: 'item', dataType: 'input', ownerrow: true, readonly, options: {} },
        {
          key: 'statusText',
          title: '是否激活',
          type: 'item',
          dataType: 'input',
          readonly: true,
          options: {}
        }
      ]
    }
  },
  methods: {
    handleCancel () {
      this.$emit('close')
    },
    handleOk () {
      this.$emit('close')
    },
    getTableData () {
      let { agentIndeid, orderId } = this.modalData
      return getCsmpOrderallocations({ orderId }).then(res => {
        // serviceid, servicename, ordernumber, remark
        // customerIndeid, customerCode, customerName, customerWbdm
        // createtime, statusCode
        if (res && res.status === 200) {
          let tmpArr = res.data
          tmpArr.map(v => {
            v.orderNumber = v.ordernumber.toString()
            v.statusText = v.statusCode * 1 === 1 ? '已激活' : '未激活'
            v.remark = v.remark ? v.remark : ''
          })
          this.values = tmpArr
        }
      })
    }
  },
  async mounted () {
    // 弹框高度 - 表单高度 - 弹框padding - 表格title - footer
    let h = $('.distribute-modal').parent().height() - $('.distribute-modal-body .form-wrap').height() - 32 - 40 - 40
    $('.distribute-modal-body .table-wrap').height(h + 50)
    $('.distribute-modal-body .table-wrap-body').height(h)
    await this.getTableData()
  }
}
</script>

<style lang="less">
@import './auth-distribute.less';
</style>
