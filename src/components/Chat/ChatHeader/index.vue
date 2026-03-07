<template>
	<div class="header flex_between">
		<div class="header-left flex_start">
			<div class="header-left-id">
				<span class="visible-xl visible-lg">ID:</span>
				{{ (roomStore.currentRoomInfo && roomStore.currentRoomInfo.room_id) || 888 }}
			</div>
			<div class="header-left-name">
				<span class="visible-xl visible-lg">{{ (roomStore.currentRoomInfo && roomStore.currentRoomInfo.room_name) || '小九的聊天室' }}</span>
			</div>
			<div class="header-left-share flex_center" :data-clipboard-text="copyText" @click="share">
				<icon name="chat-share" scale="1.8" class="icon" />
				<span class="visible-xl visible-lg">分享</span>
			</div>
			<ChatTips class="visible-xl visible-lg" />
		</div>
		<div class="header-right flex_center">
			<div class="header-right-item flex_center" @click="toGit">
				<icon name="github" scale="1.8" />
				<span class="visible-xl">开源地址</span>
			</div>
			<div v-if="Number(userStore.mine_room_id) === Number(roomStore.room_id)" :class="['header-right-item', 'flex_center', { 'active-menu': opt4.show }]" @click.stop="openBox(4)">
				<icon name="chat-header-setting" scale="1.8" class="icon" />
				<span class="visible-xl">管理</span>
			</div>
			<div :class="['header-right-item', 'flex_center', { 'active-menu': opt5.show }]" @click.stop="openBox(5)">
				<icon name="chat-music-auth" scale="1.8" class="icon" />
				<span class="visible-xl">账号</span>
			</div>
			<div :class="['header-right-item', 'flex_center', { 'active-menu': opt1.show }]" @click.stop="openBox(1)">
				<icon name="chat-online" scale="1.8" class="icon" />
				<span class="visible-xl">在线[{{ roomStore.onLineUserNum }}]</span>
			</div>
			<div :class="['header-right-item', 'flex_center', { 'active-menu': opt2.show }]" @click.stop="openBox(2)">
				<icon name="chat-room" scale="1.8" class="icon" />
				<span class="visible-xl">房间[{{ roomStore.onLineRoomNum }}]</span>
			</div>
			<div :class="['header-right-item', 'flex_center', { 'active-menu': opt3.show }]" @click.stop="openBox(3)">
				<icon name="chat-mine" scale="1.8" class="icon" />
				<span class="visible-xl">我的</span>
			</div>
			<div class="header-right-item flex_center" @click="handlerLogout">
				<icon name="chat-go" scale="1.8" class="icon" />
				<span class="visible-xl">登出</span>
			</div>
		</div>
		<chat-popup :options="opt1" :top="60" :right="10" title="在线用户" @close="closeBox">
			<online-list />
		</chat-popup>
		<chat-popup :options="opt2" :top="60" :right="10" title="房间信息" @close="closeBox">
			<template #header>
				<el-button v-if="!isMineRoom" type="primary" text size="small" @click="createOrJoinRoom">{{ btnText }}</el-button>
			</template>
			<room-list :create-room-visible="createRoomVisible" @canel="handlerCreateSuccess" @close="closeBox" @create-success="handlerCreateSuccess" />
		</chat-popup>
		<chat-popup :options="opt3" :top="60" :right="10" :height="450" title="个人中心" @close="closeBox">
			<persion-info />
		</chat-popup>
		<chat-popup :options="opt4" :top="60" :right="10" title="房间设置" @close="closeBox">
			<room-setting />
		</chat-popup>
		<chat-popup :options="opt5" :top="60" :right="10" :height="450" title="音乐账号授权" @close="closeBox">
			<music-auth />
		</chat-popup>
	</div>
</template>

