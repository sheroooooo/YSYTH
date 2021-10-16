<template>
  <div class="view-wrap">
    <Carousel v-model="imgIdx"
              v-if="showModal"
              :height="500"
              class="view-carousel"
              dots="outside"
              :radius-dot="true">
        <CarouselItem v-for="item in imgArr"
                      class="view-carousel-item"
                      :key="`view-img-${item.GXGUID}`">
          <div class="img-wrap">
            <img class="view-img"
                 :style="`transform: rotate(${angle}deg) translate(${anglePer}, 0%);width: ${ratio}%; height: ${ratio}%;`"
                 :src="`data:image/${item.fjlx.replace('.', '').replace('jpg', 'jpeg')};base64,${item.picture}`"></img>
          </div>
        </CarouselItem>
    </Carousel>
    <Button class="del-btn"
            shape="circle"
            v-tip="`删除`"
            v-if="!readonly"
            @click="deleteImg"
            icon="ios-trash"></Button>
    <Button class="del-btn btn-transform"
            shape="circle"
            v-tip="`左转`"
            @click="handleRotate(-90)"
            icon="ios-refresh"></Button>
    <Button class="del-btn"
            shape="circle"
            v-tip="`右转`"
            @click="handleRotate(90)"
            icon="ios-refresh"></Button>
    <Button class="del-btn"
            shape="circle"
            v-tip="`缩小`"
            @click="handleScale(0.5)"
            icon="ios-remove"></Button>
    <Button class="del-btn"
            shape="circle"
            v-tip="`放大`"
             @click="handleScale(2)"
            icon="ios-add"></Button>
  </div>
</template>

<script>
import { getPictureList, deletePicture } from '@/api/fa/fa-kpbz'
export default {
  name: 'ViewImg',
  props: {
    idx: {
      type: Number,
      default: 0
    },
    imgList: {
      type: Array,
      default: () => []
    },
    baseParams: {
      type: Object,
      default: () => { }
    },
    imgId: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      imgIdx: this.idx,
      showModal: false,
      imgArr: this.imgList,
      ratio: 100,
      angle: 0,
      anglePer: '0%'
    }
  },
  methods: {
    handleRotate (deg) {
      if (this.angle + deg === 360) {
        this.angle = 0
      } else if (this.angle + deg === -90) {
        this.angle = 270
      } else {
        this.angle = this.angle + deg
      }
      if (this.angle === 90) {
        this.anglePer = '25%'
      } else if (this.angle === 270) {
        this.anglePer = '-25%'
      } else {
        this.anglePer = '0%'
      }
    },
    handleScale (per) {
      if ((this.ratio > 25 && per === 0.5) || (this.ratio < 1600 && per === 2)) {
        this.ratio = this.ratio * per
      }
    },
    // 获取已经上传的图片
    getImgList () {
      let params = {
        GSDM: this.baseParams.gsdm,
        KJND: '-1',
        DJLX: 'FA_KPImage',
        IMGID: this.imgId,
        MODCODE: this.baseParams.modCode,
        times: Date.now()
      }
      if (this.baseParams.ACTIONFLAG === 'M') {
        params.GDDM = this.baseParams.gddm
      }
      getPictureList(params).then(res => {
        if (res && res.status === 200) {
          this.imgArr = res.data || []
          if (this.imgIdx > this.imgArr.length - 1) {
            this.imgIdx = this.imgArr.length ? this.imgArr.length - 1 : 0
          }
          this.$emit('imgreturn', this.imgArr)
          if (this.imgArr.length === 0) {
            this.$emit('close')
          }
        }
      })
    },
    // 删除图片
    deleteImg () {
      let _this = this
      this.$modal.confirm({
        title: '删除图片',
        message: '确定删除当前图片吗？',
        zIndex: 99999,
        events: {
          confirm () {
            let params = {
              GXGUID: _this.imgArr[_this.imgIdx].GXGUID
            }
            deletePicture(params).then(res => {
              if (res && res.status === 200) {
                // 先清除数据，防止重复删除
                _this.imgArr.splice(_this.imgIdx, 1)
                _this.getImgList()
              }
            })
          }
        }
      })
    }
  },
  mounted () {
    setTimeout(() => {
      this.showModal = true
    }, 50)
  }
}
</script>

<style lang="less" scoped>
.view-wrap {
  height: 100%;
  width: 100%;
  .view-carousel {
    width: 100%;
    .img-wrap {
      width: 966px;
      height: 500px;
      overflow: auto;
    }
    .view-img {
      display: inline-block;
    }
  }
  .del-btn {
    float: right;
    margin-top: 16px;
    margin-right: 16px;
  }
  .btn-transform {
    transform: rotateY(180deg);
  }
}
</style>
