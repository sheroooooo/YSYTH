<template>
  <div class="c-modal-table-select">
    <Input :disabled='item.disabled || item.readonly'
           v-model.trim="vmodel"
           class='c-modal-table-select-ipt'
           @click.native="handleTablePageSelectClick(item.disabled || item.readonly)"
           @mouseover.native="showClearIcon = vmodel !== ''"
           @mouseout.native="showClearIcon = false"
           style='width:200px'>
    <Icon type="ios-more"
          slot="suffix"
          v-if="!showClearIcon" />
    <Icon type="ios-close-circle"
          slot="suffix"
          v-else
          @click.stop="handleTablePageSelectClear(item.disabled || item.readonly)" />
    </Input>
  </div>
</template>

<script>
import { getTableData } from '@/api/pub/modal-table-select'
import TablePage from '_c/table-page'
import ModalFooter from '_c/modal-footer'
import Modal from './modal'
export default {
  name: 'ModalSelect',
  props: {
    item: {
      type: Object,
      default: () => { }
    },
    value: {
      type: String,
      default: ''
    },
    itemList: {
      type: Array,
      default: () => []
    },
    initValueList: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      vmodel: '',
      showClearIcon: false
    }
  },
  watch: {
    value (val) {
      this.vmodel = val
    }
  },
  methods: {
    handleTablePageSelectClick (disabled) {
      if (disabled) return
      const _this = this
      const item = this.item
      let key = item.keys || item.key || item.name
      this.$modal({
        title: item.title || item.label,
        width: 900,
        height: 520,
        zIndex: 99999,
        resize: false,
        showFooter: false,
        escClosable: true,
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(Modal, {
                props: {
                  keys: key,
                  columns: item.columns,
                  dataSource: item.dataSource,
                  params: item.params,
                  rowKey: item.rowKey,
                  itemList: this.itemList,
                  initValueList: this.initValueList
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  complete (value) {
                    _this.$emit('on-change', value, [], key)
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    handleTablePageSelectClear (disabled) {
      if (disabled) return
      let key = this.item.key || this.item.name
      this.$emit('on-change', { [key]: '' }, [], key)
    },
  }
}
</script>

<style lang="less">
@import './modal-table-select.less';
</style>
