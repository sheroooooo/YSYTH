<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='24' class="right-table">
					<div class="handle-box">
						平台名称 :&nbsp;&nbsp;&nbsp;<el-input v-model="query.GUID_PLATFORM" class="handle-input mr10"></el-input>
						<el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
					</div>
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
                        <el-table-column
							prop="GUID_PLATFORM"
							label="平台名称"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							prop="GUID_DATAKIND"
							label="映射类型名称"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="DEFAULTTYPE"
							label="默认值类型"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="DEFAULTVALUE"
							label="默认值"
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
				<el-form-item prop='GUID_PLATFORM' label="平台名称">
					<el-input v-model='formItem.GUID_PLATFORM'></el-input>
				</el-form-item>
                <el-form-item prop='GUID_DATAKIND' label="映射类型名称">
					<el-input v-model='formItem.GUID_DATAKIND'></el-input>
				</el-form-item>
                <el-form-item prop='DEFAULTTYPE' label="默认值类型">
                    <el-select v-model="formItem.DEFAULTTYPE" placeholder="请选择默认值类型">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
                </el-form-item>
                <el-form-item prop='DEFAULTVALUE' label="默认值">
					<el-input v-model='formItem.DEFAULTVALUE'></el-input>
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
import { getDefault, editDefault, deleteDefault } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			query: { GUID_PLATFORM: '' },
            options: [
				{ label: '默认值', value: '-1' },
				{ label: '置空', value: '0' },
				{ label: '报文原值', value: '1' }
			],
			tableData: [
				{
                    GUID_DEFAULT: '22222',
					GUID_PLATFORM: '功能唯一码，字符串',
					GUID_DATAKIND:'1',
					DEFAULTTYPE: '22333',
					DEFAULTVALUE:'临时表表名'
				},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
                GUID_DEFAULT: '',
                GUID_PLATFORM: '',
                GUID_DATAKIND: '',
                DEFAULTTYPE: '-1',
                DEFAULTVALUE: ''
			}
		}
	},
	components: { headTop },
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 250
		})
		this.getDefault()
	},
	methods: {
		handleSearch () {
			this.getDefault()
		},
		getDefault () {
			let params = {
				CONDITION: { 
                    GUID_DEFAULT: '',
					...this.query
                }
			}
			getDefault(params).then(res => {
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
				GUID_DEFAULT: '',
                GUID_PLATFORM: '',
                GUID_DATAKIND: '',
                DEFAULTTYPE: '',
                DEFAULTVALUE: ''
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
			let params = {
				DATA: data
			}
			editDefault(params).then(res => {
				if (res.status === 200) {
                    this.getDefault()
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
							GUID_DEFAULT: data[index].GUID_DEFAULT
						}
					}
					deleteDefault(params).then(res => {
						if (res.status === 200) {
                            this.getDefault()
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
