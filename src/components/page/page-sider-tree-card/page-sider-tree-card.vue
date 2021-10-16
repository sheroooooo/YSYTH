
<template>
  <div class="page-sider-tree-card">
    <Card class="sider-tree-card">
      <page-sider-tree :treelist=treelist
                       @on-change=handleOnChange></page-sider-tree>
    </Card>
  </div>
</template>
<script>
import pageSiderTree from '_c/page/page-sider-tree'
import { getPropertyCatagories } from '@/api/fa/fa-card'
export default {
  name: 'pageSiderTreeRole',
  components: {
    pageSiderTree
  },
  data () {
    return {
      treelist: []
    }
  },
  methods: {
    vueEnter (cache) {
      if (!cache) {
        this.getTreeList()
      }
    },
    handleOnChange (val) {
      this.$emit('on-change', val)
    },
    getTreeList () {
      let prams = {
        'gsdm': this.$store.state.app.env.gsdm
      }
      getPropertyCatagories(prams).then(
        res => {
          this.treelist = res.data
        }
      )
    }
  },
  created () {
    // this.getTreeList()
  },

  mounted () {
    this.vueEnter(false)
  },
  activated () {
    this.vueEnter(!!this.$route.params.tabCache)
  }
}
</script>

<style lang="less" scoped>
  @import './page-sider-tree-card.less';
</style>
