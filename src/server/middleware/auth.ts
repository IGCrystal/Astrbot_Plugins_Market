import { createError, defineEventHandler, sendRedirect } from 'h3'
import { readAuthSession } from '../utils/auth'

const PUBLIC_PATHS = new Set(['/login', '/robots.txt', '/sitemap.xml'])
const PUBLIC_PREFIXES = ['/_nuxt/', '/__nuxt_error', '/public/', '/favicon', '/api/auth/', '/_ipx/', '/.well-known/']

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true
  }
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default defineEventHandler((event) => {
  const path = event.path ?? '/'

  if (isPublicPath(path)) {
    return
  }

  const session = readAuthSession(event)

  if (!session) {
    if (path.startsWith('/api/')) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required.' })
    }

    const search = new URLSearchParams({ next: path }).toString()
    return sendRedirect(event, `/login?${search}`, 302)
  }

  event.context.authUser = session
})
