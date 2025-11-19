<template>
  <main class="mui-login">
    <div class="mui-login__container" :class="{ 'is-loading': isRedirecting }">
        <div v-if="isRedirecting" class="mui-login__progress" aria-hidden="true">
          <div class="mui-login__progress-bar"></div>
        </div>
        <figure
          class="mui-login__visual"
          :class="{ 'is-loaded': heroImageLoaded, 'is-fallback': isFallbackImage }"
          aria-hidden="true"
        >
          <img
            ref="heroImageRef"
            :src="heroImageUrl"
            :alt="heroImageAlt"
            decoding="async"
            loading="eager"
            @load="onHeroImageLoad"
            @error="onHeroImageError"
          >
          <figcaption>
            图像来源
            <a
              v-if="heroImageAttribution.link"
              :href="heroImageAttribution.link"
              target="_blank"
              rel="noopener noreferrer"
              class="author-link"
            >
              {{ heroImageAttribution.label }}
            </a>
            <template v-else>
              {{ heroImageAttribution.label }}
            </template>
          </figcaption>
        </figure>

        <section class="mui-login__panel" aria-labelledby="loginTitle">
          <div class="mui-login__copy">
            <div class="mui-login__hero">
              <div class="header-title login-header-title">
                <img
                  :src="logoUrl"
                  alt="AstrBot Logo"
                  class="header-logo login-header-logo"
                  width="28"
                  height="28"
                  decoding="async"
                  draggable="false"
                  fetchpriority="high"
                  @dragstart.prevent
                >
                <div class="title-wrapper">
                  <div class="animated-title" role="heading" aria-label="AstrBot 插件市场">
                    <span
                      v-for="(char, index) in titleChars"
                      :key="`${char}-${index}`"
                      class="title-char"
                      :style="{ animationDelay: `${index * 0.06}s` }"
                      aria-hidden="true"
                    >{{ char }}</span>
                  </div>
                  <span class="third-party-badge third-party-badge--login">社区</span>
                </div>
              </div>
            </div>

            <h1 id="loginTitle" class="mui-login__title">
              <n-icon size="24" class="title-icon">
                <happy-outline />
              </n-icon>
              欢迎回来！
            </h1>
            <p class="mui-login__description">
              本站点仅由 <a href="https://github.com/IGCrystal" target="_blank" rel="noopener noreferrer" class="author-link">IGCrystal</a> 开发的第三方插件市场，与 AstrBot 官方无关，但是你可以前往 <a href="https://plugins.astrbot.app" target="_blank" rel="noopener noreferrer" class="author-link">官方网站</a> 。本网站的开发仅个人练习的目的，目前它是公开的。
            </p>
            <p class="mui-login__hint">
              为了更好的使用体验，请完成 GitHub 认证以继续访问。登录即代表您同意
              <span
                role="link"
                tabindex="0"
                class="terms-link"
                @click="openTerms"
                @keyup.enter="openTerms"
              >使用条款</span>。
            </p>

            <p v-if="errorMessage" class="mui-login__error" aria-live="polite">
              {{ errorMessage }}
            </p>
          </div>

          <div class="mui-login__actions">
            <button
              class="mui-button mui-button--filled"
              type="button"
              :disabled="isRedirecting"
              @click="startLogin"
            >
              <span class="mui-button__label">
                <n-icon
                  v-if="!isRedirecting"
                  size="20"
                  class="mui-button__icon"
                  aria-hidden="true"
                >
                  <logo-github />
                </n-icon>
                <n-spin
                  v-else
                  :size="18"
                  stroke="currentColor"
                  class="mui-button__spinner"
                />
                <span>{{ isRedirecting ? '跳转中' : '使用 GitHub 登录' }}</span>
              </span>
            </button>

            <button
              v-if="userData?.authenticated"
              class="mui-button mui-button--text"
              type="button"
              @click="handleLogout"
            >
              <span class="mui-button__label">退出当前账户</span>
            </button>
          </div>
        </section>
      </div>

      <ClientOnly>
        <Teleport to="body">
          <Transition name="modal-fade">
            <div v-if="showTerms" class="terms-overlay">
              <div class="terms-modal" @click.stop>
                <header class="terms-header">
                  <h2>AstrBot 插件市场使用条款</h2>
                </header>
                <section class="terms-content" aria-label="使用条款内容">
                  <p class="terms-intro">
                    请您在继续使用本站前仔细阅读以下条款。继续使用意味着您已理解并同意全部约定。
                  </p>
                  <article v-for="section in termsSections" :key="section.title" class="terms-section">
                    <h3>{{ section.title }}</h3>
                    <ul>
                      <li v-for="(item, idx) in section.items" :key="`${section.title}-${idx}`">
                        {{ item }}
                      </li>
                    </ul>
                  </article>
                  <footer class="terms-footer">
                    <small>最后更新：{{ termsUpdatedAt }}</small>
                    <button class="terms-confirm" @click="closeTerms">
                      我已阅读并同意
                    </button>
                  </footer>
                </section>
              </div>
            </div>
          </Transition>
        </Teleport>
      </ClientOnly>
  </main>
