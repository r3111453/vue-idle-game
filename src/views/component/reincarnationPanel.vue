<template>
  <div class="reincarnation">
    <div class="title">
      <p>现在转生可以获得{{willGetreincarnationPoint}}转生点数</p>
      <div class="info">
        <p>- 转生后会失去金币与装备</p>
        <p>- 转生会获得转生点数</p>
        <p>- 转生点数根据人物等级，身上装备品质强化等级计算，持有金币与背包装备不会纳入计算，详细：</p>
        <p style="margin-left: 0.1rem;">· 等级点数：{{lvPoint.toFixed(1)}}</p>
        <p style="margin-left: 0.1rem;">· 武器点数：{{weaponPoint.toFixed(1)}}</p>
        <p style="margin-left: 0.1rem;">· 防具点数：{{armorPoint.toFixed(1)}}</p>
        <p style="margin-left: 0.1rem;">· 项链点数：{{neckPoint.toFixed(1)}}</p>
        <p style="margin-left: 0.1rem;">· 戒指点数：{{ringPoint.toFixed(1)}}</p>
      </div>
      <div class='btn-div'>
        <div class="button" @click="reincarnationConfirm">确认转生</div>
      </div>
    </div>
    <div class="content">
      <div class="info">
        <p>当前转生次数：{{reincarnationData.count}}次</p>
        <p>剩余转生点数：{{reincarnationData.point}}</p>
      </div>
      <div class="reset-btn-div">
        <div class="button reset-button" @click="resetPoints">重置配点</div>
      </div>
      <div class="panel">
        <div class="item" v-for="(v,k) in attr" :key="k">
          <p>
            <img :src="v.img"><span>{{v.showName}}：+{{v.currentValue.toFixed(2)}}{{v.unity}}</span>
          </p>
          <div class="group">
            <div class="button" @click="subtract(v,$event)" @mousedown="subtractDown(v,$event)" @mouseup="subtractUp(v,$event)">-</div>
            <input type="number" min="0" disabled v-model="v.point">
            <div class="button" v-on:click="add(v,$event)" @mousedown="addDown(v,$event)" @mouseup="addUp(v,$event)">+</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { assist } from '../../assets/js/assist';
