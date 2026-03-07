<template>
	<div class="global-config">
		<el-form label-position="left" label-width="140px">
			<el-form-item label="主题设置">
				<el-radio-group v-model="theme">
					<el-radio style="margin: 5px" value="default" border size="small">默认主题</el-radio>
					<el-radio style="margin: 5px" value="black" border size="small">暗黑主题</el-radio>
					<el-radio style="margin: 5px" value="transparent" border size="small">透明主题</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="开启所有提示">
				<el-switch v-model="show_all_tips"></el-switch>
			</el-form-item>
			<el-form-item label="是否提示进房信息">
				<el-switch v-model="showTipsJoinRoom"></el-switch>
			</el-form-item>
			<el-form-item label="是否提示退房信息">
				<el-switch v-model="showTipsQuitRoom"></el-switch>
			</el-form-item>
			<el-form-item label="是否提示切歌信息">
				<el-switch v-model="showTipsSwitchMusic"></el-switch>
			</el-form-item>
			<el-form-item label="是否提示播放信息">
				<el-switch v-model="showTipsPlayMusic"></el-switch>
			</el-form-item>
			<el-form-item label="是否提示房间公告">
				<el-switch v-model="showTipsNotice"></el-switch>
			</el-form-item>
			<el-form-item label="个性化工具栏">
				<el-button type="danger" size="small" @click="messageStore.clearTipsInfo()">清空提示信息</el-button>
				<el-button type="danger" size="small" @click="messageStore.clearNoticeInfo()">清空公告信息</el-button>
			</el-form-item>
			<el-form-item label="是否显示历史弹幕">
				<el-switch v-model="showHistoryBarrageInfo"></el-switch>
			</el-form-item>
			<el-form-item label="是否显示图片弹幕">
				<el-switch v-model="showBarrageImg"></el-switch>
			</el-form-item>
			<el-form-item label="是否显示弹幕头像">
				<el-switch v-model="showBarrageAvatar"></el-switch>
			</el-form-item>
			<el-form-item label="是否显示区域全屏">
				<el-switch v-model="is_screen"></el-switch>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useConfigStore } from '@/stores/config';
import { useMessageStore } from '@/stores/message';

const configStore = useConfigStore();
const messageStore = useMessageStore();

function makeComputed(key) {
	return computed({
		get: () => configStore[key],
		set: value => configStore.setGlobalRoomConfig({ key, value }),
	});
}

const theme = makeComputed('theme');
const show_all_tips = makeComputed('show_all_tips');
const showTipsJoinRoom = makeComputed('showTipsJoinRoom');
const showTipsQuitRoom = makeComputed('showTipsQuitRoom');
const showTipsSwitchMusic = makeComputed('showTipsSwitchMusic');
const showTipsPlayMusic = makeComputed('showTipsPlayMusic');
const showTipsNotice = makeComputed('showTipsNotice');
const showHistoryBarrageInfo = makeComputed('showHistoryBarrageInfo');
const showBarrageImg = makeComputed('showBarrageImg');
const showBarrageAvatar = makeComputed('showBarrageAvatar');
const is_screen = makeComputed('is_screen');
</script>

<style lang="less" scoped>
.global-config {
  padding: 0 15px;
  width: 100%;
  height: 100%;
}
</style>
