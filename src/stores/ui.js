import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    pre_img: null,
  }),

  actions: {
    setPreImg(img) {
      this.pre_img = img;
    },
  },
});
