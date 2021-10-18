<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='24' class="right-table">
					<div class="handle-box">
						平台名称 :&nbsp;&nbsp;&nbsp;<el-input v-model="query.GUID_PLATFORM" class="handle-input mr10"></el-input>
						访问路由 :&nbsp;&nbsp;&nbsp;<el-input v-model="query.GUID_URL" class="handle-input mr10"></el-input>
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
							prop="GUID_PLATFORM"
							label="平台名称"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							prop="GUID_URL"
							label="访问路由"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="PWD_NAME"
							label="加\解密方式"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="IS_PWD"
							label="启用"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="BZ"
							label="备注"
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
				<el-form-item prop='PWD_NAME' label="平台名称">
					<el-input v-model='formItem.PWD_NAME'></el-input>
				</el-form-item>
                <el-form-item prop='PWD_FLAG' label="加密方式标识">
					<el-input v-model='formItem.PWD_FLAG'></el-input>
				</el-form-item>
                <el-form-item prop='IS_PWD' label="加密方式">
                    <el-select v-model="formItem.IS_PWD" placeholder="请选择加密方式">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
                </el-form-item>
                <el-form-item prop='BZ' label="备注">
					<el-input type='textarea' v-model='formItem.BZ' rows='4'></el-input>
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
import { getPwdType, editPwdType, deletePwdType } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			query: { 
                GUID_PLATFORM: '',
                GUID_URL: ''
            },
            options: [
				{ label: '解密', value: '0' },
				{ label: '加密', value: '1' }
			],
			tableData: [
				{
                    GUID_PWDTYPE: '22222',
					PWD_NAME: '功能唯一码，字符串',
					PWD_FLAG:'1',
					IS_PWD: '1',
                    BZ: '备注'
				},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
                GUID_PWDTYPE: '',
                PWD_NAME: '',
                PWD_FLAG: '',
                IS_PWD: '',
                BZ: ''
			}
		}
	},
	components: { headTop },
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 250
		})
		this.getPwdType()
	},
	methods: {
		handleSearch () {
			this.getPwdType()
		},
		getPwdType () {
			let params = {
				CONDITION: { 
                    GUID_PWDTYPE: '',
					...this.query
                }
			}
			getPwdType(params).then(res => {
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
				GUID_PWDTYPE: '',
                PWD_NAME: '',
                PWD_FLAG: '',
                IS_PWD: '',
                BZ: ''
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
			editPwdType(params).then(res => {
				if (res.status === 200) {
                    this.getPwdType()
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
							GUID_PWDTYPE: data[index].GUID_PWDTYPE
						}
					}
					deletePwdType(params).then(res => {
						if (res.status === 200) {
                            this.getPwdType()
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
