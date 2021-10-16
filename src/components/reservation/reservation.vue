<template>
  <Modal :title='title'
         width="815px"
         :styles="{top: '20px'}"
         :scrollable="true"
         @on-cancel='onCancel'
         :mask-closable="false"
         class='resrtvation-wrap'
         v-model='showModel'>
    <div v-if="formStructData.length!==0">
      <Row>
        <Col span="21">
        <form-group :item-list='formStructData'
                    :initValueList='initValueList'
                    @on-change="formChange"
                    :label-width='labelWidth'
                    :cols='cols'
                    :showMore="true"></form-group>
        </Col>
        <Col span="3">
        <div style="position:absolute;right:40px;"
             v-if="formStructData.length!==0">
          <Button type="primary"
                  @click="search">查询</Button>
        </div>
        </Col>
      </Row>
    </div>
    <vuc-datatable ref="xTable"
                   :height="middleHeight"
                   :row-key="rowKey"
                   @on-dblclick="hadledblClick"
                   @on-select="handleCurrentChange">
    </vuc-datatable>
    <div slot="footer">
      <Button type="primary"
              size="large"
              @click="onok">确定
      </Button>
      <Button size="large"
              @click="onCancel">取消
      </Button>
    </div>
  </Modal>
</template>
<script>
import FormGroup from '_c/form/form-group'
import { getModalTableData } from '@/api/pub/table-select'
// import {
//   getReservaList,
//   reservationTableTitle,
//   getWOMTableTitle,
//   getBankTableColumns
// } from '@/api/oer/oer_bill'
// import {
//   getReadyProjectColumns,
//   getReadyProjectList,
//   getProjectColumns,
//   getProjectList
// } from '@/api/pms/pms-head-modal'
import * as XEUtils from 'xe-utils'
// import { getZbBankMessage } from '@/api/base/base-bmzy'
import tools from '@/libs/toolutil'
const formStructData = [
  {
    name: 'date',
    value: '',
    type: 'date-range',
    label: '预约日期'
  },
  {
    name: 'yydd',
    value: '',
    type: 'i-select',
    label: '预约地点',
    props: {
      dataSources: 'reservation'
    }
  }
]
const initValueList = {
  'date': [new Date().Format('yyyy-MM-dd'), new Date().Format('yyyy-MM-dd')],
  'yydd': '9999 所有地点',
  'yyddMC': '所有地点'
}
export default {
  name: 'Reservation',
  props: {
    showValue: {
      type: Boolean,
      default: false
    },
    formStructData: {
      type: Array,
      default: () => formStructData
    },
    initValueList: {
      type: Object,
      default: () => initValueList
    },
    title: {
      type: String,
      default: '预约列表'
    },
    dataSource: {
      type: String,
      default: ''
    },
    djlxid: {
      type: String,
      default: ''
    }
  },
  watch: {
    showValue (val) {
      if (val) {
        this.search()
        this.showModel = true
      }
      this.checkItem = ''
    }
  },
  components: {
    FormGroup
  },
  data () {
    let ENV = this.$route.params.ENV || {} // 单据设置增加了切换单位账套的东西
    return {
      rowKey: '"JKDJBH"',
      middleHeight: 300,
      checkItem: '',
      showModel: false,
      columns: '',
      newValueList: {},
      labelWidth: 100,
      cols: 2,
      ENV: {
        gsdm: ENV.gsdm || this.$store.getters.env.gsdm,
        kjnd: ENV.kjnd || this.$store.getters.env.kjnd,
        zth: ENV.zth || this.$store.state.app.env.zth
      }
    }
  },
  methods: {
    // 搜索条件发生改变
    formChange (val) {
      this.newValueList = { ...val }
    },
    // 表格搜索
    search () {
      let requestData = ''
      let requestTitle = ''
      let common = {
        gsdm: this.ENV.gsdm,
        kjnd: this.ENV.kjnd,
        zth: this.ENV.zth,
        djlxid: this.djlxid
      }
      if (this.dataSource === '300') {
        let { whje, date, bmdm, grdm, ...other } = this.newValueList
        let data = {
          ...common,
          ...other,
          name: 'wob',
          beginDjdate: date[0] ? date[0].replace(/-/g, '') : '',
          endDjdate: date[1] ? date[1].replace(/-/g, '') : '',
          beginWhje: whje && (whje[0] || whje[0] === 0) ? whje[0].toFixed(2) : '',
          endWhje: whje && (whje[1] || whje[1] === 0) ? whje[1].toFixed(2) : '',
          czyId: tools.getLocal('userCode')
        }
        data.bmdm = bmdm ? bmdm.split(' ')[0] : ''
        data.grdm = grdm ? grdm.split(' ')[0] : ''
        requestTitle = this.columns ? new Promise((resolve) => resolve(this.columns)) : getWOMTableTitle(common)
        requestData = getModalTableData(data)
      } else if (this.dataSource === '200') {
        requestTitle = this.columns ? new Promise((resolve) => resolve(this.columns)) : getProjectColumns()
        requestData = getProjectList(common)
      } else if (this.dataSource === '100') {
        requestTitle = this.columns ? new Promise((resolve) => resolve(this.columns)) : getReadyProjectColumns()
        requestData = getReadyProjectList(common)
      } else if (this.dataSource === '101') { // 银行卡号
        requestTitle = this.columns ? new Promise((resolve) => resolve(this.columns)) : getBankTableColumns()
        requestData = getZbBankMessage({ GSDM: common.gsdm, KJND: common.kjnd, UNFROZEN: '1' })
      } else {
        let { date, ...other } = this.newValueList
        requestTitle = this.columns ? new Promise((resolve) => resolve(this.columns)) : reservationTableTitle()
        requestData = getReservaList({
          gsdm: this.ENV.gsdm,
          kjnd: this.ENV.kjnd,
          ...other,
          beginYyrq: date[0] ? date[0].replace(/-/g, '') : '',
          yydd: other.yyddMC,
          endYyrq: date[1] ? date[1].replace(/-/g, '') : ''
        })
      }
      const _this = this
      Promise.all([requestTitle, requestData]).then(resGroup => {
        this.columns = this.getTableTitle(resGroup[0].data)
        // 预约地点前端过滤筛选
        let tableData = []
        if (_this.newValueList.hasOwnProperty('yydd')) {
          let yydd = _this.newValueList.yydd.split(' ')[1]
          yydd !== '所有地点' // 预约地点筛选
            ? tableData = resGroup[1].data.filter(item => item.YYDD === yydd)
            : tableData = resGroup[1].data
          let beginDate = _this.newValueList.date[0].replace(/-/g, '')
          let endDate = _this.newValueList.date[1].replace(/-/g, '')
          tableData = tableData.filter(item => item.YYRQ >= beginDate && item.YYRQ <= endDate) // 预约日期过滤
        } else {
          tableData = resGroup[1].data
        }
        // this.$refs.xTable.loadColumn(resGroup[1].data)
        this.$refs.xTable.loadColumn(this.setColumnData(this.columns))
        this.$refs.xTable.loadData(tableData)
        this.$refs.xTable.updatePagerInfo()
      })
    },
    setColumnData (column) {
      for (let i = 0; i < column.length; i++) {
        column[i].headerAlign = 'center'
        if (column[i].field === 'SYED') {
          column[i].align = 'right'
        } else if (column[i].title === '序号') {
          column[i].align = 'center'
        }
      }
      return column
    },
    getTableTitle (data) {
      if (this.columns) return this.columns
      let columns = []
      if (this.dataSource === '300' || this.dataSource === '200' || this.dataSource === '100') {
        data = JSON.parse(JSON.stringify(data).replace(/field/g, 'title').replace(/key/g, 'field'))
        columns = this.setColumnsData(data)
      } else {
        columns = tools.dealColumns([...data], '120')
      }
      columns.unshift(
        { type: 'index', title: '序号', width: '50', fixed: 'left', headerAlign: 'center', align: 'center' }
      )
      return columns
    },
    setColumnsData (columnList) {
      let moneyKey = ['JKJE', 'JKYHJE', 'JKZBJE', 'JKZBYHJE']
      let timeKey = ['JKDJRQ']
      for (let i = 0, len = columnList.length; i < len; i++) {
        if (columnList[i].type !== 'index') {
          columnList[i].headerAlign = 'center'
          columnList[i].minWidth = '120'
          if (columnList[i].children) {
            columnList[i].children = this.setColumnsData(columnList[i].children)
          }
          if (moneyKey.includes(columnList[i].field)) {
            columnList[i].align = 'right'
            columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
              return XEUtils.commafy(row[column.property], { fixed: 2 })
            }
          } else if (timeKey.includes(columnList[i].field)) {
            columnList[i].align = 'right'
            columnList[i].formatter = ({ row, rowIndex, column, columnIndex }) => {
              if (row[column.property]) {
                return tools.dealDate(row[column.property], 'yyyy-MM-dd')
              }
              return row[column.property] || ''
            }
          }
        }
      }
      return columnList
    },
    // 勾选发生变化的时候
    handleCurrentChange ({ row }) {
      this.checkItem = row
      this.$emit('on-select', this.checkItem)
    },
    hadledblClick ({ row }) {
      this.handleCurrentChange({ row })
      this.onok()
    },
    onok () {
      if (!this.checkItem && !this.dataSources) {
        this.$fn.error({ title: '错误提示', desc: '请选择数据' })
        return false
      }
      if (!this.dataSources) {
        this.showModel = false
      }
      this.$emit('on-ok', this.checkItem)
    },
    onCancel () {
      this.checkList = []
      this.showModel = false
      this.$emit('on-cancel')
    }
  }
}
</script>
<style lang="less">
.resrtvation-wrap{
  .ivu-modal .ivu-modal-content .ivu-modal-footer{
    background: #fff
  }
}
</style>
