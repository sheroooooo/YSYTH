<template>
  <div class="bill-modal">
    <page-header v-if="headerButtons.length>0"
                 :data="headerButtons"
                 :prams='logPost'
                 :workflowType='workflowType'
                 @on-header-toolbar-click="handelButtonCilck"></page-header>
    <slot name="prefix"></slot>
    <generate-form ref="generateForm"
                   :editable="editable"
                   :bill-id="billId"
                   :showUploadFile="showUploadFile"
                   :base-params="baseParams"
                   :img-id="imgId"
                   :kp-flag="kpFlag"
                   @on-change='formChange'
                   @on-delete="(el, index) => {$emit('on-delete', el, index)}"
                   @on-table-btn-click="handleTableBtnClick"
                   @handle-scroll-to="handleScrollTo"
                   @upload-file="handleUploadFile"></generate-form>
    <slot></slot>
    <!--底部工具栏-->
    <page-footer v-if="footerButtons.length>0"
                 :data="footerButtons"
                 :class="kpBillClass"
                 @on-footer-toolbar-click="handelButtonCilck"></page-footer>

    <!-- 平台工作流审核、组件 -->
    <template v-if="workflowType">
      <!-- 流程跟踪 -->
      <Drawer title="流程跟踪"
              :closable="false"
              v-model="Drawer">
        <template v-if="Drawer">
          <workflow-trace-full ref="workflowFull"
                               iconStyle="simple"
                               :visible="workflowFull"
                               direction="vertical"
                               :options="workflowcheckOptions" />
        </template>
      </Drawer>
    </template>
    <!-- 新附件 -->
    <template v-show="showUploadFile">
      <div class="bill-modal-drawer"
           v-show="showUploaderDrawer">
        <Drawer v-model="showUploaderDrawer"
                width="100%"
                :inner="true"
                :transfer="false"
                :closable="true"
                :styles="{padding:'0px 8px',margin:'0px',height:`${drawerHeight}px`}">
          <div slot="header">
            <Icon custom="icon-joint-search"
                  :size="18"
                  style="margin-right:5px"></Icon>
            <b>附件管理</b>
          </div>
          <vuc-uploader ref="xUploader"
                        :file-class="fileClass"
                        upload-path="/pub/fileOpertion/upload"
                        download-path="/pub/fileOpertion/download"
                        del-file-path="/pub/fileOpertion/delete"
                        file-list-path="/pub/fileOpertion/getFileList"
                        update-file-path="/pub/fileOpertion/updateAccessoryNameAndType"
                        :headers="headers"
                        :showMobile="showMobile"
                        :before-action-method='beforeActionMethod'
                        :params="getUploadParams"
                        :editable="editable">
            <Button v-if="baseParams.QYDZPJ"
                    slot="toolbar"
                    size="small"
                    @click="handleFpClick">电子票据</Button>
          </vuc-uploader>
        </Drawer>
        <Drawer v-model="showFpDrawer"
                v-if="baseParams.QYDZPJ"
                width="100%"
                :closable="true"
                :inner="true"
                :transfer="false"
                :styles="{padding:'0px 8px',margin:'0px',height:`${drawerHeight}px`}">
          <div slot="header"
               v-if='showElectBill'>
            <Icon custom="icon-joint-search"
                  :size="18"
                  style="margin-right:5px"></Icon>
            <b>电子票据</b>
          </div>
          <elec-bill-page :baseParams="baseParams"
                          v-if="baseParams.QYDZPJ"
                          :isShowDrawer="showFpDrawer"
                          :editable="editable"
                          :save-success="saveSuccess"
                          :mlid="mlid"
                          :operateFlag="elecOperateFlag"
                          :isCancel="isCancel"
                          @get-usedFp="getUsedFp"
                          @operate-success="handleEventSuccess"
                          @cancel-success="handleBillCancel"
                          @getPJTemplateSuccess="(fpMap, ievData) => $emit('getPJTemplateSuccess', fpMap, ievData)">
          </elec-bill-page>
        </Drawer>
      </div>

    </template>
  </div>
