<template>
  <div class="combox-select">
    <Select v-model="selectValue"
            style="width:100%"
            transfer
            :disabled='disabled'
            :placeholder='placeholder'
            :clearable='clearable'
            @on-change="handleChange(selectValue, dataSources, name, selectItem)">
      <Option v-for="(item,index) in selectItem"
              :disabled="item.disabled"
              :value="transValue(item, dataSources)"
              :key="index">{{ item.name }}
      </Option>
    </Select>
  </div>
</template>
<script>
// import { getComboxData, getPostionList } from '@/api/pub/combox-select'
import mixin from '@/libs/app-mixin'
import selectMixin from './selectMixin'
// import * as em from '@/api/pub/enum-data'
export default {
  name: 'ComboxSelect',
  data () {
    return {
      // 公共入参,
      selectItem: [],
      selectValue: '',
      originalData: '' // 原先的数据
    }
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    dataSources: {
      type: String,
      default: ''
    },
    clearable: {
      type: Boolean,
      default: false
    },
    selectData: { // {name : '名称', code: '代码'}
      type: Array,
      default: () => {
        return []
      }
    },
    // 组件所在的表单数据
    parentData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getKMDM () {
      return this.parentData['KMDM|KMMC']
    }
  },
  watch: {
    value: {
      handler (val) {
        if (this.selectValue !== val) {
          let reg = new RegExp('^\\d+$')
          if (val.includes(' ')) { // 代码加名称
            this.selectValue = val
          } else if (reg.test(val)) { // 如果不是代码加名称。那么尝试只匹配代码。
            this.selectValue = this.transValue(this.selectItem.find(item => item.code === val), this.dataSources)
          } else {
            this.selectValue = val
          }
        }
      },
      immediate: true
    },
    // selectData可能更新不及时(异步传递)。导致问题.
    selectData (val) {
      this.selectItem = val.map(item => {
        return { ...item }
      })
      let reg = new RegExp('^\\d+$')
      if (reg.test(val)) { // 只匹配代码。
        this.selectValue = this.transValue(val.find(item => item.code === val), this.dataSources)
      }
    },
    dataSources (val) {
      this.getComboxSelectData(val, this.selectData, this.parentData).then(res => {
        this.selectItem = res
      })
    },
    getKMDM (val) {
      if (val && this.$route.params.webPath === 'oer_bill') {
        this.getComboxSelectData(this.dataSources, this.selectData, this.parentData).then(res => {
          this.selectItem = res
        })
      }
    }
  },
  methods: {
    vueEnter (cache) {
      this.getComboxSelectData(this.dataSources, this.selectData, this.parentData).then(res => {
        this.selectItem = res
      })
    }
  },
  mounted () {
    this.vueEnter(false)
  },
  mixins: [mixin, selectMixin]
}
</script>
<style scoped>
  .combox-select {
    position: relative
  }
</style>
