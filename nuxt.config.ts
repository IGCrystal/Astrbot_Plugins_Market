import { defineNuxtConfig } from 'nuxt/config'

const runtimeEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process?.env ?? {}

const nitroPreset = runtimeEnv.NITRO_PRESET ?? (runtimeEnv.VERCEL ? 'vercel' : 'node-server')

export default defineNuxtConfig({
  srcDir: 'src',
  serverDir: 'src/server',
  modules: ['@pinia/nuxt', 'nuxtjs-naive-ui'],
  css: ['@/assets/theme.css'],
  runtimeConfig: {
    public: {
      siteUrl: runtimeEnv.NUXT_PUBLIC_SITE_URL ?? ''
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
    }
  },
  nitro: {
    preset: nitroPreset,
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  }
})