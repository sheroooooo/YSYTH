<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='6' class="left-tree">
					<el-tree :data="data" node-key='GUID_FUNC' :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
				</el-col>
				<el-col :span='18' class="right-table">
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
						<el-table-column
							prop="GUID_FUNC"
							label="功能标识"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="MODULECODE"
							label="模块标识"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="MODULENAME"
							label="模块名称"
							width="180"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
						<el-table-column
							prop="FUNCNAME"
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
							prop="ISENABLED"
							label="是否启用"
							width="180"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="BZ"
							label="备注"
							width="180"
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
				<el-form-item prop='GUID_FUNC' label="功能标识">
					<el-input v-model='formItem.GUID_FUNC' :disabled="true"></el-input>
				</el-form-item>
                <el-form-item prop='MODULECODE' label="模块标识">
					<el-input v-model='formItem.MODULECODE'></el-input>
				</el-form-item>
				<el-form-item prop='MODULENAME' label="模块名称">
					<el-input v-model='formItem.MODULENAME'></el-input>
				</el-form-item>
                <el-form-item prop='FUNCNAME' label="功能名称">
					<el-input v-model='formItem.FUNCNAME'></el-input>
				</el-form-item>
                <el-form-item prop='XH' label="序号">
					<el-input v-model='formItem.XH'></el-input>
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
import { getFunctions, editFunctions, deleteFunctions } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			defaultProps: {
				label: 'FUNCNAME'
			},
			treeObj: {
				GUID_FUNC: '',
                MODULECODE: ''
			},
			data: [
				{
					FUNCNAME: '所有功能列表',
					children: [
						{FUNCNAME: '湖南预算功能列表', GUID_FUNC: '1', MODULECODE: '2',},
						{FUNCNAME: '江西预算功能列表'},
					]
				}
			],
			tableData: [
				{GUID_FUNC: '1111111',MODULECODE:'q',MODULENAME: 'e', FUNCNAME: '湖南预算功能列表',XH: 1,BZ: '45555', ISENABLED: '1'},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
				GUID_FUNC: '',
                MODULECODE: '',
                MODULENAME: '',
				FUNCNAME: '',
				XH: '',
				BZ: '',
				ISENABLED: '1',
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
		this.getFunctions()
	},
	methods: {
		handleNodeClick (val, node) {
			this.treeObj = val
			if (this.treeObj.FUNCNAME === "所有功能列表"){
                this.treeObj.GUID_FUNC = ''
                this.treeObj.MODULECODE = ''
            }
            this.getFunctions()
		},
		getFunctions () {
			let params = {
				CONDITION: { 
                    GUID_FUNC: this.treeObj.GUID_FUNC,
                    MODULECODE: this.treeObj.MODULECODE
                }
			}
			getFunctions(params).then(res => {
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
				GUID_FUNC: '',
                MODULECODE: '',
                MODULENAME: '',
				FUNCNAME: '',
				XH: '',
				BZ: '',
				ISENABLED: '1',
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
			editFunctions(params).then(res => {
				if (res.status === 200) {
                    this.getFunctions()
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
							GUID_FUNC: data[index].GUID_FUNC
						}
					}
					deleteFunctions(params).then(res => {
						if (res.status === 200) {
                            this.getFunctions()
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
