<template>
  <div class="c-table-page">
    <Page :total="total"
          :page-size="pageSize"
          :page-size-opts="pageSizeArr"
          size="small"
          @on-change="handlePageChange"
          @on-page-size-change="handlePageSizeChange"
          :show-sizer="showSizer"
          :show-total="showTotal"
          :show-elevator="showElevator" />
  </div>
</template>

<script>
export default {
  name: 'TablePage',
  props: {
    total: {
      type: Number,
      default: 0
    },
    pageSize: {
      type: Number,
      default: 50
    },
    pageSizeArr: {
      type: Array,
      default: () => [50, 100, 200, 500]
    },
    showSizer: {
      type: Boolean,
      default: true
    },
    showTotal: {
      type: Boolean,
      default: true
    },
    showElevator: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {

    }
  },
  methods: {
    handlePageChange (page) {
      this.$emit('on-change', page)
    },
    handlePageSizeChange (size) {
      this.$emit('on-page-size-change', size)
    }
  }
}
</script>

<style lang="less">
.c-table-page {
  padding-left: 16px;
  .ivu-page {
    font-size: 12px;
    padding-right: 0;
    .ivu-page-options {
      &-sizer {
        float: right;
        margin-right: 0px;
        .ivu-select-selected-value {
          font-size: 12px;
        }
      }
      &-elevator {
        float: right;
        margin-right: 10px;
        input {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
