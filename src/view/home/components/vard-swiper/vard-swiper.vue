<!--
 * 工作台 待办事项
-->
<template>
  <div class="vard-swiper"
       :style="{height:`${height}px`}">
    <!-- 轮播样式 -->
    <!-- <div class="matter_top"
         :style="{height:`${height}px`}">
      <Carousel :dots="setting.dots"
                :radius-dot="setting.radiusDot"
                :arrow="setting.arrow">
        <CarouselItem v-for="(item,index) in Math.ceil(swiArr.length/3)"
                      :key="index">
          <Row class="flex">
            <div class="car"
                 v-for="(items,indexs) in swiArr"
                 v-if="indexs >= index*3 && indexs <= index*3+2"
                 :key="indexs">
              <div @click="toRoute(items)"
                   style="cursor: pointer">
                <div class="circular">
                  <Badge :count="items.count"
                         type="primary">
                    <img :src="imageUrl(indexs)">
                  </Badge>
                </div>
                <p>{{items.menuName}}</p>
              </div>
            </div>
          </Row>
        </CarouselItem>
      </Carousel>
      <img :src="nothing"
           alt=""
           style="margin: 15px auto; display: block;"
           v-show="isShow">
    </div>-->
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
      <img :src="nothing"
           alt=""
           style="margin: 5% auto; display: block;"
           v-show="isShow">
      <Page class="page-matter"
            :total="dataTotal"
            :page-size="pageSize"
            size="small"
            @on-change="changePage" />
    </div>

  </div>
</template>

<script>
import { getUpcoming } from '@/api/home/home'
import {
  mapActions,
  mapGetters
} from 'vuex'
export default {
  name: 'VardSwiper',
  props: {
    height: {
      type: Number,
      devault: 100
    }
  },
  data () {
    return {
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
          activeTab: val.activeTab || ''
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
    ])
  },
  computed: {
    ...mapGetters(['env'])
  },
  mounted () {
    // 动态分页
    this.pageSize = Math.floor(parseFloat(this.height) / 30)
    this.getToDoList()
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
