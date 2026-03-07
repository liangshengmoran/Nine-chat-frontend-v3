<template>
	<div id="box" class="message-box">
		<div v-for="(item, index) in displayMessageList" :key="item.id || item.collapseKey || index" :ref="(el) => { if (el && !item.isCollapseBar) messageRefs.set(item.id || -1, el) }" :class="['message-box-item', messageClass(item)]">
			<!-- 系统消息折叠提示 -->
			<div v-if="item.isCollapseBar" class="info-collapse-bar" @click="toggleInfoCollapse">
				<icon name="chat-panel-link" scale="1.2" />
				<span v-if="infoCollapsed">已隐藏 {{ hiddenInfoCount }} 条系统消息，点击展开</span>
				<span v-else>点击收起系统消息</span>
			</div>
			<!-- text  'notice', 'info' 类型分别代表公告和中间的提示消息不在此处显示-->
			<span v-if="item.message_type && !tipsMessageType.includes(item.message_type) && !item.isCollapseBar" class="message-box-item-info">
				<el-dropdown trigger="click" placement="bottom" size="small" @command="(cmd) => handlerMessageCommand(cmd, item)">
					<div class="info-box">
						<span :class="['name', getUserRoleClass(item)]">
							{{ item.user_info && item.user_info.user_nick }}
							<!-- 超级管理员标签 -->
							<span v-if="item.user_info && item.user_info.user_role === 'super'" class="role-tag super-tag">超管</span>
							<!-- 管理员标签 -->
							<span v-else-if="item.user_info && item.user_info.user_role === 'admin'" class="role-tag admin-tag">管理</span>
							<!-- 房主标签 -->
							<span v-if="item.user_info && item.user_info.id === roomStore.room_admin_id" class="role-tag owner-tag">房主</span>
							<!-- 房管标签 -->
							<span v-if="item.user_info && item.user_info.is_moderator && !['super', 'admin'].includes(item.user_info.user_role) && item.user_info.id !== roomStore.room_admin_id" class="role-tag moderator-tag">房管</span>
							<!-- Bot 机器人图标 -->
							<icon v-if="item.user_info && item.user_info.is_bot" name="robot_label" scale="2" class="bot-icon" />
						</span>

						<!-- 文字消息 (Markdown) -->
						<span
							v-if="item.message_type === 'text' && item.parse_mode === 'markdown' && !isUrl(item.message_content)"
							:class="['message', 'markdown-body', textClass(item), { 'mention-highlight': isMentioned(item) }]"
							v-html="renderMarkdown(item.message_content)"
						></span>
						<!-- 文字消息 (HTML) -->
						<span
							v-else-if="item.message_type === 'text' && item.parse_mode === 'html' && !isUrl(item.message_content)"
							:class="['message', textClass(item), { 'mention-highlight': isMentioned(item) }]"
							v-html="sanitizeHtml(item.message_content)"
						></span>
						<!-- 文字消息 (普通) -->
						<span
							v-else-if="item.message_type === 'text' && !isUrl(item.message_content)"
							:class="['message', textClass(item), { 'mention-highlight': isMentioned(item) }]"
							v-html="replaceEmotionText(item.message_content)"
						></span>
						<!-- 链接地址 -->
						<a v-if="item.message_type === 'text' && isUrl(item.message_content)" :href="item.message_content" target="_blank" :class="['message', 'msg-url']" @click.stop>
							<icon name="chat-panel-link" scale="1.8" />
							{{ item.message_content }}
						</a>
						<!-- 图片消息 -->
						<span v-if="imgMessageType.includes(item.message_type)" :class="['msg-img', { 'msg-emo': item.message_type === 'emo' }]">
							<img :ref="(el) => { if (el) imgRefs.set(item.id, el) }" :src="item.message_content.url" @click="previewImg(item)" />
						</span>
						<!-- Bot 文件消息 -->
						<span v-if="item.message_type === 'file'" class="msg-file-bot">
							<div class="msg-file-bot-panel">
								<icon name="chat-frame-unknow-file" scale="3" class="file-icon" />
								<div class="file-detail">
									<a :href="getFileContent(item).file_url" target="_blank" class="file-name">{{ getFileContent(item).file_name }}</a>
									<span v-if="getFileContent(item).caption" class="file-caption">{{ getFileContent(item).caption }}</span>
								</div>
							</div>
						</span>
						<!-- 非图片的类型的其他信息 -->
						<span v-if="otherFileType(item.message_type)" class="msg-other">
							<div class="msg-other-panel">
								<div class="file-info">
									<span class="file-info-name">{{ item.message_content.name }}</span>
									<span class="file-info-size">{{ item.message_content.size }}</span>
								</div>
								<icon class="file-icon" name="chat-frame-unknow-file" scale="4" />
							</div>
						</span>
						<!-- 引用消息 -->
						<span
							v-if="item.quote_info"
							:class="['quote-panel', { recall: item.quote_info.quote_message_status === -1 }]"
							@click.stop="handlerJumpMessage(item.quote_info.quote_message_id)"
						>
							<span v-if="item.quote_info.quote_message_status === 1" style="margin: 5px">{{ item.quote_info.quote_user_nick }}:</span>
							<!-- 引用消息已被撤回 -->
							<span v-if="item.quote_info.quote_message_status === -1"> 引用消息已被撤回</span>
							<!-- 文字消息引用 -->
							<span v-if="item.quote_info.quote_message_type === 'text' && item.quote_info.quote_message_status === 1">
								{{ item.quote_info.quote_message_content }}
							</span>
							<!-- 图片消息引用 -->
							<img
								v-if="imgMessageType.includes(item.quote_info.quote_message_type) && item.quote_info.quote_message_status === 1"
								:src="item.quote_info.quote_message_content.url"
								class="message-img"
							/>
							<!-- 特殊格式文件引用 -->
							<span
								v-if="otherFileType(item.quote_info.quote_message_type) && item.quote_info.quote_message_status === 1"
								class="msg-other quote-msg-other"
							>
								<div class="msg-other-panel">
									<div class="file-info">
										<span class="file-info-name">{{ item.quote_info.quote_message_content.name }}</span>
										<span class="file-info-size">{{ item.quote_info.quote_message_content.size }}</span>
									</div>
									<icon class="file-icon" name="chat-frame-unknow-file" scale="4" />
								</div>
							</span>
						</span>

						<!-- 已编辑标记 -->
						<span v-if="item.edited" class="edited-tag">(已编辑)</span>
						<!-- Inline Keyboard 按钮 -->
						<div v-if="item.reply_markup && item.reply_markup.inline_keyboard" class="inline-keyboard">
							<div v-for="(row, ri) in item.reply_markup.inline_keyboard" :key="ri" class="inline-keyboard-row">
								<button v-for="(btn, bi) in row" :key="bi" class="inline-keyboard-btn" @click.stop="handleInlineKeyboardClick(item, btn)">{{ btn.text }}</button>
							</div>
						</div>
						<!-- 时间 -->
						<span class="time">{{ formatChatTime(item.createdAt) }}</span>
					</div>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="1">引用消息</el-dropdown-item>
							<el-dropdown-item v-if="item.user_info && item.user_info.id === userStore.mine_id" command="2">撤回消息</el-dropdown-item>
							<el-dropdown-item v-if="imgMessageType.includes(item.message_type) && item.message_type !== 'emo'" command="3">预览大图</el-dropdown-item>
							<el-dropdown-item v-if="otherFileType(item.message_type)" command="4">下载文件</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>

				<!-- 用户可能删除账户的情况就没有item.user_info了 -->
				<img v-if="item.user_info" class="avatar" :src="item.user_info.user_avatar" />
				<img v-if="!item.user_info" class="avatar" :src="errAvatar" />
			</span>

			<!-- info -->
			<span v-if="item.message_type === 'info'" class="msg">
				{{ item.message_content }}
			</span>

			<!-- notice -->
			<span v-if="item.message_type === 'notice'" class="notice-box">
				<div class="notice-box-header">
					<span class="title">房间公告</span>
				</div>
				<div v-for="(t, i) in item.message_content" :key="i">{{ t }}</div>
			</span>
		</div>

		<!-- Bot 正在输入提示 -->
		<div v-if="messageStore.botTypingInfo" class="bot-typing-indicator">
			<span class="typing-dots"><span></span><span></span><span></span></span>
			{{ messageStore.botTypingInfo.bot_name }} 正在输入...
		</div>

		<div id="panelEnd" ref="endRef"></div>
	</div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { ElMessage } from 'element-plus';
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import { useUIStore } from '@/stores/ui';
import { emitSocket } from '@/composables/useSocket';
import { replaceEmotionText } from '@/components/Emotion/emotion.js';
import { throttle, formatChatTime } from '@/utils/tools';

