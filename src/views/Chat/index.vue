<template>
	<div class="chat" :style="backgroundImage && { backgroundImage: `url(${room_bg})` }">
		<transition name="message-panel" mode="out-in">
			<div v-if="showChatPanle" class="chat-container" :class="{full_screen: configStore.is_screen}">
				<div class="chat-container-header">
					<chat-header ref="header" />
				</div>
				<div class="chat-container-content">
					<message-panel :stop-loadmore="stopLoadmore" @load-history-message="handlerLoadHistoryMessage" @quote-message="handlerQuoteMessage" />
					<transition name="msg-tips" mode="out-in">
						<div v-if="messageStore.un_read_msg_num" class="un-read" @click="handleToBotton">有{{ messageStore.un_read_msg_num }}条新消息</div>
					</transition>
				</div>
				<div class="chat-container-progress">
					<chat-progress />
				</div>
				<div class="chat-container-footer">
					<chat-message-frame ref="messageFrame" />
					<chat-lrc />
				</div>
				<pre-img :data="uiStore.pre_img" />
			</div>
		</transition>

		<Barrage v-if="!lock" :new-msg="newMsg" class="chat-barrage-wapper" />

		<transition name="message-panel" mode="out-in">
			<div v-if="!showChatPanle && !lock" class="chat-barrage">
				<div class="chat-container-progress">
					<chat-progress />
				</div>
				<div class="chat-container-footer">
					<chat-message-frame ref="messageFrame" />
					<chat-lrc />
				</div>
				<pre-img :data="uiStore.pre_img" />
			</div>
		</transition>

		<music-player ref="minePlayer" />
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, defineAsyncComponent } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import { useMessageStore } from '@/stores/message';
import { useMusicStore } from '@/stores/music';
import { useConfigStore } from '@/stores/config';
import { useUIStore } from '@/stores/ui';
import { connectSocket, disconnectSocket, getSocket } from '@/composables/useSocket';
import { scrollToBottom } from '@/composables/useScrollToBottom';
import { history } from '@/api/chat';
import config from '@/config/index';
import ChatHeader from '@/components/Chat/ChatHeader/index.vue';
import ChatMessageFrame from '@/components/Chat/ChatMessageFrame/index.vue';
import ChatLrc from '@/components/Chat/ChatLrc/index.vue';
import MessagePanel from '@/components/Chat/MessagePanel/index.vue';
const MusicPlayer = defineAsyncComponent(() => import('@/components/Chat/MusicPlayer/index.vue'));
import ChatProgress from '@/components/Chat/ChatProgress/index.vue';
import PreImg from '@/components/PreImg/index.vue';
const Barrage = defineAsyncComponent(() => import('@/components/Barrage/index.vue'));

const { default_room_bg } = config;

const userStore = useUserStore();
const roomStore = useRoomStore();
const messageStore = useMessageStore();
const musicStore = useMusicStore();
const configStore = useConfigStore();
const uiStore = useUIStore();

const header = ref(null);
const messageFrame = ref(null);
const minePlayer = ref(null);
const lock = ref(true);
const showChatPanle = ref(false);
const stopLoadmore = ref(false);
const backgroundImage = ref('');
const newMsg = ref('');
const count = ref(1);
let botTypingTimer = null;

const messageParams = ref({
	page: 1,
	pagesize: 20,
});

const room_bg = computed(() => {
	return userStore.mine_room_bg || roomStore.currentRoomInfo?.room_bg_img || default_room_bg;
});

watch(() => roomStore.room_id, (n, o) => {
	if (Number(n) === Number(o) || !n) return;
	disconnectSocket();
	resetRoom();
	initSocket();
});