</template>

<script setup lang="ts">
import { NIcon, NSpin } from 'naive-ui'
import { HappyOutline, LogoGithub } from '@vicons/ionicons5'
import logoUrl from '@/assets/logo.webp'

definePageMeta({
  ssr: false
})

const route = useRoute()
const nextPath = computed(() => {
  const candidate = route.query.next
  return typeof candidate === 'string' && candidate.startsWith('/') ? candidate : '/'
})

const titleText = 'AstrBot 插件市场'
const titleChars = computed(() => titleText.split('').map((char) => (char === ' ' ? '\u00A0' : char)))

type AuthUserResponse = {
  authenticated: boolean
  user: null | {
    login: string
    name?: string | null
    avatarUrl?: string | null
  }
}

type WallpaperResponse = {
  primaryUrl: string | null
  proxyUrl: string | null
  title?: string | null
  copyright?: string | null
  copyrightLink?: string | null
}

const { data: userData, refresh } = await useFetch<AuthUserResponse>('/api/auth/user', {
  credentials: 'include'
})
const heroWallpaper = ref<WallpaperResponse | null>(null)
const authState = useState('auth-state', () => ({
  checked: false,
  authenticated: false
}))

const heroImageRef = ref<HTMLImageElement | null>(null)
const heroImageLoaded = ref(false)
type HeroImageMode = 'proxy' | 'primary' | 'fallback'
const heroImageMode = ref<HeroImageMode>('fallback')
const heroImageFallback = 'https://www.bing.com/th?id=OHR.ShenandoahTrail_ZH-CN8626326726_1920x1080.jpg'
const heroImageUrl = computed(() => {
  if (heroImageMode.value === 'proxy') {
    return heroWallpaper.value?.proxyUrl ?? heroWallpaper.value?.primaryUrl ?? heroImageFallback
  }
  if (heroImageMode.value === 'primary') {
    return heroWallpaper.value?.primaryUrl ?? heroImageFallback
  }
  return heroImageFallback
})
const heroImageAlt = computed(() => heroWallpaper.value?.title ?? 'Bing 壁纸图像')
const heroImageAttribution = computed(() => ({
  label: heroWallpaper.value?.copyright ?? 'Bing 每日壁纸',
  link: heroWallpaper.value?.copyrightLink ?? null
}))
const isFallbackImage = computed(() => heroImageMode.value === 'fallback')

watchEffect(() => {
  if (userData.value) {
    authState.value = {
      checked: true,
      authenticated: userData.value.authenticated
    }
  }
})

