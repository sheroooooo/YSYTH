<!--
 * 工作台 待办事项
-->
<template>
  <vuc-panel v-bind="$attrs">
    <div class="vard-swiper"
         :style="{height:`${height}px`}">
      <!-- 列表样式 -->
      <div class="matter_top">
        <Row>
          <Col span="24"
               class="col-hang"
               v-for="(item, index) in swiArr"
               :key="index">
          <div>
            <Icon size=24
                  :custom="`icon-${item.modCode}`"
                  color="#2d8cf0"
                  style="margin-top:-4px;" />
            <span class="text"
                  @click="toRoute(item)">
              &nbsp;{{item.menuName}}
              <span class="count"
                    v-if="item.count!==0"> {{item.count}}</span>
            </span>
          </div>
          </Col>
        </Row>
      </div>

    </div>
  </vuc-panel>
</template>

<script>
import { getUpcoming } from '@/api/home/home'
import {
  mapActions,
  mapGetters
} from 'vuex'
export default {
  name: 'VardSwiper',
  data () {
    return {
      height: 100,
      swi: {},
      value2: 0,
      setting: {
        dots: 'none',
        radiusDot: true,
        arrow: 'hover'
      },
      nothing: require('@/assets/images/02.png'),
      isShow: true,
      arr: [],
      swiArr: [],
      dataTotal: 0,
      // 每页显示多少条
      pageSize: 4
    }
  },
  methods: {
    toRoute (val) {
      this.$router.push({
        name: val.webPath,
        params: {
          title: val.gnflMc,
          id: val.gnflDm,
          gnflDm: val.gnflDm,
          dbFlag: 1,
          // 进入登记簿 跳转到某个页签
          activeTab: val.activeTab || '',
          modCode: val.modCode
        }
      })
    },
    imageUrl (index) {
      return require('@/assets/images/home/' + (index % 6 + 1) + '.png')
    },
    // 获取待办事项
    getToDoList () {
      let params = {
        'gsdm': this.$store.getters.env.gsdm,
        'kjnd': this.$store.getters.env.kjnd,
        'ywrq': this.$store.getters.env.loginDate.replace(/-/g, ''),
        'zth': this.$store.getters.env.zth,
        'productType': ',XZ_G,',
        date: Date.now()
      }
      this.$fn.ajax(getUpcoming, params, res => {
        this.arr = []
        for (let i = 0, len = res.data.length; i < len; i++) {
          if (res.data[i].gnflDm !== '520404') {
            this.arr.push(res.data[i])
          }
        }
        // this.swiArr = this.$utils.clone(arr, true)
        this.dataTotal = this.arr.length
        // 初始化显示，小于每页显示条数，全显，大于每页显示条数，取前每页条数显示
        if (this.arr.length < this.pageSize) {
          this.swiArr = this.arr
        } else {
          this.swiArr = this.arr.slice(0, this.pageSize)
        }
        if (this.swiArr.length !== 0) {
          this.isShow = false
        } else {
          this.isShow = true
        }
      })
    },
    // 改变页码,重新绑定table显示数据
    changePage (index) {
      var _start = (index - 1) * this.pageSize
      var _end = index * this.pageSize
      this.swiArr = this.arr.slice(_start, _end)
    },
    ...mapActions([
      'handleGetModalMenu'
    ]),
    $mounted () {
      this.height = this.$attrs.height - 80
      // 动态分页
      this.pageSize = Math.floor(parseFloat(this.height) / 30)
      this.getToDoList()
    }
  },
  computed: {
    ...mapGetters(['env'])
  },
  mounted () {
    this.$mounted()
  }
}
</script>

<style lang="less">
.vard-swiper{
   /*  height:153px; */overflow:hidden;position:relative;
    .page-matter{
      position:absolute;bottom:0;right:0;
      text-align: right; padding: 6px;
    }
/*待办事项区域*/
  .matter_top {
    width: 100%;
    .col-hang{
       padding: 10px 10px 0px 15px;color: #333;
    }
    .text{
      position:relative; cursor: pointer;
    }
    .count{
      position:absolute;top:-5px;right:-20px;
      font-size:14px;color:#2d8cf0;font-weight: 550;
      text-align: left;
      display: block;
      width: 20px;
      height: 20px;
    }
   /*  ul li{
     margin: 15px 10px 0px 10px;
      span {
         color: #333;
         text-decoration: none;
      }
    } */
  }

  /*待办事项区域的轮播*/
  .matter_top .flex {
    display: flex;
    justify-content: space-between;
  }

  .matter_top .car {
    width: 100%;
    height: 100px !important;
    box-sizing: border-box;
    -moz-box-sizing: border-box; /* Firefox */
    -webkit-box-sizing: border-box; /* Safari */
    margin: 10px;
  }

  .matter_top .car div {
    width: 100%;
    height: 48px;
    text-align: center;
    display: inline-block;
    color: #000;
  }

  .matter_top .car .circular {
    width: 48px;
    /*background: #52c41a;*/
    line-height: 48px;
    margin: 10px auto;
    border-radius: 50%;
  }
  .matter_top .car p {
    margin: 0;
    margin-top: 15px;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* .matter_top >>> .ant-carousel {
    line-height: 0.5;
  } */
}

</style>
