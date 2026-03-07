<template>
	<div class="lrc s-1-line">
		<span class="lrc-text">
			<icon name="music" class="icon" scale="1.6" />
			{{ lrc || '歌词正在加载中...' }}
		</span>
		<icon name="chat-header-setting" scale="1.8" class="icon-setting" @click="drawer = true" />
		<el-drawer title="个性配置" append-to-body size="auto" :model-value="drawer" direction="rtl" :modal="false" class="drawer" @update:model-value="drawer = $event">
			<GlobalConfig />
		</el-drawer>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMusicStore } from '@/stores/music';
import GlobalConfig from '@/components/GlobalConfig/index.vue';

const musicStore = useMusicStore();
const drawer = ref(false);

const lrc = computed(() => {
	if (!musicStore.music_lrc) return '';
	const res = musicStore.music_lrc.filter(t => t.time < musicStore.current_music_time);
	return res.length ? res[res.length - 1].lineLyric : '';
});
</script>

<style lang="less" scoped>
.lrc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding: 5px 15px;
  overflow: hidden;
  color: #999;
  &-text { flex: 1; }
  .icon { margin-right: 5px; }
  .icon-setting {
    cursor: pointer;
    width: 20px;
    position: absolute;
    right: 5px;
    z-index: 2;
  }
}
</style>
