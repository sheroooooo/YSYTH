<template>
  <vue-scroll ref="vueScroll"
              @handle-scroll="handleContentScroll"
              @handle-resize="handleContentScroll">
    <div :class="[`${prefixCls}`,editable&&!hideAuxBorder?`editable`:`hide-border`]"
         style="position: relative;overflow:auto;"
         :style="gridStyle">
      <template v-for="(cmpt,idx) in mydesktopRoot.desktopCmpts">
        <vuc-draggable-resizable :ref="`dr${idx}`"
                                 class="resizeable-cmpt"
                                 :key="`pnl${_uid}_${idx}`"
                                 :w="cmpt.w"
                                 :h="cmpt.h"
                                 :x="cmpt.x"
                                 :y="cmpt.y"
                                 :min-width="cmpt.minWidth"
                                 :min-height="cmpt.minHeight"
                                 :parent="true"
                                 :debug="false"
                                 :isConflictCheck="false"
                                 :snap="true"
                                 :snapTolerance="2"
                                 :draggable="canEdit"
                                 :resizable="canEdit"
                                 class-name-dragging="dragging-class"
                                 class-name-resizing="resizing-class"
                                 drag-handle=".drag"
                                 @refLineParams="getRefLineParams"
                                 @dragging="(x, y)=>handleDrag({cmpt,x,y})"
                                 @resizing="(x, y, width, height, handle)=>handleResize({cmpt,x, y, width, height, handle})"
                                 @resizestop="(x, y, width, height)=>handleResizeStop({cmpt,x, y, width, height})">

          <component ref="designCmpt"
                     :is="cmpt.name"
                     :bgColor="bgColor"
                     :bgftColor="bgftColor"
                     :bdColor="bdColor"
                     :header-title="cmpt.title"
                     :show-header="cmpt.showHeader"
                     :height="hideAuxBorder?cmpt.h:cmpt.h-2"
                     :width="hideAuxBorder?cmpt.w:cmpt.w-2"
                     :boxShadow="mydesktopRoot.boxShadow"
                     :show-border="mydesktopRoot.showBorder"></component>
          <div class="resizeable-cmpt-smark drag"
               @mousedown="handleMouseDown"></div>

          <span v-if="editable"
                class="cmpt-info">
            <p>
              左：
              <InputNumber :ref="`inputL${idx}`"
                           :min="0"
                           :step="1"
                           class="ivu-input-number-step"
                           style="display:inline-block;min-width:60px;width:60px;"
                           v-model="cmpt.tmpx"
                           @on-change="handleResizeStep(idx,cmpt)"
                           @on-focus="handleInputFocus"
                           :active-change="false"
                           size="small">
              </InputNumber>
              宽：
              <InputNumber :ref="`inputW${idx}`"
                           :min="1"
                           v-model="cmpt.tmpw"
                           class="ivu-input-number-step"
                           style="display:inline-block;min-width:60px;width:60px;"
                           @on-change="handleResizeStep(idx,cmpt)"
                           @on-focus="handleInputFocus"
                           :active-change="false"
                           size="small"></InputNumber>
              右：{{parseInt(cmpt.tmpx)+parseInt(cmpt.tmpw)}}
            </p>
            <p>
              上：
              <InputNumber :min="0"
                           v-model="cmpt.tmpy"
                           class="ivu-input-number-step"
                           style="display:inline-block;min-width:60px;width:60px;"
                           @on-change="handleResizeStep(idx,cmpt)"
                           @on-focus="handleInputFocus"
                           :active-change="false"
                           size="small"></InputNumber>
              高：
              <InputNumber :ref="`inputH${idx}`"
                           :min="1"
                           v-model="cmpt.tmph"
                           class="ivu-input-number-step"
                           style="display:inline-block;min-width:60px;width:60px;"
                           @on-change="handleResizeStep(idx,cmpt)"
                           @on-focus="handleInputFocus"
                           :active-change="false"
                           size="small"></InputNumber>
              下：{{parseInt(cmpt.tmpy)+parseInt(cmpt.tmph)}}
            </p>
            <p style="margin-top:10px;">
              <Checkbox v-model="cmpt.showHeader">显示标题栏</Checkbox>
              <span class="btn-remove fr"
                    @click.stop="handleRemove(idx)">删除</span>
            </p>
          </span>
        </vuc-draggable-resizable>
      </template>
      <!--辅助线Begin-->

      <span class="ref-line v-line"
            v-show="vResizeLine>0"
            :style="vResizeStyle" />

      <span class="ref-line h-line"
            v-show="hResizeLine>0"
            :style="hResizeStyle" />

      <template v-for="(item,idx) in vLine">
        <span class="ref-line v-line"
              v-show="item.display"
              :key="`vLine${_uid}_${idx}`"
              :style="{ left: item.position, top: item.origin, height: item.lineLength}" />
      </template>
      <template v-for="(item,idx) in hLine">
        <span class="ref-line h-line"
              v-show="item.display"
              :key="`hLine${_uid}_${idx}`"
              :style="{ top: item.position, left: item.origin, width: item.lineLength}" />
      </template>
      <!--辅助线END-->
    </div>
  </vue-scroll>