const isRedirecting = ref(false)
const showTerms = ref(false)
const termsUpdatedAt = '2025年11月19日'
type TermsSection = {
  title: string
  items: string[]
}
const termsSections = ref<TermsSection[]>([
  {
    title: '访问与身份',
    items: [
      '本站仅用于 AstrBot 社区插件展示。',
      '访问本站需使用 GitHub 账号登录。',
    ]
  },
  {
    title: '数据与隐私',
    items: [
      '站点仅记录必要的登录状态与页面浏览，不会存储您的 GitHub 凭据。',
      '如需撤回数据收集授权，请在 GitHub 删除 Neo-Life 应用授权，并清理你浏览器的 Cookie 信息。',
      '但是为了更好的访问体验，此前的浏览统计数据可能会被保留一段时间。',
    ]
  },
  {
    title: '合理使用',
    items: [
      '请勿对本网站进行恶意抓取、注入或破坏，禁止任何商业化滥用。',
      '提交插件或评论须保持真实、友善，不得发布违法违规内容。'
    ]
  },
  {
    title: '免责声明',
    items: [
      '本网站为个人练习项目，现状提供，不对数据准确性、可用性提供保证。',
      '若因使用本站造成的任何损失，开发者不承担法律责任。'
    ]
  }
])

const errorMessage = computed(() => {
  const error = route.query.error
  if (error === 'unauthorized') {
    return '你的 GitHub 账号不在允许访问的名单中。'
  }
  if (error === 'state') {
    return '授权状态失效，请重新发起登录。'
  }
  if (error === 'oauth') {
    return 'GitHub 返回未知错误，请稍后再试。'
  }
  return null
})

function startLogin() {
  if (isRedirecting.value) return
  isRedirecting.value = true
  const target = `/api/auth/login?next=${encodeURIComponent(nextPath.value)}`
  window.location.href = target
}

function onHeroImageLoad() {
  heroImageLoaded.value = true
}

function onHeroImageError() {
  heroImageLoaded.value = false
  if (heroImageMode.value === 'proxy' && heroWallpaper.value?.primaryUrl) {
    heroImageMode.value = 'primary'
    return
  }
  if (heroImageMode.value !== 'fallback') {
    heroImageMode.value = 'fallback'
    return
  }
}

const openTerms = () => {
  showTerms.value = true
}

const closeTerms = () => {
  showTerms.value = false
}

const LOGIN_BODY_CLASS = 'login-page-locked'

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return
  document.body.classList.add(LOGIN_BODY_CLASS)
}

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return
  document.body.classList.remove(LOGIN_BODY_CLASS)
}

async function loadHeroImage() {
  try {
    const data = await $fetch<WallpaperResponse>('/api/bing-wallpaper', {
      query: { _: Date.now().toString() }
    })
    heroWallpaper.value = data
    heroImageMode.value = data.proxyUrl
      ? 'proxy'
      : data.primaryUrl
        ? 'primary'
        : 'fallback'
  } catch (error) {
    console.error('Failed to load Bing wallpaper', error)
    heroImageMode.value = 'fallback'
  }
}

onMounted(async () => {
  lockBodyScroll()
  await loadHeroImage()
  const img = heroImageRef.value
  if (img && img.complete && img.naturalWidth > 0) {
    onHeroImageLoad()
  }
})

onUnmounted(() => {
  unlockBodyScroll()
})

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refresh()
  authState.value = {
    checked: true,
    authenticated: false
  }
}

useHead({
  title: '登录 | AstrBot 插件市场 [社区]'
})
</script>

<style scoped>
/* ========================================
   Global Styles
   ======================================== */
:global(body.login-page-locked) {
  font-family: var(--login-font-family);
  overflow: hidden;
}

/* ========================================
   Layout - Main Container
   ======================================== */
.mui-login {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 12px;
  overflow: hidden;
  background: radial-gradient(circle at top, rgba(25, 118, 210, 0.25), transparent 55%),
    radial-gradient(circle at bottom, rgba(25, 118, 210, 0.18), transparent 60%),
    var(--login-color-bg-dark);
}

