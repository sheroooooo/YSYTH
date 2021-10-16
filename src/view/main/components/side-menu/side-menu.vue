<template>
  <div class="side-menu-wrapper">
    <slot></slot>
    <Menu ref="menu"
          :theme="theme"
          width="auto">
      <template v-for="(item, pIndex) in modalList">
        <template v-if="item.children">
          <MenuGroup :key="`group-${item.modCode}-${item.xh}`">
            <span v-show="!collapsed"
                  class="menu-group-title">{{item.title}}
            </span>
            <template v-for="(menu, index) in item.children">
              <side-modal-item v-if="item.menuCode"
                               :hide-title="collapsed"
                               :parent-item="menu"
                               :parentIndex='pIndex'
                               :key="`modal-${item.modCode}-${menu.menuCode}-${index}`"
                               @on-click="handleSelect"></side-modal-item>
            </template>
          </MenuGroup>
        </template>
        <template v-else>
          <side-modal-item v-if="item.menuCode"
                           :hide-title="collapsed"
                           :parent-item="item"
                           :parentIndex='pIndex'
                           :key="`modal-${item.modCode}-${item.menuCode}-${item.xh}`"
                           @on-click="handleSelect"></side-modal-item>
        </template>
      </template>
    </Menu>

  </div>
</template>
<script>
import SideModalItem from './side-modal-item.vue'
import { getUnion } from '@/libs/tools'

export default {
  name: 'SideMenu',
  components: {
    SideModalItem
  },
  props: {
    modalList: {
      type: Array,
      default () {
        return []
      }
    },
    collapsed: {
      type: Boolean
    },
    theme: {
      type: String,
      default: 'dark'
    },
    rootIconSize: {
      type: Number,
      default: 20
    },
    iconSize: {
      type: Number,
      default: 16
    },
    accordion: Boolean,
    activeName: {
      type: String,
      default: ''
    },
    openNames: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      openedNames: []
    }
  },
  methods: {
    handleSelect (subMenu) {
      this.$emit('on-select', subMenu)
    },
    getOpenedNamesByActiveName (name) {
      return this.$route.matched.map(item => item.name).filter(item => item !== name)
    },
    updateOpenName (name) {
      if (name === this.$config.homeName) this.openedNames = []
      else this.openedNames = this.getOpenedNamesByActiveName(name)
    }
  },
  computed: {
    textColor () {
      return this.theme === 'dark' ? '#fff' : '#495060'
    }
  },
  mounted () {
    this.openedNames = getUnion(this.openedNames, this.getOpenedNamesByActiveName(name))
  }
}
</script>
<style lang="less">
@import './side-menu.less';
</style>
