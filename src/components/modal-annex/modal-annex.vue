<!--公用组件：附件管理弹出框
     /**
     * @desc 弹窗内实现附件上传预览功能
     * @author liutz
     * @date 2019-02-19
     * @param {Event} [@annexModalOperate]    - 弹窗操作事件 [必须]
     * @param {Boolean} [modalAnnexBtn]  - 弹窗显示隐藏判断 [必须]
     * @param {String} [modalTitle]      - 弹窗标题 [非必须] [默认:'附件管理']
     * @param {Number} [modalWidth]      - 弹窗宽度 [非必须] [默认:922]
     * @param {Boolean} [footerHide]     - 弹窗尾部隐藏判断 [非必须] [默认:隐藏]
     * @example 调用示例
     * <modal-annex
     *   @annexModalOperate="annexModalOperate"
     *   :modalAnnexBtn="modalAnnexBtn"
     *   :modalTitle="modalTitle"
     *   :modalWidth="modalWidth"
     *   :footerHide="footerHide"/>
     *
     *  methods: {
     *    接收附件子组件状态改变通知
     *    annexModalOperate (val) {
     *      this.modalAnnexBtn = val
     *    }
     *   }
     */
-->
<template>
  <div>
    <Modal class="modal-annex"
           v-model="modalFlag"
           :width="modalWidth"
           :footerHide="footerHide"
           draggable
           scrollable
           :title="modalTitle">
      <div class="fj-operate"
           v-if="isUpload">
        <Button type="text"
                @click="fjBtnClick()"
                class="fj-btn-back">
          <Icon type="ios-arrow-back" /> 返回
        </Button>
      </div>
      <div class="fj-operate"
           v-else>
        <span class="fj-text">附件数：共 {{fileListLen}} 个</span>
        <Button type="primary"
                class="fj-btn-upload"
                @click="fjBtnClick()"
                v-show="canUpload">上传</Button>
      </div>
      <div class="fj-boder">
        <Row v-if="isUpload">
          <Col :span="6">
          <Upload multiple
                  ref="upload"
                  type="select"
                  :data="postData"
                  :headers="headers"
                  :before-upload="handleBeforeUpload"
                  :action="uploadUrl"
                  :showUploadList="false"
                  :on-success="handeleSuccess"
                  :on-error="handeleError">
            <div class="fj-btn-add">
              <Icon type="md-add"
                    :size="50" />
            </div>
          </Upload>
          </Col>
          <Col v-for="item in uploadList"
               :key="item.uid"
               :span="6">
          <div class="fj-view-div"
               @click="handlePick(item.uid)">
            <Icon type="md-checkmark-circle"
                  class="fj-view-pick"
                  v-if="item.isPick" />
            <img :src="imgLogo"
                 class="fj-view-logo"
                 v-if="item.type.split('/')[1] === 'jpeg' || item.type.split('/')[1] === 'bmp' || item.type.split('/')[1] === 'png'" />
            <img :src="txtLogo"
                 class="fj-view-logo"
                 v-else-if="item.type.split('/')[0] === 'text'" />
            <img :src="pdfLogo"
                 class="fj-view-logo"
                 v-else-if="item.type.split('/')[1] === 'pdf'" />
            <img :src="pptLogo"
                 class="fj-view-logo"
                 v-else-if="item.type.split('/')[1] === 'vnd.ms-powerpoint'
                   || item.type.split('/')[1] === 'vnd.openxmlformats-officedocument.presentationml.presentation'" />
            <img :src="wordLogo"
                 class="fj-view-logo"
                 v-else-if="item.type.split('/')[1] === 'msword'
                   || item.type.split('/')[1] === 'vnd.openxmlformats-officedocument.wordprocessingml.document'" />
            <img :src="xlsLogo"
                 class="fj-view-logo"
                 v-else-if="item.type.split('/')[1] === 'vnd.ms-excel'
                   || item.type.split('/')[1] === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'" />
            <div class="fj-view-name">
              {{item.name}}
            </div>
            <div class="fj-view-icon">
              <Icon type="ios-cloud-upload-outline"
                    :size="25"
                    style="margin-left: 10px"
                    @click="handleUploadOnce(item.uid)" />
              <Icon type="md-trash"
                    :size="25"
                    style="margin-left: 10px"
                    @click="handleDel(item.uid)" />
            </div>
          </div>
          </Col>
        </Row>
        <Row v-else>
          <Col v-for="item in fileList"
               :key="item.gxguid"
               :span="6">
          <div class="fj-view-div">
            <img :src="imgLogo"
                 class="fj-view-logo"
                 v-if="item.fjkzm === '.bmp'
                   || item.fjkzm === '.jpg' || item.fjkzm === '.png'" />
            <img :src="txtLogo"
                 class="fj-view-logo"
                 v-else-if="item.fjkzm === '.txt'" />
            <img :src="pdfLogo"
                 class="fj-view-logo"
                 v-else-if="item.fjkzm === '.pdf'" />
            <img :src="pptLogo"
                 class="fj-view-logo"
                 v-else-if="item.fjkzm === '.ppt'
                   || item.fjkzm === '.pptx'" />
            <img :src="wordLogo"
                 class="fj-view-logo"
                 v-else-if="item === '.doc'
                   || item.fjkzm === '.docx'" />
            <img :src="xlsLogo"
                 class="fj-view-logo"
                 v-else-if="item.fjkzm === '.xls'
                   || item.fjkzm === '.xlsx'" />
            <div class="fj-view-name">
              {{item.fjmc}}
            </div>
            <div class="fj-view-icon">
              <Icon type="ios-cloud-download-outline"
                    :size="25"
                    style="margin-left: 10px "
                    @click="handleDownload(item.gxguid)" />
              <Icon type="md-trash"
                    :size="25"
                    style="margin-left: 10px"
                    @click="handleDel(item.gxguid)"
                    v-if="canUpload" />
            </div>
          </div>
          </Col>
        </Row>
      </div>
      <div class="fj-footer"
           v-if="isUpload">
        <span style="font-size: 14px">{{pickUploadListLen}}个文件 选中</span>
        <Button type="primary"
                style="margin: 8px 15px 8px 15px"
                @click="handleUploadAll">开始上传</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { getToken } from '@/libs/util'
