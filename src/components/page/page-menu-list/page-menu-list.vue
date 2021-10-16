<template>
  <div class="page-menu-list">
    <Menu width="100">
      <div v-for="(item,index) in menuList"
           :key="index">
        <MenuItem :name='index'
                  @click.native="getMenuItem(item)">{{item[menuKey]}}
        <div class="actions fr"
             :key="`actions_${index}`"
             v-if="item.action">
          <I class="icon-style icon-Password"
             title="公钥"
             @click.stop="editModal(item,'copy')" />
          <I class="icon-style icon-edit"
             title="编辑"
             @click.stop="editModal(item,'edit')" />
          <I class="icon-style icon-delete"
             title="删除"
             @click.stop="deleteMenuInfo(item,'del')" />
        </div>
        </MenuItem>
      </div>
    </Menu>
  </div>
</template>

<script>
export default {
  name: 'pageMenuList',
  components: {},
  props: {
    menuList: {
      type: Array,
      default: () => []
    },
    menuKey: {
      type: String,
      default: ''
    }
  },
  watch: {},
  data () {
    return {

    }
  },
  methods: {
    getMenuItem (item) {
      this.$emit('on-page-change', item)
    },
    editModal (item, me) {
      this.$emit('on-page-change', item, me)
    },
    deleteMenuInfo (item, me) {
      this.$emit('on-page-change', item, me)
    }
  },
  created () {

  }
}
</script>

<style lang="less" scoped>
  @import 'page-menu-list.less';
</style>
