<template>
	<div class="message-frame">
		<chat-toolbar ref="toolbarRef" @emotion="handlerEmotion" />
		<!-- Bot 命令建议下拉 -->
		<div v-if="showCommandMenu" class="command-menu">
			<div v-for="cmd in filteredCommands" :key="cmd.fullCommand" class="command-item" @mousedown.prevent="selectCommand(cmd)">
				<span class="command-name">/{{ cmd.command }}</span>
				<span class="command-desc">{{ cmd.description }}</span>
				<span class="command-bot">{{ cmd.bot_name }}</span>
			</div>
			<div v-if="filteredCommands.length === 0" class="command-empty">没有匹配的命令</div>
		</div>
		<div :class="['message-frame-input']">
			<!-- 图片类型文件 -->
			<img v-if="fileInfo && allowImgExt.includes(fileInfo.ext)" :class="['message-frame-input-img']" :src="preImgBlob" alt="" />
			<!-- 非图片类型文件 -->
			<div v-if="fileInfo && !allowImgExt.includes(fileInfo.ext)">
				<div class="other-file-panel">
					<div class="file-info">
						<span class="file-info-name">{{ fileInfo.name }}</span>
						<span class="file-info-size">{{ fileInfo.size }}</span>
					</div>
					<icon class="file-icon" name="chat-frame-unknow-file" scale="4" />
				</div>
			</div>
			<!-- 文字消息 -->
			<textarea ref="messageInputRef" v-model.trim="message" placeholder="点击回车键发送消息" class="message-frame-input-text" @keydown="sendMsg" @paste="pasting" @input="onInputChange" />
		</div>
		<div v-if="quoteMessage" class="quote" @click="focusInput">
			<span class="quote-panel">
				<span> {{ quoteMessage.user_info.user_nick }}: </span>
				<!-- 引用文字类型 -->
				<span v-if="quoteMessage.message_type === 'text'">
					{{ quoteMessage.message_content }}
				</span>
				<!-- 引用图片类消息 -->
				<img v-if="allowImgExt.includes(quoteMessage.message_type)" class="message-img" :src="quoteMessage.message_content.url" />
				<!-- 引用非图片类型文件 -->
				<div
					v-if="
						!allowImgExt.includes(quoteMessage.message_type) &&
							quoteMessage.message_type !== 'text'
					"
					class="other-file-panel"
				>
					<div class="file-info">
						<span class="file-info-name">{{ quoteMessage.message_content.name }}</span>
						<span class="file-info-size">{{ quoteMessage.message_content.size }}</span>
					</div>
					<icon class="file-icon" name="chat-frame-unknow-file" scale="4" />
				</div>
			</span>
			<icon name="char-frame-del" scale="1.8" class="del-icon" @click.stop="handlerDelQuoteMessage" />
		</div>
	</div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useRoomStore } from '@/stores/room';
import { getSocket, emitSocket } from '@/composables/useSocket';
import { scrollToBottom } from '@/composables/useScrollToBottom';
import { getRoomBotCommands } from '@/api/chat';
import ChatToolbar from '@/components/Chat/ChatToolbar/index.vue';

const file_upload_url = `${import.meta.env.VITE_BASE_API}/upload/file`;

const roomStore = useRoomStore();
const toolbarRef = ref(null);
const messageInputRef = ref(null);

const message = ref('');
const quoteMessage = ref(null);
const preImgBlob = ref(null);
const allowImgExt = ['png', 'jpg', 'jpeg', 'gif', 'emo'];
const filename = ref(null);
const fileInfo = ref(null);
const loading = ref(false);
const botCommands = ref([]);
const showCommandMenu = ref(false);

const filteredCommands = computed(() => {
	if (!message.value || !message.value.startsWith('/')) return botCommands.value;
	const input = message.value.slice(1).toLowerCase();
	if (!input) return botCommands.value;
	return botCommands.value.filter(cmd => cmd.command.toLowerCase().startsWith(input));
});

