<template>
	<div class="persion">
		<div class="header">
			<el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
				<img :src="form.room_logo" class="avatar" />
			</el-upload>
		</div>
		<span class="uuid">专属房间ID: {{ uuid }}</span>
		<div class="form">
			<el-form ref="userForm" :model="form" label-position="right" label-width="80px" size="small" :rules="rules">
				<el-form-item prop="room_name" label="房间名称">
					<el-input v-model="form.room_name" clearable placeholder="输入您的房间名称" />
				</el-form-item>
				<el-form-item prop="room_need_password" label="房间权限">
					<el-select v-model="form.room_need_password" placeholder="请选择您的房间权限" style="width: 100%">
						<el-option label="房间加密" :value="2"></el-option>
						<el-option label="公开房间" :value="1"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="room_interval" label="点歌间隔">
					<el-input v-model="form.room_interval" disabled clearable placeholder="输入您的房间名称" />
				</el-form-item>
				<el-form-item prop="room_speak" label="发言权限">
					<el-select v-model="form.room_speak" disabled placeholder="请选择您的发言权限" style="width: 100%">
						<el-option label="允许所有人发言" :value="1"></el-option>
						<el-option label="禁止所有人发言" :value="2"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="room_choose" label="点歌权限">
					<el-select v-model="form.room_choose" disabled placeholder="请选择您的点歌权限" style="width: 100%">
						<el-option label="允许所有人点歌" :value="1"></el-option>
						<el-option label="禁止所有人点歌" :value="2"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="room_password" label="房间密码">
					<el-input v-model="form.room_password" show-password clearable placeholder="如不更改，无需填写" />
				</el-form-item>
				<el-form-item prop="room_notice" label="房间公告">
					<el-input v-model="form.room_notice" type="textarea" :rows="5" placeholder="请填写房间公告、以英文,换行" />
				</el-form-item>
			</el-form>
			<div class="btns">
				<el-button class="btn" size="small" type="danger" @click="removeRoomBgImg">移除房间背景</el-button>
				<el-button class="btn" size="small" type="primary" @click="updateUser">更新资料</el-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useRoomStore } from '@/stores/room';
import { updateRoomInfo } from '@/api/chat';
import { emitSocket } from '@/composables/useSocket';

const userStore = useUserStore();
const roomStore = useRoomStore();

const uploadUrl = `${import.meta.env.VITE_BASE_API}/upload/file`;
const userForm = ref(null);
const uuid = ref('');

const form = reactive({
	room_id: null,
	room_name: null,
	room_notice: null,
	room_need_password: null,
	room_password: null,
	room_logo: null,
	room_speak: 1,
	room_choose: 1,
	room_interval: 8,
});

const rules = {
	room_name: [
		{ required: true, message: '请输入您房间名称', trigger: 'blur' },
		{ min: 1, max: 12, message: '长度在1到10个字符', trigger: 'blur' },
	],
	room_notice: [
		{ required: true, message: '请输入房间公告', trigger: 'blur' },
		{ max: 512, message: '最长为512字符', trigger: 'blur' },
	],
	room_need_password: [
		{ required: true, message: '请设置房间权限', trigger: 'change' },
	],
};

function initRoomInfo() {
	const roomInfo = roomStore.currentRoomInfo;
	if (!roomInfo) return;
	const { room_name, room_notice, room_need_password, room_logo, room_id } = roomInfo;
	Object.assign(form, { room_name, room_notice, room_need_password, room_logo, room_id });
	uuid.value = room_id.toString().padStart(3, 0);
}

function handleAvatarSuccess(res) {
	if (!res.success) return ElMessage.error('上传头像失败');
	form.room_logo = res.data;
}

function beforeAvatarUpload(file) {
	const isLt1M = file.size / 1024 / 1024 < 1;
	if (!isLt1M) {
		ElMessage.error('上传头像图片大小不能超过1MB!');
	}
	return isLt1M;
}

function updateUser() {
	userForm.value.validate(async (valid) => {
		if (!valid) return;
		await updateRoomInfo(form);
		ElMessage.success('修改房间设置完成');
		await roomStore.getRoomInfo();
		const { room_name, room_notice, room_need_password, room_id, room_bg_img, room_logo } = form;
		const newRoomInfo = {
			room_name,
			room_notice,
			room_need_password,
			room_bg_img,
			room_logo,
			room_id,
			room_user_id: userStore.mine_id,
		};
		emitSocket('updateRoomInfo', newRoomInfo);
	});
}

async function removeRoomBgImg() {
	await updateRoomInfo({ room_bg_img: '', room_id: form.room_id });
	ElMessage.success('已移除掉您的房间背景！');
	await roomStore.getRoomInfo();
	const { room_name, room_notice, room_need_password, room_id, room_bg_img, room_logo } = form;
	const newRoomInfo = {
		room_name,
		room_notice,
		room_need_password,
		room_bg_img,
		room_logo,
		room_id,
		room_user_id: userStore.mine_id,
	};
	emitSocket('updateRoomInfo', newRoomInfo);
}

initRoomInfo();
</script>
<style lang="less" scoped>
.persion {
  padding: 0 15px;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;

  .uuid {
    display: inline-block;
    font-size: 12px;
    background: #ccc;
    padding: 2px 5px;
    color: #fff;
    font-weight: 600;
    border-radius: 5px;
    margin-top: 5px;
  }

  .form {
    width: 100%;
    margin-top: 15px;
  }

  .btns {
    display: flex;
    justify-content: flex-end;
    .btn {
      margin-left: 10px;
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  border-radius: 6px;
  border: 1px dashed #ccc !important;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  display: block;
  border: 1px solid #ddd8d8;
}
</style>
