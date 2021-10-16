<template>
  <div class="customer-group-set">
    <div class="customer-group-set-body">
      <Form ref="formInfo"
            :label-width="130"
            class="form-wrap"
            :model="formItem"
            :rules="rules">
        <FormItem class="form-item form-item-own"
                  label="单位组名称"
                  prop="name">
          <Input v-model="formItem.name" />
        </FormItem>
        <FormItem class="form-item form-item-own"
                  label="备注"
                  prop="remark">
          <Input v-model="formItem.remark" type="textarea" />
        </FormItem>
      </Form>
      <vuc-datatable ref="xTable"
                     row-key="customerCode"
                     table-id="UsersCustomerGroup"
                     :show-toolbar="false"
                     :show-pager="false"
                     :height="300"
                     @on-checked="handleChecked">
      </vuc-datatable>
      <table-page :total="total"
                  @on-change="handlePageChange"
                  @on-page-size-change="handlePageSizeChange"></table-page>
    </div>
    <modal-footer @handle-ok="handleOk" @handle-cancel="handleCancel" ok-text="保存"></modal-footer>
  </div>
</template>

<script>
import ModalFooter from '_c/modal-footer'
import TablePage from '_c/table-page'
import { getAllCustomers, getCsmpGroupByGroupId, saveCsmpGroup, updateCsmpGroup } from '@/api/users/users-customer-group'
export default {
  name: 'CustomerGroupSet',
  components: { ModalFooter, TablePage },
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
    return {
      total: 0,
      pageNum: 1,
      pageSize: 50,
      formItem: {},
      rules: {
        name: [{ required: true, message: '单位组名称不能为空', trigger: 'blur' }]
      },
      column: [
        { type: 'selection', title: ' ', width: '40', fixed: 'left' },
        { title: '单位代码', field: 'customerCode', headerAlign: 'center', 'min-width': 120 },
        { title: '单位名称', field: 'customerName', headerAlign: 'center', 'min-width': 120 },
        { title: '备注', field: 'bz', headerAlign: 'center', 'min-width': 120 }
      ],
      tableData: [],
      checkData: []
    }
  },
  methods: {
    handlePageChange (page) {
      this.pageNum = page
      this.getTableData()
    },
    handlePageSizeChange (size) {
      this.pageSize = size
      this.getTableData()
    },
    dealTable () {
      this.$refs.xTable.loadColumn(this.column)
      this.$refs.xTable.loadData(this.tableData)
    },
    handleChecked ({ checked, row }) {
      let index = this.checkData.findIndex(v => v.customerCode === row.customerCode)
      if (checked) {
        this.checkData.push(row)
      } else {
        this.checkData.splice(index, 1)
      }
    },
    getTableData () {
      getAllCustomers().then(res => {
        this.tableData = res.data.list
        this.total = res.data.total
        this.dealTable()
        this.dealCheckData()
      })
    },
    // 选中数据打勾
    dealCheckData () {
      this.checkData.map(v => {
        this.$refs.xTable.setRowsChecked(item => item.customerCode === v.customerCode, true)
      })
    },
    handleOk () {
      if (this.checkData.length === 0) {
        this.$fn.warning({ desc: '请选择单位' })
        return
      }
      this.$refs.formInfo.validate(valid => {
        if (valid) {
          let params = { ...this.formItem }
          let arr = this.$utils.clone(this.checkData, true)
          params.customerIndeids = arr.map(v => v.customerIndeid)
          if (this.actionFlag === 'S') {
            saveCsmpGroup(params).then(res => {
              if (res && res.status ===200) {
                this.$fn.success({ desc: '保存单位组成功' })
                this.$emit('complete')
              }
            })
          } else {
            params.groupId = this.row.groupId
            updateCsmpGroup(params).then(res => {
              if (res && res.status === 200) {
                this.$fn.success({ desc: '修改单位组成功' })
                this.$emit('complete')
              }
            })
          }
        }
      })
    },
    handleCancel () {
      this.$emit('close')
    }
  },
  async mounted () {
    if (this.actionFlag === 'M') {
      await getCsmpGroupByGroupId({ groupId: this.row.groupId }).then(res => {
        if (res && res.status === 200) {
          this.checkData = res.data.customers
          this.$set(this.formItem, 'name', res.data.name)
          this.$set(this.formItem, 'remark', res.data.remark)
        }
      })
    }
    this.getTableData()
  }
}
</script>

<style lang="less">
@import './users-customer-group.less';
</style>
