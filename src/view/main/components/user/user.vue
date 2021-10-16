<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      <!-- <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvator" />
      </Badge> -->
      <span class="user-name">
        <Icon :size="24"
              type="ios-contacts-outline" /> {{this.$store.state.user.userName}}
        <Icon class="fr"
              :size="18"
              type="md-arrow-dropdown"
              style="margin-top:12px;" />
      </span>
      <DropdownMenu slot="list">
        <header :style="headerStyle">
          <Avatar icon="ios-person"
                  size="large"
                  color="#fba529"
                  style="background:#fef9a9;"
                  @click.native="uModal" />{{this.$store.state.user.userName}}</header>
        <DropdownItem @click.native="pModal">
          <div class="item-icon">
            <Avatar size="large"
                    color="#fba529"
                    style="background:#fff9db;"
                    custom-icon="icon-Password" />
          </div>
          <Button type="text">修改密码</Button>
        </DropdownItem>
        <DropdownItem @click.native="handleThemeConfig">
          <div class="item-icon">
            <Avatar icon="ios-cube-outline"
                    size="large"
                    color="#32c08a"
                    style="background:#eefff4;" />
          </div>
          <Button type="text">切换主题</Button>
        </DropdownItem>
        <DropdownItem v-if="isShowSet"
                      @click.native="handleConfig">
          <div class="item-icon">
            <Avatar size="large"
                    color="#f85a5e"
                    style="background:#fee6e5;"
                    custom-icon="icon-Set" />
          </div>
          <Button type="text">应用设置</Button>
        </DropdownItem>
        <!-- <DropdownItem @click.native="handleAbout">
          <div class="item-icon">
            <Avatar size="large"
                    color="#099CFE"
                    style="background:#FFF0E8;"
                    custom-icon="icon-ABOUT" />
          </div>
          <Button type="text">关于</Button>
        </DropdownItem> -->
        <DropdownItem name="logout"
                      style="width:240px;">

          <Button type="primary"
                  style="width:200px;margin:15px 10px;padding:8px;">注销</Button>

        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <change-password :passwordModal="passwordModal"
                     @passModal="passModal"></change-password>
    <change-userinfo :userModal="userModal"
                     @userinfoModal="userinfoModal"></change-userinfo>

    <!-- 工作方案使用设置  -->
    <Modal v-model="modalWorkPlan"
           title="选择工作方案"
           @on-ok="setUseWorkPlan">
      <Form :model="formItem"
            :label-width="120">
        <FormItem label="选择工作台方案">
          <Select v-model="formItem.selectPlan"
                  :transfer='true'
                  @on-change="handleClickOption">
            <Option v-for="item in statusList"
                    :value="item.value"
                    :key="item.value">
              {{ item.label }}
            </Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>

    <!-- 同步弹框 -->
    <!--<Modal
      v-model="synchFlag"
      footer-hide
      :mask-closable=false
      :closable=false
      @on-ok="setUseWorkPlan"
    >
    </Modal>-->
  </div>
</template>

