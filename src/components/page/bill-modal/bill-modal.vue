<template>
  <div class="bill-modal">
    <!--顶部标题头及工具栏-->
    <page-header v-if="headerButtons.length>0"
                 :data="headerButtons"
                 :prams="prams"
                 @on-header-toolbar-click="handelButtonCilck"></page-header>
    <slot name="prefix"></slot>
    <template v-for="(item , index) in collapseData">
      <Collapse class="mb10"
                v-model="collapseTitle"
                :key="`pnl_${index}`"
                :value="item.title"
                v-if="item.dataSource === 'bnx' || item.dataSource === 'bwx'">
        <Panel :hideArrow="true"
               :name="item.title">
          {{item.title}}
          <Icon type="ios-arrow-down"
                size="16" />
          <span v-if="item.dataSource === 'bwx' && isActive(item.title)">
            <span class="message"
                  v-if="bmData.length>0">部门：{{bmData}}</span>
            <span class="message"
                  v-if="xmData.length>0">项目：{{xmData}}</span>
            <span class="message">申请金额：{{sqMonery}}</span>
          </span>
          <span v-if="item.dataSource === 'bnx' && isActive(item.title)">
            <span class="message">申请金额：{{totalMonery(partList[index-1].list)}}</span>
          </span>
          <div v-if="item.dataSource==='bnx' && ((partList.length>0 && partList[index-1].list.length>1 && editable)||!editable)"
               class="ivu-collapse-header-actions">
            <span :class="{'actived':viewTypeList[index-1]!=='tile'}"
                  @click.stop="setViewType($event,index-1,'table')">
              <Icon type="ios-paper-outline"
                    size="18" />
            </span>
            <span :class="{'actived':viewTypeList[index-1]==='tile'}"
                  @click.stop="setViewType($event,index-1,'tile')">
              <Icon type="ios-apps-outline"
                    size="18" />
            </span>
          </div>
          <div slot="content">
            <form-label-group :ref="`bwxFormGroup_${index}`"
                              v-if="item.dataSource==='bwx'"
                              :key="`${_uid}_${index}`"
                              :item-list="formatItemList(item.list)"
                              :init-value-list="basicList"
                              :label-width=labelWidth
                              :cols=cols
                              :editable="editable"
                              :init-error-store="errorStore"
                              @on-change="formBWXChange">
            </form-label-group>
            <table-expand-form :ref="`bnxFormGroup_${index-1}`"
                               v-if="item.dataSource==='bnx'"
                               :key="`${_uid}_${index}`"
                               :item-list="formatItemList(item.list)"
                               :columns="formatColumns(item.list)"
                               :init-value-list="partList.length===0?[]:partList[index-1].list"
                               :label-width=labelWidth
                               :cols=cols
                               :viewType="viewType(index-1)"
                               :editable="editable"
                               :init-error-store="errorStore"
                               @on-change="(list)=>formBNXChange(index-1,list)">
            </table-expand-form>
          </div>
        </Panel>
      </Collapse>
    </template>
    <slot></slot>
    <!--底部工具栏-->
    <page-footer v-if="footerButtons.length>0"
                 :data="footerButtons"
                 @on-footer-toolbar-click="handelButtonCilck"></page-footer>
  </div>
