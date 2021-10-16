<template>
  <div :class="[`${prefixCls}`]">
    <Col span="8" :class="[`${prefixCls}-left`]">
      <div :class="[`${prefixCls}-left-head`]">
        <img :src="require('@/assets/images/logo.png')" :class="[`${prefixCls}-left-head-logo`]">
        <div>{{aboutData.PRODUCT}}</div>
      </div>
      <Form :class="[`${prefixCls}-left-form`]">
        <FormItem label='产品许可授权'>
          {{aboutData.LICENSENAME}}
        </FormItem>
        <FormItem label='许可有效期'>
          {{aboutData.VALIDDATE}}
        </FormItem>
      </Form>
      <img :src="require('@/assets/images/about-rocket.png')" :class="[`${prefixCls}-left-img`]">
    </Col>
    <Col span="16" :class="[`${prefixCls}-right`]">
      <vuc-datatable ref='xTable'
                     :class="[`${prefixCls}-right-table`]"
                     row-key='NAME'
                     height="489">
      </vuc-datatable>
      <img :src="require('@/assets/images/main-about.png')" :class="[`${prefixCls}-right-img`]">
    </Col>
  </div>
</template>
<script>
import { getAboutData } from '@/api/user'

export default {
  name: 'AboutModal',
  props: {},
  data () {
    return {
      prefixCls: 'about-modal',
      // 表头
      columns: [
        {
          field: 'NAME',
          headerAlign: 'center',
          align: 'center',
          title: '产品名称'
        },
        {
          field: 'MODULE',
          headerAlign: 'center',
          align: 'center',
          title: '标识'
        },
        {
          field: 'VERSION',
          headerAlign: 'center',
          align: 'center',
          title: '版本'
        },
        {
          field: 'FILEDATE',
          headerAlign: 'center',
          align: 'center',
          title: '文件日期'
        }
      ],
      aboutData: {}
    }
  },
  methods: {
    getAboutData () {
      this.$fn.ajax(getAboutData, { GSDM: this.$store.getters.env.gsdm }, res => {
        if (res && res.status === 200) {
          this.aboutData = res.data
          this.$refs.xTable.loadData(res.data.MODULELIST)
        }
      })
    }
  },
  mounted () {
    this.$refs.xTable.loadColumn(this.columns)
    this.getAboutData()
  }
}
</script>
<style lang="less">
  @import './about-modal.less';
</style>
