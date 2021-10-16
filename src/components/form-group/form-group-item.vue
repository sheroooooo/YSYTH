<template>
  <FormItem :label="item.dataType !== 'checkbox'? item.title : ''"
            :class="{'form-required-item':item.required}"
            :prop="item.key"
            :rules="rule()">
    <template v-if="editable">
      <template v-if="item.dataType === 'textarea'">
        <Input type="textarea"
               :rows="5"
               v-model.trim="values[item.key]"
               @on-blur='handleBaseChange'
               :placeholder="placeholder"
               :disabled="item.readonly"></Input>
      </template>
      <template v-else-if="item.dataType === 'integer'">
        <InputNumber v-model="values[item.key]"
                     :precision="item.precision || 0"
                     :placeholder="placeholder"
                     :editable="item.editable"
                     :min='Number(item.minValue) || 0'
                     :max='Number(item.maxValue) || 999999999'
                     :disabled="item.readonly"
                     @on-blur="handleBaseChange"
                     style="width:100%">
        </InputNumber>
      </template>
      <template v-else-if="item.dataType === 'number'">
        <InputNumber v-model="values[item.key]"
                     :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')"
                     :parser="value => value.replace(/￥s?|(,*)/g,'')"
                     :precision='2'
                     :min='Number(item.minValue) || 0'
                     :max='Number(item.maxValue) || 999999999999'
                     :placeholder='placeholder'
                     :editable="item.editable"
                     :disabled="item.readonly"
                     @on-blur="handleBaseChange"
                     style="width:100%"></InputNumber>
      </template>
      <template v-else-if="item.dataType === 'date'">
        <DatePicker v-model="vmodel"
                    :type="item.options.type"
                    :disabled="item.readonly"
                    @on-change="handleDateChange"
                    :placeholder="placeholder"
                    transfer
                    style="width:100%">
        </DatePicker>
      </template>
      <template v-else-if="item.dataType === 'cryption'">
        <cryption-input :value="vmodel"
                        :modalTitle='item.title'
                        :placeholder="placeholder"
                        :modelKey='item.key'
                        :disabled="item.readonly"
                        :cryptionFlag="item.cryptionFlag"
                        @on-change="handleChange"></cryption-input>
      </template>
      <template v-else-if="item.dataType === 'select'">
        <combox-select :value="vmodel"
                       :dataSources="item.options.dataSource"
                       :selectData='item.options.data'
                       :placeholder="placeholder"
                       :disabled="item.readonly"
                       :parent-data="values"
                       :name="item.key"
                       @on-select="handleChange">
        </combox-select>
      </template>
      <template v-else-if="item.dataType === 'checkbox'">
        <span style="border:1px transparent solid;float:left;">
          <Checkbox v-model="values[item.key]"
                    true-value='1'
                    false-value='0'
                    @on-change='handleBaseChange'
                    :disabled="item.readonly">{{item.title}}</Checkbox>
        </span>
      </template>
      <template v-else-if="item.dataType === 'tree-select'">
        <dialog-tree-select :value="vmodel"
                            :dataSource="item.options.dataSource"
                            :data='item.options.data'
                            :placeholder="placeholder"
                            :disabled="item.readonly"
                            :readonly="!item.options.editable"
                            :title="item.title"
                            :parent-data="values"
                            :item-key="item.key"
                            @on-change="handleChange">
        </dialog-tree-select>
      </template>
      <!-- 支持外界传递数据,tableData tableColumns 只有dataSource = -1的时候生效(外界传递) -->
      <template v-else-if="item.dataType === 'table-select'">
        <table-select :value="vmodel"
                      :dataSource="item.options.dataSource"
                      :parent-data="values"
                      :placeholder="placeholder"
                      :disabled="item.readonly"
                      :readonly="!item.options.editable"
                      :tableDataProps='item.options.tableData'
                      :tableColumnsProps='item.options.tableColumns'
                      :name="item.key"
                      :item-key="item.key"
                      :toolbar="(item.MODCODE==='OER'||item.MODCODE==='GSP') ? ['search'] : []"
                      :title="item.title"
                      @on-change="handleChange"
                      @on-click-more="handleClickMore">
        </table-select>
      </template>
      <template v-else-if="item.dataType === 'table-page-select'">
        <modal-table-select :value="vmodel"
                            :item="item"
                            @on-change="handleChange"></modal-table-select>
      </template>
      <template v-else-if="item.dataType === 'uploadpic'">
        <div class="item-uploadpic">
          <Carousel v-model="imgIdx"
                    v-if="this.imgList.length"
                    class="uploadpic-carousel"
                    :height="162"
                    dots="none">
            <CarouselItem v-for="(item, idx) in imgList"
                          :key="`cal-${item.GXGUID}`">
              <img class="demo-carousel"
                   @click="handleImgClick(idx)"
                   :src="`data:image/${item.fjlx.replace('.', '').replace('jpg', 'jpeg')};base64,${item.picture}`"></img>
            </CarouselItem>
          </Carousel>
          <div class="uploadpic-upload">
            <div class="img-list"
                 :style="{ width: imgList.length ? '60px' : '0'}">{{imgList.length ? `${imgIdx + 1} / ${imgList.length}` : ''}}</div>
            <div class="upload-btn"
                 v-show="editable">
              <Button icon="md-add"
                      shape="circle"
                      @click="handleAddImgClick"
                      style="border:none;"></Button>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="item.dataType === 'float'">
        <InputNumber v-model="values[item.key]"
                     :precision='2'
                     :placeholder="placeholder"
                     :readonly="item.readonly"
                     :editable="item.editable"
                     :min='Number(item.minValue) || 0'
                     :max='Number(item.maxValue) || 999999999999'
                     :disabled="item.readonly"
                     @on-blur="handleBaseChange"
                     style="width:100%"></InputNumber>
      </template>
      <template v-else-if="item.dataType === 'multi-percent-table'">
        <multi-percent-table :value="values[item.key]"
                             :dataSource="item.options.dataSource"
                             :placeholder="placeholder"
                             :item-key="item.key"
                             :disabled="item.readonly"
                             :parent-data="values"
                             :title="item.title"
                             :yzIsChange="item.yzIsChange"
                             :isZJLY="item.isZJLY"
                             @on-change="handleChange">
        </multi-percent-table>
      </template>
      <template v-else>
        <Input v-model.trim="values[item.key]"
               :placeholder="placeholder"
               @on-blur='handleBaseChange'
               :disabled="item.readonly" />
      </template>
    </template>
    <div class="item-uploadpic"
         v-else-if="item.dataType === 'uploadpic'">
      <Carousel v-model="imgIdx"
                v-if="this.imgList.length"
                class="uploadpic-carousel"
                :height="162"
                dots="none">
        <CarouselItem v-for="(item, idx) in imgList"
                      :key="`cal-${item.GXGUID}`">
          <img class="show-carousel"
               @click="handleImgClick(idx)"
               :src="`data:image/${item.fjlx.replace('.', '').replace('jpg', 'jpeg')};base64,${item.picture}`"></img>
        </CarouselItem>
      </Carousel>
    </div>
    <div class='form-item-static-style'
         :class="{'show-underline': generateThis.baseParams && generateThis.baseParams.modCode === 'FAQC'}"
         v-else
         v-toptip='formatTip(vmodel, item)'>
      <span>{{ formatTip(vmodel, item) }}</span>
    </div>
  </FormItem>
