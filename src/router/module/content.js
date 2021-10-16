import Main from '@/view/main'
import parentView from '@/components/parent-view'
const content = [
  {
    path: '/CONTENT',
    name: 'content',
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
            path: 'content-bill-app',
            name: 'ContentBillApp',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "content-bill-app" */ '@/view/content/content-bill-app')
          }
        ]
      }
    ]
  }
]
export default content
