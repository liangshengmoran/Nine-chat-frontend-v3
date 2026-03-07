<template>
	<div class="login">
		<div class="login-container">
			<div class="logo">
				<img src="../assets/logo.gif" />
				<span class="logo-name">小九音乐聊天室</span>
			</div>

			<div class="form">
				<el-form ref="loginForm" :model="form" :rules="rules">
					<el-form-item prop="user_name">
						<el-input v-model="form.user_name" clearable placeholder="您的账户或邮箱" size="default"></el-input>
					</el-form-item>
					<el-form-item prop="user_password">
						<el-input v-model="form.user_password" clearable show-password placeholder="您的账户密码" size="default" @keyup.enter="handleLogin"></el-input>
					</el-form-item>
				</el-form>
			</div>

			<div class="links">
				<a @click="foegetPassword">忘记密码</a>
				<a @click="router.push('/register')">注册账号</a>
			</div>

			<el-button style="width: 100%" type="primary" size="default" @click="handleLogin">登录小九聊天室</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { login } from '@/api/user';

const router = useRouter();
const loginForm = ref(null);

const form = reactive({
	user_name: '',
	user_password: '',
});

const rules = {
	user_name: [
		{ required: true, message: '请输入您的账号', trigger: 'blur' },
		{ min: 1, max: 8, message: '长度在 1 到 16 个字符', trigger: 'blur' },
	],
	user_password: [
		{ required: true, message: '请输入您的账户密码', trigger: 'blur' },
		{ min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' },
	],
};

if (localStorage.user_name) form.user_name = localStorage.user_name;
if (localStorage.user_password) form.user_password = localStorage.user_password;

function handleLogin() {
	loginForm.value.validate(async (valid) => {
		if (!valid) return;
		const { data } = await login(form);
		const { token } = data;
		localStorage.chat_token = token;
		router.push('/');
		const { user_name, user_password } = form;
		localStorage.user_name = user_name;
		localStorage.user_password = user_password;
	});
}

function foegetPassword() {
	ElMessage.warning('都没邮箱验证，你找不回密码洛！');
}
</script>
<style lang="less" scoped>
@media screen and (max-width: 820px) {
  .login-container {
    margin-top: 50px !important;
  }
}
.login {
  background: url("../assets/background.gif");
  height: 100%;
  display: flex;
  justify-content: center;
  &-container {
    margin-top: 100px;
    .logo {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-top: 100px;

      img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
      }

      &-name {
        font-size: 14px;
        color: #fff;
        margin-top: 10px;
      }
    }

    .form {
      margin-top: 50px;
      width: 300px;
    }

    .links {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      cursor: pointer;
      color: #fff;
      margin-bottom: 30px;
    }
  }
}
</style>
