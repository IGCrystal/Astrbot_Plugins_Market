import { setAnalyticsIdentity } from '@/utils/analytics'

type AuthUserResponse = {
  authenticated: boolean
  user: null | {
    login: string
    name?: string | null
    avatarUrl?: string | null
  }
}

export default defineNuxtPlugin(async () => {
  if (import.meta.server) return

  try {
    const { data } = await useFetch<AuthUserResponse>('/api/auth/user', {
      credentials: 'include'
    })

    const login = data.value?.authenticated ? data.value?.user?.login ?? null : null
    setAnalyticsIdentity(login)
  } catch (error) {
    console.warn('Failed to fetch auth user for analytics identity', error)
    setAnalyticsIdentity(null)
  }
})
