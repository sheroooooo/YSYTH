<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="content-bill-app"
                   @on-resize="handlePlgDocResize">
    <div class="content-bill-app-body">
      <card-slot title="服务地址配置"
                 class="form-wrap">
        <vuc-toolbar :data="btns"
                     :status="editable?'1':'0'"
                      class="toolbar"
                      @click="handleVucBtnClick">
        </vuc-toolbar>
        <Form ref="formItem"
              :model="formItem"
              :label-width="100">
          <FormItem v-for="item in formArr"
                    :key="`form-${item.key}`"
                    :label="item.label">
            <Input v-model="formItem[item.key]"
                    :disabled="!editable"
                    style="width: 50%;"></Input>
          </FormItem>
        </Form>
      </card-slot>
      <card-slot title="授权量库存管理"
                 class="table-wrap">
        <table-expand-form ref="billAppTef"
                          class="table-wrap-body"
                          :style="`height: ${tableWrapHeight}px;`"
                          title="授权量库存管理"
                          :columns="column"
                          :values="values"
                          :default-value="defaultValues"
                          :editable="true"
                          :buttonList="buttonList"
                          :formStyle="'tableAndForm'"
                          :billId="1"
                          @on-add='(v, i) => tableInnerListAdd(v, i)'
                          @on-delete='(i) => tableInnerListDelete(i)'
                          @on-form-ok="handleFormOk"
                          @on-change='formChange'>
        </table-expand-form>
      </card-slot>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import {
  getDzfpSetting,
  updateDzfpSetting,
  getCsmpStocks,
  saveCsmpStock,
  updateCsmpStock,
  getAllCsmpServer,
  deleteByStoreId
} from '@/api/content/content-bill-app'
import CardSlot from '_c/card-slot'
import TableExpandForm from '_c/table-expand-form'
export default {
  name: 'ContentBillApp',
  components: { CardSlot, TableExpandForm },
  data () {
    let loginDate = this.$store.getters.env.loginDate
    return {
      btns: [
        { code: 'set', text: '设置', type: 'primary', status: [0] },
        { code: 'save', text: '保存', type: 'primary', status: [1] },
        { code: 'cancel', text: '取消', status: [1] }
      ],
      formArr: [
        { label: '验真接口地址', key: 'AuthenticityADDRESS' },
        { label: '验真密钥', key: 'AuthenticityUSERKEY' },
        { label: '验真校验码', key: 'AuthenticityUSERCRC' }
      ],
      formItem: {
        AuthenticityADDRESS: '',
        AuthenticityUSERKEY: '',
        AuthenticityUSERCRC: ''
      },
      copyFormItem: {},
      tableWrapHeight: 0,
      // 表格数据
      values: [],
      // 表格数据备份
      copyValues: [],
      defaultValues: {
        servicename: '',
        authoritytype: '次数',
        remainnumber: 0,
        createtime: loginDate,
        storenumber: 0,
        createperson: '',
        remark: ''
      },
      editable: false,
      buttonList: [ 'bottomAdd', 'edit', 'delete', 'insert', 'copy' ],
      fwmcArr: []
    }
  },
  computed: {
    column () {
      let tmpArr = [
        {
          key: 'providerName',
          title: '运营商名称',
          type: 'item',
          width: 200,
          dataType: 'table-page-select',
          rowKey: 'providerCode',
          columns: [
            { type: 'index', title: '序号', width: '40', fixed: 'left' },
            { title: '运营商编码', field: 'providerCode', headerAlign: 'center', width: 240 },
            { title: '运营商名称', field: 'providerName', headerAlign: 'center', width: 240 },
            { title: '备注', field: 'remark', headerAlign: 'center', 'min-width': 120 }
          ],
          params: {},
          required: true,
          options: {
            rules: [{ required: true, message: '运营商名称不能为空' }, {}]
          }
        },
        {
          key: 'servicename',
          title: '服务名称',
          type: 'item',
          width: 200,
          dataType: 'select',
          required: true,
          options: {
            rules: [{ required: true, message: '服务名称不能为空' }, {}],
            dataSource: '-1',
            data: this.fwmcArr
          }
        },
        {
          key: 'authoritytype',
          title: '授权方式',
          type: 'item',
          dataType: 'input',
          readonly: true,
          required: true,
          options: {
            rules: [{ required: true, message: '授权方式不能为空' }, {}]
          }
        },
        {
          key: 'remainnumber',
          title: '库存剩余量',
          type: 'item',
          dataType: 'integer',
          readonly: true,
          options: {}
        },
        {
          key: 'createtime',
          title: '入库时间',
          type: 'item',
          dataType: 'date',
          required: true,
          readonly: true,
          options: {
            rules: [{ required: true, message: '入库时间不能为空' }, {}]
          }
        },
        {
          key: 'storenumber',
          title: '入库数量',
          type: 'item',
          dataType: 'integer',
          required: true,
          options: {
            rules: [{ required: true, message: '入库数量不能为空' }, {}],
            dataSource: '-1',
            data: []
          }
        },
        {
          key: 'createperson',
          title: '入库人',
          type: 'item',
          dataType: 'input',
          readonly: true,
          options: {}
        },
        { key: 'remark', title: '备注', type: 'item', dataType: 'input', ownerrow: true, options: {} }
      ]
      return tmpArr
    }
  },
  methods: {
    handlePlgDocResize ({ height }) {
      this.tableWrapHeight = height - 100 - 200 - 50
    },
    handleVucBtnClick (item) {
      this[item.code]()
    },
    set () {
      this.copyFormItem = this.$utils.clone(this.formItem, true)
      this.editable = true
    },
    save () {
      let params = {
        gsdm: this.$store.state.app.env.gsdm,
        dzfpjk: 'HHYZ',
        list: []
      }
      for (let o in this.formItem) {
        params.list.push({
          paramsName: o,
          paramsValue: this.formItem[o]
        })
      }
      updateDzfpSetting(params).then(res => {
        if (res && res.status === 200) {
          this.$fn.success({ desc: '保存成功' })
          this.editable = false
        }
      })
    },
    cancel () {
      this.formItem = this.$utils.clone(this.copyFormItem, true)
      this.editable = false
    },
    // 新增一条变动明细
    tableInnerListAdd (v, i) {
      this.values.splice(i, 0, v)
    },
    // 删除一条变动明细
    tableInnerListDelete (i) {
      deleteByStoreId({ storeId: this.values[i].storeId }).then(res => {
        if (res && res.status === 200) {
          this.values.splice(i, 1)
          this.getTableData()
        }
      })
    },
    // 表单确认按钮
    handleFormOk (i, flag) {
      if (!flag) {
        this.getTableData()
        return
      }
      let {
        servicename,
        storenumber,
        remark,
        authoritytype,
        providerName,
        providerIndeid,
        providerCode
      } = this.values[i]
      let params = {
        serviceid: servicename.split(' ')[0] * 1,
        servicename: servicename.split(' ')[1],
        storenumber,
        remark,
        authoritytype,
        providerName,
        providerIndeid,
        providerCode
      }
      // providerIndeid, providerCode, providerName
      if (this.values[i].storeId) {
        params.storeId = this.values[i].storeId
        updateCsmpStock(params).then(res => {
          if (res && res.status === 200) {
            this.getTableData()
            this.$fn.success({ desc: '修改成功' })
          } else {
            this.$refs.billAppTef.handleEditorRow(i, this.values[i])
          }
        })
      } else {
        saveCsmpStock(params).then(res => {
          if (res && res.status === 200) {
            this.getTableData()
            this.$fn.success({ desc: '保存成功' })
          } else {
            this.$refs.billAppTef.handleEditorRow(i, this.values[i])
          }
        })
      }
    },
    // 表单数据变化回调
    formChange (values, index, key, list) {
      if (key === 'providerName' && typeof values.providerName === 'object') {
        let obj = values.providerName
        this.$set(this.values[index], 'providerName', obj.providerName)
        this.$set(this.values[index], 'providerIndeid', obj.providerIndeid)
        this.$set(this.values[index], 'providerCode', obj.providerCode)
      } else if (this.values[index]) {
        this.$set(this.values[index], key, values[key])
      }
    },
    getHHData () {
      let params = {
        gsdm: this.$store.state.app.env.gsdm,
        dzfpjk: 'HHYZ'
      }
      getDzfpSetting(params).then(res => {
        if (res && res.status === 200) {
          res.data.map(v => {
            this.$set(this.formItem, v.paramsName, v.paramsValue)
          })
        }
      })
    },
    getTableData () {
      return getCsmpStocks({}).then(res => {
        if (res && res.status === 200) {
          this.values = res.data
          this.values.map(v => {
            v.servicename = `${v.serviceid} ${v.servicename}`
          })
        }
      })
    },
    getServicename () {
      return getAllCsmpServer().then(res => {
        if (res && res.status === 200) {
          this.fwmcArr = res.data
          this.fwmcArr.map(v => {
            v.code = v.serviceid
            v.name = v.servicename
          })
        }
      })
    }
  },
  async mounted () {
    await this.getServicename()
    this.getHHData()
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './content-bill-app.less';
</style>
