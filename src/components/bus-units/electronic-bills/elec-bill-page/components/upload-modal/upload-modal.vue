/**
 * @description: 增值税发票弹框
 * @author: yangtao
 * @date: 2020-04-01
 * @last modified by: yangtao
 * @last modified time: 2020-04-01
 */
<template>
  <div class="upload-modal">
    <div class="upload-modal-header">
      <!-- <div class="header-left">附件数:0</div> -->
      <div class="header-right">
        <div class="local-upload">
          <Upload ref="upload"
                  action="/iev/dzfpj/upload"
                  :headers="headers"
                  :data="getParams()"
                  style="display: inline-block"
                  :show-upload-list="false"
                  :before-upload="beforeUpload">
            <Button type="primary"
                    style="margin-right:8px">本地文件</Button>
          </Upload>
          <!-- 高拍仪拍照只允许在https协议下使用 -->
          <Button v-if="isHttps"
                  @click="handleBtnClick('camera')"
                  style="margin-right:8px">拍照</Button>
          <Button @click="handleBtnClick('phoneScan')">手机扫描</Button>
        </div>
      </div>
    </div>
    <div class="upload-modal-content">
      <div class="tip-info">请上传发票！</div>
    </div>
    <div class="upload-modal-footer">
      <Button class="footer-btn"
              @click="cancelBtnClick">取消</Button>

    </div>
  </div>
</template>
<script>

import { upload, getPhoneUploadFJ } from '@/api/pub/elec-bill-page'
import cameraModal from './components/camera-modal/camera-modal.vue'
import QrcodeModal from './components/phone-qrcode'
import { getToken } from '@/libs/util'

export default {
  name: 'BillInputModal',
  props: {
    // 公共入参
    baseParams: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      billValues: {},
      identifier: '',
      isHttps: false,
      guid: '',
      uploadFiles: [],
      fpInfoList: [] // 支持一张图片上有多张发票的情况
    }
  },
  watch: {

  },
  computed: {
    headers () {
      return { 'Authorization': getToken() }
    }
  },
  methods: {
    getGuid () {
      this.identifier = this.setGuid() + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + '-' + this.setGuid() + this.setGuid() + this.setGuid()
    },
    setGuid () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    },
    getParams () {
      this.uploadParams = {
        GSDM: this.baseParams.gsdm,
        KJND: this.baseParams.kjnd,
        ZTH: this.baseParams.zth
      }
      return this.uploadParams
    },
    beforeUpload (file) {
      this.getGuid()
      this.uploadParams['FJDX'] = file.size
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
      return false
    },
    utilTransformData (data) {
      let formData = new FormData()
      Object.keys(data).map(key => {
        formData.append(key, data[key])
      })
      return formData
    },
    cancelBtnClick () {
      this.$emit('close')
    },
    handleBtnClick (operate) {
      if (operate === 'camera') {
        const _this = this
        this.$modal({
          title: '拍照',
          resize: false,
          showFooter: false,
          width: 1000,
          height: 600,
          slots: {
            default: ({ $modal }, h) => {
              return [
                h(cameraModal, {
                  props: {
                    modCode: 'IEV',
                    baseParams: _this.baseParams
                  },
                  on: {
                    close () {
                      $modal.close()
                    },
                    complete (val, fpList) {
                      $modal.close()
                      let cameraParseValues = _this.$utils.clone(val, true)
                      _this.$emit('complete', cameraParseValues, fpList)
                    }
                  }
                })
              ]
            }
          }
        })
      } else if (operate === 'phoneScan') {
        this.QRcodeModal()
      }
    },
    // 二维码弹框
    QRcodeModal () {
      const _this = this
      _this.guid = _this.$utils.guid()
      let qrcodeParams = {
        gsdm: _this.baseParams.gsdm,
        kjnd: _this.baseParams.kjnd,
        zth: _this.baseParams.zth,
        modCode: 'IEV',
        fjlxguid: '',
        djlx: '',
        djid: _this.guid
      }
      _this.$modal({
        title: '请用手机扫描二维码上传附件',
        resize: false,
        showFooter: false,
        width: 300,
        height: 340,
        events: {
          show ({ $modal, $custom }, event) {
            $custom.qrcode(sessionStorage.getItem('Authorization'), qrcodeParams)
          },
          hide () {
            _this.getPhoneUploadFJ()
          }
        },
        slots: {
          default: ({ $modal }, h) => {
            return [
              h(QrcodeModal, {
                props: {
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  uploadSuccess () {
                    $modal.close()
                    _this.getPhoneUploadFJ()
                  }
                }
              })
            ]
          }
        }
      })
    },
    // 关闭二维码弹框后获取本次手机上传的附件
    getPhoneUploadFJ () {
      let params = {
        DJID: this.guid
      }
      this.$fn.ajax(getPhoneUploadFJ, params, res => {
        if (res.status === 200) {
          this.uploadFiles = res.data
          this.$emit('fileParse', this.uploadFiles)
        }
      })
    }
  },
  mounted () {
    let agreement = document.location.protocol //     当前协议
    this.isHttps = agreement.indexOf('https') !== -1
  }
}
</script>
<style lang="less">
  @import './upload-modal.less';
</style>
