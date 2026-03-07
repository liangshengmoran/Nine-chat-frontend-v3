import { defineStore } from 'pinia';
import { getInfo } from '@/api/user';
import router from '@/router';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    user_info: null,
  }),

  getters: {
    mine_id: (state) => state.user_info?.user_id,
    mine_room_id: (state) => state.user_info?.user_room_id,
    mine_room_bg: (state) => state.user_info?.user_room_bg,
  },

  actions: {
    setToken(token) {
      this.token = token;
    },

    setUserInfo(user_info) {
      this.user_info = user_info;
    },

    async getUserInfo() {
      const res = await getInfo();
      this.user_info = res.data.user_info;
      return true;
    },

    logout() {
      localStorage.removeItem('chat_token');
      this.token = null;
      this.user_info = null;
      router.push('/login');
    },
  },
});
