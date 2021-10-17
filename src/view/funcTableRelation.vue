<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='6' class="left-tree">
					<el-tree :data="data" node-key='PLATNAME' :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
				</el-col>
				<el-col :span='18' class="right-table">
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
						<el-table-column
							prop="GUID_PLATFORM"
							label="平台标识"
							width="180"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="PLATNAME"
							label="平台名称"
							width="180"
							align='center'>
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
				<el-form-item prop='GUID_PLATFORM' label="平台标识">
					<el-input v-model='formItem.GUID_PLATFORM' :disabled="true"></el-input>
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
import { getPlatform, editPlatform, deletePlatform } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			defaultProps: {
				label: 'PLATNAME'
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
			tableData: [
				{GUID_PLATFORM: '1111111', PLATNAME: '湖南预算一体化平台',BZ: '45555', ISENABLED: '1'},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
				GUID_PLATFORM: '',
				PLATNAME: '',
				BZ: '',
				ISENABLED: '1'
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
				GUID_PLATFORM: '',
				PLATNAME: '',
				BZ: '',
				ISENABLED: '1'
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
			editPlatform(params).then(res => {
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
							GUID_PLATFORM: data[index].GUID_PLATFORM
						}
					}
					deletePlatform(params).then(res => {
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

<style lang="less">
	@import '../style/mixin.less';
</style>
