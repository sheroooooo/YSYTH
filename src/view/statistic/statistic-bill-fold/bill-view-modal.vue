<template>
  <div class="bill-view-modal">
    <!-- <vuc-toolbar :data="btns"
                  class="toolbar"
                  @click="handleVucBtnClick">
    </vuc-toolbar> -->
    <vuc-tab-card type="card">
      <div label="基本信息">
        <Form class="form-wrap"
              :label-width="120">
          <FormItem class="form-item"
                    :class="{ 'form-item-own': item.isOwn }"
                    :label="item.label"
                    v-for="item in formStructure"
                    :key="`form-item-${item.key}`">
            <Checkbox v-if="item.type === 'checkbox'"
                      disabled
                      v-model="formItem[item.key]"></Checkbox>
            <div v-else>
              <Input v-model="formItem[item.key]"
                     disabled></Input>
            </div>
          </FormItem>
        </Form>
      </div>
      <div label="票据明细"
           slot="pjmx">
        <vuc-datatable ref="xTable-pjmx"
                       row-key="XH"
                       table-id="BillViewPjmx"
                       :height="tableHeight"></vuc-datatable>
      </div>
      <div label="查验记录"
           slot="cyjl">
        <vuc-datatable ref="xTable-cyjl"
                       row-key="XH"
                       table-id="BillViewCyjl"
                       :height="tableHeight"></vuc-datatable>
      </div>
      <div label="附件"
           slot="fj">
        <vuc-datatable ref="xTable-fj"
                       row-key="XH"
                       table-id="BillViewFj"
                       :height="tableHeight"></vuc-datatable>
      </div>
    </vuc-tab-card>
  </div>
</template>

