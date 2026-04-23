<template xmlns="http://www.w3.org/1999/html">
  <div class="shop">
    <div class="content">
      <div class="" v-for="(v, k) in grid" :key="k">
        <div class="" v-if="v.lv">
          <div class="weaponPanel" v-if="JSON.stringify(v)!='{}'">
            <div class="title">
              <div class='icon' @contextmenu.prevent="openMenu(k, $event)" @mouseover="showItemInfo($event, v.itemType, v)" @mouseleave="closeItemInfo" @touchstart.stop.prevent="openMenu(k,$event)" :style="{'box-shadow':'inset 0 0 7px 2px '+v.quality.color}">
                <img :src="v.type.iconSrc" alt="">
              </div>
              <div style="display: flex;flex-direction: column;justify-content:space-around;margin-left: 0.06rem;">
                <div :style="{color:v.quality.color}">{{v.type.name}} {{v.enchantlvl?'(+'+v.enchantlvl+')':''}}</div>
                <div :style="{'font-size':(parseInt(v.gold)>99999?0.14:0.16)+'rem'}">{{v.gold}}金币</div>
              </div>
              <div class="button" @click="buyTheEquipmentEX(k)">购买</div>
            </div>
            <div class='type'>
              <div :style="{color:v.quality.color}">{{v.quality.name}}</div>
              <div>lv{{v.lv}}</div>
            </div>
            <div class="entry">
              <div v-for="w in v.type.entry" :key="w.id">
                <div>{{w.name}}:{{w.showVal}} <span style="color:#68d5ed" v-if="v.enchantlvl">(+{{Math.round(w.value*(1.05**(v.enchantlvl)**1.1)-w.value)}})</span><span style="float:right">{{w.strength}}</span></div>
              </div>
            </div>
            <div class="extraEntry">
              <div v-for="w in v.extraEntry" :key="w.id">
                <div>{{w.name}}:{{w.showVal}}{{plusValue(w)}}<span style="float:right">{{w.strength}}</span></div>
              </div>
            </div>
            <div class="des">
              <div>
                {{v.type.des}}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="handle">
      <div class="info">
        <span v-show="timeStart" class="timeStart">下次刷新次数获取：{{timeo}}s</span>
        <span>剩余刷新次数：{{refreshTime}}次。</span>
      </div>
      <div style="display: flex;align-items: center;margin: auto">
        <div style="display: flex;align-items: center;">
          <input type="checkbox" name="" v-model="autoBuy"/>
          <div style="margin-left: 0.1rem;">自动刷新<br/>购买独特</div>
        </div>
        <div style="margin-left: 0.3rem;">
          最低等级
          <input type="number"
                 placeholder="100"
                 v-model="autoBuyLevel"
                 :max="maxAutoBuyLevel"
                 min="1"
                 style="width: 0.7rem;margin-left: 0.1rem;"/>
        </div>
        <div style="display: flex;align-items: center;margin-left: 0.3rem;">
          <div>基础属性<br/>最低百分比</div>
          <input type="number" placeholder="100" v-model="autoBuyStrength" max="100" min="0" style="margin-left: 0.1rem;"/>%
        </div>
        <div style="display: flex;align-items: center;margin-left: 0.3rem;">
          <div>持有金币<br/>为价格倍数</div>
          <input type="number" placeholder="100" v-model="autoBuyPriceTimes" min="0" style="width: 0.7rem;margin-left: 0.1rem;"/>
        </div>
      </div>
      <div class="button" @click="goldRefreshShopItems()">5000金币刷新</div>
      <div class="button" @click="refreshShopItems()">免费刷新</div>
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
    // 从 localStorage 安全读取剩余刷新次数（上限10）
    let savedRefreshTime = localStorage.getItem('shop_refreshTime');
    let refreshTime = 10;
    if (savedRefreshTime !== null) {
      let parsed = parseInt(savedRefreshTime);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
        refreshTime = parsed;
      } else {
        localStorage.removeItem('shop_refreshTime');
      }
    }

    // 读取保存的自动购买参数
    let savedAutoBuyLevel = localStorage.getItem('shop_autoBuyLevel');
    let autoBuyLevel = 100;
    if (savedAutoBuyLevel !== null) {
      let parsed = parseInt(savedAutoBuyLevel);
      if (!isNaN(parsed) && parsed >= 1) {
        autoBuyLevel = parsed;
      }
    }

    let savedAutoBuyStrength = localStorage.getItem('shop_autoBuyStrength');
    let autoBuyStrength = 70;
    if (savedAutoBuyStrength !== null) {
      let parsed = parseInt(savedAutoBuyStrength);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        autoBuyStrength = parsed;
      }
    }

    let savedAutoBuyPriceTimes = localStorage.getItem('shop_autoBuyPriceTimes');
    let autoBuyPriceTimes = 20;
    if (savedAutoBuyPriceTimes !== null) {
      let parsed = parseInt(savedAutoBuyPriceTimes);
      if (!isNaN(parsed) && parsed >= 0) {
        autoBuyPriceTimes = parsed;
      }
    }

    // 读取保存的自动购买开关状态
    let savedAutoBuy = localStorage.getItem('shop_autoBuy');
    let autoBuy = false;
    if (savedAutoBuy !== null) {
      autoBuy = savedAutoBuy === 'true';
    }

    return {
      grid: [],
      left: "",
      top: "",
      visible: false,
      currentItem: {},
      currentItemIndex: "",
      refreshTime: refreshTime,
      timeo: 30,            // 显示的倒计时秒数
      timeStart: false,     // 是否正在倒计时
      timeInterval: null,   // 恢复倒计时定时器
      autoRefreshTimer: null, // 自动刷新定时器
      isTouch: false,
      tipsFlag: false,
      tipsFlagComfirm: false,
      autoBuy: autoBuy,
      autoBuyLevel: autoBuyLevel,
      autoBuyStrength: autoBuyStrength,
      autoBuyPriceTimes: autoBuyPriceTimes
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
    refreshTime(value) {
      // 保存到 localStorage
      if (value >= 0 && value <= 10) {
        localStorage.setItem('shop_refreshTime', value);
      }

      // 次数不足10：停止自动刷新，启动恢复倒计时（30秒恢复1次）
      if (value < 10) {
        this.stopAutoRefresh();
        if (!this.timeStart) {
          this.startRecoveryTimer();
        }
      }
      // 次数达到10：停止恢复倒计时，如果自动购买开启则启动自动刷新倒计时
      else if (value >= 10) {
        this.stopRecoveryTimer();
        if (this.autoBuy) {
          this.startAutoRefresh();
        }
      }
    },
    autoBuy(value) {
      localStorage.setItem('shop_autoBuy', value);
      if (value === true && this.refreshTime >= 10) {
        // 开启自动购买且次数已满，启动自动刷新
        this.startAutoRefresh();
      } else if (value === false) {
        // 关闭自动购买，停止自动刷新
        this.stopAutoRefresh();
        // 如果次数不满10，启动恢复倒计时
        if (this.refreshTime < 10 && !this.timeStart) {
          this.startRecoveryTimer();
        }
      }
    },
    // 监听角色等级变化，用于自动购买等级防呆
    '$store.state.playerAttribute.lv': {
      handler() {
        this.checkAndFixAutoBuyLevel();
      },
      immediate: false
    },
    autoBuyLevel(newVal) {
      this.checkAndFixAutoBuyLevel();
      if (newVal !== undefined && newVal !== null) {
        localStorage.setItem('shop_autoBuyLevel', newVal);
      }
    },
    autoBuyStrength(newVal) {
      if (newVal !== undefined && newVal !== null) {
        localStorage.setItem('shop_autoBuyStrength', newVal);
      }
    },
    autoBuyPriceTimes(newVal) {
      if (newVal !== undefined && newVal !== null) {
        localStorage.setItem('shop_autoBuyPriceTimes', newVal);
      }
    }
  },
  computed: {
    plusValue() {
      return function(v) {
        let attribute = this.$store.state.playerAttribute.attribute;
        let output = 0;
        switch (v.type) {
          case "ATKPERCENT":
            output = parseInt(attribute.ATK.info[1] * v.value / 100);
            break;
          case "DEFPERCENT":
            output = parseInt(attribute.DEF.info[1] * v.value / 100);
            break;
          case "HPPERCENT":
            output = parseInt(attribute.MAXHP.info[1] * v.value / 100);
            break;
          case "BLOCPERCENT":
            output = parseInt(attribute.BLOC.info[1] * v.value / 100);
            break;
        }
        return output > 0 ? "(+" + output + ")" : "";
      };
    },
    maxAutoBuyLevel() {
      const playerLv = this.$store.state.playerAttribute.lv || 1;
      return playerLv + 2;
    }
  },
  mounted() {
    this.initShopItems();
    if (this.refreshTime < 10) {
      // 初始次数不足，启动恢复倒计时
      this.startRecoveryTimer();
    } else if (this.refreshTime >= 10 && this.autoBuy) {
      // 初始次数已满且自动购买开启，启动自动刷新
      this.startAutoRefresh();
    }
  },
  beforeDestroy() {
    this.stopRecoveryTimer();
    this.stopAutoRefresh();
  },
  methods: {
    // 启动恢复倒计时（30秒恢复1次）
    startRecoveryTimer() {
      this.stopRecoveryTimer();
      this.timeStart = true;
      this.timeo = 30;
      this.timeInterval = setInterval(() => {
        if (this.refreshTime >= 10) {
          // 次数已满，停止恢复倒计时
          this.stopRecoveryTimer();
          if (this.autoBuy) {
            this.startAutoRefresh();
          }
          return;
        }
        this.timeo--;
        if (this.timeo <= 0) {
          this.refreshTime++;
          this.timeo = 30;
        }
      }, 1000);
    },
    // 停止恢复倒计时
    stopRecoveryTimer() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
        this.timeInterval = null;
      }
      this.timeStart = false;
      this.timeo = 30;
    },
    // 启动自动刷新（每5秒倒计时，归零时执行自动刷新，不消耗次数）
    startAutoRefresh() {
      this.stopAutoRefresh();
      if (this.refreshTime >= 10 && this.autoBuy) {
        this.timeStart = true;
        this.timeo = 30;
        this.autoRefreshTimer = setInterval(() => {
          if (this.refreshTime >= 10 && this.autoBuy) {
            this.timeo--;
            if (this.timeo <= 0) {
              // 倒计时归零，执行自动刷新（不消耗次数）
              this.autoRefreshShopItems();
              // 重置倒计时为5秒
              if (this.refreshTime >= 10 && this.autoBuy) {
                this.timeo = 30;
              } else {
                // 条件不满足，停止自动刷新，启动恢复倒计时
                this.stopAutoRefresh();
                if (this.refreshTime < 10 && !this.timeStart) {
                  this.startRecoveryTimer();
                }
              }
            }
          } else {
            // 条件不满足，停止自动刷新
            this.stopAutoRefresh();
            if (this.refreshTime < 10 && !this.timeStart) {
              this.startRecoveryTimer();
            }
          }
        }, 1000);
      }
    },
    // 停止自动刷新
    stopAutoRefresh() {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
      if (!this.timeInterval) {
        this.timeStart = false;
        this.timeo = 30;
      }
    },
    // 自动刷新商店（不消耗免费刷新次数）
    autoRefreshShopItems() {
      // 重新生成商店商品，不改变 refreshTime
      this.grid = new Array(5).fill({});
      for (let i = 0; i < 5; i++) {
        let lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
        this.createShopItem(lv);
      }
      // 自动购买符合条件的独特装备
      if (this.autoBuy) {
        this.autoBuyItems();
      }
    },
    // 修正自动购买等级（不超过角色等级+2）
    checkAndFixAutoBuyLevel() {
      const max = this.maxAutoBuyLevel;
      let currentVal = this.autoBuyLevel;
      if (currentVal > max) {
        this.autoBuyLevel = max;
        this.$store.commit("set_sys_info", {
          msg: `最低等级不能超过当前角色等级+2（最高${max}级），已自动调整为${max}。`,
          type: 'warning'
        });
      } else if (currentVal < 1) {
        this.autoBuyLevel = 1;
        this.$store.commit("set_sys_info", {
          msg: `最低等级不能小于1，已自动调整为1。`,
          type: 'warning'
        });
      }
    },
    // 初始化商店商品（不消耗次数）
    initShopItems() {
      this.grid = new Array(5).fill({});
      for (let i = 0; i < 5; i++) {
        let lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
        this.createShopItem(lv);
      }
    },
    // 免费刷新（消耗1次次数）
    refreshShopItems(constraint) {
      this.tipsFlag = !constraint && this.grid.find(item => {
        return item.quality && item.quality.name == '独特';
      });
      if (this.tipsFlagComfirm) return;
      if (this.tipsFlag && !constraint) {
        this.tipsFlagComfirm = true;
        this.$message({
          message: '刷到了独特装备哦，不看看嘛？',
          closeBtnText: '看看',
          confirmBtnText: '辣鸡我不要',
          onCancle: () => {
            this.tipsFlagComfirm = false;
          },
          onClose: () => {
            this.tipsFlagComfirm = false;
            this.refreshShopItems(true);
          }
        });
        return;
      }
      if (this.refreshTime > 10) {
        this.refreshTime = 10;
      }
      if (this.refreshTime < 1) {
        this.$store.commit("set_sys_info", {
          msg: `刷新次数不够了，等等吧。`,
          type: "warning",
        });
        return;
      }
      this.refreshTime--;
      this.grid = new Array(5).fill({});
      for (let i = 0; i < 5; i++) {
        let lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
        this.createShopItem(lv);
      }
      if (this.autoBuy) {
        this.autoBuyItems();
      }
    },
    // 金币刷新（消耗5000金币）
    goldRefreshShopItems(constraint) {
      this.tipsFlag = !constraint && this.grid.find(item => {
        return item.quality && item.quality.name == '独特';
      });
      if (this.tipsFlagComfirm) return;
      if (this.tipsFlag && !constraint) {
        this.tipsFlagComfirm = true;
        this.$message({
          message: '刷到了独特装备哦，不看看嘛？',
          closeBtnText: '看看',
          confirmBtnText: '辣鸡我不要',
          onCancle: () => {
            this.tipsFlagComfirm = false;
          },
          onClose: () => {
            this.tipsFlagComfirm = false;
            this.goldRefreshShopItems(true);
          }
        });
        return;
      }
      if (this.$store.state.playerAttribute.GOLD < 5000) {
        this.$store.commit("set_sys_info", {
          msg: `钱不够啊，想啥呢。`,
          type: "warning",
        });
      } else {
        this.$store.commit("set_player_gold", -5000);
        this.grid = new Array(5).fill({});
        for (let i = 0; i < 5; i++) {
          let lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
          this.createShopItem(lv);
        }
      }
    },
    // 创建单个商店商品
    createShopItem(lv) {
      let equip = [0.4, 0.342, 0.21, 0.048];
      let equipQua = -1;
      let r = Math.random();
      if (r <= equip[0]) {
        equipQua = 1;
      } else if (r < equip[1] + equip[0] && r >= equip[0]) {
        equipQua = 2;
      } else if (r < equip[2] + equip[1] + equip[0] && r >= equip[1] + equip[0]) {
        equipQua = 3;
      } else if (r < equip[3] + equip[2] + equip[1] + equip[0] && r >= equip[2] + equip[1] + equip[0]) {
        equipQua = 4;
      } else {
        return;
      }
      let index = Math.floor(Math.random() * 4);
      let comp;
      if (index === 0) {
        comp = this.findBrothersComponents(this, "weaponPanel", false)[0];
      } else if (index === 1) {
        comp = this.findBrothersComponents(this, "armorPanel", false)[0];
      } else if (index === 2) {
        comp = this.findBrothersComponents(this, "ringPanel", false)[0];
      } else {
        comp = this.findBrothersComponents(this, "neckPanel", false)[0];
      }
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
      const menuMinWidth = 105;
      const offsetLeft = this.$el.getBoundingClientRect().left;
      const offsetWidth = this.$el.offsetWidth;
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
      let p = this.findComponentUpward(this, "index");
      p.showItemInfo($event, type, item);
    },
    closeItemInfo() {
      let p = this.findComponentUpward(this, "index");
      p.weaponShow = p.armorShow = p.ringShow = p.neckShow = false;
    },
    buyTheEquipment() {
      if (this.$store.state.playerAttribute.GOLD < this.currentItem.gold) {
        this.$store.commit("set_sys_info", {
          msg: `钱不够啊，买啥呢。`,
          type: "warning",
        });
        return;
      }
      this.$store.commit("set_player_gold", -parseInt(this.currentItem.gold));
      let backpackPanel = this.findBrothersComponents(this, "backpackPanel", false)[0];
      for (let i = 0; i < backpackPanel.grid.length; i++) {
        if (JSON.stringify(backpackPanel.grid[i]).length < 3) {
          this.$set(backpackPanel.grid, i, this.currentItem);
          break;
        }
      }
      this.$set(this.grid, this.currentItemIndex, {});
    },
    buyTheEquipmentEX(k) {
      this.currentItemIndex = k;
      this.currentItem = this.grid[k];
      this.buyTheEquipment();
    },
    autoBuyItems() {
      this.grid.forEach(function(item, index) {
        if (item.quality && item.quality.name == '独特' && item.lv >= this.autoBuyLevel && item.gold <= this.$store.state.playerAttribute.GOLD / this.autoBuyPriceTimes) {
          let allPass = true;
          if (item.type.entry && item.type.entry.length) {
            for (let i = 0; i < item.type.entry.length; i++) {
              let entry = item.type.entry[i];
              let strengthValue = parseFloat(entry.strength);
              if (isNaN(strengthValue)) strengthValue = 0;
              if (strengthValue < this.autoBuyStrength) {
                allPass = false;
                break;
              }
            }
          }
          if (allPass) {
            this.buyTheEquipmentEX(index);
            let items = [];
            items.push(item);
            this.$store.commit("set_sys_info", {
              msg: `消费金币${parseInt(item.gold)}自动购买了`,
              type: 'trophy',
              equip: items
            });
          }
        }
      }, this);
    }
  }
};
</script>
<style lang="scss" scoped>
/* 样式保持不变 */
.shop {
  width: 12rem;
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
    margin-left: 0.2rem;
  }
}
.content {
  width: 100%;
  display: flex;
  padding-bottom: 0.14rem;
  align-items: flex-start;
  justify-content: space-around;
  border-bottom: 1px solid #ccc;
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
.weaponPanel {
  color: #f1f1f1;
  width: 2.1rem;
  height: auto;
  box-sizing: border-box;
  .title {
    display: flex;
    padding-bottom: 0.1rem;
    border-bottom: 1px solid #777;
    .icon {
      width: 0.5rem;
      height: 0.5rem;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.04rem;
    }
    .button {
      padding: 0.03rem 0.06rem;
      height: fit-content;
      margin-left: auto;
      align-self: center;
    }
  }
  .type {
    padding: 0.1rem;
    display: flex;
    width: 100%;
    align-content: center;
    justify-content: space-between;
  }
  .entry {
    width: 100%;
    padding-bottom: 0.1rem;
    border-bottom: 1px solid #777;
    div {
      text-align: left;
    }
  }
  .extraEntry {
    width: 100%;
    margin-top: 0.1rem;
    padding-bottom: 0.1rem;
    color: #68d5ed;
    border-bottom: 1px solid #777;
    div {
      text-align: left;
    }
  }
  .des {
    color: #777;
    font-size: 0.12rem;
    margin-top: 0.1rem;
    text-align: left;
    text-indent: 0.24rem;
  }
}
</style>
