import axios from '@/api/api.request'
/**
 * @description 存储过程校验 部分模块按钮调用接口前需先做校验 校验通过才能继续调用接口
 * @param {String} gsdm 公司代码
 * @param {String} kjnd 会计年度
 * @param {String} djlxid 单据类型id
 * @param {String} mlid 目录id
 * @param {String} bz 按钮状态 S 保存, J 送审, H 审核，X 销审, T 退回到编制人, F 作废， Y 还原， D  删除, P 打印,  A 预约, B 取消预约, Z 生成凭证
 * @param {Array} djList 批量操作时存放 djlxid 和 mlid DJGUID
 *  "djList":[{
        "djlxid":"154",
        "mlid":"2020010004",
        "DJGUID": "E2317F9B-A16F-4840-A218-0F06ED419B08"
      },{
        "djlxid":"155",
        "mlid":"2020010005",
        "DJGUID": "E2317F9B-A16F-4840-A218-0F06ED419B08"
      }],
  @return {Number} 200 无错误 300 提示性错误，需要用户确认 500 禁止错误，不可以再调接口
 */
export const beforeBtnOper = (_this, btnName, selectData) => {
  return new Promise((resolve, reject) => {
    let switchObj = {
      'submit': 'J', // 送审
      'check': 'H', // 审核
      'uncheck': 'X', // 销审
      'invalid': 'F', // 作废
      'revert': 'Y', // 还原
      'delete': 'D', // 删除
      'print': 'P', // 打印
      'reservation': 'A', // 预约
      'disReservation': 'B', // 撤销预约
      'voucher': 'Z' // 凭证
    }
    let bz = switchObj[btnName] || ''
    let { gsdm, kjnd } = _this.$store.state.app.env
    let params = { gsdm, kjnd, bz }
    let modeCode = _this.$route.matched[0].name.toLowerCase() // 模块标识
    if (selectData.length === 1) { // 单条操作
      params.djlxid = selectData[0].DJLXID
      params.mlid = selectData[0].MLID
      params.url = `/${modeCode}/customizeCheck/beforeOper`
    } else if (selectData.length > 1) { // 批量操作
      let djList = selectData.reduce((total, value) => [...total, { djbh: value.DJBH, djguid: value.DJGUID, djlxid: value.DJLXID, mlid: value.MLID }], [])
      params.djList = djList
      params.url = `/${modeCode}/customizeCheck/beforeOperBatch`
    }
    _this.$fn.ajax(beforeOper, params, res => {
      if (res.status === 200) {
        resolve(res)
      } else if (res.status === 300) {
        _this.$Modal.confirm({
          title: '提示',
          content: res.data.error,
          onOk: () => {
            resolve(res)
          },
          onCancel: () => {
          }
        })
      }
    })
  })
}

export const beforeOper = (data) => {
  return axios.request({
    url: data.url,
    data,
    method: 'post',
    waitfor: true
  })
}