watch(() => roomStore.room_id, (val) => {
	if (val) fetchBotCommands(val);
}, { immediate: true });

watch(message, (n, o) => {
	if (filename.value && n.includes(filename.value)) {
		message.value = o;
	}
});

async function sendMsg(e) {
	if (!getSocket()?.connected) return ElMessage.error('请重新登录！');

	if (e.key === 'Enter') {
		if (loading.value) return;
		loading.value = true;

		if (message.value && !fileInfo.value) {
			const data = {
				message_type: 'text',
				message_content: JSON.stringify(message.value),
			};
			if (quoteMessage.value) data.quote_message = quoteMessage.value;
			emitSocket('message', data);
		}

		if (!message.value && fileInfo.value) {
			const { name, file, ext, size } = fileInfo.value;
			const formData = new FormData();
			formData.append('file', file);
			const config = { headers: { 'Content-Type': 'multipart/form-data' } };
			const res = await axios.post(file_upload_url, formData, config);
			const content = { name, size, ext, url: res.data.data };
			const data = {
				message_type: ext,
				message_content: JSON.stringify(content),
			};
			if (quoteMessage.value) data.quote_message = quoteMessage.value;
			emitSocket('message', data);
		}

		if (message.value && fileInfo.value) {
			const { name, file, ext, size } = fileInfo.value;
			const formData = new FormData();
			formData.append('file', file);
			const config = { headers: { 'Content-Type': 'multipart/form-data' } };
			try {
				const res = await axios.post(file_upload_url, formData, config);
				const fileContent = { name, size, ext, url: res.data.data[0].url };
				emitSocket('message', {
					message_type: ext,
					message_content: JSON.stringify(fileContent),
				});
				const data = {
					message_type: 'text',
					message_content: JSON.stringify(message.value),
				};
				if (quoteMessage.value) data.quote_message = quoteMessage.value;
				emitSocket('message', data);
			} catch (error) {
				ElMessage.error('图片上传失败，请联系管理员！');
			}
		}

		clearData();
		nextTick(() => scrollToBottom());
		loading.value = false;
		e.preventDefault();
	}

	if (e.key === 'Backspace') {
		if (message.value) return;
		preImgBlob.value = null;
		filename.value = null;
		fileInfo.value = null;
	}
}

function pasting(e) {
	if (e.clipboardData.files.length) {
		focusInput();
		const file = e.clipboardData.files[0];
		filename.value = file.name;
		if (file.size > 1024 * 500)
			return ElMessage.warning('因服务器资源有限，禁止上传大于500k的资源！');
		const ext = getFileType(file.name);
		if (allowImgExt.includes(ext)) handlerPastingImg(file, ext);
		else handlerPastingOtherFile(file, ext);
	}
}

function clearData() {
	message.value = '';
	quoteMessage.value = null;
	preImgBlob.value = null;
	fileInfo.value = null;
	filename.value = null;
}

function handlerPastingImg(file, ext) {
	const { name, size } = file;
	const reader = new FileReader();
	reader.readAsDataURL(file);
	reader.onload = (e) => {
		preImgBlob.value = e.target.result;
		fileInfo.value = { file, name, ext, size: formatSize(size) };
	};
}

function handlerPastingOtherFile(file, ext) {
	const { name, size } = file;
	fileInfo.value = { file, name, ext, size: formatSize(size) };
}

function handlerEmotion(emoji) {
	message.value += `[${emoji.text}]`;
}

function openBox(val) {
	toolbarRef.value?.openBox(val);
}

function focusInput() {
	messageInputRef.value?.focus();
}

function setQuoteMessage(msg) {
	quoteMessage.value = msg;
	messageInputRef.value?.focus();
}

function handlerDelQuoteMessage() {
	quoteMessage.value = null;
}

function getFileType(name) {
	return name.substr(name.lastIndexOf('.') - name.length + 1).toLowerCase();
}

function formatSize(size) {
	return size > 1024 ? `${(size / 1024).toFixed(1)}k` : `${size}b`;
}

