<template>
	<transition name="slide">
		<div v-if="show" class="animation-content">
			<div ref="imgContentRef" class="img-view">
				<img ref="imgRef" v-dragwidth draggable="false" :width="img.w" :height="img.h" :src="filePath" @error="handleError" />
			</div>
			<div class="btns">
				<div class="iconfont icon-guanbi" @click="handleClose">
					<icon name="chat-pre-close" scale="1.8" />
				</div>
				<div class="iconfont icon-huifu" @click="handleRef">
					<icon name="chat-pre-recovert" scale="1.8" />
				</div>
				<div class="iconfont icon-xiazai" @click="handleDownFile">
					<icon name="chat-pre-download" scale="1.8" />
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { aspectRatioToWH, getImgBlod } from '@/utils/tools';

const vDragwidth = {
	mounted(el) {
		const odiv = el;
		let x = 0, y = 0, l = 0, t = 0, isDown = false;
		odiv.onmousedown = function (e) {
			if (e.button === 0) {
				x = e.clientX; y = e.clientY;
				l = odiv.offsetLeft; t = odiv.offsetTop;
				isDown = true;
				document.onmousemove = function (e) {
					if (!isDown) return;
					odiv.style.left = `${e.clientX - (x - l)}px`;
					odiv.style.top = `${e.clientY - (y - t)}px`;
				};
				document.onmouseup = function () {
					isDown = false;
					document.onmousemove = null;
					document.onmouseup = null;
				};
			}
		};
	},
};

const props = defineProps({
	data: { type: Object, default: () => ({}) },
});

const show = ref(false);
const filePath = ref('');
const img = ref({ w: 0, h: 0 });
const imgRef = ref(null);
const imgContentRef = ref(null);
let clientWidth = 0;
let clientHeight = 0;
let _originalW = 0;
let minImg = { w: 0, h: 0 };

watch(() => props.data, (val) => {
	if (!val || !Object.keys(val).length) return;
	const { width, height, downFilePath, url } = val;
	show.value = true;
	filePath.value = url;
	img.value = aspectRatioToWH(clientWidth - 100, clientHeight - 200, width / height, width, height);
	_originalW = width;
	minImg = { ...img.value };
	setTimeout(() => {
		if (imgRef.value) {
			imgRef.value.style.left = 'auto';
			imgRef.value.style.top = 'auto';
		}
		if (imgContentRef.value) {
			imgContentRef.value.addEventListener('wheel', setImgWH);
		}
	}, 800);
	if (!downFilePath) return;
	getImgBlod(downFilePath).then(res => {
		filePath.value = res;
		img.value = aspectRatioToWH(clientWidth - 100, clientHeight - 200, width / height, width, height);
	}).catch(() => {
		ElMessage.error('图片加载失败');
	});
}, { deep: true });

onMounted(() => {
	const rect = document.documentElement.getBoundingClientRect();
	clientWidth = rect.width;
	clientHeight = rect.height;
});

function handleRef() {
	if (imgRef.value) {
		imgRef.value.style.left = 'auto';
		imgRef.value.style.top = 'auto';
	}
	img.value = { ...minImg };
}

function handleError() {
	ElMessage.error('图片加载失败');
}

function setImgWH(e) {
	if (!imgRef.value) return;
	const oX = imgRef.value.offsetLeft + img.value.w / 2;
	const oY = imgRef.value.offsetTop + img.value.h / 2;
	if (e.wheelDeltaY > 0) {
		img.value.w += img.value.w * 0.1;
		img.value.h += img.value.h * 0.1;
	} else {
		img.value.w -= img.value.w * 0.1;
		img.value.h -= img.value.h * 0.1;
	}
	if (img.value.w < minImg.w) img.value.w = minImg.w;
	if (img.value.h < minImg.h) img.value.h = minImg.h;
	imgRef.value.style.left = `${oX - img.value.w / 2}px`;
	imgRef.value.style.top = `${oY - img.value.h / 2}px`;
}

function handleClose() {
	show.value = false;
}

function handleDownFile() {
	ElMessage.warning('服务器资源有限，暂不提供原图下载功能！');
}
</script>

<style lang="less" scoped>
.animation-content {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 999;
  backdrop-filter: blur(20px);
  overflow: hidden;
  .img-view {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    img { position: absolute; }
    .zoom-bage {
      position: absolute;
      right: 0px;
      bottom: 10px;
      font-size: 14px;
      color: #fff;
      width: 88px;
      text-align: center;
    }
  }
  .btns {
    position: absolute;
    right: 20px;
    bottom: 60px;
    transform: translateY(-50%);
    color: #ffffff9e;
    z-index: 1000;
    div {
      margin: 10px 0;
      display: flex;
      width: 35px;
      height: 35px;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
      background: #0016484f;
      cursor: pointer;
      &:hover {
        background: #38acfa;
        color: #ffffff;
      }
      &.shoucang {
        color: #38acfa;
        &:hover { color: #ffffff; }
      }
    }
  }
}
.slide-enter-active {
  transition: all 0.5s, border-radius 0.8s 0.3s;
}
.slide-leave-active {
  transition: all 0.8s;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  border-radius: 0 0 100% 0;
  width: 10px;
  height: 10px;
  background: #000;
}
.slide-leave-to {
  border-radius: 0 0 0 100%;
  right: 0;
}
</style>
