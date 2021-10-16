<template>
  <div ref="deskCenter"
       :style="docStyle"
       :class="[`${prefixCls}`]"
       style="height:100%;width:100%;position:relative;">
    <Layout style="height:100%;">
      <Sider width="158">

        <Menu width=158
              :active-name="activeId">
          <div :class="[`${prefixCls}-header`]">工作台列表</div>
          <MenuItem v-for="(dsk,idx) in desktopList"
                    :name="`${dsk.schemeGuid}`"
                    :key="`${_uid}_${idx}`"
                    @click.native="handleSelect(dsk)"> {{dsk.title}}
          </MenuItem>
        </Menu>

        <!-- 业务组件选择begin -->
        <Drawer v-model="editable"
                :mask="false"
                width="100%"
                :closable="false"
                :inner="true"
                :transfer="false"
                :styles="{padding:'0px 0px 0px 0px',height:'100%',borderRight:'1px #d1d1d1 solid'}"
                :mask-closable="false"
                placement="left">
          <mydesktop-design-cmpts @on-start="handleAddStart"
                                  @on-end="handleAddEnd"></mydesktop-design-cmpts>
        </Drawer>
        <!-- 业务组件选择end -->
      </Sider>
      <Content style="position: relative;">
        <section :class="[`${prefixCls}-header`]">
          <Button size="small"
                  type="primary"
                  style="margin-right:8px;"
                  v-if="!editable"
                  @click="handleNewDesktop">新增</Button>
          <Button size="small"
                  style="margin-right:8px;"
                  v-if="!editable && activeId !==''"
                  @click="handleEditDesktop">修改</Button>
          <Button size="small"
                  style="margin-right:8px;"
                  v-if="!editable && activeId !==''"
                  @click="handleDelDesktop">删除</Button>
          <Button size="small"
                  type="primary"
                  style="margin-right:8px;"
                  v-if="editable"
                  @click="handleOkClick">保存</Button>
          <Button size="small"
                  style="margin-right:8px;"
                  v-if="editable"
                  @click="handleCancelClick">取消</Button>
          <span class="action">
            <Checkbox v-if="editable"
                      v-model="showGrid">显示网格</Checkbox>
            <Checkbox v-if="editable"
                      v-model="hideAuxBorder">隐藏辅助线</Checkbox>
            <Checkbox v-if="editable"
                      v-model="showBorder">业务组件显示边框</Checkbox>
            <Checkbox v-if="editable"
                      v-model="boxShadow">业务组件显示阴影</Checkbox>
            <span v-if="userType==='1'"
                  class="desktop-roles"
                  v-tip="desktopRolesName">
              <Avatar style="background-color: #87d068;margin-top:-27px;"
                      icon="ios-person"
                      size="small" />
              <span class="desktop-roles-text text-overflow"
                    @click="showRolesDrawer=editable?true:false">{{desktopRolesName}}</span>
            </span>
          </span>

        </section>

        <section :id="desktopId"
                 ref="desktopContent"
                 :class="[`${prefixCls}-content`]">
          <mydesktop-design ref="designer"
                            :show-grid="showGrid && editable"
                            :hide-aux-border="hideAuxBorder"
                            :editable="editable"
                            @on-scroll="handleScroll"></mydesktop-design>
          <!--面版拖动层begin-->
          <draggable v-if="showDragMask"
                     class="dragable-mask"
                     v-bind="{group:'component', ghostClass: 'ghost'}"
                     @add="handleAdd">

          </draggable>
          <!--面版拖动层end-->
        </section>

        <!-- 角色begin -->
        <Drawer v-model="showRolesDrawer"
                width="240"
                :closable="false"
                :inner="true"
                :transfer="false"
                :styles="{padding:'0px 0px 0px 0px',height:'100%',borderLeft:'1px #d1d1d1 solid'}"
                placement="right">
          <div :class="[`${prefixCls}-header`]">工作台角色
            <Checkbox v-model="onlyRight"
                      style="float:right;">只显示已分配角色</Checkbox>
          </div>
          <div :style="roleListStyle">
            <CheckboxGroup v-model="desktopRoles">
              <template v-for="(role,idx) in roles">
                <section v-if="!onlyRight || desktopRoles.indexOf(`${role.ID}`)>=0 "
                         :key="`${_uid}_${idx}`"
                         style="padding:2px 16px;">
                  <Checkbox :label="`${role.ID}`">
                    <span>{{role.NAME}}</span>
                  </Checkbox>
                </section>
              </template>
            </CheckboxGroup>
          </div>
        </Drawer>
        <!-- 角色end -->
      </Content>
    </Layout>

  </div>
