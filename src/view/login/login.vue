<template>
    <div class='login_page fillcontain'>
      <transition name='form-fade' mode='in-out'>
        <section class='form_contianer'>
          <div class='manage_tip'>
            <p>预算一体化平台</p>
          </div>
          <el-form :model='loginForm' :rules='rules' ref='loginForm' label-position="right" label-width="100px">
            <el-form-item prop='username' label="用户名">
              <el-input v-model='loginForm.username'
                ></el-input>
            </el-form-item>
            <el-form-item prop='password' label='密码'>
              <el-input
                type='password'
                v-model='loginForm.password'
              ></el-input>
            </el-form-item>
			<el-form-item prop='date' label='业务日期'>
              <el-date-picker
				v-model="loginForm.date"
				type="date"
				format="yyyy-MM-dd"
				value-format="yyyy-MM-dd">
			  </el-date-picker>
            </el-form-item>
			<el-form-item prop='code' label="验证码">
              <el-input v-model='loginForm.code'
                ></el-input>
			  <el-button
                type='primary'
                @click="createdCode"
                 class="checkcode"
                >{{checkCode}}</el-button
              >
            </el-form-item>
            <el-form-item>
              <el-button
                type='primary'
                @click="submitForm('loginForm')"
                class='submit_btn'
                >登录</el-button
              >
            </el-form-item>
          </el-form>
        </section>
      </transition>
    </div>
</template>
<script>
import { login } from '@/api/user'
import { setToken } from '@/libs/util'
export default {
  data () {
    return {
      loginForm: {
        username: '18832126308',
        password: '1',
        date: (new Date()).Format('yyyy-MM-dd'),
        code: ''
      },
	  checkCode: '',
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        date: [{ required: true, message: '请选择业务日期', trigger: 'blur' }],
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    }
  },
  created () {
    this.createdCode()
  },
  methods: {
	createdCode () {
      // 先清空验证码输入
      this.code = ''
      this.checkCode = ''
      // this.verification = ""
      // 验证码长度
      const codeLength = 4
      // 随机数
      const random = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      for (let i = 0; i < codeLength; i++) {
        // 取得随机数的索引(0~35)
        let index = Math.floor(Math.random() * 36)
        // 根据索引取得随机数加到code上
        this.code += random[index]
      }
      // 把code值赋给验证码
      this.checkCode = this.code
    },
    async submitForm (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          if (this.checkCode.toLowerCase() !== this.loginForm.code.toLowerCase()) return this.$message({
            message: '验证码不正确，请重新输入！',
            type: 'warning'
          })
          setToken('123456789')
          this.$router.push({ name: 'home' })
          return
          const res = await login({
            userName: this.loginForm.username,
            password: this.loginForm.password
          })
          if (res.status === 200) {
            this.$message({
              type: 'success',
              message: '登录成功'
            })
            setToken('111')
            this.$router.push({ name: 'home' })
          } else {
            this.$message({
              type: 'error',
              message: res.msg
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
	@import '../../style/mixin.less';
	.login_page{
		background-color: #324057;
	}
	.manage_tip{
		position: absolute;
		width: 100%;
		top: -100px;
		left: 0;
		p{
			font-size: 34px;
			color: #fff;
		}
	}
	.form_contianer{
		width: 350px;
		height: 290px;
		position: absolute;
		top: 50%;
		left: 50%;
		margin-left: -200px;
		margin-top: -145px;
		padding: 25px;
		border-radius: 5px;
		text-align: center;
		background-color: #fff;
		.submit_btn{
			width: 100%;
			font-size: 16px
		}
	}
	.tip{
		font-size: 12px;
		color: red
	}
	.form-fade-enter-active, .form-fade-leave-active {
		transition: all 1s
	}
	.form-fade-enter, .form-fade-leave-active {
		transform: translate3d(0, -50px, 0);
		opacity: 0
	}
	.checkcode {
		color: #515a6e;
		position: absolute;
		top: 4px;
		right: 3px;
		z-index: 10;
		width: 90px;
		height: 34px;
		border: none;
		border-radius: 0px;
		background: rgb(231, 198, 227);
		font-size: 16px;
		line-height: 34px;
		padding: 0px
	}
</style>
