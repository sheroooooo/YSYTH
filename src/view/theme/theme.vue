<template>
  <Layout>
    <Sider hide-trigger
           :style="{background: '#fff',width:'180px'}">
      <Menu :style="{width:'200px',height:height}"
            :active-name="getTheme()"
            @on-select="handleSelect">
        <MenuGroup title="可选主题">
          <MenuItem name="theme-default">
          <Icon type="md-document" /> 默认主题
          </MenuItem>
          <!--           <MenuItem name="theme-moon-sea">
          <Icon type="md-chatbubbles" /> 海上明月
          </MenuItem>
          <MenuItem name="theme-big-blue">
          <Icon type="md-chatbubbles" /> 碧海蓝天
          </MenuItem> -->
          <!-- 2020-06-11 新增粉色 -->
          <MenuItem name="theme-red">
          <Icon type="md-chatbubbles" /> 红色主题
          </MenuItem>
          <!-- 2020-06-11 新增绿色 -->
          <MenuItem name="theme-green">
          <Icon type="md-chatbubbles" /> 绿色主题
          </MenuItem>
           <!-- 2020-06-22 新增蓝色 -->
          <MenuItem name="theme-blue">
          <Icon type="md-chatbubbles" /> 蓝色主题
          </MenuItem>
        </MenuGroup>
      </Menu>
    </Sider>
    <Content :style="{height:height,padding:'20px'}">
      <data-table-demo></data-table-demo>
    </Content>
  </Layout>
</template>

<script>
import DataTableDemo from './data-table-demo.vue'
import {
  mapMutations,
  mapGetters
} from 'vuex'
export default {
  name: 'Theme',
  components: { DataTableDemo },
  computed: {
    height () {
      return (this.wrapHeight() - 10) + 'px'
    }
  },
  inject: ['wrapHeight'],

  methods: {
    ...mapMutations([
      'setTheme'
    ]),
    ...mapGetters([
      'getTheme'
    ]),
    handleSelect (name) {
      this.$store.commit('setTheme', name)
    }
  }
}
</script>

<style>

</style>