marked.setOptions({ breaks: true, gfm: true });

const props = defineProps({
	stopLoadmore: { type: Boolean, default: true },
});

const emit = defineEmits(['quoteMessage', 'loadHistoryMessage']);

const messageStore = useMessageStore();
const userStore = useUserStore();
const roomStore = useRoomStore();
const uiStore = useUIStore();

const endRef = ref(null);
const isVisible = ref(true);
const _firstNodeId = ref(0);
const infoCollapsed = ref(true);
const maxVisibleInfoMessages = 3;
let collapseTimer = null;

const messageRefs = new Map();
const imgRefs = new Map();

const imgMessageType = ['png', 'jpg', 'jpeg', 'gif', 'emo'];
const tipsMessageType = ['notice', 'info'];
const errAvatar = 'https://img1.baidu.com/it/u=430660535,1172956011&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500';

const allInfoMessages = computed(() => {
	return messageStore.messageList.filter(m => m && m.message_type === 'info');
});

const hiddenInfoCount = computed(() => {
	if (!infoCollapsed.value) return 0;
	return Math.max(0, allInfoMessages.value.length - maxVisibleInfoMessages);
});

const displayMessageList = computed(() => {
	const validMessages = messageStore.messageList.filter(m => m && typeof m === 'object');
	const infoIndices = [];
	validMessages.forEach((m, i) => {
		if (m && m.message_type === 'info') infoIndices.push(i);
	});

	if (infoIndices.length <= maxVisibleInfoMessages) return validMessages;

	if (!infoCollapsed.value) {
		const firstInfoIdx = infoIndices[0];
		const result = [];
		validMessages.forEach((m, i) => {
			if (i === firstInfoIdx) {
				result.push({ isCollapseBar: true, collapseKey: 'collapse-bar' });
			}
			result.push(m);
		});
		return result;
	}

	const hideIndices = new Set(infoIndices.slice(0, -maxVisibleInfoMessages));
	const firstVisibleInfoIdx = infoIndices[infoIndices.length - maxVisibleInfoMessages];
	const result = [];
	validMessages.forEach((m, i) => {
		if (hideIndices.has(i)) return;
		if (i === firstVisibleInfoIdx) {
			result.push({ isCollapseBar: true, collapseKey: 'collapse-bar' });
		}
		result.push(m);
	});
	return result;
});

