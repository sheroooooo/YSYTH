<template>
  <div class="error-store">
    <Badge dot
           :count="countComputed">
      <span @click="openErrorLoggerPage">
        <Icon :size="20"
              type="ios-bug" />
      </span>
    </Badge>
  </div>
</template>

<script>
import './error-store.less'
export default {
  name: 'ErrorStore',
  props: {
    count: {
      type: Number,
      default: 0
    },
    hasRead: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    countComputed () {
      return this.hasRead ? 0 : this.count
    }
  },
  methods: {
    openErrorLoggerPage () {
      this.$router.push({
        name: 'error_logger_page'
      })
    }
  }
}
</script>
