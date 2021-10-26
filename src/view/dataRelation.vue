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
						<el-tree :data="data1" node-key='KINDNAME' :props="defaultProps1" default-expand-all @node-click="handleNodeClick"></el-tree>
					</div>
				</el-col>
				<el-col :span='18' class="right-table">
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
						<el-table-column
							prop="GUID_DATA_RELATION"
							label="平台名称"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="GUID_DEFAULT"
							label="映射类型名称"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="DATA_PLATFORM"
							label="平台值"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="DATA_SELF"
							label="产品值"
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
				<el-form-item prop='GUID_DATA_RELATION' label="平台标识">
					<el-input v-model='formItem.GUID_DATA_RELATION'></el-input>
				</el-form-item>
                <el-form-item prop='GUID_DEFAULT' label="数据映射关系">
					<el-input v-model='formItem.GUID_DEFAULT'></el-input>
				</el-form-item>
                <el-form-item prop='DATA_PLATFORM' label="平台值">
					<el-input v-model='formItem.DATA_PLATFORM'></el-input>
				</el-form-item>
				<el-form-item prop='DATA_SELF' label="产品值">
					<el-input v-model='formItem.DATA_SELF'></el-input>
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
import { getPlatform, getKind, getDataRelation, editDataRelation, deleteDataRelation } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			defaultProps: {
				label: 'PLATNAME'
			},
            defaultProps1: {
				label: 'KINDNAME'
			},
			treeObj: {
				GUID_PLATFORM: ''
			},
			data: [
				{
					PLATNAME: '所有一体化平台',
					children: [
						{PLATNAME: '湖南预算一体化平台'},
						{PLATNAME: '江西预算一体化平台'},
					]
				}
			],
            data1: [
                {
					KINDNAME: '所有映射类型',
					children: [
						{KINDNAME: '映射类型1'},
						{KINDNAME: '映射类型2'},
					]
				}
            ],
			tableData: [
				{GUID_PLATFORM: '1111111', GUID_DATA_RELATION: '湖南预算一体化平台',BZ: '45555', ISENABLED: '1'},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
				GUID_DATA_RELATION: '',
				GUID_DEFAULT: '',
				DATA_PLATFORM: '',
				DATA_SELF: ''
			}
		}
	},
	components: {
		headTop
	},
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 166
		})
		this.getPlatform()
		this.getKind()
	},
	methods: {
		handleNodeClick (val, node) {
			this.treeObj = val
			if (PLATNAME === "所有一体化平台") this.treeObj.GUID_PLATFORM = ''
		},
		getPlatform () {
			let params = {
				CONDITION: { GUID_PLATFORM: this.treeObj.GUID_PLATFORM }
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
        getKind () {
			let params = {
				CONDITION: { GUID_PLATFORM: this.treeObj.GUID_PLATFORM }
			}
			getKind(params).then(res => {
				if (res.status === 200) {
					this.data1[0].children = res.data
				} else {
					this.$message({
						type: 'error',
						message: res.message
					})
				}
			})
		},
        getDataRelation () {
            let params = {
				CONDITION: { GUID_PLATFORM: this.treeObj.GUID_PLATFORM }
			}
			getDataRelation(params).then(res => {
				if (res.status === 200) {
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
				GUID_DATA_RELATION: '',
				GUID_DEFAULT: '',
				DATA_PLATFORM: '',
				DATA_SELF: ''
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
			editDataRelation(params).then(res => {
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
							GUID_DATA_RELATION: data[index].GUID_DATA_RELATION
						}
					}
					deleteDataRelation(params).then(res => {
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
