<template>
	<div class="login">
		<div class="login-container">
			<div class="logo">
				<img src="../assets/logo.gif" />
				<span class="logo-name">小九音乐聊天室</span>
			</div>

			<div class="form">
				<el-form ref="registerForm" :model="form" :rules="rules">
					<el-form-item prop="user_name">
						<el-input v-model="form.user_name" clearable placeholder="您的账号" size="default"></el-input>
					</el-form-item>
					<el-form-item prop="user_nick">
						<el-input v-model="form.user_nick" clearable placeholder="您的昵称" size="default"></el-input>
					</el-form-item>
					<el-form-item prop="user_email">
						<el-input v-model="form.user_email" clearable placeholder="您的邮箱" size="default"></el-input>
					</el-form-item>
					<el-form-item prop="user_password">
						<el-input v-model="form.user_password" clearable show-password placeholder="您的账户密码" size="default" @keyup.enter="handleRegister"></el-input>
					</el-form-item>
				</el-form>
			</div>

			<el-button style="width: 100%" type="primary" size="default" @click="handleRegister">注册并登录聊天室</el-button>
			<div class="links">
				<a @click="router.push('/login')">已有账号去登录</a>
			</div>

			<!-- OAuth 第三方登录 -->
			<div v-if="oauthProviders.length" class="oauth-section">
				<div class="oauth-divider">
					<span>或使用第三方账号注册</span>
				</div>
				<div class="oauth-buttons">
					<button
						v-for="p in oauthProviders"
						:key="p.provider"
						class="oauth-btn"
						:class="'oauth-btn--' + p.provider"
						:title="'使用 ' + p.name + ' 注册'"
						@click="handleOAuthLogin(p.provider)"
					>
						<svg v-if="p.provider === 'github'" class="oauth-icon" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
						</svg>
						<svg v-if="p.provider === 'google'" class="oauth-icon" viewBox="0 0 24 24">
							<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
							<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
							<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
							<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
						</svg>
						<span>{{ p.name }}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { register, login } from '@/api/user';
import { getOAuthProviders } from '@/api/oauth';

const router = useRouter();
const registerForm = ref(null);
const oauthProviders = ref([]);

const form = reactive({
	user_name: null,
	user_nick: null,
	user_email: null,
	user_password: null,
});

const rules = {
	user_name: [
		{ required: true, message: '请输入您的账号', trigger: 'blur' },
		{ min: 1, max: 8, message: '长度在1至10个字符', trigger: 'blur' },
	],
	user_nick: [
		{ required: true, message: '请输入您的昵称', trigger: 'blur' },
		{ min: 1, max: 8, message: '长度在1到8个字符', trigger: 'blur' },
	],
	user_email: [
		{ required: true, message: '请输入您的邮箱', trigger: 'blur' },
		{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
	],
	user_password: [
		{ required: true, message: '请输入您的账户密码', trigger: 'blur' },
		{ min: 6, max: 32, message: '长度在6到32个字符', trigger: 'blur' },
	],
};

function handleRegister() {
	registerForm.value.validate(async (valid) => {
		if (!valid) return;
		await register(form);
		ElMessage.success('注册成功，即将登录！');
		setTimeout(async () => {
			const { user_name, user_password } = form;
			const { data } = await login({ user_name, user_password });
			const { token } = data;
			localStorage.chat_token = token;
			router.push('/');
			ElMessage.success('登录成功!');
		}, 1000);
	});
}

function handleOAuthLogin(provider) {
	const apiBase = import.meta.env.VITE_BASE_API || '';
	window.location.href = `${apiBase}/oauth/${provider}`;
}

onMounted(async () => {
	try {
		const res = await getOAuthProviders();
		oauthProviders.value = res.data || res || [];
	} catch {
		// OAuth 未配置时静默忽略
	}
});
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
      justify-content: flex-end;
      font-size: 12px;
      cursor: pointer;
      color: #fff;
      margin-top: 15px;
    }

    .oauth-section {
      margin-top: 24px;

      .oauth-divider {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        &::before,
        &::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.3);
        }

        span {
          padding: 0 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          white-space: nowrap;
        }
      }

      .oauth-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
      }

      .oauth-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 24px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        backdrop-filter: blur(4px);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-1px);
        }

        .oauth-icon {
          width: 20px;
          height: 20px;
        }

        &--github:hover {
          border-color: #fff;
        }

        &--google:hover {
          border-color: #4285f4;
        }
      }
    }
  }
}
</style>

