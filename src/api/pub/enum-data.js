//  枚举数据
export const getEnumType = (modecode = 'all') => {
  modecode = modecode.toLocaleLowerCase()
  let emData = [
    { xh: 'em001', title: '采购方式', modecode: ['gpmc', 'all'] },
    { xh: 'em002', title: '政府采购方式', modecode: ['gpmc', 'all'] },
    // { xh: 'em003', title: '采购类型', modecode: ['gpmc', 'all'] },
    { xh: 'em004', title: '是/否', modecode: ['gpmc', 'gsp', 'oer', 'cntc', 'all'] },
    { xh: 'em005', title: '合同创建方式', modecode: ['cntc', 'all'] },
    { xh: 'em006', title: '合同类型', modecode: ['cntc', 'all'] },
    { xh: 'em007', title: '收付款方式', modecode: ['gpmc', 'cntc', 'all'] },
    { xh: 'em008', title: '履约保证金形式', modecode: ['gpmc', 'cntc', 'all'] },
    { xh: 'em009', title: '预制方法', modecode: ['gpmc', 'cntc', 'all'] },
    { xh: 'em010', title: '项目属性', modecode: ['gpmc', 'pms', 'cntc', 'all'] },
    { xh: 'em011', title: '合同执行状态', modecode: ['cntc', 'all'] }
  ]
  return emData.filter(item => item.modecode.includes(modecode))
}
export const getEnumItems = (emCode) => {
  let data = {
    'em001': [{ 'code': '0', 'name': '自行采购' }, { 'code': '1', 'name': '政府集中采购' }, { 'code': '2', 'name': '政府协议供货' }, { 'code': '3', 'name': '定点采购' }],
    'em002': [{ 'code': '1', 'name': '政府集中采购' }, { 'code': '2', 'name': '政府协议供货' }, { 'code': '3', 'name': '定点采购' }],
    // 'em003': [{ 'code': '0', 'name': '系统立项项目采购' }, { 'code': '1', 'name': '经常性项目采购' }, { 'code': '2', 'name': '非项目采购' }],
    'em004': [{ 'code': '1', 'name': '是' }, { 'code': '0', 'name': '否' }],
    'em005': [{ 'code': '0', 'name': '新增' }, { 'code': '1', 'name': '续签' }, { 'code': '2', 'name': '补录' }],
    'em006': [{ 'code': '0', 'name': '收款' }, { 'code': '1', 'name': '付款' }, { 'code': '2', 'name': '协议' }],
    'em007': [{ 'code': '0', 'name': '转账' }, { 'code': '1', 'name': '现金' }, { 'code': '2', 'name': '公务卡' }, { 'code': '3', 'name': '网银（公）' }, { 'code': '4', 'name': '网银（私）' }, { 'code': '5', 'name': '支票' }, { 'code': '6', 'name': '冲销借款' }],
    'em008': [{ 'code': '0', 'name': '无' }, { 'code': '1', 'name': '保证金' }, { 'code': '2', 'name': '保函' }],
    'em009': [{ 'code': '0', 'name': '年' }, { 'code': '1', 'name': '半年' }, { 'code': '2', 'name': '季' }, { 'code': '3', 'name': '月' }],
    'em010': [{ 'code': '0', 'name': '新增' }, { 'code': '1', 'name': '延续' }, { 'code': '2', 'name': '追加' }],
    'em011': [{ 'code': '0', 'name': '起草中' }, { 'code': '1', 'name': '执行中' }, { 'code': '2', 'name': '已完结' }, { 'code': '3', 'name': '已中止' }]
  }
  return data[emCode]
}
