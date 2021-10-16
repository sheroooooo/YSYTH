<template>
  <div ref="drawerSplit"
       :class="[`${prefixCls}`]">
    <Split v-model="splitSiderWidth"
           min="400"
           max="450">
      <div slot="left">
        <vuc-tree ref="xtree"
                  id-field="FLH"
                  text-field="DMMC"
                  :show-checkbox=false
                  show-toolbar
                  :expand="1"
                  row-key='FLH'
                  :height="splitHeight+8"
                  @on-set-current-row="handleSelectChange"
                  @on-dblclick="hadleTreedblClick"
                  @on-select="handleSelectChange"></vuc-tree>
      </div>
      <div slot="right">
        <vuc-datatable ref="xTable"
                       :show-checkbox=false
                       :show-toolbar="false"
                       :show-pager="false"
                       row-key='KMDM'
                       :height="splitHeight"
                       :span-method="rowspanMethod"
                       @on-select="handleSelect">
        </vuc-datatable>
      </div>
    </Split>
    <div :class="[`${prefixCls}-footer`]">
      <Checkbox label="1"
                v-model="showSYS">
        显示系统级模板
      </Checkbox>
      <Checkbox label="1"
                v-model="showKMXZ">
        显示会计要素分类
      </Checkbox>
      <Checkbox label="1"
                v-model="appendTo">
        追加模板分录到当前凭证
      </Checkbox>
      <vuc-button type="primary"
                  size="small"
                  :class="[`${prefixCls}-footer-button`]"
                  @click="handleOkClick">确定</vuc-button>
      <vuc-button size="small"
                  :class="[`${prefixCls}-footer-button`]"
                  @click="handleCancelClick">取消</vuc-button>
    </div>
  </div>
</template>

