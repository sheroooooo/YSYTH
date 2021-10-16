<template>

  <Card class="log-card"
        v-if="logData.length > 0"
        v-click-outside:pointerdown="setShowFlag">
    <vue-scroll>
      <div class="log-card-body">
        <ul>
          <card-item v-for="(item, index) in logData"
                     :key="index"
                     :item-data="item"
                     :item-index="index">
          </card-item>
        </ul>

      </div>
    </vue-scroll>
  </Card>

</template>

<script>
import CardItem from './card-item.vue'
import { getworkFlowlog } from '@/api/workFlow'
export default {
  name: 'CardAuditlog',
  components: { CardItem },
  data () {
    return {
      logData: []
    }
  },
  props: {
    // 日志信息
    data: {
      type: Object,
      default: () => { }
    },
    // 是否显示
    show: {
      type: Boolean,
      required: true
    },
    url: {
      type: String,
      default: ''
    }
  },
  watch: {
    data: {
      immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        this.getLog()
      }
    }
  },
  computed: {
    /* props不允许双向绑定,需要自定义传递 */
    showFlag: {
      get () {
        return this.show
      },
      set (val) {
        this.$emit('logCardOperate', val)
      }
    }
  },
  methods: {
    /* 点击单据状态查看审批日志 */
    getLog () {
      let webPath = this.url || this.$route.matched[0].name.toLowerCase()
      let data = {
        params: this.data,
        url: webPath
      }
      if (JSON.stringify(this.data) === '{}') {
        return false
      }
      if (data.params && JSON.stringify(this.data) !== '{}') {
        data.params['operateTime'] = (new Date()).getTime()
        getworkFlowlog(data).then(
          res => {
            if (res && res.status === 200) {
              let log = res.data
              for (let obj of log) {
                if (obj.adateTime) {
                  let date = obj.adateTime
                  date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${date.slice(8, 10)}:${date.slice(10, 12)}:${date.slice(12, 14)}`
                  obj.adateTime = date
                }
              }
              this.logData = log
            }
          }
        )
      }
    },
    setShowFlag () {
      this.showFlag = false
    }
  }

}
</script>

<style lang="less">
  @import './card-auditlog.less';
</style>
