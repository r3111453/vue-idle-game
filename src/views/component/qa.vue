<template>
  <div class="qa">
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
      window.open('https://tlk.io/547f05', '_blank');
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
