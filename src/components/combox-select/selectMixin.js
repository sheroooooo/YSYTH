import { getComboxData, getPostionList } from '@/api/pub/combox-select'
import * as em from '@/api/pub/enum-data'
export default {
  data () {
    let ENV = this.$route.params.ENV || {}
    return {
      gsdm: ENV.gsdm || this.$store.getters.env.gsdm,
      kjnd: ENV.kjnd || this.$store.getters.env.kjnd,
      zth: ENV.zth || this.$store.state.app.env.zth
    }
  },
  inject: {
    activeIndex: {
      from: 'activeIndex',
      default: () => {
        return () => 0
      }
    }
  },
  methods: {
    transValue (item, dataSources) {
      if (!item) return ''
      if (typeof dataSources === 'string' && dataSources.includes('[ZD]')) {
        return item.name
      }
      return `${item.code} ${item.name}`
    },
    handleChange (val, dataSources, name, list) {
      let curItem = list.find(item => this.transValue(item, dataSources) === val)
      if (curItem) {
        let selectItem = {}
        if (dataSources && typeof dataSources === 'string' && dataSources.indexOf('[ZD]') !== -1) {
          selectItem[name] = curItem.name.trim()
        } else {
          selectItem[name] = (curItem.code + ' ' + curItem.name).trim()
          selectItem['DM'] = curItem.code
        }
        selectItem['MC'] = curItem.name
        selectItem['tabsheet'] = curItem.tabsheet
        this.$emit('on-select', selectItem, [selectItem])
      } else { // 如果删除value 返回空字符串
        let selectItem = {}
        selectItem[name] = ''
        this.$emit('on-select', selectItem, [selectItem])
      }
    },
    async getComboxSelectData (dataSources, list = [], parentData) {
      let result = []
      if (Number(dataSources) === -1) {
        // 如果找到 证明list是一个二维数组。应该找到对应的索引
        let result = Object.values(list).find(i => Array.isArray(i))
        if (result) return Promise.resolve(list[this.activeIndex()])
        return Promise.resolve(list)
      }
      // 取枚举项
      if (dataSources.substr(0, 2) === 'em') {
        return Promise.resolve(em.getEnumItems(dataSources))
      }
      // 如果是预约功能
      if (dataSources === 'reservation') {
        let result = await getPostionList({
          gsdm: this.$route.params.gsdm || this.gsdm // 如果是登记簿中切换单位，需要取路由中的gsdm
        }).then(res => {
          if (res && res.data) {
            let list = res.data
            return list.map(item => {
              item.code = item.YYDDBM
              item.name = item.YYDDMC
              return item
            })
          }
        })
        return result
      }
      let itemKey = this.name ? this.name.split('|')[0] : ''// 增加入参，网上报销-结算方式需要单独请求接口
      let params = {
        gsdm: this.$route.params.gsdm || this.gsdm,
        zth: this.zth,
        kjnd: this.kjnd,
        name: itemKey,
        sjly: dataSources,
        modal: this.$route.path.split('/')[1],
        djlxid: this.$route.params.gnflDm
      }
      if (this.$route.path.split('/')[1] === 'OER' && itemKey === 'JSFSDM') {
        params['KMDM'] = parentData['KMDM|KMMC']
      }
      result = await getComboxData(params).then(res => {
        if (this.$route.params.modCode === 'PAO') {
          res.data.splice(res.data.length - 1, 1)
        }
        return res.data
      })
      return result
    }
  }
}
