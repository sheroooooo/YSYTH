<template>
  <div class="mydesktop-csmp">
    <div>
      <Card title="常用功能">
        <div v-for="item in list"
              :key="`cygn-${item.name}`"
              class="list-item"
              @click="handleRouteClick(item)">
          <Icon :size="32"
                :custom="item.icon"
                style="margin:8px 0;" />
          <div>{{item.title}}</div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MydesktopCsmp',
  data () {
    return {
      list: [
        { title: '云上票据夹', name: 'StatisticBillFold', menuCode: 'S111', icon: 'icon-PJJ' },
        { title: '账户服务应用统计', name: '', menuCode: 'S222', icon: 'icon-TJ' },
        { title: '服务商授权管理', name: 'AuthDistribute', menuCode: 'A111', icon: 'icon-FWSSQ' }
      ]
    }
  },
  methods: {
    handleRouteClick (item) {
      this.$router.push({
        name: item.name,
        params: { ...item, id: item.menuCode }
      })
    }
  }
}
</script>

<style lang="less">
.mydesktop-csmp {
  .list-item {
    display: inline-block;
    width: 20%;
    text-align: center;
    margin-right: 8px;
    cursor: pointer;
  }
}
</style>
