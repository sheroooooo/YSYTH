<template>
  <div :class="[`${prefixCls}`]">

    <template v-for="(item,index) in rightCmpts">
      <div v-if="showMode(item)"
           :key="`${_uid}_${index}`">

        <h3>
          {{item.title}}</h3>
        <draggable v-bind="{group:{ name:'component', pull:'clone',put:false},sort:false, ghostClass: 'ghost',handle: '.drag-item'}"
                   :list="item.children"
                   @end="handleMoveEnd"
                   @start="handleMoveStart">
          <template v-for="(cmpt,idx) in item.children">

            <div v-if="mydesktopRoot.userRightList.indexOf(cmpt.id)>=0"
                 :key="`${_uid}_${index}_${idx}`"
                 :class="[`${prefixCls}-item`,`drag-item`]"
                 @mousedown.stop="handlePrepearMove(cmpt)">
              {{cmpt.title}}
            </div>
          </template>
        </draggable>
      </div>
    </template>

  </div>
</template>

<script>
import draggable from 'vuedraggable'
import cmptList from '../../mixins/cmpt-list.js'
import ViewComponent from './view-component.vue'
export default {
  name: 'MydesktopDesignCmpts',
  inject: ['mydesktopRoot'],
  components: { draggable },
  props: {
    hideNoRight: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      prefixCls: 'mydesktop-design-cmpts',
      cmptList,
      tipInstance: null,
      dragCmpt: null,
      draging: false
    }
  },
  computed: {
    showMode (item) {
      return (item) => {
        if (this.hideNoRight) {
          return item.children.findIndex(cmpt => this.mydesktopRoot.userRightList.indexOf(cmpt.name) >= 0) >= 0
        }
        return true
      }
    },
    rightCmpts () {
      return this.cmptList
    }
  },
  methods: {
    handleShowTip (event, cmpt) {
      if (this.draging) {
        return false
      }
      const _this = this
      this.tipInstance = this.$vuctip.tip({
        target: event.target, // tip 的参考元素
        duration: 100,
        // arrowsSize: 0,
        container: document.querySelector('body'),
        // content: '提示显示内容',
        placements: ['right', 'left'],
        zIndex: 2001,
        width: 400,
        height: 300,
        customProps: {
          cmptName: cmpt.name
        },
        // 用于监听自定义组件的 emit 事件
        customListeners: {
          created () {
            // console.log('created')
          },
          handleOutsideClick () {
            _this.handleHideTip()
          }

        },
        customComponent: ViewComponent
      })
    },
    handleHideTip () {
      if (this.tipInstance) {
        this.tipInstance.hiddenTip()
      }
    },
    handlePrepearMove (cmpt) {
      this.dragCmpt = this.$utils.clone(cmpt, true)
      // this.tipInstance.hiddenTip(true)
    },
    /// //////////////////////
    handleMoveEnd (evt) {
      setTimeout(() => {
        this.draging = false
      }, 30)
      this.dragCmpt = null
      this.$emit('on-end', evt)
    },
    handleMoveStart ({ oldIndex }) {
      this.draging = true
      this.$emit('on-start', this.dragCmpt)
    }
  }
}
</script>

<style lang="less">
.mydesktop-design-cmpts {
  padding: 8px 4px;
  h3 {
    margin: 8px 0 0;
    font-size: 14px;
    .ivu-divider-vertical {
      width: 2px;
      margin: 0 8px 0 0;
      background: #2d8cf0;
    }
  }
  &-item {
    position: relative;
    padding: 4px;
    margin: 8px;
    border: 1px transparent solid;
    /*     border-radius: 3px;
    border: 1px #d1d1d1 solid;
    box-shadow: 0px 0px 5px #ddd;
    -webkit-box-shadow: 0px 0px 6px #ddd; */
    cursor: pointer;
    &:hover {
      border: 1px #d1d1d1 solid;
      box-shadow: 0px 0px 5px #ccc;
      -webkit-box-shadow: 0px 0px 6px #c1c1c1;
    }
  }
}
</style>
