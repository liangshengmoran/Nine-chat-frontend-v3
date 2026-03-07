<template>
	<transition name="popup-box" mode="out-in">
		<div
			v-if="options && options.show"
			:style="{
				width: `${width}px`,
				height: `${height}px`,
				top: top != null ? `${top}px` : undefined,
				right: right != null ? `${right}px` : undefined,
				left: left != null ? `${left}px` : undefined,
				bottom: bottom != null ? `${bottom}px` : undefined,
			}"
			class="frame"
			@click.stop
		>
			<div class="frame-title title">
				{{ title }}
				<slot name="header"></slot>
			</div>
			<div class="frame-content"><slot></slot></div>
		</div>
	</transition>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
	options: { type: Object, default: () => ({}) },
	width: { type: Number, default: 350 },
	height: { type: Number, default: 500 },
	top: { type: Number, default: null },
	right: { type: Number, default: null },
	bottom: { type: Number, default: null },
	left: { type: Number, default: null },
	title: { type: String, default: '标题信息' },
});

const emit = defineEmits(['close']);

function bodyClose() {
	if (props.options.show === true) {
		emit('close');
	}
}

onMounted(() => {
	document.addEventListener('click', bodyClose);
});

onBeforeUnmount(() => {
	document.removeEventListener('click', bodyClose);
});
</script>

<style lang="less" scoped>
@media screen and (max-width: 480px) {
  .frame {
    position: absolute;
    right: 10px !important;
    left: 10px !important;
    height: 60vh !important;
    width: auto !important;
  }
}
.frame {
  transition: all 0.3s;
  position: absolute;
  width: 350px;
  height: 500px;
  box-shadow: 0 0 10px rgba(89, 36, 36, 0.2);
  background-color: @message-popup-bg-color;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  z-index: 99;
  .title {
    color: @message-main-text-color;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
  }
  &-title {
    font-size: 16px;
    padding: 10px 15px;
    padding-right: 10px;
    display: flex;
    align-items: center;
  }
  &-content {
    flex: 1;
    height: 0;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
