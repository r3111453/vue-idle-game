<template>
  <div class="backpackPanel">
    <div v-for="(v, k) in grid" :key="k">
      <div class="grid">
        <div class="title" v-if="v.lv" @contextmenu.prevent="openMenu(k,$event)" @touchstart.stop.prevent="openMenu(k,$event)" @mouseover="showItemInfo($event,v.itemType,v)" @mouseleave="closeItemInfo">
          <div class="icon" :class="{'red-flash':v.enchantlvl>=13}"  :style="{ 'box-shadow': 'inset 0 0 7px 2px ' + v.quality.color }">
            <img :src="v.type.iconSrc" alt="" />
          </div>
          <div class="title-lock" v-if="v.locked">
            <img src="../../assets/icons/lock.png" alt="">
          </div>
        </div>
      </div>
    </div>
    <div class="backpack-capacity" :class="{'height-capacity':itemNum/grid.length>0.8}">{{itemNum}}/{{grid.length}}</div>
    <div class="handle">
      <div class="handle-checkbox">
        <span  @click.stop="autoSellPanel = !autoSellPanel">
          自动出售设置
          <i class="icon icon-setting"></i>
        </span>
        <div class="autoSellSetting" v-if="autoSellPanel">
          若勾选会在副本获得该品质装备时自动出售
          <div>
            <span @click="setAutoSell(0)"><input type="checkbox" name="" v-model="autoSell[0]">破旧</span>
            <span @click="setAutoSell(1)"><input type="checkbox" name="" v-model="autoSell[1]">普通</span>
          </div>
          <div>
            <span @click="setAutoSell(2)"><input type="checkbox" name="" v-model="autoSell[2]">神器</span>
            <span @click="setAutoSell(3)"><input type="checkbox" name="" v-model="autoSell[3]">史诗</span>
          </div>
        </div>
      </div>
      <div class="sort-controls">
        <span>排序规则：</span>
        <select v-model="sortMode">
          <option value="none">无</option>
          <option value="type">类型</option>
          <option value="quality">品质</option>
          <option value="level">等级</option>
        </select>
      </div>
      <div class="button" @click="neaten">一键整理</div>
      <div class="button" @click="sell">一键出售</div>
    </div>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="showItemInfo($event,currentItem.itemType,currentItem,'touch')" v-if="$store.state.operatorSchemaIsMobile">查看</li>
      <li @click="equipTheEquipment()">装备</li>
      <li @click="strengthenEquipment()">强化</li>
      <li @click="strengthenEquipment()">重铸</li>
      <li @click="lockTheEquipment(true)" v-if="!currentItem.locked">锁定</li>
      <li @click="lockTheEquipment(false)" v-if="currentItem.locked">解锁</li>
      <li @click="sellTheEquipment()">出售</li>
    </ul>
  </div>