</template>
<script>
import PageHeader from '_c/page/page-header'
import PageFooter from '_c/page/page-footer'
import GenerateForm from '@/view/pub/bill-design/generate-form'
import mixin from '@/view/pub/bill-design/utils/mixin'
import { getTableData } from '@/api/pms/project-grade'
import { getCollapseData, getFormDirectorybyID, getDJBH } from '@/api/gsp/gsp_bill'
import hdlActions from './handler-actions'
import appMixin from '@/libs/app-mixin'
import workflowMixin from '_c/workflow-install/workflowFuns'
import ElecBillPage from '_c/bus-units/electronic-bills/elec-bill-page'
import { getFJLX } from '@/api/oer/oer_bill'
import { getEAPLicenceInfo } from '@/api/gl/voucher'
export default {
  name: 'BillDocModal',
  components: { PageHeader, PageFooter, GenerateForm, ElecBillPage },
  mixins: [appMixin, mixin, hdlActions, workflowMixin],
  props: {
    billId: {
      type: [String, Number],
      default: '0'
    },
    djlxGuid: {
      type: [String, Number],
      default: '0'
    },
    DJLXID: {
      type: [String, Number],
      default: ''
    },
    headerButtons: {
      type: Array,
      default: () => []
    },
    footerButtons: {
      type: Array,
      default: () => []
    },
    prams: {
      type: Object,
      default: () => { }
    },
    editable: {
      type: Boolean,
      default: true
    },
    workflowType: { // 使用工作流类型，false：U8自己工作流  true:平台工作流
      type: Boolean,
      default: false
    },
    modCode: {
      type: String,
      default: ''
    },
    gddm: { // 资产代码
      type: String,
      default: ''
    },
    kpbh: { // 资产卡片编号
      type: Number,
      default: 0
    },
    kpFlag: { // 卡片编制flag
      type: String,
      default: ''
    },
    baseParams: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showUploadFile: {
      type: Boolean,
      default: true
    },
    // 电子票据
    showElectBill: {
      type: Boolean,
      default: false
    },
    circulateSend: {
      type: Boolean,
      default: false
    },
    showMobile: {
      type: Boolean,
      default: false
    },
    billIdentify: {
      type: [String, Number],
      default: ''
    }
  },
  data () {
    return {
      mlid: 0,
      strutsData: {},
      scrollTop: 0,
      values: {},
      formStruts: '',
      webPath: '', // 模块路由标识
      rowVersion: '', // 时间戳
      worflowDJBH: '', // 单据Guid 并不是真正的单据编号.
      Drawer: false,
      // 附件原始ID
      billDjguid: (new Date()).Format('yyyyMMddhhmmssS'),
      // 图片上传原始ID
      imgId: `kp${Date.now()}`,
      showUploaderDrawer: false,
      showFpDrawer: false,
      drawerHeight: 300,
      saveSuccess: '',
      fileClass: [],
      annexStruct: '',
      elecOperateFlag: '', // 保存、审核操作成功标识,用于电子票据
      isCancel: false,
      isClickCancel: false, // 网报在新单关闭页签时，需要先调用更新发票状态的接口
      tiemMap: {},
      fpidList: [],
      headers: {
        Authorization: this.$store.state.user.token
      },
      TASKID: '', // 任务ID 工作流节点标识
      billNumber: '' // 此处是单据编号
    }
  },
  computed: {
    djlxid () {
      return this.DJLXID || this.$route.params.gnflDm
    },
    /** ******************* 工作流启动数据 ***************************/
    worflowDJLX () { // 送审单据类型
      return this.djlxid.toString()
    },
    worflowData () { // 审核单据数据
      return this.values
    },
    options () {
      return {
        'flag': '',
        'djlxid': this.djlxid,
        'data': [
          {
            'djid': this.worflowDJBH,
            'djbm': this.worflowDJBH
          }
        ]
      }
    },
    logPost () {
      return {
        ...this.prams,
        rowVersion: this.rowVersion
      }
    },
    getUploadParams () {
      let params = {
        fjlxguid: '',
        fpidList: this.fpidList,
        ...this.baseParams
      }
      if (this.$route.params.modCode === 'PAO') {
        params.djid = this.$route.params.DJBH || this.billDjguid
      } else {
        params.djid = this.mlid === 0 ? this.billDjguid : this.mlid.toString()
      }
      if (!params.hasOwnProperty('djlx')) {
        params.djlx = this.mlid === 0 ? '-1' : this.$route.params.gnflDm ? this.$route.params.gnflDm.toString() : ''
      }
      if (params.modCode === 'FAQC') {
        params.kjnd = '-1'
        params.djid = this.mlid === 0 ? this.billDjguid : `${params.gsdm}.${params.gddm}`
        params.djlx = this.mlid === 0 ? '-1' : 'FA_KP'
      }
      return params
    },
    kpBillClass () {
      let str = ''
      switch (this.kpFlag) {
        case 'kpbz':
          str = 'kpbzClass'
          break
        case 'view':
          str = 'viewClass'
          break
      }
      return str
    }
  },
  watch: {
    billId (value) {
      this.mlid = value
    },
    showUploaderDrawer (val) {
      if (!val) {
        this.values = this.getFormData()
        // 如果网报的报销明细中有要素'附件数'的话，则走公式
        // 不进行赋值,其余的附件管理中的附件数等于表外项的附件数
        let valueData = Object.values(this.values).find(item => item.CARDTYPE === '0')
        valueData = valueData ? valueData.data : []
        if (valueData.length && this.$route.matched[0].name.toLowerCase() === 'oer' && valueData[0].hasOwnProperty('FJS')) {
          return false
        }
        let len = this.$refs.xUploader.fileList.length
        let mainData = Object.values(this.values).find(item => item.FIELDTYPE === -1).data || {}
        if (mainData.hasOwnProperty('FJS')) {
          this.$set(mainData, 'FJS', len)
        }
      }
    },
    isCancel (val) { // 在取消调用方法执行后再关闭页签
      if (val && this.isClickCancel) {
        this.closeTag(this.$route)
        this.formStruts = ''
        this.values = {}
        this.$refs.generateForm.setFormStruts(this.formStruts)
      }
    },
    djlxGuid: {
      handler (value) {
        if (!value) return false
        this.worflowDJBH = value
      },
      immediate: true
    },
    billIdentify (val) {
      this.billNumber = val
    }
  },
  methods: {
    handleScroll (top) {
      this.scrollTop = top
      this.$refs.generateForm.handleScroll(this.scrollTop)
    },
    vueEnter (cache) {
      if (!cache) {
        this.mlid = this.$route.params.mlid || this.billId || 0
        this.getStruts().then(res => {
          if (this.mlid !== 0) {
            this.getBillData()
          }
        })
      }
    },
    // --------------按钮点击事件-------------------------
    handelButtonCilck (name) {
      if (this.tiemMap[name]) return false
      let buttonList = this.editable ? this.footerButtons : this.headerButtons
      let buttonItem = buttonList.find(item => item.name === name) || {}
      this.TASKID = buttonItem.taskId || ''
      this.values = this.$refs.generateForm.getFormData()
      let params = {
        gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm, // 登记簿中如果有切换单位的功能，切换后跳转gsdm需要取路由当中的
        kjnd: this.$store.state.app.env.kjnd,
        djlxid: Number(this.djlxid),
        oldDjid: this.billDjguid, // 和附件相关。新增有附件就传时间戳，没有附件就传空
        mlid: this.mlid,
        url: this.$route.matched[0].name.toLowerCase(),
        crermc: this.$store.state.user.userName,
        userName: this.$store.state.user.userName,
        crerdate: this.$store.state.app.env.loginDate.replace(/-/g, ''),
        // 新单不传递rowversion, 旧单需要传递rowVersion
        rowVersion: this.rowVersion,
        // 和图片有关，新增图片穿特殊的时间戳
        IMGID: this.imgId
      }
      this.values = { ...this.values, ...params }
      let mianData = this.getMainPnlData(this.values)
      mianData.mlid = this.mlid
      this.handelBtnCilck(name)
      this.scroll()
    },
    // ------------------结构-----------------------
    getStruts (arg = {}) {
      let params = {
        gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm, // 登记簿中如果有切换单位的功能，切换后跳转gsdm需要取路由当中的
        kjnd: this.$store.state.app.env.kjnd,
        crerdate: this.$store.state.app.env.loginDate.replace(/-/g, ''),
        djlxid: this.djlxid,
        mlid: this.mlid,
        guid: this.djlxGuid,
        ...arg
      }
      this.$parent.mlid = params.mlid // 父组件存在mlid监听
      this.webPath = this.$route.matched[0].name.toLowerCase()
      let data = { params, url: this.modCode || this.webPath }
      if (this.webPath === 'faqc') {
        data.params.kjnd = '-1'
      }
      return getCollapseData(data).then(async res => {
        if (res && res.data) {
          let params = {
            gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm,
            kjnd: this.$store.state.app.env.kjnd,
            zth: this.$store.state.app.env.zth
          }
          if (this.webPath === 'pms') { // 项目管理集成第三种绩效方式在结构中加入判断 如果为2 删除一些结构
            getTableData(params).then(
              res1 => {
                let flag = res1.data.CSVALUE
                if (flag !== 2) {
                  res.data.children[0].children = res.data.children[0].children.filter(item => {
                    return item.YSDM !== 'SFNRJX' && item.YSDM !== 'JXXMXZDM|JXXMXZMC' && item.YSDM !== 'JXXMZCDLDM|JXXMZCDLMC' && item.YSDM !== 'ZJXZDM|ZJXZMC'
                  })
                } else if (flag === 2) {
                  res.data.children = res.data.children.filter(item => {
                    return item.CARDTYPE !== '14'
                  })
                }
                this.formStruts = this.formatStrutData(res.data)
                this.$refs.generateForm.setFormStruts(this.formStruts)
                // 新单，parent-data中使用billDjguid
                this.values = this.$refs.generateForm.getFormData()
                this.values['billDjguid'] = this.billDjguid
                if (this.mlid === 0) {
                  // 当新建单据的时候才申请单据编号
                  this.getInitInfo()
                }
                this.$emit('getStruts', this.formStruts, this.values)
                this.scroll() // 做样式的兼容。如果不加, 保存过后，主信息会被按钮遮住
              })
          } else {
            // 附件功能
            let annexStructIndex = res.data.children.findIndex(item => item.CARDTYPE === '999')
            if (annexStructIndex !== -1) {
              this.annexStruct = res.data.children.splice(annexStructIndex, 1)
              if (this.mlid) {
                this.$refs.xUploader.getFilesList()
              }
            }
            let tmpFormStruts = this.$utils.clone(res.data, true)
            if ((this.webPath === 'gpmc' || this.webPath === 'GPMC') && res.data.qyzb === '0') {
              tmpFormStruts.children[1].children = res.data.children[1].children.filter(item => {
                return item.YSFIELD !== 'YSZB'
              })
            }
            this.formStruts = this.formatStrutData(tmpFormStruts)
            // 采购 招标结果登记  当修改单据时不能修改单据编号  经与后端确认  后端无法区分出新增与修改的 ISREADONLY 字段，所以前端再此处理
            if (this.mlid !== 0 && this.formStruts.modcode === 'GPMC' && this.formStruts.djlxid === 5) {
              for (let i = 0; i < this.formStruts.children[0].children.length; i++) {
                if (this.formStruts.children[0].children[i].YSFIELD === 'ZTBBM') {
                  this.formStruts.children[0].children[i].readonly = true
                  break
                }
              }
            }
            // 同一张单据存因为工作流不同岗位存在不同样式。要刷新样式, 但是不刷新值
            this.$refs.generateForm.setFormStruts(this.formStruts, arg.refresh)
            Object.assign(this.values, this.$refs.generateForm.getFormData())
            if (this.mlid === 0) {
              // 当新建单据的时候才申请单据编号
              await this.getInitInfo()
            }
            this.$emit('getStruts', this.formStruts, this.values, this.billDjguid)
            this.scroll() // 做样式的兼容。如果不加, 保存过后，主信息会被按钮遮住
          }
          // mlid == 0,是新建单据，否则是回显单据
          if (this.showUploadFile) { // 暂时网报使用新附件，后期使用单据设置的模块都会换成新附件
            this.getFJLX()
          }
          return true
        }
      })
    },
    /* 接收表单数据 */
    getBillData (params = {}) {
      let data = {
        gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm, // 登记簿中如果有切换单位的功能，切换后跳转gsdm需要取路由当中的
        kjnd: this.$route.params.kjnd || this.$store.state.app.env.kjnd,
        crerdate: this.$store.state.app.env.loginDate.replace(/-/g, ''),
        djlxid: this.djlxid,
        mlid: this.mlid,
        zth: this.$store.state.app.env.zth,
        url: this.modCode || this.$route.matched[0].name.toLowerCase(), // 凭证箱调用时，传指定modCode。不传还按原方式取值
        ...params
      }
      if (data.url === 'faqc') {
        data.gddm = this.gddm // 资产代码
        data.kpbh = this.kpbh // 卡片编号
        data.kjnd = '-1'
      }
      if (data.url === 'inv') {
        data.djbh = this.mlid
      }
      return getFormDirectorybyID(data).then(res => {
        if (res && res.status === 200) {
          this.values = res.data
          this.setValues(this.values)
          this.rowVersion = this.getMainPnlData(res.data).ROWVERSION || ''
          this.$emit('on-rowVersion', this.rowVersion, this.values)
        }
      })
    },
    handleScrollTo (top) {
      this.$emit('handle-scroll-to', top)
    },
    handleTableBtnClick (params) {
      this.$emit('on-table-btn-click', params)
    },
    formChange (params) {
      this.values = params.billData
      this.$emit('on-change', params)
    },
    setValues (values) {
      this.values = values || this.values
      this.$refs.generateForm.setFormData(this.values)
    },
    getFormData () {
      return this.$refs.generateForm.getFormData()
    },
    getInitInfo () { // 初始化带入单据编号以及是否带入部门和经办人的校验
      var modelName = this.$route.matched[0].name.toLowerCase()
      let params = {
        gsdm: this.$route.params.gsdm || this.$store.getters.env.gsdm,
        kjnd: this.$route.params.kjnd || this.$store.getters.env.kjnd,
        djlxid: this.djlxid.toString(),
        crerdate: this.$store.state.app.env.loginDate.replace(/-/g, ''),
        url: modelName
      }
      // 采购管理、合同管理、其他薪资、资产管理模块不需要请求单据编号
      if (modelName === 'gpmc' || modelName === 'cntc' || modelName === 'pao' || modelName === 'faqc') return false
      return getDJBH(params).then(res => {
        if (res && res.status === 200) {
          this.values = this.$refs.generateForm.getFormData()
          let mianData = this.getMainPnlData(this.values)
          mianData.DJBH = res.data.djbh
          this.$parent.billIdentify = res.data.djbh
        }
      })
      // 经办人、部门自动带入功能，从单据设置设置默认值即可。
    },
    handleUploadFile () {
      this.showUploaderDrawer = true
      setTimeout(() => (
        this.$refs.xUploader.show()
      ), 30)
    },
    handleFpClick () {
      this.showFpDrawer = true
    },
    handleEventSuccess (val) {
      this.fpidList = val
      this.$nextTick(() => {
        this.$refs.xUploader.getFilesList()
      })
    },
    async beforeActionMethod (operate, file) {
      if (operate === 'remove') {
        if (file.hasOwnProperty('fpid') && file.fpid !== '') {
          this.$fn.error({ desc: '该附件与发票关联，不允许删除' })
          return false
        } else {
          return true
        }
      } else if (operate === 'camera') { // 拍照
        let res = await getEAPLicenceInfo({ KJND: this.$store.state.app.env.kjnd })
        if (res.status === 200) {
          return true
        } if (res.status === 300) {
          this.$fn.warning({ desc: res.msg })
          return true
        }
      } else {
        return true
      }
    },
    handleBillCancel () {
      this.isCancel = false
    },
    // 获取附件类型
    getFJLX () {
      this.$fn.ajax(getFJLX, {
        gsdm: this.$route.params.gsdm || this.$store.state.app.env.gsdm,
        kjnd: this.$route.params.kjnd || this.$store.state.app.env.kjnd,
        zth: this.$route.params.zth || this.$store.state.app.env.zth,
        modcode: this.modCode || this.$route.matched[0].name.toUpperCase()
      }, res => {
        let fileClass = res.data.map(item => {
          if (!this.annexStruct.length) {
            return { required: false, id: item.FJLXGUID, text: item.FJLXMC }
          } else {
            let id = item.FJLXGUID
            let annexClass = this.annexStruct[0].FORMULA.filesType.find(element => {
              return element.FJLXGUID === id && element.isSelect
            })
            return annexClass ? { required: !!annexClass.isRequire, id: item.FJLXGUID, text: item.FJLXMC } : ''
          }
        }).filter(i => i)
        if (fileClass.length > 0) {
          this.fileClass = [...fileClass]
        }
      })
    },
    // 用于一进页面获取发票的使用数据
    getUsedFp (val) {
      this.fpidList = val
    }
  },
  mounted () {
    this.vueEnter(false)
  },
  created () {
    this.drawerHeight = $(window).height() - 43
  }
}
</script>
<style lang="less">
  @import './bill-doc-modal.less';
</style>