</template>
<script>
import FormLabelGroup from '_c/form/form-label-group'
import TableExpandForm from '_c/table/table-expand-form'
import PageHeader from '_c/page/page-header'
import PageFooter from '_c/page/page-footer'
import tools from '@/libs/toolutil'
import clonedeep from 'clonedeep'
import mixin from '@/libs/app-mixin'
export default {
  name: 'BillModal',
  components: {
    FormLabelGroup,
    TableExpandForm,
    PageHeader,
    PageFooter
  },
  props: {
    prams: {
      type: Object,
      default: () => { }

    },
    // 折叠面板初始化数据
    collapseData: {
      type: Array,
      default: () => []
    },
    // 折叠面板title默认展开
    collapseTitle: {
      type: Array,
      default: () => []
    },
    // 折叠面板数据
    formData: {
      type: Object,
      default: () => { }
    },
    headerButtons: {
      type: Array,
      default: () => []
    },
    footerButtons: {
      type: Array,
      default: () => []
    },
    // 编辑浏览标志 true:编辑 false:浏览
    editable: {
      type: Boolean,
      default: true
    },
    errorStore: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      labelWidth: 120,
      cols: 3,
      // 折叠面板数据
      cacheFormData: {},
      // 编辑区0:表外项，1表内项
      editArear: 0,
      basicList: {},
      partList: [],
      viewTypeList: {},
      bmData: '', // 折叠面板信息
      xmData: '',
      sqMonery: 0
    }
  },
  computed: {
    viewType (index) {
      return (index) => this.viewTypeList[index]
    }
  },
  watch: {
    formData: {
      handler (newData, oldData) {
        this.setCardData()
      },
      deep: true
    }
  },
  methods: {
    vueEnter (cache) {
      if (!cache) {
        this.setCardData()
        let tmpType = {}
        let refs = Object.keys(this.$refs)
        for (let i = 0; i < refs.length; i++) {
          tmpType[i] = 'table'
        }
        this.viewTypeList = clonedeep(tmpType)
        // console.log(this.viewTypeList)
      }
    },
    /* 是否显示折叠面板信息 */
    isActive (val) {
      return this.collapseTitle.indexOf(val) === -1
    },
    /* 合计申请金额 */
    totalMonery (list) {
      let monery = 0
      for (let val of list) {
        monery += val.JE
      }
      return tools.formatMoney(monery, 2)
    },
    setCardData () {
      this.cacheFormData = clonedeep(this.formData)
      this.basicList = clonedeep(this.formData.basicList) || {}
      this.bmData = this.basicList['BMDM|BMMC'] ? this.basicList['BMDM|BMMC'].split(' ')[1] : '' // 折叠面板部门
      this.xmData = this.basicList['XMDM|XMMC'] ? this.basicList['XMDM|XMMC'].split(' ')[1] : '' // 折叠面板项目
      this.sqMonery = this.basicList.JE ? tools.formatMoney(this.basicList.JE, 2) : tools.formatMoney(this.basicList.HJJE, 2) // 折叠面板申请金额
      this.partList = clonedeep(this.formData.partList) || []
    },
    setViewType (event, idx, type) {
      this.viewTypeList[idx] = type
      this.$refs['bnxFormGroup_' + idx][0].focusUpdated({ viewType: type })
      $(event.target).closest('.ivu-collapse-header-actions').find('.actived').removeClass('actived')
      $(event.target).addClass('actived')
    },
    formatItemList (list) {
      return tools.formatFormGroup(list)
    },
    formatColumns (list) {
      return tools.formatTableColumns(list)
    },
    /// ///////////////////////

    formBWXChange (valueList) {
      if (JSON.stringify(this.basicList) !== JSON.stringify(valueList)) {
        this.editArear = 1
        this.basicList = clonedeep(valueList)
        this.cacheFormData.basicList = this.basicList
        this.$emit('on-change', clonedeep(this.cacheFormData))
      }
    },
    formBNXChange (index, valueList) {
      if (JSON.stringify(this.partList[index].list) !== JSON.stringify(valueList)) {
        this.partList[index].list = clonedeep(valueList)
        this.cacheFormData.partList = this.partList
        this.$emit('on-change', clonedeep(this.cacheFormData))
      }
    },

    // --------------按钮点击事件-------------------------
    handelButtonCilck (name) {
      this.$emit('on-toolbar-click', name)
    },
    validate (_callback) {
      let refs = Object.keys(this.$refs)
      let vd = true
      for (let i = 0; i < refs.length; i++) {
        let ref = this.$refs[refs[i]]
        ref[0].validate((valid) => {
          vd = vd && valid
        })
      }

      _callback(vd)
    }
  },

  mixins: [mixin]

}
</script>

<style>
    .message{
        font-weight: 600;margin:0px 20px;
    }
</style>