</template>
<script>
import { assist } from '../../assets/js/assist';
export default {
  name: "backpackPanel",
  data() {
    return {
      grid: [],
      capacity:100,
      left: '',
      top: '',
      visible: false,
      currentItem: {},
      currentItemIndex: '',
      autoSellPanel: false,
      autoSell:[false,false,false,false],
      sortMode: 'none', // 排序模式：none / type / quality / level
    };
  },
  mixins: [assist],
  created() {
    this.grid = new Array(this.capacity).fill({});
    // 初始化时清理可能存在的空装备
    this.removeEmptyEquipment();
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
  computed: {
    itemNum() {
      let count = 0
      this.grid.map((item) => {
        if (JSON.stringify(item) != '{}') {
          count++
        }
      })
      if (count / this.grid.length > 0.8) {
        this.$store.commit("set_sys_info", {
          msg: `
              背包快满了，请注意及时清理！
            `,
          type: 'warning',
        });
      }
      return count
    }
  },
  mounted() {
    // 确保加载后清理空装备
    this.removeEmptyEquipment();
  },
  methods: {
    // 清理背包中的空装备（quality.name === '空'）
    removeEmptyEquipment() {
      // 过滤掉空装备，然后重新填充空对象到末尾
      const validItems = this.grid.filter(item => {
        // 保留非空装备（有 lv 属性且 quality.name 不是 '空'）
        return item.lv && (!item.quality || item.quality.name !== '空');
      });
      const newGrid = new Array(this.capacity).fill({});
      for (let i = 0; i < validItems.length; i++) {
        newGrid[i] = validItems[i];
      }
      this.grid = newGrid;
    },
    setAutoSell(index){
      this.$set(this.autoSell,index,!this.autoSell[index])
    },
    // 整理背包：根据选择的排序模式进行排序
    neaten() {
      // 先清理空装备
      this.removeEmptyEquipment();
      
      const items = this.grid.filter(item => JSON.stringify(item) !== '{}');
      
      if (this.sortMode === 'type') {
        const typeOrder = { weapon: 1, armor: 2, ring: 3, neck: 4 };
        items.sort((a, b) => (typeOrder[a.itemType] || 5) - (typeOrder[b.itemType] || 5));
      } else if (this.sortMode === 'quality') {
        const qualityOrder = { '独特': 4, '史诗': 3, '神器': 2, '普通': 1, '破旧': 0 };
        items.sort((a, b) => (qualityOrder[b.quality.name] || 0) - (qualityOrder[a.quality.name] || 0));
      } else if (this.sortMode === 'level') {
        items.sort((a, b) => b.lv - a.lv);
      }
      // sortMode === 'none' 时不排序，保持原顺序
      
      const newGrid = new Array(this.capacity).fill({});
      for (let i = 0; i < items.length; i++) {
        newGrid[i] = items[i];
      }
      this.grid = this.$deepCopy(newGrid);
    },
    clear(){
      this.grid = new Array(this.capacity).fill({});
    },
    // 一键出售（修复重复出售问题）
    sell() {
      // 收集所有非空物品的索引（固定列表，避免遍历过程中数组变化）
      const indices = [];
      for (let i = 0; i < this.grid.length; i++) {
        if (JSON.stringify(this.grid[i]) !== '{}') {
          indices.push(i);
        }
      }
      // 依次出售
      for (let i = 0; i < indices.length; i++) {
        const idx = indices[i];
        const item = this.grid[idx];
        // 再次确认该格子还有装备（防止异步导致的改变）
        if (item && JSON.stringify(item) !== '{}') {
          this.currentItemIndex = idx;
          this.currentItem = item;
          this.sellTheEquipment(true);
        }
      }
      // 出售后清理可能的空装备
      this.removeEmptyEquipment();
    },
    openMenu(k, e) {
      this.currentItemIndex = k
      this.currentItem = this.grid[k]
      this.$store.commit('set_need_strengthen_equipment', this.currentItem)
      const menuMinWidth = 105;
      const offsetLeft = this.$el.getBoundingClientRect().left;
      const offsetWidth = this.$el.offsetWidth;
      const maxLeft = offsetWidth - menuMinWidth;
      if (e.type == 'touchstart') {
        var left = e.changedTouches[0].clientX - offsetLeft + 15;
      } else {
        var left = e.clientX - offsetLeft + 15;
      }
      if (left > maxLeft) {
        this.left = maxLeft;
      } else {
        this.left = left;
      }
      this.top = e.offsetY;
      this.visible = true;
    },
    closeMenu() {
      this.visible = false;
    },
    showItemInfo($event, type, item, SchemaIsMobile) {
      if (SchemaIsMobile != 'touch' && this.$store.state.operatorSchemaIsMobile) {
        return
      }
      var p = this.findComponentUpward(this, 'index')
      p.showItemInfo($event, type, item)
    },
    closeItemInfo() {
      var p = this.findComponentUpward(this, 'index')
      p.weaponShow = p.armorShow = p.ringShow  =p.neckShow = false
    },
    lockTheEquipment(v) {
      this.currentItem.locked = v;
    },
    equipTheEquipment() {
      // 装备前确保当前背包格子的装备不是空装备
      if (this.currentItem.quality && this.currentItem.quality.name === '空') {
        this.$store.commit("set_sys_info", { msg: "无法装备空装备。", type: "warning" });
        return;
      }
      switch (this.currentItem.itemType) {
        case 'weapon':
          this.grid[this.currentItemIndex] = this.$store.state.playerAttribute.weapon
          this.$store.commit('set_player_weapon', this.currentItem)
          break;
        case 'armor':
          this.grid[this.currentItemIndex] = this.$store.state.playerAttribute.armor
          this.$store.commit('set_player_armor', this.currentItem)
          break;
        case 'ring':
          this.grid[this.currentItemIndex] = this.$store.state.playerAttribute.ring
          this.$store.commit('set_player_ring', this.currentItem)
          break;
        case 'neck':
          this.grid[this.currentItemIndex] = this.$store.state.playerAttribute.neck
          this.$store.commit('set_player_neck', this.currentItem)
          break;
        default:
          break;
      }
      // 装备后清理可能产生的空装备
      this.removeEmptyEquipment();
    },
    strengthenEquipment(v) {
      var p = this.findComponentUpward(this, 'index')
      p.closePanel()
      p.strengthenEquipmentPanelOpened = true
    },
    sellTheEquipment(withoutWarning, sellMsg) {
      // 防止出售空装备
      if (!this.currentItem || !this.currentItem.lv) {
        return;
      }
      if (this.currentItem.locked) {
        !withoutWarning && this.$store.commit("set_sys_info", {
          msg: `装备已锁定，请先解锁再出售。`,
          type: 'warning',
        });
        return;
      }
      // 再次确认格子中的装备未被改变
      if (JSON.stringify(this.grid[this.currentItemIndex]) === '{}') {
        return;
      }
      this.$set(this.grid, this.currentItemIndex, {});
      var gold = this.currentItem.lv * this.currentItem.quality.qualityCoefficient * 30;
      this.$store.commit("set_player_gold", parseInt(gold));
      this.$store.commit("set_sys_info", {
        msg: `${sellMsg ? sellMsg : ''}出售装备获得金币${parseInt(gold)}`,
        type: 'trophy',
      });
    }
  },
};
</script>
<style lang="scss" scoped>
.backpackPanel {
  width: 6.2rem;
  height: 6.6rem;
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
  flex-wrap: wrap;
  width: 100%;
  gap: 0.1rem;
  .handle-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
    span {
      display: flex;
      align-items: center;
    }
    input {
      width: 0.17rem;
      height: 0.17rem;
      margin-right: 2px;
      margin-top: 1px;
    }
  }
  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.05rem;
    span {
      font-size: 0.12rem;
      white-space: nowrap;
    }
    select {
      background: #333;
      color: #fff;
      border: 1px solid #666;
      border-radius: 4px;
      padding: 0.04rem 0.08rem;
      font-size: 0.12rem;
      cursor: pointer;
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
.grid {
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid #ccc;
  margin-left: -1px;
  margin-top: -1px;
  box-shadow: inset 0 0 6px 6px rgba($color: #000000, $alpha: 0.5);
  .title {
    display: flex;
    width: 100%;
    cursor: pointer;
    position: relative;
    .icon {
      width: 0.56rem;
      height: 0.56rem;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.04rem;
      img {
        width: 80%;
        height: 80%;
        max-width: 0.32rem;
        max-height: 0.32rem;
      }
    }
  }
  .title-lock {
    position: absolute;
    top: -0.03rem;
    right: -0.11rem;
    width: 0;
    height: 0;
    border-left: 0.24rem solid transparent;
    border-right: 0.24rem solid transparent;
    border-bottom: 0.24rem solid rgba(255, 0, 0, 0.658);
    font-size: 0;
    line-height: 0;
    transform: rotate(45deg);
    img {
      width: 0.16rem;
      height: 0.16rem;
      transform: rotate(-45deg) translate(-50%, -0%);
      position: absolute;
      top: 50%;
      left: 50%;
    }
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
.backpack-capacity {
  position: absolute;
  bottom: 0.2rem;
  left: 0.2rem;
  font-size: 0.2rem;
}
.height-capacity {
  color: red;
}
.autoSellSetting {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  padding: 0.1rem;
  border-radius: 4px;
  bottom: 0.3rem;
  right:0rem;
  width: 1.7rem;
  div{
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
  span {
    display: flex;
    align-items: center;
    padding: 0.06rem;
    cursor: pointer;
  }
  input{
    cursor: pointer;
  }
}
</style>
