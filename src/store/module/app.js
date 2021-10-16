import {
  setTagNavListInLocalstorage,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled
} from '@/libs/util'
import { getModal, getModalMenu, setEnvironment, getExternalEnv, getBillGroupEnv, getProductInfo } from '@/api/app'
import { getParameter } from '@/api/sa/sa-set-parameter'
import router from '@/router'
import config from '@/config'
import tools from '@/libs/toolutil'
const { homeName } = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  if (nextRoute && nextRoute.name !== 'home') {
    nextRoute.params.tabCache = true
  }
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: {},
    expireTime: tools.isNull(tools.getLocal('expireTime')) ? 3600 : tools.getLocal('expireTime'),
    env: {
      gsdm: tools.getLocal('gsdm'),
      gsmc: tools.getLocal('gsmc'),
      zth: tools.getLocal('zth'),
      ztmc: tools.getLocal('ztmc'),
      kjnd: tools.getLocal('kjnd'),
      loginDate: tools.getLocal('loginDate'),
      demoDate: tools.getLocal('demoDate')
    },
    /** ****portal */
    menuList: {},
    scrollPosList: {},
    /// 工作流
    workPlanId: '', // 切换工作方案id
    addWorkPlanId: '', // 新增的工作方案id
    // 主题
    theme: '',
    collapsed: false,
    // 产品信息
    productSeries: tools.getLocal('productSeries') || '',
    productName: tools.getLocal('productName') || '',
    loginLogo: tools.getLocal('loginLogo') || '',
    mainLogo: tools.getLocal('mainLogo') || '',
    version: tools.getLocal('version') || '',
    casSwitch: tools.getLocal('casSwitch') || '',
    // 错误列表
    errorList: [],
    // 存放系统参数，对应【系统管理-参数设置】中参数,分单位、账套、会计年度
    sysParams: {},
    pageSize: 50
  },
  getters: {
    /** ****portal */
    menuList: state => state.menuList,
    modalMenu: (state, modalId) => state.menuList[modalId],
    env: state => state.env,
    workPlanId: state => state.workPlanId,
    addWorkPlanId: state => state.addWorkPlanId,
    getTheme: state => {
      let theme = tools.getLocal('theme') || 'theme-default'
      return state.theme || theme
    },
    getSysParams: (state, getters) => ({ GSDM, ZTH, KJND }) => {
      return state.sysParams[`${GSDM}_${ZTH}_${KJND}`]
    }
  },
  mutations: {
    setProduct (state, { productSeries, productName, loginLogo, mainLogo, version, casSwitch, verificationCode }) {
      if (loginLogo) {
        loginLogo = 'data:image/png; base64,' + loginLogo
      }
      if (mainLogo) {
        mainLogo = 'data:image/png; base64,' + mainLogo
      }
      state.productSeries = productSeries
      state.productName = productName
      state.loginLogo = loginLogo
      state.mainLogo = mainLogo
      state.version = version
      state.casSwitch = casSwitch
      state.verificationCode = verificationCode
      tools.setLocal('productSeries', productSeries)
      tools.setLocal('productName', productName)
      tools.setLocal('loginLogo', loginLogo)
      tools.setLocal('mainLogo', mainLogo)
      tools.setLocal('version', version)
      tools.setLocal('casSwitch', casSwitch)
      tools.setLocal('verificationCode', verificationCode)
    },
    setCollapsed (state) {
      state.collapsed = !state.collapsed
    },
    /** ****portal */
    setMenuList (state, { modCode, menu }) {
      state.menuList[modCode] = menu
    },
    setHomeRoute (state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      closePage(state, route)
    },
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setGSInfo (state, { gsdm, gsmc }) {
      const gsdmTmp = gsdm || tools.getLocal('gsdm')
      const gsmcTmp = gsmc || tools.getLocal('gsmc')
      if (gsdmTmp !== '') {
        tools.setLocal('gsdm', gsdmTmp)
        tools.setLocal('gsmc', gsmcTmp)
      }
      state.env.gsdm = gsdmTmp
      state.env.gsmc = gsmcTmp
      // 切换单位时清一下菜单
      state.menuList = {}
    },
    setZTInfo (state, { zth, ztmc }) {
      const zthTmp = zth || tools.getLocal('zth')
      const ztmcTmp = ztmc || tools.getLocal('ztmc')
      tools.setLocal('zth', zthTmp)
      tools.setLocal('ztmc', ztmcTmp)
      state.env.zth = zthTmp
      state.env.ztmc = ztmcTmp
    },
    setLoginDate (state, loginDate) {
      loginDate = loginDate || tools.getLocal('loginDate')
      const kjnd = loginDate.substr(0, 4)
      tools.setLocal('kjnd', kjnd)
      tools.setLocal('loginDate', loginDate)
      state.env.kjnd = kjnd
      state.env.loginDate = loginDate
    },
    setDemoDate (state, demoDate) {
      state.env.demoDate = demoDate
      tools.setLocal('demoDate', demoDate)
    },
    setExpireTime (state, expireTime) {
      state.expireTime = expireTime
      tools.setLocal('expireTime', expireTime)
    },
    setScrollPos (state, { route, pos }) {
      const key = route.name + '-' + (route.params.id ? route.params.id : '')
      state.scrollPosList[key] = pos
      state.scrollPosList = JSON.parse(JSON.stringify(state.scrollPosList))
    },
    setEnvParams (state, { data, url, modalName }) {
      let modal = state.env[modalName] ? state.env[modalName] : {}
      state.env[modalName] = { ...modal, ...data }
    },
    /* 设置工作台方案 */
    setWorkPlan (state, workPlanId) {
      state.workPlanId = workPlanId
    },
    addWorkPlanId (state, workPlanId) {
      state.addWorkPlanId = workPlanId
    },
    setTheme (state, theme) {
      state.theme = theme
      tools.setLocal('theme', theme)
    },
    addError (state, errorInfo) {
      if (state.errorList.findIndex(item => item.id === errorInfo.id) === -1) {
        // 暂时屏蔽500报错
        state.errorList.push(errorInfo)
      }
    },
    // 软删除，方便后期查看
    removeError (state, errorInfo) {
      state.errorList = []
    },
    // 系统参数
    setSysParams (state, { GSDM, ZTH, KJND, params }) {
      state.sysParams[`${GSDM}_${ZTH}_${KJND}`] = params
    }
  },
  actions: {
    handleGetProductInfo ({ commit }) {
      return new Promise((resolve, reject) => {
        getProductInfo().then(res => {
          if (res.status === 200) {
            const { productSeries, productName, loginLogo, mainLogo, version, casSwitch, verificationCode } = res.data
            commit('setProduct', { productSeries, productName, loginLogo, mainLogo, version, casSwitch, verificationCode })
            resolve(res.data)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    /** ****portal */
    handleGetModal ({ commit }, { gsdm, kjnd, zth, loginDate }) {
      return new Promise((resolve, reject) => {
        getModal({ gsdm, kjnd, zth, loginDate, productType: ',XZ_G,' }).then(res => {
          if (res) {
            // res = tools.formatDataToTree(res, { id: 'menuId', text: 'menuName', pId: 'pId' })
            resolve(res.data)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    getBillGroupEnv ({ commit, state }, modalName) {
      // 开启全局账套参数模块。
      // const openBillEnvModal = ['GSP', 'OER', 'GBS', 'PMS', 'GLN']
      const openBillEnvModal = [
        // { modalName: 'GSP', url: '/gsp/setOfParams/getZtcs' },
        // { modalName: 'OER', url: '/oer/setOfParams/getZtcs' },
        // { modalName: 'GBS', url: '/gbs/setOfParams/getZtcs' },
        // { modalName: 'PMS', url: '/pms/setOfParams/getZtcs' },
        // { modalName: 'GLN', url: '/sa/unitSet/getUnitSetDetails' },
        // { modalName: 'BAS', url: '/sa/unitSet/getUnitSetDetails' },
        // { modalName: 'CNTC', url: '/cntc/parametersettings/getHTZtcs' },
        // { modalName: 'FAQC', url: '/fa/ztcs/getFaZtcsDetail' }
      ]
      let index = openBillEnvModal.findIndex(item => item.modalName === modalName)
      if (index === -1) return false
      return new Promise((resolve, reject) => {
        let params = {
          'gsdm': state.env.gsdm,
          'kjnd': state.env.kjnd,
          'zth': state.env.zth,
          'url': openBillEnvModal[index].url
        }
        if (['GLN', 'BAS'].includes(openBillEnvModal[index].modalName)) {
          params = {
            GSDM: state.env.gsdm,
            KJND: state.env.kjnd,
            ZTH: state.env.zth,
            modalName,
            'url': openBillEnvModal[index].url
          }
        }
        getBillGroupEnv(params).then(res => {
          if (res && res.data) {
            commit('setEnvParams', { data: res.data, url: openBillEnvModal[index].url, modalName: openBillEnvModal[index].modalName })
          }
        })
      })
    },
    handleGetModalMenu ({ commit }, { gsdm, kjnd, zth, modCode, loginDate }) {
      return new Promise((resolve, reject) => {
        getModalMenu({ gsdm, kjnd, zth, modCode, productType: ',XZ_G,', loginDate }).then(res => {
          if (res) {
            commit('setMenuList', { modCode, menu: res.data })
            resolve(res)
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    handleGetExternalEnv ({ commit }) {
      return new Promise((resolve, reject) => {
        getExternalEnv().then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    updateEnv ({ dispatch, commit }, { gsdm, gsmc, zth, ztmc, kjnd, expireTime, loginDate }) {
      commit('setLoginDate', loginDate)
      commit('setGSInfo', { gsdm, gsmc })
      commit('setZTInfo', { zth, ztmc })
      commit('setExpireTime', expireTime)
      if (loginDate) {
        setEnvironment(gsdm, zth, loginDate).then(res => {

        })
      }
      dispatch('handleGetSysParams', { GSDM: gsdm, ZTH: zth, KJND: kjnd })
    },
    /* 更新工作台方案名称 */
    updataWorkPlan ({ commit }, workPlanId) {
      commit('setWorkPlan', workPlanId)
    },
    addWorkPlanId ({ commit }, workPlanId) {
      commit('addWorkPlanId', workPlanId)
    },
    // 取系统参数并全局存储
    handleGetSysParams ({ commit }, { GSDM, KJND, ZTH }) {
      // return new Promise((resolve, reject) => {
      //   getParameter({ GSDM, KJND, ZTH }).then(res => {
      //     if (res) {
      //       commit('setSysParams', { GSDM, ZTH, KJND, params: res.data })
      //       resolve(res)
      //     }
      //   }).catch(err => {
      //     reject(err)
      //   })
      // })
    }
  }
}
