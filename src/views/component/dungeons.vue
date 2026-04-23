<template>
  <div class="dungeons">
    <div class="progress-bar"></div>
    <div class="icon-bar">
      <div class="player" :style="{left:left+'%','backgroundPosition':parseInt(left%4)*32+'px 96px'}">
      </div>
      <div class="monster" v-for="(v,k) in dungeons.eventType" :key="k" :style="{left:(100/dungeons.eventNum)*(k+1)+'%'}">
        <cTooltip placement="bottom">
          <template v-slot:content>
            <img :src="'./icons/map/'+v.type+'.png'" alt="" style="vertical-align:top;">
          </template>
          <template v-slot:tip>
            <div class="info" style="line-height: .14rem">
            <p>{{v.name}}</p>
            <p>HP{{v.attribute.HP}}({{v.attribute.HPStrength}})</p>
              <p>ATK{{v.attribute.ATK}}({{v.attribute.ATKStrength}})</p>
            <p>金钱{{v.trophy.gold}} 独特掉落率{{ (dungeons.type == "endless"?0:(v.type=="boss"?0.05*((dungeons.difficulty-1)*2+1):v.trophy.equip[3]))*100+"%"}}</p>
            </div>
          </template>
        </cTooltip>
      </div>
    </div>
  </div>
