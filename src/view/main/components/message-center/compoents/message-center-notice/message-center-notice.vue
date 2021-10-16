<template>
  <div :class="[`${prefixCls}`]" ref='tabs'>
    <Tabs :animated="false"
          size="default"
          @on-click="handelBtnCilck">
      <div v-show="isDateGroup" :class="{'message-center-notice-dateGroup': true, 'message-center-notice-whether': !isDateGroup}">
        <Form :model="formItem">
          <FormItem prop="dateGroup">
            <Button :type="formItem.dateGroupCur==='0'?'primary':'default'"
                    class="ivu-form-item-btn"
                    size="small"
                    @click="handleDateGroupClick('0')">
              全部
            </Button>
            <Button :type="formItem.dateGroupCur==='1'?'primary':'default'"
                    class="ivu-form-item-btn"
                    size="small"
                    @click="handleDateGroupClick('1')">
              最近一周
            </Button>
            <Button :type="formItem.dateGroupCur==='2'?'primary':'default'"
                    class="ivu-form-item-btn"
                    size="small"
                    @click="handleDateGroupClick('2')">
              最近一年
            </Button>
            <DatePicker v-model="formItem.dateTimer"
                        :transfer="true"
                        placeholder="请选择日期"
                        type="datetimerange"
                        format="yyyy-MM-dd HH:mm"
                        style="width: 300px; padding-left: 20px;">
            </DatePicker>
          </FormItem>
        </Form>
      </div>
      <vue-scroll :style='{"height": isDateGroup ? "calc(100% - 52px)" : "100%"}'>
        <template v-for="(item, index) in tabsData">
          <TabPane :label="item.label" :name="item.name" :key="index">
            <div :class="[`${prefixCls}-list`]"
                 v-for="(items, index) in showDataList"
                 :key="index">
              <div :class="[`${prefixCls}-list-icon`]" :style="getCardStyle(index)"><Icon size="24" :custom="`icon-${items.MODCODE}`" /></div>
              <Col span="22" :class="[`${prefixCls}-list-content`]">
                <div :class="[`${prefixCls}-list-content-title`]">{{items.TITLE}}</div>
                <Col span="20" :class="[`${prefixCls}-list-content-text`]">
                  {{ items.prevInfo }}
                  <span @click="handelBtnJumpClick(items)">{{ items.billId }}</span>
                  {{ items.endInfo }}
                </Col>
                <Col span="4" :class="[`${prefixCls}-list-content-date`]">{{items.SENDDATE}}</Col>
              </Col>
            </div>
          </TabPane>
        </template>
      </vue-scroll>
    </Tabs>
    <div :class="`${prefixCls}-timer`" @click="handelBtnTimerClick()"><Icon type="ios-timer-outline" size="20" /></div>
  </div>
