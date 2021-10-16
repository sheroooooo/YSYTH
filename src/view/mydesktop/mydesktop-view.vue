<template>
  <plg-doc-wrapper class="mydesktop-wrapper"
                   :style="docStyle"
                   :headerConfig="[]">
    <div ref="deskCenter"
         :id="desktopId"
         :class="[`${prefixCls}`]"
         :style="desktopStyle">

      <template v-for="(cmpt,idx) in desktopCmpts">
        <div v-if="userRightList.indexOf(cmpt.id)>=0"
             class="resizeable-cmpt"
             :key="`pnl${_uid}_${idx}`"
             :style="cmptStyle(cmpt)">

          <component :ref="`busUnit`"
                     :is="cmpt.name"
                     :bgColor="bgColor"
                     :bgftColor="bgftColor"
                     :bdColor="bdColor"
                     :header-title="cmpt.title"
                     :show-header="cmpt.showHeader"
                     :height="cmpt.h"
                     :width="cmpt.w"
                     :boxShadow="boxShadow"
                     :show-border="showBorder"></component>
        </div>
      </template>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import { getUseSatusPlan } from '@/api/user'
import cmpts from './components/index.js'
import { getBusinessComponentPermission } from '@/api/mydesktop/mydesktop.js'
// const defaultDesktop = [{ 'name': 'MuchUsedMenu', 'title': '常用功能', 'x': 10, 'y': 10, 'w': 1009, 'h': 150, 'deskWidth': 1046 }, { 'name': 'WorkNotices', 'title': '工作通知', 'x': 10, 'y': 170, 'w': 510, 'h': 242, 'deskWidth': 1046 }, { 'name': 'FinancialCondition', 'title': '账务情况', 'x': 10, 'y': 420, 'w': 1011, 'h': 390, 'deskWidth': 1046 }, { 'name': 'VardSwiper', 'title': '待办事宜', 'x': 530, 'y': 170, 'w': 489, 'h': 241, 'deskWidth': 1046 }]
export default {
  name: 'MydesktopView',
  components: { ...cmpts },
  inject: ['handleHomeSet'],
  data () {
    const desktopId = `desktop${this.$utils.guid()}`
    return {
      desktopId,
      prefixCls: 'mydesktop-view',
      bgColor: '#fff',
      bgftColor: '#333',
      bdColor: '#d1d1d1',
      boxShadow: false,
      showBorder: true,
      // 已经选择的插件，根据色色变化
      desktopCmpts: [],
      // 用户授权的插件，根据角色变化
      userRightList: ['9601', '9602', '9603', '9604', 'VardSwiper', '9605', '9606'],
      // 记录设计时桌面宽用于显示时计算
      deskWidth: 800,
      deskHeight: 0
    }
  },
  computed: {
    docStyle () {
      return this.showBorder ? `` : `background:#f5f5f5;`
    },
    desktopStyle () {
      return `position: relative;overflow:auto;height:${this.deskHeight}px;`
    },
    cmptStyle (cmpt) {
      return (cmpt) => {
        return `position:absolute;display:inline-block;left:${cmpt.x}px;top:${cmpt.y}px;width:${cmpt.w}px;height:${cmpt.h}px;`
      }
    },
    evnStr () {
      return this.$store.state.app.env.gsdm + '-' + this.$store.state.app.env.zth
    }
  },
  watch: {
    '$store.state.app.workPlanId' (newVal, oldVal) {
      this.desktopId = this.$store.state.app.workPlanId
      if (!this.desktopId) {
        this.desktopCmpts = []
      } else {
        // this.getUseSatusPlan()
      }
    },
    evnStr (newVal, oldVal) {
      const refs = this.$refs.busUnit
      for (let i = 0, len = refs.length; i < len; i++) {
        const ref = refs[i]
        if (ref.$mounted) {
          ref.$mounted()
        }
      }
    }
  },
  methods: {
    getUserRightList () {
      const { gsdm, zth, kjnd } = this.$store.state.app.env
      getBusinessComponentPermission({ GSDM: gsdm, ZTH: zth, KJND: kjnd }).then(res => {
        this.userRightList = res.data
      })
    },
    updateDeskTop () {
      let elementResizeDetectorMaker = require('element-resize-detector')// 导入
      let _this = this
      // 创建实例带参
      let erd = elementResizeDetectorMaker({
        strategy: 'scroll', // <- For ultra performance.
        callOnAdd: true,
        debug: false
      })
      // 监听id为test的元素 大小变化
      erd.listenTo(document.getElementById(this.desktopId), function (element) {
        let width = element.offsetWidth
        _this.deskWidth = width
        // 重新调整组件位置与大小
        _this.updateCmpts()
      })
    },
    // 后台请求回结果后要执行此方法调整
    updateCmpts () {
      this.deskHeight = 0
      let offsetL = 0
      let offsetR = 0
      const len = this.desktopCmpts.length
      for (let i = 0; i < len; i++) {
        const cmpt = this.desktopCmpts[i]
        const rate = this.deskWidth / cmpt.deskWidth
        cmpt.w = Math.round(cmpt.w * rate)
        cmpt.h = Math.round(cmpt.h * rate)
        cmpt.x = Math.round(cmpt.x * rate)
        cmpt.y = Math.round(cmpt.y * rate)
        cmpt.deskWidth = this.deskWidth
        if (i === 0) {
          offsetL = cmpt.x
          offsetR = cmpt.x + cmpt.w
        } else {
          if (offsetL > cmpt.x) {
            offsetL = cmpt.x
          }
          if (offsetR < cmpt.x + cmpt.w) {
            offsetR = cmpt.x + cmpt.w
          }
        }
        if (cmpt.y + cmpt.h > this.deskHeight) {
          this.deskHeight = cmpt.y + cmpt.h
        }

        this.$set(this.desktopCmpts, i, cmpt)
      }
      this.deskHeight = this.deskHeight + 8
      if (this.deskHeight < window.innerHeight - 80) {
        this.deskHeight = window.innerHeight - 80
      }
      const offsetX = Math.floor((this.deskWidth - (offsetR - offsetL)) / 2) - offsetL
      if (offsetX !== 0) {
        for (let i = 0; i < len; i++) {
          const cmpt = this.desktopCmpts[i]
          cmpt.x = cmpt.x + offsetX
          this.$set(this.desktopCmpts, i, cmpt)
        }
      }
    },
    //
    /*
    * 获取当前使用的方案
    */
    getUseSatusPlan () {
      let parmas = {
        'gsdm': this.$store.state.app.env.gsdm,
        'kjnd': this.$store.state.app.env.kjnd,
        'zth': this.$store.state.app.env.zth,
        'time': new Date().getTime()
      }
      getUseSatusPlan(parmas).then(
        async res => {
          if (res && res.data) {
            if (res.data.detFlag) {
              this.$store.dispatch('updataWorkPlan', res.data.schemeGuid)
              const detFlag = JSON.parse(res.data.detFlag)[0]
              // 原工作台转换
              if (detFlag.split) {
                await this.transOldDesktop(JSON.parse(res.data.detFlag))
              } else {
                this.showBorder = detFlag.showBorder
                this.boxShadow = detFlag.boxShadow
                this.desktopCmpts = detFlag.desktopCmpts || []
              }
            }
            // console.log(this.desktopCmpts, '页面组件')
          }
          if (this.desktopCmpts.length === 0) {
            // this.desktopCmpts = this.$utils.clone(defaultDesktop, true)
            setTimeout(() => {
              this.handleHomeSet()
            }, 300)
            return false
          }
          this.updateCmpts()
          this.updateDeskTop()
        }
      )
    },
    async transOldDesktop (desktop) {
      this.desktopCmpts = []
      for (let i = 0; i < desktop.length; i++) {
        const col = desktop[i]
        const width = this.deskWidth * parseFloat(col.split)
        let y = 8
        let x = i === 0 ? 8 : width
        for (let j = 0, len = col.children.length; j < len; j++) {
          const cmpt = col.children[j]
          const cmptWidth = cmpt.span / 24 * width - (i === 0 ? 16 : 24)
          let newCmpt = { title: cmpt.title, x: x, y: y, w: cmptWidth, h: cmpt.height, deskWidth: this.deskWidth }
          y = y + cmpt.height + 8
          if (cmpt.span !== 24) {
            x = x + cmptWidth
          }

          if (cmpt.title === '工作通知') {
            newCmpt.name = 'WorkNotices'
          } else if (cmpt.title === '待办事宜') {
            newCmpt.name = 'VardSwiper'
          } else if (cmpt.title === '常用功能') {
            newCmpt.name = 'MuchUsedMenu'
          } else if (cmpt.title === '任务中心') {
            newCmpt.name = 'TaskCenterCard'
          } else {
            cmpt.title = '财务状况'
            newCmpt.name = 'FinancialCondition'
          }
          this.desktopCmpts.push(newCmpt)
        }
      }
    }
  },
  created () {
    this.getUserRightList()
  },
  async mounted () {
    this.$nextTick(() => {
      const rect = this.$refs.deskCenter.getBoundingClientRect()
      this.deskWidth = rect.width
      // this.getUseSatusPlan()
    })
  }
}
</script>
<style lang="less">
.mydesktop-wrapper .plg-doc-wrapper-content{
  padding:0px;
  margin:0px;
}
</style>
