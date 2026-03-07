<template>
	<div class="online">
		<div v-if="!createRoomVisible">
			<div
				v-for="(item, index) in roomStore.room_list"
				:key="index"
				:class="[
					'online-item',
					{ official: item.room_id == 888 },
					{ current: item.room_id == roomStore.room_id },
				]"
				@click="handlerJoinRoom(item)"
			>
				<img class="online-item-avatar" :src="item.room_logo" />
				<icon v-if="Number(item.room_id) === roomStore.room_id" name="chat-room-info-select" scale="2.6" class="mine-room" />
				<div class="online-item-info">
					<div class="online-item-info-name">
						<span>
							<span class="room-num">({{ item.on_line_nums }})</span>
							{{ item.room_name }}
						</span>
						<span v-if="item.room_id == 888" class="role hall">官方大厅</span>
						<span v-if="item.room_need_password === 2 && item.room_id != 888" class="lock">
							<icon name="chat-room-info-lock" scale="1.8" />
						</span>
					</div>
					<div class="online-item-info-desc s-1-line">
						{{ item.room_notice }}
					</div>
				</div>
			</div>
		</div>

		<el-dialog v-model="showJoinModal" title="更改房间提醒" width="320px" top="35vh" append-to-body>
			<span>是否退出当前房间并加入新的房间？</span>
			<template #footer>
				<span class="dialog-footer">
					<el-button size="small" @click="showJoinModal = false">我再想想</el-button>
					<el-button type="primary" size="small" @click="handlerConfirm">确认加入</el-button>
				</span>
			</template>
		</el-dialog>

		<el-dialog v-model="showPasswordModal" title="当前房间加密" width="30%" top="35vh" append-to-body @click.stop>
			<h5>当前房间加密，请先验证密码</h5>
			<el-form :model="passwordForm">
				<el-form-item>
					<el-input v-model="passwordForm.password" placeholder="请输入房间密码"></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button size="small" @click="showPasswordModal = false">返回房间</el-button>
					<el-button type="primary" size="small" @click="handlerJoinPasswordRoom">确认加入</el-button>
				</span>
			</template>
		</el-dialog>

		<div v-if="createRoomVisible" class="create">
			<el-form ref="createFormRef" label-position="left" label-width="80px" :rules="rules" :model="ruleform" size="small">
				<el-form-item label="房间名称" prop="room_name">
					<el-input v-model="ruleform.room_name" placeholder="请设置您的房间名称"></el-input>
				</el-form-item>
				<el-form-item label="房间号码" prop="room_id">
					<el-input v-model="ruleform.room_id" placeholder="请设置您的房间ID"></el-input>
				</el-form-item>
				<el-form-item label="是否加密" prop="room_need_password">
					<el-select v-model="ruleform.room_need_password" style="width: 100%" placeholder="请选择房间是否加密">
						<el-option label="加密" :value="1"></el-option>
						<el-option label="不加密" :value="0"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="Number(ruleform.room_need_password)" label="房间密码" prop="room_password">
					<el-input v-model="ruleform.room_password" placeholder="请设置您的房间密码"></el-input>
				</el-form-item>
				<el-form-item label="房间公告" prop="room_notice">
					<el-input v-model="ruleform.room_notice" type="textarea" :rows="3" placeholder="请设置您的房间公告 英文,为换行"></el-input>
				</el-form-item>
				<el-form-item label="房间头像" porp="room_logo">
					<el-upload class="avatar-uploader" :action="uploadUrl" :show-file-list="false" :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload">
						<img v-if="preImage" :src="preImage" class="avatar" />
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
				</el-form-item>
				<div class="create-footer">
					<el-button style="float: right" type="info" size="small" @click="emit('canel')">取消创建</el-button>
					<el-button style="float: right" type="primary" size="small" @click="handleCreateRoom">创建房间</el-button>
				</div>
			</el-form>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoomStore } from '@/stores/room';
import { useUserStore } from '@/stores/user';
import { createRoom } from '@/api/chat';

