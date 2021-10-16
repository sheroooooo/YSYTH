<template>
  <Layout style="height: 100%"
          class="main"
          :class="getTheme()">
    <Header v-show="!$route.meta.hideHeader"
            id="mainHeader"
            :width="210"
            class="header-con u8-box">
      <!-- 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 -->
      <sider-trigger :collapsed="collapsed"
                     icon="md-menu"
                     @on-change="handleCollapsedChange"></sider-trigger>
      <div class="logo-con">
        <img :src="require('@/assets/images/csmp-logo2.png')"
             key="max-logo" />
      </div>
      <header-bar class="u8-bf1"
                  :collapsed="collapsed">
        <user :message-unread-count="unreadCount"
              :user-avator="userAvator"
              @on-switch="handelAbout"
              style="padding-left:16px;border-left:1px #ddd solid;" />
        <fullscreen v-model="isFullscreen"
                    style="padding:0 16px;border-left:1px #ddd solid;" />
      </header-bar>
    </Header>
    <Layout style="height: 100%">
      <Sider v-show="!$route.meta.fullscreen"
             id="leftMenuSider"
             ref="mainMenuSlider"
             hide-trigger
             collapsible
             :width="140"
             :collapsed-width="42"
             v-model="collapsed"
             class="left-sider"
             :style="{overflow: 'hidden'}">
        <vue-scroll>
          <div :style="{'height':contentHeight+'px'}">
            <side-menu accordion
                       ref="sideMenu"
                       :active-name="$route.name"
                       :collapsed="collapsed"
                       @on-select="turnToPage"
                       :modal-list="modalList">
            </side-menu>
          </div>
        </vue-scroll>
      </Sider>
      <Content ref="mainContent"
               class="main-content-con">
        <error-info></error-info>
        <div id="mainContent"
             style="position:relative">
          <Layout class="main-layout-con">
            <div v-show="!$route.meta.hideHeader"
                 class="tag-nav-wrapper">
              <tags-nav ref="tagsNav"
                        :value="getCurRoute()"
                        @input="handleClick"
                        :list="tagNavList"
                        @on-close="handleCloseTag"
                        @on-home-set="handleHomeSet(false)" />
            </div>
            <Content class="content-wrapper">

              <div id="wrapper"
                   style="overflow:auto;">
                <vue-scroll ref="vueScroll"
                            @handle-scroll="handleContentScroll"
                            @handle-resize="handleContentScroll">
                  <div class="wrapper"
                       :class="{'fullscreen':$route.meta.fullscreen}">
                    <keep-alive-view ref="keepView"></keep-alive-view>
                  </div>
                </vue-scroll>
              </div>

              <ABackTop :height="100"
                        :bottom="80"
                        :right="50"
                        container=".content-wrapper"></ABackTop>
            </Content>
          </Layout>
          <!-- 自定义工作台begin -->
          <!-- <Drawer v-model="showEditDrawer"
                  width="100%"
                  slot="drawer"
                  :inner="true"
                  :transfer="true"
                  :styles="{padding:'0px',height:'calc(100% - 47px)'}"
                  placement="left">
            <div slot="header">
              <b>自定义工作台编辑</b>
            </div>
            <mydesktop userType="0"
                       :is-drawer-show="showEditDrawer"></mydesktop>
          </Drawer> -->
          <!-- 自定义工作台end -->
        </div>
      </Content>
    </Layout>
    <!--    关于弹框       -->
    <vuc-draggable-resizable v-show="isAbout"
                             class="draggable-dialog"
                             style="border:none;z-index: 110;"
                             :x="x"
                             :y="y"
                             :w="width"
                             :h="height"
                             :min-width="900"
                             :min-height="608"
                             :parent="true"
                             drag-handle=".drag">
      <div class="about-modal"
           style="width:100%;height:100%;">
        <Icon class="about-modal-close"
              size="36"
              type="ios-close"
              @click="handleCloseAboutModal" />
        <about-modal v-if="isAbout"></about-modal>
      </div>
    </vuc-draggable-resizable>
  </Layout>
