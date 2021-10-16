
<template>
  <div class="page-sider-tree-role">
    <Card class="sider-tree-card">
      <page-sider-tree :treelist=treelist
                       :root-name='rootName'
                       @on-change=handleOnChange></page-sider-tree>
    </Card>
  </div>
</template>
<script>
import pageSiderTree from '_c/page/page-sider-tree'
import { getRoleTree } from '@/api/sa/sa_role'
export default {
  name: 'pageSiderTreeRole',
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
      treelist: [],
      rootName: ''
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
      }
      this.rootName = ''
      prams = {}
      getRoleTree(prams).then(
        res => {
          this.treelist = res.data
          this.$emit('on-change', res.data[0])
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
  @import './page-sider-tree-role.less';
</style>
