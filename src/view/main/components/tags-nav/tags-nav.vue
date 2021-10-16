<template>
  <div class="tags-nav no-select size">
    <div class="close-con">
      <Dropdown transfer
                @on-click="handleTagsOption">
        <span class="more">
          <Icon :size="18"
                type="md-more" />
        </span>
        <DropdownMenu slot="list">
          <DropdownItem name="close-all">关闭所有</DropdownItem>
          <DropdownItem name="close-others">关闭其他</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <ul v-show="visible"
        :style="{left: contextMenuLeft + 'px', top: contextMenuTop + 'px'}"
        class="contextmenu">
      <li v-for="(item, key) of menuList"
          @click="handleTagsOption(key)"
          :key="key">{{item}}</li>
    </ul>
    <div v-show="scVisible"
         class="scroll-tools">

      <span class="btn-con"
            @click="handleScroll(80)">
        <Icon :size="18"
              type="ios-arrow-back" />
      </span>

      <span class="btn-con"
            @click="handleScroll(-80)">
        <Icon :size="18"
              type="ios-arrow-forward" />
      </span>

    </div>
    <div class="scroll-outer"
         ref="scrollOuter"
         @DOMMouseScroll="handlescroll"
         @mousewheel="handlescroll">
      <div ref="scrollBody"
           class="scroll-body"
           :style="{left: tagBodyLeft + 'px'}">
        <transition-group name="taglist-moving-animation">
          <Tag type="dot"
               v-for="(item, index) in list"
               ref="tagsPageOpened"
               :key="`tag-nav-${index}`"
               :name="item.name"
               :data-route-item="item"
               @on-close="handleClose(item)"
               @click.native="handleClick(item)"
               :closable="item.name !== $config.homeName"
               :color="isCurrentTag(item) ? 'primary' : 'default'"
               @contextmenu.prevent.native="contextMenu(item, $event)">
            <span :ref="`tagTitle${item.name}`"
                  :key="`tagTitle${item.name}`">{{ showTitleInside(item) }}</span>
            <!-- <span class="home-settings"
                  v-if="item.name === $config.homeName">
              <Icon type="ios-settings-outline"
                    size="16"
                    @click="handleHomeSetClick" />
            </span> -->
          </Tag>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import { showTitle, routeEqual } from '@/libs/util'
