<template>
  <div ref="formGroup"
    class="label-group">

    <Col v-for="(item, index) in localItemList"
      :key="`${_uid}_col_${index}`"
      :span="colSpan">
    <label-item :label="item.label"
      :label-width="labelWidth"
      :text="valueList[item.name]"
      :type="item.type" />
    </Col>

  </div>
</template>
<script>
import LabelItem from '_c/form/label-item'
import clonedeep from 'clonedeep'
export default {
  name: 'LabelGroup',
  components: {
    LabelItem
  },
  data () {
    return {
      valueList: {},
      cols: 3,
      localItemList: []
    }
  },
  props: {
    itemList: {
      type: Array,
      default: () => []
    },
    labelWidth: {
      type: Number,
      default: 120
    },

    initValueList: {
      type: Object,
      default: () => { }
    },
    formFilterField: {
      type: String,
      default: ''
    }
  },
  computed: {
    colSpan () {
      return Math.floor(24 / this.cols)
    }

  },
  watch: {
    initValueList () {
      this.setValueList()
    },
    valueList: {
      handler (newVal, oldVal) {
        this.updateLocalItemList()
      },
      deep: true
    },
    itemList: {
      handler (newVal, oldVal) {
        this.localItemList = clonedeep(this.itemList)
        this.updateLocalItemList()
      },
      deep: true
    }
  },
  methods: {
    setValueList () {
      if (this.initValueList) {
        this.valueList = clonedeep(this.initValueList)
      }
    },
    updateLocalItemList () {
      if (this.formFilterField !== '' && this.valueList[this.formFilterField]) {
        let localItemList = this.itemList.filter((item) => {
          if (!item.fieldGroupID) return false
          let splits = item.fieldGroupID.split(',')
          // return splits.indexOf('1') >= 0
          return splits.indexOf(this.valueList[this.formFilterField]) >= 0
        })

        this.localItemList = localItemList.length === 0 ? this.itemList : localItemList
      }
    }
  },
  mounted () {
    this.localItemList = clonedeep(this.itemList)
    this.setValueList()
  },
  updated () {
    if (this.$refs.formGroup && $(this.$refs.formGroup.$el).width() > 0) {
      this.cols = Math.floor($(this.$refs.formGroup.$el).width() / 300)
    }
  }
}
</script>
<style lang="less">
  @import './label-group.less';
</style>
