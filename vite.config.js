import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import sitemap from 'vite-plugin-sitemap'
import externalSitemaps from './sitemaps.config.js'

function normalizeAndDedupe(routes) {
  const normalized = routes.map(r => {
    if (!r || r === '/') return '/'
    let s = r.startsWith('/') ? r : `/${r}`
    s = s.replace(/\/+/g, '/').replace(/\/$/, '')
    return s === '' ? '/' : s
  })
  return Array.from(new Set(normalized))
}

const hostname = (process.env.VITE_SITE_URL || 'https://plugins.astrbot.app').replace(/\/$/, '')
const routes = normalizeAndDedupe(['/', '/submit'])

export default defineConfig({
  plugins: [
    vue(),
    sitemap({
      hostname,
      dynamicRoutes: routes,
      externalSitemaps,
      generateRobotsTxt: true,
      readable: true,
      changefreq: 'daily',
      priority: 0.6,
      transform: async (route) => {
        const now = new Date().toISOString()
        let priority = 0.6
        let changefreq = 'daily'
        if (route === '/') {
          priority = 1.0
        } else if (route === '/submit') {
          priority = 0.9
        }
        return {
          loc: route,
          lastmod: now,
          changefreq,
          priority
        }
      }
    })
  ],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
