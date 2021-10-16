<template>
  <div class="upload-files">
    <slot name="upload-slot"></slot>
    <!-- 单据设置 -->
    <template v-if="design">
      <template v-if="billSetFileType.length>0">
        <Row v-for="(items, index) in billSetFileType"
             :key="index">
          <Col span="24">
          <template v-if="items.FJLXDM === '_'"></template>
          <template v-else>
            <div class="file-cell">
              <span >{{ items.FJLXMC }}</span>
              <Checkbox v-model="items.isSelect"
                        @on-change='(val) => handleSelectChange(val, items)'
                        style="margin-left:10px;">
                <span>显示</span>
              </Checkbox>
              <Checkbox v-model="items.isRequire"
                        :disabled='!items.isSelect'
                        style="margin-left:10px;">
                <span>必传</span>
              </Checkbox>
            </div>
          </template>
          </Col>
        </Row>
      </template>
      <template v-else> 附件上传不区分附件类型 </template>
    </template>
    <!-- 单据页面 -->
    <template v-else>
      <!-- 附件上传 -->
      <div>
        <div v-for="(items, index) in fileList"
             :key="index"
             class="file-show file-border">
          <div class="files-top"
               v-if="editable || items.FJLXMC !==''">
            <span :class="{'file-name':true,'file-require':items.isRequire}">{{items.FJLXMC}}</span>
            <div class="upload">
              <Upload v-if="editable"
                      class="file-btn"
                      multiple
                      title="上传"
                      :default-file-list="defaultFilelist[items.FJLXGUID]"
                      :data="getUploadParmas(items.FJLXGUID)"
                      :headers="headers"
                      :action="uploadUrl"
                      :show-upload-list="true"
                      :on-success="(response, file, fileList) => handeleSuccess(response, file, fileList,items.FJLXGUID)"
                      :on-exceeded-size="checkSize">
                <Button type="text">
                  <Icon type="ios-cloud-upload-outline"
                        size="22" /> 上传
                </Button>
              </Upload>
            </div>
          </div>
          <ul class="upload-list">
            <li v-for="(file, index) in defaultFilelist[items.FJLXGUID]"
                :key="index"
                class="file-show border"
                @mouseover="changeActive($event)"
                @mouseout="removeActive($event)">
              <span class="fileInfo name">附件名称：{{file.fjmc}}</span>
              <span class="fileInfo editorName">
                别名：
                <Input v-model="file.otherName"
                       :icon="editable?'md-checkmark':''"
                       :readonly="!editable"
                       placeholder="请输入修改名称"
                       :class="file.isEditName?'isEditName':''"
                       style="width: 200px"
                       @on-click="handleClickIcon(file)" />
              </span>
              <span class="fileInfo">上传人：{{file.createName}}</span>
              <span class="fileInfo actions">
                <Tooltip content="下载"
                         placement="top"
                         transfer>
                  <Icon type="md-arrow-down"
                        @click="handleDownLoadFile(file)"
                        size="18" />
                </Tooltip>
                <Tooltip content="删除"
                         placement="top"
                         transfer
                         v-if="editable">
                  <Icon type="ios-trash-outline"
                        @click="handleDelFile(file)"
                        size="18" />
                </Tooltip>
              </span>
            </li>
          </ul>
        </div>
        <!--兼容老数据,老数据不支持上传，只支持显示查看，下载，删除，修改别名-->
        <div v-if="oldFiles.length>0">
          <ul class="upload-list oldfile">
            <li v-for="(file, index) in oldFiles"
                :key="index"
                class="file-show border"
                @mouseover="changeActive($event)"
                @mouseout="removeActive($event)">

              <span class="fileInfo name">附件名称：{{file.fjmc}}</span>
              <span class="fileInfo editorName">
                别名：
                <Input v-model="file.otherName"
                       :class="file.isEditName?'isEditName':''"
                       icon="md-checkmark"
                       placeholder="请输入修改名称"
                       style="width: 200px"
                       @on-click="handleClickIcon(file)" />
              </span>
              <span class="fileInfo">上传人：{{file.createName}}</span>
              <span class="fileInfo actions">
                <Tooltip content="下载"
                         placement="top"
                         transfer>
                  <Icon type="md-arrow-down"
                        @click="handleDownLoadFile(file)"
                        size="18" />
                </Tooltip>
                <Tooltip content="删除"
                         placement="top"
                         transfer
                         v-if="editable">
                  <Icon type="ios-trash-outline"
                        @click="handleDelFile(file)"
                        size="18" />
                </Tooltip>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { getFileTypeList, getFileList, downloadFile, deleteFile, editFJName } from '@/api/pub/upload-files'
