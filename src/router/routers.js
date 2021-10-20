import Manage from '@/view/manage'
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
    name: 'home',
    component: Manage,
    meta: {
      hideInMenu: true,
      notCache: true
    },
    children: [
      {
        path: "/platform",
        name: "platform",
        meta: {
          title: '平台登记'
        },
        component: () => import ( /* webpackChunkName: "platform" */ "../view/platform.vue")
      },
      {
        path: "/dwzt",
        name: "dwzt",
        meta: {
          title: '单位账套对照'
        },
        component: () => import ( /* webpackChunkName: "dwzt" */ "../view/dwzt.vue")
      },
      {
        path: "/functions",
        name: "functions",
        meta: {
          title: '功能列表'
        },
        component: () => import ( /* webpackChunkName: "functions" */ "../view/functions.vue")
      },
      {
        path: "/url",
        name: "url",
        meta: {
          title: '访问路由'
        },
        component: () => import ( /* webpackChunkName: "url" */ "../view/url.vue")
      },
      {
        path: "/funcTableRelation",
        name: "funcTableRelation",
        meta: {
          title: '功能与临时表对应关系'
        },
        component: () => import ( /* webpackChunkName: "funcTableRelation" */ "../view/funcTableRelation.vue")
      },
      {
        path: "/default",
        name: "default",
        meta: {
          title: '数据映射默认值'
        },
        component: () => import ( /* webpackChunkName: "default" */ "../view/default.vue")
      },
      {
        path: "/cssz",
        name: "cssz",
        meta: {
          title: '参数设置'
        },
        component: () => import ( /* webpackChunkName: "cssz" */ "../view/cssz.vue")
      },
      {
        path: "/pwdType",
        name: "pwdType",
        meta: {
          title: '加密方式'
        },
        component: () => import ( /* webpackChunkName: "pwdType" */ "../view/pwdType.vue")
      },
      {
        path: "/upload",
        name: "upload",
        meta: {
          title: '上传'
        },
        component: () => import ( /* webpackChunkName: "upload" */ "../view/upload.vue")
      },
      {
        path: "/download",
        name: "download",
        meta: {
          title: '下载'
        },
        component: () => import ( /* webpackChunkName: "download" */ "../view/download.vue")
      },
      {
        path: "/fieldRelations",
        name: "fieldRelations",
        meta: {
          title: '字段对应关系'
        },
        component: () => import ( /* webpackChunkName: "fieldRelations" */ "../view/fieldRelations.vue")
      },
      {
        path: "/kind",
        name: "kind",
        meta: {
          title: '数据映射类型'
        },
        component: () => import ( /* webpackChunkName: "kind" */ "../view/kind.vue")
      }
    ]
  },
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
