<template>
  <div class="extras">
    <!-- <a class="github" target="_blank" @click="navToGithub" title="源码" src="https://github.com/Couy69/vue-idle-game"></a> -->
    <div class="update-info" @click="drawerOpen" type="primary">
      <img src="../../assets/icons/menu/extras.png" alt="">
      <span>更新日志</span>
      <i class="new" v-if="!checkedUpdateInfo"></i>
    </div>
    <transition name="fade">
      <div class="drawer-update" v-if="showExtrasInfo">
        <i class="close" @click="closePanel"></i>
        <div class="scroll">
          <div class="info" v-for="(item,index) in update" :key="index">
            <h1> {{item.title}}</h1>
            <span v-if="item.desc"> {{item.desc}}</span>
            <h2 class="vision" v-for="(v) in item.vision" :key="v.id" v-if="item.vision">{{v.vision}}:<a :href="v.href" target="_blank"> {{v.href}}</a></h2>
            <h2 v-if="item.adjust">功能调整</h2>
            <p v-for="(v) in item.adjust" :key="v.id">{{v}}</p>
            <h2 v-if="item.majorization">优化</h2>
            <p v-for="(v) in item.majorization" :key="v.id">{{v}}</p>
            <h2 v-if="item.bug">bug修复</h2>
            <p v-for="(v) in item.bug" :key="v.id">{{v}}</p>
          </div>
        </div>

        <div class="footer">
          <div class="footer-github">
            <a class="github" target="_blank" @click="navToGithub" title="源码" src="https://github.com/Couy69/vue-idle-game">
            </a>
            <span>创作不易，给个star？</span>

          </div>
          <div class="footer-suggest">
            <div>
              <textarea placeholder="发现了bug?抑或是有什么建议？欢迎提出来。" @keydown="eastereEgg1($event)" v-model="suggest" />
              </div>
            <div>
              <input type="text" v-model="name" placeholder="你的昵称？">
              <div class="button" @click="submitSuggest()">提交</div>
            </div>
          </div>
          
          
        </div>
      </div>
    </transition>

  </div>
