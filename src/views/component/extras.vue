<template>
  <div class="extras">
    <div class="update-info" @click="drawerOpen" type="primary">
      <img src="../../assets/icons/menu/extras.png" alt="">
      <span>更新日志</span>
      <i class="new" v-if="!checkedUpdateInfo"></i>
    </div>
    <transition name="fade">
      <div class="drawer-update" v-if="showExtrasInfo">
        <i class="close" @click="closePanel"></i>
        <div class="scroll">
          <div class="info">
            <h1>📢 更新日志</h1>
            <p>
              完整的更新记录请查阅 GitHub 仓库的
              <a href="https://github.com/r3111453/vue-idle-game#%E6%9B%B4%E6%96%B0%E5%86%85%E5%AE%B9" target="_blank">自述文件 (README.md)</a>
            </p>
            <p style="margin-top: 10px;">
              🎮 玩家交流 Discord：
              <a href="https://discord.gg/HtXrhE9wY5" target="_blank">https://discord.gg/HtXrhE9wY5</a>
            </p>
            <p style="margin-top: 10px; color: #aaa; font-size: 12px;">
              游戏版本持续迭代中，建议关注 GitHub 仓库获取最新动态。
            </p>
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
              <div class="button" @click="submitSuggest()" :disabled="submitDisabled">提交</div>
              <span v-if="cooldownRemaining > 0" style="margin-left: 10px; font-size: 12px; color: #ffaa00;">（冷却中，还需 {{ cooldownRemaining }} 秒）</span>
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
      // 保留一个空的 update 数组（不再使用，但为了不报错保留）
      update: [],
      // 冷却相关
      cooldownUntil: 0,
      cooldownRemaining: 0,
      cooldownTimer: null,
    };
  },
  computed: {
    submitDisabled() {
      return this.disabled || this.cooldownRemaining > 0;
    }
  },
  mounted() {
    this.checkedUpdateInfo = localStorage.getItem('version') == "1.2.2" ? true : false;
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
    startCooldownTimer() {
      if (this.cooldownTimer) clearInterval(this.cooldownTimer);
      this.cooldownTimer = setInterval(() => {
        const now = Date.now();
        if (this.cooldownUntil > now) {
          this.cooldownRemaining = Math.ceil((this.cooldownUntil - now) / 1000);
        } else {
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
            msg: `你发现了彩蛋，想必你也是个游戏热爱者。`,
            type: 'win'
          });
          this.$store.commit("set_sys_info", {
            msg: `开启了GM模式，如果你是玩家的话，请不要滥用GM模式哦。`,
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
      if (this.cooldownRemaining > 0) {
        this.$store.commit("set_sys_info", {
          msg: `请等待 ${this.cooldownRemaining} 秒后再提交～`,
          type: 'warning'
        });
        return;
      }
      if (this.disabled) return;
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
            _gotcha: ''
          })
        });
        if (response.ok) {
          this.$store.commit("set_sys_info", {
            msg: `你的建议已经提交了哦，十分感谢😘`,
            type: 'win'
          });
          this.name = '';
          this.suggest = '';
          const cooldownSeconds = 600;
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
/* 样式保持不变（与之前相同） */
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
  0% { transform: translate(50%, -50%); }
  25% { transform: translate(50%, -70%); }
  50% { transform: translate(50%, -50%); }
  75% { transform: translate(50%, -80%); }
  100% { transform: translate(50%, -50%); }
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
    .vision { font-size: 0.16rem; }
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
