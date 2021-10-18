<template>
	<div class="manage_page fillcontain">
		<el-row style="height: 100%;">
			<el-col :span='24' class="header">
				<div class="collapse-btn">
					<i class="el-icon-s-order"></i>
				</div>
				<div class="logo">预算一体化平台</div>
			</el-col>
	  		<el-col class="sidemenu" :span="4"  style="min-height: 100%; background-color: #324057;">
				<el-menu style="min-height: 100%;" background-color='#324157' text-color="#fff" :default-active="$route.path" router>
                    <el-menu-item v-for="menu in menus" :index="menu.route" :key="menu.route">
                        <i class="el-icon-menu"></i>{{menu.name}}
                    </el-menu-item>
				</el-menu>
			</el-col>
			<el-col :span="20" style="height: 100%;overflow: auto;" class='content-box'>
				<keep-alive>
				  <router-view></router-view>
				</keep-alive>
			</el-col>
		</el-row>
  	</div>
</template>

<script>
    export default {
        data () {
            return {
                menus: [
                    { route: '/platform', name: '平台登记' },
                    { route: '/dwzt', name: '单位账套对照' },
                    { route: '/functions', name: '功能列表' },
                    { route: '/url', name: '访问路由' },
                    { route: '/funcTableRelation', name: '功能与临时表对应关系' },
                    { route: '/cssz', name: '参数设置' },
                    { route: '/default', name: '数据映射默认值' },
                    { route: '/pwdType', name: '加密方式' },
                ]
            }
        },
		computed: {
			defaultActive: function(){
				// return this.$route.path.replace('/', '');
			}
		},
        methods: {
            handleSelect (val, item) {
                console.log(val)
                console.log(item)
                this.$router.push({
                    name: 'login'
                    // params
                })
            }
        }
    }
</script>


<style lang="less" scoped>
	@import '../style/mixin.less';
	.header {
		background-color: #242f42;
		position: relative;
		box-sizing: border-box;
		width: 100%;
		height: 70px;
		font-size: 22px;
		color: #fff;
	}
	.collapse-btn {
		float: left;
		padding: 0 21px;
		cursor: pointer;
		line-height: 70px;
	}
	.header .logo {
		float: left;
		width: 250px;
		line-height: 70px;
	}
</style>