function messageClass(item) {
	if (item.isCollapseBar) return 'collapse-bar-item';
	const { user_id, message_type } = item;
	if (!['info', 'notice'].includes(message_type)) {
		return user_id === userStore.mine_id ? 'mine' : 'other';
	}
	return message_type;
}

function textClass(item) {
	if (!item.user_info) return '';
	const { user_role, id } = item.user_info;
	if (['super', 'admin'].includes(user_role)) return 'admin-text';
	if (roomStore.room_admin_id === id) return 'homeowner';
	return '';
}

function getUserRoleClass(item) {
	if (!item.user_info) return '';
	const { user_role, id, is_bot } = item.user_info;
	if (is_bot) return 'bot-name';
	if (['super', 'admin'].includes(user_role)) return 'super-admin-name';
	if (roomStore.room_admin_id === id) return 'room-admin-name';
	return '';
}

function otherFileType(type) {
	return ![...imgMessageType, ...tipsMessageType, 'text', 'file'].includes(type);
}

function isUrl(text) {
	const reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/;
	return reg.test(text);
}

function toggleInfoCollapse() {
	infoCollapsed.value = !infoCollapsed.value;
	if (!infoCollapsed.value) {
		startAutoCollapseTimer();
	} else {
		clearAutoCollapseTimer();
	}
}

function startAutoCollapseTimer() {
	clearAutoCollapseTimer();
	collapseTimer = setTimeout(() => {
		infoCollapsed.value = true;
	}, 3000);
}

function clearAutoCollapseTimer() {
	if (collapseTimer) {
		clearTimeout(collapseTimer);
		collapseTimer = null;
	}
}

const scrollToTopHandler = throttle(() => {
	const el = document.querySelector('#box');
	if (!el) return;
	const { scrollTop, scrollHeight } = el;

	isVisible.value = el.offsetHeight + scrollTop - scrollHeight > -450;

	if (isVisible.value) messageStore.setUnReadMsgNum(0);

	if (scrollTop < 30 && messageStore.messageList.length > 0) {
		emit('loadHistoryMessage');
	}
}, 200);