import { uuid } from '@/libs/tools'
import { getFileList, deleteFile, downloadFile } from '@/api/basePort'
import config from '@/config'
export default {
  name: 'ModalAnnex',
  data () {
    return {
      // 上传页面or下载页面
      isUpload: false,
      // 单独上传or批量上传
      once: false,
      // 是否上传成功过
      success: false,
      // 上传请求头个性化增加
      headers: {
        'Authorization': getToken()
      },
      // 待上传附件
      uploadList: [],
      // 已上传附件
      fileList: [],
      // 上传文件路径
      uploadUrl: config.baseUrl.pro + '/pub/fileOpertion/upload',
      // 上传头文件图标
      imgLogo: require('@/assets/images/annex/img.png'),
      pdfLogo: require('@/assets/images/annex/pdf.png'),
      pptLogo: require('@/assets/images/annex/ppt.png'),
      txtLogo: require('@/assets/images/annex/txt.png'),
      wordLogo: require('@/assets/images/annex/word.png'),
      xlsLogo: require('@/assets/images/annex/xls.png'),
      otherLogo: require('@/assets/images/annex/other.png'),

      // 发送数据
      postData: {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        modCode: this.modCode,
        djlx: (this.djid === 0 ? '-1' : this.djlx),
        djid: (this.djid === 0 ? this.oldDjid : this.djid) + '',
        fileName: ''
      }
    }
  },
  props: {
    // 控制弹出框打开关闭
    modalAnnexBtn: {
      type: Boolean,
      default: false
    },
    // 弹出框标题
    modalTitle: {
      type: String,
      default: '附件管理'
    },
    // 弹出框宽度
    modalWidth: {
      type: Number,
      default: 922
    },
    // 隐藏弹出框footer
    footerHide: {
      type: Boolean,
      default: true
    },
    // 模块标识
    modCode: {
      type: String,
      default: ''
    },
    // 单据类型
    djlx: {
      type: String,
      default: ''
    },
    // 单据ID（mlid）
    djid: {
      type: [String, Number],
      default: 0
    },
    // 初始附件DJID
    oldDjid: {
      type: String,
      default: ''
    },
    canUpload: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    modalAnnexBtn () {
      if (this.modalAnnexBtn === true) {
        this.getFileList()
      }
    },

    isUpload () {
      if (this.isUpload === false) {
        this.getFileList()
      }
    },
    uploadList (val) {
      console.log(val)
    },
    fileList (val) {
      console.log(val)
      if (val.length === 0) {
        this.$emit('uplodSate', false)
      }
      for (let i = 0; i < val.length; i++) {
        this.fileList[i].fjkzm = val[i].fjkzm.toLowerCase()
      }
    },
    params: {
      handler (newVal) {
        this.postData.modCode = newVal.modCode
        this.postData.djlx = newVal.djid === 0 ? '-1' : newVal.djlx
        this.postData.djid = (newVal.djid === 0 ? this.oldDjid : newVal.djid) + ''
      },
      // 开启深度监听，监听对象中所有值
      deep: true
    }
  },
  computed: {
    /* props不允许双向绑定,需要自定义传递 */
    modalFlag: {
      get () {
        return this.modalAnnexBtn
      },
      set (val) {
        console.log(val)
        this.$emit('annexModalOperate', val)
      }
    },

    /* 监控已选中附件数 */
    pickUploadListLen () {
      let len = 0
      for (let obj of this.uploadList) {
        if (obj.isPick === true) {
          len += 1
        }
      }
      return len
    },

    /* 监控已上传附件数 */
    fileListLen () {
      return this.fileList.length
    },

    /* 监控prop变化 */
    params () {
      const { modCode, djlx, djid, oldDjid } = this
      return { modCode, djlx, djid, oldDjid }
    }
  },
  methods: {
    /* 上传按钮点击事件 */
    fjBtnClick () {
      this.isUpload = !this.isUpload
    },

    /* 上传文件拦截，手动上传 */
    handleBeforeUpload (file) {
      const _this = this
      if (file.type.split('/')[1] === 'jpeg' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.jpg`
      } else if (file.type.split('/')[1] === 'bmp' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.bmp`
      } else if (file.type.split('/')[1] === 'png' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.png`
      } else if (file.type.split('/')[1] === 'pdf' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.pdf`
      } else if (file.type.split('/')[1] === 'ppt' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.ppt`
      } else if (file.type.split('/')[1] === 'txt' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.txt`
      } else if (file.type.split('/')[1] === 'word' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.doc`
      } else if (file.type.split('/')[1] === 'xls' && file.name.indexOf('.') !== -1) {
        this.postData.fileName = `${file.name}.xls`
      } else {
        this.postData.fileName = file.name
      }
      file.isPick = true
      file.uid = uuid()
      _this.uploadList.push(file)
      return false
    },

    /* 点击删除按钮 */
    handleDel (uid) {
      if (this.isUpload) {
        for (let idx = 0; idx < this.uploadList.length; idx++) {
          if (this.uploadList[idx].uid === uid) {
            this.uploadList.splice(idx, 1)
            break
          }
        }
      } else {
        deleteFile({ 'gxGuid': uid }).then(
          res => {
            if (res.status === 200) {
              // this.$Message.success(res.msg)
              this.$fn.success({
                desc: res.msg
              })
              this.getFileList()
            }
          }
        )
      }
    },

    /* 选择单个附件 选中或取消选中 */
    handlePick (uid) {
      for (let idx = 0; idx < this.uploadList.length; idx++) {
        if (this.uploadList[idx].uid === uid) {
          let file = this.uploadList[idx]
          file.isPick = !file.isPick
          this.$set(this.uploadList, idx, file)
          break
        }
      }
    },

    /* 上传单个附件 */
    handleUploadOnce (uid) {
      this.once = true
      for (let idx = 0; idx < this.uploadList.length; idx++) {
        if (this.uploadList[idx].uid === uid) {
          let item = this.uploadList[idx]
          this.$refs.upload.post(item)
          break
        }
      }
    },

    /* 上传全部附件 */
    handleUploadAll () {
      this.once = false
      for (let obj of this.uploadList) {
        if (obj.isPick) {
          this.$refs.upload.post(obj)
        }
      }
    },

    /* 上传附件成功提示 */
    handeleSuccess (response, file, fileList) {
      if (response.status === 200) {
        this.$emit('uplodSate', true)
        // 区分单独上传批量上传提示
        if (this.once) {
          this.handleDel(file.uid)
          // this.$Message.success('附件上传成功!')
          this.$fn.success({
            desc: '附件上传成功!'
          })
          if (this.uploadList.length === 0) {
            this.isUpload = false
          }
        } else {
          if (this.uploadList.length === 1) {
            this.handleDel(file.uid)
            // this.$Message.success('附件全部上传成功!')
            this.$fn.success({
              desc: '附件全部上传成功!'
            })
            this.isUpload = false
          } else {
            this.handleDel(file.uid)
          }
        }
      } else {
        // this.$Message.error('附件上传失败!')
        this.$fn.error({
          desc: '附件上传失败!'
        })
      }
    },

    /* 上传附件失败提示 */
    handeleError (error, file) {
      console.log(error)
      // this.$Message.error(`附件 ${file.name} 上传失败!`)
      let tip = `附件 ${file.name} 上传失败!`
      this.$fn.error({
        desc: tip
      })
    },

    /* 已上传附件初始化 */
    getFileList () {
      getFileList(this.postData).then(
        res => {
          if (res.status === 200) {
            this.fileList = res.data
          }
        }
      )
    },

    /* 已上传附件下载 */
    handleDownload (uid) {
      downloadFile({ 'gxGuid': uid }).then(
        res => {
          let content = res
          let blob = new Blob([content])
          let fileName = ''
          for (let obj of this.fileList) {
            if (obj.gxguid === uid) {
              fileName = obj.fjmc
              break
            }
          }
          if ('download' in document.createElement('a')) { // 非IE下载
            const elink = document.createElement('a')
            elink.download = fileName
            elink.style.display = 'none'
            elink.href = URL.createObjectURL(blob)
            document.body.appendChild(elink)
            elink.click()
            URL.revokeObjectURL(elink.href) // 释放URL 对象
            document.body.removeChild(elink)
          } else { // IE10+下载
            navigator.msSaveBlob(blob, fileName)
          }
        }
      ).catch(() => {
        // this.$Message.error('下载附件失败，请联系管理员')
        _this.$fn.error({
          desc: '下载附件失败，请联系管理员'
        })
      })
    }
  }
}
</script>

<style lang="less">
  @import './modal-annex.less';
</style>
