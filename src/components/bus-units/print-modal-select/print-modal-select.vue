<template>
  <div class="print-modal-select">
    <Layout>
      <Sider class="flow-config-left"
             width=366>
        <vue-scroll>
          <div class="config-body"
               :style="{'height':configHeight+'px'}">
            <div style="padding:10px;">
              <Input v-model="searchText"
                     suffix="ios-search"
                     placeholder="请输入查询内容"
                     style="width:340px;" />
            </div>
            <Menu v-if="data.length>0"
                  :open-names="[data[0].COUNT]"
                  ref="billModalMenu"
                  accordion=true
                  style="min-height:100%;width:366px;">
              <Submenu v-for="(mi,idx) in data"
                       :name="mi.COUNT"
                       :key="`${_uid}_${idx}`">
                <template slot="title">
                  {{title}}
                </template>
                <template v-for="(sm,idx) in printData.LIST">
                  <MenuItem v-if="matchText(sm)"
                            :key="`${_uid}_${idx}`"
                            :name="sm.DJLXID"
                            @click.native="handlMenuSelect(sm)">
                  <Icon type="md-print"
                        :key="`${idx}`" /> {{sm.BZ}}
                  </MenuItem>
                </template>
              </Submenu>
            </Menu>
          </div>
        </vue-scroll>
      </Sider>
    </Layout>
    <div class="footer-btn">
      <Button type="primary"
              class="submit-btn"
              @click="handleOk">确定</Button>
      <Button class="submit-btn"
              @click="handleCancel">取消</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PrintModalSelect',
  props: {
    printData: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      title: '所有打印模板',
      configHeight: '120',
      selectRow: {},
      searchText: '',
      data: []
    }
  },
  methods: {
    handleOk () {
      this.$emit('complete', this.selectRow)
    },

    handleCancel () {
      this.$emit('close')
    },

    handlMenuSelect (val) {
      this.selectRow = val
    },
    matchText (item) {
      return item.BZ.indexOf(this.searchText) >= 0
    }
  },
  mounted () {
    this.data = []
    this.data[0] = this.printData
  }
}
</script>
<style lang="less">
@import './print-modal-select.less';
</style>
