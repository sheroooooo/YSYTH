<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='24' class="right-table">
					<div class="handle-box">
						平台名称 :&nbsp;&nbsp;&nbsp;<el-input v-model="query.GUID_PLATFORM" class="handle-input mr10"></el-input>
						功能名称 :&nbsp;&nbsp;&nbsp;<el-input v-model="query.GUID_FUNC" class="handle-input mr10"></el-input>
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
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="GUID_FUNC"
							label="功能名称"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="XH"
							label="序号"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							prop="REQTYPE"
							label="请求方式"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="INTFURL"
							label="路由地址"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							prop="DATATYPE"
							label="报文格式"
							width="180"
							align='center'>
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
				<el-form-item prop='GUID_URL' label="路由唯一码">
					<el-input v-model='formItem.GUID_URL' :disabled="true"></el-input>
				</el-form-item>
                <el-form-item prop='GUID_PLATFORM' label="平台唯一码">
					<el-input v-model='formItem.GUID_PLATFORM'></el-input>
				</el-form-item>
				<el-form-item prop='GUID_FUNC' label="功能唯一码">
					<el-input v-model='formItem.GUID_FUNC'></el-input>
				</el-form-item>
                <el-form-item prop='XH' label="序号">
					<el-input v-model='formItem.XH'></el-input>
				</el-form-item>
				<el-form-item prop='INTFURL' label="接口地址">
					<el-input v-model='formItem.INTFURL'></el-input>
				</el-form-item>
				<el-form-item prop='REQTYPE' label="请求方式">
					<el-select v-model="formItem.REQTYPE" placeholder="请选择请求方式">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop='DATATYPE' label="报文格式">
					<el-select v-model="formItem.DATATYPE" placeholder="请选择报文格式">
						<el-option
							v-for="item in options1"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
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
import { getUrl, editUrl, deleteUrl } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			options: [
				{ label: 'POST', value: 'POST' },
				{ label: 'GET', value: 'GET' }
			],
			options1: [
				{ label: 'JSON', value: 'JSON' },
				{ label: 'XML', value: 'XML' }
			],
			query: {
				GUID_PLATFORM: '',
                GUID_FUNC: ''
			},
			tableData: [
				{
					GUID_URL:'路由唯一码，字符串' ,GUID_PLATFORM:'平台唯一码，字符串' ,
					GUID_FUNC: '功能唯一码，字符串',
					XH:'显示序号',
					REQTYPE: '请求方式',
					INTFURL: '接口URL地址',
					DATATYPE: '报文格式，JSON \ XML'
				},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
				GUID_URL: '',
                GUID_PLATFORM: '',
                GUID_FUNC: '',
				XH: '',
				REQTYPE: '', // 请求方式，必传，POST \ GET
				INTFURL: '', // 接口URL地址，必传
				DATATYPE: '' // 报文格式，必传，JSON \ XML
			}
		}
	},
	components: { headTop },
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 250
		})
		this.getUrl()
	},
	methods: {
		handleSearch () {
			this.getUrl()
		},
		getUrl () {
			let params = {
				CONDITION: { 
                    GUID_URL: '',
					...this.query
                }
			}
			getUrl(params).then(res => {
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
			this.formItem = {
				GUID_URL: '',
                GUID_PLATFORM: '',
                GUID_FUNC: '',
				XH: '',
				REQTYPE: '', // 请求方式，必传，POST \ GET
				INTFURL: '', // 接口URL地址，必传
				DATATYPE: '' // 报文格式，必传，JSON \ XML
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
			editUrl(params).then(res => {
				if (res.status === 200) {
                    this.getUrl()
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
							GUID_URL: data[index].GUID_URL
						}
					}
					deleteUrl(params).then(res => {
						if (res.status === 200) {
                            this.getUrl()
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
