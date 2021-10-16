<style lang="less">
  @import './page-sider-tree.less';
</style>
<template>
  <div class="page-sider-tree">
    <div class="search-box">
      <Input class="search-input"
             suffix="ios-search"
             placeholder="请输入代码或名称"
             v-model="searchData"
             @on-change="searchChange" />
    </div>
    <vue-scroll>
      <div class="vue-scroll-body"
           :style="{'height':leftSiderHeight+'px'}">
        <Tree ref="tree"
              :data="filterData"
              empty-text=""
              @on-select-change='doubleClick(...arguments)'>
        </Tree>

      </div>
    </vue-scroll>
  </div>
</template>

<script>
import tool from '@/libs/toolutil'
export default {
  name: 'PageSiderTree',
  props: {
    treelist: {
      type: Array,
      default: () => []
    },
    rootName: {
      type: String,
      default: ''
    },
    offsetTop: {
      type: Number,
      default: 230
    }
  },
  data () {
    return {
      leftSiderHeight: 350,
      searchData: '',
      treeData: [], // 树结构数据源
      filterData: [] // 树结构筛选之后的数据
    }
  },
  watch: {
    treelist: {
      deep: true,
      handler: function () {
        this.pageInto()
      }
    }
  },
  methods: {
    vueEnter (cache) {
      if (!cache) {
        this.setLeftSiderHeight()
        this.pageInto()
      }
    },
    pageInto () {
      this.treeData = this.treelist.map(item => {
        delete item.children
        return item
      })
      this.filterData = tool.formatDataToTree(this.treeData, {
        pId: 'pId',
        id: 'id',
        text: 'title'
      })
      this.showrData = Object.assign(this.filterData)
    },
    setLeftSiderHeight () {
      this.leftSiderHeight = window.innerHeight - this.offsetTop
    },
    doubleClick (val) {
      this.$emit('on-change', val[0])
    },
    /* 模糊筛选树 */
    searchChange () {
      const totalData = this.treeData
      // 所有包含搜索字段节点
      let _this = this
      let containsnNodes = totalData.filter(
        item => item.title.indexOf(this.searchData) !== -1
      )
      let temp = containsnNodes // 最后筛选成的数据
      containsnNodes.forEach(function (value, i) {
        if (!value.parent) {
          return false
        } else {
          let pId = value.parent
          totalData.forEach(function (item, i) {
            if (item.id === pId) {
              if (!_this.searchFather(temp, pId)) {
                temp.push(item)
              }
            }
          })
        }
      })
      this.filterData = tool.formatDataToTree(temp, {
        parentField: 'pId',
        idFiled: 'id',
        textFiled: 'title'
      })
    }
  },
  /* mounted () {
    this.setLeftSiderHeight()
  } */
  mounted () {
    this.vueEnter(false)
  },
  activated () {
    this.vueEnter(!!this.$route.params.tabCache)
  }
}
</script>