function setupSocketListeners(socket) {
	socket.on('connect', () => {
		initLocalStorageConfig();
		roomStore.getRoomInfo();
	});

	socket.on('authFail', (data) => {
		data && ElMessage.error(data.msg);
		userStore.logout();
	});

	socket.on('initRoom', async (data) => {
		await getHistoryMessage();
		const { room_admin_info, msg, on_line_user_list, room_list } = data;
		roomStore.setRoomAdminInfo(room_admin_info);
		updateMusicInfo(data);
		roomStore.setOnlineUserList(on_line_user_list);
		roomStore.setRoomList(room_list);
		configStore.showTipsJoinRoom &&
			messageStore.setMessageDataList({ message_type: 'info', message_content: msg });
		configStore.showTipsNotice && initNotice();
	});

	socket.on('updateRoomlist', (data) => {
		const { room_list, msg } = data;
		roomStore.setRoomList(room_list);
		msg && messageStore.setMessageDataList({ message_type: 'info', message_content: msg });
	});

	socket.on('online', (data) => {
		const { msg, on_line_user_list } = data;
		roomStore.setOnlineUserList(on_line_user_list);
		configStore.showTipsJoinRoom &&
			messageStore.setMessageDataList({ message_type: 'info', message_content: msg });
	});

	socket.on('offline', (data) => {
		const { on_line_user_list, msg } = data;
		configStore.showTipsQuitRoom &&
			messageStore.setMessageDataList({ message_type: 'info', message_content: msg });
		roomStore.setOnlineUserList(on_line_user_list);
	});

	socket.on('message', (data) => {
		newMsg.value = data.data;
		messageStore.setMessageDataList(data.data);
	});

	socket.on('switchMusic', (data) => {
		const { msg, musicInfo } = data;
		updateMusicInfo(musicInfo);
		configStore.showTipsPlayMusic &&
			messageStore.setMessageDataList({ message_type: 'info', message_content: msg });
	});

	socket.on('notice', (data) => {
		const { code } = data;
		code === 2 && configStore.showTipsSwitchMusic && messageStore.setMessageDataList(data);
	});

	socket.on('tips', (data) => {
		const { code, msg } = data;
		code === 1 && ElMessage.success(msg);
		code === -1 && ElMessage.error(msg);
		if (code === -2) {
			ElMessage.error(msg);
			userStore.logout();
		}
		if (code === -3) {
			ElMessage.error(msg);
			roomStore.setRoomId(888);
		}
	});

	socket.on('chooseMusic', (data) => {
		const { music_queue_list, msg } = data;
		messageStore.setMessageDataList({ message_type: 'info', message_content: msg });
		musicStore.setQueueMusicList(music_queue_list);
	});

	socket.on('recallMessage', ({ id, msg }) => {
		messageStore.updateMessageList({ id, msg });
	});

	socket.on('updateOnLineUserList', ({ on_line_user_list }) => {
		roomStore.setOnlineUserList(on_line_user_list);
	});

	socket.on('messageUpdate', ({ code, data }) => {
		if (code === 1 && data) {
			messageStore.updateMessageContent(data);
		}
	});

	socket.on('messageRecall', ({ code, data }) => {
		if (code === 1 && data) {
			messageStore.updateMessageList({ id: data.id, msg: `${data.user_nick || 'Bot'}撤回了一条消息` });
		}
	});

	socket.on('botAction', ({ code, data }) => {
		if (code === 1 && data && data.action === 'typing') {
			messageStore.setBotTyping({ bot_name: data.bot_name, room_id: data.room_id });
			clearTimeout(botTypingTimer);
			botTypingTimer = setTimeout(() => messageStore.setBotTyping(null), 3000);
		}
	});
}

function resetRoom() {
	messageStore.emptyMessageDataList();
	messageParams.value.page = 1;
}

async function initUserAddress() {
	if (window.userLocation) return;
	try {
		const response = await fetch('https://myip.ipip.net/json');
		const data = await response.json();
		if (data.ret === 'ok' && data.data?.location) {
			const [country, province, city] = data.data.location;
			window.userLocation = city || province || country || '未知地区';
		}
	} catch (e) {
		// ignore
	}
}

function initSocket() {
	const token = localStorage.chat_token;
	if (!window.userLocation && count.value <= 3) {
		count.value++;
		setTimeout(() => initSocket(), 100);
		return;
	}
	const address = window.userLocation || getRandomAddr();
	localStorage.room_id = roomStore.room_id;
	const socket = connectSocket(token, roomStore.room_id, address);
	setupSocketListeners(socket);
}

function getRandomAddr() {
	const i = Math.round(Math.random() * 5);
	const randomAddrs = ['金星', '木星', '水星', '火星', '土星', '月球'];
	return randomAddrs[i];
}

function updateMusicInfo(musicInfo) {
	const { music_info, music_lrc, music_src, music_start_time, music_queue_list } = musicInfo;
	musicStore.setQueueMusicList(music_queue_list);
	musicStore.setCurrentMusicInfo({ music_info, music_lrc, music_src });
	music_start_time && musicStore.setCurrentMusicStartTime(music_start_time);
}

async function getHistoryMessage() {
	const res = await history({
		room_id: roomStore.room_id,
		...messageParams.value,
	});
	stopLoadmore.value = res.data.length < messageParams.value.pagesize;
	stopLoadmore.value &&
		messageParams.value.page > 1 &&
		ElMessage.warning('已加载完全部历史消息了！');
	messageStore.setMessageDataList(res.data);
}

