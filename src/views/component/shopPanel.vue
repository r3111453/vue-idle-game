<template>
  <div class="shop">
    <div class="content">
      <div class="grid" v-for="(v, k) in grid" :key="k">
        <div class="title" v-if="v.lv" @contextmenu.prevent="openMenu(k, $event)" @mouseover="showItemInfo($event, v.itemType, v)" @mouseleave="closeItemInfo" @touchstart.stop.prevent="openMenu(k,$event)">
          <div class="icon" :style="{ 'box-shadow': 'inset 0 0 7px 2px ' + v.quality.color }">
            <img :src="v.type.iconSrc" alt="" />
          </div>
          <span class="info" :style="{'font-size':(parseInt(v.gold)>99999?0.18:0.22)+'rem'}">{{v.gold}}</span>
        </div>
      </div>
    </div>
    <div class="handle">
      <div class="info">
        <span>免费刷新剩余次数：{{ freeRefreshCount }} / 100</span>
        <span>金币刷新：100金币</span>
      </div>
      <div class="button" @click="goldRefreshShopItems()">100金币刷新</div>
      <div class="button" :disabled="freeRefreshCount <= 0" @click="freeRefreshHandler()">免费刷新</div>
    </div>
    <ul v-show="visible" :style="{ left: left + 'px', top: top + 'px' }" class="contextmenu">
      <li @click="showItemInfo($event,currentItem.itemType,currentItem,'touch')" v-if="$store.state.operatorSchemaIsMobile">查看</li>
      <li @click="buyTheEquipment()">购买</li>
    </ul>
  </div>
