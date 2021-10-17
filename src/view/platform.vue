<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='6' class="left-tree">
					<el-tree :data="data" :props="defaultProps" default-expand-all @node-click="handleNodeClick"></el-tree>
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
			width="30%"
			append-to-body>
			
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
    </div>
</template>

<script>
	import headTop from '../components/headTop'
    export default {
    	data(){
    		return {
				tableHeight: 100,
				defaultProps: {
					label: 'PLATNAME'
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
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
					{PLATNAME: '湖南预算一体化平台'},
				],
				dialogVisible: false,
				title: '新增'
			}
    	},
    	components: {
    		headTop
    	},
    	mounted () {
			this.$nextTick(() => {
				this.tableHeight = window.innerHeight - 166
			})
    	},
    	methods: {
    		handleNodeClick (val, node) {
				console.log(val)
				console.log(node)
				console.log(item)
			},
			addRow (index, data) {
				console.log(index)
				console.log(data)
				this.dialogVisible = true
			},
			updateRow (index, data) {

			},
			deleteRow (index, data) {

			}
    	}
    }
</script>

<style lang="less">
	@import '../style/mixin.less';
</style>
