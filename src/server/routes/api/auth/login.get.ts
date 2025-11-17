import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { getAuthConfig, generateStateToken, persistStateCookies } from '../../../utils/auth'

export default defineEventHandler((event) => {
  const { githubClientId, githubCallbackUrl } = getAuthConfig()
  const query = getQuery(event)
  const nextParam = typeof query.next === 'string' && query.next.startsWith('/') ? query.next : '/'

  const state = generateStateToken()
  persistStateCookies(event, state, nextParam)

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', githubClientId)
  authorizeUrl.searchParams.set('redirect_uri', githubCallbackUrl)
  authorizeUrl.searchParams.set('scope', 'read:user')
  authorizeUrl.searchParams.set('state', state)

  return sendRedirect(event, authorizeUrl.toString(), 302)
})
