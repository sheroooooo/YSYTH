const cmptList = [
  {
    title: '基础应用',
    children: [
      { id: '9601', name: 'WorkNotices', title: '工作通知', showHeader: true, minWidth: 300, minHeight: 100, w: 400, h: 300 },
      // { name: 'ToDoList', title: '待办事宜' },
      { id: '9602', name: 'VardSwiper', title: '待办事宜', showHeader: true, minWidth: 300, minHeight: 100, w: 400, h: 300 },
      { id: '9603', name: 'MuchUsedMenu', title: '常用功能', showHeader: true, minWidth: 380, minHeight: 90, w: 380, h: 130 },
      { id: '9606', name: 'TaskCenterCard', title: '任务中心', showHeader: true, minWidth: 300, minHeight: 130, w: 380, h: 300 }
    ]
  },
  {
    title: '账务管理',
    children: [
      { id: '9604', name: 'FinancialCondition', title: '账务情况', showHeader: true, minWidth: 1100, minHeight: 600, w: 1100, h: 600 },
      { id: '9605', name: 'CapitalAccountCondition', title: '资金类账户情况', showHeader: true, minWidth: 400, minHeight: 240, w: 800, h: 480 }
    ]
  }
  // 根据要求采购与合同不要啦
  /* ,
  {
    title: '采购管理',
    children: [
      { id: '9606', name: 'GpmcCondition', title: '采购情况' }
    ]
  },
  {
    title: '合同管理',
    children: [
      { id: '9607', name: 'CntcCondition', title: '合同情况' }
    ]
  } */
]
export default cmptList
