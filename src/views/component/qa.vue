<template>
  <div class="qa">
    <!-- 点击按钮时，调用 openChatRoom 方法在新窗口打开 Discord 邀请链接 -->
    <div class="chat-button" @click="openChatRoom">
      <img src="../../assets/icons/menu/Q&A.png" alt="">
      <span>聊天室</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "qa",
  methods: {
    openChatRoom() {
      // 用 window.open 在浏览器新标签页中打开你指定的 Discord 邀请链接
      window.open('https://discord.gg/FMKBGXFJ', '_blank');
    }
  }
};
</script>

<style lang="scss" scoped>
.qa {
  position: fixed;
  width: 0.5rem;
  height: 0.55rem;
  display: flex;
  bottom: 0.1rem;
  right: 1.5rem;
  z-index: 1;
  cursor: pointer;
  .chat-button {
    cursor: pointer;
    width: 0.5rem;
    height: 0.55rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    img {
      width: 0.35rem;
      height: 0.35rem;
    }
    span {
      white-space: nowrap;
      font-size: 0.12rem;
    }
  }
}
</style>
