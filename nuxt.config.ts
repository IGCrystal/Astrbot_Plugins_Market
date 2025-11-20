import { defineNuxtConfig } from 'nuxt/config'
import { config as loadEnv } from 'dotenv'

loadEnv()
loadEnv({ path: '.env.local', override: true })

const runtimeEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process?.env ?? {}

const nitroPreset = runtimeEnv.NITRO_PRESET ?? (runtimeEnv.VERCEL ? 'vercel' : 'node-server')

export default defineNuxtConfig({
  compatibilityDate: '2025-11-15',
  srcDir: 'src',
  serverDir: 'src/server',
  modules: ['@pinia/nuxt', 'nuxtjs-naive-ui'],
  app: {
    head: {
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'googlebot', content: 'noindex, nofollow' }
      ]
    }
  },
  css: ['@/assets/theme.css'],
  runtimeConfig: {
    auth: ({
      githubClientId: runtimeEnv.GITHUB_CLIENT_ID ?? '',
      githubClientSecret: runtimeEnv.GITHUB_CLIENT_SECRET ?? '',
      githubCallbackUrl: runtimeEnv.GITHUB_CALLBACK_URL ?? '',
      allowedUsers: runtimeEnv.GITHUB_ALLOWED_USERS ?? '',
      deniedUsers: runtimeEnv.GITHUB_DENIED_USERS ?? '',
      cookieSecret: runtimeEnv.AUTH_COOKIE_SECRET ?? '',
      sessionMaxAge: Number(runtimeEnv.AUTH_SESSION_MAX_AGE ?? 60 * 60 * 24 * 7)
    }) as {
      githubClientId: string
      githubClientSecret: string
      githubCallbackUrl: string
      allowedUsers: string
      deniedUsers: string
      cookieSecret: string
      sessionMaxAge: number
    },
    analytics: {
      mongoUri: runtimeEnv.MONGODB_URI ?? '',
      dbName: runtimeEnv.MONGODB_DB ?? 'astrbot_plugins'
    },
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
  },
  routeRules: {
    '/**': {
      headers: {
        'x-robots-tag': 'noindex, nofollow, nosnippet, noarchive'
      }
    }
  }
})