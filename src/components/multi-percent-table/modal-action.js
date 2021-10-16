export default {
  methods: {
    // 新增行
    add () {
      if (this.yzIsChange) {
        this.tableData.push({ dm: '', per: 0, yz: 0 })
        return
      }
      let curPer = 10000
      let curYz = this.yz * 100
      this.tableData.map(v => {
        curPer = curPer - v.per * 100
        curYz = curYz - v.yz * 100
      })
      this.tableData.push({ dm: '', per: curPer / 100, yz: curYz / 100 })
    },
    // 删除行
    del () {
      if (this.curSelectIndex > -1) {
        this.tableData.splice(this.curSelectIndex, 1)
        this.curSelectIndex = -1
      }
    },
    // 取消
    handleCancel () {
      this.showModal = false
    },
    handleOk () {
      let data = this.$refs.multiPerTable.getTableData().fullData
      data = data.filter(v => v.dm)
      if (data.length === 0) {
        this.initValue = ''
        this.$emit('on-change', '', [])
        this.showModal = false
        return
      }
      data = data.filter(v => v.per * 1 !== 0)
      if (this.yzIsChange) {
        const totalYz = this.tableData.reduce((t, v) => t + v.yz * 1, 0)
        if (this.yzIsChange === 1 && this.yz >= totalYz) {
          this.$fn.warning({ desc: '修改后金额必须大于原值' })
          return
        }
        if (this.yzIsChange === 2 && this.yz <= totalYz) {
          this.$fn.warning({ desc: '修改后金额必须小于原值' })
          return
        }
      }
      let totalPer = 0
      // let totalYz = 0
      data.map(v => {
        totalPer = totalPer + v.per * 1
        // totalYz = totalYz + v.yz * 1
      })
      // const calYz = this.yzIsChange ? this.beforeSaveYz : this.yz
      // if ((this.itemKey === 'DZJBZ' || this.isZJLY) && totalYz !== calYz) {
      //   this.$fn.error({ desc: '修改后金额不等于原值，请调整' })
      //   return
      // }
      if (totalPer !== 100) {
        this.$fn.error({ desc: '比例不等于100%，请调整' })
        return
      }
      let tmpObj = {}
      let flag = -1
      for (let [i, v] of data.entries()) {
        if (!tmpObj[v.dm.split(' ')[0]]) {
          tmpObj[v.dm.split(' ')[0]] = true
        } else {
          flag = i
          break
        }
      }
      if (flag > -1) {
        this.$fn.error({ desc: `第${flag + 1}行部门重复，请重新选择` })
        return
      }
      let dmmc = ''
      data.map(v => {
        let per = Number(v.per).toFixed(2)
        let str = `${v.dm} ${per}%;`
        if (this.itemKey === 'DZJBZ' || this.isZJLY) {
          let yz = Number(v.yz).toFixed(2)
          str = `${v.dm} ${per}% ${yz};`
        }
        dmmc = dmmc + str
      })
      this.initValue = dmmc
      this.$emit('on-change', dmmc, data)
      this.showModal = false
    },
    // 表头处理金额
    formatMoney ({ row, column }) {
      return this.$utils.commafy(row[column.property], { fixed: 2 })
    },
    perChange ({ row, rowIndex }) {
      this.$set(this.tableData[rowIndex], 'yz', this.yz * row.per / 100)
    },
    yzChange ({ row, rowIndex }) {
      if (this.yzIsChange) {
        const totalYz = this.tableData.reduce((t, v) => t + v.yz * 1, 0)
        this.tableData.map(v => {
          v.per = totalYz ? this.formatNum(v.yz / totalYz * 100) : 0
        })
      } else {
        this.$set(this.tableData[rowIndex], 'per', this.formatNum(row.yz / this.yz * 100))
      }
    },
    formatNum (data) {
      return Number(data).toFixed(2) * 1
    },
    dealTable () {
      this.$refs.multiPerTable.loadColumn(this.columns)
      this.$refs.multiPerTable.loadData(this.tableData)
    },
    handleSelect ({ rowIndex }) {
      this.curSelectIndex = rowIndex
    },
    setCol () {
      this.columns = [
        { type: 'index', title: '序号', width: '65', headerAlign: 'center' },
        {
          field: 'dm',
          title: this.title,
          'min-width': '180',
          headerAlign: 'center',
          editRender: {
            name: 'Select',
            options: this.fzxData,
            props: { 'clearable': true, 'transfer': true }
          }
        },
        {
          field: 'per',
          title: '比例',
          width: '120',
          headerAlign: 'center',
          align: 'right',
          editRender: { name: 'InputNumber', props: { precision: 2, max: 100, min: 0, readonly: !!this.yzIsChange }, events: { 'on-change': (row) => this.perChange(row) } },
          formatter: ({ row, column }) => { return Number(row[column.property]).toFixed(2) + '%' }
        }
      ]
      if (this.itemKey === 'DZJBZ' || this.isZJLY) {
        let max = this.yzIsChange ? 999999999 : this.yz
        this.columns.push({
          field: 'yz',
          title: '原值',
          width: '120',
          headerAlign: 'center',
          align: 'right',
          formatter: this.formatMoney,
          editRender: { name: 'InputNumber', props: { precision: 2, max, min: 0 }, events: { 'on-change': (row) => this.yzChange(row) } }
        })
      }
      this.$refs.multiPerTable.loadColumn(this.columns)
    },
    initData () {
      if (this.itemKey === 'DZJBZ' || this.isZJLY) {
        this.yz = this.parentData ? this.parentData.YZ * 1 || 0 : 0
        if (this.yzIsChange) {
          this.beforeSaveYz = this.parentData ? this.parentData.beforeSaveYz * 1 || 0 : 0
        }
      }
      const calYz = this.yzIsChange ? this.beforeSaveYz : this.yz
      if (this.value) {
        this.tableData.splice(0, this.tableData.length)
        let tmpArr = this.value.replace(/%/g, '').split(';')
        if (!tmpArr[tmpArr.length - 1]) {
          tmpArr.pop()
        }
        tmpArr.map(v => {
          this.tableData.push({
            dm: `${v.split(' ')[0]} ${v.split(' ')[1]}`,
            per: v.split(' ')[2],
            yz: v.split(' ')[3] || 0
          })
        })
        let idx = this.tableData.length - 1
        if (idx > 0) {
          let lastPer = 100
          let lastYz = calYz
          for (let i = 0; i < idx; i++) {
            lastPer = lastPer - this.tableData[i].per
            lastYz = lastYz - this.tableData[i].yz
          }
          this.tableData.splice(idx, 1, { ...this.tableData[idx], per: lastPer, yz: lastYz })
        }
      } else {
        this.tableData.splice(0, this.tableData.length, { per: 100, yz: calYz })
      }
      this.$refs.multiPerTable.loadData(this.tableData)
    }
  }
}
