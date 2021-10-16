<template>
  <div class="page-double-table-ywmb">
    <Form :label-width="labelWidth">
     <template v-for="(item, index) in ywmbFormItem" >
       <FormItem :label='item.label' :key=index>
        <Input icon="ios-more"
               :readonly=true
               v-model="item.FLH"
               @click.native="handleSetXzpzbb(index)" />
      </FormItem>
     </template>
    </Form>
    <div class="footer-btn">
      <Button type="primary"
              class="submit-btn"
              @click="handleSubmit()">确定</Button>
      <Button class="submit-btn"
              @click="handleCancel()">取消</Button>
    </div>
  </div>
</template>

<script>
import clonedeep from 'clonedeep'
import PageDoubleTableSzywml from './page-double-table-szywmb/page-double-table-szywmb'
export default {
  components: {},
  props: {
    ywmbFormItem: {
      type: Array,
      default: () => []
    },
    baseParams: {
      type: Object,
      default: () => {}
    },
    labelWidth: {
      type: Number,
      default: 40
    }
  },
  data () {
    return {
      showPzmbDrawer: true,
      checkboxStatus: {
        showSYS: true,
        showKMXZ: true,
        appendTo: true
      }
    }
  },
  methods: {
    handleSetXzpzbb (index) {
      this.selectVoucherModal(index)
    },
    selectVoucherModal (index) {
      const _this = this
      this.$modal({
        title: '选择凭证模板',
        resize: false,
        showFooter: false,
        width: 1300,
        height: 607,
        minWidth: 400,
        minHeight: 300,
        slots: {
          default: ({
            $modal
          }, h) => {
            return [
              h(PageDoubleTableSzywml, {
                props: {
                  showPzmbDrawer: _this.showPzmbDrawer,
                  baseParams: _this.baseParams,
                  checkboxStatus: _this.checkboxStatus
                },
                on: {
                  close (showSYS, showKMXZ, appendTo) {
                    _this.checkboxStatus = { showSYS, showKMXZ, appendTo }
                    $modal.close()
                  },
                  complete (val, showSYS, showKMXZ, appendTo) {
                    _this.checkboxStatus = { showSYS, showKMXZ, appendTo }
                    _this.ywmbFormItem[index].FLH = clonedeep(val)
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    handleSubmit () {
      this.$emit('complete', this.ywmbFormItem)
    },
    handleCancel () {
      this.$emit('close')
    }
  },
  mounted () { }
}
</script>
<style lang="less">
  @import './page-double-table-ywmb.less';
</style>
