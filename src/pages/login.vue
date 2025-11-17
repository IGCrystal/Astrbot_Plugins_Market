<template>
  <main class="mui-login">
    <div class="mui-login__container">
      <figure class="mui-login__visual" aria-hidden="true">
        <img
          src="https://api.wenturc.com/"
          alt="AstrBot related visual from Wenturc API"
          decoding="async"
          loading="eager"
        >
        <figcaption>图像来源 api.wenturc.com</figcaption>
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
              <lock-closed-outline />
            </n-icon>
            访问受限
          </h1>
          <p class="mui-login__description">
            本站点仅为 <a href="https://github.com/IGCrystal" target="_blank" rel="noopener noreferrer" class="author-link">IGCrystal</a> 开发的第三方插件市场，与 AstrBot 官方无关，但是你可以前往<a href="https://plugins.astrbot.app" target="_blank" rel="noopener noreferrer" class="author-link">官方网站</a>。本网站的开发仅个人练手的目的，现已暂停公开展示。此站点仅向特定 GitHub 账户开放。请完成 GitHub 认证以继续访问。
          </p>
          <p class="mui-login__hint">
            本站点使用 GitHub OAuth 进行身份验证。但不会存储或访问你的 GitHub 凭据。
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
            <span class="mui-button__label">{{ isRedirecting ? '跳转中…' : '使用 GitHub 登录' }}</span>
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
  </main>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { LockClosedOutline } from '@vicons/ionicons5'
import logoUrl from '@/assets/logo.webp'

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

const { data: userData, refresh } = await useFetch<AuthUserResponse>('/api/auth/user', {
  credentials: 'include'
})
const authState = useState('auth-state', () => ({
  checked: false,
  authenticated: false
}))

watchEffect(() => {
  if (userData.value) {
    authState.value = {
      checked: true,
      authenticated: userData.value.authenticated
    }
  }
})

const isRedirecting = ref(false)

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
:global(body) {
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

.mui-login__visual img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.1) contrast(1.05);
}

.mui-login__visual::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(2, 6, 23, 0.4), rgba(15, 23, 42, 0.35));
  pointer-events: none;
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
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
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
</style>