</template>
<script>
import ComboxSelect from '_c/combox-select'
import DialogTreeSelect from '_c/dialog-tree-select'
import TableSelect from '_c/table-select'
import CryptionInput from '_c/form/cryption-input'
import MultiPercentTable from '_c/multi-percent-table'
import ModalTableSelect from '_c/table/modal-table-select'
// import ViewImg from './view-img'
// import AddImg from './add-img'
// import { getPictureList } from '@/api/fa/fa-kpbz'
let validateMoney = null
let validateMaxLength = null
let validateNumber = null
export default {
  name: 'FormGroupItem',
  components: { ComboxSelect, DialogTreeSelect, TableSelect, CryptionInput, MultiPercentTable, ModalTableSelect },
  data () {
    validateMoney = (rule, value, callback) => {
      if (rule.required && !value) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    }
    validateNumber = (rule, value, callback) => {
      if (rule.required && (value === '' || value === undefined || value === null)) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    }
    validateMaxLength = (rule, value, callback) => {
      if (value.length > rule.maxLength) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    }
    return {
      showTablePageSelectClearIcon: false,
      imgIdx: 0,
      imgList: [],
      picParams: {},
      error: '',
      itemAttr: [] // 携带附加数据
    }
  },
  directives: {
    toptip: {
      inserted (el, binding) {
        let childDom = document.createElement('div')
        function showTip () {
          let textSpan = el.children[0]
          let text = textSpan.textContent
          let textWdith = textSpan.offsetWidth
          let elWidth = el.offsetWidth
          if (textSpan.nodeName !== 'SPAN') {
            childDom.getElementsByClassName('ivu-tooltip-popper')[0].style.display = 'block'
            return false
          }
          if (textWdith > elWidth) {
            el.removeChild(textSpan)
            childDom.setAttribute('class', 'form-item-static-tooltip ivu-tooltip')
            childDom.innerHTML = `<div class="ivu-tooltip-rel">${text}</div>
              <div class="ivu-tooltip-popper ivu-tooltip-dark" style="position: absolute; will-change: top, left; top: 20px; left: 0px;" x-placement="bottom-start">
                <div class="ivu-tooltip-content">
                  <div class="ivu-tooltip-arrow"></div>
                  <div class="ivu-tooltip-inner ivu-tooltip-inner-with-width" style="max-width: 200px;word-break:break-all;">${text}</div>
                </div>
              </div>`
            el.appendChild(childDom)
          }
        }
        function hideTip () {
          let textSpan = el.children[0]
          let data = textSpan.getElementsByClassName('ivu-tooltip-rel')[0]
          let text = data ? data.innerHTML : ''
          if (text && textSpan.nodeName !== 'SPAN') {
            let child = document.createElement('span')
            child.innerHTML = text
            el.innerHTML = ''
            el.appendChild(child)
            childDom.getElementsByClassName('ivu-tooltip-popper')[0].style.display = 'none'
          }
        }
        el.addEventListener('mouseenter', showTip)
        el.addEventListener('mouseleave', hideTip)
      }
    }
  },
  props: {
    item: {
      type: Object,
      default: () => { }
    },
    values: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rules: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: ''
    },
    editable: {
      type: Boolean,
      default: true
    }
  },
  inject: {
    generateThis: {
      from: 'generateThis',
      default: () => {
        return () => { }
      }
    }
  },
  computed: {
    vmodel: {
      get () {
        let type = this.item.dataType
        let value = this.values[this.item.key]
        if (type === 'date' && typeof value === 'string') {
          return this.forMatTime(value)
        }
        return value
      },
      set () { }
    }
  },
  methods: {
    handleBaseChange () {
      let type = this.item.dataType
      let value = this.values[this.item.key]
      let val = value
      if (type === 'integer') {
        val = parseInt(value) || 0
      } else if (type === 'number') {
        val = Number(value) || 0
        val = Number(val.toFixed(2))
      }
      this.$emit('on-change', this.item.key, val, this.itemAttr, this.item)
    },
    handleDateChange (time) {
      let value = this.values[this.item.key]
      let val = time ? new Date(time).Format('yyyyMMdd') : ''
      if (val !== value) {
        this.$emit('on-change', this.item.key, val, this.itemAttr, this.item)
      }
    },
    handleChange (val, list) {
      this.itemAttr = []
      if (list) {
        this.itemAttr = Array.isArray(list) ? [...list] : [{ ...list }]
      }
      let type = this.item.dataType
      // 网报中数据来源为基础字典的，只需要名称
      let onlyMC = typeof this.item.options.dataSource === 'string' && this.item.options.dataSource.indexOf('[ZD]') !== -1
      let objMap = {
        'select': (val.DM === '' || onlyMC) ? val.MC : (val.DM === undefined && val.MC === undefined) ? '' : `${val.DM} ${val.MC}`
      }
      let value = ''
      if (type === 'select') {
        value = objMap[type]
      } else {
        value = val
      }
      this.$emit('on-change', this.item.key, value, this.itemAttr, this.item)
    },
    rule () {
      let itemRule = [...this.rules]
      // 过滤空
      let type = this.item.dataType
      let tmpRule = itemRule.filter(item => Object.keys(item).length).map(item => {
        delete item.whitespace
        if (type === 'number') {
          item.type = 'number'
          item.validator = validateMoney
        } else if (type === 'integer') {
          item.type = 'number'
          item.validator = validateNumber
        }
        return item
      })
      if (this.item.dataType === 'input' || this.item.dataType === 'textarea') {
        let maxLength = Number(this.item.FIELDWIDTH) || 200
        tmpRule.push({ maxLength, message: `输入内容不能超过${maxLength}个汉字`, validator: validateMaxLength })
      }
      return tmpRule
    },
    checkBoxFormat (title, value) {
      let map = { '1': '是', '0': '否' }
      if (!value) {
        return ''
      }
      return `${title}: ${map[value.trim()]}`
    },
    // 格式化显示 checkbox 和 加密相关
    formatTip (string, item) {
      if (item.dataType === 'checkbox') {
        return this.checkBoxFormat(item.title, this.values[item.key])
      } else if (item.dataType === 'cryption') {
        if (item.cryptionFlag === '1') { // 浏览状态下如果有权限就显示真实值，没有则显示**
          return (string === '' || !string) ? string : window.atob(string)
        } else {
          if (string !== '' && string) {
            let trueString = window.atob(string)
            let number = Math.min(parseInt((trueString.length - 1) / 2), 4)
            let startString = trueString.substr(0, number)
            let endString = trueString.substr(0 - number)
            return `${startString}******${endString}`
          } else {
            return string
          }
        }
      } else if (item.dataType === 'date') {
        return this.forMatTime(this.values[item.key])
      } else if (item.dataType === 'number') {
        return this.$utils.commafy(this.values[item.key], { fixed: 2 })
      } else {
        return string
      }
    },
    forMatTime (time) {
      if (time === '') return ''
      if (typeof time === 'string') {
        let year = time.slice(0, 4)
        let month = time.slice(4, 6)
        let date = time.slice(6, 8)
        return `${year}-${month}-${date}`
      }
      return time
    },
    // 合同收付款点击凭证号
    handleClickMore () {
      this.$emit('on-click-more')
    },
    handleTablePageSelectClick (item) {
      const _this = this
      this.$modal({
        title: item.title,
        width: 900,
        height: 470,
        zIndex: 99999,
        resize: false,
        showFooter: false,
        escClosable: true,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(ModalTableSelect, {
                props: {
                  keys: item.keys || item.key,
                  columns: item.columns,
                  dataSource: item.dataSource,
                  params: item.params
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (value) {
                    $modal.close()
                    _this.handleChange(value)
                  }
                }
              })
            ]
          }
        }
      })
    },
    // handleTablePageSelectClear () {
    //   this.handleChange({})
    // },
    // 获取已经上传的图片
    // getImgList () {
    //   let params = {
    //     GSDM: this.generateThis.baseParams.gsdm,
    //     KJND: '-1',
    //     DJLX: 'FA_KPImage',
    //     IMGID: this.generateThis.imgId,
    //     MODCODE: this.generateThis.baseParams.modCode,
    //     times: Date.now()
    //   }
    //   if (this.generateThis.baseParams.ACTIONFLAG === 'M') {
    //     params.GDDM = this.generateThis.baseParams.gddm
    //   }
    //   getPictureList(params).then(res => {
    //     this.imgList = res.data || []
    //   })
    // },
    // 新增图片弹框
    // handleAddImgClick () {
    //   const _this = this
    //   this.$modal({
    //     title: '编辑图片',
    //     resize: false,
    //     width: 1000,
    //     height: 650,
    //     zIndex: 9999,
    //     showFooter: false,
    //     escClosable: true,
    //     slots: {
    //       default: ({ $modal }, h) => {
    //         return [
    //           h(AddImg, {
    //             props: {
    //               imgList: _this.imgList,
    //               picParams: _this.picParams,
    //               baseParams: _this.generateThis.baseParams,
    //               imgId: _this.generateThis.imgId
    //             },
    //             on: {
    //               imgreturn (val) {
    //                 _this.imgList = val
    //                 if (_this.imgIdx > _this.imgList.length - 1) {
    //                   _this.imgIdx = _this.imgList.length ? _this.imgList.length - 1 : 0
    //                 }
    //               }
    //             }
    //           })
    //         ]
    //       }
    //     }
    //   })
    // },
    // 查看图片
    // handleImgClick (idx) {
    //   const _this = this
    //   this.$modal({
    //     title: '查看图片',
    //     resize: false,
    //     width: 1000,
    //     height: 650,
    //     zIndex: 9999,
    //     showFooter: false,
    //     escClosable: true,
    //     slots: {
    //       default: ({ $modal }, h) => {
    //         return [
    //           h(ViewImg, {
    //             props: {
    //               idx,
    //               imgList: _this.imgList,
    //               baseParams: _this.generateThis.baseParams,
    //               imgId: _this.generateThis.imgId,
    //               readonly: !_this.editable
    //             },
    //             on: {
    //               close () {
    //                 $modal.close()
    //               },
    //               imgreturn (val) {
    //                 _this.imgList = val
    //                 if (_this.imgIdx > _this.imgList.length - 1) {
    //                   _this.imgIdx = _this.imgList.length ? _this.imgList.length - 1 : 0
    //                 }
    //               }
    //             }
    //           })
    //         ]
    //       }
    //     }
    //   })
    // }
  },
  created () {
    // 主要是为了清除校验结果使用。
    // 当进入页面直接点击确定后，表单进行了检验.
    // 但是后续根据公式计算出了结果，校验结果未清空(不能优化为箭头函数, this指向会不正确)
    this.$watch(function () {
      return this.values[this.item.key]
    }, function (val) {
      if (val) { // 其他情况依赖表单自身校验
        this.$emit('on-validateField', this.item.key)
      }
    })
    if (this.item.dataType === 'uploadpic') {
      this.picParams = {
        GSDM: this.generateThis.baseParams.gsdm,
        KJND: '-1',
        ZTH: this.generateThis.baseParams.zth,
        MODCODE: this.generateThis.baseParams.modCode,
        DJLX: '-1',
        DJID: this.generateThis.imgId,
        TOTALSIZE: 0
      }
    }
  },
  mounted () {
    // if (this.item.dataType === 'uploadpic') {
    //   this.getImgList()
    // }
  }
}
</script>
<style lang="less">
@import './form-group-item.less';
</style>
