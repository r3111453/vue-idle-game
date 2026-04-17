<template>
  <div class="shop-panel">
    <!-- 这里保留你原有的商店界面结构，只修改免费刷新按钮部分 -->
    <div class="free-refresh-area">
      <button 
        @click="freeRefresh" 
        :disabled="freeRefreshRemainSec > 0"
        class="free-refresh-btn"
      >
        免费刷新 
        <span v-if="freeRefreshRemainSec > 0">({{ freeRefreshRemainSec }}秒后)</span>
        <span v-else>(可用)</span>
      </button>
      <!-- 其他原有的金币刷新按钮等保持不变 -->
    </div>
    <!-- 下面是你原有的商品列表等 -->
    <div class="items">
      <!-- ... 原有内容 ... -->
    </div>
  </div>
</template>

<script>
export default {
  name: "shopPanel",
  data() {
    return {
      // 免费刷新的剩余冷却秒数（0 表示可用）
      freeRefreshRemainSec: 0,
      // 上一次免费刷新的时间戳（毫秒）
      lastFreeRefreshTime: null,
      // 你原有的其他 data 变量（如装备列表、金币等）
      // ...
    };
  },
  mounted() {
    // 读取本地存储的冷却状态
    this.loadFreeRefreshState();
    // 启动每秒倒计时
    this.startFreeRefreshTimer();
    // 你原有的 mounted 逻辑（如加载商店物品等）
    // ...
  },
  methods: {
    // 从 localStorage 加载冷却状态
    loadFreeRefreshState() {
      const last = localStorage.getItem('shop_lastFreeRefreshTime');
      if (last) {
        this.lastFreeRefreshTime = parseInt(last);
        const elapsed = (Date.now() - this.lastFreeRefreshTime) / 1000;
        if (elapsed < 3) {
          this.freeRefreshRemainSec = Math.ceil(3 - elapsed);
        } else {
          this.freeRefreshRemainSec = 0;
        }
      } else {
        this.freeRefreshRemainSec = 0;
      }
    },
    // 启动每秒计时器，减少剩余秒数
    startFreeRefreshTimer() {
      setInterval(() => {
        if (this.freeRefreshRemainSec > 0) {
          this.freeRefreshRemainSec--;
          if (this.freeRefreshRemainSec === 0) {
            // 冷却结束，可刷新（可选：播放提示音等）
          }
        }
      }, 1000);
    },
    // 免费刷新商店
    freeRefresh() {
      if (this.freeRefreshRemainSec > 0) {
        // 还在冷却中，无法刷新
        return;
      }
      // 执行你的原有免费刷新逻辑（重新生成商店物品）
      this.refreshShopItems();   // 请替换为你实际刷新的方法名
      // 记录冷却开始
      this.lastFreeRefreshTime = Date.now();
      this.freeRefreshRemainSec = 3;
      localStorage.setItem('shop_lastFreeRefreshTime', this.lastFreeRefreshTime);
    },
    // 原有的刷新商店物品的方法（请保留你原来的实现）
    refreshShopItems() {
      // 例如：this.shopItems = generateRandomItems();
      // 这里只是示例，你需要保留原有代码
    },
    // 你原有的其他方法（金币刷新等）
    // ...
  }
};
</script>

<style lang="scss" scoped>
/* 你原有的样式保持不变，可适当调整免费刷新按钮的样式 */
.free-refresh-btn {
  background: #4caf50;
  border: none;
  color: white;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}
.free-refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
