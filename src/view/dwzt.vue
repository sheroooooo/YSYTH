<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='6' class="tree">
					<div class="left-tree">
						<el-tree :data="data" node-key='PLATNAME' :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
					</div>
					<div class="left-tree">
						<el-tree :data="data1" node-key='FIRM_NAME' :props="defaultProps1" default-expand-all @node-click="handleNodeClick1"></el-tree>
					</div>
				</el-col>
				<el-col :span='18' class="right-table">
					<el-button size="medium" type="primary" class='gnButton'>新增</el-button>
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
						<el-table-column prop="GUID_PLATFORM" label="平台唯一码" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="APP_ID" label="平台标识" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="GUID_DWZT" label="账套标识" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="AGENCY_CODE" label="平台单位代码" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FIRM_CODE" label="本级单位代码" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="AGENCY_NAME" label="平台单位名称" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FIRM_NAME" label="本级单位名称" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FISCAL_YEAR" label="平台年度" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FIRM_YEAR" label="本级年度" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="ACCOUNT_CODE" label="平台账套号" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FIRM_CODE" label="本级账套号" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="ACCOUNT_NAME" label="平台账套名称" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FIRM_NAME" label="本级账套名称" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="FIRM_NAME" label="本级账套名称" width="180" align='center'>
						</el-table-column>
						<el-table-column prop="CHECK_CODE" label="平台检查码" width="180" align='center'>
						</el-table-column>
						<el-table-column
							prop="ISENABLED"
							label="是否启用"
							width="180"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="BZ"
							label="备注"
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
				<el-form-item prop='GUID_DWZT' label="平台标识">
					<el-input v-model='formItem.GUID_DWZT' :disabled="true"></el-input>
				</el-form-item>
				<el-form-item prop='PLATNAME' label="平台名称">
					<el-input v-model='formItem.PLATNAME'></el-input>
				</el-form-item>
				<el-form-item prop='BZ' label="备注">
					<el-input type='textarea' v-model='formItem.BZ' rows='4'></el-input>
				</el-form-item>
				<el-form-item prop='ISENABLED' label="是否启用">
					<el-checkbox v-model="formItem.ISENABLED" true-label='1' false-label='0'></el-checkbox>
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
import { getPlatform, getDwzts, editDwzts, deleteDwzts } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			defaultProps: {
				label: 'PLATNAME'
			},
			defaultProps1: {
				label: 'FIRM_NAME'
			},
			treeObj: {
				GUID_PLATFORM: ''
			},
			treeObj1: {
				GUID_DWZT: ''
			},
			data: [
				{
					PLATNAME: '所有一体化平台',
					children: [
						{PLATNAME: '湖南预算一体化平台',GUID_PLATFORM: '111'},
						{PLATNAME: '江西预算一体化平台'},
					]
				}
			],
			data1: [
                {
					FIRM_NAME: '所有单位账套对照',
					children: [
						{FIRM_NAME: '单位1',GUID_DWZT:'222'},
						{FIRM_NAME: '单位2'},
					]
				}
            ],
			tableData: [
				{
					GUID_DWZT:'单位账套唯一码，字符串',
					GUID_PLATFORM:'平台唯一码，字符串',
					FIRM_CODE:'单位代码，字符串',
					FIRM_NAME:'单位名称，字符串',
					FIRM_YEAR:'单位年度，字符串',
					FIRM_ACCOUNT:'单位账套号，字符串',
					FIRM_ACCOUNT_NAME:'单位账套名称，字符串',
					AGENCY_CODE:'平台单位代码，字符串',
					AGENCY_NAME:'平台单位名称，字符串',
					FISCAL_YEAR:'平台年度，字符串',
					ACCOUNT_CODE:'平台账套号，字符串',
					ACCOUNT_NAME:'平台账套名称，字符串',
					APP_ID:'平台标识码，字符串',
					CHECK_CODE:'平台检查码，字符串',
					BZ:'备注，字符串',
					ISENABLED:'是否启用，字符串，1启用 0禁用',
				},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
				GUID_DWZT:'',
				GUID_PLATFORM:'',
				FIRM_CODE:'',
				FIRM_NAME:'',
				FIRM_YEAR:'',
				FIRM_ACCOUNT:'',
				FIRM_ACCOUNT_NAME:'',
				AGENCY_CODE:'',
				AGENCY_NAME:'',
				FISCAL_YEAR:'',
				ACCOUNT_CODE:'',
				ACCOUNT_NAME:'',
				APP_ID:'',
				CHECK_CODE:'',
				BZ:'',
				ISENABLED:'1'
			}
		}
	},
	components: {
		headTop
	},
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 206
		})
		this.getDwzts()
		this.getPlatform()
	},
	methods: {
		handleNodeClick (val) {
			this.treeObj = val
			if (val.PLATNAME === "所有一体化平台") this.treeObj.GUID_PLATFORM = ''
			this.getDwzts()
		},
		handleNodeClick1 (val) {
			this.treeObj1 = val
			if (val.PLATNAME === "所有单位账套对照") this.treeObj.GUID_DWZT = ''
			this.getDwzts()
		},
		getPlatform () {
			let params = {
				CONDITION: { GUID_PLATFORM: '' }
			}
			getPlatform(params).then(res => {
				if (res.status === 200) {
					this.data[0].children = res.data
				} else {
					this.$message({
						type: 'error',
						message: res.message
					})
				}
			})
		},
		getDwzts () {
			let params = {
				CONDITION: { 
					GUID_DWZT: this.treeObj1.GUID_DWZT,
					GUID_PLATFORM: this.treeObj.GUID_PLATFORM,
				}
			}
			getDwzts(params).then(res => {
				if (res.status === 200) {
					this.tableData = res.data
					this.data1[0].children = res.data
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
				GUID_DWZT:'',
				GUID_PLATFORM:'',
				FIRM_CODE:'',
				FIRM_NAME:'',
				FIRM_YEAR:'',
				FIRM_ACCOUNT:'',
				FIRM_ACCOUNT_NAME:'',
				AGENCY_CODE:'',
				AGENCY_NAME:'',
				FISCAL_YEAR:'',
				ACCOUNT_CODE:'',
				ACCOUNT_NAME:'',
				APP_ID:'',
				CHECK_CODE:'',
				BZ:'',
				ISENABLED:'1'
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
			let params = {
				DATA: clonedeep(this.formItem)
			}
			editDwzts(params).then(res => {
				if (res.status === 200) {
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
							GUID_DWZT: data[index].GUID_DWZT
						}
					}
					deleteDwzts(params).then(res => {
						if (res.status === 200) {
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

<style lang="less" scoped>
	@import '../style/mixin.less';
	.tree {
		height: 100%;
	}
	.left-tree {
		height: 48%;
		margin-bottom: 10px;
	}
</style>
