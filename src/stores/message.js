import { defineStore } from 'pinia';
import { useConfigStore } from './config';

export const useMessageStore = defineStore('message', {
  state: () => ({
    messageList: [],
    un_read_msg_num: 0,
    botTypingInfo: null,
  }),

  actions: {
    setMessageDataList(messageInfo) {
      const isArray = Array.isArray(messageInfo);
      let result = [];
      if (isArray) {
        result = [...messageInfo, ...this.messageList];
      } else {
        result = [...this.messageList, messageInfo];
      }
      const configStore = useConfigStore();
      this.messageList = configStore.show_all_tips
        ? result
        : result.filter((t) => t.message_type !== 'info');
    },

    updateMessageList({ id, msg }) {
      const messageIndex = this.messageList.findIndex((t) => t.id === id);
      if (messageIndex !== -1) {
        this.messageList[messageIndex].message_content = msg;
        this.messageList[messageIndex].message_type = 'info';
      }
      this.messageList.forEach((item) => {
        if (item?.quote_info?.quote_message_id === id) {
          item.quote_info.quote_message_status = -1;
        }
      });
    },

    updateMessageContent({ id, message_content, message_type }) {
      const messageIndex = this.messageList.findIndex((t) => t.id === id);
      if (messageIndex !== -1) {
        const msg = this.messageList[messageIndex];
        msg.message_content = message_content;
        if (message_type) msg.message_type = message_type;
        msg.edited = true;
        this.messageList = [...this.messageList];
      }
    },

    clearTipsInfo() {
      this.messageList = this.messageList.filter((t) => t.message_type !== 'info');
    },

    clearNoticeInfo() {
      this.messageList = this.messageList.filter((t) => t.message_type !== 'notice');
    },

    emptyMessageDataList() {
      this.messageList = [];
    },

    setBotTyping(info) {
      this.botTypingInfo = info;
    },

    setUnReadMsgNum(num) {
      this.un_read_msg_num = num;
    },
  },
});
