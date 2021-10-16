<template>
  <vuc-panel v-bind="$attrs">
    <div :class="[`${prefixCls}`]">
      <section :class="[`${prefixCls}-item`]">
        <div :class="[`${prefixCls}-item-count`]"
             style="background:#ffd249;">
          {{unchecked}}
        </div>
        <div :class="[`${prefixCls}-item-text`]">待审核</div>
      </section>
      <section :class="[`${prefixCls}-item`]">
        <div :class="[`${prefixCls}-item-count`]"
             style="background:#64dda0;">
          {{checked}}
        </div>
        <div :class="[`${prefixCls}-item-text`]">已审核</div>
      </section>
      <section :class="[`${prefixCls}-item`]">
        <div :class="[`${prefixCls}-item-count`]"
             style="background:#63beff;">
          {{backed}}
        </div>
        <div :class="[`${prefixCls}-item-text`]">已退回</div>
      </section>
    </div>
  </vuc-panel>
</template>

<script>
export default {
  name: 'ToDoList',
  data () {
    return {
      prefixCls: 'to-do-list',
      // 已审核
      checked: 599,
      // 未审核
      unchecked: 39,
      // 已退回
      backed: 9
    }
  }
}
</script>

<style lang="less">
.to-do-list{
  padding:16px;
  &-item{
    display: inline-block;
    width:33.33%;
    text-align:center;

    &-count{
      display:inline-block;
      width:48px;
      height:48px;
      padding-top:14px;
      border-radius: 50%;
      font-size:20px;
      color:#fff;
    }
    &-text{
      display: block;
      margin-top:8px;
      color:#333;
    }
  }

}
</style>
