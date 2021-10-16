<template>
  <div ref="docWrapper"
       :class="[`${prefixCls}`]">

    <div v-if="showHeader"
         :class="[`${prefixCls}-header`,showFilter?`${prefixCls}-header-noborder`:'']">
      <slot name="header"></slot>
      <section v-if="$slots.sufHeader"
               :class="[`${prefixCls}-header-suf`]">
        <slot name="sufHeader"></slot>
      </section>
    </div>
    <plg-doc-filter v-if="showFilter && showFilterGroup">
      <slot name="filterGroup"></slot>
    </plg-doc-filter>
    <vue-scroll :style="cntStyles"
                ref="docScroll"
                :class="[`${prefixCls}-content-wrapper`]">
      <div :class="[`${prefixCls}-content`]">
        <slot></slot>
      </div>
    </vue-scroll>

    <div v-if="showFooter"
         :class="[`${prefixCls}-footer`]">
      <slot name="footer"></slot>
      <section v-if="$slots.sufFooter"
               :class="[`${prefixCls}-footer-suf`]">
        <slot name="sufFooter"></slot>
      </section>
    </div>
    <!-- 抽屉 -->
    <slot name="drawer"></slot>
  </div>
</template>

<script>
import {
  mapActions
} from 'vuex'
import PlgDocFilter from './plg-doc-filter'
export default {
  name: 'PlgDocWrapper',
  components: { PlgDocFilter },
  props: {
    showFilterGroup: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      prefixCls: 'plg-doc-wrapper',
      height: 400,
      width: 800
    }
  },
  computed: {
    cntStyles () {
      return `height:${this.height}px;`
    },
    showHeader () {
      return this.$slots.header || this.$slots.sufHeader
    },
    showFilter () {
      return !!this.$slots.filterGroup && this.showFilterGroup
    },
    showFooter () {
      return this.$slots.footer || this.$slots.sufFooter
    }
  },
  watch: {
    height () {
      if (this.height > 100) {
        this.$emit('on-resize', { height: this.height, width: this.width - 16 })
      }
    }
  },
  methods: {
    ...mapActions([
      'handleGetSysParams'
    ]),
    setHeight () {
      this.$nextTick(() => {
        let docRect = this.$refs.docWrapper.getBoundingClientRect()
        let height = docRect.height
        this.width = docRect.width
        if (this.$slots.footer && this.showHeader) {
          height = height - 92
        } else if (this.$slots.footer || this.showHeader) {
          height = height - 46
        }
        this.height = height
      })
    },
    getHeight () {
      return this.height
    },
    getWidth () {
      return this.width
    }
  },
  created () {
    this.setHeight()
  },
  /* updated () {
    this.setHeight()
  }, */
  mounted () {
    this.setHeight()
  }
}
</script>

<style lang="less" scoped>
  @import './plg-doc-wrapper.less';
</style>