export default {
  name: "reincarnation",
  mixins: [assist],
  data() {
    return {
      reinCount: 0,
      willGetreincarnationPoint: 0,
      lvPoint:0,
      weaponPoint:0,
      armorPoint:0,
      ringPoint:0,
      neckPoint:0,
      subtractTimer1: {},
      subtractTimer2: {},
      addTimer1: {},
      addTimer2: {},
      attr: [
        { name: 'HP', showName: '生命值', img: require('../../assets/icons/S_Holy01.png'), point: 0, unity: '', currentValue: 0, maxPoint: null, coeff: 10 },
        { name: 'ATK', showName: '攻击力', img: require('../../assets/icons/ATK.png'), point: 0, unity: '', currentValue: 0, maxPoint: null, coeff: 3 },
        { name: 'CRIT', showName: '暴击率', img: require('../../assets/icons/CRIT.png'), point: 0, unity: '%', currentValue: 0, maxPoint: 500, coeff: 0.1 },
        { name: 'CRITDMG', showName: '暴击伤害', img: require('../../assets/icons/CRITDMG.png'), point: 0, unity: '%', currentValue: 0, maxPoint: null, coeff: 1 },
        { name: 'DEF', showName: '护甲', img: require('../../assets/icons/icon_11.png'), point: 0, unity: '', currentValue: 0, maxPoint: null, coeff: 2 },
        { name: 'BLOC', showName: '格挡', img: require('../../assets/icons/S_BLOC.png'), point: 0, unity: '', currentValue: 0, maxPoint: null, coeff: 2 },
        { name: 'MOVESPEED', showName: '副本行进速度', img: require('../../assets/icons/S_EVA.png'), point: 0, unity: 'X', currentValue: 0, maxPoint: 500, coeff: 0.01 },
        { name: 'BATTLESPEED', showName: '副本战斗速度', img: require('../../assets/icons/S_EVA.png'), point: 0, unity: 'X', currentValue: 0, maxPoint: 500, coeff: 0.01 },
      ]
    };
  },
  mounted() {
    this.caculateWillGetreincarnationPoint()
    this.initFromStore()
    this.reinCount = this.reincarnationData.count
  },
  computed: {
    reincarnationData() { return this.$store.state.reincarnation },
    reincarnationAttribute() { return this.$store.state.reincarnationAttribute },
  },
  methods: {
    initFromStore() {
      for (let i in this.reincarnationAttribute) {
        let item = this.reincarnationAttribute[i]
        let attrItem = this.attr.find(a => a.name === i)
        if (!attrItem) continue
        if (i === 'MOVESPEED') {
          // MOVESPEED 存储值为 - (point * 0.06)
          attrItem.point = Math.round(-item / 0.06)
        } else if (i === 'BATTLESPEED') {
          // BATTLESPEED 存储值为 - (point * 3)
          attrItem.point = Math.round(-item / 3)
        } else {
          attrItem.point = Math.round(item / attrItem.coeff)
        }
        this.updateCurrentValue(attrItem)
      }
    },
    updateCurrentValue(item) {
      if (item.name === 'MOVESPEED' || item.name === 'BATTLESPEED') {
        item.currentValue = item.point * item.coeff
      } else {
        item.currentValue = item.point * item.coeff
      }
    },
    reincarnationConfirm() {
      if (this.$store.state.playerAttribute.lv <= 30) {
        this.$store.commit("set_sys_info", {
          msg: "等级这么低就先别转了吧，超过lv:30再来看看",
          type: 'warning'
        });
        return
      }
      this.$message({
        message: `你将获得${this.willGetreincarnationPoint}转生点数，同时你的金币和装备都会消失。`,
        title: '提示',
        closeBtnText: '算了',
        confirmBtnText: '转了转了',
        onClose: () => {
          this.clearPlayerInfo()
          this.$store.commit('set_player_rein', {
            count: this.reinCount + 1,
            point: this.willGetreincarnationPoint + this.reincarnationData.point
          })
          this.willGetreincarnationPoint = 0
          this.reinCount = this.reincarnationData.count
        }
      })
    },
    clearPlayerInfo() {
      this.$store.commit('reset_player_gold', 0)
      this.$store.commit('reset_player_equi', {})
      var backpackPanel = this.findBrothersComponents(this, 'backpackPanel', false)[0]
      backpackPanel.clear()
      var p = this.findComponentUpward(this, 'index')
      p.createdDungeons(true)
    },
    caculateWillGetreincarnationPoint() {
      let lv = this.$store.state.playerAttribute.lv
      this.lvPoint = (lv >= 20 ? Math.floor((lv - 20) ** 1.1 / 2.1) : 0)*1.2

      let weapon = this.$store.state.playerAttribute.weapon
      var wlv = weapon.lv, elv = weapon.enchantlvl || 0, q = weapon.quality.qualityCoefficient
      if (wlv >= 20) {
        this.weaponPoint = Math.floor(((wlv - 20) / 10) ** 1.1 * (0.1 * elv ** 1.5 + 1) * q / 3.5)*1.2
      } else {
        this.weaponPoint = 0
      }

      let armor = this.$store.state.playerAttribute.armor
      var wlv = armor.lv, elv = armor.enchantlvl || 0, q = armor.quality.qualityCoefficient
      if (wlv >= 20) {
        this.armorPoint = Math.floor(((wlv - 20) / 10) ** 1.1 * (0.1 * elv ** 1.5 + 1) * q / 3.5)*1.2
      } else {
        this.armorPoint = 0
      }

      let ring = this.$store.state.playerAttribute.ring
      var wlv = ring.lv, elv = ring.enchantlvl || 0, q = ring.quality.qualityCoefficient
      if (wlv >= 20) {
        this.ringPoint = Math.floor(((wlv - 20) / 10) ** 1.1 * (0.1 * elv ** 1.5 + 1) * q / 3.5)*1.2
      } else {
        this.ringPoint = 0
      }

      let neck = this.$store.state.playerAttribute.neck
      var wlv = neck.lv, elv = neck.enchantlvl || 0, q = neck.quality.qualityCoefficient
      if (wlv >= 20) {
        this.neckPoint = Math.floor(((wlv - 20) / 10) ** 1.1 * (0.1 * elv ** 1.5 + 1) * q / 3.5)*1.2
      } else {
        this.neckPoint = 0
      }
      this.willGetreincarnationPoint = parseInt(this.lvPoint + this.weaponPoint + this.armorPoint + this.ringPoint + this.neckPoint);
    },
    subtract(v, e) {
      let num = 1
      if (e.shiftKey) num = 10
      if (v.point >= num) {
        v.point -= num
        this.$store.commit('set_player_rein', {
          count: this.reinCount,
          point: this.reincarnationData.point + num
        })
        this.caculateAttr()
      }
    },
    subtractDown(v,e) {
      clearTimeout(this.subtractTimer1)
      clearInterval(this.subtractTimer2)
      this.subtractTimer1 = setTimeout(() => {
        this.subtractTimer2 = setInterval(() => {
          this.subtract(v, e)
        }, 50)
      }, 500)
    },
    subtractUp(v) {
      clearTimeout(this.subtractTimer1)
      clearInterval(this.subtractTimer2)
    },
    addDown(v,e) {
      clearTimeout(this.addTimer1)
      clearInterval(this.addTimer2)
      this.addTimer1 = setTimeout(() => {
        this.addTimer2 = setInterval(() => {
          this.add(v, e)
        }, 50)
      }, 500)
    },
    addUp(v) {
      clearTimeout(this.addTimer1)
      clearInterval(this.addTimer2)
    },
    add(v, e) {
      let num = 1
      if (e.shiftKey) num = 10
      if (v.maxPoint && v.point + num > v.maxPoint) {
        this.$store.commit("set_sys_info", {
          msg: `该项最多加点至${v.maxPoint}`,
          type: 'warning'
        })
        return
      }
      if (this.reincarnationData.point >= num) {
        v.point += num
        this.$store.commit('set_player_rein', {
          count: this.reinCount,
          point: this.reincarnationData.point - num
        })
        this.caculateAttr()
      }
    },
    caculateAttr() {
      var data = {
        'HP': 0,
        'ATK': 0,
        'CRIT': 0,
        'CRITDMG': 0,
        'DEF': 0,
        'BLOC': 0,
        'MOVESPEED': 0,
        'BATTLESPEED': 0,
      }
      this.attr.forEach(item => {
        this.updateCurrentValue(item)
        if (item.name === 'MOVESPEED') {
          data.MOVESPEED = -(item.point * 0.06)
        } else if (item.name === 'BATTLESPEED') {
          data.BATTLESPEED = -(item.point * 3)
        } else {
          data[item.name] = item.currentValue
        }
      })
      this.$store.commit('set_player_rein_attribute', data)
    },
    resetPoints() {
      if (confirm('重置后所有已分配的转生点数将返还，确认重置吗？')) {
        // 计算已使用点数（基于重置前的 store 属性）
        const oldAttr = this.$store.state.reincarnationAttribute
        let spent = 0
        spent += oldAttr.HP / 10
        spent += oldAttr.ATK / 3
        spent += oldAttr.CRIT / 0.1
        spent += oldAttr.CRITDMG / 1
        spent += oldAttr.DEF / 2
        spent += oldAttr.BLOC / 2
        spent += oldAttr.MOVESPEED ? -(oldAttr.MOVESPEED / 0.06) : 0
        spent += oldAttr.BATTLESPEED ? -(oldAttr.BATTLESPEED / 3) : 0
        const newRemain = this.$store.state.reincarnation.point + spent
        
        // 重置所有属性的点数为0
        this.attr.forEach(item => {
          item.point = 0
          this.updateCurrentValue(item)
        })
        // 清空 store 中的转生属性加成
        this.$store.commit('set_player_rein_attribute', {
          HP: 0,
          ATK: 0,
          CRIT: 0,
          CRITDMG: 0,
          DEF: 0,
          BLOC: 0,
          MOVESPEED: 0,
          BATTLESPEED: 0,
        })
        // 更新剩余点数
        this.$store.commit('set_player_rein', {
          count: this.reinCount,
          point: newRemain
        })
        // 强制刷新角色属性
        this.$store.commit('set_player_weapon', this.$store.state.playerAttribute.weapon)
        this.$store.commit('set_player_armor', this.$store.state.playerAttribute.armor)
        this.$store.commit('set_player_ring', this.$store.state.playerAttribute.ring)
        this.$store.commit('set_player_neck', this.$store.state.playerAttribute.neck)
        this.$message({ message: '转生点数已重置', type: 'success' })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/* 样式与原文件完全相同，请保留您原有的样式 */
</style>
