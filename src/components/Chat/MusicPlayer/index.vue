<template>
	<div class="music">
		<audio v-if="musicStore.music_src" ref="musicRef" :src="musicStore.music_src" autoplay @timeupdate="updateTime"></audio>
	</div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { useMusicStore } from '@/stores/music';

const musicStore = useMusicStore();
const musicRef = ref(null);
let time = null;
let isPlay = false;

watch(() => musicStore.music_start_time, (n) => {
	time = n;
	specifiedTime(n);
});

function specifiedTime(currentTime) {
	nextTick(() => {
		if (!musicRef.value) return;
		if (musicRef.value.fastSeek) {
			musicRef.value.fastSeek(currentTime);
		} else {
			musicRef.value.currentTime = currentTime;
			musicRef.value.play();
		}
	});
}

function updateTime(e) {
	musicStore.setCurrentMusicTime(e.target.currentTime);
}

function handlerTouchPlay() {
	if (!isPlay && time && musicRef.value) {
		musicRef.value.currentTime = time;
		musicRef.value.play();
		isPlay = true;
		document.removeEventListener('touchstart', handlerTouchPlay);
	}
}

onMounted(() => {
	document.addEventListener('touchstart', handlerTouchPlay, false);
});

defineExpose({ play: () => musicRef.value?.play(), pause: () => musicRef.value?.pause(), specifiedTime });
</script>
