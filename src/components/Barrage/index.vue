<template>
	<div ref="containerRef" class="barrage">
		<div class="barrage-tracks" :style="{ height: '400px' }">
			<div v-for="item in activeItems" :key="item._key" class="barrage-item" :style="item.style">
				<div v-if="item.message_type === 'text'" :class="[{ mine: item.user_id === userStore.mine_id }, 'barrage-wapper']">
					<img v-if="item?.user_info?.user_avatar && configStore.showBarrageAvatar" :src="item.user_info.user_avatar" class="barrage-avatar" alt="" />
					<span v-html="replaceEmotionText(item.message_content)"></span>
				</div>
				<img v-if="item.message_type === 'png' && configStore.showBarrageImg" class="barrage-img" :src="item.message_content.url" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import { useConfigStore } from '@/stores/config';
import { history } from '@/api/chat';
import { replaceEmotionText } from '@/components/Emotion/emotion.js';

const props = defineProps({
	newMsg: { type: [Object, String, Number], default: () => ({}) },
});

const userStore = useUserStore();
const roomStore = useRoomStore();
const configStore = useConfigStore();
const containerRef = ref(null);
const activeItems = ref([]);
let keyCounter = 0;
let loopBarrage = false;
const params = { page: 1, pagesize: 10 };

function addBarrageItem(data) {
	if (!data || typeof data !== 'object' || !data.message_type) return;
	const track = Math.floor(Math.random() * 8);
	const speed = 15 + Math.random() * 10;
	const item = {
		...data,
		_key: `barrage_${keyCounter++}`,
		style: {
			top: `${track * 50}px`,
			animationDuration: `${speed}s`,
		},
	};
	activeItems.value.push(item);
	setTimeout(() => {
		const idx = activeItems.value.findIndex(i => i._key === item._key);
		if (idx !== -1) activeItems.value.splice(idx, 1);
	}, speed * 1000);
}

watch(() => props.newMsg, (n) => {
	if (n && typeof n === 'object' && n.message_type) {
		addBarrageItem(n);
	}
});

async function queryMsg() {
	if (!loopBarrage) return;
	try {
		const res = await history({ room_id: roomStore.room_id, ...params });
		const data = res.data || [];
		data.forEach(item => addBarrageItem(item));
		params.page = data.length < params.pagesize ? 1 : ++params.page;
		setTimeout(() => {
			if (data.length) queryMsg();
		}, 3500);
	} catch (e) { /* ignore */ }
}

watch(() => configStore.showHistoryBarrageInfo, (n) => {
	loopBarrage = n;
	if (n) queryMsg();
}, { immediate: true });

onBeforeUnmount(() => {
	loopBarrage = false;
});
</script>

<style lang="less" scoped>
.barrage {
	position: relative;
	overflow: hidden;
	pointer-events: none;
}
.barrage-tracks {
	position: relative;
	overflow: hidden;
}
.barrage-item {
	position: absolute;
	white-space: nowrap;
	left: 100%;
	animation: barrageScroll linear forwards;
	pointer-events: auto;
	color: #fff;
	font-size: 14px;
}
@keyframes barrageScroll {
	from { transform: translateX(0); }
	to { transform: translateX(calc(-100vw - 100%)); }
}
.barrage-img {
	width: 60px;
	max-height: 50px;
}
.barrage-wapper {
	display: flex;
	align-items: center;
}
.barrage-avatar {
	height: 30px;
	width: 30px;
	border-radius: 50px;
	margin-right: 10px;
}
.mine {
	border: 1px solid rgb(30, 162, 147);
	padding: 5px;
	border-radius: 5px;
}
</style>
