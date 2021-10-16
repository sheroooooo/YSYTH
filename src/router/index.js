import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import { getToken, setToken } from '@/libs/util'
import config from '@/config'
const { homeName } = config

Vue.use(Router)
const router = new Router({
  routes,
  mode: 'history'
})
const LOGIN_PAGE_NAME = 'login'
// 根据名称找路由
function getRouteByName (routeList, routeName) {
  let findRoute
  const size = routeList.length
  for (let idx = 0; idx < size; idx++) {
    const route = routeList[idx]
    if (route.name === routeName) {
      findRoute = route
      break
    }
    if (route.children && route.children.length > 0) {
      findRoute = getRouteByName(route.children, routeName)
      if (findRoute) {
        break
      }
    }
  }
  return findRoute
}
// 登录后自动打开页签
router.beforeEach((to, from, next) => {
  if (to.query['Authorization']) {
    setToken(to.query['Authorization'])
    // 外部系统没有业务日期，取系统日期
    let loginDate = (new Date()).Format('yyyy-MM-dd')
    store.commit('setLoginDate', loginDate)
    //
    const autoRoute = to.query['route'] || ''
    const autoRouteTitle = to.query['routeTitle'] || ''
    const fullscreen = to.query['fullscreen'] || ''
    sessionStorage.setItem('autoRoute', autoRoute)
    sessionStorage.setItem('autoRouteTitle', autoRouteTitle)
    sessionStorage.setItem('fullscreen', fullscreen)
    /// /////
    let turntoRoute = getRouteByName(routes, autoRoute)
    if (fullscreen === '1') {
      turntoRoute.meta.fullscreen = true
      turntoRoute.meta.hideHeader = true
      next(turntoRoute)
      return false
    }

    /// /////
    next({ name: 'home' })
  } else if (to.hash === '#external') {
    setToken('external')
    next({ name: 'home' })
  } else if (to.meta.notWatch) { // 守护
    next()
  } else {
    // matched
    const token = getToken()
    if (to.name.substring(0, 4).toLowerCase() === 'http') {
      // window.open(to.name)
      next({ name: 'thdapp', params: { id: to.params.id, title: to.params.title, src: to.params.webPath } })
      return false
    }
    if (!token && to.name !== LOGIN_PAGE_NAME) {
      if (to.name === 'error_404') {
        next({ replace: true, name: 'login' })
      } else {
        // 未登录且要跳转的页面不是登录页
        next({
          replace: true,
          name: LOGIN_PAGE_NAME // 跳转到登录页
        })
      }
    } else if (!token && to.name === LOGIN_PAGE_NAME) {
      // 未登陆且要跳转的页面是登录页
      next() // 跳转
    } else if (token && to.name === LOGIN_PAGE_NAME) {
      // 已登录且要跳转的页面是登录页
      next({
        name: homeName // 跳转到homeName页
      })
    } else {
      if (to.name === 'error_404') {
        next({ path: to.path, query: to.query })
      } else {
        // turnTo(to, next)
        next()
      }
    }
  }
})

router.afterEach(to => {

})

export default router
