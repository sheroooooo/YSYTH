/*
* @name: 拍照
* @Author: lishirong
* @Date: 2020-06-22
* @Last Modified by:  lishirong
* @Last Modified time: 2020-06-22
*注：
*1. 点击保存后，向父组件发送照片的数据格式：pictureSrcList:[{src:base64},{},{},...]
*2. 模态框开发自测期宽高 width:900,height:520
*/
<template>
  <div class="camera-modal">
    <div class="camera-modal-content">
      <div class="take-photos">
        <video class="take-photos-videoStyle"
               ref="video"
               v-show="photoFlag"></video>
        <canvas ref="canvas"
                class="canvas-style"
                :width="photoWidth*2"
                :height="photoHeight*2"
                :style="{width:photoWidth+'px',height:photoHeight+'px'}"
                v-show="!photoFlag"></canvas>
        <canvas ref="newCanvas"
                :width="targetWidth"
                :height="targetHeight"
                :style="{width:targetWidth/2+'px',height:targetHeight/2+'px'}"
                v-show=false></canvas>
        <canvas ref="rotateAfter"
                v-show=false></canvas>
        <div class="take-photos-btnGroup">
          <Button type="primary"
                  class="btn-item"
                  @click="setImage">拍照</Button>
        </div>
        <div class="take-photos-set">
          <span class="take-photos-set-title">摄像头</span>
          <Select v-model="curCamera"
                  style="width:200px"
                  @on-change="handleBtnClick('camera')">
            <Option v-for="item in cameraList"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
          </Select>
          <!-- <span class="take-photos-set-title">分辨率</span>
          <Select v-model="curFBL"
                  style="width:200px"
                  @on-change="handleBtnClick('FBL')">
            <Option v-for="item in FBLList"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
          </Select> -->
        </div>

      </div>
      <div class="camera-modal-photos"
           v-if="pictureSrcList.length>0">
        <div class="finished-photos">
          <div class="photo-item"
               v-for="(item,index) in pictureSrcList"
               :key=index>
            <div class="photo-item-img"
                 @click="handleImgClick('preview',index,item)">
              <img :ref="`imgShow${index}`"
                   style="width:100%; height:200px;display:block"
                   :src=item.src />
            </div>
            <div class="photo-item-icon">
              <Checkbox v-model="checkList['check'+index]"
                        @on-change="checkedChange(index)">识别</Checkbox>
              <Tooltip content="上移"
                       placement="top"
                       transfer>
                <Icon type="md-arrow-up"
                      @click="handleImgClick('up',index,item)"
                      size="18" />
              </Tooltip>
              <Tooltip content="下移"
                       placement="top"
                       transfer>
                <Icon type="md-arrow-down"
                      @click="handleImgClick('down',index,item)"
                      size="18" />
              </Tooltip>
              <Tooltip content="旋转"
                       placement="top"
                       transfer>
                <Icon type="md-refresh"
                      @click="handleImgClick('tran',index,item)"
                      size="18" />
              </Tooltip>
              <Tooltip content="删除"
                       placement="top"
                       transfer>
                <Icon type="ios-trash-outline"
                      @click="handleImgClick('del',index,item)"
                      size="18" />
              </Tooltip>
            </div>
          </div>

        </div>
        <div class="save-photos">
          <Button type="primary"
                  class="save-photos-btn"
                  @click="handleBtnClick(curOperate)">{{modCode==='IEV'?'识别':'保存'}}</Button>
          <span v-if="this.pictureSrcList.length>0"
                class="footer-spanStyle">共{{this.pictureSrcList.length}}张
          </span>
          <div v-if="modCode!=='IEV'"
               class="save-photos-checked">
            <Checkbox v-model="autoCompress">保存前压缩</Checkbox>
          </div>

        </div>
      </div>
      <div class="no-take-photos"
           v-if="pictureSrcList.length===0">
        <span class="no-take-photos-tips">暂无照片</span>
      </div>
      <div ref="hiddenDiv"
           class="preview-photo"
           @click="handleImgClick('preview')">
        <div class="preview-photo-pre"
             @click.stop="handleBtnClick('pre')">
          <Icon class="preview-photo-pre-icon"
                type="ios-arrow-back"
                size="48" />
        </div>
        <div class="preview-photo-body">
          <img ref="previewPhoto"
               class="preview-photo-body-imgStyle" />
        </div>
        <div class="preview-photo-back"
             @click.stop="handleBtnClick('back')">
          <Icon class="preview-photo-back-icon"
                type="ios-arrow-forward"
                size="48" />
        </div>
        <img ref="oldImg"
             v-show=false />
      </div>
    </div>
    <div>
      <img ref="rotatePicture"
           width="1350"
           height="1350"
           v-show=false />
    </div>
  </div>
