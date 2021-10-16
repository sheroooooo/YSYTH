<template>
  <div class="side-modal-item">
    <MenuItem :name="parentItem.modCode">
      <Dropdown ref="dropdown"
                :transfer="true"
                :placement="parentIndex > 15 ? 'top-end' : 'right'"
                class="menu-box"
                @on-visible-change="onDropMenu">
        <div :id='`modal_${parentItem.modCode}`'
            :class="{'side-modal-title':true,'hide-title':hideTitle}"
            @click="handleMenuClick($event)"
            @mouseenter="handleMouseEnter($event)"
            @mouseover="handleMousemove($event, parentItem.title)">
          <Icon size=16
                :custom="`icon-${parentItem.modCode.indexOf('UDF')===-1?parentItem.modCode:'ZDY'}`"
                style="margin-top:4px;" />

          <span v-show="!hideTitle">{{parentItem.title}}
            <!-- <span v-if="parentItem.status && parentItem.status !== ''"
                  class="modal-demo-tag"
                  :class="demoClass">{{parentItem.status==='【演示版】'?'[演]':'[超]'}}</span> -->
            <span v-if="panelVisible"
                  class="modal-arrow"></span>
          </span>
        </div>
        <template v-if="!parentItem.modType || parentItem.modType.indexOf(',BS,') >= 0">
          <DropdownMenu :class="{'submenu':true,'hide-title':hideTitle}"
                        slot="list">
            <li v-show="hideTitle"
                class="submenu-title text-shadow">
              <span class="ivu-tag-dot-inner"></span>
              <span>{{ parentItem.title }}-{{parentItem.status}}</span>
            </li>
            <template v-for="child in menuList">
              <DropdownItem class="submenu-item u8-box"
                            :key="`drop-${child.title}`"
                            :name="child.title">
                <div class="submenu-item-title">
                  <span class="menu-title">{{ child.title }}
                    <span class="icon-next split-arrow" />
                  </span>
                </div>
                <div class="submenu-item-body u8-bf1"
                    v-if="child.children && child.children.length> 0">
                  <template v-for="(subchild,isub) in child.children">
                    <span class="menu-title submenu-item-a"
                          @click="handleClick($event,subchild)"
                          :key="`drop-${isub}`"
                          :name="subchild.title">
                      <span class="split-line"></span>{{subchild.title}}</span>
                  </template>
                </div>
              </DropdownItem>
            </template>
          </DropdownMenu>
        </template>
      </Dropdown>
    </MenuItem>
  </div>
