<template>
	<div class="manage_page fillcontain">
		<el-row style="height: 100%;">
	  		<el-col :span="4"  style="min-height: 100%; background-color: #324057;">
				<el-menu style="min-height: 100%;" background-color='#324157' text-color="#fff" :default-active="$route.path" router>
					<!-- <el-menu-item index="manage"><i class="el-icon-menu"></i>首页</el-menu-item> -->
                    <el-menu-item v-for="menu in menus" :index="menu.route" :key="menu.route">
                        <i class="el-icon-menu"></i>{{menu.name}}
                    </el-menu-item>
					<el-submenu index="2">
						<template slot="title"><i class="el-icon-document"></i>平台登记</template>
						<el-menu-item index="userList">用户列表</el-menu-item>
						<el-menu-item index="shopList">商家列表</el-menu-item>
						<el-menu-item index="foodList">食品列表</el-menu-item>
						<el-menu-item index="orderList">订单列表</el-menu-item>
						<el-menu-item index="adminList">管理员列表</el-menu-item>
					</el-submenu>
					<el-submenu index="3">
						<template slot="title"><i class="el-icon-plus"></i>添加数据</template>
						<el-menu-item index="addShop">添加商铺</el-menu-item>
						<el-menu-item index="addGoods">添加商品</el-menu-item>
					</el-submenu>
					<el-submenu index="4">
						<template slot="title"><i class="el-icon-star-on"></i>图表</template>
						<el-menu-item index="visitor">用户分布</el-menu-item>
					</el-submenu>
					<el-submenu index="5">
						<template slot="title"><i class="el-icon-edit"></i>编辑</template>
						<el-menu-item index="vueEdit">文本编辑</el-menu-item>
					</el-submenu>
					<el-submenu index="6">
						<template slot="title"><i class="el-icon-setting"></i>设置</template>
						<el-menu-item index="adminSet">管理员设置</el-menu-item>
					</el-submenu>
					<el-submenu index="7">
						<template slot="title"><i class="el-icon-warning"></i>说明</template>
						<el-menu-item index="explain">说明</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-col>
			<el-col :span="20" style="height: 100%;overflow: auto;">
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
                    { route: '/salary', name: '工资管理' , children:false},
                    { route: '/attendence', name: '考勤管理' , children:false},
                    { route: '/perform', name: '绩效考核', children: [{ route: '/month', name: '月度绩效' }, { route: '/year', name: '年度绩效' }] },
                    { route: '/admin', name: '系统管理' , children:false},
                    { route: '/feedback', name: '意见反馈' , children:false}
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
</style>