.mui-login__container {
  position: relative;
  display: flex;
  width: min(1040px, 100%);
  height: clamp(460px, 55vh, 520px);
  overflow: hidden;
  border-radius: var(--login-radius-lg);
  background: var(--login-color-bg-container);
  border: 1px solid var(--login-color-border-subtle);
  box-shadow: var(--login-shadow-elevated);
  backdrop-filter: var(--login-blur-glass);
}

.mui-login__progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(90, 155, 212, 0.15);
  z-index: 10;
  overflow: hidden;
}

.mui-login__progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: var(--login-color-primary);
  transform-origin: 0% 50%;
  animation: login-progress-indeterminate 0.8s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes login-progress-indeterminate {
  0% {
    transform: translateX(-100%) scaleX(0.2);
  }
  50% {
    transform: translateX(0%) scaleX(0.5);
  }
  100% {
    transform: translateX(100%) scaleX(0.2);
  }
}

.mui-login__container.is-loading .mui-login__visual,
.mui-login__container.is-loading .mui-login__panel {
  opacity: 0.4;
  pointer-events: none;
  filter: grayscale(0.4);
  transition: opacity 0.3s ease, filter 0.3s ease;
}

/* ========================================
   Visual Section - Image Display
   ======================================== */
.mui-login__visual {
  position: relative;
  flex: 1.1;
  margin: 0;
  overflow: hidden;
  background: var(--login-color-bg-darker);
}

.mui-login__visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 22, 50, 0.9), rgba(3, 9, 20, 0.7));
  transition: opacity 0.8s ease;
  opacity: 1;
  z-index: 0;
}

.mui-login__visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.1) contrast(1.05);
  opacity: 0;
  transform: scale(1.035) translateY(6px);
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1.1s cubic-bezier(0.2, 0.8, 0.4, 1),
    filter 1.1s ease;
  will-change: opacity, transform, filter;
}

.mui-login__visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(2, 6, 23, 0.4), rgba(15, 23, 42, 0.35));
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.8s ease;
}

.mui-login__visual.is-loaded::before {
  opacity: 0;
}

.mui-login__visual.is-loaded::after {
  opacity: 1;
}

.mui-login__visual.is-loaded img {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.mui-login__visual.is-fallback::before {
  opacity: 1;
  background: linear-gradient(145deg, rgba(14, 30, 64, 0.9), rgba(8, 17, 40, 0.85));
}

.mui-login__visual figcaption {
  position: absolute;
  bottom: 16px;
  left: 20px;
  z-index: 1;
  padding: 6px 12px;
  border-radius: var(--login-radius-full);
  background: var(--login-color-bg-overlay);
  backdrop-filter: var(--login-blur-subtle);
  color: var(--login-color-text-tertiary);
  font-size: 12px;
}

/* ========================================
   Panel Section - Login Form
   ======================================== */
.mui-login__panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  flex: 0 0 clamp(320px, 38vw, 420px);
  max-width: 30%;
  padding: 32px 36px;
  background: var(--login-color-bg-panel);
  backdrop-filter: var(--login-blur-strong);
  border-left: 1px solid var(--login-color-border-light);
  color: var(--login-color-text-primary);
  text-align: left;
  opacity: 0;
  transform: translate3d(0, 24px, 0) scale(0.985);
  filter: blur(14px);
  animation: login-panel-reveal 0.9s cubic-bezier(0.17, 0.84, 0.44, 1) 0.08s forwards,
    login-panel-glow 2.4s cubic-bezier(0.4, 0, 0.2, 1) 0.08s forwards;
  will-change: transform, opacity, filter;
}

.mui-login__copy {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mui-login__actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
}

/* ========================================
   Header - Logo & Title
   ======================================== */
.mui-login__hero {
  margin-bottom: 6px;
}

.login-header-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.header-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
}