</template>
<script>
import { assist } from '../../assets/js/assist';
import cTooltip from "@/views/uiComponent/tooltip";
export default {
  name: "dungeons",
  mixins: [assist],
  data() {
    return {
      left: 0,
      pro: {},
      timeOut: {},
      battleComTime: {},
      nextEvent: 1,
      battleTime:2000,
      moveTime: 200,     // ✅ 移动间隔改为 200 毫秒 (降低更新频率)
      dungeons: {
        battleTime: 2000,
        name: '史莱姆森林',
        time: '60',
        id: '1',
        eventNum: '5',
        lv: 1,
        eventType: [{
          name: '小史莱姆', type: 'monster',
          eventType: 'battle',
          attribute: {
            HP: 20,
            ATK: 1,
            strength:"100%"
          },
          trophy: {
            gold: 30,
            equip: [
              1, 0, 0, 0
            ],
          }
        }, {
          name: '小史莱姆', type: 'monster', eventType: 'battle',
          attribute: {
            HP: 20,
            ATK: 1,
            strength:"100%"
          },
          trophy: {
            gold: 30,
            equip: [
              0.2, 0.1, 0.05, 0
            ],
          }
        }, {
          name: '小史莱姆',
          type: 'monster', eventType: 'battle',
          attribute: {
            HP: 20,
            ATK: 1,
            strength:"100%"
          },
          trophy: {
            gold: 30,
            equip: [
              0.2, 0.1, 0.05, 0
            ],
          }
        }, {
          name: '小史莱姆',
          type: 'monster', eventType: 'battle',
          attribute: {
            HP: 20,
            ATK: 1,
            strength:"100%"
          },
          trophy: {
            gold: 30,
            equip: [
              0.2, 0.1, 0.05, 0
            ],
          }
        }, {
          name: '史莱姆王',
          type: 'boss', eventType: 'battle',
          attribute: {
            HP: 40,
            ATK: 2,
            strength:"100%"
          },
          trophy: {
            gold: 30,
            equip: [
              0.25, 0.55, 0.15, 0.05
            ],
          }
        },]
      }
    };
  },
  components:{cTooltip},
  computed: {
    reincarnationAttribute() { return this.$store.state.reincarnationAttribute },
  },
  mounted() {
    // this.evenHandle()
  },
  methods: {
    evenHandle() {
      let startEnent = () => {
        if (this.left >= this.nextEvent * 100 / this.dungeons.eventNum) {
          this.evenInExecution()
          this.nextEvent++
          if (this.nextEvent <= this.dungeons.eventNum) {
            this.timeOut = setTimeout(() => {
              this.pro = setInterval(() => {
                startEnent()
              }, this.moveTime+this.reincarnationAttribute.MOVESPEED)
            }, this.battleTime+this.reincarnationAttribute.BATTLESPEED)
          } else {
            this.timeOut = setTimeout(() => {
              this.eventEnd()
            }, this.battleTime+this.reincarnationAttribute.BATTLESPEED)
          }
          clearInterval(this.pro)
        }
        this.left += 0.5
      }
      this.eventBegin()
      this.pro = setInterval(() => {
        startEnent()
      }, this.moveTime+this.reincarnationAttribute.MOVESPEED)
    },
    eventBegin() {
      this.$store.commit("set_sys_info", {
        msg: "你已进入" + (this.dungeons.type=="endless"?'无尽（lv'+this.dungeons.lv+'）':this.dungeons.name),
        type: 'warning'
      });
      if (this.dungeons.name == '黑色火山') {
        this.$store.commit("set_sys_info", {
          msg: "似乎这就是最后的挑战了",
          type: 'battle'
        });
        this.$store.commit("set_sys_info", {
          msg: "加油吧",
          type: 'battle'
        });
      }
    },
    evenInExecution() {
      var event = this.dungeons.eventType[this.nextEvent - 1]
      switch (event.eventType) {
        case 'battle':
          this.$store.commit("set_sys_info", {
            msg: `
              你遭遇了${event.name}(lv${this.dungeons.lv}),正在战斗中...
            `,
            type: 'battle'
          });
          this.battleComTime = setTimeout(() => {
            this.battleCom(event)
          }, this.battleTime+this.reincarnationAttribute.BATTLESPEED)
          break;
        default:
          break;
      }
    },
    forcedToStopEvent() {
      clearInterval(this.pro)
      clearTimeout(this.timeOut)
      clearTimeout(this.battleComTime)
      this.pro = {}
      this.left = 0
      this.nextEvent = 1
      this.dungeons = {}   // 清空副本数据，模拟原始行为
    },
    eventEnd() {
      // 延迟执行，等待动画完成（原始代码有100ms延迟）
      setTimeout(() => {
        // 胜利后的提示和无尽模式处理
        if (this.dungeons.type == "endless") {
          // 无尽模式：胜利后无条件增加1层
          let newLevel = this.$store.state.playerAttribute.endlessLv + 1;
          this.$store.commit("set_endless_lv", newLevel);
          this.$store.commit("set_sys_info", {
            msg: `无尽挑战成功！层数提升至 ${newLevel}`,
            type: "win",
          });
          this.$store.commit("set_player_curhp", 'full');
        } else {
          this.$store.commit("set_sys_info", {
            msg: `副本探索成功！`,
            type: "win",
          });
        }

        let p = this.findComponentUpward(this, 'index')
        let backpackPanel = this.findBrothersComponents(this, 'backpackPanel', false)[0]

        if (this.dungeons.name == '黑色火山' && !this.$store.state.playerAttribute.endlessLv) {
          this.$store.commit("set_sys_info", {
            msg: "击败了最后的boss，你通关了！",
            type: 'warning'
          });
        }

        if(this.dungeons.lv>=10&&!this.$store.state.playerAttribute.endlessLv){
          this.$store.commit("set_sys_info", {
            msg: "开启了无尽挑战，可点击地图右上角副本图标进入",
            type: 'warning'
          });
          this.$store.commit("set_sys_info", {
            msg: "试试你的极限吧",
            type: 'warning'
          });
          this.$store.commit('set_endless_lv', 1)
        }

        // 清理子组件状态（清空 dungeons 等）
        this.forcedToStopEvent()

        let backpackPanelSign = backpackPanel.itemNum / backpackPanel.grid.length < 0.8
        // 根据不同的重复挑战模式，调用父组件的 eventBegin 重新开始
        if (p.reChallenge && backpackPanelSign && this.dungeons.type != 'endless') {
          // 普通副本重复挑战
          p.eventBegin()
        } else if (p.reEChallenge && p.dungeons && p.dungeons.type == 'endless') {
          // 无尽重复挑战（降一层后重新挑战）
          this.$store.commit("set_endless_lv", this.$store.state.playerAttribute.endlessLv - 1);
          p.eventBegin()
        } else if (p.upEChallenge && p.dungeons && p.dungeons.type == 'endless') {
          // 无尽向上挑战
          p.endlessLv = this.$store.state.playerAttribute.endlessLv
          p.dungeons.lv = this.$store.state.playerAttribute.endlessLv
          p.showEndlessDungeonsInfo()
          p.eventBegin()
        } else {
          // 不重复挑战，退出副本界面
          p.inDungeons = false
        }
      }, 100)
    },
    battleCom(event) {
      let playerAttribute = this.$store.state.playerAttribute.attribute,
        battleTime,
        healthRecoverySpeed = this.$store.state.playerAttribute.healthRecoverySpeed,
        reducedDamage = this.$store.state.playerAttribute.attribute.REDUCDMG,
        playerDPS = playerAttribute.DPS,
        playerBLOC = playerAttribute.BLOC.value,
        monsterAttribute = this.$deepCopy(event.attribute),
        p = this.findComponentUpward(this, 'index')

      var playerDeadTime = (playerAttribute.CURHP.value+playerBLOC) / reducedDamage / monsterAttribute.ATK,
        monsterDeadTime = (monsterAttribute.HP / playerDPS)

      if (monsterDeadTime < playerDeadTime) {
        // 战斗胜利
        battleTime = monsterDeadTime
        var takeDmg = -battleTime * Number(monsterAttribute.ATK)
        takeDmg = parseInt(takeDmg * reducedDamage)
        takeDmg = takeDmg + playerBLOC
        takeDmg = takeDmg>-1?-1:takeDmg
        this.$store.commit('set_player_curhp', takeDmg)

        if (this.dungeons.type == 'endless') {
          this.$store.commit("set_sys_info", {
            msg: `
              击杀了${event.name}(无尽层数：${this.dungeons.lv})，受到了${Math.abs(takeDmg)}点伤害
            `,
            type: 'win'
          });
        } else {
          this.$store.commit("set_sys_info", {
            msg: `
              击杀了${event.name}(lv${this.dungeons.lv})，受到了${Math.abs(takeDmg)}点伤害
            `,
            type: 'win'
          });
        }
        this.caculateTrophy(event)
        if(this.dungeons.lv>this.$store.state.playerAttribute.lv&&event.type=='boss'){
          this.$store.commit("set_sys_info", {
            msg: `
              你升级了，可以刷新出更高等级的副本了。
            `,
            type: 'win'
          });
          this.$store.commit('set_player_lv', this.dungeons.lv)
        }
        if(this.dungeons.difficulty!=1){
          p.dungeonsArr = p.dungeonsArr.filter(({ id }) => id !== this.dungeons.id);
        }
      } else {
        // ========== 战斗失败处理 ==========
        // 1. 无尽模式降层（只降1层）
        if (this.dungeons && this.dungeons.type == 'endless') {
          let oldLv = this.$store.state.playerAttribute.endlessLv;
          let newLv = Math.max(1, oldLv - 1);
          this.$store.commit('set_endless_lv', newLv);
          this.$store.commit("set_sys_info", {
            msg: `无尽挑战失败，层数从 ${oldLv} 降低至 ${newLv} 层。`,
            type: 'warning'
          });
        }

        // 2. 中断向上挑战模式（取消勾选，避免自动重试）
        if (p.upEChallenge) {
          p.upEChallenge = false;
          p.reEChallenge = false;
          this.$store.commit("set_sys_info", {
            msg: `向上挑战已中断。`,
            type: 'warning'
          });
        }

        // 3. 立即停止所有战斗动画和计时器
        clearInterval(this.pro);
        clearTimeout(this.timeOut);
        clearTimeout(this.battleComTime);
        this.pro = {};
        this.timeOut = {};
        this.left = 0;
        this.nextEvent = 1;

        // 4. 清空副本数据，退出战斗界面
        this.dungeons = {};
        p.inDungeons = false;

        // 5. 玩家死亡
        this.$store.commit('set_player_curhp', 'dead');

        // 6. 显示失败信息
        var takeDmg = monsterDeadTime * Number(monsterAttribute.ATK)
        takeDmg = parseInt(takeDmg * reducedDamage)
        takeDmg = takeDmg - playerBLOC
        takeDmg = takeDmg<1?1:takeDmg
        this.$store.commit("set_sys_info", {
          msg: `战斗失败！受到了${takeDmg}点伤害`,
          type: 'warning'
        });
        this.$store.commit("set_sys_info", {
          msg: `你可以尝试强化或者重铸装备之后再来挑战哦`,
          type: 'warning'
        });
      }
    },
    caculateTrophy(event) {
  var items = []
  var lv = this.dungeons.lv
  let timeCompensation = 4;  // 動畫從 50ms → 200ms，慢了 4 倍
  
  if (event.type == 'boss' && this.dungeons.type != 'endless') {
    // 提高獨特裝備基礎掉落率：普通20%，困難60%，極難100%（原5%/15%/25% *4）
    var baseRate = 0.05 * ((this.dungeons.difficulty - 1) * 2 + 1);
    var newRate = Math.min(baseRate * timeCompensation, 0.95);
    var randow = 1 - newRate;
    if (Math.random() > randow) {
      var random = Math.random()
      if (random <= 0.3 && random > 0) {
        var b = this.findBrothersComponents(this, 'weaponPanel', false)[0]
        var item = b.createNewItem(4, parseInt(lv + Math.random() * 6))
        items.push(JSON.parse(item))
      } else if (random <= 0.5 && random > 0.3) {
        var b = this.findBrothersComponents(this, 'armorPanel', false)[0]
        var item = b.createNewItem(4, parseInt(lv + Math.random() * 6))
        items.push(JSON.parse(item))
      }else if (random <= 0.75 && random > 0.5) {
        var b = this.findBrothersComponents(this, 'ringPanel', false)[0]
        var item = b.createNewItem(4, parseInt(lv + Math.random() * 6))
        items.push(JSON.parse(item))
      } else {
        var b = this.findBrothersComponents(this, 'neckPanel', false)[0]
        var item = b.createNewItem(4, parseInt(lv + Math.random() * 6))
        items.push(JSON.parse(item))
      }
    }
  }
  
  var trophy = event.trophy
  var equip = trophy.equip
  // 提高一般裝備掉落機率（4倍）
  var adjustedEquip = equip.map(rate => Math.min(rate * timeCompensation, 1));
  var total = adjustedEquip.reduce((a, b) => a + b, 0);
  if (total > 1) {
    adjustedEquip = adjustedEquip.map(rate => rate / total);
  }
  
  var equipQua = -1;
  var r = Math.random()
  var cumulative = 0;
  for (let i = 0; i < adjustedEquip.length; i++) {
    cumulative += adjustedEquip[i];
    if (r <= cumulative) {
      equipQua = i;
      break;
    }
  }
  
  if (equipQua != -1) {
    var index = Math.floor((Math.random() * 4));
    if (index == 0) {
      var b = this.findBrothersComponents(this, 'weaponPanel', false)[0]
      var item = b.createNewItem(equipQua, lv)
    } else if (index == 1) {
      var b = this.findBrothersComponents(this, 'armorPanel', false)[0]
      var item = b.createNewItem(equipQua, lv)
    }else if (index == 2) {
      var b = this.findBrothersComponents(this, 'ringPanel', false)[0]
      var item = b.createNewItem(equipQua, lv)
    } else {
      var b = this.findBrothersComponents(this, 'neckPanel', false)[0]
      var item = b.createNewItem(equipQua, lv)
    }
    items.push(JSON.parse(item))
    var backpackPanel = this.findBrothersComponents(this, 'backpackPanel', false)[0]
    var goldObtainRatio = 1
    if (this.dungeons.type == 'endless') {
      var endlessLv = this.$store.state.playerAttribute.endlessLv
      goldObtainRatio = 1.5
      items = []
    }
    // 金幣也提高 4 倍
    let finalGold = parseInt(event.trophy.gold * goldObtainRatio * timeCompensation);
    this.$store.commit("set_sys_info", {
      msg: `
          獲得了:金幣${finalGold}
        `,
      type: 'trophy',
      equip: items
    });
    this.$store.commit("set_player_gold", finalGold);
    if(this.dungeons.type == 'endless'){
      return
    }
    // 修改後
// ✅ 正確：保持原價
items.map(item => {
  if (backpackPanel.autoSell[equipQua] && item.quality.name != "獨特") {
    var gold = item.lv * item.quality.qualityCoefficient * 30 * timeCompensation
    this.$store.commit("set_player_gold", parseInt(gold));
    this.$store.commit("set_sys_info", {
      msg: `
        自動出售裝備獲得金幣：${parseInt(gold)}
      `,
      type: 'trophy',
    });
  } else {
    for (let i = 0; i < backpackPanel.grid.length; i++) {
      if (JSON.stringify(backpackPanel.grid[i]).length < 3) {
        this.$set(backpackPanel.grid, i, item)
        break;
      }
    }
  }
})
  } else {
    var goldObtainRatio = 1
    if (this.dungeons.type == 'endless') {
      var endlessLv = this.$store.state.playerAttribute.endlessLv
      goldObtainRatio = 2.6
    }
    let finalGold = parseInt(event.trophy.gold * goldObtainRatio * timeCompensation);
    this.$store.commit("set_sys_info", {
      msg: `
          獲得了:金幣${finalGold}
        `,
      type: 'trophy',
      equip: []
    });
    this.$store.commit("set_player_gold", finalGold);
  }
}
  }
};
</script>
<style lang="scss" scoped>
.dungeons {
  width: 100%;
  height: 100%;
  position: relative;
  .progress-bar {
    position: absolute;
    bottom: 5px;
    left: 10px;
    right: 10px;
    border: 1px solid #fff;
  }
  .icon-bar {
    margin: 0 30px;
    width: calc(100% - 60px);
    height: 100%;
    position: relative;
    & > div {
      position: absolute;
      height: 34px;
      width: 34px;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      img {
        height: 34px;
        width: 34px;
      }
    }
    .player {
      z-index: 2;
      height: 48px;
      width: 32px;
      background-repeat: no-repeat;
      background: url(../../assets/icons/map/player-s.png);
    }
    .monster {
      left: 20%;
    }
  }
}
</style>
