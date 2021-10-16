import axios from '@/api/api.request'
/* 表内项-弹出表格选择 */
export const getModalTableData = (data) => {
  let selectURL = {
    'SKR': data.modCode !== 'CM' ? '/oer/oerjsfs/getSKRList' : '/cm/sfkd/getSkrXx',
    'SKRYH': '/cm/sfkd/getSkrXx',
    'SKZH': '/cm/sfkd/getSkrXx',
    'NAME': '/oer/oerjsfs/getSKRList',
    'SQMX': '/oer/applyForm/getGspDetail',
    'CODE': '/cnt/contractReceiptPayment/getContracts',
    'PLAN_ID': '/cnt/contractReceiptPayment/getContractPlan',
    'YGDZCMC': '/gsp/FZX/findYGDZC',
    'czy': '/sa/czy/getZyxxTable',
    'xzczy': '/sa/czy/getZyxxTable',
    'role': '/sa/role/initAddCzy',
    'JHID': '/gcp/tzd/getJHIDList',
    'zb': '/pubys/budget/getTargetItem',
    'ZBID': '/pubys/budget/getTargetItem',
    'zbid': '/pfp/pfpArgs/getAllZbid',
    'jhid': '/pfp/pfpArgs/getAllPlanId',
    'FIELD15': '/pubys/budget/getTargetItem',
    'wob': '/oer/oerjsfs/getWriteoffBorrowData', // 冲销借款弹出表格
    'CGSQBM': '/gpmc/procurementBiddingApplicationEntry/selectAllApplicationEntryInfo', // 采购申请信息表格
    'ZTBBM': '/gpmc/procurementBiddingApplicationEntry/selectAllBiddingApplicationEntryInfo', // 招标申请信息表格
    'bank': '/pao/modalData/getBank', // 其他收入开户行选择
    'qtsr': '/pao/applyForm/serchGZX', // 其他收入查找报销单
    'receiverList': '/oer/oerjsfs/getSKRList',
    'KHYH': '/oer/oerjsfs/getYHList',
    'mxxData': '/pao/modalData/getGzxMx' // 其他收入选明细项
  }

  let {
    url = selectURL[data.name], ...otherData
  } = data
  return axios.request({
    url,
    data: otherData,
    method: 'post'
  })
}
export const getWirteOffMoney = () => {
  return [
    {
      name: 'date',
      value: '',
      type: 'date-range',
      label: '借款日期'
    },
    // {
    //   name: 'jhid',
    //   type: 'i-input',
    //   value: '',
    //   label: '计划ID'
    // },
    {
      name: 'zy',
      type: 'i-input',
      value: '',
      label: '摘要'
    },
    {
      label: '部门',
      name: 'bmdm',
      type: 'tree-select',
      props: { 'dataSources': '1' },
      value: ''
    },
    {
      name: 'grdm',
      type: 'tree-select',
      value: '',
      label: '个人',
      props: { 'dataSources': '3' }
    },
    // {
    //   name: 'xmdm',
    //   type: 'tree-select',
    //   value: '',
    //   label: '项目',
    //   props: { 'dataSources': '2' }
    // },
    // {
    //   name: 'jjdm',
    //   type: 'tree-select',
    //   value: '',
    //   label: '部门经济科目',
    //   props: { 'dataSources': '6' }
    // },
    {
      name: 'whje',
      value: 0,
      type: 'money-range',
      label: '金额'
    }
  ]
}
export const getListInfo = () => {
  return [{
    name: 'YSDW',
    type: 'tree-select',
    value: '',
    label: '单位',
    props: {
      dataSources: '5',
      withParentData: false
    }
  },
  {
    name: 'BMDM|BMMC',
    type: 'tree-select',
    value: '',
    label: '部门',
    props: {
      dataSources: '1',
      withParentData: false
    }
  }
  ]
}
// 指标查询条件
export const zbQueries = () => {
  return [{
    name: 'jhid',
    type: 'i-input',
    value: '',
    label: '计划ID',
    rule: [{
      required: true,
      message: '计划ID不能为空',
      trigger: 'blur'
    }]
  },
  {
    name: 'zy',
    type: 'i-input',
    value: '',
    label: '摘要',
    rule: [{
      required: true,
      message: '指标摘要不能为空',
      trigger: 'blur'
    }]
  },
  {
    label: '预算方案',
    name: 'ysfadm',
    type: 'tree-select',
    props: {
      'dataSources': '101'
    },
    value: ''
  },
  {
    label: '指标来源',
    name: 'zblydb',
    type: 'tree-select',
    props: {
      'dataSources': '102'
    },
    value: ''
  },
  {
    label: '部门',
    name: 'bmdm',
    type: 'tree-select',
    props: {
      'dataSources': '1'
    },
    value: ''
  },
  {
    label: '指标类型',
    name: 'zblx',
    type: 'tree-select',
    props: {
      'dataSources': '8'
    },
    value: ''
  },
  {
    name: 'xmdm',
    type: 'tree-select',
    value: '',
    label: '项目',
    props: {
      'dataSources': '2'
    }
  },
  {
    name: 'kyje',
    type: 'checkbox-group',
    value: [1],
    label: '',
    children: {
      type: 'checkbox',
      list: [{
        label: 1,
        title: '不显示余额为0'
      }]
    }
  }
  ]
}

