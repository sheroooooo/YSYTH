import axios from '@/api/api.request'
// 请求支付方式列表
export const queryBaseInfo = ({ dataSource }) => {
  console.log(dataSource)
  let url = ''
  // modal = modal.toLowerCase()
  if (dataSource === '54') {
    url = '/gsp/oerjsfs/getJSFSList'
  }
  // console.log(this.$store)
  // return [{ dm: '01', mc: '现金' }, { dm: '02', mc: '公务卡' }]
  if (url !== '') {
    return axios.request({
      url: url,
      data: { gsdm, kjnd, sjly, zth },
      method: 'post'
    })
  }
}
