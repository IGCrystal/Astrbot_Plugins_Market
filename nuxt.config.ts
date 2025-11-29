import { defineNuxtConfig } from 'nuxt/config'

const nitroPreset = process.env.NITRO_PRESET ?? (process.env.VERCEL ? 'vercel' : 'node-server')

export default defineNuxtConfig({
  compatibilityDate: '2025-11-15',
  srcDir: 'src',
  serverDir: 'src/server',
  modules: ['@pinia/nuxt', 'nuxtjs-naive-ui'],
  css: ['@/assets/theme.css'],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? '',
      clarityProjectId: process.env.NUXT_PUBLIC_CLARITY_PROJECT_ID ?? ''
    }
  },
  imports: {
    dirs: ['stores']
  },
  build: {
    transpile: ['@giscus/vue', 'naive-ui', 'vueuc', '@css-render/vue3-ssr']
  },
  vite: {
    ssr: {
      noExternal: ['naive-ui', 'vueuc']
    },
    build: {
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks: {
            'naive-ui': ['naive-ui', 'vueuc', '@css-render/vue3-ssr'],
            giscus: ['@giscus/vue'],
            highlight: ['highlight.js']
          }
        }
      }
    }
  },
  nitro: {
    preset: nitroPreset,
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  }
})