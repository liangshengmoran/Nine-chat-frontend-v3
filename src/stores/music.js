import { defineStore } from 'pinia';

export const useMusicStore = defineStore('music', {
  state: () => ({
    music_info: null,
    music_lrc: null,
    music_src: null,
    music_start_time: null,
    current_music_time: null,
    music_queue_list: [],
  }),

  actions: {
    setCurrentMusicInfo({ music_info, music_lrc, music_src }) {
      this.music_info = music_info;
      this.music_lrc = music_lrc;
      this.music_src = music_src;
    },

    setCurrentMusicStartTime(time) {
      this.music_start_time = time;
    },

    setCurrentMusicTime(time) {
      this.current_music_time = time;
    },

    setQueueMusicList(list) {
      this.music_queue_list = list;
    },
  },
});