import beforeClose from '@/router/before-close'
export default {
  name: 'TagsNav',
  props: {
    value: Object,
    list: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      tagBodyLeft: 0,
      rightOffset: 40,
      outerPadding: 4,
      contextMenuLeft: 0,
      contextMenuTop: 0,
      visible: false,
      scVisible: false,
      menuList: {
        others: '关闭其他',
        all: '关闭所有'
      }
    }
  },
  computed: {
    currentRouteObj () {
      const { name, params, query } = this.value
      return { name, params, query }
    },
    showTitleInside (item) {
      return (item) => {
        return showTitle(item, this)
      }
    }
  },
  methods: {
    handlescroll (e) {
      var type = e.type
      let delta = 0
      if (type === 'DOMMouseScroll' || type === 'mousewheel') {
        delta = (e.wheelDelta) ? e.wheelDelta : -(e.detail || 0) * 40
      }
      this.handleScroll(delta)
    },
    handleScroll (offset) {
      const outerWidth = this.$refs.scrollOuter.offsetWidth
      const bodyWidth = this.$refs.scrollBody.offsetWidth
      if (offset > 0) {
        this.tagBodyLeft = Math.min(0, this.tagBodyLeft + offset)
      } else {
        if (outerWidth < bodyWidth) {
          if (this.tagBodyLeft < -(bodyWidth - outerWidth)) {

          } else {
            this.tagBodyLeft = Math.max(this.tagBodyLeft + offset, outerWidth - bodyWidth)
          }
        } else {
          this.tagBodyLeft = 0
        }
      }
    },
    handleTagsOption (type) {
      if (type.includes('all')) {
        // 关闭所有，除了home
        let res = this.list.filter(item => item.name === this.$config.homeName)
        this.$emit('on-close', res, 'all')
      } else if (type.includes('others')) {
        // 关闭除当前页和home页的其他页
        let res = this.list.filter(item => routeEqual(this.currentRouteObj, item) || item.name === this.$config.homeName)
        this.$emit('on-close', res, 'others', this.currentRouteObj)
        setTimeout(() => {
          this.getTagElementByRoute(this.currentRouteObj)
        }, 100)
      }
    },
    handleClose (current) {
      if (current.meta && current.meta.beforeCloseName && current.meta.beforeCloseName in beforeClose) {
        new Promise(beforeClose[current.meta.beforeCloseName]).then(close => {
          if (close) {
            this.close(current)
          }
        })
      } else {
        this.close(current)
      }
    },
    close (route) {
      let res = this.list.filter(item => !routeEqual(route, item))
      this.$emit('on-close', res, undefined, route)
      this.handleScroll(-20)
      this.setScVisible()
    },
    handleHomeSetClick (evnt) {
      this.$emit('on-home-set', evnt)
    },
    setTagTitle (route, title) {
      const tag = this.$refs[`tagTitle${route.name}`]
      if (tag) {
        tag[0].innerHTML = title
        tag[0].innerText = title
      }
    },
    handleClick (item) {
      if (item.params) {
        item.params.tabCache = true
      }
      this.$emit('input', item)
    },

    isCurrentTag (item) {
      return routeEqual(this.currentRouteObj, item)
    },
    moveToView (tag) {
      const outerWidth = this.$refs.scrollOuter.offsetWidth
      const bodyWidth = this.$refs.scrollBody.offsetWidth
      if (bodyWidth < outerWidth) {
        this.tagBodyLeft = 0
      } else if (tag.offsetLeft < -this.tagBodyLeft) {
        // 标签在可视区域左侧
        this.tagBodyLeft = -tag.offsetLeft + this.outerPadding
      } else if (tag.offsetLeft > -this.tagBodyLeft && tag.offsetLeft + tag.offsetWidth < -this.tagBodyLeft + outerWidth) {
        // 标签在可视区域
        this.tagBodyLeft = Math.min(0, outerWidth - tag.offsetWidth - tag.offsetLeft - this.outerPadding)
      } else {
        // 标签在可视区域右侧
        this.tagBodyLeft = -(tag.offsetLeft - (outerWidth - this.outerPadding - tag.offsetWidth))
      }

      this.setScVisible()
    },
    setScVisible () {
      setTimeout(() => {
        const outerWidth = this.$refs.scrollOuter.offsetWidth
        const bodyWidth = this.$refs.scrollBody.offsetWidth
        this.scVisible = outerWidth - 4 < bodyWidth
        if (!this.scVisible) {
          this.tagBodyLeft = 0
        }
      }, 200)
    },
    getTagElementByRoute (route) {
      this.$nextTick(() => {
        this.refsTag = this.$refs.tagsPageOpened
        this.refsTag.forEach((item, index) => {
          if (routeEqual(route, item.$attrs['data-route-item'])) {
            let tag = this.refsTag[index].$el
            this.moveToView(tag)
          }
        })
      })
    },
    contextMenu (item, e) {
      if (item.name === this.$config.homeName) {
        return
      }
      this.visible = true
      const offsetLeft = this.$el.getBoundingClientRect().left
      this.contextMenuLeft = e.clientX - offsetLeft + 10
      this.contextMenuTop = e.clientY - 64
    },
    closeMenu () {
      this.visible = false
    }
  },
  watch: {
    '$route' (to) {
      this.getTagElementByRoute(to)
    },
    visible (value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.getTagElementByRoute(this.$route)
    }, 200)
  }
}
</script>

<style lang="less">
@import './tags-nav.less';
</style>