</template>

<script>
import cameraModalActions from './mixins/camera-modal-actions.js'
export default {
  name: 'Camera',
  data () {
    return {
      thisCancas: null,
      thisContext: null,
      thisVideo: null,
      imgSrc: ``,
      curStream: null,
      curCamera: '',
      cameraList: [],
      curFBL: '',
      photoFlag: true,
      FBLList: [
        {
          value: '1920*1080',
          label: '1920*1080'
        },
        {
          value: '3840*2160',
          label: '3840*2160'
        }],
      photoWidth: 0,
      photoHeight: 0,
      pictureSrcList: [],
      previewPhoto: {},
      showPreview: false,
      autoCompress: true, // 自动压缩 默认为true
      targetWidth: 1280,
      targetHeight: 720,
      curPreviewIndex: 0,
      checkList: {
        check0: true
      },
      checkedIndex: 0, // 选中图片的序号
      identifier: '',
      billValues: {}, // 识别成功后的数据
      fpInfoList: [] // 支持一张图片上有多张发票的情况
    }
  },
  props: {
    modCode: {
      type: String,
      default: ''
    },
    baseParams: {
      type: Object,
      default: () => { }
    }
  },
  computed: {
    curOperate () {
      return this.modCode === 'IEV' ? 'identify' : 'save' // 如果在电子票据中，是识别
    }
  },
  mounted () {
    this.getGuid()
    this.setInitPage()
  },
  methods: {
    setInitPage () {
      navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
        this.getDevices(deviceInfos)
      }).then(() => {
        this.getCompetence()
      })
    },
    // 获取电脑的摄像头设备
    getDevices (deviceInfos) {
      for (let i = 0; i < deviceInfos.length; ++i) {
        let deviceInfo = deviceInfos[i]
        let item = {}
        item.value = deviceInfo.deviceId
        if (deviceInfo.kind === 'videoinput') {
          item.label = deviceInfo.label ||
            'camera ' + i
          this.cameraList.push(item)
        }
      }
      this.curCamera = this.cameraList[0].value
      this.curFBL = this.FBLList[0].value
      this.photoWidth = this.FBLList[0].label.split('*')[0]
      this.photoHeight = this.FBLList[0].label.split('*')[1]
    },
    /*
     *  调用摄像头
    */
    getCompetence () {
      let _this = this
      _this.thisCancas = _this.$refs.canvas
      _this.thisContext = _this.thisCancas.getContext('2d')
      _this.thisVideo = _this.$refs.video
      if (_this.curStream != null) {
        try {
          _this.curStream.stop()
        } catch (e) {
          _this.curStream.getVideoTracks()[0].stop()
        }
      }
      // 旧版本浏览器可能根本不支持mediaDevices，首先设置一个空对象
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {}
      }
      // 一些浏览器实现了部分mediaDevices，我们不能只分配一个对象
      // 使用getUserMedia，因为它会覆盖现有的属性。
      // 这里，如果缺少getUserMedia属性，就添加它。
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
          // 首先获取现存的getUserMedia(如果存在)
          let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia || navigator.msGetUserMedia
          // 有些浏览器不支持，会返回错误信息
          // 保持接口一致
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
          }
          // 否则，使用Promise将调用包装到旧的navigator.getUserMedia
          return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }
      let constraints = {
        audio: false,
        video: {
          optional: [
            {
              sourceId: _this.curCamera
            },
            {
              minWidth: _this.photoWidth
            },
            {
              maxWidth: _this.photoWidth
            },
            {
              minHeight: _this.photoHeight
            },
            {
              maxHeight: _this.photoHeight
            }
          ]

        }
      }
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        // 旧的浏览器可能没有srcObject
        if ('srcObject' in _this.thisVideo) {
          _this.thisVideo.srcObject = stream
          _this.curStream = stream
        } else {
          // 避免在新的浏览器中使用它，因为它正在被弃用。
          _this.thisVideo.src = window.URL.createObjectURL(stream)
          _this.curStream = stream
        }
        _this.thisVideo.onloadedmetadata = function (e) {
          _this.thisVideo.play()
        }
      }).catch(err => {
        console.log(err)
      })
    },
    /*
     *@function  绘制图片
    */
    setImage () {
      let _this = this
      let pictureObj = {}
      _this.photoFlag = false
      // 点击，canvas画图
      _this.thisContext.drawImage(_this.thisVideo, 0, 0, _this.photoWidth * 2, _this.photoHeight * 2)
      // 获取图片base64
      let image = _this.thisCancas.toDataURL('image/png')
      _this.imgSrc = image
      // 获取照片大小
      let str = _this.imgSrc.replace('data:image/jpeg;base64,', '')
      let strLength = str.length
      let fileLength = parseInt(strLength - (strLength / 8) * 2)
      let size = ''
      size = (fileLength / (1024 * 1024)).toFixed(2) // 将图片大小转换为MB
      pictureObj['src'] = _this.imgSrc
      pictureObj['size'] = parseInt(size)
      _this.pictureSrcList.push(pictureObj)
      _this.photoFlag = true
    },
    getRotateBefore (rotateImg, index) {
      this.$refs.rotatePicture.src = rotateImg.src
      this.$nextTick(() => {
        this.getRotateAfter(rotateImg, index)
      })
    },
    getRotateAfter (rotateImg, index) {
      let afterCanvas = null
      let afterContext = null
      let rotateBeforeImg = this.$refs.rotatePicture
      let width = rotateBeforeImg.width
      let height = rotateBeforeImg.height
      afterCanvas = this.$refs.rotateAfter
      afterContext = afterCanvas.getContext('2d')
      let degree = 90 * Math.PI / 180
      afterCanvas.width = height
      afterCanvas.height = width
      afterCanvas.style.width = height / 2
      afterCanvas.style.height = width / 2
      afterContext.rotate(degree)
      afterContext.drawImage(rotateBeforeImg, 0, -height, width, height)
      let newSrc = afterCanvas.toDataURL('image/png')
      this.pictureSrcList[index].src = newSrc
    },
    // 保存前压缩
    getCompressImg () {
      let newCanvas = null
      let newContext = null
      newCanvas = this.$refs.newCanvas
      newContext = newCanvas.getContext('2d')
      let newPictureList = []
      let oldImg = this.$refs.oldImg
      for (let i = 0, len = this.pictureSrcList.length; i < len; i++) {
        let newObj = {}
        if (this.pictureSrcList[i].size > 2) { // 若原图片大小超过2mb，则进行压缩
          oldImg.src = this.pictureSrcList[i].src
          oldImg.style.width = this.targetWidth
          oldImg.style.height = this.targetHeight
          newContext.clearRect(0, 0, this.targetWidth, this.targetHeight)
          newContext.drawImage(oldImg, 0, 0, this.targetWidth, this.targetHeight)
          let image = newCanvas.toDataURL('image/png')
          newObj['src'] = image
        } else {
          newObj['src'] = this.pictureSrcList[i].src
        }
        newPictureList.push(newObj)
      }
      return newPictureList
    },
    checkedChange (index) {
      if (this.checkList['check' + index]) {
        this.checkedIndex = index
        for (let key in this.checkList) {
          if (key !== ('check' + index)) {
            this.checkList[key] = false
          }
        }
      }
    }
  },
  // 关闭模态框后关闭摄像头
  destroyed () {
    try {
      this.curStream.stop() // 关闭摄像头（如果此方法不存在，则调用下面的方法）
    } catch (e) {
      this.curStream.getVideoTracks()[0].stop()
    }
  },
  mixins: [cameraModalActions]
}
</script>
<style lang="less">
@import './camera-modal.less';
</style>
