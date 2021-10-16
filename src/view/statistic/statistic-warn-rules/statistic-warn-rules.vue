<template>
  <plg-doc-wrapper ref="plgDoc"
                   :header-config="[]"
                   class="statistic-warn-query">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   class="toolbar"
                   @click="handleBtnClick">
      </vuc-toolbar>
    </template>
    <div ref='card' class="rule-card">
      <template v-for="(item, index) in warnData">
        <Card style="width:350px"
              :key="index"
              :class="[item.enable === 0 ? 'red' : 'green']">
          <p slot="title">{{item.name}}</p>
          <div class="rule-card-content">
            <p class="rule-title">启用：{{item.enable === 0 ? "否" : "是"}}</p>
            <p class="rule-title">控制方式：{{item.mode === 0 ? "拒收" : "预警"}}</p>
            <div v-if="item.code === 'jekz'">
              <p v-if="item.code" class="rule-title">上限金额：{{item.amount}}</p>
            </div>
            <div v-if="item.code === 'mckz'">
              <p v-if="item.buyerNumber" class="rule-title">纳税人识别号：{{item.buyerNumber}}</p>
              <p v-if="item.buyerName" class="rule-title">单位名称：{{item.buyerName}}</p>
            </div>
            <p v-if="item.billnames" class="rule-title">
              <Poptip trigger="hover" word-wrap width="200" :content="item.billnames">
                不受约束费用性质：{{item.billnames.length > 30 ? item.billnames.slice(0, 30) + '...' : item.billnames}}
              </Poptip>
            </p>
            <p v-if="item.vouchernames" class="rule-title">
              <Poptip trigger="hover" word-wrap width="200" :content="item.vouchernames">
                不受约束费用明细：{{item.vouchernames.length > 30 ? item.vouchernames.slice(0, 30) + '...' : item.vouchernames}}
              </Poptip>
            </p>
          </div>
          <p class="rule-button">
            <Button type="text" @click="handleBtnClick('edit', item)">编辑</Button>
            <Poptip
              confirm
              title="您确定删除吗？"
              @on-ok="deleteWarnRule(item)">
              <Button type="text">删除</Button>
            </Poptip>
          </p>
      </Card>
      </template>
    </div>
  </plg-doc-wrapper>
</template>

<script>
import { getWarnRules, deleteWarnRule } from '@/api/statistic/statistic-warn-rules'
import WarnRuleModal from './wran-rule-modal'
export default {
  name: 'StatisticWarnRules',
  data () {
    return {
      btns: [
        { name: 'add', text: '新增', type: 'primary' }
      ],
      warnData: []
    }
  },
  methods: {
    handleBtnClick (action, data) {
      if (action.name === 'add' || action === 'edit') {
        // for (var i in data) {
        //   data[i] = data[i] === null ? '' : data[i]
        // }
        const _this = this
        this.$modal({
          title: '设置预警规则',
          resize: false,
          showFooter: false,
          width: 800,
          height: 500,
          slots: {
          default: ({ $modal }, h) => {
            return [
              h(WarnRuleModal, {
                props: {
                  action: action.name || action,
                  data: action === 'edit' ? data : {}
                },
                on: {
                  close () {
                    $modal.close()
                    _this.getWarnRules()
                  },
                  complete () {
                    $modal.close()
                  }
                }
              })
            ]
          }
         }
        })
      }
    },
    deleteWarnRule (data) {
      console.log(data)
      let params = { id: data.id }
      this.$fn.ajax(deleteWarnRule, params, res => {
        if (res.status === 200) {
          this.$fn.success({ desc: res.msg })
          this.getWarnRules()
        }
      })
    },
    getWarnRules () {
      this.$fn.ajax(getWarnRules, {}, res => {
        if (res.status === 200) {
          this.warnData = res.data
        }
      })
    }
  },
  created () {
      this.getWarnRules()
  }
}
</script>
<style lang="less">
  @import './statistic-warn-rules.less';
</style>