<script>
import './user.less'
import { mapMutations, mapActions } from 'vuex'
import { getSatusTable, getUseSatusPlan, saveUseSatusPlan, asyncData, getDBVersion } from '@/api/user'
// import ChangePassword from '@/view/login/components/change-password/change-password.vue'
// import ChangeUserinfo from '@/view/login/components/change-userinfo/change-userinfo.vue'
import tools from '@/libs/toolutil'
import headerBG from '@/assets/images/header-bg.png'
export default {
  name: 'User',
  components: {
    // ChangePassword,
    // ChangeUserinfo
  },
  data () {
    return {
      // 控制弹框显示/隐藏
      passwordModal: false,
      isThreeLoginOut: process.env.VUE_APP_CURRENTMODE === 'pt',
      /** *****  设置工作方案使用参数  *************/
      modalWorkPlan: false,
      formItem: {
        selectPlan: ''
      },
      statusList: [],
      url: '',
      // 修改个人信息弹框
      userModal: false,
      headerBG,
      synchFlag: false,
      isShowSet: false // 是否显示应用设置，默认不显示
    }
  },
  computed: {
    gsdm () {
      return this.$store.state.app.env.gsdm
    },
    /* 是否新增了方案，重新获取方案下拉选 */
    addWorkPlanId () {
      return this.$store.getters.addWorkPlanId
    },
    headerStyle () {
      return `background:url(${headerBG})`
    }
  },
  watch: {
    gsdm () {
      // this.getWorkPlanLists()
      // this.getUseSatusPlan()
    },
    /* 监控是否新增了工作方案下拉 */
    addWorkPlanId () {
      // this.getWorkPlanLists()
    }
  },
  inject: ['turnToPage'],
  methods: {
    ...mapMutations(['setLoginDate']),
    ...mapActions(['handleLogOut', 'updateEnv']),
    // 退出登录
    logout () {
      if (!this.isThreeLoginOut) {
        this.handleLogOut().then(() => {
          // window.location = '/login?rev=' + (new Date()).valueOf()
          this.$router.replace({
            name: 'login'
          })
          // window.location.load('/login')
        })
      }
    },
    message () {
      this.$router.push({
        name: 'message_page'
      })
    },
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.logout()
          break
        case 'message':
          this.message()
          break
      }
    },
    pModal () {
      this.passwordModal = true
    },
    uModal () {
      // 功能暂时屏蔽，等待修改
      // this.userModal = true
    },
    passModal (val) {
      this.passwordModal = val
    },
    userinfoModal (val) {
      this.userModal = val
    },
    /** *************工作方案********************/
    handleClickWorkPlan () {
      this.modalWorkPlan = true
    },
    handleConfig () {
      window.open(this.url + '/u8grp.htm')
    },
    // 关于按钮
    handleAbout () {
      this.$emit('on-switch', true)
    },
    handleCloseModal () {
      this.isAbout = false
    },
    handleAsyncData () {
      // this.synchFlag = true
      asyncData({
        gsdm: this.$store.state.app.env.gsdm,
        kjnd: this.$store.state.app.env.kjnd
      }).then(res => {
        this.synchFlag = false
        if (res && res.status === 200) {
          this.$fn.success({ title: '正确提示', desc: '同步成功' })
        } else {
          this.$fn.error({ title: '错误提示', desc: '同步失败' })
        }
      })
    },
    handleThemeConfig () {
      this.turnToPage({
        id: 'themeConfig',
        name: 'theme',
        title: '切换主题'
      })
    },
    /*
    * 切换方案下拉选回调
    */
    handleClickOption (option) {
      this.formItem.selectPlan = option
    },
    /*
    * 获取可以选择的方案下拉列表
    */
    getWorkPlanLists () {
      let parmas = {
        'gsdm': this.$store.state.app.env.gsdm,
        'kjnd': this.$store.state.app.env.kjnd,
        'zth': this.$store.state.app.env.zth
      }
      getSatusTable(parmas).then(
        res => {
          if (res.data) {
            let statusList = JSON.parse(JSON.stringify(res.data).replace(/schemeGuid/g, 'value'))
            this.statusList = statusList
            this.statusList.unshift({
              value: -1,
              label: '默认方案'
            })
          }
        }
      )
    },

    /*
    * 获取当前使用的方案
    */
    getUseSatusPlan () {
      let parmas = {
        'gsdm': this.$store.state.app.env.gsdm,
        'kjnd': this.$store.state.app.env.kjnd,
        'zth': this.$store.state.app.env.zth
      }
      getUseSatusPlan(parmas).then(
        res => {
          if (res.data) {
            this.formItem.selectPlan = res.data.schemeGuid
          }
        }
      )
    },
    /*
    * 设置使用工作方案保存
    */
    setUseWorkPlan () {
      let parmas = {
        'gsdm': this.$store.state.app.env.gsdm,
        'kjnd': this.$store.state.app.env.kjnd,
        'zth': this.$store.state.app.env.zth,
        'schemeGuid': this.formItem.selectPlan
      }
      saveUseSatusPlan(parmas).then(
        res => {
          if (res.status === 200) {
            this.$store.dispatch('updataWorkPlan', this.formItem.selectPlan)
            this.$fn.success({
              title: '正确提示',
              desc: res.msg
            })
          }
        }
      )
    },
    // 获取应用设置显示权限
    getdbversion () {
      this.$fn.ajax(getDBVersion, {}, res => {
        if (res && res.status === 200) {
          this.isShowSet = res.data === '1'
        }
      }, 0)
    }
  },
  mounted () {
    // this.getWorkPlanLists()
    // this.getUseSatusPlan()
    // this.getdbversion()
    // 应用注册获取u8Url的地址 /u8grp 跳转应用设置地址
    let u8grp = tools.getSession('CSPath').split('/')[2]
    if (u8grp) {
      this.url = u8grp.substr(0, 7).toLowerCase() === 'http://' ? u8grp : 'http://' + u8grp
    }
  }
}
</script>
