<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='24' class="right-table">
					<el-table
						:data="tableData"
						border
						style="width: 100%"
						:height='tableHeight'>
                        <el-table-column
							prop="GUID_PLATFORM"
							label="平台标识"
							align='center'>
						</el-table-column>
						<el-table-column
							prop="PLATNAME"
							label="平台名称"
							align='center'>
						</el-table-column>
						<el-table-column
							fixed="right"
							label="操作"
							width="180"
							align='center'>
							<template slot-scope="scope">
								<el-button
									@click.native.prevent="download(scope.$index, tableData)"
									type="text"
									size="small">
									下载
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-col>
			</el-row>
		</div>
    </div>
</template>

<script>
import clonedeep from 'clonedeep'
import headTop from '../components/headTop'
import { getPlatform, queryFromExternal } from '@/api/request/request'

export default {
	data(){
		return {
			tableHeight: 100,
			query: { 
                GUID_PLATFORM: '',
                GUID_URL: ''
            },
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
		this.getPlatform()
	},
	methods: {
		getPlatform () {
			let params = {
				CONDITION: { GUID_PLATFORM: this.treeObj.GUID_PLATFORM }
			}
			getPlatform(params).then(res => {
				if (res.status === 200) {
					this.tableData = res.data
				} else {
					this.$message({
						type: 'error',
						message: res.message
					})
				}
			})
		},
		download (index, row) {
			let data = clonedeep(row[index])
			let params = {
                CONDITION: {
                    GUID_PLATFORM: data.GUID_PLATFORM,
                    FUNCLIST: {
                        GUID_FUNC: data.GUID_FUNC
                    },
                    PARAMLIST: {
                        AGENCY_CODE: '',
                        FISCAL_YEAR: '2021',
                        ACCOUNT_CODE: ''
                    }
                }
            }
            queryFromExternal(params).then(
                res => {
                    let content = res
                    let blob = new Blob([content])
                    let fileName = file.fjmc
                    if ('download' in document.createElement('a')) { // 非IE下载
                        const elink = document.createElement('a')
                        elink.download = fileName
                        elink.style.display = 'none'
                        elink.href = URL.createObjectURL(blob)
                        document.body.appendChild(elink)
                        elink.click()
                        URL.revokeObjectURL(elink.href) // 释放URL 对象
                        document.body.removeChild(elink)
                    } else { // IE10+下载
                        navigator.msSaveBlob(blob, fileName)
                    }
                }
            ).catch(() => {
                _this.$message({
                    type: 'error',
                    message: '下载附件失败，请联系管理员'
                })
            })
		}
	}
}
</script>

<style lang="less">
	@import '../style/mixin.less';
</style>
