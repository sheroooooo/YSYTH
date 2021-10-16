import axios from '@/api/api.request'

export const getRemainingNum = ({}) => {
  return axios.request({
    url: '/csmp/getRemainingNum',
    params: {},
    desc: '查询单位剩余授权数',
    method: 'get',
    waitfor: true
  })
}

export const getCsmpChecks = ({ startDateTime, endDateTime, customerIndeid, msg, pageNum, pageSize, czyId }) => {
  return axios.request({
    url: '/csmp/getCsmpChecks',
    params: { startDateTime, endDateTime, customerIndeid, msg, pageNum, pageSize, czyId },
    desc: '查询查验记录',
    method: 'get',
    waitfor: true
  })
}