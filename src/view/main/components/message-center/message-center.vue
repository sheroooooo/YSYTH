<template>
  <div :class="[`${prefixCls}`]">
    <Col span="7" :class="[`${prefixCls}-left`]">
      <vue-scroll>
        <div :class="[`${prefixCls}-list`]">
          <ul>
            <li v-for="(item, index) in itemList"
                :class="{'message-center-list-cur': current === index}"
                @click="handelBtnCilck(index)"
                :key="`${item.SENDID}${item.unread}`">
              <div :class="[`${prefixCls}-list-icon`]"><Icon size="24" :custom="`icon-${item.MODCODE}`" /></div>
              <div :class="[`${prefixCls}-list-content`]">
                <div :class="[`${prefixCls}-list-content-title`]">{{item.TITLE}}</div>
                <div :class="[`${prefixCls}-list-content-text`]">{{item.INFO}}</div>
              </div>
              <div v-if="item.unread > 0" :class="[`${prefixCls}-list-unread`]">{{item.unread}}</div>
            </li>
          </ul>
        </div>
      </vue-scroll>
    </Col>
    <Col span="17" :class="[`${prefixCls}-right`]">
      <message-center-notice :unreadData="unreadData"
                             @turn-page='$emit("turn-page")'
                             ></message-center-notice>
    </Col>
  </div>
</template>
<script>
import MessageCenterNotice from './compoents/message-center-notice'
export default {
  name: 'MessageCenter',
  components: {
    MessageCenterNotice
  },
  props: {
    unreadData: {
      type: Array,
      default: () => []
    },
    unreadLength: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      prefixCls: 'message-center',
      current: 0,
      itemList: []
    }
  },
  watch: {
    unreadData (data) {
      if (data) this.getDisposeData(data)
    }
  },
  methods: {
    handelBtnCilck (index) {
      this.current = index
    },
    getDisposeData (data) {
      // 目前只有代办通知默认为第一条
      let itemFrist = this.itemList[0] || {}
      let dataFirst = data[0] || {}
      let unreadNum = data.filter(i => i.STATE === '0').length
      this.itemList[0] = {
        ...itemFrist,
        ...dataFirst,
        INFO: `您有一条新通知《${dataFirst.INFO}》`,
        unread: unreadNum || 0
      }
    }
  },
  mounted () {
    this.getDisposeData(this.unreadData)
  }
}
</script>
<style lang="less">
  @import './message-center.less';
</style>
