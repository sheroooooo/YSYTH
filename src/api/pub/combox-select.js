import axios from '@/api/api.request'
// 请求支付方式列表
export const getComboxData = ({ gsdm, kjnd, name, modal, sjly, dataType, zth, djlxid, KMDM }) => {
  let url = ''
  modal = modal.toLowerCase()
  let params = { gsdm, kjnd, sjly, zth, djlxid, name }
  if (name === 'JSFSDM' && modal === 'oer') {
    url = '/' + modal + '/oerjsfs/getJSFSList'
    params['KMDM'] = KMDM
  } else if (name === 'JKFS') {
    url = '/' + modal + '/condition/getJSFSList'
  } else if (sjly.toString().substring(0, 1) === '3' && sjly.toString().length === 3) {
    url = '/inv/public/getFZXSelect'
  } else {
    url = '/pub/FZX/getFZXSelect'
  }

  if (url !== '') {
    return axios.request({
      url: url,
      data: params,
      desc: '获取下拉数据',
      method: 'post'
    })
  }
}
// 预约地点下拉option接口
export const getPostionList = (data) => {
  return axios.request({
    url: '/oer/reservation/getYydd',
    data,
    desc: '获取预约地点数据',
    method: 'post'
  })
}
