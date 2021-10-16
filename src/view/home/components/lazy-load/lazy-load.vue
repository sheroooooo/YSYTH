<template>
  <div :style="{height:`${height}px`}">
    <div class="cont_fo">
      <ul>
        <li v-for="(item,index) in histroyData"
            :key="index"
            :style="{listStyleImage:`url(${require('@/assets/images/swiper-page/01.png')})`}">
          <span :title="item.title"
                class="text-overflow"
                @click="jump(item.infoId, item.infoType, item.title)">{{item.title}}</span>
        </li>
      </ul>
    </div>
    <Page style="text-align: right; padding: 10px 20px 0 0;"
          :total="dataTotal"
          :page-size="pageSize"
          size="small"
          @on-change="changePage" />
  </div>
</template>
<script>
/* import { getPtInfoList } from '@/api/home/home' */
export default {
  name: 'lazyLoad',
  props: {
    height: {
      type: Number,
      default: 100
    },
    lazyloadData: { // 通知管理的栏目信息数据
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      arr: [],
      getPtInfoList: {
        ywrq: this.$store.state.app.env.loginDate.split('-').join(''),
        gzt: 1, // 后台判断用
        itypeId: 8
      },
      dataTotal: 0,
      // 每页显示多少条
      pageSize: 10,
      histroyData: []
    }
  },
  watch: {
    lazyloadData: {
      deep: true,
      handler () {
        this.infoTotal()
      }
    }
  },
  inject: ['closeTag', 'scroll', 'turnToPage'],
  methods: {
    jump (infoId, infoType, title) {
      this.turnToPage({
        name: 'message',
        id: infoId,
        replace: false,
        infoId: infoId.toString(),
        infoType,
        title
      })
    },
    // 初始化表格data长度
    infoTotal () {
      this.arr = this.lazyloadData
      let isTop = this.arr.filter(v => v.isTop === 1)
      let notTop = this.arr.filter(v => v.isTop === 0)
      isTop.sort(function (a, b) {
        let aData = a.date.replace(' ', '').replace(/:/g, '')
        let bData = b.date.replace(' ', '').replace(/:/g, '')
        return bData * 1 - aData * 1
      })
      notTop.sort(function (a, b) {
        return b.date * 1 - a.date * 1
      })
      this.arr = [...isTop, ...notTop]
      this.dataTotal = this.arr.length
      // 初始化显示，小于每页显示条数，全显，大于每页显示条数，取前每页条数显示
      if (this.arr.length < this.pageSize) {
        this.histroyData = this.arr
      } else {
        this.histroyData = this.arr.slice(0, this.pageSize)
      }
    },
    // 改变页码,重新绑定table显示数据
    changePage (index) {
      var _start = (index - 1) * this.pageSize
      var _end = index * this.pageSize
      this.histroyData = this.arr.slice(_start, _end)
    }
  },
  mounted () {
    this.infoTotal()
  }
}
</script>

<style scoped>
  .cont_fo {
    width: 100%;
    height: calc(100% - (45px));
    overflow: auto;
    line-height: 1.5em;
  }
  .cont_fo ul li {
    margin: 15px 10px 0px 35px;
  }

  .cont_fo ul li span {
    color: #333;
    text-decoration: none;
    display: block;
  }

  .cont_fo ul li span:hover {
    color: rgb(14, 162, 233);
    text-decoration: none;cursor: pointer;
  }
</style>
