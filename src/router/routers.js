import Main from '@/view/main'
// 1.基础管理
import base from './module/base'
// 2.内容管理
import content from './module/content'
// 3.授权管理
import auth from './module/auth'
// 4.用户管理
import users from './module/users'
// 5.统计查询
import statistic from './module/statistic'
/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export default [
  {
    path: '/login?rev=' + (new Date()).valueOf(),
    name: 'login',
    meta: {
      title: 'Login - 登录',
      hideInMenu: true
    },
    component: () => import(/* webpackChunkName: "login" */'@/view/login/login.vue')
  },
  {
    path: '/home',
    name: '_home',
    // redirect: '/home',
    component: Main,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: '/home',
        name: 'home',
        meta: {
          hideInMenu: true,
          title: '工作台',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import(/* webpackChunkName: "home" */'@/view/mydesktop/mydesktop-csmp.vue')
        // component: () => import(/* webpackChunkName: "home" */'@/view/home')
      },
      {
        path: '/theme',
        name: 'theme',
        meta: {
          hideInMenu: true,
          title: '选择主题',
          notCache: true,
          icon: 'md-home'
        },
        component: () => import(/* webpackChunkName: "theme" */'@/view/theme/theme.vue')
      }
    ]
  },
  /* 业务模块路由 */
  ...base,
  ...content,
  ...auth,
  ...users,
  ...statistic,
  {
    path: '/401',
    name: 'error_401',
    meta: {
      hideInMenu: true
    },
    component: () => import(/* webpackChunkName: "error_401" */'@/view/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error_500',
    meta: {
      hideInMenu: true
    },
    component: () => import(/* webpackChunkName: "error_500" */'@/view/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error_404',
    meta: {
      hideInMenu: true
    },
    component: () => import(/* webpackChunkName: "error_404" */'@/view/error-page/404.vue')
  }
]
