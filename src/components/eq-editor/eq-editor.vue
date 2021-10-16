<template>
  <Modal v-model="modal"
         :draggable='true'
         title="公式编辑器"
         width="700px">
    <div class="eq-editor">
      <Input class="eq-editor-input"
             style="width:450px;"
             ref="textarea"
             placeholder="公式内不能出现空格"
             v-model="eq.text"
             type="textarea"
             :rows="20" />
      <div class="eq-item-groups"
           width=240>
        <div class="eq-editor-keyboard">
          <span class="boardkey"
                :class="{'sum':key.text==='sum'}"
                v-for="(key,index) in keyboard"
                :key="`${index}`"
                @click="setEQ(key.text, key.text)">
            <Poptip trigger="hover" :content='key.tip' v-if='key.tip'>
               {{key.text}}
            </Poptip>
            <span v-else>{{key.text}}</span>
          </span>
        </div>
        <div class="eq-editor-item">
          <Tree ref="tree"
                :data="billTreedata"
                @on-select-change="handleItemSelected"></Tree>
        </div>
      </div>
    </div>
    <div slot="footer">
      <Button type="text"
              size="large"
              @click="() => modal = false">取消</Button>
      <Button type="primary"
              size="large"
              @click="handleClickOk">确定</Button>
    </div>
  </Modal>
</template>
<script>
import './eq-editor.less'
import eqMixin from './eq-mixin.js'
import { KEYBOARD, EXPRESSIOON_LIST } from '@/api/pub/keyboard'
export default {
  name: 'EqEditor',
  props: {
    billTreedata: {
      type: Array,
      default: () => []
    },
    itemData: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      modal: false,
      eq: { text: '', val: '' },
      keyboard: KEYBOARD,
      cursePos: 0,
      valJson: {},
      metaObj: {}
    }
  },
  mixins: [eqMixin],
  methods: {
    show () {
      this.modal = true
      this.itemData.options = this.itemData.options || {}
      this.eq = this.itemData.options.eq || { text: '', val: '' }
    },
    // 点击确定
    handleClickOk () {
      this.eq.val = this.backAnalysis()
      this.itemData.options.eq = Object.assign(this.eq)
      this.$emit('on-ok', Object.assign(this.eq))
      this.modal = false
    },
    // 点击树节点
    handleItemSelected (aNode, node) {
      if (node.type !== 'item') return false
      this.setEQ(`[${node.parentTitle}.${node.title}]`, `[${node.parentTitle}.${node.key}]`)
    },
    // 翻译公式
    setEQ (text, val) {
      if (val === 'C') {
        this.eq = { text: '', val: '' }
        return false
      }
      text = EXPRESSIOON_LIST.find(item => item.key === val) || { value: text }
      this.eq.text += text.value
      this.insertAtCaret(text.value)
    },
    // 设置光标位置
    setCursePos (offset = 0) {
      let textObj = this.$refs.textarea.$el.childNodes[0]
      setTimeout(() => {
        let pos = this.cursePos - offset
        textObj.focus()
        textObj.setSelectionRange(pos, pos)
      }, 20)
    },
    // 拼接公式
    insertAtCaret (textFeildValue) {
      let textObj = this.$refs.textarea.$el.childNodes[0]
      if (textObj.setSelectionRange) {
        let rangeStart = textObj.selectionStart
        let rangeEnd = textObj.selectionEnd
        let tempStr1 = textObj.value.substring(0, rangeStart)
        let tempStr2 = textObj.value.substring(rangeEnd)
        this.eq.text = tempStr1 + textFeildValue + tempStr2
        this.cursePos = (tempStr1 + textFeildValue).length
        let position = EXPRESSIOON_LIST.find(item => item.value === textFeildValue) ? 1 : 0
        this.setCursePos(position)
      } else {
        this.$fn.warning({ desc: '浏览器不支持该方法' })
      }
    },
    // 公式转化。将文字转化为字段。
    backAnalysis () {
      let billTreedata = this.billTreedata[0].children
      this.valJson = {} // 基础信息.单据编号: 基础信息.DJBH
      for (let arear in billTreedata) {
        let arearTitle = billTreedata[arear].title
        for (let item in billTreedata[arear].children) {
          let key = billTreedata[arear].children[item].key
          let title = billTreedata[arear].children[item].title
          this.valJson[`${arearTitle}.${title}`] = `${arearTitle}.${key}`
        }
      }
      let mqArray = this.eq.text.split(/\[|]/)
      for (let index in mqArray) {
        mqArray[index] = this.valJson[mqArray[index]] ? `[${this.valJson[mqArray[index]]}]` : mqArray[index]
      }
      return mqArray.join('')
    }
    // 校验
    // getFormulaCheck (result) {
    //   if (/^[=+*!/-]/.test(result)) {
    //     // 运算符开头
    //     return '错误提示，公式不可以运算符开头'
    //   } else if (/[=+*!/-]$/.test(result)) {
    //     // 运算符结尾
    //     return '错误提示，公式不可以运算符结尾'
    //   } else if (/[=+*!/-]{2,}/.test(result)) {
    //     // 错误情况，运算符连续
    //     return '错误提示，运算符不可连续出现'
    //   } else if (/\(\)/.test(result)) {
    //     // 空括号
    //     return '错误提示，公式中不允许存在空括号'
    //   } else if (/\)[=+*!/-]/.test(result)) {
    //     // 错误情况，)后面不是运算符
    //     return '错误提示，)后面不是运算符'
    //   } else if (/[=+*!/-]\(/.test(result)) {
    //     // 错误情况，(前面不是运算符
    //     return '错误提示，(前面不是运算符'
    //   } else if (/\([=+*!/-]/.test(result)) {
    //     // 错误情况，(后面是运算符
    //     return '错误提示，(后面是运算符'
    //   } else if (/[=+*!/-]\)/.test(result)) {
    //     // 错误情况，)前面是运算符
    //     return '错误提示，)前面是运算符'
    //   } else {
    //     return ''
    //   }
    // }
  }
}
</script>
