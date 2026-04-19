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
            <a class="github" target="_blank" @click="navToGithub" title="源码"></a>
            <span>
              本游戏基于 
              <a href="https://github.com/Couy69/vue-idle-game" target="_blank">Couy69 的 vue-idle-game</a> 修改，
              并参考了 
              <a href="https://github.com/XiaofengdiZhu/vue-idle-game-mod" target="_blank">XiaofengdiZhu 的 mod 版本</a>，
              感谢原作与 mod 作者！
            </span>
          </div>
          <div class="footer-suggest">
            <div>
              <textarea placeholder="发现了bug?抑或是有什么建议？欢迎提出来。" @keydown="eastereEgg1($event)" v-model="suggest" />
              </div>
            <div>
              <input type="text" v-model="name" placeholder="你的昵称？">
              <div class="button" @click="submitSuggest()" :disabled="submitDisabled">
                提交
              </div>
              <span v-if="cooldownRemaining > 0" style="margin-left: 10px; font-size: 12px; color: #ffaa00;">
                （冷却中，还需 {{ cooldownRemaining }} 秒）
              </span>
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
      disabled: false,          // 仍然用于防止并发提交
      keyCode: [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 66, 65],
      reKeyCode: [],
      update: [ ... ],          // 省略原有 update 数组，内容不变（为了简洁不重复写）
      // 冷却相关
      cooldownUntil: 0,         // 冷却结束的时间戳（毫秒）
      cooldownRemaining: 0,     // 剩余秒数（用于显示）
      cooldownTimer: null,      // 定时器
    };
  },
  computed: {
    // 按钮是否禁用（冷却中 或者 正在提交中）
    submitDisabled() {
      return this.disabled || this.cooldownRemaining > 0;
    }
  },
  mounted() {
    this.checkedUpdateInfo = localStorage.getItem('version') == "1.2.2" ? true : false;
    // 加载持久化的冷却结束时间
    const savedUntil = localStorage.getItem('submit_cooldown_until');
    if (savedUntil) {
      const until = parseInt(savedUntil, 10);
      if (until > Date.now()) {
        this.cooldownUntil = until;
        this.startCooldownTimer();
      } else {
        localStorage.removeItem('submit_cooldown_until');
      }
    }
  },
  beforeDestroy() {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  },
  methods: {
    // 启动倒计时定时器
    startCooldownTimer() {
      if (this.cooldownTimer) clearInterval(this.cooldownTimer);
      this.cooldownTimer = setInterval(() => {
        const now = Date.now();
        if (this.cooldownUntil > now) {
          this.cooldownRemaining = Math.ceil((this.cooldownUntil - now) / 1000);
        } else {
          // 冷却结束
          this.cooldownRemaining = 0;
          this.cooldownUntil = 0;
          localStorage.removeItem('submit_cooldown_until');
          if (this.cooldownTimer) {
            clearInterval(this.cooldownTimer);
            this.cooldownTimer = null;
          }
        }
      }, 1000);
    },
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
      window.open('https://github.com/r3111453/vue-idle-game', '_blank');
    },
    async submitSuggest() {
      // 检查冷却
      if (this.cooldownRemaining > 0) {
        this.$store.commit("set_sys_info", {
          msg: `请等待 ${this.cooldownRemaining} 秒后再提交～`,
          type: 'warning'
        });
        return;
      }
      // 防止并发提交
      if (this.disabled) return;
      // 校验内容
      if (!this.suggest.trim()) {
        this.$store.commit("set_sys_info", {
          msg: `请填写反馈内容后再提交哦～`,
          type: 'warning'
        });
        return;
      }

      this.disabled = true;
      try {
        const endpoint = 'https://formspree.io/f/mojyweay';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: this.name || '匿名玩家',
            suggest: this.suggest,
            _gotcha: ''   // 蜜罐字段
          })
        });
        if (response.ok) {
          this.$store.commit("set_sys_info", {
            msg: `你的建议已经提交了哦，十分感谢😘`,
            type: 'win'
          });
          // 清空输入框
          this.name = '';
          this.suggest = '';
          // 设置 10 分钟冷却（600 秒）
          const cooldownSeconds = 600; // 10分钟
          this.cooldownUntil = Date.now() + cooldownSeconds * 1000;
          localStorage.setItem('submit_cooldown_until', this.cooldownUntil);
          this.startCooldownTimer();
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.errors ? errorData.errors.map(e => e.message).join(', ') : '提交失败';
          this.$store.commit("set_sys_info", {
            msg: `提交失败：${errorMsg}`,
            type: 'warning'
          });
        }
      } catch (error) {
        console.error(error);
        this.$store.commit("set_sys_info", {
          msg: `网络错误，请稍后重试`,
          type: 'warning'
        });
      } finally {
        this.disabled = false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
/* 样式部分保持不变，省略（和原来一样） */
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
