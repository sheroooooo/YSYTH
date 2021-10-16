<template>
  <plg-doc-wrapper ref="plgDoc"
                   :headerConfig="[]"
                   @on-resize="docResize">
    <Row :class="[`${prefixCls}`]">
      <Col span="12"
           v-for="(item,idx) in pageData"
           :key="`nt${idx}`">
      <p :class="[`${prefixCls}-item`,`text-overflow`]"
         @click="handleTurntoPage(item)">{{item.title}}
        <span class="date">{{noticeDate(item)}}</span>
      </p>
      </Col>
    </Row>
    <Page style="position:absolute;bottom:0px;left:8px;right:8px;"
          :total='total'
          :page-size='pageSize'
          show-elevator
          show-total
          @on-change='handleChangePage' />
  </plg-doc-wrapper>
</template>

<script>
import config from '@/config'
import { getPtInfoList } from '@/api/portal/portal'
export default {
  name: 'WorkNoticesList',
  data () {
    return {
      prefixCls: 'work-notices-list',
      noticesList: [],
      height: 500,
      pageSize: 40,
      pageNumber: 1,
      total: 0
    }
  },
  computed: {
    noticeDate (item) {
      return (item) => {
        const date = item.date
        return date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2)
      }
    },
    pageData () {
      const startNumber = (this.pageNumber - 1) * this.pageSize
      return this.noticesList.slice(startNumber, startNumber + this.pageSize)
    }
  },
  methods: {
    handleTurntoPage (item) {
      const { infoId } = item
      window.open(config.baseUrl.pro + '/index.html#article/' + infoId.toString(), '_blank')
    },
    /* 页码改变回调 */
    handleChangePage (pageNumber) {
      this.pageNumber = pageNumber
    },
    getPtInfoList () {
      let params = {
        itypeId: 8,
        ywrq: (new Date()).Format('yyyyMMdd')
      }
      getPtInfoList(params).then(
        res => {
          this.noticesList = res.data || []
          this.total = this.noticesList.length
        }
      )
    },
    docResize ({ height, width }) {
      this.height = height - 46
      this.pageSize = Math.floor(this.height / 36) * 2
    }
  },
  mounted () {
    this.getPtInfoList()
  }
}
</script>

<style lang="less" scoped>
.work-notices-list{
  margin-bottom:46px;
  &-item{
    padding:10px 60px 10px 24px;
    margin:0px 8px;
    border-bottom:1px #eee dashed;
    cursor:default;
    .date{
      position: absolute;
      right:24px;
      top:10px;
    }
    &::before{
      content:'';
      display:inline-block;
      position:absolute;
      width:6px;
      height:6px;
      top:14px;
      left:16px;
      background:#ccc;
    }
    &:hover{
      background:#f3f3f3;
    }
  }
}
</style>