// 指标id表头
export const zbidTableHead = () => {
  return [{
    field: '指标ID',
    key: 'ZBID'
  },
  {
    field: '部门名称',
    key: 'BMMC'
  },
  {
    field: '项目名称',
    key: 'XMMC'
  },
  {
    field: '金额',
    key: 'JE'
  },

  {
    field: '摘要',
    key: 'ZY'
  }

  ]
}

// 计划id表头
export const jhidTableHead = () => {
  return [{
    title: '代码',
    field: 'JHID'
  },
  {
    title: '名称',
    field: 'XMMC'
  },
  {
    title: '摘要',
    field: 'ZY'
  },
  {
    title: '部门',
    field: 'BMMC'
  },
  {
    title: '金额',
    field: 'JE'
  }
  ]
}

// 开户省份表头
export const bankTableHead = () => {
  return [{
    title: '联行号',
    field: 'BANK_CODE'
  },
  {
    title: '联行名称',
    field: 'BANK_NAME'
  }
  ]
}

// 其他收入查找功能表头
export const qtsrTableHead = () => {
  return [{
    title: '报销单号',
    key: 'DJBH'
  },
  {
    title: '摘要',
    key: 'BZ'
  },
  {
    title: '单据金额',
    key: 'DJJE'
  },
  {
    title: '发放年度',
    key: 'FFND'
  }
  ]
}

/*
 * 系统管理、印制职员，操作员
 */
export const getSaCzy = () => {
  return [{
    name: 'FLAG',
    type: 'i-select',
    value: '',
    label: '引入类型',
    children: {
      type: 'i-option',
      list: [{
        'value': '_',
        'title': '自定义引入'
      },
      {
        'value': 'NAME',
        'title': '按名字引入'
      },
      {
        'value': 'CODE',
        'title': '按代码引入'
      }
      ]
    }
  },
  {
    name: 'passType',
    type: 'i-select',
    value: '',
    label: '密码类型',
    children: {
      type: 'i-option',
      list: [{
        'value': 'initial',
        'title': '初始密码'
      },
      {
        'value': 'identity',
        'title': '身份证后六位'
      }
      ]
    }
  },
  {
    name: 'password',
    type: 'i-input',
    readOnly: false,
    value: '',
    label: '初始密码'
  }
  ]
}
export const getSaCzyPass = () => {
  return [{
    name: 'FLAG',
    type: 'i-select',
    value: '',
    label: '引入类型',
    children: {
      type: 'i-option',
      list: [{
        'value': '',
        'title': '自定义引入'
      },
      {
        'value': 'NAME',
        'title': '按名字引入'
      },
      {
        'value': 'CODE',
        'title': '按代码引入'
      }
      ]
    }
  },
  {
    name: 'passType',
    type: 'i-select',
    value: '',
    label: '密码类型',
    children: {
      type: 'i-option',
      list: [{
        'value': 'initial',
        'title': '初始密码'
      },
      {
        'value': 'identity',
        'title': '身份证后六位'
      }
      ]
    }
  }
  ]
}
/*
 * 选择职员
 */
