import { defineEventHandler, getRequestURL, setHeader } from 'h3'

export default defineEventHandler((event) => {
  const { origin } = getRequestURL(event)
  const sitemapLocation = `${origin}/pages-sitemap.xml`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${sitemapLocation}</loc>\n  </sitemap>\n</sitemapindex>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