<script>
import { getVoucTemplets, getVoucTempletDetial } from '@/api/gl/voucher'
export default {
  name: 'VoucDrawerPzmb',
  props: {
    baseParams: {
      type: Object,
      default: () => { }
    },
    showPzmbDrawer: {
      type: Boolean,
      default: false
    },
    checkboxStatus: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      prefixCls: 'page-doule-table-szywmb',
      // 左侧宽度
      splitSiderWidth: 0.30,
      splitHeight: 500,
      singleCols: [
        {
          field: 'FLH',
          title: '编号',
          headerAlign: 'center',
          width: 100
        },
        {
          field: 'ZY',
          title: '摘要',
          headerAlign: 'center',
          minWidth: 120
        },
        {
          field: 'cw_JD',
          title: '方向',
          headerAlign: 'center',
          align: 'center',
          width: 60
        },
        {
          field: 'cw_KMDMMC',
          title: '会计科目',
          headerAlign: 'center',
          minWidth: 200
        }
      ],
      // 双凭证列
      doubleCols: [
        {
          field: 'FLH',
          title: '编号',
          headerAlign: 'center',
          width: 100
        },
        {
          field: 'ZY',
          title: '摘要',
          headerAlign: 'center',
          minWidth: 120
        },
        {
          title: '财务会计',
          field: 'cw',
          headerAlign: 'center',
          children: [

            {
              field: 'cw_JD',
              title: '方向',
              headerAlign: 'center',
              align: 'center',
              width: 60
            },
            {
              field: 'cw_KMDMMC',
              title: '会计科目',
              headerAlign: 'center',
              minWidth: 200
            }
          ]
        },
        {
          title: '预算会计',
          field: 'ys',
          headerAlign: 'center',
          children: [
            {
              field: 'ys_JD',
              title: '方向',
              headerAlign: 'center',
              align: 'center',
              width: 60
            },
            {
              field: 'ys_KMDMMC',
              title: '会计科目',
              headerAlign: 'center',
              minWidth: 200
            }
          ]
        }],
      // 是否需要录入
      curTemp: {},
      // 缓存数据，减少请求
      cacheTempData: {},
      // 第一次显示时刷新树
      isFirstShow: 0,
      showKMXZ: true,
      showSYS: true,
      appendTo: false,
      isDouble: true,
      mbData: '',
      FUNCTIONLEVEL: '',
      FLH: ''
    }
  },
  computed: {
    isShow () {
      return this.showPzmbDrawer
    }
  },
  watch: {
    isShow () {
      if (this.showPzmbDrawer && this.isFirstShow === 0) {
        this.isFirstShow = this.isFirstShow + 1
        this.setSplitHeight()
        setTimeout(() => {
          this.getVoucTemplets()
        }, 300)
      }
    },
    checkboxStatus: {
      handler (val) {
        const { showSYS, showKMXZ, appendTo } = val
        this.showSYS = showSYS
        this.showKMXZ = showKMXZ
        this.appendTo = appendTo
      },
      deep: true,
      immediate: true
    },
    showKMXZ () {
      const flag = this.getFlag()
      let tableData = this.cacheTempData[`${flag}${this.showKMXZ ? '1' : '0'}`]
      if (tableData && tableData.length > 0) {
        this.showTree()
        // this.$refs.xtree.loadData(this.showSYS ? tableData : [{ DMMC: tableData[0].DMMC, children: [this.$utils.clone(tableData[0].children[1], true)] }])
      } else {
        this.getVoucTemplets()
      }
    },
    showSYS () {
      this.showTree()
      // const flag = this.getFlag()
      // let tableData = this.cacheTempData[`${flag}${this.showKMXZ ? '1' : '0'}`]
      // this.$refs.xtree.loadData(this.showSYS ? tableData : [{ DMMC: tableData[0].DMMC, children: [this.$utils.clone(tableData[0].children[1], true)] }])
    }
  },
  methods: {
    handleCancelClick () {
      this.$emit('close', this.showSYS, this.showKMXZ, this.appendTo)
    },
    handleOkClick () {
      // const { GSDM, ZTH, KJND, DWLXDM, KJQJ } = this.baseParams
      const { FUNCTIONLEVEL } = this.curTemp
      if (!FUNCTIONLEVEL) {
        this.$fn.info('请选择模板')
        return false
      }
      // if (flag) {
      //   VOUCHERINPUT = '0'
      // }
      // getVoucOfTemplet({ GSDM, ZTH, KJND, DWLXDM, FLH, KJQJ, FUNCTIONLEVEL, VOUCHERINPUT }).then(res => {
      //   if (res) {
      //     this.root.serverDataToVouc(res.data, this.appendTo)
      //     this.root.vouc.ZT = -1
      //     this.root.vouc.ACTION = 'T'
      //     this.showPzmbDrawer = false
      //   }
      // })
      this.$emit('complete', this.mbData, this.showSYS, this.showKMXZ, this.appendTo)
    },
    handleSelectChange ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      if (row.hasOwnProperty('children')) {
        // this.$fn.info('请选择模板')
        return false
      }
      if (row.FLH === this.FLH) {
        return false
      }
      this.getVoucTempletDetial(row)
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      // if (this.FUNCTIONLEVEL === '1') {
      //   row.ZY === undefined ? this.mbData = `${row.FLH} []` : this.mbData = `${row.FLH} [${row.ZY}]`
      // } else if (this.FUNCTIONLEVEL === '0') {
      //   row.ZY === undefined ? this.mbData = `${row.FLH},SYS []` : this.mbData = `${row.FLH},SYS [${row.ZY}]`
      // }
    },
    hadleTreedblClick () {
      setTimeout(() => {
        this.handleOkClick()
      }, 600)
    },
    rowspanMethod ({ row, $rowIndex, column, data }) {
      let fields = ['FLH']
      let cellValue = row[column.property]
      if (cellValue && fields.includes(column.property)) {
        let prevRow = data[$rowIndex - 1]
        let nextRow = data[$rowIndex + 1]
        if (prevRow && prevRow[column.property] === cellValue) {
          return { rowspan: 0, colspan: 0 }
        } else {
          let countRowspan = 1
          while (nextRow && nextRow[column.property] === cellValue) {
            nextRow = data[++countRowspan + $rowIndex]
          }
          if (countRowspan > 1) {
            return { rowspan: countRowspan, colspan: 1 }
          }
        }
      }
    },
    // //////////////////
    setSplitHeight () {
      let rect = this.$refs.drawerSplit.getBoundingClientRect()
      let height = rect.height
      this.splitHeight = height
    },
    getFlag () {
      const { GSDM, ZTH, KJND } = this.baseParams
      const flag = `${GSDM}_${ZTH}_${KJND}`
      return flag
    },
    // ///////////////////
    showTree () {
      const flag = this.getFlag()
      let tableData = this.cacheTempData[`${flag}${this.showKMXZ ? '1' : '0'}`]
      this.$refs.xtree.loadData(this.showSYS ? tableData : [{ DMMC: tableData[0].DMMC, children: [this.$utils.clone(tableData[0].children[1], true)] }])
    },
    // 取凭证模板
    getVoucTemplets () {
      const { GSDM, ZTH, KJND, DWLXDM } = this.baseParams
      this.$fn.ajax(getVoucTemplets, { GSDM, ZTH, KJND, DWLXDM, ISCHILDREN: this.showKMXZ ? '1' : '0' }, res => {
        const flag = this.getFlag()
        this.cacheTempData[this.showKMXZ ? `${flag}1` : `${flag}0`] = this.$utils.clone([res.data], true)
        // this.$refs.xtree.loadData([res.data])
        this.showTree()
      })
    },
    // 取模板内容
    getVoucTempletDetial (rowData) {
      this.curTemp = rowData
      const { GSDM, ZTH, KJND } = this.baseParams
      let { FLH, FUNCTIONLEVEL } = rowData
      FUNCTIONLEVEL = FUNCTIONLEVEL || '1'
      this.FUNCTIONLEVEL = FUNCTIONLEVEL
      this.$fn.ajax(getVoucTempletDetial, { GSDM, ZTH, KJND, FLH, FUNCTIONLEVEL }, res => {
        this.FLH = res.data.FLH
        if (this.FUNCTIONLEVEL === '1') {
          res.data.ZY === undefined ? this.mbData = `${res.data.FLH} []` : this.mbData = `${res.data.FLH} [${res.data.ZY}]`
        } else if (this.FUNCTIONLEVEL === '0') {
          res.data.ZY === undefined ? this.mbData = `${res.data.FLH},SYS []` : this.mbData = `${res.data.FLH},SYS [${res.data.ZY}]`
        }
        this.templetDataToTable(res.data)
      })
    },
    // 内容转为凭证数据
    templetDataToTable (tmpData) {
      if (!tmpData) {
        this.$refs.xTable.loadData([])
        return false
      }

      const { FLH, ZY, CWFL, YSFL } = tmpData
      const cwSize = CWFL.length
      const ysSize = YSFL.length
      const size = cwSize > ysSize ? cwSize : ysSize
      function transRow (row, type) {
        let tmpRow = {}
        tmpRow[`${type}_JD`] = row.JD
        tmpRow[`${type}_KMDMMC`] = row.KMDMMC
        return tmpRow
      }
      let tableData = []
      for (let i = 0; i < size; i++) {
        let cwRow = {}
        let ysRow = {}
        if (i < cwSize) {
          cwRow = transRow(CWFL[i], 'cw')
        }
        if (i < ysSize) {
          ysRow = transRow(YSFL[i], 'ys')
        }
        const newRow = { FLH, ZY, ...cwRow, ...ysRow }
        tableData.push(newRow)
      }
      this.$refs.xTable.loadData(tableData)
    }
  },
  mounted () {
    this.getVoucTemplets()
    this.$refs.xTable.loadColumn(this.isDouble ? this.doubleCols : this.singleCols)
  },
  beforeDestroy () {
    this.$emit('close', this.showSYS, this.showKMXZ, this.appendTo)
  }
}
</script>

<style lang="less">
@import './page-double-table-szywmb.less';
</style>