</template>

<script>
import cmpts from '../index.js'
export default {
  name: 'MydesktopDesign',
  components: { ...cmpts },
  inject: ['mydesktopRoot'],
  props: {
    showGrid: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    hideAuxBorder: {
      type: Boolean,
      default: false
    },
    cmptList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      prefixCls: 'mydesktop-design',
      // 显示网格

      vLine: [],
      hLine: [],
      // 拖动辅助线
      vResizeLine: 0,
      hResizeLine: 0,
      bgColor: '#fff',
      bgftColor: '#333',
      bdColor: '#d1d1d1',
      inputFocus: false
    }
  },
  computed: {
    guid () {
      return this.$utils.guid()
    },
    gridStyle () {
      return this.showGrid ? `background: linear-gradient(-90deg, rgba(120, 120, 120, 0.1) 1px, transparent 1px) 0% 0% / 10px 10px, linear-gradient(rgba(120, 120, 120, 0.1) 1px, transparent 1px) 0% 0% / 10px 10px;` : ''
    },
    vResizeStyle () {
      return `left: ${this.vResizeLine}px; top: 0; bottom:0`
    },
    hResizeStyle () {
      return `top: ${this.hResizeLine}px;left: 0; right:0`
    },
    canEdit () {
      return this.editable
    },
    resizeableStyle (cmpt) {
      return (cmpt) => {
        return `left:${cmpt.tmpx}px;top:${cmpt.tmpy}px;width:${cmpt.w}px;height:${cmpt.h}px;`
      }
    }
  },
  methods: {
    handleContentScroll (v, h) {
      this.$emit('on-scroll', { v, h })
    },
    // 辅助线回调事件
    getRefLineParams (params) {
      const { vLine, hLine } = params
      this.vLine = vLine
      this.hLine = hLine
    },
    handleDrag ({ cmpt, x, y }) {
      if (cmpt) {
        cmpt.x = x
        cmpt.y = y
        cmpt.tmpx = x
        cmpt.tmpy = y
      }
      // this.activatedPanel = Object.assign(this.activatedPanel, { x, y })
    },
    handleInputFocus (evnt) {
      this.inputFocus = true
    },
    handleResizeStep (idx, cmpt) {
      const ref = this.$refs['dr' + idx][0]
      const inputW = this.$refs[`inputW${idx}`][0]
      const inputL = this.$refs[`inputL${idx}`][0]
      cmpt.tmpx = parseInt(cmpt.tmpx || 0)
      cmpt.tmpy = parseInt(cmpt.tmpy || 0)
      cmpt.tmph = parseInt(cmpt.tmph || cmpt.minHeight)
      cmpt.tmpw = parseInt(cmpt.tmpw || cmpt.minWidth)
      if (cmpt.tmph < cmpt.minHeight) {
        cmpt.tmph = cmpt.minHeight
      }
      if (cmpt.tmpw < cmpt.minWidth) {
        cmpt.tmpw = cmpt.minWidth
      }
      if (cmpt.tmpw + cmpt.tmpx > cmpt.deskWidth) {
        cmpt.tmpw = cmpt.w
        cmpt.tmpx = cmpt.x
        inputW.setValue(cmpt.tmpw)
        inputL.setValue(cmpt.tmpx)
      }
      cmpt.x = cmpt.tmpx
      cmpt.y = cmpt.tmpy
      cmpt.h = cmpt.tmph
      cmpt.w = cmpt.tmpw
      //
      setTimeout(() => {
        this.inputFocus = false
        ref.handleUp()
      }, 5)
      // this.$set(this.mydesktopRoot.desktopCmpts, idx, cmpt)
    },
    handleResize ({ cmpt, x, y, width, height, handle }) {
      x = x || 0
      y = y || 0
      width = width || 100
      height = height || 100
      if (handle.includes('b')) {
        this.hResizeLine = y + height
      } else if (handle.includes('t')) {
        this.hResizeLine = y
      }

      if (handle.includes('r')) {
        this.vResizeLine = x + width
      } else if (handle.includes('l')) {
        this.vResizeLine = x
      }
      if (cmpt) {
        cmpt.x = x
        cmpt.y = y
        cmpt.w = width
        cmpt.h = height
        cmpt.tmpx = x
        cmpt.tmpy = y
        cmpt.tmpw = width
        cmpt.tmph = height
      }
    },
    handleResizeStop ({ cmpt, x, y, width, height }) {
      if (cmpt) {
        cmpt.x = x
        cmpt.y = y
        cmpt.w = width
        cmpt.h = height
        cmpt.tmpx = x
        cmpt.tmpy = y
        cmpt.tmpw = width
        cmpt.tmph = height
      }
      this.vResizeLine = 0
      this.hResizeLine = 0

      setTimeout(() => {
        const refs = this.$refs.designCmpt
        if (refs.length > 0) {
          refs.forEach((ref, idx) => {
            if (ref.$mounted) {
              ref.$mounted({ width, height })
            }
          })
        }
      }, 600)
    },
    handleRemove (idx) {
      this.mydesktopRoot.desktopCmpts.splice(idx, 1)
    },
    handleMouseDown (evnt) {
      if (this.inputFocus) {
        evnt.stopPropagation()
        this.inputFocus = false
      }
    }
    /// ///////////////////////////
  }
}
</script>
<style lang="less">
.mydesktop-design {
  height: 6000px;
  &.editable {
    .vuc-panel {
      border: 1px transparent solid !important;
    }
  }
  &.hide-border {
    .vdr {
      border: 1px transparent dashed;
    }
  }
  .dragging-class,
  .resizing-class {
    border: 1px red dashed;
  }
  .resizeable-cmpt {
    &-smark{
      position: absolute;
      left:1px;top:1px;right:1px;bottom:1px;z-index: 99;
    }
    .btn-remove {
/*       position: absolute;
      display: none;
      top: 50%;
      left: 50%;
      margin-left: -30px;
      margin-top: -10px; */
      width: 60px;
      padding: 2px 8px;
      text-align: center;
      border: 1px #f90 solid;
      color: #fff;
      border-radius: 3px;
      background: #f90;
      /* z-index: 100; */
      &:hover {
        background: linear-gradient(to left, #f90, #f5b657);
      }
    }
/*     &:hover {
      .btn-remove {
        display: inline-block;
      }
    } */
    .cmpt-info {
      display: inline-block;
      position: absolute;
      min-width:260px;
      bottom: 0px;
      right: 0px;
      padding: 4px 8px;
      background: #f3e98e;
      line-height: 1.5em;
      border-radius: 3px;
      z-index: 100;
      .ivu-input-wrapper{
        width:70px;
        margin-right:10px;
      }
      p{
        margin:4px 0;
      }
    }
  }
}
</style>
