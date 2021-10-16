import axios from '@/api/api.request'
import store from '@/store'
// 获取功能按钮权限
export const getGnflButtons = ({ GSDM, KJND, ZTH, MODCODE, GNFLDM }) => {
  if (!MODCODE || !GNFLDM) {
    return Promise.resolve([])
  }
  return axios.request({
    url: '/sa/permission/getPermissionButtonByGn',
    data: { GSDM, KJND: store.getters.env.kjnd, ZTH, MODCODE, GNFLDM },
    desc: '获取功能按钮权限',
    method: 'post'
  })
}
// 跳转单据的权限
export const getJumpDocumentPermission = ({ GSDM, KJND, ZTH, MODCODE, GNFLDM }) => {
  if (!MODCODE || !GNFLDM) {
    return Promise.resolve([])
  }
  return axios.request({
    url: '/sa/permission/jumpDocumentPermission',
    data: { GSDM, KJND: store.getters.env.kjnd, ZTH, MODCODE, GNFLDM },
    desc: '获取跳转单据的权限',
    method: 'post'
  })
}
