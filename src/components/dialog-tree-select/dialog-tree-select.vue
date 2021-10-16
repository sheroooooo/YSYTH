<!-- 弹框树组件
  /**
     * @param {Boolean} [modalFlag]   - 弹框显示隐藏 [非必须] [默认:false 隐藏]
     * @param {Number} [modalWidth]   - 弹框宽度 [非必须] [默认:'530']
     * @param {Number} [modalHeight]  - 弹框高度 [非必须] [默认:'300']
     * @param {Event} [@on-ok]        - 弹窗点击确认事件 [必须]  调用父组件的Ok事件，返回选中的树节点数据
     * @param {Event} [@modalChange]  - 弹窗状态切换调用父组件方法 [必须]
     * @data {Boolean} [isRight]      - 弹框右侧显示隐藏 [非必须] [默认:true 显示右侧]
     dataSources:
     1:
  */
 -->
<template>
  <div class="tree-select">
    <template v-if="readonly && !row">
      <Input readonly
             :disabled='disabled'
             v-model.trim="inputValue"
             :placeholder='placeholder'
             @click.native="handleBtnClick($event)"
             @mouseover.native="handleInputFocus"
             @mouseout.native="handleInputBlur">
      <Icon type="ios-more"
            slot="suffix"
            v-if="!showClearIcon" />
      <Icon type="ios-close-circle"
            slot="suffix"
            v-else
            @click.stop="handleBtnClear" />
      </Input>
    </template>
    <template v-else-if='!readonly && !row'>
      <Input v-model.trim="inputValue"
             autofocus
             :disabled='disabled'
             :placeholder='placeholder'
             @on-change="handleInputChange">
      <Icon @click.native="handleBtnClick($event)"
            type="ios-more"
            slot="suffix" />
      </Input>
    </template>
    <Modal v-model="modal"
           v-if='!row'
           :title="title"
           :width="modalWidth"
           :isRight="isRight"
           :z-index="2000"
           class-name="vertical-center-modal">
      <div class="modal-center"
           :style="{height:`${modalHeight - 100}px`}">
        <Col :span="leftCol"
             class="left">
        <vuc-tree ref="xtree"
                  :expand="expand"
                  :id-field="idField"
                  :text-field="textField"
                  :leafRequired='leafRequired'
                  :height="modalHeight - 93"
                  :show-checkbox="isShowCheckbox"
                  @on-dblclick="handleDblclick"
                  @on-select="handleSelected"></vuc-tree>
        </Col>
        <Col :span="`${24-leftCol}`"
             class="right"
             :style="{height:`${modalHeight - 144}px`}">
        <div class="innerright">
          <RadioGroup vertical>
            <Radio label="一级代码">
              <span>一级代码</span>
            </Radio>
            <Radio label="明细代码">
              <span>明细代码</span>
            </Radio>
            <Radio label="所有代码">
              <span>所有代码</span>
            </Radio>
          </RadioGroup>
        </div>
        </Col>
      </div>
      <div slot="footer">
        <Button type="text"
                size="large"
                @click="onCancel">取消</Button>
        <Button type="primary"
                size="large"
                @click="handleOkClick">确定</Button>
      </div>
      <span class="errorMessage"
            v-show="isSelect">该节点不支持选择!</span>
    </Modal>
    <div v-if='row'
         class="modal-center"
         :style="{height:`${modalHeight - 100}px`}">
      <Col :span="leftCol"
           class="left">
      <vuc-tree ref="xtree"
                :expand="expand"
                :id-field="idField"
                :text-field="textField"
                :height="modalHeight - 93"
                :show-checkbox="isShowCheckbox"
                @on-dblclick="handleDblclick"
                @on-select="handleSelected"></vuc-tree>
      </Col>
      <Col :span="`${24-leftCol}`"
           class="right"
           :style="{height:`${modalHeight - 144}px`}">
      <div class="innerright">
        <RadioGroup vertical>
          <Radio label="一级代码">
            <span>一级代码</span>
          </Radio>
          <Radio label="明细代码">
            <span>明细代码</span>
          </Radio>
          <Radio label="所有代码">
            <span>所有代码</span>
          </Radio>
        </RadioGroup>
      </div>
      </Col>
      <div class="footer-btn-group"
           style='padding: 0px 0px 0px 0px; text-align: right'>
        <Button type="primary"
                style='margin-left: 10px'
                @click='handleOkClick'
                class="footer-btn">确定</Button>
        <Button class="footer-btn"
                style='margin-left: 10px'
                @click="$emit('close')">取消</Button>
      </div>
      <span class="errorMessage"
            v-show="isSelect">该节点不支持选择!</span>
    </div>
  </div>