function handlerLoadHistoryMessage() {
	messageParams.value.page += 1;
	getHistoryMessage();
}

function handlerQuoteMessage(message) {
	messageFrame.value?.setQuoteMessage(message);
}

function initNotice() {
	setTimeout(() => {
		const socket = getSocket();
		if (socket?.connected) {
			messageStore.setMessageDataList({
				message_type: 'notice',
				message_content: roomStore.currentRoomInfo.room_notice.split(','),
			});
		}
	}, 1000);
}

function passJoin() {
	lock.value = false;
	showChatPanle.value = true;
	initSocket();
}

function handleToBotton() {
	scrollToBottom({ animation: true });
	messageStore.setUnReadMsgNum(0);
}

function keyboardEvent(e) {
	if (lock.value) return;
	const { key } = e;
	if (key === 'Escape') {
		showChatPanle.value = !showChatPanle.value;
		showChatPanle.value && nextTick(() => scrollToBottom());
	}
	if (key === 'F1') messageFrame.value?.openBox(1);
	if (key === 'F2') messageFrame.value?.openBox(2);
	if (key === 'F3') messageFrame.value?.openBox(3);
	if (key === 'F4') messageFrame.value?.openBox(4);
	if (key === 'F8') header.value?.openBox(1);
	if (key === 'F9') header.value?.openBox(2);
	if (key === 'F10') header.value?.openBox(3);
}

function initLocalStorageConfig() {
	const storageKeys = [
		'showTipsJoinRoom',
		'showTipsQuitRoom',
		'showTipsSwitchMusic',
		'theme',
		'show_all_tips',
		'showTipsNotice',
		'showHistoryBarrageInfo',
		'showBarrageImg',
		'showBarrageAvatar',
	];
	storageKeys.forEach((key) => {
		if (localStorage[key]) {
			configStore.setGlobalRoomConfig({
				key,
				value: key === 'theme' ? localStorage[key] : JSON.parse(localStorage[key]),
			});
		}
	});
}

initLocalStorageConfig();
if (localStorage.room_id) roomStore.setRoomId(localStorage.room_id);
ElMessageBox.confirm('请注意、加入聊天室将自动播放音乐!', '欢迎加入聊天室', {
	confirmButtonText: '加入房间',
	cancelButtonText: '取消',
}).then(() => passJoin()).catch(() => userStore.logout());

onMounted(() => {
	initUserAddress();
	document.addEventListener('keyup', keyboardEvent);
});

onBeforeUnmount(() => {
	disconnectSocket();
	document.removeEventListener('keyup', keyboardEvent, true);
	clearTimeout(botTypingTimer);
});
</script>

<style lang="less" scoped>
@media screen and (max-width: 720px) {
  .chat-container {
    position: fixed;
    width: 100vw !important;
    height: 100vh !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: 0 !important;
    border-radius: 0 !important;
  }
}

.full_screen{
  position: fixed;
  width: 100vw !important;
  height: 100vh !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  top: 0 !important;
  border-radius: 0 !important;
}
.chat {
  width: 100vw;
  height: 100vh;
  background: url("../../assets/background.gif");
  background-size: cover;
  &-container {
    position: fixed;
    left: 8%;
    right: 8%;
    top: 5%;
    bottom: 5%;
    transition: all 0.5s;
    background: @message-panel-bg-color;
    box-shadow: @message-panel-box-shadow;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    z-index: 1;
    &-header {
      width: 100%;
      height: 50px;
      border-bottom: 1px solid @message-border-color;
    }
    &-content {
      flex: 1;
      height: 0;
      position: relative;
      .un-read {
        transition: all 0.3s;
        position: absolute;
        right: 15px;
        bottom: 10px;
        padding: 7px 13px;
        font-size: 12px;
        background: #f56c6c;
        color: #fff;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }
    }
    &-progress {
      height: 2px;
      margin-bottom: 5px;
    }
    &-footer {
      padding: 0;
    }
  }
  &-barrage{
    position: fixed;
    bottom: 0%;
    left: 0%;
    right: 0%;
    z-index: 10;
    background: @message-panel-bg-color;
    box-shadow: @message-panel-box-shadow;
    border-radius: 10px;
  }
  &-bullet{
    position: fixed;
    bottom: 2%;
    z-index: 1;
  }
  &-barrage-wapper{
    position: fixed;
    top: 0;
    width: 100%;
  }
}
</style>
