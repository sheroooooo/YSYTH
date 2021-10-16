<template>
  <div :class="[`${prefixCls}`]">
    <table>
      <thead>
        <tr>
          <td>类别</td>
          <td>会计要素</td>
          <td>期初余额</td>
          <td>本期发生</td>
          <td>期末余额</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row,irow) in formatData"
            :key="`cw_${irow}`">
          <template v-if="irow===0">
            <td align="center"
                :rowspan="5">{{LBMC}}</td>
          </template>
          <td>{{row.LXMC}}</td>
          <td align="right"
              class="money">{{formatMoney(row.QCYE)}}</td>
          <td align="right"
              class="money">{{formatMoney(row.BQFS)}}</td>
          <td align="right"
              class="money">{{formatMoney(row.QMYE)}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'FCTable',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    LBMC: {
      type: String,
      default: '财务会计'
    }
  },
  data () {
    return {
      prefixCls: 'f-c-table'
    }
  },
  computed: {
    formatData () {
      let showData = this.data
      for (let i = this.data.length; i < 5; i++) {
        let row = { LXMC: '', QCYE: 0, BQFS: 0, QMYE: 0 }
        showData.push(row)
      }
      return showData
    }
  },
  methods: {
    formatMoney (val) {
      if (val === 0) {
        return ''
      }
      return this.$utils.commafy(val, { fixed: 2 })
    }
  }
}
</script>

<style lang="less">
.f-c-table{
  table{width:100%;}
  td{
    height:36px;
    padding:4px 8px;
    min-width: 90px;
    border-right:1px #d1d1d1 solid;
    border-bottom:1px #d1d1d1 solid;

  }
  thead tr:first-child td{
    border-top:1px #d1d1d1 solid;
  }
  table tr td:first-child {
    border-left:1px #d1d1d1 solid;
  }
  table tr td:last-child {
    border-right:1px #d1d1d1 solid;
  }
  tbody tr:nth-child(odd){
    background: #fff;
  }
  tbody tr:nth-child(even){
    background: #fafafa;
  }

  thead td{
    background: #eee;
    text-align:center;
  }
  .money{
    min-width:120px;
  }
}
</style>
