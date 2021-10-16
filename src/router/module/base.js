import Main from '@/view/main'
import parentView from '@/components/parent-view'
const base = [
  {
    path: '/BASE',
    name: 'base',
    meta: {
      icon: 'md-laptop',
      title: '系统管理'
    },
    component: Main,
    children: [
      {
        path: 'bus',
        name: 'bus',
        meta: {
          icon: 'md-funnel',
          showAlways: true,
          title: '业务处理'
        },
        component: parentView,
        children: [
          {
            path: 'base-admin-set',  // 管理员设置
            name: 'BaseAdminSet',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "base-admin-set" */ '@/view/base/base-admin-set')
          },
          {
            path: 'base-company-set',  // 单位设置
            name: 'BaseCompanySet',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "base-company-set" */ '@/view/base/base-company-set')
          },
          {
            path: 'base-operator-set',  // 单位设置
            name: 'BaseOperatorSet',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "base-operator-set" */ '@/view/base/base-operator-set')
          },
          {
            path: 'base-service-set',  // 单位设置
            name: 'BaseServiceSet',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "base-service-set" */ '@/view/base/base-service-set')
          }
        ]
      }
    ]
  }
]
export default base
