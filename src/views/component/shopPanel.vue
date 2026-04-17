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
          <div style="margin-left: 0.1rem;">自动刷新<br/>
            购买独特</div>
        </div>
        <div style="margin-left: 0.3rem;">
          最低等级<input type="number" placeholder="100" v-model="autoBuyLevel" min="1" style="width: 0.7rem;margin-left: 0.1rem;"/>
        </div>
        <div style="display: flex;align-items: center;margin-left: 0.3rem;">
          <div>基础属性<br/>
            最低百分比</div>
          <input type="number" placeholder="100" v-model="autoBuyStrength" max="100" min="0" style="margin-left: 0.1rem;"/>%
        </div>
        <div style="display: flex;align-items: center;margin-left: 0.3rem;">
          <div>持有金币<br/>
            为价格倍数</div>
          <input type="number" placeholder="100" v-model="autoBuyPriceTimes" min="0" style="width: 0.7rem;margin-left: 0.1rem;"/>
        </div>
      </div>

      <div class="button" @click="goldRefreshShopItems()">10000金币刷新</div>
      <div class="button" @click="refreshShopItems()">免费刷新</div>
      <!-- <div class="button" @click="sell">一键出售</div> -->
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
      refreshTime: 5,
      //timeo: 10,
      timeo: 60,
      timeStart: false,
      timeInterval: '',
      isTouch: false,
      tipsFlag: false,
      tipsFlagComfirm: false,
      autoBuy:false,
      autoBuyLevel:100,
      autoBuyStrength:70,
      autoBuyPriceTimes:20
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
      if (value < 5) {

        if (this.timeStart) {
          return
        }
        this.timeStart = true
        this.timeInterval = setInterval(() => {
          this.timeo--
          if (this.timeo <= 0) {
            this.refreshTime++
            this.timeo = 60
          }
        }, 1000)
      } else {
        this.timeStart = false
        this.timeo = 5
        clearInterval(this.timeInterval)
        if(this.autoBuy){
          this.refreshShopItems(true);
        }
      }
    },
    autoBuy(value){
      if(value==true&&this.refreshTime==5){
        this.autoBuyItems();
        this.refreshShopItems(true);
      }
    }
  },
  mounted() {
    this.refreshShopItems(true);
  },
  computed:{
    plusValue(){
      return function (v){
        let attribute = this.$store.state.playerAttribute.attribute;
        let output = 0;
        switch (v.type){
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
        return output>0?"(+"+output+")":"";
      };
    }
  },
  methods: {
    /**
     * 刷新商店
     * constraint 是否跳过独特装备检测强制刷新
     */
    refreshShopItems(constraint) {
      this.tipsFlag = !constraint && this.grid.find(item => {
        return item.quality && item.quality.name == '独特'
      })
      if (this.tipsFlagComfirm) {
        return
      }
      if (this.tipsFlag && !constraint) {
        this.tipsFlagComfirm = true
        this.$message({
          message: '刷到了独特装备哦，不看看嘛？',
          closeBtnText: '看看',
          confirmBtnText: '辣鸡我不要',
          onCancle: () => {
            this.tipsFlagComfirm = false
          },
          onClose: () => {
            this.tipsFlagComfirm = false
            this.refreshShopItems(true)
          }
        })
        return
      }
      if (this.refreshTime > 5) {
        this.refreshTime = 5
      }
      if (this.refreshTime < 1) {
        this.$store.commit("set_sys_info", {
          msg: `
              刷新次数不够了，等等吧。
            `,
          type: "warning",
        });
        return
      }
      this.refreshTime--
      this.grid = new Array(5).fill({});
      var wlv = Number(this.$store.state.playerAttribute.weapon.lv);
      var alv = Number(this.$store.state.playerAttribute.armor.lv);
      var ringlv = Number(this.$store.state.playerAttribute.ring.lv);
      var necklv = Number(this.$store.state.playerAttribute.neck.lv);
      for (let i = 0; i < 5; i++) {
        var lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
        //装备等级最高200
        // lv = lv > 200 ? 200 : lv
        this.createShopItem(lv);
      }
      if(this.autoBuy){
        this.autoBuyItems();
      }
    },
    /**
     * 金币刷新商店
     * constraint 是否跳过独特装备检测强制刷新
     */
    goldRefreshShopItems(constraint) {
      this.tipsFlag = !constraint && this.grid.find(item => {
        return item.quality && item.quality.name == '独特'
      })
      if (this.tipsFlagComfirm) {
        return
      }
      if (this.tipsFlag && !constraint) {
        this.tipsFlagComfirm = true
        this.$message({
          message: '刷到了独特装备哦，不看看嘛？',
          closeBtnText: '看看',
          confirmBtnText: '辣鸡我不要',
          onCancle: () => {
            this.tipsFlagComfirm = false
          },
          onClose: () => {
            this.tipsFlagComfirm = false
            this.goldRefreshShopItems(true)
          }
        })
        return
      }
      if (this.$store.state.playerAttribute.GOLD < 10000) {
        this.$store.commit("set_sys_info", {
          msg: `
              钱不够啊，想啥呢。
            `,
          type: "warning",
        });
      } else {
        this.$store.commit("set_player_gold", -10000);
        this.grid = new Array(5).fill({});
        var wlv = Number(this.$store.state.playerAttribute.weapon.lv);
        var alv = Number(this.$store.state.playerAttribute.armor.lv);
        var ringlv = Number(this.$store.state.playerAttribute.ring.lv);
        var necklv = Number(this.$store.state.playerAttribute.neck.lv);
        for (let i = 0; i < 5; i++) {
          var lv = Math.floor(this.$store.state.playerAttribute.lv + Math.random() * 3);
          this.createShopItem(lv);
        }
      }
    },
    createShopItem(lv) {
      //var equip = [0.4, 0.4, 0.1, 0.1];
      var equip = [0.4, 0.342, 0.25, 0.008];
      // var equip = [0.4, 0.30, 0.25, 0.05];
      // var equip = [0, 0, 0,1];
      var equipQua = -1;
      var r = Math.random();
      if (r <= equip[0]) {
        // 获得普通装备
        equipQua = 1;
      } else if (r < equip[1] + equip[0] && r >= equip[0]) {
        // 获得神器装备
        equipQua = 2;
      } else if (
        r < equip[2] + equip[1] + equip[0] &&
        r >= equip[1] + equip[0]
      ) {
        // 获得史诗装备
        equipQua = 3;
      } else if (
        r < equip[3] + equip[2] + equip[1] + equip[0] &&
        r >= equip[2] + equip[1] + equip[0]
      ) {
        // 获得独特装备
        equipQua = 4;
      } else {
        // 未获得装备
      }
      if (equipQua != -1) {
        // this.createEquip(equipQua,lv)
        var index = Math.floor(Math.random() * 4);
        if (index == 0) {
          var b = this.findBrothersComponents(this, "weaponPanel", false)[0];
          var item = b.createNewItem(equipQua, lv);
        } else if (index == 1) {
          var b = this.findBrothersComponents(this, "armorPanel", false)[0];
          var item = b.createNewItem(equipQua, lv);
        } else if (index == 2) {
          var b = this.findBrothersComponents(this, "ringPanel", false)[0];
          var item = b.createNewItem(equipQua, lv);
        } else {
          var b = this.findBrothersComponents(this, "neckPanel", false)[0];
          var item = b.createNewItem(equipQua, lv);
        }
        item = JSON.parse(item);
        item.gold = parseInt(item.lv * item.quality.qualityCoefficient * (250 + 20 * item.lv))
        for (let i = 0; i < this.grid.length; i++) {
          if (JSON.stringify(this.grid[i]).length < 3) {
            this.$set(this.grid, i, item);
            break;
          }
        }
      }
    },
    openMenu(k, e) {
      this.currentItemIndex = k;
      this.currentItem = this.grid[k];
      const menuMinWidth = 105;
      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      const offsetWidth = this.$el.offsetWidth; // container width
      const maxLeft = offsetWidth - menuMinWidth; // left boundary
      if (e.type == 'touchstart') {
        var left = e.changedTouches[0].clientX - offsetLeft + 15; // 15: margin right
      } else {
        var left = e.clientX - offsetLeft + 15; // 15: margin right
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
      var p = this.findComponentUpward(this, "index");
      p.showItemInfo($event, type, item);
    },
    closeItemInfo() {
      var p = this.findComponentUpward(this, "index");
      p.weaponShow = p.armorShow = p.ringShow = p.neckShow = false;
    },
    buyTheEquipment() {
      // var gold =
      //   this.currentItem.lv * this.currentItem.quality.qualityCoefficient * (200+5*this.currentItem.lv);
      // gold = parseInt(gold)
      if (this.$store.state.playerAttribute.GOLD < this.currentItem.gold) {
        this.$store.commit("set_sys_info", {
          msg: `
              钱不够啊，买啥呢。
            `,
          type: "warning",
        });
      } else {
        this.$store.commit("set_player_gold", -parseInt(this.currentItem.gold));

        var backpackPanel = this.findBrothersComponents(
          this,
          "backpackPanel",
          false
        )[0];
        for (let i = 0; i < backpackPanel.grid.length; i++) {
          if (JSON.stringify(backpackPanel.grid[i]).length < 3) {
            this.$set(backpackPanel.grid, i, this.currentItem);
            break;
          }
        }
        this.$set(this.grid, this.currentItemIndex, {});
      }
    },
    buyTheEquipmentEX(k){
      this.currentItemIndex = k;
      this.currentItem = this.grid[k];
      this.buyTheEquipment();
    },
    autoBuyItems(){
      this.grid.forEach(function(item, index){
        if(item.quality && item.quality.name == '独特' && item.lv>=this.autoBuyLevel && item.gold<=this.$store.state.playerAttribute.GOLD/this.autoBuyPriceTimes){
          for(let i=0;i<item.type.entry.length;i++){
            if(item.type.entry[i].strength.replace("%","")*100<this.autoBuyStrength){
              return;
            }
          }
          this.buyTheEquipmentEX(index);
          let items = [];
          items.push(item);
          this.$store.commit("set_sys_info", {
            msg: `
              消费金币${parseInt(item.gold)}自动购买了
            `,
            type: 'trophy',
            equip: items
          });
        }
        //console.log(index+"垃圾"+(item.quality.name == '独特') +" "+ (item.lv>=this.autoBuyLevel) +" "+ (item.gold<=this.$store.state.playerAttribute.GOLD/this.autoBuyPriceTimes));
      },this);
    }
  },
};
</script>
<style lang="scss" scoped>
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
    .button{
      padding:0.03rem 0.06rem;
      height:fit-content;
      margin-left: auto;
      align-self:center;
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
  .des{
    color: #777;
    font-size: 0.12rem;
    margin-top: 0.1rem;
    text-align: left;
    text-indent: 0.24rem;
  }
}
</style>
