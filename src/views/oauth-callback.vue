<template>
	<div class="oauth-callback">
		<div class="oauth-callback-container">
			<div class="logo">
				<img src="../assets/logo.gif" />
			</div>

			<div v-if="loading" class="status">
				<el-icon class="loading-icon"><Loading /></el-icon>
				<span>正在登录中...</span>
			</div>

			<div v-else-if="error" class="status error">
				<el-icon><CircleCloseFilled /></el-icon>
				<span>{{ errorMsg }}</span>
				<el-button type="primary" size="default" @click="router.push('/login')">返回登录</el-button>
			</div>

			<div v-else class="status success">
				<el-icon><CircleCheckFilled /></el-icon>
				<span>登录成功，正在跳转...</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref(false);
const errorMsg = ref('');

onMounted(() => {
	const token = route.query.token;
	const errorParam = route.query.error;
	const isNewUser = route.query.new_user;

	if (errorParam) {
		loading.value = false;
		error.value = true;
		errorMsg.value = decodeURIComponent(errorParam) || 'OAuth 登录失败';
		ElMessage.error(errorMsg.value);
		return;
	}

	if (token) {
		loading.value = false;
		localStorage.chat_token = token;

		if (isNewUser) {
			ElMessage.success('账号已自动创建，欢迎加入！');
		} else {
			ElMessage.success('登录成功！');
		}

		setTimeout(() => {
			router.push('/');
		}, 500);
	} else {
		loading.value = false;
		error.value = true;
		errorMsg.value = '未获取到登录凭证';
		ElMessage.error(errorMsg.value);
	}
});
</script>

<style lang="less" scoped>
.oauth-callback {
	background: url("../assets/background.gif");
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;

	&-container {
		text-align: center;

		.logo {
			margin-bottom: 40px;

			img {
				width: 80px;
				height: 80px;
				border-radius: 8px;
			}
		}

		.status {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16px;
			color: #fff;
			font-size: 16px;

			.el-icon {
				font-size: 48px;
			}

			.loading-icon {
				animation: spin 1s linear infinite;
				color: #409eff;
			}

			&.error .el-icon {
				color: #f56c6c;
			}

			&.success .el-icon {
				color: #67c23a;
			}

			.el-button {
				margin-top: 10px;
			}
		}
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
</style>