</template>
<script>
import KeepAliveView from './components/keep-alive-view'
import siderTrigger from './components/sider-trigger'
import SideMenu from './components/side-menu'
import HeaderBar from './components/header-bar'
import TagsNav from './components/tags-nav'
import User from './components/user'
import ABackTop from './components/a-back-top'
import Fullscreen from './components/fullscreen'
import ErrorInfo from './components/error-info'
import AboutModal from './components/about-modal'
import HomeSettings from './components/home-settings'
import Mydesktop from '@/view/mydesktop/mydesktop.vue'
import clonedeep from 'clonedeep'
import tools from '@/libs/toolutil'
import {
  mapMutations,
  mapActions,
  mapGetters
} from 'vuex'
import {
  getNewTagList,
  routeEqual,
  getToken
} from '@/libs/util'
import routers from '@/router/routers'
import logo from '@/assets/images/logo.svg'
import './main.less'
import { mainMenuList } from '@/router/mockData'
export default {
  name: 'Main',
  components: {
    KeepAliveView,
    siderTrigger,
    SideMenu,
    HeaderBar,
    TagsNav,
    Fullscreen,
    User,
    ABackTop,
    ErrorInfo,
    Mydesktop,
    AboutModal
  },
  data () {
    return {
      modalList: [],
      collapsed: false,
      isFullscreen: false,
      waitCheckExpire: false,
      lastMoveTime: Math.floor((new Date()).getTime() / 1000),
      lastTokeyTime: Math.floor((new Date()).getTime() / 1000),
      contentHeight: 400,
      scrollLocked: false,
      // 工作台
      showEditDrawer: false,
      planSelectWindow: null,
      width: 900,
      height: 608,
      x: (window.innerWidth - 900) / 2,
      y: (window.innerHeight - 608) / 2,
      isAbout: false
    }
  },
  provide () {
    return {
      closeTag: this.handleOutCloseTag,
      setTagTitle: this.setTagTitle,
      turnToPage: this.turnToPage,
      scroll: this.scroll, // this.handleContentScroll
      scrollTo: this.scrollTo,
      handleHomeSet: this.handleHomeSet,
      wrapHeight: this.getContainerHeight,
      wrapWidth: this.getContainerWidth
    }
  },
  computed: {
    tagNavList () {
      return this.$store.state.app.tagNavList
    },
    tagRouter () {
      return this.$store.state.app.tagRouter
    },
    userAvator () {
      return this.$store.state.user.avatorImgPath
    },
    cacheList () {
      const list = ['ParentView', ...this.tagNavList.length ? this.tagNavList.filter(item => !(item.meta && item.meta
        .notCache)).map(item => item.name) : []]
      return list
    },
    menuList () {
      return this.$store.getters.menuList
    },
    local () {
      return this.$store.state.app.local
    },
    hasReadErrorPage () {
      return this.$store.state.app.hasReadErrorPage
    },
    unreadCount () {
      return this.$store.state.user.unreadCount
    },
    gsdm () {
      return this.$store.state.app.env.gsdm
    },
    loginDate () {
      return this.$store.state.app.env.loginDate
    },
    // logoImg () {
    //   const logoSvg = this.$store.state.app.mainLogo
    //   if (!logoSvg || logoSvg === '') {
    //     return logo
    //   } else {
    //     return logoSvg
    //   }
    // },
    mainThemes () {
      return this.getTheme()
    }
  },
  watch: {
    '$route' (newRoute) {
      const {
        name,
        query,
        params,
        meta
      } = newRoute
      this.addTag({
        route: {
          name,
          query,
          params,
          meta
        },
        type: 'push'
      })
      this.setTagNavList(getNewTagList(this.tagNavList, newRoute))
      this.$refs.sideMenu.updateOpenName(newRoute.name)
    },
    collapsed () {
      setTimeout(() => {
        this.setMainContentHeight()
      }, 100)
    },
    mainThemes (newVal, oldVal) {
      $('body').attr('class', this.mainThemes)
    },
    // 工作台编辑后可以继续选择工作台
    showEditDrawer () {
      if (!this.showEditDrawer && this.planSelectWindow) {
        this.planSelectWindow.getWorkPlanLists(true)
      }
    },
    data: {
      handler (val) {
        console.log(val)
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations([
      'setTagNavList',
      'addTag',
      'setHomeRoute',
      'closeTag',
      'setScrollPos'
    ]),
    ...mapActions([
      'handleLogin',
      'handleGetModal',
      'handleGetContext',
      'getBillGroupEnv',
      'handleRefreshToken'
    ]),
    ...mapGetters([
      'env',
      'getTheme'
    ]),
    viewKey () {
      return this.$route.name + this.$route.params.id
    },
    setTagTitle (route, title) {
      if (this.$refs.tagsNav) {
        this.$refs.tagsNav.setTagTitle(route, title)
      }
    },
    turnToPage (menu) {
      const multTagNameList = ['GlZongzhang', 'GlMingxi', 'GlRjz', 'GlXsz', 'GlYuebiao', 'GlDlz', 'Voucher']
      let {
        name,
        params
      } = {}
      if (typeof menu === 'string') name = menu
      else {
        let route = JSON.parse(JSON.stringify(menu))
        name = route.name || route.webPath
        route.id = route.id || route.menuCode
        params = route
      }
      if (multTagNameList.length > 0 && multTagNameList.includes(name) && !params.opened) {
        params.id = params.id + '_' + Math.floor(Math.random() * 10000)
        params.opened = true
      }
      this.$router.push({
        name,
        params
      })
    },
    handleCollapsedChange (state) {
      this.collapsed = state
    },
    handleCloseTag (res, type, route) {
      this.tagNavList.filter(item => res.indexOf(item) === -1).map(item => this.$refs.keepView.closeKeepView(item))
      if (!type && routeEqual(this.$route, route)) { // 当关闭单个路由时
        return this.closeTag(route)
      } else if (type === 'all') { // 当关闭所有路由时
        this.turnToPage(this.$config.homeName)
      }
      this.setTagNavList(res)
    },
    // 该方法公外部使用, 省略了一些入参。同时防止只调用closeTag方法导致 缓存清除不掉
    handleOutCloseTag (route, type = '') {
      let res = this.tagNavList.filter(item => !routeEqual(route, item))
      this.handleCloseTag(res, type, route)
    },
    handleClick (item) {
      if (item.name === 'home') {
        this.turnToPage('home')
      } else {
        let menu = item
        if (item.params && tools.hasKey(item.params)) {
          menu = item.params
          menu.id = menu.id || item.id || ''
          menu.name = menu.name || item.name
          menu.title = menu.title || item.title
        }
        this.turnToPage(menu)
      }
    },
    // 工作台设置
    handleHomeSet (refresh) {
      const _this = this
      const params = {
        'gsdm': this.$store.state.app.env.gsdm,
        'kjnd': this.$store.state.app.env.kjnd,
        'zth': this.$store.state.app.env.zth
      }
      this.$modal({
        message: '',
        title: '选择工作台',
        resize: false,
        width: 600,
        height: 520,
        showFooter: false,
        escClosable: true,
        zIndex: 1,
        events: {
          show ({ $modal, $custom }, event) {
            $custom.getWorkPlanLists(refresh)
          }
        },
        slots: {
          default: ({ $modal, $custom }, h) => {
            return [
              h(HomeSettings, {
                props: {
                  params,
                  curId: _this.$store.state.app.workPlanId
                },
                on: {
                  onEdit (plan) {
                    _this.showEditDrawer = true
                    _this.planSelectWindow = $custom
                    // $modal.close()
                  },
                  onClear () {
                    _this.$store.dispatch('updataWorkPlan', '')
                  },
                  onSelect (id) {
                    // if (_this.$store.state.app.workPlanId !== id) {
                    _this.$store.dispatch('updataWorkPlan', '')
                    setTimeout(() => {
                      _this.$store.dispatch('updataWorkPlan', id)
                    }, 30)
                    // }
                    $modal.close()
                  },
                  close (relation) {
                    this.planSelectWindow = null
                    $modal.close()
                  }
                }
              })
            ]
          }
        }
      })
    },
    /****************************/
    setMainContentHeight () {
      const $wrapper = $('#wrapper')
      this.contentHeight = $(window).height() - 90
      let wrapperHeight = $(window).height()
      if (this.$route.meta.hideHeader !== true) {
        wrapperHeight = wrapperHeight - $('#mainHeader').outerHeight(true) - $('.tag-nav-wrapper').outerHeight(true)
      }

      const wrapperWidth = $(window).width() - $('#leftMenuSider').outerWidth(true)
      this.wrapperWidth = wrapperWidth - 48
      $wrapper.css({ 'height': wrapperHeight })
      $('#wrapper .wrapper').css({ 'width': wrapperWidth })
    },
    handleContentScroll (v, h) {
      this.setMainContentHeight()
      $('#wrapper .wrapper').css({ 'min-height': $('#wrapper').height() })
      const $cnt = $('#wrapper')

      const $wrap = $('#wrapper .wrap')
      const $header = $('#wrapper .page-header')
      const $footer = $('#wrapper .page-footer')
      // const sc = $cnt.scrollTop()
      // const cntHeight = $cnt.outerHeight(true)
      $header.css({ top: v ? v.scrollTop : 0 })
      $wrap.css({ 'padding-top': $header.length === 0 ? '0px' : '50px' })
      if ($footer.length > 0) {
        $wrap.css({ 'padding-bottom': '50px' })
        // $footer.css({ top: cntHeight - $footer.outerHeight(true), width: $cnt.width() - 16, right: 'auto' })
        $footer.css({ width: $cnt.width() - 48, left: $(window).width() - $cnt.width() + 24 })
      } else {
        $wrap.css({ 'padding-bottom': '0px' })
      }
      this.$store.commit('setScrollPos', { route: this.$route, pos: v ? v.scrollTop : 0 })
      if (!this.scrollLocked) {
        this.$refs.keepView.handleScroll(v ? v.scrollTop : 0)
      }
    },
    scroll () {
      let _this = this
      const timeId = setTimeout(() => {
        clearTimeout(timeId)
        _this.handleContentScroll()
      }, 30)
    },
    getContainerHeight () {
      return this.contentHeight
    },
    getContainerWidth () {
      return this.wrapperWidth
    },
    scrollTo (top) {
      this.scrollLocked = true
      this.$refs.vueScroll.scrollTo({ y: top > 0 ? top : 0 })
      let _this = this
      const timeId = setTimeout(() => {
        clearTimeout(timeId)
        _this.scrollLocked = false
      }, 30)
    },
    checkToken () {
      const _this = this
      const delay = this.$store.state.app.expireTime
      $(document).on('mousemove', function (evt) {
        if (!_this.waitCheckExpire) {
          _this.waitCheckExpire = true

          const snow = Math.floor((new Date()).getTime() / 1000)
          // console.log(delay, snow, _this.lastMoveTime, snow - _this.lastMoveTime)
          if (snow - _this.lastMoveTime > delay) {
            _this.lastMoveTime = snow
            // 重新登录
            tools.setSession('Authorization', '')
            window.location.href = '/login'
            // _this.turnToPage({ name: 'login', title: '登录' })
          } else {
            _this.lastMoveTime = snow
            // 更新token,10分钟更新一次
            const pastTime = _this.lastMoveTime - _this.lastTokeyTime
            // if ((delay - pastTime) < 300 || pastTime > 900) {
            if (900 < pastTime && pastTime < delay - 300) {
              _this.handleRefreshToken({ token: tools.getSession('Authorization') }).then(res => {
                _this.lastTokeyTime = snow
              })
            }
          }
          const timeId = setTimeout(() => {
            _this.waitCheckExpire = false
            clearTimeout(timeId)
          }, 300000)
        }
      })
    },
    getCurRoute () {
      let route = {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '工作台',
          notCache: true,
          icon: 'md-home'
        }
      }

      if (this.$route.name === 'home') return route
      const len = this.$store.state.app.tagNavList.length
      for (let i = 0; i < len; i++) {
        const item = this.$store.state.app.tagNavList[i]
        if (item.name !== 'home') {
          if (this.$route.name === item.name && this.$route.params.id === item.params.id) {
            route = clonedeep(item)
            route.params.tabCache = true
            break
          }
        }
      }
      return route
    },
    // 取模块
    getModal () {
      const fullscreen = sessionStorage.getItem('fullscreen')
      if (fullscreen === '1') {
        return false
      }
      let { gsdm, zth, kjnd, loginDate } = this.$store.state.app.env
      this.handleGetModal({ gsdm, zth, kjnd, 'loginDate': loginDate.replace(/-/g, '') }).then(data => {
        this.modalList = data
        tools.setLocal('modalMenu', JSON.stringify(this.modalList))
      })
      if (this.$store.state.user.isDev) {
        this.tmpSetList()
      }
    },
    tmpSetList () {
      this.modalList = mainMenuList
      tools.setLocal('modalMenu', JSON.stringify(this.modalList))
    },
    handelAbout (val) {
      this.isAbout = val
    },
    handleCloseAboutModal () {
      this.isAbout = false
    }
  },

  /** **************************周期 */
  created () {
    $('body').attr('class', this.mainThemes)
    this.$fn.setCache('idbtest', 'idbtest')
    this.modalList = tools.getLocal('modalMenu') ? JSON.parse(tools.getLocal('modalMenu')) : []
    if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
      this.collapsed = true
    }
    let env = this.$store.state.app.env
    let { gsdm, zth, kjnd, loginDate } = env
    this.handleGetModal({ gsdm, zth, kjnd, 'loginDate': loginDate.replace(/-/g, '') }).then(data => {
      this.modalList = data
      this.modalList.map(ele => !env[ele.modCode] && this.getBillGroupEnv(ele.modCode))
      tools.setLocal('modalMenu', JSON.stringify(this.modalList))
    })
    this.handleGetContext() // 获取部门
  },
  mounted () {
    let res = [{ name: this.$config.homeName, meta: { title: '工作台' } }]
    this.setTagNavList(res)
    this.setHomeRoute(routers)
    const fullscreen = sessionStorage.getItem('fullscreen')
    if (fullscreen === '1') {
      return false
    }
    this.$router.push({
      name: this.$config.homeName
    })
    // 前端先不检查超时
    this.checkToken()
    setTimeout(() => {
      const autoRoute = sessionStorage.getItem('autoRoute')
      const autoRouteTitle = sessionStorage.getItem('autoRouteTitle')
      if (autoRoute && fullscreen !== '1') {
        this.turnToPage({ name: autoRoute, title: autoRouteTitle })
        sessionStorage.removeItem('autoRoute')
        sessionStorage.removeItem('autoRouteTitle')
      }
    }, 10)
    this.getModal()
  },
  updated () {
    this.setMainContentHeight()
  }
}

</script>
