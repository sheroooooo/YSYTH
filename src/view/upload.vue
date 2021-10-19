<template>
    <div>
        <head-top></head-top>
        <div class="content">
			<el-row class='container'>
				<el-col :span='6' class="left-tree">
					<el-tree :data="data" node-key='PARAM_DM' :props="defaultProps" highlight-current=true default-expand-all @node-click="handleNodeClick"></el-tree>
				</el-col>
				<el-col :span='18' class="right-table">
                    <el-upload
                        class="upload"
                        drag
                        action="/dep/Do/queryToExternal"
                        :data='getUploadParams()'
                        :before-upload="beforeAvatarUpload"
                        :on-success="handleSuccess"
                        :on-error="handleError">
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
				</el-col>
			</el-row>
		</div>
    </div>
</template>

<script>
import headTop from '../components/headTop'
import { getPlatform } from '@/api/request/request'

export default {
	data(){
		return {
			defaultProps: {
				label: 'PARAM_DM'
			},
			treeObj: {
				GUID_PLATFORM: ''
			},
            data: [
				{
					PARAM_DM: '所有一体化平台',
					children: [
						{PARAM_DM: '湖南预算一体化平台',GUID_PLATFORM:'123456789'},
						{PARAM_DM: '江西预算一体化平台'},
					]
				}
			],
			uploadParams: {},
            CONDITION: {
                GUID_PLATFORM: '',
                FUNCLIST: {
                    GUID_FUNC: ''
                },
                PARAMLIST: {
                    AGENCY_CODE: '',
                    FISCAL_YEAR: '2021',
                    ACCOUNT_CODE: ''
                }
            }
		}
	},
	components: {
		headTop
	},
	mounted () {
		this.getPlatform()
	},
	methods: {
        getUploadParams () {
            this.uploadParams.CONDITION = JSON.stringify(this.CONDITION)
            return this.uploadParams
        },
		handleNodeClick (val, node) {
			this.treeObj = val
			if (this.treeObj.PARAM_DM === "所有一体化平台") this.treeObj.GUID_PLATFORM = ''
			this.getPlatform()
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
        beforeAvatarUpload () {
            console.log(this.treeObj)
            if (this.treeObj.GUID_PLATFORM === '' || this.treeObj.GUID_PLATFORM === undefined || this.treeObj.GUID_PLATFORM === null) {
                this.$message({
                    message: '请先选择一体化平台',
                    type: 'warning'
                })
                return false
            }
            this.CONDITION.FUNCLIST.GUID_FUNC = this.treeObj.GUID_FUNC
            this.CONDITION.GUID_PLATFORM = this.treeObj.GUID_PLATFORM
            this.uploadParams.CONDITION = JSON.stringify(this.CONDITION)
            return this.uploadParams
        },
        handleSuccess (res) {
            this.$message({
                type: 'success',
                message: '上传成功'
            })
        },
        handleError (err) {
            let myError=err.toString()
            myError=myError.replace("Error: ","")
            myError=JSON.parse(myError)
            this.$message({
                type: 'error',
                message: myError.msg
            })
        },
	}
}
</script>

<style lang="less">
	@import '../style/mixin.less';
    .upload {
        padding-left: 50px;
    }
</style>
