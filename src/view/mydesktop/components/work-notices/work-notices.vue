<template>
  <vuc-panel v-bind="$attrs">
    <!--     <span slot="header">
      <Icon @click="handleOpenMore"
            custom="icon-more" />
    </span> -->
    <div style="padding-bottom:16px;">
      <ul :class="[`${prefixCls}`]">
        <li v-for="(item,idx) in noticeList"
            :key="`notice_${idx}`"
            @click="handleTurntoPage(item)">{{item.title}}
          <span class="info-date">{{infoDate(item)}}</span>
        </li>
      </ul>
      <span style="position:absolute;right:8px;bottom:0px;padding:8px;cursor:pointer;"
            @click="handleOpenMore">
        <img src="../../../../assets/images/more.gif">
      </span>
    </div>
  </vuc-panel>
</template>

<script>
import { getPtInfoList } from '@/api/home/home'
import config from '@/config'
export default {
  name: 'WorkNotices',
  inject: ['turnToPage'],
  data () {
    return {
      prefixCls: 'work-notices',
      pageSize: 8,
      noticeList: []
    }
  },
  computed: {
    infoDate (item) {
      return (item) => item.date.substr(0, 4) + '-' + item.date.substr(4, 2) + '-' + item.date.substr(6, 2)
    }
  },
  methods: {
    handleOpenMore () {
      let route = {
        name: 'WorkNoticesList',
        params: {
          title: '工作通知',
          id: 'nt-8'
        }
      }
      // this.$router.push(route)
      this.turnToPage(route)
    },
    handleTurntoPage (item) {
      const { infoId } = item
      window.open(config.baseUrl.pro + '/index.html#article/' + infoId.toString(), '_blank')
    },
    getNotices () {
      getPtInfoList({
        gzt: 1,
        itypeId: 8,
        pageSize: this.pageSize,
        'ywrq': this.$store.state.app.env.loginDate.split('-').join('')
      }).then(
        res => {
          this.noticeList = res.data.slice(0, this.pageSize)
        }
      )
    },
    $mounted () {
      // console.log(this.$attrs)
      let height = this.$attrs.height - 16
      if (this.$attrs['show-header']) {
        height = height - 50
      }
      this.pageSize = Math.floor(height / 30)
      this.getNotices()
    }
  },
  mounted () {
    this.$mounted()
  }
}
</script>
<style lang="less">
.work-notices{
  padding:8px 16px;
  list-style:none;
  cursor:default;
  li{
    position: relative;
    list-style: none;
    padding:0px 80px 0px 16px;
    height:30px;
    line-height:30px;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover{
      color:#116cbf;
    }
    &::before{
      position: absolute;
      content: ' ';
      top: 10px;
      left: 0px;
      width: 8px;
      height: 8px;
      background: #dfdeaf;
      border-radius: 2px;
    }
    .info-date{
      position: absolute;
      right:0px;
      top:0px;
    }
  }
}
</style>
