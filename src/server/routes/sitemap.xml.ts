import { defineEventHandler, getRequestURL, setHeader, type H3Event } from 'h3'
import { fetchPluginsWithCache } from '@/server/utils/pluginsCache'

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/submit', changefreq: 'weekly', priority: '0.8' }
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

const buildUrlNode = (origin: string, path: string, changefreq: string, priority: string, lastmod: string) => (
  `  <url>\n    <loc>${origin}${path}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
)

export default defineEventHandler(async (event) => {
  const origin = resolveSiteUrl(event)
  const generatedAt = new Date().toISOString()

  const staticEntries = staticRoutes
    .map(({ path, changefreq, priority }) => buildUrlNode(origin, path, changefreq, priority, generatedAt))

  let pluginEntries: string[] = []

  try {
    const plugins = await fetchPluginsWithCache()
    pluginEntries = plugins.map((plugin) => {
      const path = `/plugins/${plugin.id}`
      const lastmod = plugin.updated_at ? new Date(plugin.updated_at).toISOString() : generatedAt
      return buildUrlNode(origin, path, 'weekly', '0.7', lastmod)
    })
  } catch (error) {
    console.error('生成动态站点地图失败:', error)
  }

  const urls = [...staticEntries, ...pluginEntries].join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
