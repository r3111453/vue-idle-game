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
        <span>排序优先级：</span>
        <select v-model="sortLevel1">
          <option value="none">无</option>
          <option value="type">类型</option>
          <option value="quality">品质</option>
          <option value="level">等级</option>
        </select>
        <select v-model="sortLevel2">
          <option value="none">无</option>
          <option value="type">类型</option>
          <option value="quality">品质</option>
          <option value="level">等级</option>
        </select>
        <select v-model="sortLevel3">
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
      sortLevel1: 'none',
      sortLevel2: 'none',
      sortLevel3: 'none',
    };
  },
  mixins: [assist],
  created() {
    this.grid = new Array(this.capacity).fill({});
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
    // 测试数据（已注释）
  },
  methods: {
    setAutoSell(index){
      this.$set(this.autoSell,index,!this.autoSell[index])
    },
    // 整理背包：根据设定的多级优先级排序
    neaten() {
      const items = this.grid.filter(item => JSON.stringify(item) !== '{}');
      
      // 定义各属性的比较函数
      const compareType = (a, b) => {
        const typeOrder = { weapon: 1, armor: 2, ring: 3, neck: 4 };
        return (typeOrder[a.itemType] || 5) - (typeOrder[b.itemType] || 5);
      };
      const compareQuality = (a, b) => {
        const qualityOrder = { '独特': 4, '史诗': 3, '神器': 2, '普通': 1, '破旧': 0 };
        return (qualityOrder[b.quality.name] || 0) - (qualityOrder[a.quality.name] || 0); // 降序
      };
      const compareLevel = (a, b) => b.lv - a.lv;
      
      // 构建排序函数数组
      const sorters = [];
      if (this.sortLevel1 !== 'none') {
        if (this.sortLevel1 === 'type') sorters.push(compareType);
        else if (this.sortLevel1 === 'quality') sorters.push(compareQuality);
        else if (this.sortLevel1 === 'level') sorters.push(compareLevel);
      }
      if (this.sortLevel2 !== 'none') {
        if (this.sortLevel2 === 'type') sorters.push(compareType);
        else if (this.sortLevel2 === 'quality') sorters.push(compareQuality);
        else if (this.sortLevel2 === 'level') sorters.push(compareLevel);
      }
      if (this.sortLevel3 !== 'none') {
        if (this.sortLevel3 === 'type') sorters.push(compareType);
        else if (this.sortLevel3 === 'quality') sorters.push(compareQuality);
        else if (this.sortLevel3 === 'level') sorters.push(compareLevel);
      }
      
      if (sorters.length > 0) {
        items.sort((a, b) => {
          for (const sorter of sorters) {
            const result = sorter(a, b);
            if (result !== 0) return result;
          }
          return 0;
        });
      }
      // 否则不排序（保持原顺序）
      
      const newGrid = new Array(this.capacity).fill({});
      for (let i = 0; i < items.length; i++) {
        newGrid[i] = items[i];
      }
      this.grid = this.$deepCopy(newGrid);
    },
    clear(){
      this.grid = new Array(this.capacity).fill({});
    },
    // 一键出售
    sell() {
      this.grid.map((item, index) => {
        if (JSON.stringify(item) != '{}') {
          this.currentItemIndex = index
          this.currentItem = item
          this.sellTheEquipment(true)
        }
      })
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
    },
    strengthenEquipment(v) {
      var p = this.findComponentUpward(this, 'index')
      p.closePanel()
      p.strengthenEquipmentPanelOpened = true
    },
    sellTheEquipment(withoutWarning, sellMsg) {
      if (this.currentItem.locked) {
        !withoutWarning && this.$store.commit("set_sys_info", {
          msg: `
              装备已锁定，请先解锁再出售。
            `,
          type: 'warning',
        });
        return
      }
      this.$set(this.grid, this.currentItemIndex, {});
      var gold = this.currentItem.lv * this.currentItem.quality.qualityCoefficient * 30
      this.$store.commit("set_player_gold", parseInt(gold));
      this.$store.commit("set_sys_info", {
        msg: `
              ${sellMsg ? sellMsg : ''}出售装备获得金币${parseInt(gold)}
            `,
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
