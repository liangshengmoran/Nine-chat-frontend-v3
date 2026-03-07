import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@/views/Chat/index.vue'),
	},
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/login.vue'),
	},
	{
		path: '/register',
		name: 'Register',
		component: () => import('@/views/register.vue'),
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
