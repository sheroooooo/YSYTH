import Main from '@/view/main'
import parentView from '@/components/parent-view'
const statistic = [
  {
    path: '/STATISTIC',
    name: 'statistic',
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
            path: 'statistic-bill-fold',
            name: 'StatisticBillFold',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "statistic-bill-fold" */ '@/view/statistic/statistic-bill-fold')
          },
          {
            path: 'bill-view-modal/:id',
            name: 'BillViewModal',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "bill-view-modal" */ '@/view/statistic/statistic-bill-fold/bill-view-modal')
          },
          {
            path: 'statistic-warn-query',
            name: 'StatisticWarnQuery',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "statistic-warn-query" */ '@/view/statistic/statistic-warn-query')
          },
          {
            path: 'statistic-service-query',
            name: 'StatisticServiceQuery',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "statistic-service-query" */ '@/view/statistic/statistic-service-query')
          },
          {
            path: 'WarnRules',
            name: 'WarnRules',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "statistic-warn-rules" */ '@/view/statistic/statistic-warn-rules/statistic-warn-rules.vue')
          },
          {
            path: 'WarnData',
            name: 'WarnData',
            meta: {
              icon: 'md-funnel',
              title: route => `${route.params.title}`,
              notCache: false,
              keepLive: true
            },
            component: () =>
              import(/* webpackChunkName: "statistic-warn-data" */ '@/view/statistic/statistic-warn-data/statistic-warn-data.vue')
          }
        ]
      }
    ]
  }
]
export default statistic