.animated-title {
  display: inline-flex;
  align-items: center;
  gap: 0;
  font-family: var(--login-font-family);
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--login-color-text-primary);
}

.title-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(10px);
  animation: title-char-reveal 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

@keyframes title-char-reveal {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes login-panel-reveal {
  0% {
    opacity: 0;
    transform: translate3d(0, 28px, 0) scale(0.975);
    filter: blur(20px);
  }
  60% {
    opacity: 1;
    transform: translate3d(0, -6px, 0) scale(1.005);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }
}

@keyframes login-panel-glow {
  0% {
    box-shadow: 0 18px 40px rgba(13, 42, 96, 0);
  }
  70% {
    box-shadow: 0 24px 45px rgba(13, 42, 96, 0.25);
  }
  100% {
    box-shadow: var(--login-shadow-elevated);
  }
}

.third-party-badge {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 5px;
  background: var(--login-badge-bg);
  color: #fff;
  font-size: 0.5rem;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.third-party-badge--login {
  padding: 2px 7px;
  font-size: 0.7rem;
}

/* ========================================
   Typography - Text Content
   ======================================== */
.mui-login__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 2px;
  font-family: var(--login-font-family);
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.title-icon {
  color: var(--login-color-primary);
  flex-shrink: 0;
}

.mui-login__description,
.mui-login__hint {
  color: var(--login-color-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
}

.author-link {
  color: var(--login-color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--login-transition-base);
}

.author-link:hover {
  color: var(--login-color-primary-light);
  text-decoration: underline;
}

.mui-login__hint {
  margin-top: 8px;
}

.mui-login__error {
  width: auto;
  margin: 12px 0 0;
  padding: 8px 10px;
  border: 1px solid var(--login-color-error-border);
  border-radius: var(--login-radius-sm);
  background: var(--login-color-error-bg);
  color: var(--login-color-error-text);
  text-align: left;
  font-size: 13px;
  line-height: 1.4;
}

/* ========================================
   Buttons - Interactive Elements
   ======================================== */
.mui-button {
  position: relative;
  width: 100%;
  margin-top: 0;
  padding: 10px 20px;
  overflow: hidden;
  border: none;
  border-radius: var(--login-radius-full);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow var(--login-transition-base),
    transform var(--login-transition-base),
    background var(--login-transition-base);
}

.mui-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.mui-button__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mui-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--login-transition-base);
}

.mui-button__spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: inherit;
}

.mui-button--filled .mui-button__icon {
  color: #030711;
}

.mui-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 60%);
  opacity: 0;
  transition: opacity var(--login-transition-base);
}

.mui-button:not(:disabled):hover::after {
  opacity: 1;
}

.mui-button--filled {
  background: linear-gradient(135deg, var(--login-color-primary-light), var(--login-color-primary));
  box-shadow: var(--login-shadow-button);
  color: #06111f;
}

.mui-button--filled:not(:disabled):hover {
  transform: translateY(-0.5px);
  box-shadow: var(--login-shadow-button-hover);
}

.mui-button--text {
  border: 1px solid rgba(144, 202, 249, 0.3);
  background: transparent;
  box-shadow: none;
  color: rgba(144, 202, 249, 0.9);
}

.mui-button--text:not(:disabled):hover {
  background: rgba(144, 202, 249, 0.08);
}

/* ========================================
   Terms Modal & Trigger
   ======================================== */
.terms-link {
  display: inline;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--login-color-primary);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
  transition: color var(--login-transition-base);
}

.terms-link:hover,
.terms-link:focus-visible {
  color: var(--login-color-primary-light);
  outline: none;
}

/* Modal Overlay & Container */
.terms-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
}

.terms-modal {
  position: relative;
  width: min(640px, 92vw);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #0a0e1a;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.65);
  overflow: hidden;
}

.terms-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.terms-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  font-family: var(--login-font-family);
  color: rgba(255, 255, 255, 0.96);
}

