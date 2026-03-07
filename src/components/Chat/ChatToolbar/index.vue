<template>
	<div class="toolbar">
		<chat-popup :options="opt1" :bottom="55" :left="10" :width="500" :height="400" title="表情包" @close="closeBox">
			<toolbar-emotion @emotion="(val) => emit('emotion', val)" />
		</chat-popup>
		<chat-popup :options="opt2" :bottom="55" :left="10" :width="500" :height="400" title="点歌台" @close="closeBox">
			<toolbar-choose-music />
		</chat-popup>
		<chat-popup :options="opt3" :bottom="55" :left="10" :width="500" :height="400" title="等待播放中的歌曲" @close="closeBox">
			<toolbar-queue-music />
		</chat-popup>
		<chat-popup :options="opt4" :bottom="55" :left="10" :width="500" :height="400" title="我收藏的歌单" @close="closeBox">
			<toolbar-collect />
		</chat-popup>
		<div class="toolbar-left">
			<div :class="['toolbar-left-item', 'flex_center', { 'active-menu': opt1.show }]" @click.stop="openBox(1)">
				<icon name="toolbar-pic" class="m_r5" scale="1.6" /> 表情
			</div>
			<div :class="['toolbar-left-item', 'flex_center', { 'active-menu': opt2.show }]" @click.stop="openBox(2)">
				<icon name="toolbar-music" class="m_r5" scale="1.6" /> 点歌
			</div>
			<div :class="['toolbar-left-item', 'flex_center', { 'active-menu': opt3.show }]" @click.stop="openBox(3)">
				<icon name="toolbar-hook" class="m_r5" scale="1.6" /> 已点
			</div>
			<div :class="['toolbar-left-item', 'flex_center', { 'active-menu': opt4.show }]" @click.stop="openBox(4)">
				<icon name="toolbar-love" class="m_r5" scale="1.6" /> 收藏
			</div>
			<el-popover placement="top" title="添加作者微信" trigger="click" width="auto">
				<template #reference>
					<div style="margin-left: 0; color: #09bd12" :class="['toolbar-left-item', 'flex_center']">
						<icon name="toolbar-wx" class="m_r5" scale="1.8" /> 微信
					</div>
				</template>
				<wx-pre />
			</el-popover>
		</div>
		<div class="toolbar-right"></div>
	</div>
</template>

<script setup>
import { reactive, defineAsyncComponent } from 'vue';
import ChatPopup from '@/components/ChatPopup/index.vue';
const ToolbarEmotion = defineAsyncComponent(() => import('./components/ToolbarEmotion.vue'));
const ToolbarChooseMusic = defineAsyncComponent(() => import('./components/ToolbarChooseMusic.vue'));
const ToolbarQueueMusic = defineAsyncComponent(() => import('./components/ToolbarQueueMusic.vue'));
const ToolbarCollect = defineAsyncComponent(() => import('./components/ToolbarCollect.vue'));
import WxPre from './components/WxPre.vue';

const emit = defineEmits(['emotion']);
const opt1 = reactive({ show: false });
const opt2 = reactive({ show: false });
const opt3 = reactive({ show: false });
const opt4 = reactive({ show: false });
const opts = [opt1, opt2, opt3, opt4];

function openBox(val) {
	const target = opts[val - 1];
	if (target.show) { target.show = false; return; }
	closeBox();
	target.show = true;
}

function closeBox() {
	opts.forEach(o => (o.show = false));
}

defineExpose({ openBox });
</script>

<style lang="less" scoped>
.toolbar {
  position: relative;
  display: flex;
  justify-content: space-between;
  color: #999;
  padding: 3px 0;
  .active-menu { background: @message-hover-bg-color !important; }
  &-left {
    display: flex;
    &-item {
      user-select: none;
      margin-right: 5px;
      padding: 5px 10px;
      border-radius: 5px;
      transition: all 0.3s;
      cursor: pointer;
      position: relative;
      &:nth-child(1) { margin-left: 15px; }
      &:hover { background: @message-hover-bg-color; }
      .wx-container { position: absolute; bottom: 50px; }
    }
    .icon { margin-right: 4px; }
  }
}
</style>