<script>
import { getFpDetail, previewFile } from '@/api/statistic/statistic-bill-fold'
import FjViewModal from './fj-view-modal'
export default {
  name: 'BillViewModal',
  data () {
    return {
      fpid: this.$route.params.fpid,
      btns: [
        { code: 'exp', text: '导出', type: 'primary' },
        { code: 'print', text: '打印' }
      ],
      formStructure: [
        { key: 'sblxz', label: '识别类型值' },
        { key: 'fpdm', label: '发票代码' },
        { key: 'fphm', label: '发票号码' },
        { key: 'kprq', label: '开票日期' },
        { key: 'jshj', label: '价税合计' },
        { key: 'hjje', label: '合计金额' },
        { key: 'sehj', label: '税额合计' },
        { key: 'jqbm', label: '机器编码' },
        { key: 'mwsj', label: '密文数据' },
        { key: 'nsrsbh', label: '购方识别号' },
        { key: 'gmfmc', label: '购方名称' },
        { key: 'xsfnsrsbh', label: '销方识别号' },
        { key: 'xsfmc', label: '销方名称' },
        { key: 'dxje', label: '大写金额' },
        { key: 'jym', label: '校验码后6位' },
        { key: 'fplx', label: '发票类型' },
        { key: 'dyfpdm', label: '打印发票代码' },
        { key: 'dyfphm', label: '打印发票号码' },
        { key: 'fplc', label: '发票连次' },
        { key: 'fpzyz', label: '是否盖章' },
        { key: 'ispublic', label: '公有票据', type: 'checkbox' },
        { key: 'gmfdzdh', label: '购方地址电话', isOwn: true },
        { key: 'gmfkhhzh', label: '购方开户行账号', isOwn: true },
        { key: 'xsfdzdh', label: '销方地址电话', isOwn: true },
        { key: 'xsfkhhzh', label: '销方开户行账号', isOwn: true }
      ],
      formItem: {
        // sblxz: '增值税普通发票'
      },
      tableHeight: 200,
      pjmxCol: [
        { field: 'rowxh', title: '序号', width: 80, headerAlign: 'center' },
        { field: 'hwmc', title: '货物名称', width: 240, headerAlign: 'center' },
        { field: 'ggxh', title: '规格型号', width: 120, headerAlign: 'center' },
        { field: 'dj', title: '单价', width: 150, headerAlign: 'center', align: 'right', formatter: this.formatMoney },
        { field: 'dw', title: '单位', width: 120, headerAlign: 'center' },
        { field: 'sl', title: '数量', width: 120, headerAlign: 'center' },
        { field: 'slv', title: '税率%', width: 120, headerAlign: 'center' },
        { field: 'se', title: '税额', width: 150, headerAlign: 'center', align: 'right', formatter: this.formatMoney },
        { field: 'je', title: '金额', 'min-width': 150, headerAlign: 'center', align: 'right', formatter: this.formatMoney }
      ],
      pjmxData: [],
      cyjlCol: [
        { type: 'index', title: '序号', width: 80, headerAlign: 'center' },
        // { field: 'cyrq', title: '查验日期', width: 120, headerAlign: 'center' },
        { field: 'checktime', title: '查验时间', width: 240, headerAlign: 'center' },
        // { field: 'cyjc', title: '查验计次', width: 120, headerAlign: 'center' },
        { field: 'checkperson', title: '查验人', width: 240, headerAlign: 'center' },
        { field: 'checkphone', title: '手机号', width: 240, headerAlign: 'center' },
        { field: 'msg', title: '查验结果', 'min-width': 240, headerAlign: 'center' }
      ],
      cyjlData: [],
      fjCol: [
        { field: 'fjxh', title: '附件序号', width: 200, headerAlign: 'center' },
        {          field: 'fjmc', title: '文件名', 'min-width': 240, headerAlign: 'center',
          slots: {
            default: ({ row, column }, h) => {
              return [<span style='color: #178cff;cursor: pointer;' type="text" onClick={() => this.clickFJMC(row)} domPropsInnerHTML={row.fjmc}></span>]
            }
          }
        },
        {          field: 'fjdx', title: '文件大小（KB）', width: 240, headerAlign: 'center', slots: {
            default: ({ row, column }, h) => {
              return [<span type="text" domPropsInnerHTML={Math.round((row.fjdx / 1024 * 100)) / 100}></span>]
            }
          }        }
      ],
      fjData: []
    }
  },
  methods: {
    // 表头处理金额
    formatMoney ({ row, rowIndex, column, columnIndex }) {
      let tmpNum = this.$utils.commafy(row[column.property], { fixed: 2 })
      if (tmpNum === '0.00') {
        return ''
      } else {
        return tmpNum
      }
    },
    dealTable (ref) {
      this.$refs[`xTable-${ref}`].loadColumn(this[`${ref}Col`])
      this.$refs[`xTable-${ref}`].loadData(this[`${ref}Data`])
    },
    handleVucBtnClick (item) {
      this[item.code]()
    },
    downloadFile (content) {
      let blob = new Blob([content])
      const fileName = `票据详情.access`
      if ('download' in document.createElement('a')) { // 非IE下载
        const elink = document.createElement('a')
        elink.download = fileName
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        URL.revokeObjectURL(elink.href) // 释放URL 对象
        document.body.removeChild(elink)
      } else { // IE10+下载
        navigator.msSaveBlob(blob, fileName)
      }
    },
    exp () {
      // let params = { fpid: this.fpid }
      // expPromise(params).then(res => {

      // })
    },
    print () {

    },
    clickFJMC (row) {
      let len = row.fjmc.length
      let lastName = row.fjmc.substr(len - 3)
      previewFile({ fjid: row.gxguid }).then(res => {
        this.$modal({
          title: '查看附件',
          resize: false,
          showFooter: false,
          width: 1200,
          zIndex: 99999,
          slots: {
            default: ({ $modal }, h) => {
              return [
                h(FjViewModal, {
                  props: {
                    lastName,
                    res
                  },
                  on: {
                    close () {
                      $modal.close()
                    },
                    complete () {
                      $modal.close()
                    }
                  }
                })
              ]
            }
          }
        })
      })
    }
  },
  mounted () {
    getFpDetail({ fpid: this.fpid }).then(res => {
      if (res && res.status === 200) {
        this.formItem = res.data.pubFp
        this.pjmxData = res.data.pubFpmxes
        this.cyjlData = res.data.csmpChecks
        this.fjData = res.data.atAttachmentinfos || []
        this.dealTable('pjmx')
        this.dealTable('cyjl')
        this.dealTable('fj')
      }
    })
  }
}
</script>

<style lang="less">
.bill-view-modal {
  .toolbar {
    text-align: right;
    padding: 8px 16px;
    background: #fff;
  }
  .form-wrap {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .form-item {
      flex-basis: 32%;
    }
    .form-item-own {
      flex-basis: 100%;
    }
  }
}
</style>
