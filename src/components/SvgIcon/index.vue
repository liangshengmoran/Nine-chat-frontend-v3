<template>
	<div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-bind="$attrs"></div>
	<svg v-else :class="svgClass" :style="{ fontSize }" aria-hidden="true" v-bind="$attrs">
		<use :xlink:href="iconName" />
	</svg>
</template>

<script setup>
import { computed } from 'vue';
import { isExternal as checkExternal } from '@/utils/validate';

const props = defineProps({
	name: { type: String, required: true },
	className: { type: String, default: '' },
	scale: { type: String, default: '1' },
});

const isExternal = computed(() => checkExternal(props.name));
const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => props.className ? `svg-icon ${props.className}` : 'svg-icon');
const fontSize = computed(() => `${Number(props.scale) * 8}px`);
const styleExternalIcon = computed(() => ({
	mask: `url(${props.name}) no-repeat 50% 50%`,
	'-webkit-mask': `url(${props.name}) no-repeat 50% 50%`,
	fontSize: fontSize.value,
}));
</script>

<style scoped>
.svg-icon {
  width: 1.1em;
  height: 1.1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>