export const getZyxxTree = (data) => {
  return axios.request({
    url: '/sa/czy/getZyxxTree',
    data,
    method: 'post'
  })
}
// 获取账套参数设置数据
export const getZtcsValues = ({ gsdm, kjnd, sxbh }) => {
  return axios.request({
    url: '/oer/setOfParams/getZtcsValues',
    data: { gsdm, kjnd, sxbh },
    method: 'post'
  })
}
// 网上报销-结算方式-开户银行弹出表格查询条件
export const getBankInfo = () => {
  return [{
    name: 'PROVINCE',
    type: 'tree-select',
    value: '',
    label: '开户省份',
    props: {
      dataSources: '156',
      withParentData: false
    }
  },
  {
    name: 'CITY',
    type: 'tree-select',
    value: '',
    label: '开户城市',
    props: {
      dataSources: '157',
      withParentData: false
    }
  },
  {
    name: 'BANK',
    type: 'tree-select',
    value: '',
    label: '银行',
    props: {
      dataSources: '150',
      withParentData: false
    }
  },
  {
    name: 'FILTER',
    type: 'i-input',
    value: '',
    label: '模糊'
  }
  ]
}
// 网上报销-结算方式-收款人弹出表格表头数据
export const getSKRColumns = () => {
  return [
    {
      title: '收款人',
      key: 'SKR'
    },
    {
      title: '开户银行',
      key: 'KHYH'
    },
    {
      title: '银行账号',
      key: 'YHZH'
    },
    {
      title: '省份',
      key: 'PROVINCE'
    },
    {
      title: '城市',
      key: 'CITY'
    },
    {
      title: '银行机构',
      key: 'YH'
    },
    {
      title: '银行行号',
      key: 'YHHH'
    },

    {
      title: '身份证号',
      key: 'SFZH'
    }
  ]
}
// 出纳-收款人弹出表格表头数据
export const getCMSKRColumns = () => {
  return [
    {
      title: '收款人',
      key: 'SKR'
    },
    {
      title: '开户银行',
      key: 'SKRYH'
    },
    {
      title: '银行账号',
      key: 'SKZH'
    }
  ]
}

// 其他薪资明细项表头
export const mxxTableHead = () => {
  return [
    {
      type: 'index',
      title: '序号',
      width: '50'
    },
    {
      key: 'QTXZXMDM',
      title: '明细项目代码'
    },
    {
      key: 'MXXMMC',
      title: '明细项目名称'
    },
    {
      key: 'BZ',
      title: '备注'
    },
    {
      key: 'LWFJSBL',
      title: '计税比例'
    },
    {
      key: 'JSSLB',
      title: '计税税率表'
    },
    {
      key: 'ISYS',
      title: '指标已启用'
    }
  ]
}
// 出入库表头
export const CRKTableHead = () => {
  return [
    { type: 'selection', title: ' ', width: '40', fixed: 'left' },
    {
      type: 'index',
      title: '序号',
      width: '50'
    },
    {
      key: 'BM',
      title: '业务部门'
    },
    {
      key: 'BH',
      title: '单据编号'
    },
    // {
    //   key: 'CK',
    //   title: '仓库'
    // },
    {
      key: 'BZ',
      title: '摘要'
    }
  ]
}
// 物资申领表头
export const WZSLTableHead = () => {
  return [
    { type: 'selection', title: ' ', width: '40', fixed: 'left' },
    {
      type: 'index',
      title: '序号',
      width: '50'
    },
    {
      key: 'BM',
      title: '业务部门'
    },
    {
      key: 'BH',
      title: '单据编号'
    },
    {
      key: 'RQ',
      title: '业务日期'
    },
    {
      key: 'ZDR',
      title: '制单人'
    },
    {
      key: 'BZ',
      title: '备注'
    }
  ]
}
// 开户省份 开户城市 银行行号 银行机构 表头
export const bankInfoTableHead = () => {
  return {
    'khsf': [
      {
        title: '省份代码',
        headerAlign: 'center',
        width: '120',
        field: 'PROVID'
      },
      {
        title: '省份',
        headerAlign: 'center',
        field: 'PROVINCE'
      }
    ],
    'khcs': [
      {
        title: '城市代码',
        headerAlign: 'center',
        width: '120',
        field: 'AREACODE'
      },
      {
        title: '城市',
        headerAlign: 'center',
        field: 'AREA_NAME'
      }
    ],
    'yhhh': [
      {
        title: '联行号',
        headerAlign: 'center',
        width: '120',
        field: 'BANK_CODE'
      },
      {
        title: '联行名称',
        headerAlign: 'center',
        field: 'BANK_NAME'
      }
    ],
    'yhjg': [
      {
        title: '银行机构代码',
        headerAlign: 'center',
        field: 'DEPID'
      },
      {
        title: '银行机构名称',
        headerAlign: 'center',
        field: 'DEP_NAME'
      }
    ]
  }
}
