
<template>
  <div class="page-sider-tree-org">
    <Card class="sider-tree-card">
      <page-sider-tree :treelist=treelist
                       :root-name='rootName'
                       @on-change=handleOnChange></page-sider-tree>
    </Card>
  </div>
</template>

<script>
import pageSiderTree from '_c/page/page-sider-tree'
import { getUnitTree } from '@/api/sa/sa-users'
export default {
  name: 'pageSiderTreeOrg',
  components: {
    pageSiderTree
  },
  props: {
    prams: {
      type: Object,
      default: () => { }
    },
    name: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      kjnd: this.$store.getters.env.kjnd,
      treelist: [],
      rootName: '全部'
    }
  },
  methods: {
    handleOnChange (val) {
      this.$emit('on-change', val)
    },
    getTreeList () {
      let prams = {
        'KJND': this.kjnd
      }
      getUnitTree(prams).then(
        res => {
          this.treelist = res.data
        }
      )
    }
  },
  created () {
    this.getTreeList()
  }
}
</script>

<style lang="less" scoped>
  @import './page-sider-tree-org.less';
</style>
