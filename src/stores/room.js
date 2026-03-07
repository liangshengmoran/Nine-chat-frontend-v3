import { defineStore } from 'pinia';
import { queryRoomInfo } from '@/api/chat';

export const useRoomStore = defineStore('room', {
  state: () => ({
    room_id: 888,
    room_list: [],
    on_line_user_list: [],
    room_admin_info: {},
    room_info: null,
  }),

  getters: {
    room_admin_id: (state) => state.room_admin_info?.id,
    onLineUserNum: (state) => state.on_line_user_list.length,
    onLineRoomNum: (state) => state.room_list.length,
    currentRoomInfo: (state) => state.room_list.find((t) => t.room_id === state.room_id),
  },

  actions: {
    setRoomId(id) {
      this.room_id = Number(id);
    },

    setRoomList(room_list) {
      this.room_list = room_list;
    },

    setOnlineUserList(on_line_user_list) {
      this.on_line_user_list = on_line_user_list;
    },

    setRoomAdminInfo(room_admin_info) {
      this.room_admin_info = room_admin_info;
    },

    setRoomInfo(room_info) {
      this.room_info = room_info;
    },

    async getRoomInfo() {
      const res = await queryRoomInfo({ room_id: this.room_id });
      this.room_info = res.data;
      return true;
    },
  },
});
