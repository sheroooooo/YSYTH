<!--
  /**
   * @description: 选择打印模板弹框
   * @author: yangtao
   * @date: 2020-03-04
   * @last modifed by: yangtao
   * @last modifed time: 2020-03-09
   */
-->
<template>
  <div ref="pdfPrint"
       :class="[`${prefixCls}`]">
    <div :class="[`${prefixCls}-mask`]"
         v-if="printing">

    </div>
    <span v-if="printing"
          :class="[`${prefixCls}-loading`]">
      <Icon type="ios-print-outline"
            size="30" /> 正在打印，请耐心等待...
    </span>
    <Layout>
      <Sider hide-trigger
             width="400">
        <vuc-datatable ref="xTable"
                       row-key="TEMPLATENAME"
                       :height="tableHeight"
                       :show-checkbox="true"
                       @on-select="handleSelect">
        </vuc-datatable>
      </Sider>
      <Content>
        <iframe ref="browserFile"
                src=""
                :class="[`${prefixCls}-browser`]"
                :style="frameStyle"></iframe>
      </Content>
    </Layout>
    <!--     <div :class="[`${prefixCls}-footer`]">
      <Row>
        <Col span="20">
        <Button type="primary"
                @click="setDefault"
                class="btn-item">设为默认</Button>
        </Col>
        <Col span="2">
        <Button type="primary"
                @click="onOk"
                class="btn-item">确定</Button>
        </Col>
        <Col span="2">
        <Button @click="onCancel"
                class="btn-item">取消</Button>
        </Col>
      </Row>
    </div> -->
  </div>
