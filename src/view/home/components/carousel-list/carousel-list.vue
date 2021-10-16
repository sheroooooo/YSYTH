<template>
  <div class="cygn"
       :style="{height:`${height}px`}">
    <Carousel :dots="setting.dots"
              :arrow="setting.arrow">
      <div>
        <CarouselItem v-for="(value,item) in number"
                      :key="item">
          <Row>
            <Col span="8"
                 v-for="(items,index) in propsDataArr"
                 :key="index"
                 v-if="item == Math.floor((index)/6)">
            <div class="swiper-list">
              <img :src="imageUrl(index)"
                   alt=""
                   style="cursor: pointer"
                   @click="toRoute(items)">
              <p style="cursor: pointer"
                 @click="toRoute(items)">{{items.gnmc}}</p>
            </div>
            </Col>
          </Row>
        </CarouselItem>
      </div>
    </Carousel>
  </div>
</template>

<script>
export default {
  name: 'CarouselList',
  props: {
    dataArr: {
      type: Array,
      default: () => []
    },
    number: { // 表单展示列
      type: Number,
      default: 3
    },
    height: {
      type: Number,
      default: 100
    },
    width: {
      type: Number,
      default: 100
    }
  },
  data () {
    return {
      setting: {
        dots: 'outside',
        arrow: 'never'
      },
      showModel: false
    }
  },
  computed: {
    getCollapsed () {
      return this.$store.state.app.collapsed
    },
    propsDataArr () {
      return this.dataArr
    },
    propsWidth () {
      return this.width
    }
  },
  watch: {
    /* 菜单状态切换，常用功能宽度更新 */
    getCollapsed (val) {
      if (val) {
        this.propsWidth = window.innerWidth - 542
        const carouselW = this.propsWidth * this.number + 'px'
        document.getElementsByClassName('ivu-carousel-track')[0].style.width = carouselW
      } else {
        this.propsWidth = window.innerWidth - 686
        const carouselW = this.propsWidth * this.number + 'px'
        document.getElementsByClassName('ivu-carousel-track')[0].style.width = carouselW
      }
    }
  },
  methods: {
    /* 常用功能循环图片 */
    imageUrl (index) {
      return require('@/assets/images/home/' + (index % 6 + 1) + '.png')
    },

    /* 常用功能跳转页签 */
    toRoute (val) {
      if (val.webPath === '') {
        this.$fn.error({
          title: '错误',
          desc: val.status
        })
      } else {
        let gnbm = val.gnbm
        this.$router.push({ name: val.webPath, params: { title: val.gnmc, id: val.gnbm, gnflDm: gnbm } })
      }
    }
  }
}
</script>

<style>
  .swiper-list{
    /*width:25%;*/
    text-align: center;
    padding:15px 0px;
  }
</style>
