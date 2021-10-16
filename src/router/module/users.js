import Main from '@/view/main'
import parentView from '@/components/parent-view'
const users = [
  {
    path: '/USERS',
    name: 'users',
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
            path: 'users-management',
            name: 'UsersManagement',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "users-management" */ '@/view/users/users-management')
          },
          {
            path: 'users-customer-group',
            name: 'UsersCustomerGroup',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "users-customer-group" */ '@/view/users/users-customer-group')
          }
        ]
      }
    ]
  }
]
export default users
