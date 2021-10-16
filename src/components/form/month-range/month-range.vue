<template>
  <div>
    <DatePicker style="width:90px"
                v-bind="$attrs"
                :options="options"
                @on-change='(date) => dateChange(date, "start")'
                placeholder="请选择开始日期"
                v-model="startTime"
                ref='startDate'>
    </DatePicker>
    -
    <DatePicker style="width:90px"
                v-bind="$attrs"
                :options="options"
                v-model="endTime"
                @on-change='(date) => dateChange(date, "end")'
                placeholder="请选择结束日期"
                ref='endDate'>
    </DatePicker>
  </div>
</template>
<script>
export default {
  name: 'dataRange',
  props: {
    startAttr: {
      type: Object,
      default: () => { }
    },
    endAttr: {
      type: Object,
      default: () => { }
    },
    value: {
      type: Array,
      default: () => ['2020-01', '2020-12']
    },
    dateExtent: {
      type: Array,
      default: () => []
    }
  },
  model: {
    prop: 'value',
    event: 'on-change'
  },
  data () {
    return {
      startTime: this.value[0],
      endTime: this.value[1],
      options: {}
    }
  },
  watch: {
    value (value) {
      this.startTime = value[0]
      this.endTime = value[1]
    },
    // 期间可选范围
    dateExtent: {
      handler (newVal, oldVal) {
        this.options = {
          disabledDate (date) {
            if (newVal.length) {
              return date && (date.valueOf() < this.$utils.timestamp(newVal[0]) || date.valueOf() >= this.$utils.timestamp(`${newVal[1]}-31`))
            } else {
              return false
            }
          }
        }
      },
      immediate: true,
      deep: true

    }
  },
  methods: {
    dateChange (date, position) {
      let changeDate = new Date(date)
      let oldStartDate = new Date(this.value[0])
      let oldEndDate = new Date(this.value[1])
      if (position === 'end' && (changeDate.getTime() >= oldStartDate.getTime())) {
        this.$emit('on-change', [this.value[0], date])
      } else if (position === 'start' && (changeDate.getTime() <= oldEndDate.getTime())) {
        this.$emit('on-change', [date, this.value[1]])
      } else {
        this.$emit('on-change', [...this.value])
      }
    }
  },
  mounted () {
    console.log(this.dateExtent)
  }
}
</script>
