import { defineEventHandler, setHeader } from 'h3'
import externalSitemaps from '../../../sitemaps.config.js'

const ensureArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === 'string') as string[]
  }
  return []
}

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const sitemapLines = [
    'Sitemap: /sitemap.xml',
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
