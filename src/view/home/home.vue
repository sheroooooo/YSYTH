<!--
   *关闭菜单时候：
   左侧菜单：36
   内容区域左右边距：24*2
   内部内容内边距：12*2
   右侧内容：424
   左边距离：10
   合计：542

    *关闭打开时候：
   左侧菜单：180
   内容区域左右边距：24*2
   内部内容内边距：12*2
   右侧内容：424
   左边距离：10
   合计：686
-->

<template>
  <div class="wrap container-box">
    <!-- 默认方案 -->
    <template v-if="workFlowMessage[0].children.length === 0 && workFlowMessage[1].children.length === 0">
      <Layout style="height:100%;"
              class="layout-bac">
        <Content style="overflow:hidden;background:none;">
          <div style="height: 270px;">
            <Card :padding="0"
                  class="commonFunction">
              <p slot="title">常用功能</p>
              <a href="#"
                 slot="extra"
                 @click="openModal()">
                <Icon type="ios-settings-outline"></Icon>
              </a>
              <carousel-list :dataArr="commonData"
                             :style="{width:`${widthOld}px`}"
                             :number="number">
              </carousel-list>
            </Card>
          </div>
          <div style="height:calc(100% - (286px));margin-top:12px;">
            <Card :padding="0"
                  class="commonFunction">
              <p slot="title">{{statusValue}}经费执行情况表</p>
              <a href="#"
                 slot="extra"
                 class="card-setting">
                <Select v-model="statuTable"
                        style="width:80px"
                        @on-change="handleClickStatus">
                  <Option v-for="item in statusList"
                          :value="item.value"
                          :key="item.value">
                    {{ item.label }}
                  </Option>
                </Select>
              </a>
              <div id="main"
                   :style="{height:`${ZXheight}px`}"
                   style="width:700px"
                   ref="myEchart"></div>
            </Card>
          </div>
        </Content>
        <Sider hide-trigger
               width="424"
               style="margin-left:10px;"
               class="layout-bac">
          <Card class="cont_matter"
                :padding="0">
            <p slot="title">待办事项</p>
            <vard-swiper :swi-arr="swiArr"
                         :height="153"></vard-swiper>
          </Card>
          <Card class="cont_matter"
                style="height:calc(100% - (223px));margin-top:12px;overflow: auto"
                :padding="0">
            <p slot="title">通知发文</p>

            <lazy-load style="height:calc(100% - (52px))"
                       :lazyloadData="notice"></lazy-load>
          </Card>
        </Sider>
      </Layout>
    </template>
    <template v-else>
      <div class="content-row"
           :style="{width:`${widthScale}%`}">
        <Row>
          <!-- 方案设置的左侧 -->
          <template v-if="workFlowMessage[0].children.length>0">
            <Col :key="`${_uid}_${index}`"
                 v-for="(item,index) in workFlowMessage[0].children"
                 :span="item.span">
            <!--待办事项-->
            <template v-if="item.type==='dbsy'">
              <Card class="cont_matter"
                    :padding="0">
                <p slot="title">{{item.title}}</p>
                <vard-swiper :height="item.height"></vard-swiper>
              </Card>
            </template>
            <!--通知发文-->
            <template v-if="item.type==='8'">
              <Card class="cont_matter cont_notice"
                    :padding="0">
                <p slot="title">{{item.title}}</p>
                <lazy-load :height="item.height*1"
                           :lazyloadData="notice"></lazy-load>
              </Card>
            </template>
            <!--执行情况表-->
            <template v-if="item.type==='bmzxqkb'">
              <Card :padding="0"
                    class="cont_matter">
                <p slot="title">{{statusValue}}{{item.title}}</p>
                <a href="#"
                   slot="extra"
                   class="card-setting">
                  <Select v-model="statuTable"
                          style="width:80px"
                          @on-change="handleClickStatus">
                    <Option v-for="item in statusList"
                            :value="item.value"
                            :key="item.value">
                      {{ item.label }}
                    </Option>
                  </Select>
                </a>
                <div id="main"
                     style="width:100%"
                     :style="{height:`${item.height}px`}"
                     ref="myEchart"></div>
              </Card>
            </template>
            <!--常用功能-->
            <template v-if="item.type==='cygn'">
              <Card :padding="0"
                    class="cont_matter">
                <!-- class="cont_matter common"> -->
                <p slot="title">{{item.title}}</p>
                <a href="#"
                   slot="extra"
                   @click="openModal()">
                  <Icon type="ios-settings-outline"></Icon>
                </a>
                <carousel-list :dataArr="commonData"
                               :number="number"
                               :width="width"
                               :height="item.height">
                </carousel-list>
              </Card>
            </template>
            </Col>
          </template>
        </Row>
      </div>
      <div class="content-row"
           :style="{width:`${100-widthScale}%`}">
        <Row>
          <!-- 方案设置右侧 -->
          <template v-if="workFlowMessage[1].children.length>0">
            <Col :key="`${_uid}_${index}`"
                 v-for="(item,index) in workFlowMessage[1].children"
                 :span="item.span">
            <!--待办事项-->
            <template v-if="item.type==='dbsy'">
              <Card class="cont_matter"
                    :padding="0">
                <p slot="title">{{item.title}}</p>
                <vard-swiper :height="item.height"></vard-swiper>
              </Card>
            </template>
            <!--通知发文-->
            <template v-if="item.type==='8'">
              <Card class="cont_matter cont_notice"
                    :padding="0">
                <p slot="title">{{item.title}}</p>
                <template v-if="notice.length != 0">
                  <lazy-load :height="item.height"
                             :lazyloadData="notice"></lazy-load>
                </template>
              </Card>
            </template>
            <!--执行情况表-->
            <template v-if="item.type==='bmzxqkb'">
              <Card :padding="0"
                    class="cont_matter">
                <p slot="title">{{statusValue}}{{item.title}}</p>
                <a href="#"
                   slot="extra"
                   class="card-setting">

                  <Select v-model="statuTable"
                          style="width:80px"
                          @on-change="handleClickStatus">
                    <Option v-for="item in statusList"
                            :value="item.value"
                            :key="item.value">
                      {{ item.label }}
                    </Option>
                  </Select>
                </a>
                <div id="main"
                     style="width:100%"
                     :style="{height:`${item.height}px`}"
                     ref="myEchart"></div>
              </Card>
            </template>
            <!--常用功能-->
            <template v-if="item.type==='cygn'">
              <Card :padding="0"
                    class="cont_matter commonFunction">
                <!-- class="cont_matter commonFunction common"> -->
                <p slot="title">{{item.title}}</p>
                <a href="#"
                   slot="extra"
                   @click="openModal()">
                  <Icon type="ios-settings-outline"></Icon>
                </a>
                <carousel-list :dataArr="commonData"
                               :width="width"
                               :number="number"
                               :height="item.height*1">
                </carousel-list>
              </Card>
            </template>
            </Col>
          </template>
        </Row>
      </div>
    </template>

    <!--常用功能模态框-->
    <Modal :title="modalSettings.title"
           v-model="isShowModel"
           :width="modalSettings.width"
           class-name="vertical-center-modal"
           @on-ok="handleSavaClick()">
      <div class="modal-center">
        <Col span="18"
             class="left-tree">
        <Tree :data="commonList"
              show-checkbox
              ref="tree">
        </Tree>
        </Col>
        <Col span="5"
             class="right-radio">
        <div class="innerright">
          <RadioGroup vertical
                      v-model="radiodGroup"
                      @on-change="filterCommon(...arguments)">
            <Radio label="check">
              <span>已选功能</span>
            </Radio>
            <Radio label="all">
              <span>所有功能</span>
            </Radio>
          </RadioGroup>
        </div>
        </Col>
        <div class="clear"></div>
      </div>
    </Modal>
  </div>