watch(() => messageStore.messageList, (n, o) => {
	if (!n.length) return;
	const oldLen = o ? o.length : 0;
	const isOneMsg = n.length - oldLen === 1;

	const lastNodeId = oldLen > 10 && o[0] ? o[0].id : 0;

	if (!isVisible.value && !isOneMsg) {
		nextTick(() => {
			const el = messageRefs.get(lastNodeId);
			el?.scrollIntoView();
		});
	}

	const params = isOneMsg ? { behavior: 'smooth' } : {};
	nextTick(() => isVisible.value && toEnd(params));

	if (!isVisible.value && isOneMsg) {
		messageStore.setUnReadMsgNum(messageStore.un_read_msg_num + 1);
	}

	if (!infoCollapsed.value && isOneMsg) {
		startAutoCollapseTimer();
	}
});

watch(() => props.stopLoadmore, (n) => {
	if (n) {
		document.querySelector('#box')?.removeEventListener('scroll', scrollToTopHandler);
	}
});

function toEnd(params) {
	nextTick(() => {
		document.getElementById('panelEnd')?.scrollIntoView(params);
	});
}

function previewImg() {}

function handlerMessageCommand(val, message) {
	const cmd = Number(val);
	if (cmd === 1) return emit('quoteMessage', message);
	if (cmd === 2) return emitSocket('recallMessage', { id: message.id, user_nick: message.user_info.user_nick });
	if (cmd === 3) return handlerPreBigImg(message);
	if (cmd === 4) return handlerDownload(message);
}

function handlerJumpMessage(id) {
	const exists = messageStore.messageList.some(t => t.id === id);
	if (!exists) return ElMessage.warning('当前消息在历史消息中，还没加载出来呢！');
	const el = messageRefs.get(id);
	el?.scrollIntoView({ behavior: 'smooth' });
}

function handlerPreBigImg(message) {
	const imgEl = imgRefs.get(message.id);
	if (!imgEl) return;
	const { width, height } = imgEl;
	uiStore.setPreImg({
		url: message.message_content.url,
		width: width * 2,
		height: height * 2,
	});
}

