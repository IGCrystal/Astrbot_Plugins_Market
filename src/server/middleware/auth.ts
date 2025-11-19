import { createError, defineEventHandler, sendRedirect, getRequestURL } from 'h3'
import { readAuthSession } from '../utils/auth'

const PUBLIC_PATHS = new Set(['/login', '/robots.txt', '/sitemap.xml'])
const PUBLIC_PREFIXES = [
  '/_nuxt/',
  '/__nuxt_error',
  '/public/',
  '/favicon',
  '/api/auth/',
  '/api/analytics/',
  '/api/bing-wallpaper',
  '/_ipx/',
  '/.well-known/'
]

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true
  }
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)
  const path = normalizePath(requestUrl.pathname)
  const nextTarget = requestUrl.pathname + requestUrl.search

  if (isPublicPath(path)) {
    return
  }

  const session = readAuthSession(event)

  if (!session) {
    if (path.startsWith('/api/')) {
      throw createError({ statusCode: 401, message: 'Authentication required.' })
    }

    const search = new URLSearchParams({ next: nextTarget || '/' }).toString()
    return sendRedirect(event, `/login?${search}`, 302)
  }

  event.context.authUser = session
})
