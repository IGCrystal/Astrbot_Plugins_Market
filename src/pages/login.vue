<template>
  <div class="login-page">
    <div class="login-card">
      <h1>访问受限</h1>
      <p>此站点仅向特定 GitHub 账户开放，请先完成认证。</p>

      <p v-if="errorMessage" class="login-card__error">
        {{ errorMessage }}
      </p>

      <button class="login-card__button" :disabled="isRedirecting" @click="startLogin">
        {{ isRedirecting ? '跳转中…' : '使用 GitHub 登录' }}
      </button>

      <p class="login-card__hint">
        如果你已获授权，请点击上方按钮并在 GitHub 完成授权流程。
      </p>

      <button
        v-if="userData?.authenticated"
        class="login-card__secondary"
        type="button"
        @click="handleLogout"
      >
        退出当前账户
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const nextPath = computed(() => {
  const candidate = route.query.next
  return typeof candidate === 'string' && candidate.startsWith('/') ? candidate : '/'
})

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
  title: '登录 | AstrBot Plugins'
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--app-background, #0f172a);
}

.login-card {
  width: min(420px, 100%);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  color: #fff;
  text-align: center;
  backdrop-filter: blur(16px);
}

.login-card h1 {
  font-size: 24px;
  margin-bottom: 12px;
}

.login-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.login-card__error {
  color: #f87171;
  margin-top: 12px;
  margin-bottom: 12px;
}

.login-card__button {
  width: 100%;
  margin-top: 16px;
  background: #22d3ee;
  color: #0f172a;
  border: none;
  font-weight: 600;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.login-card__button:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.login-card__hint {
  font-size: 14px;
  margin-top: 16px;
}

.login-card__secondary {
  margin-top: 24px;
  width: 100%;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
}
</style>
