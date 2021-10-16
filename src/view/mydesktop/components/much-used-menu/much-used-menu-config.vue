<template>
  <div :class="[`${prefixCls}`]">
    <template v-for="(mod,imod) in menuTree">
      <section v-if="mod.children && mod.children.length && showMode(mod)"
               :key="`mod_${imod}`">
        <h3 :class="[`${prefixCls}-mod`]">
          <span class="private-bgcolor"></span>{{mod.title}}
        </h3>
        <template v-for="(sub,isub) in mod.children">
          <div v-show="showSub(sub)"
               class="u8-box"
               :key="`sub_${isub}`">
            <div style="width:100px;font-weight:900;"
                 class="u8-box-center"> {{sub.title}}</div>
            <div class="u8-bf1">
              <template v-for="(menu,imenu) in sub.children">
                <span v-show="isShow(menu)"
                      :class="[`${prefixCls}-menu`]"
                      :key="`menu_${imenu}`"
                      @click="handleUpdateMenu(menu)">
                  <Icon type="md-checkmark-circle-outline"
                        style="margin-right:4px;"
                        size="16"
                        :class="checked(menu)?'private-color':'checkbox'" />
                  <span :class="checked(menu)?'private-color':''">{{menu.title}}</span>

                </span>
              </template>
            </div>
          </div>
        </template>
      </section>
    </template>
  </div>
</template>

<script>
import { getMenu } from '@/api/home/home'
export default {
  name: 'MuchUsedMenuConfig',
  props: {
    showDrawer: {
      type: Boolean,
      default: false
    },
    muchUsedList: {
      type: Array,
      default: () => []
    },
    onlyChecked: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      prefixCls: 'much-used-menu-config',
      menuTree: []
    }
  },
  computed: {
    checked (menu) {
      return (menu) => {
        return this.muchUsedList.findIndex(item => item.menuCode === menu.menuCode) >= 0
      }
    },
    isShow (menu) {
      return (menu) => {
        if (this.onlyChecked) {
          return this.muchUsedList.findIndex(item => item.menuCode === menu.menuCode) >= 0
        }
        return true
      }
    },
    showMode (mod) {
      return (mod) => {
        if (this.onlyChecked) {
          const { muchUsedList } = this
          return mod.children.findIndex(sub => {
            return sub.children.findIndex(menu => {
              return muchUsedList.findIndex(item => item.menuCode === menu.menuCode) >= 0
            }) >= 0
          }) >= 0
        }
        return true
      }
    },
    showSub (sub) {
      return (sub) => {
        if (this.onlyChecked) {
          const { muchUsedList } = this
          return sub.children.findIndex(menu => {
            return muchUsedList.findIndex(item => item.menuCode === menu.menuCode) >= 0
          }) >= 0
        }
        return true
      }
    }
  },
  watch: {
    showDrawer () {
      if (this.showDrawer) {
        this.getMenuData()
      }
    }
  },
  methods: {
    getMenuData () {
      let params = {
        'gsdm': this.$store.getters.env.gsdm,
        'kjnd': this.$store.getters.env.kjnd,
        'ywrq': this.$store.getters.env.loginDate.replace(/-/g, ''),
        'zth': this.$store.getters.env.zth,
        'productType': ',XZ_G,'
      }
      getMenu(params).then(
        res => {
          this.menuTree = res.data
        }
      )
    },
    handleUpdateMenu (menu) {
      const idx = this.muchUsedList.findIndex(item => item.menuCode === menu.menuCode)
      if (idx >= 0) {
        // eslint-disable-next-line
        this.muchUsedList.splice(idx, 1)
      } else {
        menu.gnmc = menu.gnmc || menu.title
        menu.gnbm = menu.gnflDm || ''
        // eslint-disable-next-line
        this.muchUsedList.push(menu)
      }
      this.$emit('on-change', this.muchUsedList)
    }
  }
}
</script>

<style lang="less">
.much-used-menu {
    &-config {
        padding: 16px;
        &-mod{
          padding:4px;
          margin-bottom:8px;
          border-bottom:1px #d1d1d1 dotted;
          span{
            display: inline-block;
            width:12px;
            height:12px;
            margin-right:8px;
            border-radius: 50%;
          }
        }
        .u8-box{
          padding:8px;
        }
        &-menu {
            display: inline-block;
            padding: 4px 8px;
            margin:4px;
            border-radius: 2px;
            cursor: default;
            &:hover{
                box-shadow: 0px 0px 5px #c1c1c1;
                -webkit-box-shadow: 0px 0px 6px #c1c1c1;
            }
.checkbox{
  color:#ccc;
}
        }
    }
}
</style>
