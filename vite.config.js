import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import sitemap from 'vite-plugin-sitemap'
import externalSitemaps from './sitemaps.config.js'

export default defineConfig({
  plugins: [
    vue(),
    sitemap({
      hostname: process.env.VITE_SITE_URL || 'https://plugins.astrbot.app',
      dynamicRoutes: ['/submit'],
      externalSitemaps,
      generateRobotsTxt: true,
      readable: true,
      priority: 1.0,
      lastmod: new Date(), 
    })
  ],
  base: './',
  assetsInclude: ['**/*.md'],
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
