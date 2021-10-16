<template>
  <vuc-panel v-bind="$attrs">
    <!--     <span slot="header">
      <Icon @click="handleOpenDrawer"
            type="ios-settings-outline" />
    </span> -->
    <div :class="[`${prefixCls}`]">

      <div>
        <section v-for="(item,idx) in pageList"
                 :key="`${_uid}_${idx}`"
                 :style="itemStyle"
                 @click="handleTurnToPage(item)">
          <div :class="[`${prefixCls}-item`,`bg${idx%5}`]">
            <span :class="[`icon-${item.modCode}`,`${prefixCls}-item-icon`]"></span>
            <span :class="[`${prefixCls}-item-text`]">{{item.gnmc}}</span>
          </div>
        </section>
        <!--         <span v-if="ipage>0"
              :class="[`${prefixCls}-arrow`,`left`]"
              @click="handleBack">
          <Icon type="ios-arrow-back" />
        </span>
        <span v-if="ipage<pages-1"
              :class="[`${prefixCls}-arrow`,`right`]"
              @click="handleForward">
          <Icon type="ios-arrow-forward" />
        </span> -->
        <div style="clear:both;"></div>
      </div>
      <div :class="[`${prefixCls}-footer`]">
        <span v-for="(page,idx) in pages"
              @click="handleChangePage(idx)"
              :key="`tag_${idx}`"
              :class="[`${prefixCls}-footer-tag`,idx===ipage?`active`:``]">
        </span>
        <span v-if="!$attrs.showHeader"
              @click="handleOpenDrawer"
              :class="[`${prefixCls}-footer-tag`,`active`]"
              style="font-weight:900;color:#fff;">
          <Icon type="md-add"
                size="12"
                style="position:absolute;top:0px;left:10px;" />
        </span>
      </div>
      <!-- 常用功能设置begin -->
      <Drawer v-model="showDrawer"
              width="85%"
              slot="drawer"
              :inner="false"
              :transfer="true"
              :styles="{padding:'0px 0px 0px 0px',height:'calc(100% - 47px)'}"
              placement="right">
        <div slot="header">
          <Icon custom="icon-joint-search"
                :size="18"
                style="margin-right:5px"></Icon>
          <b>工作台常用功能设置</b>
          <Checkbox v-model="onlyChecked"
                    style="margin-left:30%;">隐藏未设置</Checkbox>
        </div>
        <much-used-menu-config :show-drawer="showDrawer"
                               :much-used-list="muchUsedList"
                               :only-checked="onlyChecked"
                               @on-change="handleConfigChange"></much-used-menu-config>
      </Drawer>
      <!-- 常用功能设置end -->
    </div>

  </vuc-panel>
</template>

<script>
import { getCommonFunctions, saveCommon } from '@/api/home/home'
import MuchUsedMenuConfig from './much-used-menu-config.vue'
export default {
  name: 'MuchUsedMenu',
  components: { MuchUsedMenuConfig },
  data () {
    return {
      showDrawer: false,
      prefixCls: 'much-used-menu',
      itemWidth: 180,
      itemHeight: 60,
      muchUsedList: [],
      onlyChecked: false,
      cols: 4,
      rows: 1,
      pages: 3,
      ipage: 0,
      pageSize: 4
    }
  },
  computed: {
    pageList () {
      const { ipage, pageSize } = this
      return this.muchUsedList.slice(ipage * pageSize, (ipage + 1) * pageSize)
    },
    itemStyle () {
      return `display:inline-block;float:left;padding:4px;height:${this.itemHeight}px;width:${100 / this.cols}%;line-height:${this.itemHeight - 8}px;`
    }
  },
  watch: {
    '$attrs': {
      deep: true,
      handler (newVal, oldVal) {
        // console.log(newVal, oldVal)
        this.updateItemSize()
      }
    },
    showDrawer () {
      if (!this.showDrawer) {
        this.saveMuchUsedMenu()
      }
    }
  },
  methods: {
    handleBack () {
      this.ipage = this.ipage - 1
    },
    handleForward () {
      this.ipage = this.ipage + 1
    },
    handleChangePage (idx) {
      this.ipage = idx
    },
    handleTurnToPage (item) {
      this.$router.push({
        name: item.webPath,
        params: { modCode: item.modCode, title: item.gnmc, id: item.gnbm, gnflDm: item.gnbm } })
    },
    handleOpenDrawer () {
      this.showDrawer = true
    },
    handleConfigChange (list) {
      // console.log(list)
      this.muchUsedList = list
      this.pages = Math.ceil(this.muchUsedList.length / this.pageSize)
    },
    /* 保存常用功能 */
    saveMuchUsedMenu () {
      let params = {}
      params.gnList = []
      this.muchUsedList.forEach(function (value, i) {
        let obj = {}
        obj.gnbm = value.gnbm || value.gnflDm
        obj.gnmc = value.gnmc || value.gnflMc
        obj.menuCode = value.menuCode
        params.gnList.push(obj)
      })
      params.gsdm = this.$store.getters.env.gsdm
      params.kjnd = this.$store.getters.env.kjnd
      params.zth = this.$store.getters.env.zth

      saveCommon(params)
    },
    // 设计单个块的宽高
    updateItemSize () {
      const offsetHeight = this.$attrs.showHeader ? 80 : 24
      this.cols = Math.floor((this.$attrs.width - 8) / 180)
      this.rows = Math.floor((this.$attrs.height - offsetHeight) / 68)
      if (this.rows === 0) {
        this.rows = 1
      }
      if (this.cols === 0) {
        this.cols = 1
      }
      this.pageSize = this.cols * this.rows
      this.itemWidth = Math.round((this.$attrs.width - 8) / this.cols)
      // this.itemHeight = Math.round((this.$attrs.height - offsetHeight) / this.rows)

      this.pages = Math.ceil(this.muchUsedList.length / this.pageSize)
    },
    //
    getMuchUsedMenu () {
      let params = {
        'gsdm': this.$store.getters.env.gsdm,
        'kjnd': this.$store.getters.env.kjnd,
        'ywrq': this.$store.getters.env.loginDate.replace(/-/g, ''),
        'zth': this.$store.getters.env.zth,
        'productType': ',XZ_G,'
      }
      getCommonFunctions(params).then(
        res => {
          this.muchUsedList = res.data
          /*           for (let i = 0; i < 20; i++) {
                      this.muchUsedList.push({ modCode: 'GLN', gnmc: '测试常用功能页签111' + i })
                    } */
          this.pages = Math.ceil(this.muchUsedList.length / this.pageSize)
        }
      )
    },
    $mounted () {
      this.updateItemSize()
      this.getMuchUsedMenu()
    }
  },
  mounted () {
    this.$mounted()
  }
}
</script>

<style lang="less" scoped>
@import "./much-used-menu.less";
</style>