async function fetchBotCommands(roomId) {
	try {
		const res = await getRoomBotCommands({ room_id: roomId });
		const bots = res.data || res || [];
		const commands = [];
		(Array.isArray(bots) ? bots : []).forEach((bot) => {
			if (bot.commands && Array.isArray(bot.commands)) {
				bot.commands.forEach((cmd) => {
					commands.push({
						command: cmd.command,
						description: cmd.description,
						bot_name: bot.bot_name,
						fullCommand: `/${cmd.command}`,
					});
				});
			}
		});
		botCommands.value = commands;
	} catch (e) {
		botCommands.value = [];
	}
}

function onInputChange() {
	const raw = messageInputRef.value ? messageInputRef.value.value : '';
	showCommandMenu.value = raw.startsWith('/') && botCommands.value.length > 0;
}

function selectCommand(cmd) {
	message.value = `${cmd.fullCommand} `;
	showCommandMenu.value = false;
	messageInputRef.value?.focus();
}

defineExpose({ openBox, focusInput, setQuoteMessage });
</script>

<style lang="less" scoped>
.message-frame {
  height: 160px;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  .progress {
    width: 100%;
    height: 2px;
  }
  &-input {
    display: flex;
    flex: 1;
    padding: 0 15px;
    overflow: hidden;
    cursor: text;
    &-img {
      object-fit: cover;
      border: 1px solid #b6b6b6;
      border-radius: 3px;
      max-width: 320px;
    }
    &-text {
      width: 100%;
      flex: 1;
      overflow-y: auto;
      box-sizing: border-box;
      resize: none;
      outline: none;
      border: none;
      font-size: 15px;
      color: @message-main-text-color;
      background-color: transparent;
    }
  }

  .minHeight {
    min-height: 60px;
  }
  .quote {
    padding: 0 15px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-top: 5px;
    &-panel {
      background: #e5e5e5;
      color: #868181;
      display: flex;
      padding: 5px 15px;
      border-radius: 5px;
      position: relative;
      word-break: break-all;
      .message-img {
        max-height: 50px;
      }
    }
    .del-icon {
      color: #868181;
      margin-left: 12px;
      cursor: pointer;
      flex-shrink: 0;
      &:hover {
        transition: all 0.3s;
        transform: scale(1.2);
      }
    }
  }
}

.maxHeight60 {
  max-height: 60px;
}

.maxHeight100 {
  max-height: 100px;
}

/* 非文字图片类型其他文件 */
.other-file-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 10px 20px;
  min-width: 140px;
  border-radius: 3px;
  filter: brightness(0.8);
  .file-info {
    display: flex;
    flex-direction: column;
    &-name {
      color: #807d7d;
      max-width: 90px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    &-size {
      margin-top: 5px;
      color: #ccc;
      font-size: 12px;
    }
  }
  .file-icon {
    margin-left: 30px;
  }
}

/* Bot 命令建议菜单 */
.command-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 133, 255, 0.12);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 133, 255, 0.1), 0 -1px 3px rgba(0, 0, 0, 0.06);
  max-height: 220px;
  overflow-y: auto;
  z-index: 100;
  .command-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
    &:hover {
      background: linear-gradient(90deg, rgba(0, 133, 255, 0.08) 0%, transparent 100%);
      border-left-color: #0085ff;
    }
    &:first-child {
      border-radius: 12px 12px 0 0;
    }
    .command-name {
      background: linear-gradient(135deg, #0085ff, #00c6ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 700;
      font-size: 14px;
      min-width: 80px;
    }
    .command-desc {
      color: #666;
      font-size: 13px;
      flex: 1;
    }
    .command-bot {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 3px;
      background: linear-gradient(135deg, rgba(0, 133, 255, 0.1), rgba(0, 198, 255, 0.1));
      color: #0085ff;
      white-space: nowrap;
      font-weight: 500;
    }
  }
  .command-empty {
    padding: 14px;
    color: #aaa;
    font-size: 13px;
    text-align: center;
  }
}
</style>