.terms-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  color: rgba(255, 255, 255, 0.92);
  overflow-y: auto;
  flex: 1;
}

.terms-intro {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.terms-section h3 {
  margin: 0 0 6px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.96);
}

.terms-section ul {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
}

.terms-footer {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 16px;
  margin-top: auto;
}

.terms-footer small {
  margin-right: auto;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.terms-confirm {
  min-width: 170px;
  padding: 10px 22px;
  border-radius: var(--login-radius-full);
  font-weight: 600;
  background: linear-gradient(135deg, var(--login-color-primary-light), var(--login-color-primary));
  color: #030711;
  border: none;
  box-shadow: var(--login-shadow-button);
  cursor: pointer;
  transition: transform var(--login-transition-base), box-shadow var(--login-transition-base);
}

.terms-confirm:hover {
  transform: translateY(-1px);
  box-shadow: var(--login-shadow-button-hover);
}

.terms-confirm:active {
  transform: translateY(0);
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .terms-modal,
.modal-fade-leave-active .terms-modal {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .terms-modal,
.modal-fade-leave-to .terms-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ========================================
   Responsive Design - Mobile & Tablet
   ======================================== */
@media (max-height: 600px) {
  .mui-login {
    padding: 0;
  }

  .mui-login__container {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    border-radius: 0;
    border: none;
  }

  .mui-login__panel {
    padding: 24px 32px;
    animation-duration: 0.75s, 1.9s;
  }

  .mui-login__copy {
    gap: 8px;
  }

  .mui-login__title {
    font-size: 20px;
    margin: 2px 0;
  }

  .mui-login__description,
  .mui-login__hint {
    font-size: 12px;
    line-height: 1.4;
  }

  .mui-login__hint {
    margin-top: 6px;
  }

  .mui-login__error {
    margin: 10px 0 0;
    padding: 6px 8px;
    font-size: 12px;
  }

  .mui-login__actions {
    padding-top: 12px;
    gap: 10px;
  }

  .mui-button {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 640px) {
  .mui-login {
    padding: 0;
  }

  .mui-login__container {
    flex-direction: column;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    min-height: unset;
    border-radius: 0;
    border: none;
  }

  .mui-login__visual {
    flex: 0 0 35vh;
    height: 35vh;
  }

  .mui-login__visual figcaption {
    bottom: 12px;
    left: 16px;
    font-size: 11px;
  }

  .mui-login__panel {
    flex: 1;
    max-width: none;
    padding: 28px 24px 32px;
    border-left: 0;
    border-radius: 0;
    overflow-y: auto;
    animation-duration: 0.8s, 2s;
  }

  .mui-login__copy {
    gap: 10px;
  }

  .login-header-title {
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }

  .header-logo {
    width: 24px;
    height: 24px;
  }

  .title-wrapper {
    flex-direction: row;
    height: 24px;
    gap: 8px;
  }

  .animated-title {
    font-size: 0.9rem;
  }

  .third-party-badge--login {
    font-size: 0.65rem;
    padding: 2px 6px;
  }

  .mui-login__hero {
    margin-bottom: 6px;
  }

  .mui-login__title {
    font-size: 22px;
    margin: 4px 0 2px;
  }

  .mui-login__description,
  .mui-login__hint {
    font-size: 13px;
    line-height: 1.5;
  }

  .mui-login__hint {
    margin-top: 8px;
  }

  .mui-login__error {
    font-size: 13px;
    padding: 10px 12px;
    margin: 12px 0 0;
  }

  .mui-login__actions {
    margin-top: 24px;
    gap: 12px;
  }

  .mui-button {
    padding: 12px 20px;
    font-size: 15px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mui-login__panel {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }

  .mui-login__visual::before,
  .mui-login__visual::after,
  .mui-login__visual img {
    transition: none;
  }

  .mui-login__visual img {
    opacity: 1;
    transform: none;
    filter: saturate(1.1) contrast(1.05);
  }
}
</style>
