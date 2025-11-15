<template>
  <footer class="app-footer" ref="footerRef">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-brand">
          <img src="/logo.webp" alt="AstrBot Logo" class="footer-logo" width="40" height="40" decoding="async" fetchpriority="low">
          <span class="footer-title">AstrBot 插件市场</span>
          <span class="footer-badge">社区</span>
        </div>
        <p class="footer-description">
          AstrBot 插件市场 是一个开放的插件分享平台，欢迎开发者们贡献优质插件。本站致力于为 AstrBot 用户提供高质量扩展，帮助您快速找到喜欢的插件，并鼓励社区伙伴分享使用心得、提出改进建议。
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
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="copyright">
        <span class="copyright-text">© {{ currentYear }} AstrBot 插件市场</span>
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
import { useFooterHeight } from './useFooterHeight'

const currentYear = computed(() => new Date().getFullYear())

const { footerRef, footerHeight } = useFooterHeight()

defineExpose({ footerHeight })
</script>

<style scoped src="./AppFooterStyles.css"></style>
