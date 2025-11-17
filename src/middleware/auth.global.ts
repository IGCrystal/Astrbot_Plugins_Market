export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    return
  }

  if (to.path === '/login') {
    return
  }

  const authState = useState('auth-state', () => ({
    checked: false,
    authenticated: false
  }))

  if (!authState.value.checked) {
    const response = await $fetch<{ authenticated: boolean }>('/api/auth/user', {
      credentials: 'include'
    }).catch(() => ({ authenticated: false }))

    authState.value = {
      checked: true,
      authenticated: response.authenticated
    }

    if (!response.authenticated) {
      return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
    }

    return
  }

  if (!authState.value.authenticated) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