</template>
<script>
import mixin from '@/libs/app-mixin'
export default {
  name: 'MessageCenterNotice',
  props: {
    unreadData: {
      type: Array,
      default: () => []
    }
  },
  inject: ['turnToPage'],
  data () {
    return {
      prefixCls: 'message-center-notice',
      filterData: [],
      showDataList: [],
      curTabs: '0',
      isDateGroup: false,
      formItem: {
        dateTimer: ['', ''],
        dateGroupCur: '0'
      },
      tabsData: [
        {
          label: '未处理',
          name: '0',
          content: '未处理信息',
          MODCODE: 'OER',
          TITLE: '网上报销',
          DJBH: 'SQ202006290345'
        },
        {
          label: '已处理',
          name: '1',
          content: '已处理信息',
          MODCODE: 'GSP',
          TITLE: '经费申请',
          DJBH: 'SQ202006290345'
        }
      ]
    }
  },
  watch: {
    unreadData (data) {
      if (data) {
        this.initData()
        this.handelBtnCilck(this.curTabs)
      }
    },
    'formItem.dateGroupCur' (val) {
      if (val) {
        this.formItem.dateTimer = ['', '']
        this.handelBtnCilck(this.curTabs, val)
      }
    },
    'formItem.dateTimer' (val) {
      // 如果清空日期, 那么默认全部
      if (!val[0]) {
        this.formItem.dateGroupCur = this.formItem.dateGroupCur || '0'
        return true
      }
      // 如果选择了日期, 那么 将前面选择的最近一周和最近一年清空
      this.formItem.dateGroupCur = ''
      let startTime = new Date(val[0]).getTime()
      let endTime = new Date(val[1]).getTime()
      this.handelBtnCilck(this.curTabs, [startTime, endTime])
    }
  },
  methods: {
    formateMessage (message) {
      let info = message.match(/[^\w]+/g)
      let billId = message.match(/\w+/)[0]
      return { prevInfo: info[0], billId, endInfo: info[1] }
    },
    getCardStyle (idx) {
      const colors = ['#68AAFE', '#FBC500', '#65D882', '#EB6F15', '#3CC4AF']
      let style = 'background-color:' + colors[idx % 5]
      return style
    },
    handelBtnCilck (name, time) {
      this.curTabs = name
      // STATE:状态(1：已读 0：未读)   0: 未处理 1: 已处理
      let result = this.filterData.filter(item => item.STATE === name)
      let timeValue = time || this.formItem.dateGroupCur
      if (!timeValue || timeValue !== '0') {
        result = this.filterDataByTime(timeValue, result)
      }
      this.showDataList = result
    },
    handelBtnJumpClick (item) {
      this.turnToPage({ ...item.PARAMETER })
      this.$emit('turn-page')
    },
    handelBtnTimerClick () {
      this.isDateGroup = !this.isDateGroup
      this.$refs.tabs.style.setProperty('--isHeight', this.isDateGroup ? 'calc(100% - 100px)' : 'calc(100% - 48px)')
    },
    handleDateGroupClick (label) {
      this.formItem.dateGroupCur = label
    },
    filterDataByTime (val, data) {
      let currentTime = Date.now()
      let timeSecond = { 1: 604800000, 2: 31536000000 }
      return data.filter(i => {
        let { year, month, day, hour, minites } = this.utilFormateTime(i.sendDate)
        let timeString = `${year}-${month}-${day} ${hour}:${minites}`
        let productTime = new Date(timeString).getTime()
        // 最近一周和最近一年
        if (val === '1' || val === '2') {
          return (currentTime - productTime) < timeSecond[val]
        }
        // 选择了日期
        if (Array.isArray(val)) {
          return productTime >= val[0] && productTime <= val[1]
        }
      })
    },
    utilFormateTime (time) {
      let year = time.substring(0, 4)
      let month = time.substring(4, 6)
      let day = time.substring(6, 8)
      let hour = time.substring(8, 10)
      let minites = time.substring(10, 12)
      return { year, month, day, hour, minites }
    },
    initData () {
      this.filterData = this.unreadData.map(ele => {
        let formateInfo = this.formateMessage(ele.INFO)
        let item = { ...ele, ...formateInfo }
        let sendDate = item.sendDate = item.SENDDATE
        let { month, day, hour, minites } = this.utilFormateTime(sendDate)
        const SENDDATE = `${month}-${day} ${hour}:${minites}`
        const PARAMETER = item.PARAMETER ? JSON.parse(item.PARAMETER) : { DJBH: '' }
        return { ...item, SENDDATE, PARAMETER }
      })
    }
  },
  created () {
    this.initData()
    this.handelBtnCilck(this.curTabs)
  },
  mixins: [mixin]
}
</script>
<style lang="less" scoped>
  @import './message-center-notice';
  // 点击待办通知左侧按钮动态改变内容高度
  .message-center-notice {
    /deep/.ivu-tabs-content {
      height: calc(~'100% - 36px');
    }
    /deep/.ivu-tabs-bar {
      margin-bottom: 0px
    }
  }
</style>
