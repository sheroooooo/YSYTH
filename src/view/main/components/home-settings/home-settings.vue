<template>
  <div :class="[`${prefixCls}`]"
       v-click-outside:pointerdown="handleOutsideClick">
    <div :class="[`${prefixCls}-caption`]">
      <div class="u8-box">
        <div class="u8-bf1">
          <p>
            <strong>当前工作台：</strong>{{curPlan.label}}</p>
          <p>
            <strong>工作台角色：</strong>{{curPlan.NAME||'个人'}}</p>
        </div>
        <div>
          <Button size="small"
                  type="primary"
                  @click.stop="handleMyDesktop">自定义工作台</Button>
        </div>
      </div>
    </div>
    <vuc-datatable ref="xTable"
                   row-key="schemeGuid"
                   :show-toolbar="false"
                   :height="tableHeight"
                   :cellBreakWord="false"
                   :storeHeader="false"
                   @on-select="handleSelect"
                   size="mini">
    </vuc-datatable>
  </div>
</template>

<script>
import { getSatusTable, saveUseSatusPlan } from '@/api/user'
export default {
  name: 'HomeSettings',
  props: {
    params: {
      type: Object,
      default: () => { }
    },
    curId: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      prefixCls: 'home-settings-tip',
      curPlan: {},
      columns: [
        {
          field: 'label',
          title: '方案名称',
          minWidth: 200,
          headerAlign: 'center'
        },
        {
          field: 'USERTYPE',
          title: '类型',
          width: '100',
          headerAlign: 'center',
          formatter: ({ row, rowIndex, column, columnIndex }) => {
            return row.USERTYPE === '1' ? '系统' : '个人'
          }
        },
        {
          field: 'NAME',
          title: '方案角色',
          width: '140',
          headerAlign: 'center'
        }
      ],
      planList: []
    }
  },
  computed: {
    tableHeight () {
      return 360
    }
  },
  methods: {
    /*
    * 获取可以选择的方案下拉列表
    */
    getWorkPlanLists (refresh) {
      let params = { ...this.params, ver: Math.random() * 1000000 }
      this.curPlan = {}
      getSatusTable(params).then(
        res => {
          if (res.data) {
            this.planList = res.data
            if (res.data.length === 0) {
              this.$emit('on-clear')
            }
            const idx = this.planList.findIndex(item => item.schemeGuid === this.curId)
            if (idx >= 0) {
              this.curPlan = this.planList[idx]
            }
            this.$refs.xTable.loadTableData(this.planList).then(() => {
              if (idx >= 0) {
                this.$refs.xTable.setCurrentRow({ schemeGuid: this.curId })
                if (refresh) {
                  this.setUseWorkPlan(this.curId)
                }
              }
            })
          }

          if (!this.curPlan.schemeGuid && refresh !== false && res.data.length === 1) {
            this.setUseWorkPlan(res.data[0].schemeGuid)
          }
        }

      )
    },
    setUseWorkPlan (schemeGuid) {
      let params = { schemeGuid, ...this.params }
      saveUseSatusPlan(params).then(
        res => {
          if (res.status === 200) {
            this.$emit('on-select', schemeGuid)
          }
        }
      )
    },
    handleSelect ({ row }) {
      this.setUseWorkPlan(row.schemeGuid)
    },
    handleMyDesktop () {
      this.$emit('on-edit', this.curPlan)
    },
    handleOutsideClick () {
      this.$emit('on-out-click')
    }
  },
  mounted () {
    this.$refs.xTable.loadColumn(this.columns)
    // npthis.getWorkPlanLists()
  }
}
</script>
<style lang="less">
.home-settings-tip{
  padding:16px;
  &-caption{
    p{padding:0 0 8px 0}
  }
}
</style>
