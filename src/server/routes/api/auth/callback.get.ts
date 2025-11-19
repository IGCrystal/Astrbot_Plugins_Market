import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import {
  clearAuthSession,
  consumeStateCookies,
  getAuthConfig,
  persistAuthSession
} from '../../../utils/auth'

interface GitHubUserResponse {
  login: string
  name?: string | null
  avatar_url?: string | null
}

export default defineEventHandler(async (event) => {
  const { githubClientId, githubClientSecret, githubCallbackUrl, allowedUsers, deniedUsers, accessMode } =
    getAuthConfig()
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : null
  const state = typeof query.state === 'string' ? query.state : null

  if (!code || !state) {
    return sendRedirect(event, '/login?error=state', 302)
  }

  const { state: storedState, returnTo } = consumeStateCookies(event)
  if (!storedState || storedState !== state) {
    return sendRedirect(event, '/login?error=state', 302)
  }

  try {
    const tokenResponse = await $fetch<{ access_token: string }>('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: {
        client_id: githubClientId,
        client_secret: githubClientSecret,
        redirect_uri: githubCallbackUrl,
        code
      }
    })

    const user = await $fetch<GitHubUserResponse>('https://api.github.com/user', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenResponse.access_token}`
      }
    })

    const normalizedLogin = user.login?.toLowerCase()
    const isUnauthorized =
      !normalizedLogin ||
      (accessMode === 'allowlist' && !allowedUsers.includes(normalizedLogin)) ||
      (accessMode === 'denylist' && deniedUsers.includes(normalizedLogin))

    if (isUnauthorized) {
      clearAuthSession(event)
      return sendRedirect(event, '/login?error=unauthorized', 302)
    }

    persistAuthSession(event, {
      login: user.login,
      name: user.name ?? null,
      avatarUrl: user.avatar_url ?? null
    })

    return sendRedirect(event, returnTo, 302)
  } catch (error) {
    console.error('GitHub OAuth callback error', error)
    return sendRedirect(event, '/login?error=oauth', 302)
  }
})
