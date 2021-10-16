<template>
  <div class='apt-cash-flow' ref='TableWrapper'>
    <Row>
      <Col span='15' class='data-show-wrapper'>
        <Form :model='formData' :label-width='45' label-position='left'>
          <FormItem prop='type'>
             <CheckboxGroup v-model="formData.type">
                <Checkbox label="Eat">流入类</Checkbox>
                <Checkbox label="Sleep">流出类</Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Form>
        <vuc-datatable ref="xTable"
                       show-pager
                       v-if='dataConfig.type === "Table"'
                       :height='tableHeight'
                       @on-select="handleSelect"
                       show-upload-list>
        </vuc-datatable>
        <vuc-tree ref="xtree"
                  expand
                  v-if='dataConfig.type === "Tree"'
                  id-field="id"
                  text-field="title"
                  :slots="slots"
                  :show-checkbox='false'
                  :height="splitHeight - 128"
                  @on-select="handleSelect"></vuc-tree>
      </Col>
      <Col span='9'>
        <vuc-fieldset title="过滤">
          <RadioGroup class='radio-group-wrapper' v-model='filterValue'>
            <Radio label="YJDM" class='radio-group-item'>一级代码</Radio>
            <Radio label="MXDM" class='radio-group-item'>明细代码</Radio>
            <Radio label="SYDM" class='radio-group-item'>所有代码</Radio>
            <Radio label="FDDM" class='radio-group-item'>分段代码</Radio>
            <Radio label="BPX" class='radio-group-item'>不排序</Radio>
            <Radio label="OTHER" class='radio-group-item'>其他</Radio>
          </RadioGroup>
        </vuc-fieldset>
        <div class='input-number-wrapper'>
          <div class='input-number-detail'><span class='input-number-label'>从</span><InputNumber :max="10" :min="1" class='input-number-item'></InputNumber></div>
          <div class='input-number-detail'><span class='input-number-label'>到</span><InputNumber :max="10" :min="1" class='input-number-item'></InputNumber></div>
        </div>
        <div class='search-button-wrapper'>
          <Button type="primary" class="search-button">查找</Button>
        </div>
      </Col>
    </Row>
    <div class="footer-btn-group">
      <Button type="primary"
              @click='handleSubmit'
              class="submit-btn footer-btn">确定</Button>
      <Button class="submit-btn footer-btn"
              @click="$emit('close')">取消</Button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'AptCashFlow',
  props: {
    dataConfig: {
      type: Object,
      default: () => {
        return {
          type: 'Table',
          data: [],
          props: {},
          columns: []
        }
      }
    }
  },
  data () {
    return {
      formData: {
        screen: '',
        type: []
      },
      filterValue: '',
      tableHeight: 0,
      tableColumns: [],
      tableData: [],
      selectNode: ''
    }
  },
  watch: {
    'dataConfig.data' (value) {
      this.initData(value)
    },
    'dataConfig.columns' (value) {
      this.initColumns(value)
    }
  },
  mounted () {
    setTimeout(() => {
      let height = window.getComputedStyle(this.$refs.TableWrapper).height.replace(/px/g, '')
      this.tableHeight = Number(height) - 85
      this.initData(this.dataConfig.data)
      this.initColumns(this.dataConfig.columns)
    }, 20)
  },
  methods: {
    initData (data) {
      let dom = ''
      if (this.$refs.xTable && this.dataConfig.type === 'Table') {
        dom = this.$refs.xTable
      } else if (this.$refs.xtree && this.dataConfig.type === 'Tree') {
        dom = this.$refs.xtree
      }
      this.tableData = data
      dom && dom.loadData(data)
    },
    initColumns (value) {
      if (this.$refs.xTable && this.dataConfig.type === 'Table') {
        this.tableColumns = value
        this.$refs.xTable.loadColumn(value)
      }
    },
    handleSelect ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, cell }, event) {
      this.selectNode = row
    },
    handleSubmit () {
      if (!this.selectNode) {
        this.$fn.error({ title: '失败提示', desc: '请选择数据' })
        return false
      }
      this.$emit('complete', this.selectNode)
    }
  }
}
</script>

<style lang="less" scoped>
@import './apt-cash-flow.less';
</style>
