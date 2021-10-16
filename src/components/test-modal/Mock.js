export default {
  '1': {
    type: 'Tree',
    filter: [
      // 会计体系代码
      {
        component: 'RadioGroup',
        label: '会计体系',
        name: 'KJDTDM',
        defaultValue: 'all',
        filterType: 'filter', // 过滤类型, 请求后台还是前端过滤
        children: [
          {
            component: 'Radio',
            props: {
              label: '全部',
              value: 'all'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '财务会计',
              value: '01'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '预算会计',
              value: '02'
            }
          }
        ]
      },
      // 代码级次
      {
        component: 'RadioGroup',
        label: '代码级次',
        name: 'sfmx', // 是否明细
        defaultValue: 'all',
        filterType: 'filter', // 过滤类型, 请求后台还是前端过滤
        children: [
          {
            component: 'Radio',
            props: {
              label: '全部代码',
              value: 'all'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '一级代码',
              value: '0'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '明细代码',
              value: '1'
            }
          }
        ]
      },
      // 层级
      {
        component: 'Select',
        label: '',
        name: 'level',
        defaultValue: 'all',
        filterType: 'filter', // 过滤类型, 请求后台还是前端过滤
        props: {
          transfer: true
        },
        children: [
          {
            component: 'Option',
            props: {
              label: '全部',
              value: 'all'
            }
          },
          {
            component: 'Option',
            props: {
              label: '一级代码',
              value: 0
            }
          },
          {
            component: 'Option',
            props: {
              label: '二级代码',
              value: 1
            }
          }
        ]
      }
    ]
  },
  '0': {
    type: 'Table',
    filter: [
      // 代码级次
      {
        component: 'RadioGroup',
        name: 'sfmx',
        label: '代码级次',
        defaultValue: 'all',
        filterType: 'filter', // 过滤类型, 请求后台还是前端过滤
        children: [
          {
            component: 'Radio',
            props: {
              label: '全部代码',
              value: 'all'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '一级代码',
              value: 0
            }
          },
          {
            component: 'Radio',
            props: {
              label: '明细代码',
              value: 1
            }
          }
        ]
      },
      // 层级
      {
        component: 'Select',
        name: 'level',
        label: '',
        defaultValue: 'all',
        filterType: 'filter', // 过滤类型, 请求后台还是前端过滤
        props: {
          transfer: true
        },
        children: [
          {
            component: 'Option',
            props: {
              label: '全部',
              value: 'all'
            }
          },
          {
            component: 'Option',
            props: {
              label: '一级代码',
              value: 0
            }
          },
          {
            component: 'Option',
            props: {
              label: '二级代码',
              value: 1
            }
          }
        ]
      }
    ],
    tableColumns: [
      {
        field: 'DM',
        title: '代码'
      },
      {
        field: 'DMMC',
        title: '代码名称'
      }
    ],
    // 搜索框搜索的字段 不加默认该配置
    search: {
      key: ['DM', 'DMMC'], // 搜索的字段
      filterType: 'filter' // 过滤类型, 请求后台还是前端过滤
    },
    extraFilter: [
      {
        component: 'RadioGroup',
        label: '流量类型',
        name: 'XJLL',
        defaultValue: 'all',
        filterType: 'post', // 过滤类型, 请求后台还是前端过滤
        children: [
          {
            component: 'Radio',
            props: {
              label: '全部',
              value: 'all'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '流入',
              value: '01'
            }
          },
          {
            component: 'Radio',
            props: {
              label: '流出',
              value: '02'
            }
          }
        ]
      }
    ]
  }
}
