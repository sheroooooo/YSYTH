<template>
  <vue-scroll>
  <div class="add-img">
    <Upload ref="upload"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :format="['jpg','jpeg','png']"
            :headers="headers"
            :data="picParams"
            :max-size="5120"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            type="drag"
            multiple
            action="/faqc/file/uploadFile"
            style="display: inline-block;">
      <div class="addmodal-img-add">
        <Button icon="ios-add"
                size="large"
                style="border:none;"></Button>
        <div>点击上传资产图片</div>
      </div>
    </Upload>
    <div class="img-wrap"
          v-for="(item, idx) in imgArr"
          :key="`cal-${item.GXGUID}`">
      <img class="img-item"
                  :src="`data:image/${item.fjlx.replace('.', '').replace('jpg', 'jpeg')};base64,${item.picture}`"></img>
      <div class="btn-item">
        <div class="img-xh">{{`${idx + 1} / ${imgArr.length}`}}</div>
        <Button @click="deleteImg(item, idx)"
                size="small"
                class="addmodal-img-del"
                style="border:none;"
                icon="ios-trash"></Button>
      </div>
    </div>
  </div>
  </vue-scroll>
</template>

<script>
import { getPictureList, deletePicture } from '@/api/fa/fa-kpbz'
import { getToken } from '@/libs/util'
export default {
  name: 'AddImg',
  props: ['picParams', 'imgList', 'baseParams', 'imgId'],
  data () {
    return {
      headers: {
        'Authorization': getToken()
      },
      imgArr: this.imgList
    }
  },
  methods: {
    // 图片上传成功
    handleSuccess (res, file) {
      this.getImgList()
    },
    // 图片上传格式错误
    handleFormatError (file) {
      this.$fn.error({ desc: '文件类型错误，请重新选择' })
    },
    // 图片上传超出大小
    handleMaxSize (file) {
      this.$fn.error({ desc: '文件过大，请重新选择' })
    },
    // 图片上传前获取图片大小
    handleBeforeUpload (file) {
      this.picParams.TOTALSIZE = file.size
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
        this.imgArr = res.data || []
        this.$emit('imgreturn', this.imgArr)
      })
    },
    // 删除图片
    deleteImg (item, idx) {
      let _this = this
      this.$modal.confirm({
        title: '删除图片',
        message: '确定删除当前图片吗？',
        zIndex: 99999,
        events: {
          confirm () {
            let params = {
              GXGUID: item.GXGUID
            }
            deletePicture(params).then(res => {
              if (res && res.status === 200) {
                // 先清除数据，防止重复删除
                _this.imgArr.splice(_this.idx, 1)
                _this.getImgList()
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.add-img {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  .ivu-upload {
    flex-basis: 23%;
    margin-right: 16px;
    height: 232px;
    margin-bottom: 16px;
    &.ivu-upload-drag {
      margin-right: 0;
    }
    .addmodal-img-add {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 230px;
      background-color: #f2f2f2;
      color: #ccc;
      &:hover,
      &:hover .ivu-btn {
        color: #2d8cf0;
      }
      .ivu-btn {
        font-size: 50px;
        color: #ccc;
        background-color: #f2f2f2;
      }
    }
  }
  .img-wrap {
    height: 230px;
    margin-bottom: 16px;
    flex-basis: 23%;
    margin-right: 16px;
    border: 1px solid #d9d9d9;
    .img-item {
      width: 100%;
      height: 200px;
    }
    .btn-item {
      width: 100%;
      border-top: 1px solid #d9d9d9;
      text-align: right;
      .img-xh {
        display: inline-block;
        margin-right: 8px;
        vertical-align: middle;
      }
      .addmodal-img-del {
        height: 27px;
        margin-right: 8px;
      }
    }
  }
}
</style>