</template>
<script>
import {
  mapActions,
  mapGetters
} from 'vuex'
import mixin from '@/libs/app-mixin'
import { getOtherInfo, getOtherWebpath } from '@/api/user'
import tools from '@/libs/toolutil'
import MenuBranchCheck from './menu-branch-check.js' // 各菜单进入页面前判断是否开启页面
import { detailMenuList } from '@/router/mockData'
export default {
  name: 'SideModalItem',
  data () {
    return {
      menuList: [],
      panelVisible: false
    }
  },
  props: {
    parentItem: {
      type: Object,
      default: () => { }
    },
    parentIndex: {
      type: Number,
      default: 0
    },
    hideTitle: { type: Boolean, default: false }

  },
  computed: {
    ...mapGetters([
      'env'
    ]),
    demoClass () {
      return ''
    }
  },
  methods: {
    ...mapActions([
      'handleGetModalMenu'
      // 'getBillGroupEnv'
    ]),
    onDropMenu (visible) {
      this.panelVisible = visible
      const _this = this
      const timeId = setTimeout(function () {
        if (!visible) {
          clearTimeout(timeId)
          $('.side-menu-wrapper').find('.active-menu').removeClass('active-menu')
        } else {
          $('#' + _this.parentItem.modCode).addClass('active-menu')
        }
        $('.submenu').parent().addClass('menu-box')
      }, 30)
      $('.submenu').parent().css({ 'max-height': '100%', 'max-width': '1000px' })
    },
    setSubMenuPos (event, name) {
      $('.side-menu-wrapper').find('.active-menu').removeClass('active-menu')
      $(event.target).addClass('active-menu')
      this.activeName = name
      // const { pageY } = event
      // const height = this.menuList.length * 38
      // const isOverflow = pageY + height < window.innerHeight
      // this.placement = isOverflow ? 'right-start' : 'right-end'
    },
    handleClick (event, subMenu) {
      let _this = this
      // 取上下文
      function getPathContext (url, callback) {
        getOtherInfo({ modCode: subMenu.modCode }).then(res => {
          let CRUXSESSIONID = ''
          if (res.msg && res.status === 200) {
            CRUXSESSIONID = res.msg
          } else {
            CRUXSESSIONID = ''
          }
          let info = url.indexOf('?') >= 0 ? '&info=' : '?info='
          url = url + info + CRUXSESSIONID
          callback(url)
        })
      }
      // 判断当前地址是否有 http:// 没有则添加，因为跳转新窗口不加http:// 会把新网址当成参数拼到就url地址后面
      let webpath = subMenu.webPath
      let url = webpath.substr(0, 7).toLowerCase() === 'http://' || webpath.substr(0, 8).toLowerCase() === 'https://' ? webpath : 'http://' + webpath
      // 集成IMIS用
      url = url.replace('localhost', window.document.location.host)
      this.activeName = ''
      if (subMenu.modType && subMenu.modType.indexOf(',BSO,') >= 0) {
        // window.open(url)
        getPathContext(url, (URL) => {
          window.open(URL)
        })
        return
      } else if (webpath.substr(0, 7).toLowerCase() === 'http://' || webpath.substr(0, 8).toLowerCase() === 'https://') {
        getPathContext(subMenu.webPath, (URL) => {
          subMenu.webPath = URL
          _this.$emit('on-click', subMenu)
        })
        /*         getOtherInfo({ modCode: subMenu.modCode }).then(res => {
                  let CRUXSESSIONID = ''
                  if (res.msg && res.status === 200) {
                    CRUXSESSIONID = res.msg
                  } else {
                    CRUXSESSIONID = ''
                  }
                  let info = subMenu.webPath.indexOf('?') >= 0 ? '&info=' : '?info='
                  subMenu.webPath = subMenu.webPath + info + CRUXSESSIONID
                  this.$emit('on-click', subMenu)
                }) */
        return
      }
      subMenu.demoDate = this.parentItem.status === '' ? '' : this.$store.getters.env.demoDate
      this.setMenuCheck(subMenu, webpath)
      // this.$emit('on-click', subMenu)
    },
    handleMouseEnter (event) {
      if (this.parentItem.status === '【超出授权】') {
        this.$fn.error({ title: '错误提示', desc: '超出授权无法显示' })
      }
      // 如果鼠标划入的时候,store里面不存在当前的账套参数对象。
      // if (!this.env[this.parentItem.modCode]) {
      //   this.getBillGroupEnv(this.parentItem.modCode)
      // }
    },
    handleMousemove (event, name) {
      const isOutRight = this.parentItem.status === '【超出授权】'
      if (isOutRight) {
        return false
      }
      if (this.parentItem.modType && this.parentItem.modType.indexOf(',CS,') >= 0) {
        return
      }
      const stMenu = this.$store.state.app.menuList[this.parentItem.modCode]
      if (!stMenu || stMenu.length === 0) {
        // 从缓存中取数据
        const localMenu = tools.getLocal('menu-' + this.parentItem.modCode)
        this.menuList = localMenu ? JSON.parse(localMenu) : []
        /// //////////////
        let { gsdm, kjnd, zth, loginDate } = this.$store.state.app.env
        this.handleGetModalMenu({ gsdm, kjnd, zth, modCode: this.parentItem.modCode, loginDate: loginDate.replace(/-/g, '') }).then(res => {
          this.menuList = res.data || []
          tools.setLocal('menu-' + this.parentItem.modCode, JSON.stringify(this.menuList))
          this.setSubMenuPos(event, name)
        })
        if (this.$store.state.user.isDev) {
          this.tmpSetList(this.parentItem.modCode)
        }
      } else {
        this.menuList = stMenu
        this.setSubMenuPos(event, name)
      }
    },
    tmpSetList (modCode) {
      this.menuList = detailMenuList[modCode]
    },

    handleMenuClick (event) {
      if (this.parentItem.modType && this.parentItem.modType.indexOf(',CS,') >= 0) {
        // tools.setSession('CSPath', 'http://10.16.21.64:8083/U8Login.jsp?productName=SYS&crc=343F07F6B1B0C23DC40D721BFD290E07&yonghu=10010128')
        const webpath = tools.getSession('CSPath')
        window.open(webpath)
      } else if (this.parentItem.modType === ',BSO,') {
        getOtherWebpath({ modCode: this.parentItem.modCode }).then(res => {
          let webpath = res.data
          let url = webpath.substr(0, 7).toLowerCase() === 'http://' || webpath.substr(0, 8).toLowerCase() === 'https://' ? webpath : 'http://' + webpath
          window.open(url)
        })
      }
    }
  },
  mixins: [mixin, MenuBranchCheck]
}
</script>