</template>
<script>
import carouselList from './components/carousel-list'
import vardSwiper from './components/vard-swiper'
import lazyLoad from './components/lazy-load'
import { getCommonFunctions, getMenu, saveCommon, getSatusTable, getPtInfoList } from '@/api/home/home'
import { getUseSatusPlan } from '@/api/user'
import clonedeep from 'clonedeep'
import tools from '@/libs/toolutil'
import mixin from '@/libs/app-mixin'

export default {
  name: 'home',
  components: { carouselList, vardSwiper, lazyLoad },
  data () {
    return {
      width: '',
      widthOld: window.innerWidth - 686,
      // 公司代码
      gsdm: this.$store.getters.env.gsdm,
      // 会计年度
      kjnd: this.$store.getters.env.kjnd,
      // 业务日期
      ywrq: this.$store.getters.env.loginDate.replace(/-/g, ''),
      // 账套号
      zth: this.$store.getters.env.zth,
      swiArr: [],
      /* 常用功能数据 */
      isShowModel: false, // 是否显示模态框
      modalSettings: {
        title: '设置常用功能',
        width: '584'
      },
      radiodGroup: '',
      commonList: [], // 常用功能列表
      menuList: [], // 全部菜单项
      commonData: [], // 首页常用功能列表数据
      copyCommonList: [], // 勾选了常用功能，没保存
      loadMenu: false,
      // charts
      chart: null,
      statusList: [
        {
          value: 'bm',
          label: '部门'
        },
        {
          value: 'xm',
          label: '项目'
        }
      ],
      statuTable: 'bm',
      // 工作台方案
      workFlowMessage: [
        {
          'split': 0.5,
          children: []
        },
        {
          'split': 0.5,
          children: []
        }
      ],
      /* 通知管理 */
      lazyloadData: [],
      notice: [],
      ZXheight: 200
    }
  },
  computed: {
    /* 合并展开菜单 常用功能自适应宽度 */
    getCollapsed () {
      return this.$store.state.app.collapsed
    },
    number () {
      return Math.ceil(this.commonData.length / 6)
    },
    getGsdmZTH () {
      let obj = {
        'gsdm': this.$store.getters.env.gsdm,
        'zth': this.$store.getters.env.zth
      }
      return obj
    },
    /* 获取工作方案使用id */
    workPlanId () {
      return this.$store.getters.workPlanId
    },
    /* 宽度比例 */
    widthScale () {
      return this.workFlowMessage[0].split * 100
    },
    statusValue () {
      return this.statuTable === 'bm' ? '部门' : '项目'
    }
  },
  inject: ['wrapHeight', 'turnToPage'],
  watch: {
    getCollapsed (val) {
      if (val) { // 打开菜单
        this.width = window.innerWidth - 542
      } else {
        this.width = window.innerWidth - 686
      }
    },
    getGsdmZTH: {
      handler (newData) {
        this.gsdm = newData.gsdm
        this.zth = newData.zth
        this.getCommonCycle()
      },
      deep: true
    },
    workPlanId () {
      // this.getUseSatusPlan()
    },
    /* 工作通知 */
    lazyloadData: {
      handler (newData) {
        this.notice = clonedeep(this.lazyloadData)
      },
      deep: true
    }

  },
  methods: {
    /* 页面初始化 */
    vueEnter (cache) {
      if (Number(tools.getLocal('isInitialization')) <= 0) {
        this.turnToPage({
          name: 'sa-set-parameter',
          title: '参数设置',
          gnflDm: '0002',
          id: '0002',
          gnflMc: '参数设置'
        })
      }

      this.ZXheight = this.wrapHeight() - 286 - 80
      if (!cache) {
        this.scroll()
        /* 常用功能轮播 */
        this.getCommonCycle()
        this.setSatusTable()
        // this.getUseSatusPlan()
        /* 通知管理 */
        this.getLazyLoad()
      }
    },

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
        res => {
          if (res) {
            if (res.data) {
              this.workFlowMessage = JSON.parse(res.data.detFlag)
            } else {
              this.workFlowMessage = [
                {
                  'split': 0.5,
                  children: []
                },
                {
                  'split': 0.5,
                  children: []
                }
              ]
            }
          }

          // this.$store.dispatch('updataWorkPlan', res.data.schemeGuid)
        }
      )
    },

    /* 常用功能轮播 */
    getCommonCycle () {
      let params = {
        'gsdm': this.gsdm,
        'kjnd': this.$store.getters.env.kjnd,
        'ywrq': this.$store.getters.env.loginDate.replace(/-/g, ''),
        'zth': this.zth,
        'productType': ',XZ_G,'
      }
      getCommonFunctions(params).then(
        res => {
          res.data.forEach(function (value, i) {
            value.title = value.gnmc
            value.checked = true
          })
          this.commonData = res.data
        }
      )
    },

    /* 左侧常用功能，菜单源数据获取 */
    getMenuData () {
      let params = {
        'gsdm': this.gsdm,
        'kjnd': this.$store.getters.env.kjnd,
        'ywrq': this.$store.getters.env.loginDate.replace(/-/g, ''),
        'zth': this.zth,
        'productType': ',XZ_G,'
      }
      getMenu(params).then(
        res => {
          res.data.forEach(v => {
            v.expand = true
          })
          this.menuList = res.data

          this.commonList = this.checkData(this.commonData)
          this.copyCommonList = clonedeep(this.commonList)
          this.radiodGroup = 'all'
        }
      )
    },

    /* 点击设置，出现常用功能弹框 */
    openModal () {
      this.isShowModel = !this.isShowModel // 显示常用功能模态框
      this.getMenuData() // 常用功能轮播加载出来后，加载全菜单
    },

    /* 循环常用功能，左侧菜单勾选  commonData：入参为需要勾选的数据，参照 */
    checkData (commonData) {
      let menu = clonedeep(this.menuList)
      let _this = this
      commonData.forEach(function (value, i) {
        menu.forEach(function (item, j) {
          if (item.children) {
            _this.addCheck(item, value.menuCode)
          }
        })
      })
      return menu
    },

    /* 添加勾选 */
    addCheck (obj, menuCode) {
      let _this = this
      if (obj.children) {
        obj.children.forEach(function (val, h) {
          _this.addCheck(val, menuCode)
        })
      } else {
        if (menuCode === obj.menuCode) {
          obj.checked = true
        }
      }
      return obj
    },

    /* 保存常用功能 */
    handleSavaClick () {
      let checkedData = this.$refs.tree.getCheckedNodes()
      let params = {}
      params.gnList = []
      checkedData.forEach(function (value, i) {
        if (value.isFuncMenu === 1) {
          let obj = {}
          obj.gnbm = value.gnflDm
          obj.gnmc = value.gnflMc
          obj.menuCode = value.menuCode
          params.gnList.push(obj)
        }
      })
      params.gsdm = this.gsdm
      params.kjnd = this.kjnd
      params.zth = this.zth

      saveCommon(params).then(
        res => {
          this.getCommonCycle()
        }
      )
    },

    /* 按钮筛选 */
    filterCommon (val) {
      this.filterButton = val
      if (val === 'check') {
        this.commonList = this.$refs.tree.getCheckedNodes().filter(item => item.isFuncMenu === 1)
        this.copyCommonList = clonedeep(this.commonList)
      } else if (val === 'all') {
        this.commonList = this.checkData(this.copyCommonList)
      }
    },

    /* 切换执行情况表 */
    handleClickStatus (val) {
      this.statuTable = val
      this.setSatusTable()
    },
    /* 执行情况表初始化 */
    setSatusTable () {
      let params = {
        'gsdm': this.gsdm,
        'kjnd': this.$store.getters.env.kjnd,
        'type': this.statuTable
      }
      getSatusTable(params).then(
        res => {
          this.$chart.bar('main', res.data)
        }
      )
    },

    /*
    * 获取通知管理
    */
    getLazyLoad () {
      let parmas = {
        ywrq: this.$store.state.app.env.loginDate.split('-').join(''),
        gzt: 1, // 后台判断用
        itypeId: 8
      }
      getPtInfoList(parmas).then(
        res => {
          this.lazyloadData = res.data
          // this.lazyloadData = clonedeep(this.lazyloadData)
        }
      )
    }

  },
  updated () {
    this.$nextTick(() => {
      this.width = $('.common').width()
    })
  },
  mixins: [mixin]
}
</script>
<style scoped lang="less">
  @import './home.less';
</style>
