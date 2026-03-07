import { createApp } from 'vue';
import { createPinia } from 'pinia';
// 按需引入 Element Plus 命令式组件的样式（unplugin 无法自动检测 JS API 调用）
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import App from './App.vue';
import router from './router';
import './assets/css/index.less';
import './icons/index';
import './permission';
import './theme/global.less';
import Icon from '@/components/SvgIcon/index.vue';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.component('Icon', Icon);
app.mount('#app');
