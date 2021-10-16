<template>
  <div class="app-env">
    <Modal v-model="modal"
           width=1000
           title="设置工作环境"
           :z-index='50'
           @on-ok="handleOkClick"
           @on-cancel="hanleCancelClick">
      <Layout>
        <Header>
          <Row>
            <Col span=10>
              <Input v-model="filterText"
                    placeholder="请输入单位账套的编码或名称"
                    style="width: 300px">
                <Button slot="append"
                        id='apt-env-search-button'>
                  <Icon type="ios-search"
                        size=16></Icon>
                </Button>
              </Input>
            </Col>
            <Col span=10>
              <span style="display:inline-block;margin-right:5px;">业务日期</span>
              <DatePicker type="date"
                          placeholder="请选择业务日期"
                          style="width: 200px"
                          :value="env.loginDate"
                          @on-change="onDateChange">
              </DatePicker>
            </Col>
          </Row>
        </Header>
        <Content class="no-select pt10">
          <vuc-datatable ref="xTable"
                         row-key='ZTBM'
                         @on-select="onRowClick"
                         @on-dblclick="onRowDblClick"
                         :height="300">
        </vuc-datatable>
        </Content>
      </Layout>
    </Modal>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from 'vuex'
import './app-env.less'
import { getDWZT } from '@/api/app'
import tools from '@/libs/toolutil'
import { getToken } from '@/libs/util'
const columns = [
  {
    title: '单位编码',
    field: 'DWBM',
    headerAlign: 'center',
    align: 'left'
  },
  {
    title: '单位名称',
    field: 'DWMC',
    minWidth: 150,
    headerAlign: 'center',
    align: 'left'
  },
  {
    title: '账套代码',
    field: 'ZTBM',
    width: 80,
    headerAlign: 'center',
    align: 'left'
  },
  {
    title: '账套名称',
    field: 'ZTMC',
    headerAlign: 'center',
    align: 'left',
    minWidth: 150
  },
  {
    title: '启用日期',
    field: 'QYQJ',
    headerAlign: 'center',
    align: 'left',
    width: 100
  },
  {
    title: '账套主管',
    field: 'ZTZG',
    headerAlign: 'center',
    align: 'left',
    width: 100
  },
  {
    title: '账套属性',
    headerAlign: 'center',
    align: 'left',
    field: 'ZTSX'
  }
]
export default {
  name: 'AppEnv',
  props: {
    settingModal: { // 模态 框显示隐藏
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      env: {},
      tmpEnv: {},
      columns: columns,
      data: [],
      filterText: '',
      filterData: []
    }
  },
  computed: {
    modal: {
      get: function () {
        this.setTableData()
        return this.settingModal
      },
      set: function (val) {
        this.$emit('modal-change', val)
      }
    },
    ...mapGetters({
      storeEnv: 'env'
    })
  },
  watch: {
    filterText () {
      if (this.filterText === '') {
        this.filterData = Object.assign([], this.data)
      } else {
        this.filterData = this.data.filter(item => JSON.stringify(item).indexOf(this.filterText) > -1)
      }
      this.$refs.xTable.loadData(this.filterData)
    },
    env () {
      this.showEnv()
    },
    settingModal () {
      if (this.settingModal) {
        this.tmpEnv = this.$utils.clone(this.$store.getters.env, true)
      }
    }
  },
  methods: {
    ...mapMutations(['setLoginDate', 'setUserName', 'setUserCode']),
    ...mapActions(['updateEnv', 'handleGetExternalEnv']),
    rowClassName (row, index) {
      if (row.DWBM === tools.getLocal('gsdm') && row.ZTBM === tools.getLocal('zth')) {
        return 'ivu-table-row-highlight'
      }
      return ''
    },
    showEnv () {
      this.env.loginDate = this.env.loginDate === '' ? '请选择业务日期' : this.env.loginDate
      this.env.gsmc = this.env.gsmc === '' ? '请选择单位' : this.env.gsmc
    },
    handleOkClick () {
      if (!this.tmpEnv.zth) {
        this.$fn.info({ desc: '您还没有设置账套号，一些模块将无法正常使用，请登录后进行设置。' })
      }
      this.$store.dispatch('updateEnv', this.tmpEnv)
      this.modal = false
    },
    hanleCancelClick () { this.modal = false },
    onRowClick ({ row, rowIndex: index }) {
      console.log(row)
      console.log(index)
      this.tmpEnv.gsdm = row.DWBM
      this.tmpEnv.gsmc = row.DWMC
      if (row.ZTBM) {
        this.tmpEnv.ztmc = row.ZTMC
        this.tmpEnv.zth = row.ZTBM
      } else {
        this.tmpEnv.ztmc = ''
        this.tmpEnv.zth = ''
        localStorage.setItem('ztmc', '')
        localStorage.setItem('zth', '')
      }
    },
    onRowDblClick ({ row, rowIndex }) {
      this.onRowClick({ row, rowIndex })
      this.handleOkClick()
    },
    onDateChange (date) {
      const kjnd = date.substr(0, 4)
      if (this.tmpEnv.kjnd !== kjnd) {
        this.tmpEnv.kjnd = kjnd
        this.setTableData()
      }
      this.tmpEnv.loginDate = date
    },
    setTableData () {
      this.filterText = ''
      if (this.tmpEnv.kjnd === '') {
        this.tmpEnv.kjnd = new Date().getFullYear().toString()
      }
      getDWZT({ kjnd: this.tmpEnv.kjnd }).then(res => {
        this.data = res.data
        this.filterData = Object.assign([], this.data)
        this.$refs.xTable.loadColumn(this.columns)
        this.$refs.xTable.loadData(this.filterData)
      }).catch(err => {
        console.log(err)
      })
    }
  },
  created () {
    this.env = this.$store.getters.env || {}
    const loginDate = this.$store.getters.env.loginDate
    this.env.loginDate = loginDate
    this.tmpEnv = Object.assign({}, this.env)
  },
  mounted () {
    this.setTableData()
    if (getToken() === 'external') {
      this.handleGetExternalEnv().then(
        res => {
          let { gsdm, zth, expireTime, userName, u8Url, cruxCookie, czycode } = res.data
          tools.setSession('CSPath', u8Url)
          tools.setSession('cruxCookie', cruxCookie)
          this.$store.commit('setUserName', userName)
          this.$store.commit('setUserCode', czycode)
          const gsmc = this.$store.getters.env.gsmc
          if (gsdm === '') {
            this.modal = true
          } else {
            let loginDate = (new Date()).Format('yyyy-MM-dd')
            this.$store.dispatch('updateEnv', { gsdm, gsmc, zth, expireTime, loginDate })
          }
        }
      )
    } else if (this.$store.getters.env.gsmc === '') {
      this.modal = true
    }
  }
}
</script>
<style>
  .no-select table {
    width: 100% !important;
  }
  #apt-env-search-button {
    line-height: 1;
  }
</style>
