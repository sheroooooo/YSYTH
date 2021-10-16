<template>
  <plg-doc-wrapper ref="plgDoc"
                   class="auth-blank"
                   @on-resize="handlePlgDocResize">
    <template slot="sufHeader">
      <vuc-toolbar :data="btns"
                   :powers="powerBtns"
                   :status='status'
                   class="toolbar"
                   @click="handleVucBtnClick">
      </vuc-toolbar>
    </template>
    <template slot="filterGroup">
      下拉框：
      <Select v-model="sel"
              style="width: 200px">
        <Option value="1"
                label="1"></Option>
        <Option value="2"
                label="2"></Option>
      </Select>
      <Button type="primary"
              class="search-btn"
              @click="handleSearchClick">查询</Button>
    </template>
    <div class="auth-blank-body">
      <vuc-datatable ref="xTable"
                     row-key="XH"
                     table-id="AuthBlank"
                     :show-toolbar="true"
                     :toolbar="['search', 'refresh']"
                     :show-pager="true"
                     :height="tableHeight"
                     @on-toolbar-click="handleToolbarClick">
      </vuc-datatable>
    </div>
    <template slot="drawer">
    </template>
  </plg-doc-wrapper>
</template>

<script>
export default {
  name: 'AuthBlank',
  data () {
    return {
      btns: [
        { code: 'aaa', text: '按钮1', type: 'primary' },
        { code: 'bbb', text: '按钮2' }
      ],
      powerBtns: [],
      status: 0,
      tableHeight: 0,
      sel: ''
    }
  },
  methods: {
    handlePlgDocResize ({ height }) {
      this.tableHeight = height - 50
    },
    handleVucBtnClick (item) {
      this.handleBtnClick(item.code)
    },
    handleToolbarClick (name) {
      if (name === 'refresh') {
        this.getTableData()
      }
    },
    handleSearchClick () {
      this.getTableData()
    }
  }
}
</script>

<style lang="less">
@import './auth-blank.less';
</style>
