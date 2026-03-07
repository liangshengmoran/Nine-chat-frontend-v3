import { defineStore } from 'pinia';
import { setTheme } from '@/theme';

export const useConfigStore = defineStore('config', {
  state: () => ({
    show_all_tips: true,
    showTipsJoinRoom: true,
    showTipsQuitRoom: true,
    showTipsSwitchMusic: true,
    showTipsPlayMusic: true,
    showTipsNotice: true,
    showHistoryBarrageInfo: true,
    showBarrageImg: false,
    showBarrageAvatar: true,
    theme: 'black',
    is_screen: false,
  }),

  actions: {
    setGlobalRoomConfig({ key, value }) {
      this[key] = value;
      localStorage.setItem(key, typeof value === 'boolean' ? JSON.stringify(value) : value);
      if (key === 'theme') {
        setTheme(value);
      }
    },
  },
});