</template>

<script>
import { NowPlan, savePlan, getPlanData, delPlan } from '@/api/sa/sa-work-desk-set'
// 个人可以修改自己所有样式
import { getRoleTree } from '@/api/sa/sa-ability'
import { getBusinessComponentPermission } from '@/api/mydesktop/mydesktop.js'
// 设计
import draggable from 'vuedraggable'
import MydesktopDesign from './components/config/mydesktop-design.vue'
import MydesktopDesignCmpts from './components/config/mydesktop-design-cmpts.vue'
import MydesktopEditor from './components/config/mydesktop-editor.vue'
export default {
  name: 'Mydesktop',
  provide () {
    return {
      mydesktopRoot: this
    }
  },
  components: { MydesktopDesign, MydesktopDesignCmpts, draggable },
  props: {
    /*     userType: {
          type: String,
          default: '1'
        }, */
    isDrawerShow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const desktopId = `desktop${this.$utils.guid()}`
    return {
      desktopId,
      prefixCls: 'desk-center',
      tableHeight: 400,
      showGrid: false,
      hideAuxBorder: false,
      boxShadow: false,
      showBorder: true,
      editable: false,
      editModel: 0,
      showDragMask: false,
      showRolesDrawer: false,
      onlyRight: false,
      // 要使用的业务组件
      dragingCmpt: null,
      // 当前工作台信息
      activeId: '',
      activeName: '',
      desktopList: [],
      desktopRoles: [],
      roles: [],
      userType: '1',
      // 已经选择的插件，根据色色变化
      desktopCmpts: [],
      tmpDesktopCmpts: [],
      // 记录设计时桌面宽用于显示时计算
      deskWidth: 800,
      // 用户授权的插件，根据角色变化
      userRightList: ['9601', '9602', '9603', '9604', 'VardSwiper', '9605', '9606'],
      scrollTop: 0
    }
  },
  computed: {
    docStyle () {
      return this.showBorder ? `` : `background:#f5f5f5;`
    },
    roleListStyle () {
      return `height:${this.tableHeight - 40}px;overflow:auto;`
    },
    desktopRolesName () {
      const desktopRoles = this.roles.filter(role => this.desktopRoles.indexOf(role.ID + '') >= 0)
      let names = []
      for (let i = 0, len = desktopRoles.length; i < len; i++) {
        const role = desktopRoles[i]
        names.push(role.NAME)
      }
      if (names.length > 0) {
        return names.join(',')
      }
      return '请选择角色'
    }
  },
  watch: {
    isDrawerShow () {
      if (this.isDrawerShow) {
        this.$mounted()
        this.getDesktopListOfuser()
        this.getUserRightList()
      }
    },
    desktopRoles () {
      // console.log(this.desktopRoles)
    }
  },
  methods: {
    handleScroll ({ v, h }) {
      this.scrollTop = v.scrollTop
    },
    handleSelect (dsk) {
      this.activeId = dsk.schemeGuid
      this.activeName = dsk.title
      setTimeout(() => {
        this.getPlanDataById()
      }, 300)
    },
    handleCancelClick () {
      this.editable = false
      this.editModel = 0
      this.desktopCmpts = this.$utils.clone(this.tmpDesktopCmpts, true)
    },
    handleOkClick () {
      this.handleSaveDesktop()
      /*       if (this.editModel === 1) {
              this.handleSaveDesktop()
            } else if (this.editModel === 2) {
              this.doSave()
            } */
    },
    handleNewDesktop () {
      this.editModel = 1
      this.editable = true
      this.activeId = ''
      this.activeName = ''
      this.tmpDesktopCmpts = this.$utils.clone(this.desktopCmpts, true)
      this.desktopCmpts = []
    },
    handleEditDesktop () {
      this.editModel = 2
      this.editable = true
      this.tmpDesktopCmpts = this.$utils.clone(this.desktopCmpts, true)
    },
    handleDelDesktop () {
      const { activeId } = this
      const _this = this
      this.$modal.confirm({
        message: `工作台方案删除后将无法恢复，你确认要删除当前工作台吗？`,
        zIndex: 1002,
        events: {
          confirm: function () {
            delPlan({ SCHEMEGUID: activeId }).then(res => {
              if (res.status === 200) {
                _this.$fn.success('工作台方案删除成功！')
                // 先清除工作台组件
                _this.desktopCmpts = []
                if (_this.userType === '1') {
                  _this.getDesktopList()
                } else {
                  _this.getDesktopListOfuser()
                }
              }
            })
          },
          cancel: function () {

          }
        }
      })
    },
    handleSaveDesktop () {
      /*       if (this.userType === '1' && this.desktopRoles.length === 0) {
              this.$fn.warning('请选择使用当前工作台的角色')
              this.showRolesDrawer = true
              return false
            } */
      const _this = this
      this.$modal({
        message: '',
        title: '保存工作台',
        resize: false,
        width: 380,
        height: _this.userType === '1' ? 450 : 180,
        showFooter: false,
        escClosable: true,
        zIndex: 9999,
        events: {
          show ({ $modal, $custom }, event) {
            $custom.show({ desktopName: _this.activeName, desktopRoles: _this.editModel === 1 ? [] : _this.desktopRoles })
          }
        },
        slots: {
          default: ({ $modal, $custom }, h) => {
            return [
              h(MydesktopEditor, {
                props: {
                  roles: _this.userType === '1' ? _this.roles : []
                },
                on: {
                  close () {
                    $modal.close()
                  },
                  ok (newName, desktopRoles) {
                    _this.activeName = newName
                    if (desktopRoles && desktopRoles.length > 0) {
                      _this.desktopRoles = desktopRoles
                    }
                    _this.doSave()
                    $modal.close()
                  }
                }

              })
            ]
          }
        }
      })
    },
    doSave () {
      const detFlag = { showBorder: this.showBorder, boxShadow: this.boxShadow, desktopCmpts: this.desktopCmpts }
      let parmas = {
        gsdm: this.$store.getters.env.gsdm,
        kjnd: this.$store.getters.env.kjnd,
        zth: this.$store.getters.env.zth,
        schemeGuid: this.activeId,
        schemeName: this.activeName,
        memo: this.activeName,
        userType: this.userType,
        czrName: this.$store.state.user.userName,
        isFrozen: 0,
        detFlag,
        roleid: this.desktopRoles

      }
      savePlan(parmas).then(
        res => {
          if (res.status === 200) {
            this.$fn.success('工作台保存成功！')

            this.activeId = res.data
            if (this.editModel === 1) {
              this.desktopList.push({ schemeGuid: this.activeId, title: this.activeName })
            }
            if (this.userType === '1') {
              this.getDesktopList()
            } else {
              this.getDesktopListOfuser()
            }
            this.editModel = 0
            this.editable = false
          }
        }
      )
    },
    /// ///////////
    handleAddStart (newCmpt) {
      this.dragingCmpt = this.$utils.clone(newCmpt, true)
      this.showDragMask = true
    },
    handleAddEnd () {
      this.showDragMask = false
    },
    handleAdd (evt) {
      let { x, y } = window.event
      const rect = this.$refs.desktopContent.getBoundingClientRect()
      x = x - rect.left - 40
      y = this.scrollTop + y - rect.top - 5
      const w = this.dragingCmpt.w
      const h = this.dragingCmpt.h
      // this.dragingCmpt = Object.assign(this.dragingCmpt, { x, y, w: this.dragingCmpt.w || 100, h: this.dragingCmpt.h || 100, offsetX: rect.left, offsetY: rect.top, deskWidth: rect.width })
      this.dragingCmpt = Object.assign(this.dragingCmpt, { x, y, w, h, deskWidth: rect.width })
      this.dragingCmpt.tmpx = this.dragingCmpt.x
      this.dragingCmpt.tmpy = this.dragingCmpt.y
      this.dragingCmpt.tmpw = this.dragingCmpt.w
      this.dragingCmpt.tmph = this.dragingCmpt.h
      this.desktopCmpts.push(this.dragingCmpt)
    },
    copyDesktop (selectedRoles) {
      // const row = this.$refs.xTable.getCurrentRow()
      // console.log(this.desktopCmpts, selectedRoles)
    },
    /// //////////
    updateDeskTop () {
      let elementResizeDetectorMaker = require('element-resize-detector')// 导入
      let _this = this
      // 创建实例带参
      let erd = elementResizeDetectorMaker({
        strategy: 'scroll', // <- For ultra performance.
        callOnAdd: false,
        debug: false
      })
      // 监听id为test的元素 大小变化
      erd.listenTo(document.getElementById(this.desktopId), function (element) {
        let width = element.offsetWidth
        _this.deskWidth = width
        // 重新调整组件位置与大小
        setTimeout(() => {
          _this.updateCmpts()
        }, 300)
      })
    },
    // 后台请求回结果后要执行此方法调整
    updateCmpts () {
      const len = this.desktopCmpts.length
      for (let i = 0; i < len; i++) {
        const cmpt = this.desktopCmpts[i]
        const rate = this.deskWidth / cmpt.deskWidth
        cmpt.w = Math.round(cmpt.w * rate)
        cmpt.h = Math.round(cmpt.h * rate)
        cmpt.x = Math.round(cmpt.x * rate)
        cmpt.y = Math.round(cmpt.y * rate)
        cmpt.deskWidth = this.deskWidth
        this.$set(this.desktopCmpts, i, cmpt)
      }
    },
    // 取个人所有方案
    getDesktopListOfuser () {
      const { gsdm, kjnd, zth } = this.$store.getters.env
      NowPlan({ gsdm, kjnd, zth, USERTYPE: this.userType }).then(
        res => {
          if (res.data) {
            this.activeId = ''
            this.activeName = ''
            this.desktopList = []
            for (let i = 0, len = res.data.length; i < len; i++) {
              const item = res.data[i]
              if (item.USERTYPE === '1') continue
              this.desktopList.push({ ...item, title: item.title })
              if (item.schemeGuid === this.$store.state.app.workPlanId) {
                this.activeId = item.schemeGuid
                this.activeName = item.label
              }
            }
            if (this.activeId !== '') {
              setTimeout(() => {
                this.getPlanDataById()
              }, 300)
            }
          }
        }
      )
    },
    // 取所有方案
    getDesktopList () {
      const { gsdm, kjnd, zth } = this.$store.getters.env
      NowPlan({ gsdm, kjnd, zth, USERTYPE: this.userType }).then(
        res => {
          this.desktopList = res.data.filter(item => !item.USERTYPE || item.USERTYPE === '1')
          // this.desktopList = res.data
          if (this.desktopList.length > 0) {
            // this.schemeGuid = this.desktopList[0].schemeGuid
            setTimeout(() => {
              this.activeId = `${this.desktopList[0].schemeGuid}`
              this.getPlanDataById()
            }, 300)
          }
        }
      )
    },
    getPlanDataById () {
      this.desktopCmpts = []
      const { gsdm, kjnd, zth } = this.$store.getters.env
      let parmas = {
        schemeGuid: this.activeId,
        gsdm,
        kjnd,
        zth
      }
      getPlanData(parmas).then(
        async res => {
          // 桌面配置信息使用对象方便扩展
          if (!res.data) {
            this.desktopCmpts = []
            this.$fn.warning('工作台方案设置错误！')
            return false
          }
          if (res.data.detFlag) {
            const detFlag = JSON.parse(res.data.detFlag)[0]
            // 原工作台转换
            if (detFlag.split) {
              await this.transOldDesktop(JSON.parse(res.data.detFlag))
            } else {
              this.showBorder = detFlag.showBorder
              this.boxShadow = detFlag.boxShadow
              this.desktopCmpts = detFlag.desktopCmpts || []
              setTimeout(() => {
                this.updateCmpts()
              }, 300)
            }
          }
          this.activeName = res.data.schemeName // 带出方案名称
          this.desktopRoles = [...res.data.roleid]
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
    },
    /*
    * 获取角色数据
    */
    getRole () {
      getRoleTree({}).then(
        res => {
          // console.log(res.data)
          this.roles = res.data
        }
      )
    },
    getUserRightList () {
      const { gsdm, zth, kjnd } = this.$store.state.app.env
      getBusinessComponentPermission({ GSDM: gsdm, ZTH: zth, KJND: kjnd }).then(res => {
        this.userRightList = res.data
      })
    },
    $mounted () {
      const roleId = this.$store.state.user.roleId
      // console.log(roleId, roleId.split(','), roleId.split(',').indexOf('0'))
      this.userType = roleId.split(',').indexOf('0') >= 0 ? '1' : '0'
      if (this.$attrs && this.$attrs.userType) {
        this.userType = this.$attrs.userType
      }
      // this.desktopCmpts = (await this.$idb.get('analyser', 'desktop')).desktopCmpts
      const rect = this.$refs.deskCenter.getBoundingClientRect()
      this.tableHeight = rect.height
      this.deskWidth = rect.width

      this.updateDeskTop()
      if (this.userType === '1') {
        this.getDesktopList()
        this.getRole()
      } else {
        this.getDesktopListOfuser()
      }
    }
  },
  created () {
    this.getUserRightList()
  },
  mounted () {
    this.$mounted()
  }
}
</script>
<style lang="less">
@import './mydesktop.less';
</style>
