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
							prop="GUID_FUNC"
							label="功能名称"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="GUID_DATAKIND"
							label="映射类型"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="ISREQPARAM"
							label="参数类型"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="TABLENAME"
							label="表名"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="FIELDNAME"
							label="字段名"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="DEFALUTVALUE"
							label="默认值"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="LOCATIONKEY"
							label="报文KEY路径"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="FIELDTYPE"
							label="字段类型"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="VALUETYPE"
							label="报文数据类型"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="VALUEFORMAT"
							label="值格式"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="GLOBAL_PARAM"
							label="对应全局参数"
							align='center'
                            :show-overflow-tooltip="true">
						</el-table-column>
                        <el-table-column
							prop="BZ"
							label="字段说明"
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
			width="800px"
			append-to-body>
			<el-form :inline="true" :model='formItem' ref='formItem' label-width="130px">
				<el-form-item prop='GUID_PLATFORM' label="平台名称">
					<el-input v-model='formItem.GUID_PLATFORM'></el-input>
				</el-form-item>
                <el-form-item prop='GUID_URL' label="访问路由">
					<el-input v-model='formItem.GUID_URL'></el-input>
				</el-form-item>
                <el-form-item prop='GUID_FUNC' label="功能名称">
					<el-input v-model='formItem.GUID_FUNC'></el-input>
				</el-form-item>
                <el-form-item prop='GUID_DATAKIND' label="映射类型">
					<el-input v-model='formItem.GUID_DATAKIND'></el-input>
				</el-form-item>
                <el-form-item prop='XH' label="序号">
					<el-input v-model='formItem.XH'></el-input>
				</el-form-item>
                <el-form-item prop='ISREQPARAM' label="是否请求参数">
					<el-checkbox v-model="formItem.ISREQPARAM" true-label='1' false-label='0'></el-checkbox>
				</el-form-item>
                <el-form-item prop='TABLENAME' label="临时表表名">
					<el-input v-model='formItem.TABLENAME'></el-input>
				</el-form-item>
                <el-form-item prop='FIELDNAME' label="临时表字段名">
					<el-input v-model='formItem.FIELDNAME'></el-input>
				</el-form-item>
                <el-form-item prop='DEFALUTVALUE' label="默认值">
					<el-input v-model='formItem.DEFALUTVALUE'></el-input>
				</el-form-item>
                <el-form-item prop='LOCATIONKEY' label="数据对应KEY路径">
					<el-input v-model='formItem.LOCATIONKEY'></el-input>
				</el-form-item>
                <el-form-item prop='FIELDTYPE' label="字段类型">
					<el-select v-model="formItem.FIELDTYPE" placeholder="请选择字段类型">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
                <el-form-item prop='VALUETYPE' label="报文数据类型">
                    <el-select v-model="formItem.VALUETYPE" placeholder="请选择报文数据类型">
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
                </el-form-item>
                <el-form-item prop='VALUEFORMAT' label="值格式">
					<el-input v-model='formItem.VALUEFORMAT'></el-input>
				</el-form-item>
                <el-form-item prop='GLOBAL_PARAM' label="匹配全局参数">
					<el-input v-model='formItem.GLOBAL_PARAM'></el-input>
				</el-form-item>
                <el-form-item prop='BZ' label="字段说明">
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
import { getFieldRelations, editFieldRelations, deleteFieldRelations } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			query: { 
                GUID_PLATFORM: '',
                GUID_URL: ''
            },
            options: [
				{ label: '字符串', value: '0' },
				{ label: '整型', value: '1' },
				{ label: '浮点型', value: '2' },
				{ label: '日期型', value: '3' },
				{ label: '布尔型', value: '4' },
				{ label: '系统时间', value: '5' },
				{ label: '字符串截取', value: '6' },
			],
			tableData: [
				{
                    GUID_FIELD: '22222',
					GUID_FUNC: '功能唯一码，字符串',
					PWD_FLAG:'1',
					GUID_DATAKIND: '1',
                    BZ: '备注'
				},
			],
			dialogVisible: false,
			title: '新增',
			formItem: {
                GUID_FIELD: '',
                GUID_PLATFORM: '',
                GUID_URL: '',
                GUID_FUNC: '',
                GUID_DATAKIND: '',
                XH: '',
                BZ: '',
                ISREQPARAM: '1',
                TABLENAME: '',
                FIELDNAME: '',
                DEFALUTVALUE: '',
                LOCATIONKEY: '',
                FIELDTYPE: '',
                VALUETYPE: '',
                VALUEFORMAT: '',
                GLOBAL_PARAM: '',
			}
            /**
  
LOCATIONKEY 数据对应KEY路径，字符串，必传
FIELDTYPE 字段类型，字符串，必传，0字符串、1整型、2浮点型、3日期型、4布尔型、5 系统时间，日期格式写在VALUEFORMAT中、6 字符串截取
VALUETYPE 报文数据类型，字符串，必传，0字符串、1整型、2浮点型、3日期型、4布尔型、5 系统时间，日期格式写在VALUEFORMAT中、6 字符串截取
VALUEFORMAT 值格式，字符串
GLOBAL_PARAM 匹配全局参数，字符串

             */
		}
	},
	components: { headTop },
	mounted () {
		this.$nextTick(() => {
			this.tableHeight = window.innerHeight - 250
		})
		this.getFieldRelations()
	},
	methods: {
		handleSearch () {
			this.getFieldRelations()
		},
		getFieldRelations () {
			let params = {
				CONDITION: { 
                    GUID_FIELD: '',
					...this.query
                }
			}
			getFieldRelations(params).then(res => {
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
				GUID_FIELD: '',
                GUID_PLATFORM: '',
                GUID_URL: '',
                GUID_FUNC: '',
                GUID_DATAKIND: '',
                XH: '',
                BZ: '',
                ISREQPARAM: '1',
                TABLENAME: '',
                FIELDNAME: '',
                DEFALUTVALUE: '',
                LOCATIONKEY: '',
                FIELDTYPE: '',
                VALUETYPE: '',
                VALUEFORMAT: '',
                GLOBAL_PARAM: '',
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
			editFieldRelations(params).then(res => {
				if (res.status === 200) {
                    this.getFieldRelations()
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
							GUID_FIELD: data[index].GUID_FIELD
						}
					}
					deleteFieldRelations(params).then(res => {
						if (res.status === 200) {
                            this.getFieldRelations()
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