</template>
<script>
import { assist } from '../../assets/js/assist';
export default {
  name: "extras",
  mixins: [assist],
  data() {
    return {
      checkedUpdateInfo: false,
      showExtrasInfo: false,
      name: '',
      suggest: '',
      disabled: false,
      keyCode: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 66, 65],
      reKeyCode: [],
      update: [
        {
          title: '历史版本',
          vision: [{
            vision: 'Discord',
            href: 'https://discord.gg/HtXrhE9wY5'
          }, {
          vision: [{
            vision: '测试服',
            href: 'http://couy.xyz/rpg'
          }, {
            vision: '1.2.2',
            href: 'http://couy.xyz/v1.2.2'
          }],
          desc: '- 这里保留了历史版本，你仍然可以导入存档到旧版本游玩,测试服版本不保证可玩性',
        },
        {
          title: '2026-4-18 (1.3.5)',
          adjust: [
            '- 背包一键整理现在支持排序模式切换（可选择按类型、品质、等级排序，或选择不排序）',
            '- 血量恢复后自动重新挑战地下城功能',
            '- 自动刷新和购买商店装备',
            '- 背包容量提升到100，除此之外未对原版参数进行任何修改',
            '- 地下城及其怪物强度、生命、攻击力显示，计算能否胜利和恢复时长',
            '- 装备属性强度显示',
            '- 属性面板计算公式显示',
            '- 商店装备属性直接显示',
            '- 强化界面估算自动强化到目标等级的消耗显示',
            '- 存档保存背包自动出售的设置',
            '- 微调部分界面',
          ]
        },
        {
          title: '2026-4-17 (1.3.4)',
          adjust: [
            '- 装备商店免费刷新次数现在可以累积最多100次',
            '- 装备商店免费刷新的冷却时间调整为5秒',
            '- 装备商店金币刷新金额降低为100金币',
            '- 背包一键整理现在会按照武器、防具、戒指、项链的类型顺序自动排列',
          ],
          bug: [
            '- 已修复：刷新网页可以绕过装备商店免费刷新冷却的漏洞',
          ]
        },
        {
          title: '2021-1-15 (1.3.3)',
          adjust: [
            '- 略微调高了强化带来的的基础属性加成',
            '- 商店刷新到独特装备时新增提示',
            '- 略微调高了一点杀怪金币获取',
            '- 添加了看上去很牛x的 + 13特效',
          ],
          bug: [
            '- 已修复：特定情况下无尽挑战成功后并没有回复满血',
          ]
        },
        {
          title: '2020-12-11 (1.3.2)',
          desc: '- 界面显示的问题下个版本会解决，作者现在沉迷赛博朋克2077',
          adjust: [
            '-  商店售出装备等级无上限，跟随人物等级',
            '-  添加了百分比格挡词条',
          ],
          bug: [
            '- 已修复：无尽等级与人物等级可能出现负数(感谢天狐，鸡鸡姬的bug提交)',
            '- 已修复：无尽勾选重复挑战后导致困难与极难副本也可以重复挑战(感谢konoha，游戏玩家的bug提交)'
          ]
        },
        {
          title: '2020-12-09 (1.3.1)',
          desc: '- 提交bug时希望准确描述一下😄',
          adjust: [
            '-  无尽难度：对应层数*10的极难副本 -> 对应层数*5的极难副本',
          ],
          majorization: [
            '- 稍微调高了一点金币获取',
            '- 自动强化需要两倍金币修改为不需要额外金币,与手动强化一致',
            '- 调整了百分比词条的曲线，会在前期低等级时获得更高的属性',
            '- 调高了部分带护甲词条的装备属性',
          ],
          bug: [
            '- 已修复：装备强化后格挡值计算低于预期',
          ]
        },
        {
          title: '2020-12-08 (1.3.0)',
          desc: '- 遇到了bug或者平衡性方面的问题希望大家可以反馈一下。',
          adjust: [
            '-  添加人物转生，转生时会获得转生点数来强化人物基础属性',
            '-  修改副本刷新规则，现在副本将根据人物等级来刷新，点击菜单栏的刷新按钮来刷新(30S cd)',
            '-  副本现在为随机生成，并不是以前的固定属性，难度增加，金币获取增加',
            '-  饰品栏拆分为戒指与项链，添加新的项链装备',
            '-  无尽挑战现在可以重置当前的挑战等级',
            '-  添加格挡属性词条',
            '-  护甲计算公式调整，极限值由100%调整至95%',
          ],
          majorization: [
            '-  加入了新的字体',
            '-  重铸时会显示当前词条的品质等级，方便确定当前词条是不是最佳属性',
          ],
          bug: [
            '- 修复后台挑战副本失败时自动回血失效的bug',
            '- 自动出售价格低于预期',
          ]
        },
        {
          title: '2020-11-30 (1.2.2)',
          desc: '- 这次基本上都是些小优化。',
          adjust: [
            '-  现在支持自动强化了，可以在强化界面设定目标等级自动强化，不过花费金币为正常值的两倍',
            '-  点击右下角清除存档可以重新开始游戏，请谨慎操作或者备份原有存档',
            '-  背包中可以设置自动出售的装备稀有度等级了（感谢执着的bug提交）',
          ],
          majorization: [
            '- 调整了一下手机端的显示，从后台来看用手机玩的用户好像也不少',
          ],
          bug: [
            '- 修复手动结束挑战时出现的错误',
          ]
        },
        {
          title: '2020-11-26 (1.2.1)',
          desc: '- 现在可以在更新公告下方直接提意见了，或者是反馈bug。',
          adjust: [
            '-  商店支持金币刷新了',
            '-  无尽挑战添加自动挑战',
          ],
          majorization: [
            '- 现在强化后会保存游戏',
            '- 继续加强副本',
            '- 装备数值调整',
          ],
        },
        {
          title: '2020-11-25 (1.2.0)',
          desc: '- 时隔半个多月的更新,这次修改的内容比较多',
          adjust: [
            '-  添加导入导出存档功能：背包装备过多可能导致存档数据比较长，所以建议导出前处理一下背包装备 ',
            '-  添加自动出售：背包栏可以开启自动出售，自动出售会卖出低品质的装备（低于神器）',
            '-  添加装备强化与词条重铸：需要金币',
            '-  添加独特级别的防具与饰品',
          ],
          majorization: [
            '- 加强副本强度（一级副本基本没有加强，100级强度大概增加了五倍，这个强度变化是线性的）',
            '- 加了一些动画',
            '- 装备数值调整',
            '- 独特装备掉率修改为4%,商店有较小概率刷新出独特装备',
            '- 售出装备获得金币调高了三倍，增加了高级副本金币获取'
          ],
          bug: [
            '- 修复自动出售可能将背包其余装备卖出的bug',
          ]
        }, {
          title: '2020-11-09 (1.1.1)',
          adjust: [
            '-  适配移动端',
          ],
        },
        {
          title: '2020-11-06 (1.1.0)',
          desc: '',
          adjust: [
            '- （功能）添加装备锁定功能',
            '- （功能）装备新增百分比词条',
            '- （功能）添加 60~100 级副本',
            '- （功能）完成副本时可能掉落独特级别的装备（通关后 2.5%掉落率，无尽挑战不会掉落）',
            '- （功能）通关后开启无尽挑战'
          ],
          majorization: [
            '- （优化）调整了商店价格（前期更低，后期更高），现在商店等级最高为 110 级',
            '- （优化）调整并添加了一些新装备',
            '- （优化）上调了 90 与 100 级副本的难度'
          ],
          bug: [
            '- （bug）修复了手动结束副本挑战可能导致副本加速的 bug'
          ]
        },]
    };
  },
  mounted() {
    this.checkedUpdateInfo = localStorage.getItem('version') == "1.2.2" ? true : false
  },
  methods: {
    eastereEgg1(e) {
      setTimeout(() => {
        this.reKeyCode = []
      }, 3000)
      this.reKeyCode.push(e.keyCode)
      if (JSON.stringify(this.reKeyCode) == JSON.stringify(this.keyCode)) {
        var p = this.findComponentUpward(this, 'index')
        if (!p.GMmodel) {
          p.GMmodel = true
          this.$store.commit("set_sys_info", {
            msg: `
              你发现了彩蛋，想必你也是个游戏热爱者。
            `,
            type: 'win'
          });
          this.$store.commit("set_sys_info", {
            msg: `
              开启了GM模式，如果你是玩家的话，请不要滥用GM模式哦。
            `,
            type: 'win'
          });
        }
      }
    },
    drawerOpen() {
      this.showExtrasInfo = true
      this.checkedUpdateInfo = true
      localStorage.setItem('version', '1.2.2')
    },
    closePanel() {
      localStorage.setItem('version', '1.2.2')
      this.showExtrasInfo = false
    },
    navToGithub() {
      //window.open('https://github.com/Couy69/vue-idle-game', '_blank');
      //window.open('https://github.com/XiaofengdiZhu/vue-idle-game-mod', '_blank');
      window.open('https://github.com/r3111453/vue-idle-game', '_blank');
    },
    async submitSuggest() {
      if (this.disabled) {
        return
      }
      try {
        let data = await this.$api.post(
          "http://couy.xyz/v1/Suggest/add",
          {
            name: this.name,
            suggest: this.suggest,
          }
        );
        console.log(data)
        if (data.data.error_code == 20000) {
          this.$store.commit("set_sys_info", {
            msg: `
              你的建议已经提交了哦，十分感谢😘
            `,
            type: 'win'
          });
          this.name = ''
          this.suggest = ''
        } else {
          this.$store.commit("set_sys_info", {
            msg: `
              提交失败：${data.data.msg}
            `,
            type: 'win'
          });
        }
      } catch (error) {
        console.log(error);
      }
      this.disabled = true
      setTimeout(() => {
        this.disabled = false
      }, 1000)
    }
  }
};


</script>
<style lang="scss" scoped>
.extras {
  position: fixed;
  width: 0.5rem;
  height: 0.55rem;
  display: flex;
  bottom: 0.1rem;
  right: 0.8rem;
  z-index: 2;
  cursor: pointer;
  .update-info {
    margin-right: 0.2rem;
    cursor: pointer;
    width: 0.5rem;
    height: 0.55rem;
    position: relative;
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
    .new {
      display: flex;
      width: 0.3rem;
      height: 0.16rem;
      position: absolute;
      top: 0rem;
      right: 0px;
      transform: translate(50%, -50%);
      background-image: url("../../assets/icons/menu/NEW.png");
      background-size: contain;
      background-repeat: no-repeat;
      animation: tipsMove 1s infinite;
    }
  }
}
@keyframes tipsMove {
  0% {
    transform: translate(50%, -50%);
  }
  25% {
    transform: translate(50%, -70%);
  }
  50% {
    transform: translate(50%, -50%);
  }
  75% {
    transform: translate(50%, -80%);
  }
  100% {
    transform: translate(50%, -50%);
  }
}
.drawer-update {
  position: fixed;
  width: 30%;
  height: 100%;
  background: #111;
  top: 0;
  right: 0;
  padding: 0.2rem;
  z-index: 10;
  .scroll {
    height: calc(100% - 2rem);
    overflow-y: auto;
    .vision {
      font-size: 0.16rem;
    }
    a {
      color: #fff;
      text-decoration: underline;
      font-size: 0.14rem;
      user-select: initial;
    }
  }
  .close {
    cursor: pointer;
    position: absolute;
    top: 0.13rem;
    right: 0.15rem;
    display: block;
    width: 0.3rem;
    height: 0.3rem;
    background-image: url(../../assets/icons/close.png);
    background-size: cover;
  }
  .info {
    padding: 0.2rem;
    text-align: left;
    h1 {
      margin: 0.06rem 0;
      font-size: 0.23rem;
      letter-spacing: 1px;
    }
    span {
      margin: 0.06rem;
      font-size: 0.13rem;
      letter-spacing: 1px;
    }
    h2 {
      padding-left: 0.2rem;
      line-height: 0.3rem;
      margin: 0.1rem 0;
      font-size: 0.18rem;
      letter-spacing: 1px;
    }
    p {
      padding-left: 0.25rem;
      line-height: 0.2rem;
      color: #fafafa;
      font-size: 0.13rem;
      letter-spacing: 1px;
    }
  }
}
.footer {
  border-top: 1px solid #444;
  position: absolute;
  bottom: 0;
  left: 0;
  background: #111;
  width: 100%;
  height: 2rem;
  padding: 0.1rem 0.3rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .github {
    margin-bottom: 0.1rem;
    margin-left: 0.1rem;
    background: #fafafa;
    display: block;
    width: 0.32rem;
    height: 0.32rem;
    border-radius: 50%;
    background-image: url(../../assets/icons/github.svg);
    background-size: cover;
  }
  .footer-suggest {
    flex: 1;
    padding: 0 0.2rem;
    & > div {
      width: 100%;
      display: flex;
      margin: 0.1rem;
      justify-content: space-between;
    }
    textarea {
      width: 90%;
      height: 1rem;
      max-width: 4rem;
      max-height: 1.5rem;
    }
  }
  .footer-github {
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    & > div {
      display: flex;
      margin: 0.1rem;
      justify-content: space-between;
    }
    span {
      text-align: center;
    }
  }
}
</style>
