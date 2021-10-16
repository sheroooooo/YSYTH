import Main from '@/view/main'
import parentView from '@/components/parent-view'
const auth = [
  {
    path: '/AUTH',
    name: 'auth',
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
            path: 'auth-authorize-fws',
            name: 'AuthAuthorizeFws',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "auth-authorize-fws" */ '@/view/auth/auth-authorize-fws')
          },
          {
            path: 'auth-distribute',
            name: 'AuthDistribute',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              // import(/* webpackChunkName: "auth-distribute" */ '@/view/users/users-management')
              import(/* webpackChunkName: "auth-distribute" */ '@/view/auth/auth-distribute')
          }
        ]
      }
    ]
  }
]
export default auth