</template>
<script>
import { setDefaultTemplate, getPrintTemplate, printFile } from '@/api/pub/pdf-print'
const templateFormat = { // 模板格式
  '["B"]': '三栏式',
  '["B","S"]': '数量金额式',
  '["B","W"]': '复币式',
  '["B","W","S"]': '数量外币式'
}
export default {
  name: 'PdfPrint',
  props: {
    // 公共入参 包含 gsdm zth
    baseParams: {
      type: Object,
      default: () => { }
    },
    // 模块编码
    MODCODE: {
      type: String,
      default: ''
    },
    // 功能编码
    FUNCCODE: {
      type: String,
      default: ''
    },
    // 模板格式 三栏式[数量金额式、复币式、数量外币式] 通过格式过滤模板
    TEMPLATEFORMAT: {
      type: String,
      default: ''
    },
    // 是否凭证打印
    isPZ: {
      type: Boolean,
      default: true
    },
    // 取打印参数方法
    getPDF: Function
  },
  data () {
    return {
      prefixCls: 'pdf-print',
      filterText: '',
      filterData: [],
      tableHeight: 300,
      printing: false,
      // 表头
      columns: [
        {
          type: 'index',
          title: '序号',
          width: '40',
          fixed: 'left',
          headerAlign: 'center'
        },
        {
          title: '打印模板',
          field: 'TEMPLATENAME',
          headerAlign: 'center'
        },
        {
          title: '格式',
          field: 'TEMPLATEFORMAT',
          headerAlign: 'center',
          width: 100

        },
        /*   {
            title: '套打',
            field: 'ISTD',
            headerAlign: 'center',
            width: 80
          }, */
        {
          title: '默认',
          field: 'ISDEFAULT',
          headerAlign: 'center',
          align: 'center',
          width: 50,
          slots: {
            default: ({ row, column }, h) => {
              return [
                h('Radio', {
                  model: {
                    value: row.ISDEFAULT === '1',
                    callback (cellValue) {
                      row.ISDEFAULT = cellValue
                    }
                  },
                  on: {
                    'on-change': (val) => {
                      this.handleSetDefault(row, val)
                    }
                  }
                })
              ]
            }
          }
        }
      ],
      // 表格数据
      tableData: [],
      // 表格选中数据
      selectTableData: {}
    }
  },
  computed: {
    frameStyle () {
      return `position:relative;height:${this.tableHeight - 2}px;`
    }
  },
  methods: {
    /**
     * @description 设置默认模板
     * @param {String} TEMPLATEID 模板ID
     * @param {String} ISDEFAULT 是否默认
     * @param {String} MODCODE 模块编码
     * @param {String} FUNCCODE 功能编码
     * @param {String} GSDM 公司代码
     * @param {String} ZTH 账套号
     */
    setDefault (TEMPLATEID) {
      this.$fn.ajax(setDefaultTemplate, {
        TEMPLATEID,
        'ISDEFAULT': '1',
        MODCODE: this.MODCODE,
        FUNCCODE: this.FUNCCODE,
        GSDM: this.baseParams.GSDM,
        ZTH: this.baseParams.ZTH
      }, res => {
        if (res.status === 200) {
          this.$fn.success({ desc: '设置成功' })
          // this.getPrintTemplate() // 设置默认模板成功后重新获取模板
        }
      })
    },

    /**
     * @description: 获取打印模板
     * @param {String} MODCODE // 模块编码
     * @param {String} FUNCCODE // 功能编码
     * @param {String} GSDM // 公司代码
     * @param {String} ZTH // 账套号
     * */
    getPrintTemplate () {
      const _this = this
      this.$fn.ajax(getPrintTemplate, {
        MODCODE: this.MODCODE,
        DWFUNCCODE: this.baseParams.GSDM + this.baseParams.KJND + this.FUNCCODE,
        FUNCCODE: this.FUNCCODE,
        GSDM: this.baseParams.GSDM,
        ZTH: this.baseParams.ZTH
      }, res => {
        if (res.status === 200 && res.data) {
          if (this.TEMPLATEFORMAT !== '' && this.TEMPLATEFORMAT !== '["B"]') {
            this.tableData = res.data.filter(item => item.TEMPLATEFORMAT === templateFormat[this.TEMPLATEFORMAT])
          } else {
            this.tableData = res.data
          }
          if (this.tableData.length === 0) {
            return false
          }
          this.$refs.xTable.loadTableData(this.tableData).then(() => {
            let iDef = this.tableData.findIndex(row => row.ISDEFAULT === '1')
            iDef = iDef === -1 ? 0 : iDef
            setTimeout(() => {
              _this.$refs.xTable.setCurrentRow(_this.tableData[iDef])
              _this.handleSelect({ row: _this.tableData[iDef] })
            }, 100)
          })
        }
      })
    },

    // 单选
    async handleSelect ({ row }) {
      this.printing = true
      this.selectTableData = row
      const { GSDM, KJND, ZTH, IDPZHLIST } = this.baseParams
      // 凭证打印
      if (this.isPZ) {
        printFile({ GSDM, KJND, ZTH, IDPZHLIST, TEMPLATEID: row.TEMPLATEID }).then(res => {
          this.openBlobPDF(res)
        })
      } else {
        const pdf = await this.getPDF(row)
        this.openBlobPDF(pdf)
      }
    },
    openBlobPDF (pdf) {
      const _this = this
      if (!pdf || !pdf.size) {
        this.printing = false
      }
      let blob = new Blob([pdf])

      const blobUrl = window.URL.createObjectURL(blob)
      let url = '/pdf-viewer/web/viewer.html?file=' + blobUrl
      this.$refs.browserFile.src = url
      this.$refs.browserFile.onload = function () {
        setTimeout(() => {
          _this.printing = false
        }, 300)
      }
    },
    handleSetDefault (row, val) {
      this.tableData.map(item => {
        item.ISDEFAULT = '0'
      })
      row.ISDEFAULT = '1'
      const { TEMPLATEID } = row
      this.setDefault(TEMPLATEID)
    },
    // 确定按钮
    onOk () {
      if (Object.keys(this.selectTableData).length === 0) {
        this.$fn.warning({ desc: '请选择模板' })
        return
      }
      this.$emit('complete', this.selectTableData)
    },

    onCancel () {
      this.$emit('close')
    }
  },
  mounted () {
    // 获取表格数据
    setTimeout(() => {
      const rect = this.$refs.pdfPrint.getBoundingClientRect()
      this.tableHeight = rect.height
      this.getPrintTemplate()
      this.$refs.xTable.loadColumn(this.columns)
    }, 300)
  }
}
</script>
<style lang="less">
 @import './pdf-print.less';
</style>