</template>
<script>
import { assist } from "../../assets/js/assist";
export default {
  name: "shop",
  data() {
    return {
      grid: [],
      left: "",
      top: "",
      visible: false,
      currentItem: {},
      currentItemIndex: "",
      freeRefreshCount: 100,
      lastRecoverTime: null,
      refreshTime: 5,
      timeo: 60,
      timeStart: false,
      timeInterval: '',
      isTouch: false,
      tipsFlag: false,
      tipsFlagComfirm: false,
    };
  },
  mixins: [assist],
  created() {
    this.grid = new Array(5).fill({});
  },
  watch: {
    visible(value) {
      if (value) {
        document.body.addEventListener("click", this.closeMenu);
      } else {
        document.body.removeEventListener("click", this.closeMenu);
      }
    },
  },
  mounted() {
    this.loadFreeRefreshState();
    this.startRecoverTimer();
    this.refreshShopItems(true);
  },
  beforeDestroy() {
    if (this._recoverTimer) clearInterval(this._recoverTimer);
  },
  methods: {
    loadFreeRefreshState() {
      const storedCount = localStorage.getItem('shop_freeRefreshCount');
      const storedLastTime = localStorage.getItem('shop_lastRecoverTime');
      const now = Date.now();
      if (storedCount !== null && storedLastTime !== null) {
        this.freeRefreshCount = parseInt(storedCount);
        this.lastRecoverTime = parseInt(storedLastTime);
        const elapsedSeconds = Math.floor((now - this.lastRecoverTime) / 1000);
        const recoverCount = Math.floor(elapsedSeconds / 5);
        if (recoverCount > 0) {
          let newCount = this.freeRefreshCount + recoverCount;
          if (newCount > 100) newCount = 100;
          this.freeRefreshCount = newCount;
          this.lastRecoverTime = now;
          this.saveFreeRefreshState();
        }
      } else {
        this.freeRefreshCount = 100;
        this.lastRecoverTime = now;
        this.saveFreeRefreshState();
      }
    },
    saveFreeRefreshState() {
      localStorage.setItem('shop_freeRefreshCount', this.freeRefreshCount);
      localStorage.setItem('shop_lastRecoverTime', this.lastRecoverTime);
    },
    startRecoverTimer() {
      this._recoverTimer = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - this.lastRecoverTime) / 1000;
        if (elapsed >= 5) {
          const recoverCount = Math.floor(elapsed / 5);
          let newCount = this.freeRefreshCount + recoverCount;
          if (newCount > 100) newCount = 100;
          if (newCount !== this.freeRefreshCount) {
            this.freeRefreshCount = newCount;
            this.lastRecoverTime = now;
            this.saveFreeRefreshState();
          }
        }
      }, 1000);
    },
    freeRefreshHandler() {
      if (this.freeRefreshCount <= 0) {
        this.$store.commit("set_sys_info", {
          msg: `免费刷新次数不足，请等待恢复（每5秒恢复1次）`,
          type: "warning",
        });
        return;
      }
      this.doRefreshShop(false);
      this.freeRefreshCount--;
      this.saveFreeRefreshState();
    },
    doRefreshShop(skipUniqueCheck = false) {
      if (this.tipsFlagComfirm && !skipUniqueCheck) return;
      const hasUnique = this.grid.some(item => item.quality && item.quality.name === '独特');
      if (!skipUniqueCheck && hasUnique) {
        this.tipsFlagComfirm = true;
        this.$message({
          message: '刷到了独特装备哦，不看看嘛？',
          closeBtnText: '看看',
          confirmBtnText: '辣鸡我不要',
          onCancle: () => {
            // 点击“辣鸡我不要”：关闭弹窗，强制刷新
            this.tipsFlagComfirm = false;
            this.doRefreshShop(true);
          },
          onClose: () => {
            // 点击“看看”：仅关闭弹窗，不刷新
            this.tipsFlagComfirm = false;
          }
        });
        return;
      }
      this.grid = new Array(5).fill({});
      for (let i = 0; i < 5; i++) {
        const lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
        this.createShopItem(lv);
      }
    },
    goldRefreshShopItems(constraint) {
      if (this.tipsFlagComfirm) return;
      const hasUnique = !constraint && this.grid.some(item => item.quality && item.quality.name === '独特');
      if (hasUnique && !constraint) {
        this.tipsFlagComfirm = true;
        this.$message({
          message: '刷到了独特装备哦，不看看嘛？',
          closeBtnText: '看看',
          confirmBtnText: '辣鸡我不要',
          onCancle: () => {
            this.tipsFlagComfirm = false;
            this.goldRefreshShopItems(true);
          },
          onClose: () => {
            this.tipsFlagComfirm = false;
          }
        });
        return;
      }
      if (this.$store.state.playerAttribute.GOLD < 100) {
        this.$store.commit("set_sys_info", { msg: `钱不够啊，想啥呢。`, type: "warning" });
        return;
      }
      this.$store.commit("set_player_gold", -100);
      this.grid = new Array(5).fill({});
      for (let i = 0; i < 5; i++) {
        const lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
        this.createShopItem(lv);
      }
    },
    refreshShopItems(constraint) {
      if (constraint) {
        this.doRefreshShop(true);
      } else {
        this.freeRefreshHandler();
      }
    },
    createShopItem(lv) {
      const equip = [0.4, 0.342, 0.25, 0.008];
      let equipQua = -1;
      const r = Math.random();
      if (r <= equip[0]) equipQua = 1;
      else if (r < equip[1] + equip[0] && r >= equip[0]) equipQua = 2;
      else if (r < equip[2] + equip[1] + equip[0] && r >= equip[1] + equip[0]) equipQua = 3;
      else if (r < equip[3] + equip[2] + equip[1] + equip[0] && r >= equip[2] + equip[1] + equip[0]) equipQua = 4;
      if (equipQua === -1) return;
      const typeIdx = Math.floor(Math.random() * 4);
      let comp;
      if (typeIdx === 0) comp = this.findBrothersComponents(this, "weaponPanel", false)[0];
      else if (typeIdx === 1) comp = this.findBrothersComponents(this, "armorPanel", false)[0];
      else if (typeIdx === 2) comp = this.findBrothersComponents(this, "ringPanel", false)[0];
      else comp = this.findBrothersComponents(this, "neckPanel", false)[0];
      let item = JSON.parse(comp.createNewItem(equipQua, lv));
      item.gold = parseInt(item.lv * item.quality.qualityCoefficient * (250 + 20 * item.lv));
      for (let i = 0; i < this.grid.length; i++) {
        if (JSON.stringify(this.grid[i]).length < 3) {
          this.$set(this.grid, i, item);
          break;
        }
      }
    },
    openMenu(k, e) {
      this.currentItemIndex = k;
      this.currentItem = this.grid[k];
      const offsetLeft = this.$el.getBoundingClientRect().left;
      const offsetWidth = this.$el.offsetWidth;
      const menuMinWidth = 105;
      const maxLeft = offsetWidth - menuMinWidth;
      let left = (e.type === 'touchstart' ? e.changedTouches[0].clientX : e.clientX) - offsetLeft + 15;
      this.left = left > maxLeft ? maxLeft : left;
      this.top = e.offsetY;
      this.visible = true;
    },
    closeMenu() {
      this.visible = false;
    },
    showItemInfo($event, type, item, SchemaIsMobile) {
      if (SchemaIsMobile !== 'touch' && this.$store.state.operatorSchemaIsMobile) return;
      const p = this.findComponentUpward(this, "index");
      p.showItemInfo($event, type, item);
    },
    closeItemInfo() {
      const p = this.findComponentUpward(this, "index");
      p.weaponShow = p.armorShow = p.ringShow = p.neckShow = false;
    },
    buyTheEquipment() {
      if (this.$store.state.playerAttribute.GOLD < this.currentItem.gold) {
        this.$store.commit("set_sys_info", { msg: `钱不够啊，买啥呢。`, type: "warning" });
        return;
      }
      this.$store.commit("set_player_gold", -parseInt(this.currentItem.gold));
      const backpackPanel = this.findBrothersComponents(this, "backpackPanel", false)[0];
      for (let i = 0; i < backpackPanel.grid.length; i++) {
        if (JSON.stringify(backpackPanel.grid[i]).length < 3) {
          this.$set(backpackPanel.grid, i, this.currentItem);
          break;
        }
      }
      this.$set(this.grid, this.currentItemIndex, {});
    },
  },
};
</script>
<style lang="scss" scoped>
.shop {
  width: 5.02rem;
  height: 3.1rem;
  display: flex;
  flex-wrap: wrap;
  padding: 0.14rem 0.14rem 0.14rem;
  justify-items: flex-start;
  align-items: flex-start;
  position: relative;
}
.handle {
  padding-top: 0.1rem;
  justify-content: flex-end;
  display: flex;
  align-items: center;
  width: 100%;
  height: 0.5rem;
  .info {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    flex: 1;
    margin-left: 0.2rem;
    span {
      font-size: 0.14rem;
    }
  }
  .button {
    cursor: pointer;
    margin: 0 0.1rem;
    padding: 0.04rem 0.12rem;
    background: #333;
    border-radius: 4px;
    color: #fff;
    &:hover {
      background: #555;
    }
    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }
}
.content {
  width: 100%;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.grid {
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid #ccc;
  box-shadow: inset 0 0 6px 6px rgba($color: #000000, $alpha: 0.5);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  .title {
    display: flex;
    width: 100%;
    cursor: pointer;
    .icon {
      width: 0.56rem;
      height: 0.56rem;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.04rem;
    }
  }
  .info {
    position: absolute;
    bottom: -0.26rem;
    font-size: 0.24rem;
  }
}
.contextmenu {
  margin: 0;
  background: #000;
  border: 1px solid #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #fff;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
  li {
    margin: 0;
    padding: 9px 16px;
    cursor: pointer;
    border-top: 1px solid #ccc;
    margin-top: -1px;
    font-size: 14px;
    letter-spacing: 6px;
    &:hover {
      color: #ccc;
    }
  }
}
</style>