function handlerDownload(message) {
	const { url } = message.message_content;
	const link = document.createElement('a');
	link.href = url;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

function renderMarkdown(content) {
	try {
		const text = typeof content === 'string' ? content : JSON.stringify(content);
		const html = marked(text);
		return DOMPurify.sanitize(html);
	} catch (e) {
		return content;
	}
}

function sanitizeHtml(content) {
	return DOMPurify.sanitize(typeof content === 'string' ? content : '');
}

function getFileContent(item) {
	try {
		return typeof item.message_content === 'string'
			? JSON.parse(item.message_content)
			: item.message_content;
	} catch (e) {
		return { file_url: '', file_name: '未知文件', caption: '' };
	}
}

function isMentioned(item) {
	if (!item.mentions || !item.mentions.length) return false;
	return item.mentions.includes(userStore.mine_id);
}

function handleInlineKeyboardClick(message, btn) {
	if (btn.url) {
		window.open(btn.url, '_blank');
		return;
	}
	if (btn.callback_data) {
		emitSocket('callbackQuery', {
			message_id: message.id,
			bot_id: message.user_info?.bot_id,
			data: btn.callback_data,
		});
	}
}

onMounted(() => {
	const panel = document.querySelector('#box');
	panel?.addEventListener('scroll', scrollToTopHandler);
});

onBeforeUnmount(() => {
	const panel = document.querySelector('#box');
	panel?.removeEventListener('scroll', scrollToTopHandler);
	clearAutoCollapseTimer();
});
</script>

<style lang="less" scoped>
.message-box {
  padding: 20px;
  box-sizing: border-box;
  height: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  position: relative;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: block;
    width: 5px;
    height: 5px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 1em;
    background-color: rgba(50, 50, 50, 0.3);
  }
  &::-webkit-scrollbar-track {
    border-radius: 1em;
    background-color: rgba(50, 50, 50, 0.1);
  }

  /* 系统消息折叠栏 */
  .info-collapse-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    margin: 5px auto;
    background: rgba(100, 100, 100, 0.1);
    border-radius: 15px;
    font-size: 11px;
    color: #999;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
    max-width: 280px;

    &:hover {
      background: rgba(100, 100, 100, 0.2);
      color: #666;
    }
  }

  &-item {
    display: flex;
    margin: 7px 0;
    &-info {
      display: flex;
      .info-box {
        display: flex;
        flex-direction: column;
        .message {
          font-size: 13px;
          padding: 4px 16px;
          border-radius: 6px;
          margin-top: 10px;
          cursor: pointer;
          text-align: justify;
          line-height: 2;
          max-width: 300px;
          word-break: break-all;
        }
        /* 引用消息 */
        .quote-panel {
          cursor: pointer;
          margin-top: 5px;
          background: @message-panel-tips-bg-color;
          color: #868181;
          display: flex;
          align-items: center;
          padding: 5px 15px;
          border-radius: 5px;
          position: relative;
          word-break: break-all;
          max-width: 350px;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: none;
          .message-img {
            max-height: 75px;
            border: 1px solid #b6b6b6;
            border-radius: 3px;
          }
        }
        /* 撤回消息 */
        .recall {
          background: #868181;
          color: #e1e1e1;
        }
        .time {
          font-size: 12px;
          color: #9f9898;
          margin-top: 5px;
        }
        .msg-img {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 10px;
          img {
            max-width: 220px;
            border-radius: 10px;
            object-fit: cover;
            cursor: pointer;
            user-select: none;
            -webkit-user-drag: none;
            border: 1px solid #b6b6b6;
          }
        }
        /* 特殊格式文件 */
        .msg-other {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
          padding: 10px 20px;
          min-width: 140px;
          border-radius: 3px;
          margin-top: 10px;
          filter: brightness(0.9);
          &-panel {
            display: flex;
            justify-content: space-between;
            width: 100%;
            cursor: pointer;
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
          &:hover {
            filter: brightness(1);
          }
        }
        .quote-msg-other {
          background: #e2e2e2;
          padding: 6px 10px;
          margin-top: 0;
          &:hover {
            filter: brightness(0.9);
          }
        }
        /* 表情包 */
        .msg-emo img {
          user-select: none;
          max-width: 100px;
          -webkit-user-drag: none;
        }
        /* 连接地址 */
        .msg-url {
          color: blue !important;
          cursor: pointer;
        }
        .name {
          font-size: 14px;
          color: @message-main-text-color;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        /* 超级管理员昵称 */
        .super-admin-name {
          color: #d4af37;
          font-weight: bold;
        }
        /* 房间管理员昵称 */
        .room-admin-name {
          color: #9b59b6;
          font-weight: bold;
        }
        /* 角色标签样式 */
        .role-tag {
          font-size: 10px;
          padding: 1px 4px;
          border-radius: 3px;
          margin-left: 4px;
          font-weight: normal;
        }
        .super-tag {
          background: linear-gradient(135deg, #d4af37 0%, #f5d76e 100%);
          color: #fff;
          box-shadow: 0 1px 3px rgba(212, 175, 55, 0.4);
        }
        .admin-tag {
          background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
          color: #fff;
          box-shadow: 0 1px 3px rgba(52, 152, 219, 0.4);
        }
        .owner-tag {
          background: linear-gradient(135deg, #9b59b6 0%, #bb8fce 100%);
          color: #fff;
          box-shadow: 0 1px 3px rgba(155, 89, 182, 0.4);
        }
        .moderator-tag {
          background: linear-gradient(135deg, #27ae60 0%, #58d68d 100%);
          color: #fff;
          box-shadow: 0 1px 3px rgba(39, 174, 96, 0.4);
        }
        /* Bot 机器人图标 */
        .bot-icon {
          margin-left: 4px;
          vertical-align: middle;
          filter: drop-shadow(0 1px 2px rgba(0, 133, 255, 0.4));
        }
        /* Bot 昵称样式 */
        .bot-name {
          background: linear-gradient(135deg, #0085ff, #00c6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }
      }

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 6px;
      }
    }
  }
}
.mine {
  color: #000;
  justify-content: flex-end;
  .message-box-item-info {
    flex-direction: row;
    .info-box {
      align-items: flex-end;
      margin-right: 20px;
      .message {
        background-color: #a9e87a;
        color: #000;
        font-size: 14px;
      }
    }
  }
}
.other {
  justify-content: flex-start;
  .message-box-item-info {
    flex-direction: row-reverse;
    .info-box {
      align-items: flex-start;
      margin-left: 20px;
      .message {
        background-color: #eee;
        color: #000;
      }
    }
  }
}
.info {
  justify-content: center;
  .msg {
    font-size: 12px;
    color: #aaa;
    display: inline-block;
    background-color: @message-panel-tips-bg-color;
    padding: 2px 8px;
    border-radius: 3px;
    max-width: 500px;
  }
}
.notice {
  justify-content: center;
  &-box {
    text-align: left;
    max-width: 500px;
    background: @message-panel-tips-bg-color;
    padding: 10px 15px;
    border-radius: 10px;
    color: #999;
    font-size: 13px;
    display: flex;
    flex-direction: column;
    letter-spacing: 3px;
    &-header {
      display: flex;
      .title {
        font-size: 16px;
        color: #1295dd;
        display: inline-block;
        border-bottom: 2px dotted #1295dd;
        margin-bottom: 10px;
        padding-bottom: 5px;
      }
    }
  }
}

/* admin-text */
.admin-text {
  background: #000 !important;
  color: #fff !important;
}

/* homeowner */
.homeowner {
  background: #f0bc77 !important;
  color: #fff !important;
}

/* Inline Keyboard 按钮 */
.inline-keyboard {
  margin-top: 8px;
  &-row {
    display: flex;
    gap: 6px;
    margin-bottom: 5px;
  }
  &-btn {
    flex: 1;
    padding: 7px 14px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(0, 133, 255, 0.12) 0%, rgba(0, 198, 255, 0.12) 100%);
    color: #0085ff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    &:hover {
      background: linear-gradient(135deg, #0085ff 0%, #00c6ff 100%);
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(0, 133, 255, 0.3);
    }
    &:active {
      transform: translateY(0) scale(0.97);
      box-shadow: 0 1px 4px rgba(0, 133, 255, 0.2);
    }
  }
}

/* Bot 文件消息 */
.msg-file-bot {
  margin-top: 8px;
  &-panel {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(135deg, rgba(0, 133, 255, 0.06) 0%, rgba(0, 198, 255, 0.06) 100%);
    padding: 12px 16px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 133, 255, 0.08);
    transition: all 0.25s ease;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(0, 133, 255, 0.15);
    }
    .file-icon {
      color: #0085ff;
      flex-shrink: 0;
      filter: drop-shadow(0 1px 2px rgba(0, 133, 255, 0.3));
    }
    .file-detail {
      display: flex;
      flex-direction: column;
      gap: 4px;
      .file-name {
        color: inherit;
        font-weight: 500;
        text-decoration: none;
        word-break: break-all;
        &:hover {
          text-decoration: underline;
        }
      }
      .file-caption {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

/* Bot 正在输入 */
.bot-typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  margin: 4px 15px;
  font-size: 12px;
  color: #666;
  background: linear-gradient(135deg, rgba(0, 133, 255, 0.06) 0%, rgba(0, 198, 255, 0.08) 100%);
  border-radius: 16px;
  backdrop-filter: blur(6px);
  animation: fadeInUp 0.3s ease;
  .typing-dots {
    display: flex;
    gap: 3px;
    span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0085ff, #00c6ff);
      animation: botBounce 1.4s infinite ease-in-out both;
      &:nth-child(1) { animation-delay: -0.32s; }
      &:nth-child(2) { animation-delay: -0.16s; }
    }
  }
}
@keyframes botBounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 已编辑标记 */
.edited-tag {
  font-size: 11px;
  color: #bbb;
  margin-top: 2px;
}

/* @提及高亮 */
.mention-highlight {
  box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.5);
  border-radius: 6px;
}

/* Markdown 消息样式 */
.markdown-body {
  :deep(p) { margin: 0 0 4px; }
  :deep(code) {
    background: rgba(0,0,0,0.06);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
  }
  :deep(pre) {
    background: rgba(0,0,0,0.06);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    code { background: none; padding: 0; }
  }
  :deep(ul), :deep(ol) { padding-left: 16px; margin: 4px 0; }
  :deep(blockquote) {
    margin: 4px 0;
    padding-left: 10px;
    border-left: 3px solid #ccc;
    color: #888;
  }
  :deep(h1), :deep(h2), :deep(h3) { margin: 4px 0; }
  :deep(a) { color: #0085ff; }
}
</style>
