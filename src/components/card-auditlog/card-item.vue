<template>
  <li class="card-item u8-box">
    <span class="recno">{{itemIndex+1}}</span>
    <div class="u8-bf1">
      <div v-if="itemData.auditor && itemData.adateTime">
        <span class="the-auditor">{{itemData.auditor}}</span>
        <span class="adate-time">{{itemData.adateTime}}</span>
      </div>
      <div class="node-name">{{itemData.nodeName}}</div>
      <div v-if="itemData.remark"
        class="remark">{{itemData.remark}}</div>

    </div>
  </li>
</template>
<script>
export default {
  props: {
    itemIndex: {
      type: Number,
      devault: 0
    },
    itemData: {
      type: Object,
      default: () => {}
    }
  }
}
</script>

<style lang="less" scoped>
  @import './card-auditlog.less';
</style>
