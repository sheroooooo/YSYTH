<template>
  <div class="multi-percent-table">
    <Input readonly
            :disabled='disabled'
            v-model.trim="initValue"
            @click.native="handleBtnClick"
            @mouseover.native="showClearIcon = initValue !== ''"
            @mouseout.native="showClearIcon = false">
      <Icon type="ios-more"
            slot="suffix"
            v-if="!showClearIcon" />
      <Icon type="ios-close-circle"
            slot="suffix"
            v-else
            @click.stop="handleBtnClear" />
    </Input>
    <vxe-modal v-model="showModal"
               :title="`选择${title}`"
               width="520"
               :resize="false"
               :mask="false"
               :showFooter="false">
      <div class="multi-percent-table multi-modal">
        <vuc-toolbar type="default"
                    :data="btns"
                    :border="false"
                    @click="handleVucBtnClick">
        </vuc-toolbar>
        <div v-show="itemKey === 'DZJBZ' || isZJLY"
            style="position: absolute;top: 16px;left: 192px;">原值：{{yzje}}{{yzIsChange ? `;修改后原值：${newYz}` : ''}}</div>
        <vuc-datatable ref="multiPerTable"
                      style="margin-top:16px;"
                      :editable="tableEditable"
                      row-key="xh"
                      @on-select="handleSelect"
                      table-id="percent-table-modal"
                      :height="250">
        </vuc-datatable>
        <div class="footer">
          <vxe-button type="primary"
                      @click="handleOk"
                      :disabled="!tableEditable"
                      class="footer-btn">确认</vxe-button>
          <vxe-button type="default"
                      @click="handleCancel"
                      class="footer-btn">取消</vxe-button>
        </div>
      </div>
    </vxe-modal>
  </div>
</template>

<script>
import { getFZXSelect } from '@/api/base/public'
import modalAction from './modal-action'
export default {
  name: 'MultiPercentTable',
  props: {
    value: {
      type: String,
      default: ''
    },
    dataSource: {
      type: String,
      default: ''
    },
    title: {
      type: String, // 弹出框标头
      default: ''
    },
    itemKey: { // key 区分获取表格数据接口
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    parentData: {
      type: Object,
      default: () => { }
    },
    isZJLY: {
      type: Boolean,
      default: false
    },
    // 原值是否可变
    yzIsChange: {
      type: Number,
      default: 0
    }
  },
  mixins: [ modalAction ],
  data () {
    let ENV = this.$route.params.ENV || {}
    return {
      gsdm: ENV.gsdm || this.$store.getters.env.gsdm,
      kjnd: ENV.kjnd || this.$store.getters.env.kjnd,
      zth: ENV.zth || this.$store.getters.env.zth,
      initValue: this.value,
      initParent: this.parentData,
      // 输入框数据
      showClearIcon: false,
      showModal: false,
      // 弹框内数据
      fzxData: [],
      btns: [
        { code: 'add', text: '新增行' },
        { code: 'del', text: '删除行' }
      ],
      tableData: [
        { per: 100 }
      ],
      columns: [],
      curSelectIndex: -1,
      yz: 0,
      beforeSaveYz: 0,
      tableEditable: true
    }
  },
  computed: {
    yzje () {
      return this.$utils.commafy(this.yz, { fixed: 2 })
    },
    newYz () {
      return this.$utils.commafy(this.tableData.reduce((t, v) => t + v.yz * 1, 0), { fixed: 2 })
    }
  },
  watch: {
    value: {
      deep: true,
      handler (val) {
        this.initValue = val
      }
    },
    parentData: {
      deep: true,
      handler (val) {
        this.initParent = val
      }
    },
    showModal (val) {
      if (val) {
        if (this.itemKey === 'DZJBZ' && this.parentData.YZ * 1 === 0) {
          this.$fn.warning({ desc: '请先输入原值' })
          this.tableEditable = false
        } else {
          this.tableEditable = true
        }
        this.initData()
        this.setCol()
      }
    }
  },
  methods: {
    handleBtnClick () {
      this.showModal = true
    },
    handleBtnClear () {
      this.$emit('on-change', '', [])
    },
    handleVucBtnClick (item) {
      this[item.code]()
    }
  },
  async mounted () {
    let params = {
      gsdm: this.gsdm,
      kjnd: this.kjnd,
      sjly: this.dataSource
    }
    await getFZXSelect(params).then(res => {
      this.fzxData = res.data
      this.fzxData.map(v => {
        v.value = v.title
        v.label = v.title
      })
    })
  }
}
</script>

<style lang="less">
@import './multi-percent-table.less';
</style>
