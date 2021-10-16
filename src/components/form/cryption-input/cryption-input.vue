<template>
  <div class='cryption-input-wrapper'>
    <Input v-model='showInputText'
           @on-change="handleTextChange(showInputText)"
           v-bind="$attrs"
           :readonly='cryprionStute'>
    <div slot="suffix">
      <Icon v-if="cryptionFlag==='1'"
            @click.native="handleBtnClick"
            class="icon-show"></Icon>
      <!-- <Icon @click.native="handleShowMoreData(true)"
            type="ios-more"
            v-if='dataSource'></Icon> -->
    </div>
    </Input>

    <!-- 加密暂为输入框-->
    <!-- <reservation-modal :showValue='reservaModal'
                           :dataSource='dataSource'
                           :title='`选择${modalTitle}`'
                           :formStructData='[]'
                           @on-cancel='handleShowMoreData(false)'
                           @on-ok='handleReservaOk'></reservation-modal> -->
  </div>
</template>
<script>
import ReservationModal from '_c/reservation'
export default {
  name: 'CryprionInput',
  components: { ReservationModal },
  props: {
    // 字符串
    value: {
      type: String,
      default: ''
    },
    dataSource: {
      type: [Number, String],
      default: '101'
    },
    editable: {
      default: true,
      type: Boolean
    },
    modalTitle: {
      type: String,
      default: ''
    },
    modelKey: {
      type: String,
      default: ''
    },
    cryptionFlag: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showInputText: '',
      cryprionStute: false, // false为 不加密, true 为加密状态
      trueString: '', // 存储真实字符串
      base64String: '', // base64加密后的字符串
      reservaModal: false
    }
  },
  watch: {
    value (val) {
      if (val === '') {
        this.showInputText = ''
        this.base64String = ''
        this.trueString = ''
      } else {
        let reg = /^[\d+|-]+$/ // 仅支持全部为数字的情况。不支持加密英文和汉字
        let changeString = window.atob(this.value)
        if (reg.test(changeString)) {
          this.trueString = changeString // 解密
          this.showInputText = this.trueString
        } else {
          this.showInputText = val
          this.trueString = val
          this.base64String = window.btoa(val)
        }
      }
    }
  },
  methods: {
    handleBtnClick () {
      if (this.showInputText && this.showInputText.length < 3) {
        this.$fn.error({ title: '错误提示', desc: '不得小于2位' })
        return false
      }
      this.cryprionStute = !this.cryprionStute
      this.readonly = !this.readonly
      this.showInputText = this.cryprionStute ? this.formatCryprion(this.trueString) : this.trueString
    },
    handleTextChange (value) {
      value = value.replace(/[a-zA-Z]+/g, '')
      this.trueString = value
      this.base64String = window.btoa(value) // 加密
      this.$emit('on-change', this.base64String)
      this.$nextTick(() => { this.showInputText = value })
    },
    formatCryprion (string) { // 显示格式化
      if (!string) return ''
      let number = Math.min(parseInt((string.length - 1) / 2), 4)
      let startString = string.substr(0, number)
      let endString = string.substr(0 - number)
      return `${startString}******${endString}`
    },
    handleShowMoreData (value = true) {
      this.reservaModal = value
    },
    handleReservaOk (value) {
      if (this.modelKey) {
        this.showInputText = this.cryprionStute ? this.formatCryprion(value[this.modelKey]) : value[this.modelKey]
        this.handleTextChange(value[this.modelKey])
      }
      this.handleShowMoreData(false)
    },
    initString () {
      let reg = /^[\d+|-]+$/ // 仅支持全部为数字的情况。不支持加密英文和汉字
      let changeString = window.atob(this.value)
      // 判断value是否是base64.如果是base64直接解密。否则,是真实值(兼容弹出表格互相代入信息)。
      if (reg.test(changeString)) {
        this.trueString = changeString // 解密
      } else {
        this.handleTextChange(this.value) // 手动触发一次onchange.让父级变成base64
      }
      // 如果初始状态不是加密状态。那么直接显示真实值。(常见于编辑状态应该直接可以显示)
      if (this.cryprionStute) {
        this.showInputText = this.formatCryprion(this.trueString) // 格式化显示格式
      } else {
        this.showInputText = this.trueString
      }
    }
  },
  created () {
    if (this.value === '' || !this.value) return false
    this.initString()
  }

}
</script>
<style lang="less" >
.cryption-input-wrapper {
    .ivu-input-suffix {
        min-width: 30px;
        width: auto;
    }
    .ivu-input-wrapper input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
    }
    .ivu-input-wrapper input[type="number"] {
        -moz-appearance: textfield;
    }
}
</style>
