<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='24' class="right-table">
					<div class="handle-box">
						功能名称 :&nbsp;&nbsp;&nbsp;<el-input v-model="query.GUID_FUNC" class="handle-input mr10"></el-input>
						<el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
					</div>
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
						<el-table-column
							prop="XH"
							label="序号"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="GUID_FUNC"
							label="功能名称"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							prop="TABLENAME"
							label="临时表表名"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							fixed="right"
							label="操作"
							width="180"
							align='center'>
							<template slot-scope="scope">
								<el-button
									@click.native.prevent="addRow(scope.$index, tableData)"
									type="text"
									size="small">
									新增
								</el-button>
								<el-button
									@click.native.prevent="updateRow(scope.$index, tableData)"
									type="text"
									size="small">
									修改
								</el-button>
								<el-button
									@click.native.prevent="deleteRow(scope.$index, tableData)"
									type="text"
									size="small">
									删除
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-col>
			</el-row>
		</div>
		<el-dialog
			:title='title'
			:visible.sync="dialogVisible"
			width="400px"
			append-to-body>
			<el-form :model='formItem' ref='formItem' label-position="right" label-width="100px">
                <el-form-item prop='XH' label="序号">
					<el-input v-model='formItem.XH'></el-input>
				</el-form-item>
				<el-form-item prop='GUID_FUNC' label="功能名称">
					<el-input v-model='formItem.GUID_FUNC'></el-input>
				</el-form-item>
				<el-form-item prop='TABLENAME' label="临时表表名">
					<el-input v-model='formItem.TABLENAME'></el-input>
				</el-form-item>
				
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="handleOk">确 定</el-button>
			</span>
		</el-dialog>
    </div>
</template>

<script>
import clonedeep from 'clonedeep'
import headTop from '../components/headTop'
import { getFuncTableRelation, editFuncTableRelation, deleteFuncTableRelation } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			query: { GUID_FUNC: '' },
			tableData: [
				{
					GUID_FUNC: '功能唯一码，字符串',
					XH:'1',
					GUID_FUNC_TABLE: '22333',
					TABLENAME:'临时表表名'
				},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
                GUID_FUNC_TABLE: '',
                GUID_FUNC: '',
				XH: '',
				TABLENAME: ''
			}
		}
	},
	components: { headTop },
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 250
		})
		this.getFuncTableRelation()
	},
	methods: {
		handleSearch () {
			this.getFuncTableRelation()
		},
		getFuncTableRelation () {
			let params = {
				CONDITION: { 
                    GUID_FUNC_TABLE: '',
					...this.query
                }
			}
			getFuncTableRelation(params).then(res => {
				if (res.status === 200) {
					this.tableData = res.data
					this.data[0].children = res.data
				} else {
					this.$message({
						type: 'error',
						message: res.message
					})
				}
			})
		},
		addRow () {
			this.title = '新增'
			this.formItem = {
				GUID_FUNC_TABLE: '',
                GUID_FUNC: '',
				XH: '',
				TABLENAME: ''
			}
			this.dialogVisible = true
		},
		updateRow (index, data) {
			this.formItem = clonedeep(data[index])
			this.title = '修改'
			this.dialogVisible = true
		},
		handleOk () {
			this.dialogVisible = false
            let data = clonedeep(this.formItem)
            data.XH = Number(data.XH)
			let params = {
				DATA: data
			}
			editFuncTableRelation(params).then(res => {
				if (res.status === 200) {
                    this.getFuncTableRelation()
					this.$message({
						type: 'success',
						message: res.message
					})
				} else {
					this.$message({
						type: 'error',
						message: res.message
					})
				}
			})
		},
		deleteRow (index, data) {
			this.$confirm('此操作将永久删除, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
				}).then(() => {
					let params = {
						CONDITION: {
							GUID_FUNC_TABLE: data[index].GUID_FUNC_TABLE
						}
					}
					deleteFuncTableRelation(params).then(res => {
						if (res.status === 200) {
                            this.getFuncTableRelation()
							this.$message({
								type: 'success',
								message: '删除成功!'
							})
						} else {
							this.$message({
								type: 'error',
								message: res.message
							})
						}
					})
				}).catch(() => {
				this.$message({
					type: 'info',
					message: '已取消删除'
				})
			})
		}
	}
}
</script>

<style lang="less">
	@import '../style/mixin.less';
</style>
