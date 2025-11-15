import { defineEventHandler, getRequestURL, setHeader, type H3Event } from 'h3'

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/submit', changefreq: 'monthly', priority: '0.6' }
]

const resolveSiteUrl = (event: H3Event) => {
  const runtimeEnv = (
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
  )
  const envSiteUrl = runtimeEnv.NUXT_PUBLIC_SITE_URL || runtimeEnv.SITE_URL
  if (envSiteUrl) {
    return envSiteUrl.replace(/\/$/, '')
  }
  return getRequestURL(event).origin
}

export default defineEventHandler((event) => {
  const origin = resolveSiteUrl(event)
  const lastmod = new Date().toISOString()

  const urls = staticRoutes
    .map(({ path, changefreq, priority }) => `  <url>\n    <loc>${origin}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
