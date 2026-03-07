import NProgress from 'nprogress';
import router from './router';
import { getToken } from '@/utils/auth';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });
const whiteList = ['/login', '/register'];

router.beforeEach(async (to, from, next) => {
	NProgress.start();
	document.title = '小九的聊天室';
	if (to.path) {
		if (window._hmt) {
			window._hmt.push(['_trackPageview', `/#${to.fullPath}`]);
		}
	}
	const hasToken = getToken();
	if (hasToken) {
		const { useUserStore } = await import('@/stores/user');
		const userStore = useUserStore();
		if (!userStore.user_info) {
			await userStore.getUserInfo();
		}
		next();
	} else if (whiteList.indexOf(to.path) !== -1) {
		next();
	} else {
		next('/login');
		NProgress.done();
	}
});

router.afterEach(() => {
	NProgress.done();
});
