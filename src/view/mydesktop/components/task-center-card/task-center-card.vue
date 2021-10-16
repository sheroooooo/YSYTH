/*
* @name: 工作台> 任务中心
* @description: ''
* @Author: yinyg
* @Date: 2020年8月21日15:38:43
* @Last Modified by:
* @Last Modified time:
*/
<template>
  <vuc-panel v-bind="$attrs">
    <span slot="header">
      <Icon type="md-refresh"
            @click="handleFreshInfo" />
    </span>
    <div :class="[`${prefixCls}`]">
      <section :style="leftItemStyle"
               @click="handleTurnToPage('toDealwith')">
        <div :class="[`${prefixCls}-item`,`bg`]">
          <span :class="[`icon-Todolist`,`${prefixCls}-item-icon`]"></span>
          <div :class="[`${prefixCls}-item-text`]">
            <p style="font-size: 28px">{{taskInfo.UPCOMINGNUM}}</p>
            <p>待办理</p>
          </div>
        </div>
      </section>
      <section :style="rightItemStyle"
               @click="handleTurnToPage('week')">
        <div :class="[`${prefixCls}-item`,`bg`]">
          <span :class="[`icon-Week`,`${prefixCls}-item-icon`]"></span>
          <span :class="[`${prefixCls}-item-text`]">近一周已办 {{taskInfo.WEEKDONENUM}}</span>
        </div>
      </section>
      <section :style="rightItemStyle"
               @click="handleTurnToPage('month')">
        <div :class="[`${prefixCls}-item`,`bg`]">
          <span :class="[`icon-Month`,`${prefixCls}-item-icon`]"></span>
          <span :class="[`${prefixCls}-item-text`]">近一月已办 {{taskInfo.MONTHDONENUM}}</span>
        </div>
      </section>
    </div>
  </vuc-panel>
</template>
<script>
import { myApprovalNum } from '@/api/mydesktop/mydesktop.js'
export default {
  name: 'TaskCenterCard',
  data () {
    return {
      prefixCls: 'task-center-card',
      itemWidth: 180,
      itemHeight: 60,
      taskInfo: {
        UPCOMINGNUM: 0, // 待办理数量
        WEEKDONENUM: 0, // 近一周已办数量
        MONTHDONENUM: 0 // 近一月已办数量
      },
      timerCreated: false // 是否创建了定时器
    }
  },
  computed: {
    leftItemStyle () {
      return `display:inline-block;float:left;padding:4px;height:${this.itemHeight}px;width:50%;line-height:${this.itemHeight - 8}px;`
    },
    rightItemStyle () {
      return `display:inline-block;float:left;padding:4px;height:${this.itemHeight / 2}px;width:50%;line-height:${this.itemHeight / 2 - 8}px;`
    }
  },
  watch: {
    '$attrs': {
      deep: true,
      handler (newVal, oldVal) {
        // console.log(newVal, oldVal)
        this.updateItemSize()
      }
    }
  },
  methods: {
    $mounted () {
      this.updateItemSize()
      this.getMyApprovalNum()
    },
    // 刷新数据
    handleFreshInfo () {
      this.getMyApprovalNum()
    },
    // 设计单个块的宽高
    updateItemSize () {
      // console.log(this.$attrs)
      if (this.$attrs['show-header'] === false) {
        this.itemHeight = Math.round((this.$attrs.height - 13))
      } else {
        this.itemHeight = Math.round((this.$attrs.height - 58))
      }
      this.itemWidth = Math.round((this.$attrs.width - 8) / 2)
    },
    // 获取任务中心信息
    getMyApprovalNum () {
      myApprovalNum({
        GSDM: this.$store.getters.env.gsdm,
        KJND: this.$store.getters.env.kjnd,
        // ROLE: ''
        ROLE: localStorage.getItem('roleId')
      }).then(res => {
        if (res && res.status === 200) {
          this.taskInfo = res.data
          // 设置定时器，每隔15分钟请求一次接口刷新任务中心数据
          if (!this.timerCreated) {
            this.timerCreated = true // 防止创建多个定时器
            window.setInterval(this.getMyApprovalNum(), 9000000)
          }
        }
      }).catch(ret => {
      })
    },
    // 点击跳转
    handleTurnToPage (type) {
      /* switch (type) {
        case 'toDealwith':
          break
        case 'week':
          break
        case 'month':
          break
      } */
      this.$router.push({
        name: 'taskcenter',
        params: {
          cardType: type,
          id: '9606'
        }
      })
    }
  },
  mounted () {
    this.$mounted()
  }
}
</script>
<style lang="less" scoped>
@import './task-center-card.less';
</style>