const _props = defineProps({
	createRoomVisible: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(['canel', 'close', 'create-success']);

const roomStore = useRoomStore();
const _userStore = useUserStore();

const uploadUrl = `${import.meta.env.VITE_BASE_API}/upload/file`;
const showJoinModal = ref(false);
const showPasswordModal = ref(false);
const activeRoomId = ref(null);
const preImage = ref(null);
const createFormRef = ref(null);

const passwordForm = reactive({
	password: null,
});

const ruleform = reactive({
	room_id: null,
	room_name: null,
	room_notice: null,
	room_need_password: null,
	room_logo: null,
});

const rules = {
	room_id: [
		{ required: true, message: '请设置您的房间ID', trigger: 'blur' },
		{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
	],
	room_name: [
		{ required: true, message: '请设置您的房间名称', trigger: 'blur' },
		{ min: 4, max: 8, message: '长度在 4 到 8 个字符', trigger: 'blur' },
	],
	room_notice: [
		{ required: true, message: '请设置您的房间公告', trigger: 'blur' },
		{ max: 520, message: '长度最长520字符', trigger: 'blur' },
	],
	room_need_password: [
		{ required: true, message: '请设置房间是否需要密码', trigger: 'change' },
	],
	room_password: [
		{ required: true, message: '请设置房间密码', trigger: 'change' },
		{ min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' },
	],
};

function handlerJoinRoom(room) {
	const { room_id, room_need_password } = room;
	if (Number(room_id) === Number(roomStore.room_id)) {
		return ElMessage.warning('已经在当前房间了');
	}
	if (room_need_password === 2) {
		return ElMessage.warning('当前房间已加密，禁止加入房间！');
	}
	activeRoomId.value = Number(room_id);
	showJoinModal.value = true;
}

function handlerConfirm() {
	roomStore.setRoomId(Number(activeRoomId.value));
	emit('close');
}

function handlerJoinPasswordRoom() {}

async function handleCreateRoom() {
	createFormRef.value.validate(async (valid) => {
		if (!valid) return;
		const { success } = await createRoom(ruleform);
		success && emit('create-success');
	});
}

function handleAvatarSuccess(res, file) {
	ruleform.room_logo = res.data;
	preImage.value = URL.createObjectURL(file.raw);
}

function beforeAvatarUpload(file) {
	const isLt2M = file.size / 1024 / 1024 < 1;
	if (!isLt2M) {
		ElMessage.error('上传头像图片大小不能超过 1MB!');
	}
	return isLt2M;
}
</script>
<style lang="less" scoped>
.online {
  display: flex;
  flex-direction: column;
  height: 440px;
  overflow: hidden;
  overflow-y: auto;
  &-item {
    cursor: pointer;
    padding: 10px;
    display: flex;
    align-items: center;
    transition: all 0.3s;
    border-left: 3px solid transparent;
    padding-left: 8px;
    position: relative;
    .mine-room {
      position: absolute;
      top: 5px;
      left: 0;
    }
    &:hover {
      border-left: 3px solid #1295dd;
    }
    &-avatar {
      width: 40px;
      height: 40px;
      border-radius: 5px;
      margin-right: 10px;
    }
    &-info {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 0;
      &-name {
        font-size: 14px;
        color: @message-main-text-color;
        font-weight: 500;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .role {
          background-color: #ccc;
          font-size: 12px;
          color: #fff;
          padding: 1px 10px;
          margin-right: 3px;
          border-radius: 3px;
        }
        .hall {
          background: #000;
          color: #fff;
        }
        .room-num {
          margin-right: 5px;
          color: red;
        }
      }
      &-desc {
        font-size: 12px;
        margin-top: 8px;
        color: rgb(144, 140, 140);
      }
    }
  }

  .official {
    border-bottom: 3px solid @message-border-color;
    border-top: 1px solid @message-border-color;
    margin-bottom: 15px;
  }
  .current {
    border-right: 3px solid #521cd373;

    .online-item-info-desc {
    }
  }

  .create {
    transition: all 0.3s;
    padding: 10px 20px;
    .create-footer {
      display: flex;
      margin-left: 80px;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
    border-radius: 6px;
    border: 1px dashed #ccc !important;
  }
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 6px;
    display: block;
    border: 1px solid #409eff;
  }
}
</style>
