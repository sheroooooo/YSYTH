<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='6' class="left-tree">
					<el-tree :data="data" node-key='KINDNAME' :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
				</el-col>
				<el-col :span='18' class="right-table">
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
						<el-table-column
							prop="GUID_DATAKIND"
							label="平台标识"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="KINDNAME"
							label="映射类型名称"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="KINDTYPE"
							label="数据映射类型"
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
				<el-form-item prop='GUID_DATAKIND' label="平台标识">
					<el-input v-model='formItem.GUID_DATAKIND' :disabled="true"></el-input>
				</el-form-item>
				<el-form-item prop='KINDNAME' label="参数代码">
					<el-input v-model='formItem.KINDNAME'></el-input>
				</el-form-item>
                <el-form-item prop='KINDTYPE' label="参数名称">
					<el-input v-model='formItem.KINDTYPE'></el-input>
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
import { getKind, editKind, deleteKind } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			defaultProps: {
				label: 'KINDNAME'
			},
			treeObj: {
				GUID_DATAKIND: ''
			},
			data: [
				{
					KINDNAME: '所有一体化平台',
					children: [
						{KINDNAME: '湖南预算一体化平台'},
						{KINDNAME: '江西预算一体化平台'},
					]
				}
			],
			tableData: [
				{GUID_DATAKIND: '1111111', KINDNAME: '湖南预算一体化平台', KINDTYPE: '1'},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
				GUID_DATAKIND: '',
				KINDNAME: '',
                KINDTYPE: ''
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
		this.getKind()
	},
	methods: {
		handleNodeClick (val, node) {
			this.treeObj = val
			if (this.treeObj.KINDNAME === "所有一体化平台") this.treeObj.GUID_DATAKIND = ''
			this.getKind()
		},
		getKind () {
			let params = {
				CONDITION: { GUID_DATAKIND: this.treeObj.GUID_DATAKIND }
			}
			getKind(params).then(res => {
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
				GUID_DATAKIND: '',
				KINDNAME: '',
                KINDTYPE: ''
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
			editKind(params).then(res => {
				if (res.status === 200) {
					this.getKind()
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
							GUID_DATAKIND: data[index].GUID_DATAKIND
						}
					}
					deleteKind(params).then(res => {
						if (res.status === 200) {
							this.getKind()
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