<script setup>
import { ref, reactive, computed, defineAsyncComponent } from 'vue';
import Clipboard from 'clipboard';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import { getSocket } from '@/composables/useSocket';
import ChatPopup from '@/components/ChatPopup/index.vue';
const OnlineList = defineAsyncComponent(() => import('./components/OnLineList.vue'));
const RoomList = defineAsyncComponent(() => import('./components/RoomList.vue'));
const PersionInfo = defineAsyncComponent(() => import('./components/PersionInfo.vue'));
const RoomSetting = defineAsyncComponent(() => import('./components/RoomSetting.vue'));
const MusicAuth = defineAsyncComponent(() => import('./components/MusicAuth.vue'));
import ChatTips from '../ChatTips/index.vue';

const userStore = useUserStore();
const roomStore = useRoomStore();

const opt1 = reactive({ show: false });
const opt2 = reactive({ show: false });
const opt3 = reactive({ show: false });
const opt4 = reactive({ show: false });
const opt5 = reactive({ show: false });
const opts = [opt1, opt2, opt3, opt4, opt5];
const createRoomVisible = ref(false);

const btnText = computed(() => !userStore.mine_room_id ? '创建房间' : '我的房间');
const copyText = computed(() => `听歌、聊天、交友、互助、欢迎来到 ${roomStore.currentRoomInfo?.room_name || '音乐聊天室'}，前往 ${window.location.origin} 试试吧！`);
const isMineRoom = computed(() => Number(roomStore.room_id) === Number(userStore.mine_room_id));

function share() {
	const clipboard = new Clipboard('.header-left-share');
	clipboard.on('success', () => {
		ElMessage.success('复制成功、快发给你的小伙伴一起来听音乐吧~');
		clipboard.destroy();
	});
}

function openBox(val) {
	const target = opts[val - 1];
	if (target.show) { target.show = false; return; }
	closeBox();
	target.show = true;
}

function closeBox() {
	opts.forEach(o => (o.show = false));
}

function toGit() {
	window.open('https://github.com/longyanjiang/Nine-chat-frontend');
}

function createOrJoinRoom() {
	const socket = getSocket();
	if (!socket?.connected) return;
	if (!userStore.mine_room_id) { createRoomVisible.value = true; return; }
	if (Number(userStore.mine_room_id) === Number(roomStore.room_id)) {
		return ElMessage.warning('当前已经在这个房间里了');
	}
	roomStore.setRoomId(userStore.mine_room_id);
	closeBox();
}

function handlerCreateSuccess() {
	createRoomVisible.value = false;
	userStore.getUserInfo();
}

function handlerLogout() {
	ElMessageBox.confirm('是否需要退出登录?', '退出登录', {
		confirmButtonText: '退出',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => userStore.logout()).catch(() => {});
}

defineExpose({ openBox });
</script>
<style lang="less" scoped>
.header {
  height: 100%;
  padding: 0 15px;
  user-select: none;
  color: @message-main-text-color;
  &-left {
    &-id {
      user-select: none;
      background-color: @message-main-text-color;
      color: @message-border-color;
      display: flex;
      padding: 0 5px;
      font-size: 14px;
      border-radius: 3px;
      margin-right: 5px;
    }
    &-name {
      font-size: 18px;
      user-select: none;
      margin-right: 12px;
    }
    &-share {
      cursor: pointer;
      padding: 4px 10px;
      border-radius: 5px;
      transition: all 0.3s;
      .icon {
        margin-right: 3px;
      }
      &:hover {
        background: @message-hover-bg-color;
      }
    }
  }

  &-right {
    &-item {
      padding: 5px 10px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
      color: @message-main-text-color;
      border-radius: 5px;
      margin: 0 3px;
      z-index: 3001;
      .icon {
        margin-right: 3px;
      }
      &:hover {
        background: @message-hover-bg-color;
      }
      &:active {
        filter: brightness(1.2);
      }
    }
  }

  .active-menu {
    background: @message-hover-bg-color !important;
  }
}
</style>
