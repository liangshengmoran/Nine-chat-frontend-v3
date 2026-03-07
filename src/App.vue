<template>
	<el-config-provider :locale="zhCn" size="small">
		<div id="app">
			<router-view />
		</div>
	</el-config-provider>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import { useConfigStore } from '@/stores/config';
import { setTheme } from '@/theme';

const router = useRouter();
const configStore = useConfigStore();

const sendMsgFromParentWindow = ref(null);
const ignoreNextMessage = ref(false);

watch(() => configStore.theme, (val) => {
	if (!val || !sendMsgFromParentWindow.value) return;
	ignoreNextMessage.value = true;
	sendMsgFromParentWindow.value({ type: 'theme', data: val === 'default' ? 'light' : 'dark' });
});

function messageHandler(event) {
	const { type } = event.data;
	if (ignoreNextMessage.value) {
		ignoreNextMessage.value = false;
		return;
	}

	if (type === 'theme') {
		const THEME = event.data.data === 'dark' ? 'black' : 'default';
		setTheme(THEME);
	}

	if (type === 'token') {
		localStorage.chat_token = event.data.data;
		router.push('/');
	}

	sendMsgFromParentWindow.value = (message) => {
		event.source.postMessage(message, event.origin);
	};
}

onMounted(() => {
	window.addEventListener('message', messageHandler);
});

onBeforeUnmount(() => {
	window.removeEventListener('message', messageHandler);
});
</script>

<style lang="css">
#app {
  width: 100vw;
  height: 100vh;
}
</style>