import { getToken } from '@/libs/util'
import clonedeep from 'clonedeep'
export default {
  name: 'UploadFiles',
  data () {
    return {
      social: [],
      billSetFileType: [],
      fileList: [],
      rowversion: '',
      djlx: '-1',
      fileDjid: '',
      postData: {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        modCode: window.location.href.split('/')[3], // 模块标识
        // modCode: 'PMS',
        djlx: this.$route.params.rowversion ? this.$route.params.gnflDm : '-1',
        djid: this.rowversion,
        fileName: ''
      },
      headers: {
        'Authorization': getToken()
      },
      defaultFilelist: { '_': [] },
      activeItem: '',
      oldFiles: [] // 之前的老数据
    }
  },
  computed: {
    uploadUrl () {
      return '/' + this.moduleType + '/fileOpertion/upload'
    },
    isGetFile () {
      if (this.parentData) {
        return this.parentData.isGetFile
      }
    },
    pmsDjlxChange () {
      if (this.parentData) {
        return this.parentData.pmsDjlxChange
      }
    }
  },
  props: {
    parentData: {
      type: Object,
      default: () => { }
    },
    elementStruts: {
      type: Object,
      default: () => { }
    },
    editable: {
      type: Boolean,
      default: true
    },
    design: {
      type: Boolean,
      default: true
    },
    isDJDesign: {
      type: Boolean,
      default: false
    },
    FJLB: {
      type: String,
      default: ''
    },
    moduleType: { // 模块标识
      type: String,
      default: 'pub'
    },
    billId: {
      type: [String, Number],
      default: '0'
    }
  },
  watch: {
    billSetFileType: {
      deep: true,
      handler () {
        this.elementStruts.options.filesType = this.billSetFileType
      }
    },
    billId () {
      if (this.billId === 0) { // 新单
        this.fileDjid = this.parentData.billDjguid.toString()
      } else {
        this.djlx = this.$route.params.gnflDm
        this.fileDjid = this.billId
      }
    },
    'parentData.billDjguid' () {
      for (let key in this.defaultFilelist) {
        this.defaultFilelist[key] = []
      }
      let annex = this.getAnnexMapFromParent()
      annex.length = 0
    },
    // 项目管理，选择项目编好后，传标识 isGetFile=true,带出附件
    isGetFile () {
      if (this.isGetFile) {
        this.getFileList()
      }
    },
    // 项目管理，选择备选库项目后，传pmsDjlxChange === '1'，带出附件
    pmsDjlxChange () {
      if (this.pmsDjlxChange === '1') {
        this.djlx = this.pmsDjlxChange
        this.getFileList()
        this.djlx = this.$route.params.gnflDm
      }
    }
  },
  methods: {
    handleSelectChange (val, item) {
      if (!val) {
        item.isRequire = false
      }
    },
    // 获取上传参数 如果单据未保存，上传附件，djlx = -1
    getUploadParmas (fjlxguid) {
      return {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        zth: this.$store.state.app.env.zth,
        fjlxguid,
        modCode: window.location.href.split('/')[3], // 模块标识
        // modCode: 'PMS', // 模块标识
        djlx: this.djlx,
        djid: this.fileDjid, // 功能分录代码
        fileName: '',
        fjlb: this.FJLB
      }
    },
    // 鼠标移上样式类名切换
    changeActive ($event, gxguid) {
      $event.currentTarget.className = 'file-active'
      this.activeItem = gxguid
    },
    removeActive ($event) {
      $event.currentTarget.className = ''
      this.activeItem = ''
    },
    /*
    * 获取附件类型,必传附件类型
    * 如果没有附加类型，则前端生成一个，'fjlxmc': '',  'fjlxguid': '_',  'fjlxdm': '_',
    */
    getFileTypeList () {
      let data = {
        url: this.moduleType,
        parmas: {
          gsdm: this.$store.getters.env.gsdm,
          kjnd: this.$store.getters.env.kjnd,
          zth: this.$store.getters.env.zth,
          modcode: this.$route.params.modcode || this.$route.params.modCode
        }
      }
      return getFileTypeList(data).then(res => {
        let data = res.data
        res.data.map(item => {
          if (item.fjlxdm === '_') {
            item.isSelect = true
          }
        })
        let fileStruts = clonedeep(this.elementStruts.options.filesType)
        if (fileStruts && fileStruts.length > 0) {
          for (let i = 0, len = fileStruts.length; i < len; i++) {
            if (fileStruts[i].isSelect) {
              data.map(item => {
                if (item.FJLXGUID === fileStruts[i].FJLXGUID) {
                  item.isRequire = fileStruts[i].isRequire
                  item.isSelect = fileStruts[i].isSelect
                }
              })
            }
          }
        }
        this.billSetFileType = data
      })
    },
    // 项目管理，获取附件类型
    getPMSFileType () {
      let parmas = {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        zth: this.$store.getters.env.zth,
        modcode: this.$route.params.modcode || this.$route.params.modCode
      }
      let data = {
        url: this.moduleType,
        parmas: parmas
      }
      getFileTypeList(data).then(res => {
        let data = res.data
        for (let i = 0, len = data.length; i < len; i++) {
          data[i].isRequire = true
          data[i].isSelect = true
        }
        this.billSetFileType = data
        this.billSetFileType = clonedeep(this.billSetFileType)
        this.elementStruts.options.filesType = this.billSetFileType
        this.setFileType()
      })
    },
    /** ************ 功能 ********************/
    /*
       * 获取已上传附件列表
       * 新单djlx = -1  djid:取自单据的时间戳oldDjid
       * 旧单：djlx = 路由中的gnflDm  djid=djid
       * 为了兼容老数据，把和fjlxguid="" 放置在oldFiles中，在最下面显示
       */
    getFileList () {
      this.oldFiles = []
      let parmas = {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        modCode: window.location.href.split('/')[3], // 模块标识
        djlx: this.djlx,
        djid: this.fileDjid.toString(),
        fileName: '',
        fjlb: this.FJLB
      }
      let data = {
        url: this.moduleType,
        parmas: parmas
      }
      return getFileList(data).then(res => {
        if (res.status === 200) {
          let data = res.data.map(item => {
            item.name = item.fjmc
            return item
          })
          for (let i = 0, len = data.length; i < len; i++) {
            // 兼容旧的附件
            if (!data[i].hasOwnProperty('fjlxguid') || data[i].fjlxguid === '') {
              this.oldFiles.push(data[i])
              // 分两种情况：this.defaultFilelist如果找不到fjlxguid；归结到旧的附件里，直接罗列
              // 否则就是新的附件，并且区分附件类型。
            } else if (this.defaultFilelist.hasOwnProperty(data[i].fjlxguid)) {
              this.defaultFilelist[data[i].fjlxguid] ? this.defaultFilelist[data[i].fjlxguid].push(data[i]) : this.oldFiles.push(data[i])
            } else {
              this.oldFiles.push(data[i])
            }
          }
          this.oldFiles = [...this.oldFiles]
          this.defaultFilelist = clonedeep(this.defaultFilelist)
        }
      })
    },
    // 附件上传
    handeleSuccess (response, file, fileList, id) {
      if (response.status === 200) {
        this.$fn.success({
          title: '正确',
          desc: response.msg
        })
        this.oldFiles = []
        for (let i = 0, len = this.fileList.length; i < len; i++) {
          this.defaultFilelist[this.fileList[i].FJLXGUID] = []
        }
        this.getFileList().then(() => {
          let len = this.oldFiles.length
          Object.values(this.defaultFilelist).map(item => {
            len += item.length
          })
          this.$emit('on-change', len)
        })
      } else {
        this.$fn.error({
          title: '错误',
          desc: response.message
        })
      }
    },
    // 附件删除
    handleDelFile (file) {
      let parmas = {
        gxGuid: file.gxguid
      }
      let data = {
        url: this.moduleType,
        parmas: parmas
      }
      deleteFile(data).then(
        res => {
          if (res.status === 200) {
            this.$fn.success({
              desc: res.msg
            })
            this.oldFiles = []
            if (this.defaultFilelist.hasOwnProperty(file.fjlxguid)) {
              this.defaultFilelist[file.fjlxguid] = []
            }
            this.getFileList()
          }
        }
      )
    },
    //  附件校验，提供单据保存回调 返回值：true/false
    validate (_callback) {
      let valid = true
      for (let i = 0, len = this.fileList.length; i < len; i++) {
        if (this.fileList[i].isRequire) {
          if (this.defaultFilelist[this.fileList[i].FJLXGUID].length < 1 && this.fileList[i].FJLXGUID !== '_') {
            valid = false
            break
          }
        }
      }
      if (!valid) {
        this.$fn.error({ title: '错误提示', desc: `有必传附件未上传` })
      }
      _callback(valid)
    },
    // 修改附件名，初始化为空，取自附件列表中的othername字段
    handleClickIcon (file) {
      let parmas = {
        atguid: file.atguid,
        otherName: file.otherName
      }
      if (parmas.otherName === '') {
        this.$fn.error({
          title: '错误',
          desc: '附件别名为空'
        })
        return false
      } else {
        editFJName(parmas).then(
          res => {
            if (res.status === 200) {
              this.$fn.success({
                desc: res.msg
              })
              // 附件修改别名，成功后
              for (let i = 0, len = this.defaultFilelist[file.fjlxguid].length; i < len; i++) {
                if (this.defaultFilelist[file.fjlxguid][i].gxguid === file.gxguid) {
                  this.defaultFilelist[file.fjlxguid][i]['isEditName'] = true
                }
              }
              this.defaultFilelist = clonedeep(this.defaultFilelist)
            }

            // file['isEditName'] = true
          }
        )
      }
    },
    /*
       * 下载附件
       * url:主要区分非pub下面的附件，比如：项目管理里面的项目绩效
       * 附件下载的入参必须是params，
    */
    handleDownLoadFile (file) {
      let data = {
        gxGuid: file.gxguid
      }
      let params = {
        url: this.moduleType,
        data: data
      }
      downloadFile(params).then(
        res => {
          let content = res
          let blob = new Blob([content])
          let fileName = file.fjmc
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
        _this.$fn.error({
          desc: '下载附件失败，请联系管理员'
        })
      })
    },
    // 附件类型生成,上传成功、删除成功、重新回调
    setFileType () {
      let fileStruts = []
      if (this.elementStruts.options.filesType && this.elementStruts.options.filesType.length > 0) {
        fileStruts = clonedeep(this.elementStruts.options.filesType)
      } else if (this.isDJDesign && this.elementStruts.length > 0) { // lisr 代码可能是错的。elementStruts应该是Map结构
        fileStruts = clonedeep(this.elementStruts.filesType)
      }
      /* 单据设置从附件类型接口获取，单据页面从结构elementStruts筛选必填附件类型显示 */
      this.fileList = fileStruts.filter(item => item.isSelect)
      if (this.fileList.length > 0) {
        this.oldFiles = []
        for (let i = 0, len = this.fileList.length; i < len; i++) {
          this.defaultFilelist[this.fileList[i].FJLXGUID] = []
        }
      } else {
        // 针对有附件类型不选用户,指定默认附件类型
        this.fileList = [
          {
            'fjlxmc': '',
            'fjlxguid': '_',
            'fjlxdm': '_',
            'isSelect': true
          }
        ]
        this.oldFiles = []
        this.defaultFilelist['_'] = []
      }
      setTimeout(() => this.getFileList(), 40)
    },
    //* 验证附件大小
    checkSize (file, fileList) {
      this.$fn.error({
        desc: '附件超出上传限制，请上传20M以内文件'
      })
    },
    getAnnexMapFromParent () {
      let item = Object.values(this.parentData).find(item => item.CARDTYPE === '999')
      if (item) {
        return item.data
      }
      return []
    },
    /*
       * 新单，旧单，进来是否加载列表,新单不加载附件列表，旧单加载
       * 目前有个bug:登记簿跳转过来的会执行2次getFileList
    */
    isInitPage () {
      if (this.billId === 0) { // 新单
        this.fileDjid = this.parentData.billDjguid.toString()
      } else {
        this.djlx = this.$route.params.gnflDm
        this.fileDjid = this.billId.toString()
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      if (this.$route.params.modcode === 'PMS') {
        this.moduleType = 'pms'
      }
      this.isInitPage()
      this.setFileType()
      if (this.design) {
        this.getFileTypeList()
      }
    })
  }
}
</script>

<style lang="less">
  @import './upload-files.less';
</style>
