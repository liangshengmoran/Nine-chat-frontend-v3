import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { getToken } from '@/utils/auth';

const service = axios.create({
	baseURL: import.meta.env.VITE_BASE_API,
	timeout: 5000,
});

service.interceptors.request.use(
	config => {
		if (getToken()) {
			config.headers.Authorization = getToken();
		}
		return config;
	},
	error => Promise.reject(error)
);

service.interceptors.response.use(
	response => {
		const res = response.data;
		if (![200, 201].includes(response.status)) {
			return Promise.reject(new Error(res.message || 'Error'));
		}
		return res;
	},
	error => {
		if (error.message === 'timeout of 5000ms exceeded') {
			ElMessage.error('请求超时，请检查您的网络状态或重新请求！');
		}
		const { status, data } = error.response;
		const { code, message } = data;
		if (status === 500) {
			const userStore = useUserStore();
			userStore.logout();
			return;
		}
		if (code === 401) {
			ElMessage.error('身份信息校验失败、请重新登录');
			const userStore = useUserStore();
			userStore.logout();
		} else if (status === 400) {
			ElMessage.warning(message);
		} else {
			ElMessage.error(message);
		}
		return Promise.reject(error);
	}
);

export default service;