</template>

<script>
import cm from '@/libs/toolutil'
import { getFZXSelect } from '@/api/pub/dialog-tree-select'
import clonedeep from 'clonedeep'
import appMixin from './mixin'
// import { mapGetters } from 'vuex'
export default {
  mixins: [appMixin],
  name: 'DialogTreeSelect',
  data () {
    return {
      modal: false,
      treeData: [], // 树结构数据源
      filterData: [], // 树结构筛选之后的数据
      showrData: [], // 展示数据
      maxIindex: 30,
      isRight: false,
      searchData: '',
      compareData: [], // 双击比较的code
      inputValue: '',
      showClearIcon: false,
      isSelect: false,
      selectTreeData: [],
      env: {}
    }
  },
  props: {
    value: { // 模态 框显示隐藏
      type: String,
      default: ''
    },
    leafRequired: {
      type: Boolean,
      default: false
    },
    modalWidth: { // 模态框宽度
      type: Number,
      default: 530
    },
    modalHeight: { // 模态框高度
      type: Number,
      default: 450
    },
    title: {
      type: String,
      default: ''
    },
    // 组件所在的表单数据
    parentData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    isNewUrl: { // 是否使用新的url 和不同的参数 出纳的登记日记账用
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    withParentData: {
      type: Boolean,
      default: true
    },
    // -1是使用外部数据，通过data属性传树数据
    dataSource: {
      type: [String, Number],
      default: '0'
    },
    placeholder: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    djlxid: { // 单据类型
      type: Number,
      default: 1
    },
    modCode: { // 模块标识
      type: String,
      default: ''
    },
    expand: {
      type: Boolean,
      default: true
    },
    idField: {
      type: String,
      default: 'code'
    },
    textField: {
      type: String,
      default: 'title'
    },
    params: {
      type: Object,
      default: () => { }
    },
    baseParams: {
      type: Object,
      default: () => { }
    },
    itemKey: {
      type: String,
      default: ''
    },
    row: {
      default: '',
      type: [String, Object]
    },
    _root: {
      default: '',
      type: [String, Object]
    },
    showCheckbox: {
      type: Boolean,
      default: false
    }
  },
  inject: {
    billValueStore: {
      from: 'billValueStore',
      default: () => {
        return () => { }
      }
    }
  },
  computed: {
    leftCol () {
      if (this.isRight) { return 18 } else { return 24 }
    },
    // ...mapGetters(['env']),
    isShowCheckbox () {
      return this.itemKey === 'CLF_JTGJ' || this.showCheckbox // 交通工具支持多选  或showCheckBox为true
    }
  },
  watch: {
    modal () {
      if (this.modal) {
        this.handleFocus()
      } else {
        this.compareData = ''
        this.searchData = ''
        this.isSelect = false
      }
    },
    value () {
      this.initInputValue()
    }
  },
  methods: {
    initInputValue () {
      this.inputValue = this.value.trim()
    },
    handleBtnClick (event) {
      if (this.disabled) {
        return false
      }
      this.modal = true
      this.isSelect = false
    },
    handleBtnClear () {
      if (this.disabled) return false
      this.inputValue = ''
      this.$emit('on-change', this.inputValue, {})
    },
    // 如果props配置了clearable.那么不应该显示showClearIcon
    handleInputFocus () {
      if (this.$attrs.clearable === false) {
        this.showClearIcon = false
      } else {
        this.showClearIcon = this.inputValue !== ''
      }
    },
    handleInputBlur () {
      this.showClearIcon = false
    },
    getshowrData () {
      this.showrData = this.filterData
      this.$refs.xtree.loadData(this.showrData)
      if (this.itemKey === 'CLF_JTGJ') {
        this.$refs.xtree.setRowsChecked(item => {
          return item.ISENABLED === '1'
        }, true)
      }
    },
    /* 获取数据 */
    handleFocus () {
      if (Number(this.dataSource) === -1) {
        this.treeData = this.data || []
        this.filterData = cm.formatDataToTree(this.treeData, {
          pId: 'pId',
          id: 'id',
          text: 'text'
        })
        this.getshowrData()
        this.modalFlag = true
        return false
      }
      let relationType = this.parentData._expanded ? 'bnx' : 'bwx'
      let children = []
      if (this.withParentData) { // 是否需要关联关系
        for (let key in this.parentData) {
          let obj = {}
          obj.sjly = cm.getdataSources(key)
          if (obj.sjly) {
            obj.value = this.parentData[key]
            children.push(obj)
          }
        }
      }
      // 新用弹出框选择 获取不到this。新弹窗使用gsdm等 暂时传入
      let ENV = this.baseParams
      if (this.initRoute && this.initRoute.params.ENV) {
        ENV = this.initRoute.params.ENV
      } else if (this.$store) {
        ENV = this.$store.state.app.env
      }
      // 新用弹出框选择 获取不到this。暂定为 ''
      let modal = ''
      if (this.initRoute && this.initRoute.params.modCode) {
        modal = this.initRoute.params.modCode
      } else if (this.modCode) {
        modal = this.modCode
      } else {
        modal = this.$route ? this.$route.matched[0].name.toUpperCase() : ''
      }
      let params = {
        gsdm: ENV.gsdm || this.$store.state.app.env.gsdm,
        kjnd: ENV.kjnd || this.$store.state.app.env.kjnd,
        zth: ENV.zth || this.$store.state.app.env.zth,
        sjly: this.dataSource,
        djlxid: this.djlxid.toString(),
        modCode: modal,
        relationType,
        children
      }
      if (modal) {
        params.relationType = this.dataSource
      }
      if (this.dataSource === '157') {
        params.PROVID = this.parentData.khsf ? this.parentData.khsf.split(' ')[0] : this.parentData.PROVINCE ? this.parentData.PROVINCE.split(' ')[0] : ''
      }
      if (this.dataSource === '130') {
        params.zydm = cm.getLocal('userCode')
        params.ffnd = this.$store.state.app.env.kjnd
      }
      if (this.dataSource === '72' && modal === 'OER') { // 银行行号可按银行机构-省份-城市进行过滤，其中银行机构必填
        params.filter = this.parentData.YH.split(' ')[0]
        params.province = this.parentData.PROVINCE ? this.parentData.PROVINCE.split(' ')[0] : ''
        params.city = this.parentData.CITY ? this.parentData.CITY.split(' ')[0] : ''
        if (params.filter === '') {
          this.$fn.warning({ title: '警告提示', desc: '请先选择银行机构，再选择银行行号' })
          this.modal = false
          return this.$emit('close')
        }
      } else if ((this.dataSource === '56' || this.dataSource === '50') && modal === 'OER') {
        params['JSFSDM'] = this.parentData['JSFSDM|JSFSMC'] ? this.parentData['JSFSDM|JSFSMC'].split(' ')[0] : ''
      } else if (this.dataSource === '70') { // 城市可按省份过滤
        params.province = this.parentData.PROVINCE ? this.parentData.PROVINCE.split(' ')[0] : ''
      } else if (this.dataSource === '304') {
        params.jlfsdm = this.parentData['JLFSDM|JLFSMC'].split(' ')[0] || ''
      } else if (this.dataSource === '311' || this.dataSource === '312') {
        params.wzdm = this.parentData.WZDM
      } else if (this.dataSource === '306') {
        if (this._root !== '') {
          let val = this._root.billValueStore ? this._root.billValueStore() : this.billValueStore()
          let CARDTYPE = '-1'
          for (let key in val) {
            if (typeof val[key] === 'object') {
              if (Array.isArray(val[key].data)) {
                CARDTYPE = val[key].CARDTYPE
              }
            }
          }
          let key = 'CKDM|CKMC'
          if (CARDTYPE === '28') {
            key = this.itemKey === 'MDKWDM|MDKWMC' ? 'MDCKDM|MDCKMC' : 'YCKDM|YCKMC'
          }
          if (CARDTYPE === '24' || CARDTYPE === '25') {
            params.ckdm = this.parentData['CKDM|CKMC'] ? this.parentData['CKDM|CKMC'].split(' ')[0] : ''
          } else if (CARDTYPE === '30') {
          } else {
            params.ckdm = this.getMainPnlData(val)[key].split(' ')[0] || ''
          }
        } else {
          params.ckdm = this.parentData['CKDM|CKMC'] ? this.parentData['CKDM|CKMC'].split(' ')[0] : ''
        }
      } else if (this.dataSource === '322') {
        let val = this._root.billValueStore ? this._root.billValueStore() : this.billValueStore()
        params.bmdm = this.getMainPnlData(val)['BMDM|BMMC'].split(' ')[0] || ''
      } else if (this.dataSource === '140') {
        params.GSDM = params.gsdm
        params.KJND = params.kjnd
        params.DJLXID = this.djlxid.toString()
      }

      if (this.isNewUrl) {
        params.LBDM = params.sjly
        params.ISCHANGE = '1'
        params.UNFROZEN = '1'
        params.GSDM = params.gsdm
        params.KJND = params.kjnd
        params.ZTH = params.zth
        params.MODCODE = this.initRoute.params.modCode
      }
      let data = {}
      data.modal = modal
      data.params = { ...params, modal: modal, isNewUrl: this.isNewUrl }
      getFZXSelect(data).then(res => {
        if (res && res.data) {
          let list = clonedeep(res.data)
          if (this.isNewUrl) { // 出纳登记日记账查询的辅助项返回的数据结构不同 需做下转换处理
            list = []
            for (let obj of res.data) {
              obj.parent = obj.DM
              obj.code = obj.DM
              obj[this.textField] = obj.DMMC
              if (obj.children) {
                for (let cldobj of obj.children) {
                  list.push({ parent: obj.DM, code: cldobj.DM, title: cldobj.DMMC })
                }
              }
              list.push({ parent: obj.DM, code: obj.DM, title: obj.DMMC })
            }
          }
          this.treeData = JSON.stringify(list)
          if (this.itemKey === 'CLF_JTGJ') {
            list = this.setTreeData(list, this.inputValue.split(','))
          }
          this.filterData = cm.formatDataToTree(list, {
            pId: 'parent',
            id: 'code',
            text: 'title'
          })
          this.getshowrData()
          this.modalFlag = true
        }
      })
    },
    onCancel () {
      this.modal = false
    },
    handleInputChange () {
      if (this.modal) return false
      this.setFZXRelation()
      this.$emit('on-change', this.inputValue, null)
    },
    /* 点击确认 回调父组件Ok方法 */
    handleOkClick () {
      let tmpCheckedData = this.$refs.xtree.getCheckedData()
      if (tmpCheckedData.length) {
        this.selectTreeData.length = 0
        tmpCheckedData.map(item => {
          this.selectTreeData.push(item[this.textField])
        })
      } else {
        this.selectTreeData = []
      }
      // this.selectTreeData = tmpCheckedData.length > 0 ? tmpCheckedData : []
      if (this.compareData.length > 0) {
        // 新用弹出框选择 获取不到this。暂定为 ''
        let modelName = this.initRoute ? this.initRoute.params.modCode : ''
        // 判断是不是不可选择的节点
        if (this.compareData[0].structure === '0') {
          this.isSelect = true
          return false
        }
        // 判断是不是辅助核算项非明细不允许保存
        if (this.dataSource === '3') { // 个人往来所有部门不能选择
          if (this.compareData[0].sfmx === '0') { // 判断是不是最后一级别
            this.isSelect = true
            return false
          }
        } else if (modelName === 'OER' && this.env.OER && this.env.OER.FZXMXKZ === '1') {
          if (this.compareData[0].sfmx === '0') { // 判断是不是最后一级别
            this.isSelect = true
            return false
          }
        } else if (modelName === 'GBS' && this.env.GBS.AUTOXMDM === 1 && this.dataSource === '2') { // GBS项目代码自动生成
          if (this.compareData[0].sfmx === '1' && this.compareData[0].parent) { // 判断是不是最后一级别
            this.isSelect = true
            return false
          }
        } else if (modelName === 'PMS' && this.env.PMS.PMS_AllowSelectNotMXBase === '0') {
          if (this.compareData[0].sfmx === '0') { // 判断是不是最后一级别
            this.isSelect = true
            return false
          }
        } else if (modelName === 'PAO' && (this.dataSource === 1)) {
          if (this.compareData[0].sfmx === '0') { // 判断是不是最后一级别
            this.isSelect = true
            return false
          }
        } else if (modelName === 'GSP' && this.env.GSP.FZXMXKZ === '1') {
          if (this.compareData[0].sfmx && !(this.compareData[0].sfmx === '1')) { // 判断是不是最后一级别
            this.isSelect = true
            return false
          }
          // 合同录入界面受到控制
        } else if (this.initRoute && this.initRoute.name === 'cntc-bill' && this.env.CNTC && this.env.CNTC.HTXMXZ === '1' && this.dataSource === '2') {
          if (this.compareData[0].parent !== '') { // 判断是不是第一级
            this.isSelect = true
            return false
          }
        }
        // 选择科目，科目非明细类不可选择
        if (this.compareData[0].KMDM && this.compareData[0].hasOwnProperty('children') && !this.leafRequired) {
          this.isSelect = true
          return false
        }
        this.compareData[0][this.textField] = this.compareData[0][this.textField].replace(new RegExp('<span.*?>|</span>', 'g'), '')
        if (this.dataSource && typeof this.dataSource === 'string' && this.dataSource.indexOf('[ZD]') !== -1) {
          if (this.itemKey === 'CLF_JTGJ') { // 交通工具支持多选
            this.inputValue = this.selectTreeData.length > 0 ? this.selectTreeData.join(',') : ''
          } else {
            this.inputValue = this.compareData[0][this.textField].split(' ')[1] || ''
          }
        } else {
          this.inputValue = this.compareData[0][this.textField]
        }
        if (this.isShowCheckbox) { // 多选带值
          this.inputValue = this.selectTreeData.length > 0 ? this.selectTreeData.join(',') : ''
        }
        this.setFZXRelation()
        this.$emit('on-change', this.inputValue, this.compareData[0])
        this.$emit('complete', this.inputValue, this.row, this.compareData[0])
        this.$emit('close')
        this.modal = false
      }
    },
    // 处理表格数据记住上次所选
    setTreeData (treeData, selectData) {
      if (selectData.length === 0) {
        return treeData
      }
      for (let i = 0; i < treeData.length; i++) {
        if (selectData.includes(treeData[i].name)) {
          treeData[i]['ISENABLED'] = '1'
        } else {
          treeData[i]['ISENABLED'] = '0'
        }
      }
      return treeData
    },
    handleSelected (values, value) {
      this.compareData = [values.row]
    },
    /* 双击关闭弹框 */
    handleDblclick (values, value) {
      this.compareData = [values.row]
      if (this.itemKey === 'CLF_JTGJ') {
        return false
      }
      this.handleOkClick()
    }
  },
  mounted () {
    this.initInputValue()
    this.row && this.handleFocus()
  },
  created () {
    if (this.row && this._root) {
      this.$store = {
        state: this._root.$state
      }
      this.initRoute = this._root.$route
      Object.assign(this.parentData, this.row)
    } else {
      this.initRoute = this.$route
    }
    this.env = this.$store ? this.$store.state.app.env : {}
  }
}
</script>

<style scoped>
  @import 'dialog-tree-select.less';
</style>
<style lang="less">
  .vertical-center-modal {
    .ivu-scroll-wrapper {
      .ivu-scroll-container{
        overflow-y: auto;
      }
    }
  }

</style>
