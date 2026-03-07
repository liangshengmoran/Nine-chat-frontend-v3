<template>
	<div class="wx">
		<img :src="wxImg" />
	</div>
</template>

<script setup>
const wxImg = '/basic/wx.png';
</script>

<style lang="less" scoped>
.wx{
	padding: 0;
	box-sizing: border-box;
	img{
		width: 100%;
		max-width: 200px;
		display: block;
		border-radius: 5px;
		filter: brightness(.9);
	}
}
</style>
