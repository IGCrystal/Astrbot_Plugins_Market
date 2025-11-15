import { defineEventHandler, getRequestURL, setHeader, type H3Event } from 'h3'
import externalSitemaps from '@/server/utils/externalSitemaps'

const ensureArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string') as string[]
  }
  return []
}

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
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const siteUrl = resolveSiteUrl(event)

  const sitemapLines = [
    `Sitemap: ${siteUrl}/sitemap.xml`,
    ...ensureArray(externalSitemaps).map((url) => `Sitemap: ${url}`)
  ]

  const robotsContent = [
    'User-agent: *',
    'Allow: /',
    '',
    ...sitemapLines
  ].join('\n')

  return robotsContent
})
