<template>
  <footer class="app-footer" ref="footerRef">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-brand">
          <img :src="logoUrl" alt="AstrBot Logo" class="footer-logo" width="40" height="40" decoding="async" fetchpriority="low">
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
          <a href="https://astrbot.app/" target="_blank" class="footer-link">
            <n-icon><globe-outline /></n-icon>
            官方项目主站
          </a>
          <a href="https://plugins.astrbot.app/" target="_blank" class="footer-link">
            <n-icon><apps-outline /></n-icon>
            官方插件市场
          </a>
          <a href="https://github.com/AstrBotDevs/AstrBot" target="_blank" class="footer-link">
            <n-icon><logo-github /></n-icon>
            官方项目仓库
          </a>
          <a href="https://cbblover.neo-life.wenturc.com/" target="_blank" class="footer-link">
            <n-icon><star-outline /></n-icon>
            侧边展示主站
          </a>
        </div>
        <div class="links-group">
          <h4>开发相关</h4>
          <a href="https://docs.astrbot.app/dev/star/plugin.html" target="_blank" class="footer-link">
            <n-icon><document-text /></n-icon>
            插件开发文档
          </a>
          <a href="https://github.com/AstrBotDevs/AstrBot/issues/new?template=PLUGIN_PUBLISH.yml" target="_blank" class="footer-link">
            <n-icon><git-branch /></n-icon>
            快速提交插件
          </a>
          <a href="https://docs.astrbot.app/" target="_blank" class="footer-link">
            <n-icon><document-outline /></n-icon>
            官方项目文档
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p class="copyright">
        <span class="copyright-text">© {{ currentYear }} AstrBot 插件市场</span>
        <span class="made-with">
          Made with
          <a
            class="heart-link"
            href="https://github.com/Neo-Life/AAA_Neko"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AAA_Neko GitHub repository"
            @click="handleHeartClick"
            @keydown.enter="handleHeartKeyboard"
            @keydown.space="handleHeartKeyboard"
          >
            <span class="heart-icon-wrapper">
              <n-icon class="heart-icon"><heart /></n-icon>
              <span
                v-for="burst in heartBursts"
                :key="burst.id"
                class="heart-burst"
                :style="{
                  '--tx': burst.tx + 'px',
                  '--ty': burst.ty + 'px',
                  '--scale': burst.scale,
                  '--duration': burst.duration + 'ms',
                  '--delay': burst.delay + 'ms',
                  '--rotation': burst.rotation + 'deg'
                }"
              ></span>
            </span>
          </a>
          by Community
        </span>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { NIcon } from 'naive-ui'
import logoUrl from '@/assets/logo.webp'
import {
  LogoGithub,
  GitBranch,
  DocumentText,
  Heart,
  StarOutline,
  DocumentOutline,
  GlobeOutline,
  AppsOutline
} from '@vicons/ionicons5'
import { useFooterHeight } from './useFooterHeight'

const currentYear = computed(() => new Date().getFullYear())

const { footerRef, footerHeight } = useFooterHeight()

type HeartBurst = {
  id: number
  tx: number
  ty: number
  scale: number
  duration: number
  delay: number
  rotation: number
}

const heartBursts = ref<HeartBurst[]>([])
let nextBurstId = 0
const burstTimeouts = new Map<number, ReturnType<typeof setTimeout>>()
let navigationTimeoutId: number | undefined

const HEART_NAVIGATION_DELAY = 700

const triggerHeartBurst = () => {
  const burstCount = 6
  const newBursts: HeartBurst[] = Array.from({ length: burstCount }, () => {
    const id = nextBurstId++
    return {
      id,
      tx: (Math.random() - 0.5) * 48,
      ty: -Math.random() * 48 - 8,
      scale: 0.7 + Math.random() * 0.6,
      duration: 520 + Math.random() * 260,
      delay: Math.random() * 80,
      rotation: (Math.random() - 0.5) * 120
    }
  })

  heartBursts.value.push(...newBursts)

  newBursts.forEach((burst) => {
    const timeoutId = setTimeout(() => {
      heartBursts.value = heartBursts.value.filter((item) => item.id !== burst.id)
      burstTimeouts.delete(burst.id)
    }, burst.duration + burst.delay)

    burstTimeouts.set(burst.id, timeoutId)
  })
}

const navigateToHeartLink = (anchorElement: HTMLAnchorElement | null) => {
  if (!anchorElement) return

  const href = anchorElement.getAttribute('href') ?? ''
  if (!href) return

  const target = anchorElement.getAttribute('target') ?? '_self'
  const rel = anchorElement.getAttribute('rel') ?? ''
  const openInNewTab = target === '_blank'

  if (navigationTimeoutId) {
    clearTimeout(navigationTimeoutId)
  }

  navigationTimeoutId = window.setTimeout(() => {
    if (openInNewTab) {
      const noopener = rel.includes('noopener') ? 'noopener' : ''
      const noreferrer = rel.includes('noreferrer') ? 'noreferrer' : ''
      const featureString = [noopener, noreferrer].filter(Boolean).join(',') || undefined
      window.open(href, target, featureString)
    } else {
      window.location.assign(href)
    }
    navigationTimeoutId = undefined
  }, HEART_NAVIGATION_DELAY)
}

const shouldBypassCustomNavigation = (event: MouseEvent) => {
  const isPrimaryButton = typeof event.button !== 'number' || event.button === 0
  return !isPrimaryButton || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

const handleHeartClick = (event: MouseEvent) => {
  if (shouldBypassCustomNavigation(event)) {
    return
  }

  event.preventDefault()
  triggerHeartBurst()
  navigateToHeartLink(event.currentTarget instanceof HTMLAnchorElement ? event.currentTarget : null)
}

const handleHeartKeyboard = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return
  }

  event.preventDefault()
  triggerHeartBurst()
  navigateToHeartLink(event.currentTarget instanceof HTMLAnchorElement ? event.currentTarget : null)
}

onBeforeUnmount(() => {
  burstTimeouts.forEach((timeoutId) => clearTimeout(timeoutId))
  burstTimeouts.clear()

  if (navigationTimeoutId) {
    clearTimeout(navigationTimeoutId)
  }
})

defineExpose({ footerHeight })
</script>

<style scoped src="./AppFooterStyles.css"></style>
