import axios from '@/api/api.request'
export const getTableData = (data) => {
  let urlMap = {
    'provider': '/csmp/getAllCsmpProviders',
    'providerName': '/csmp/getAllCsmpProviders',
    'agentName': '/csmp/getAllAgents',
    // 查服务商下所有单位
    'customerName': '/csmp/getAllCustomers',
    // 查当前角色下所有单位
    'customerNameRole': '/csmp/getCustomers',
    'inde': '/csmp/getOrganization',
    // 查询单位组
    'groupName': '/csmp/getCsmpGroups',
    // 查询查验人列表
    'czyId': '/csmp/getAllUsers'
  }
  let post = ['inde']
  let obj = {
    url: urlMap[data.key],
    desc: '查询表格数据',
    waitfor: true
  }
  if (post.includes(data.key)) {
    obj.data = data
    obj.method = 'post'
  } else {
    obj.params = data
    obj.method = 'get'
  }
  return axios.request(obj)
}