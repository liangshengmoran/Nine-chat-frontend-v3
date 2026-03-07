<template>
	<div class="emotion">
		<div class="emotion-header">
			<input ref="inputRef" v-model="keyword" type="text" placeholder="搜索您喜欢的表情包吧" @keydown.enter="search" @input="onInput" />
			<div class="emotion-header-btn" @click="search">
				<icon name="toolbar-search" class="icon" scale="1.6" />
				搜索
			</div>
		</div>
		<div v-loading="loading" class="emotion-content">
			<emotion v-if="!emoticonList.length" ref="emotionRef" :padding="0" :show-categories="false" @emotion="handleEmotion" />
			<div v-else class="emotion-content-emoji">
				<div v-for="(url, index) in emoticonList" :key="index" class="resulu">
					<img :src="url" class="resulu-pic" @click="sendEmoji(url)" />
				</div>
			</div>
		</div>
		<div v-if="!emoticonList.length" class="emotion-categories">
			<div v-for="(category, index) in categories" :key="category.category" :class="['category-tab', { active: currentCategory === index }]" @click="switchCategory(index)">
				{{ category.category }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import Emotion from '@/components/Emotion/Emotion.vue';
import { getAllCategories } from '@/components/Emotion/emotion';
import { queryEmo } from '@/api/emoticon';
import { emitSocket } from '@/composables/useSocket';

const emit = defineEmits(['emotion']);

const inputRef = ref(null);
const emotionRef = ref(null);
const loading = ref(false);
const keyword = ref(null);
const emoticonList = ref([]);
const allowImgExt = ['png', 'jpg', 'jpeg', 'gif'];
const categories = ref([]);
const currentCategory = ref(0);

onMounted(() => {
	categories.value = getAllCategories();
});

watch(currentCategory, (val) => {
	if (emotionRef.value) {
		emotionRef.value.switchCategory(val);
	}
});

function switchCategory(index) {
	currentCategory.value = index;
}

function handleEmotion(val) {
	emit('emotion', val);
}

async function search() {
	if (!keyword.value) return;
	loading.value = true;
	try {
		const res = await queryEmo({ keyword: keyword.value });
		emoticonList.value = res.data;
	} catch (error) { /* ignore */ }
	loading.value = false;
}

function onInput(e) {
	if (!e.target.value) {
		emoticonList.value = [];
	}
}

function getFileType(name) {
	return name.substr(name.lastIndexOf('.') - name.length + 1).toLowerCase();
}

function sendEmoji(url) {
	const ext = getFileType(url);
	if (!allowImgExt.includes(ext)) return ElMessage.error('当前格式表情包被拒绝，请联系管理员');
	const content = { name: '', size: '', ext, url };
	const data = {
		message_type: 'emo',
		message_content: JSON.stringify(content),
	};
	emitSocket('message', data);
}
</script>

<style lang="less" scoped>
.emotion {
  padding: 0 10px 3px 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
  &-header {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid @message-border-color;
    transition: all 0.3s;
    font-size: 13px;
    color: @message-main-text-color;
    border-radius: 5px;
    margin: 7px 0;
    input {
      padding: 8px 16px;
      flex: 1;
      font-size: 13px;
      outline: none;
      border: none;
      color: @message-main-text-color;
      background: transparent;
      &::placeholder {
        color: #ccc;
        font-size: 14px;
      }
    }
    &-btn {
      padding: 9px 18px;
      border-left: 1px solid @message-border-color;
      user-select: none;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      .icon {
        margin-right: 3px;
      }
      &:hover {
        filter: brightness(0.8);
        border-left: 1px solid transparent;
      }
      &:active {
        filter: brightness(1.2);
      }
    }
  }

  &-content {
    flex: 1;
    min-height: 0;
    user-select: none;
    overflow: hidden;
    overflow-y: auto;
    &-emoji {
      display: flex;
      flex-wrap: wrap;
      img {
        width: 82px;
        height: 82px;
        margin: 6px;
        border-radius: 8px;
        border: 1px solid @message-border-color;
        padding: 0;
        cursor: pointer;
        user-select: none;
        -webkit-user-drag: none;
        transition: all 0.3s;
        &:active {
          transform: scale(1.3);
        }
      }
    }
  }

  &-categories {
    display: flex;
    padding: 3px 0;
    gap: 5px;
    color: #999;

    .category-tab {
      padding: 5px 10px;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s;
      font-size: 13px;
      border-radius: 5px;

      &:hover {
        background: @message-hover-bg-color;
      }

      &.active {
        background: @message-hover-bg-color;
        color: @message-main-text-color;
      }
    }
  }
}
</style>
