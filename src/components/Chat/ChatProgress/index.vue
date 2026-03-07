<template>
	<div v-if="musicStore.music_info" class="progress">
		<div class="bar" :style="{ width: `${width}%` }"></div>
		<div class="current-music">
			<icon name="progress-music" class="icon" scale="1.8" />
			<span class="music-album">{{ musicStore.music_info.music_name }} - {{ musicStore.music_info.music_singer }}</span>
			<icon name="progress-collect" class="icon" scale="2.2" @click="handleCollect" />
			<icon name="progress-switch" class="icon" scale="2.2" @click="handleCutMusic" />
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useMusicStore } from '@/stores/music';
import { collectMusic } from '@/api/music';
import { emitSocket } from '@/composables/useSocket';

const musicStore = useMusicStore();

const width = computed(() => {
	if (!musicStore.current_music_time || !musicStore.music_info) return 0;
	const { music_duration } = musicStore.music_info;
	const w = ((Number(musicStore.current_music_time) / Number(music_duration)) * 100).toFixed(2);
	return w > 100 ? 100 : w;
});

async function handleCollect() {
	try {
		await collectMusic(musicStore.music_info);
		ElMessage.success('歌曲收藏成功！');
	} catch (error) { /* handled by interceptor */ }
}

function handleCutMusic() {
	emitSocket('cutMusic', musicStore.music_info);
}
</script>

<style lang="less" scoped>
@media screen and (max-width: 820px) {
  .current-music { top: -20px !important; }
}
.progress {
  height: 2px;
  width: 100%;
  background: @message-border-color;
  position: relative;
  .bar {
    height: 2px;
    background: linear-gradient(270deg, #4493d7, #fff);
  }
  .current-music {
    position: absolute;
    right: 0;
    height: 5px;
    top: 20px;
    display: flex;
    align-items: center;
    color: #999;
    user-select: none;
    z-index: 3;
    .music-album {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 300px;
    }
    .icon {
      transition: all 0.3s;
      margin-right: 5px;
      cursor: pointer;
      &:nth-child(2) {
        margin-left: 5px;
        &:hover { color: #409eff; }
      }
      &:nth-child(3) {
        &:hover { color: #ff4500; }
      }
      &:active { transform: scale(1.2); }
    }
  }
}
</style>
