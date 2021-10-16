import { upload } from '@/api/pub/elec-bill-page'
export default {
  methods: {
    handleBtnClick (operate) {
      if (operate === 'pre') {
        if (this.curPreviewIndex === 0) {
          this.$fn.warning({
            desc: '当前已是第一张',
            title: '提示'
          })
        } else {
          this.curPreviewIndex -= 1
          this.$refs.previewPhoto.src = this.pictureSrcList[this.curPreviewIndex].src
        }
      } else if (operate === 'back') {
        if (this.curPreviewIndex > this.pictureSrcList.length - 1) {
          this.$fn.warning({
            desc: '当前已是最后一张',
            title: '提示'
          })
        } else {
          this.curPreviewIndex += 1
          this.$refs.previewPhoto.src = this.pictureSrcList[this.curPreviewIndex].src
        }
      } else if (operate === 'identify') {
        this.identifyImage() // 识别照片
      } else if (operate === 'save') {
        if (this.autoCompress) {
          let compressImgs = this.getCompressImg() // 如果勾选了保存前压缩，则调用此方法获取压缩后的图片
          for (let i = 0, len = compressImgs.length; i < len; i++) {
            compressImgs[i] = this.dataURLtoFile(compressImgs[i].src, '图片' + i + '.png')
          }
          this.$emit('complete', compressImgs)
        } else {
          this.$emit('complete', this.pictureSrcList)
        }
        this.$emit('close')
      } else if (operate === 'camera') {
        this.getCompetence()
      } else if (operate === 'FBL') {
        let widthAddHeight = []
        widthAddHeight = this.curFBL.split('*')
        this.photoWidth = Number(widthAddHeight[0])
        this.photoHeight = Number(widthAddHeight[1])
        this.getCompetence()
      }
    },
    handleImgClick (operate, index, item) {
      if (operate === 'preview') {
        if (this.showPreview) {
          this.$refs.hiddenDiv.style.display = 'none'
          this.showPreview = false
        } else {
          this.$refs.hiddenDiv.style.display = 'block'
          this.$refs.previewPhoto.src = item.src
          this.curPreviewIndex = index
          this.showPreview = true
        }
      } else if (operate === 'del') {
        this.pictureSrcList.splice(index, 1)
      } else if (operate === 'up') {
        if (index !== 0) {
          this.pictureSrcList[index] = this.pictureSrcList.splice(index - 1, 1, this.pictureSrcList[index])[0]
        }
      } else if (operate === 'down') {
        if (index !== this.pictureSrcList.length - 1) {
          this.pictureSrcList[index] = this.pictureSrcList.splice(index + 1, 1, this.pictureSrcList[index])[0]
        }
      } else if (operate === 'tran') {
        let rotate = this.$refs[`imgShow${index}`][0]
        this.getRotateBefore(rotate, index)
      }
    },
    dataURLtoFile (dataurl, filename) {
      var arr = dataurl.split(',')
      var mime = arr[0].match(/:(.*?);/)[1]
      var bstr = atob(arr[1])
      var n = bstr.length
      var u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
    // 识别图片
    identifyImage () {
      let validate = false
      for (let key in this.checkList) {
        if (this.checkList[key] === true) {
          validate = true
        }
      }
      if (validate) {
        let compressImgs = this.getCompressImg()
        let fileName = new Date().getTime() + '.png'
        let file = this.dataURLtoFile(compressImgs[this.checkedIndex].src, fileName)
        let params = {
          GSDM: this.baseParams.gsdm,
          KJND: this.baseParams.kjnd,
          ZTH: this.baseParams.zth,
          FJDX: file.size,
          MODCODE: '',
          DJLX: '',
          DJID: '',
          FJLXGUID: '',
          FILE: file,
          IDENTIFIER: this.identifier
        }
        let newParams = this.utilTransformData(params)
        this.$fn.ajax(upload, newParams, res => {
          if (res.status === 200 && res.data) {
            this.fpInfoList = res.data.fpInfoList
            if (this.fpInfoList && this.fpInfoList.length > 0) {
              this.fpInfoList.forEach(item => {
                if (Object.keys(item).length > 0) {
                  item.billData.MAIN['PID'] = item.PID
                  item.billData.MAIN['FJID'] = item.FJID
                  item.billData['identifier'] = this.identifier
                }
              })
              this.billValues = this.fpInfoList[0]
              this.$emit('complete', this.billValues, this.fpInfoList)
            }
          }
        })
      } else {
        this.$fn.error({ desc: '请勾选一张要识别的图片！' })
      }
    },
    getGuid () {
      this.identifier = this.setGuid() + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + this.setGuid() + this.setGuid()
    },
    setGuid () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    utilTransformData (data) {
      let formData = new FormData()
      Object.keys(data).map(key => {
        formData.append(key, data[key])
      })
      return formData
    }
  }

}
