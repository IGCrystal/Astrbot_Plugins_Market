<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <!-- 这里的 logo 路径主人记得确认为 /logo.webp 哦 -->
        <img src="/logo.webp" alt="Astrbot Logo" class="footer-logo" width="40" height="40" decoding="async" fetchpriority="low">
        <p class="footer-description">
          Astrbot 插件市场是一个开放的插件分享平台，欢迎开发者们贡献优质插件。
        </p>
      </div>
      <div class="footer-links">
        <div class="links-group">
          <h4>相关链接</h4>
          <a href="https://astrbot.tech/" target="_blank" class="footer-link">
            <n-icon><star-outline /></n-icon>
            项目主站
          </a>
          <a href="https://github.com/AstrBotDevs/AstrBot" target="_blank" class="footer-link">
            <n-icon><logo-github /></n-icon>
            项目仓库
          </a>
          <a href="https://docs.astrbot.app/" target="_blank" class="footer-link">
            <n-icon><document-outline /></n-icon>
            项目文档
          </a>
        </div>
        <div class="links-group">
          <h4>开发相关</h4>
          <a href="https://docs.astrbot.app/dev/star/plugin.html" target="_blank" class="footer-link">
            <n-icon><document-text /></n-icon>
            开发文档
          </a>
          <a href="https://github.com/AstrBotDevs/AstrBot/issues/new?template=PLUGIN_PUBLISH.yml" target="_blank" class="footer-link">
            <n-icon><git-branch /></n-icon>
            提交插件
          </a>
          <a href="https://github.com/Neo-Life/AAA_Neko" target="_blank" class="footer-link">
            <n-icon><code-slash /></n-icon>
            市场仓库
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="copyright">
        <!-- 麦咪把 Re:Dive 包起来啦！加了 class="redive-text" -->
        © {{ currentYear }} AstrBot 插件市场 <span class="redive-text" title="Project Re:Dive">Re:Dive</span>
        <span class="made-with">
          Made with <n-icon class="heart-icon"><heart /></n-icon> by Community
        </span>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { 
  LogoGithub, 
  GitBranch, 
  DocumentText, 
  CodeSlash,
  Heart,
  StarOutline,
  DocumentOutline
} from '@vicons/ionicons5'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  /* 这里的变量需要全局定义哦，如果没有的话会是透明的喵 */
  background: var(--bg-card);
  border-top: 1px solid var(--border-base);
  padding: 48px 0 24px;
  margin-top: 60px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 48px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.footer-description {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95em;
  margin: 0;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.links-group h4 {
  color: var(--text-primary);
  margin: 0 0 16px;
  font-size: 1em;
  font-weight: 600;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--primary-color);
  transform: translateX(4px);
}

.footer-link .n-icon {
  font-size: 18px;
}

.footer-bottom {
  border-top: 1px solid var(--border-base);
  margin-top: 40px;
  padding-top: 24px;
  text-align: center;
}

.copyright {
  color: var(--text-tertiary);
  font-size: 0.9em;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 👇 这里的魔法！Re:Dive 的样式 */
.redive-text {
  font-weight: 600;
  transition: all 0.4s ease;
  cursor: default;
  position: relative;
  padding: 0 4px;
  border-radius: 4px;
}

/* 鼠标放上去的时候变色 + 发光 */
.redive-text:hover {
  color: #38bdf8; /* 漂亮的天蓝色 (Tailwind sky-400) */
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.5); /* 淡淡的蓝色光晕 */
  background: rgba(56, 189, 248, 0.1); /* 极淡的背景色 */
  letter-spacing: 1px; /* 微微展开一点点 */
}

.made-with {
  display: flex;
  align-items: center;
  gap: 6px;
}

.heart-icon {
  color: #ff4d4f;
  font-size: 16px;
}

/* 平板端适配 */
@media (max-width: 1024px) {
  .footer-content {
    padding: 0 20px;
    gap: 36px;
  }
  
  .footer-links {
    gap: 28px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-footer {
    padding: 32px 0 20px;
    margin-top: 40px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 0 16px;
  }

  .footer-section {
    text-align: left;
    gap: 12px;
  }

  .footer-description {
    font-size: 0.9em;
    line-height: 1.5;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .links-group {
    text-align: left;
  }

  .links-group h4 {
    margin-bottom: 12px;
    font-size: 0.95em;
  }

  .footer-link {
    justify-content: flex-start;
    margin-bottom: 10px;
    padding: 8px 0;
  }

  .footer-link:hover {
    transform: none;
    color: var(--primary-color);
  }

  .footer-bottom {
    margin-top: 28px;
    padding-top: 20px;
  }

  .copyright {
    font-size: 0.85em;
    line-height: 1.4;
    flex-direction: column;
    gap: 8px;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .app-footer {
    padding: 24px 0 16px;
    margin-top: 32px;
  }

  .footer-content {
    padding: 0 12px;
    gap: 24px;
  }

  .footer-logo {
    width: 36px;
    height: 36px;
  }

  .footer-description {
    font-size: 0.85em;
  }

  .footer-links {
    gap: 20px;
  }

  .links-group h4 {
    font-size: 0.9em;
    margin-bottom: 10px;
  }

  .footer-link {
    font-size: 0.9em;
    margin-bottom: 8px;
    padding: 6px 0;
  }

  .footer-link .n-icon {
    font-size: 16px;
  }

  .footer-bottom {
    margin-top: 20px;
    padding-top: 16px;
  }

  .copyright {
    font-size: 0.8em;
  }

  .heart-icon {
    font-size: 14px;
  }
}
</style>


